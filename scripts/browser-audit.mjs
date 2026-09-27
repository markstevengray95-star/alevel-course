import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.argv[2] || 'dist');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const failures = [];
const pages = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

for (const file of walk(root)) {
  if (path.basename(file).toLowerCase() === 'index.html') {
    const rel = path.relative(root, file).replaceAll(path.sep, '/');
    pages.push('/' + rel.replace(/index\.html$/i, ''));
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });

for (const route of pages) {
  const page = await context.newPage();
  const localFailures = [];
  page.on('pageerror', error => localFailures.push(`pageerror: ${error.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!/favicon\.ico/i.test(text)) localFailures.push(`console: ${text}`);
    }
  });
  page.on('response', response => {
    const url = response.url();
    if (url.startsWith(base) && response.status() >= 400) localFailures.push(`HTTP ${response.status()}: ${url}`);
  });

  try {
    const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response || response.status() >= 400) localFailures.push(`navigation status: ${response?.status() ?? 'no response'}`);
    await page.waitForTimeout(1200);
    const bodyText = (await page.locator('body').innerText().catch(() => '')).trim();
    if (bodyText.length < 20) localFailures.push('page rendered too little visible content');
    const title = await page.title();
    if (!title.trim()) localFailures.push('empty document title');
  } catch (error) {
    localFailures.push(`navigation exception: ${error.message}`);
  }

  if (localFailures.length) failures.push({ route, errors: [...new Set(localFailures)] });
  console.log(`${localFailures.length ? 'FAIL' : 'PASS'} ${route}`);
  await page.close();
}

// Course-shell interaction audit.
const shell = await context.newPage();
const shellErrors = [];
shell.on('pageerror', error => shellErrors.push(`pageerror: ${error.message}`));
shell.on('console', msg => { if (msg.type() === 'error') shellErrors.push(`console: ${msg.text()}`); });
try {
  await shell.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shell.waitForTimeout(500);
  const cards = shell.locator('.topic-card');
  const count = await cards.count();
  if (count !== 8) shellErrors.push(`expected 8 topic cards, found ${count}`);
  for (let i = 0; i < count; i++) {
    await cards.nth(i).click();
    await shell.waitForTimeout(500);
    const src = await shell.locator('#topicFrame').getAttribute('src');
    if (!src) shellErrors.push(`topic card ${i + 1} did not set iframe src`);
  }
  const continueButton = shell.locator('#continueBtn');
  if (await continueButton.count()) await continueButton.click();
  const markButton = shell.locator('#markComplete');
  if (await markButton.count()) {
    await markButton.click();
    await shell.waitForTimeout(100);
    const text = await markButton.innerText();
    if (!/Completed/i.test(text)) shellErrors.push('Mark topic complete did not update state');
  }
} catch (error) {
  shellErrors.push(`course-shell interaction exception: ${error.message}`);
}
if (shellErrors.length) failures.push({ route: 'COURSE SHELL INTERACTIONS', errors: [...new Set(shellErrors)] });
await shell.close();
await browser.close();

console.log(`Browser audit visited ${pages.length} index pages.`);
if (failures.length) {
  console.error(`Browser audit failures: ${failures.length}`);
  for (const item of failures) {
    console.error(`\n${item.route}`);
    for (const error of item.errors) console.error(`  - ${error}`);
  }
  process.exit(1);
}
console.log('Browser audit passed with no blocking runtime defects.');
