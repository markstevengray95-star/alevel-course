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
  page.on('console', msg => { if (msg.type() === 'error' && !/favicon\.ico/i.test(msg.text())) localFailures.push(`console: ${msg.text()}`); });
  page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) localFailures.push(`HTTP ${response.status()}: ${response.url()}`); });
  try {
    const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response || response.status() >= 400) localFailures.push(`navigation status: ${response?.status() ?? 'no response'}`);
    await page.waitForTimeout(900);
    const bodyText = (await page.locator('body').innerText().catch(() => '')).trim();
    if (bodyText.length < 20) localFailures.push('page rendered too little visible content');
    if (!(await page.title()).trim()) localFailures.push('empty document title');
  } catch (error) { localFailures.push(`navigation exception: ${error.message}`); }
  if (localFailures.length) failures.push({ route, errors: [...new Set(localFailures)] });
  console.log(`${localFailures.length ? 'FAIL' : 'PASS'} ${route}`);
  await page.close();
}

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
  if (!(await shell.locator('#courseHome').isVisible())) shellErrors.push('course home is not visible on initial load');
  if (await shell.locator('#workspaceSection').isVisible()) shellErrors.push('workspace should be hidden before a topic is opened');

  for (let i = 0; i < count; i++) {
    await shell.locator('.topic-card').nth(i).click();
    await shell.waitForTimeout(550);
    if (!(await shell.locator('#workspaceSection').isVisible())) shellErrors.push(`topic ${i + 1}: workspace did not open`);
    if (!(await shell.locator('#exitCourse').isVisible())) shellErrors.push(`topic ${i + 1}: Exit course control is not visible`);
    const src = await shell.locator('#topicFrame').getAttribute('src');
    if (!src) shellErrors.push(`topic ${i + 1}: iframe src missing`);

    const frame = shell.frames().find(f => f !== shell.mainFrame() && f.url().includes('/topics/'));
    if (!frame) shellErrors.push(`topic ${i + 1}: embedded frame unavailable`);
    else {
      const embeddedExit = frame.locator('.uc-exit-course');
      if (!(await embeddedExit.isVisible().catch(() => false))) shellErrors.push(`topic ${i + 1}: embedded Exit course button missing`);
      const navSelect = frame.locator('.uc-view-picker select');
      if (!(await navSelect.isVisible().catch(() => false))) shellErrors.push(`topic ${i + 1}: compact embedded section picker missing`);
    }

    await shell.locator('#exitCourse').click();
    await shell.waitForTimeout(180);
    if (!(await shell.locator('#courseHome').isVisible())) shellErrors.push(`topic ${i + 1}: course home did not return after exit`);
    if (await shell.locator('#workspaceSection').isVisible()) shellErrors.push(`topic ${i + 1}: workspace remained visible after exit`);
  }

  await shell.locator('.topic-card').first().click();
  await shell.waitForTimeout(550);
  const embeddedFrame = shell.frames().find(f => f !== shell.mainFrame() && f.url().includes('/topics/'));
  if (embeddedFrame) {
    await embeddedFrame.locator('.uc-exit-course').click();
    await shell.waitForTimeout(180);
    if (!(await shell.locator('#courseHome').isVisible())) shellErrors.push('embedded Exit course button did not return to home');
  }

  await shell.locator('#continueBtn').click();
  await shell.waitForTimeout(350);
  const markButton = shell.locator('#markComplete');
  await markButton.click();
  if (!/Completed/i.test(await markButton.innerText())) shellErrors.push('Mark topic complete did not update state');
} catch (error) { shellErrors.push(`course-shell interaction exception: ${error.message}`); }
if (shellErrors.length) failures.push({ route: 'COURSE SHELL INTERACTIONS', errors: [...new Set(shellErrors)] });
await shell.close();
await browser.close();

console.log(`Browser audit visited ${pages.length} index pages.`);
if (failures.length) {
  console.error(`Browser audit failures: ${failures.length}`);
  for (const item of failures) { console.error(`\n${item.route}`); for (const error of item.errors) console.error(`  - ${error}`); }
  process.exit(1);
}
console.log('Browser audit passed: home/focus mode, topic navigation and both exit paths work.');
