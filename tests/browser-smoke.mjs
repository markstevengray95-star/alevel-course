import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const routes = [
  '/',
  '/topics/01-measurements/index.html',
  '/topics/02-particles-radiation/index.html',
  '/topics/03-waves/index.html',
  '/topics/04-mechanics-materials/mechanics/index.html',
  '/topics/04-mechanics-materials/materials/index.html',
  '/topics/05-electricity/index.html',
  '/topics/06-further-mechanics-thermal/index.html',
  '/topics/07-fields/index.html',
  '/topics/08-nuclear/index.html',
];

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
const failures = [];
const warnings = [];

for (const route of routes) {
  const page = await context.newPage();
  const localFailures = [];
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', req => {
    const url = req.url();
    if (url.startsWith(base)) localFailures.push(`${req.method()} ${url} :: ${req.failure()?.errorText || 'failed'}`);
    else warnings.push(`${route}: external request failed: ${url}`);
  });
  try {
    const res = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1800);
    if (!res || res.status() >= 400) failures.push(`${route}: HTTP ${res?.status() ?? 'no response'}`);
    const textLen = await page.locator('body').innerText().then(t => t.trim().length).catch(() => 0);
    if (textLen < 40) failures.push(`${route}: page rendered too little visible content (${textLen} chars)`);
    const overlay = await page.locator('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay').count().catch(() => 0);
    if (overlay) failures.push(`${route}: framework error overlay detected`);
    if (localFailures.length) failures.push(`${route}: ${localFailures.length} local network failure(s):\n  ${localFailures.join('\n  ')}`);
    if (pageErrors.length) failures.push(`${route}: page error(s):\n  ${pageErrors.join('\n  ')}`);
    if (consoleErrors.length) {
      // Ignore browser favicon noise only; application console errors are failures.
      const real = consoleErrors.filter(x => !/favicon\.ico/i.test(x));
      if (real.length) failures.push(`${route}: console error(s):\n  ${real.join('\n  ')}`);
    }
    console.log(`Checked ${route} (${textLen} visible chars)`);
  } catch (e) {
    failures.push(`${route}: navigation failed: ${e}`);
  } finally {
    await page.close();
  }
}

// Course-shell interaction and iframe integration check.
{
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1000);
  const cards = page.locator('.topic-card');
  const cardCount = await cards.count();
  if (cardCount !== 8) failures.push(`course shell: expected 8 topic cards, found ${cardCount}`);
  for (let i = 0; i < cardCount; i++) {
    await cards.nth(i).click();
    await page.waitForTimeout(700);
    const src = await page.locator('#topicFrame').getAttribute('src');
    if (!src) failures.push(`course shell topic ${i+1}: iframe src missing after click`);
    const frame = page.frames().find(f => f !== page.mainFrame() && f.url().includes('/topics/'));
    if (!frame) failures.push(`course shell topic ${i+1}: embedded topic frame did not load`);
  }
  const before = await page.locator('#progressText').innerText();
  await page.locator('#markComplete').click();
  const after = await page.locator('#progressText').innerText();
  if (before === after) failures.push('course shell: Mark topic complete did not update overall progress');
  if (pageErrors.length) failures.push(`course shell interaction errors: ${pageErrors.join(' | ')}`);
  await page.close();
}

await browser.close();

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 30)) console.log(' -', w);
}
if (failures.length) {
  console.error(`\nBROWSER AUDIT FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('\nPASS: browser/runtime checks passed for the course shell and every topic module.');
