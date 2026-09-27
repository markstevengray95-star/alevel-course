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
const failures = [];
const warnings = new Set();
const errorText = e => e?.stack || e?.message || String(e);

async function installConsoleStackCapture(page) {
  await page.addInitScript(() => {
    const originalError = console.error.bind(console);
    console.error = (...args) => {
      const marker = new Error('console.error call stack');
      originalError(...args, '\n__AUDIT_STACK__\n' + (marker.stack || 'stack unavailable'));
    };
  });
}

function attachDiagnostics(page, route, mode='desktop') {
  const localFailures = new Set();
  const pageErrors = new Set();
  const consoleErrors = new Set();
  page.on('pageerror', e => pageErrors.add(errorText(e)));
  page.on('console', msg => {
    if (msg.type() === 'error' && !/favicon\.ico/i.test(msg.text())) consoleErrors.add(msg.text());
  });
  page.on('requestfailed', req => {
    const url = req.url();
    const reason = req.failure()?.errorText || 'failed';
    if (mode === 'shell' && /ERR_ABORTED/i.test(reason)) return;
    if (url.startsWith(base)) localFailures.add(`${req.method()} ${url} :: ${reason}`);
    else warnings.add(`${mode} ${route}: external request failed: ${url}`);
  });
  return {localFailures,pageErrors,consoleErrors};
}

function reportDiagnostics(route, mode, d) {
  if (d.localFailures.size) failures.push(`${mode} ${route}: ${d.localFailures.size} local network failure(s):\n  ${[...d.localFailures].join('\n  ')}`);
  if (d.pageErrors.size) failures.push(`${mode} ${route}: page error(s):\n  ${[...d.pageErrors].join('\n  ')}`);
  if (d.consoleErrors.size) failures.push(`${mode} ${route}: console error(s):\n  ${[...d.consoleErrors].join('\n  ')}`);
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
for (const route of routes) {
  const page = await desktop.newPage();
  await installConsoleStackCapture(page);
  const d = attachDiagnostics(page, route, 'desktop');
  try {
    const res = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);
    if (!res || res.status() >= 400) failures.push(`desktop ${route}: HTTP ${res?.status() ?? 'no response'}`);
    const textLen = await page.locator('body').innerText().then(t => t.trim().length).catch(() => 0);
    if (textLen < 40) failures.push(`desktop ${route}: page rendered too little visible content (${textLen} chars)`);
    const overlay = await page.locator('[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay').count().catch(() => 0);
    if (overlay) failures.push(`desktop ${route}: framework error overlay detected`);

    if (route !== '/') {
      const nav = page.locator('.main-nav .nav-button');
      const navCount = Math.min(await nav.count(), 16);
      for (let i = 0; i < navCount; i++) {
        const button = nav.nth(i);
        if (await button.isVisible().catch(() => false)) {
          const label = (await button.innerText().catch(() => '')).trim();
          await button.click({timeout:5000}).catch(e => failures.push(`desktop ${route}: could not open nav view '${label || i+1}': ${errorText(e)}`));
          await page.waitForTimeout(350);
        }
      }
    }

    reportDiagnostics(route, 'desktop', d);
    console.log(`Desktop checked ${route} (${textLen} visible chars)`);
  } catch (e) {
    failures.push(`desktop ${route}: navigation failed: ${errorText(e)}`);
  } finally {
    await page.close();
  }
}

{
  const page = await desktop.newPage();
  await installConsoleStackCapture(page);
  await page.route('**/api/physics-coach', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: 'Use V = IR as a starting relationship. Identify the known electrical quantities, keep units in SI, and rearrange before substituting.',
        model: 'test/physics-coach'
      })
    });
  });

  const d = attachDiagnostics(page, '/', 'shell');
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(900);
  const cards = page.locator('.topic-card');
  const cardCount = await cards.count();
  if (cardCount !== 8) failures.push(`course shell: expected 8 topic cards, found ${cardCount}`);
  for (let i = 0; i < cardCount; i++) {
    await cards.nth(i).click();
    await page.waitForTimeout(550);
    const src = await page.locator('#topicFrame').getAttribute('src');
    if (!src) failures.push(`course shell topic ${i+1}: iframe src missing after click`);
    const frame = page.frames().find(f => f !== page.mainFrame() && f.url().includes('/topics/'));
    if (!frame) failures.push(`course shell topic ${i+1}: embedded topic frame did not load`);
  }

  await page.locator('#quickCourseSelect').selectOption('electricity');
  await page.waitForTimeout(650);
  const switchedCode = await page.locator('#workspaceCode').innerText();
  const switchedSrc = await page.locator('#topicFrame').getAttribute('src');
  if (!switchedCode.includes('3.5')) failures.push(`course switcher: expected Electricity/AQA 3.5, got '${switchedCode}'`);
  if (!switchedSrc?.includes('05-electricity')) failures.push(`course switcher: wrong iframe src after Electricity selection: ${switchedSrc}`);

  await page.locator('#nextCourse').click();
  await page.waitForTimeout(650);
  const nextCode = await page.locator('#workspaceCode').innerText();
  if (!nextCode.includes('3.6')) failures.push(`next course control: expected AQA 3.6, got '${nextCode}'`);

  await page.keyboard.press('Alt+ArrowLeft');
  await page.waitForTimeout(450);
  const keyboardCode = await page.locator('#workspaceCode').innerText();
  if (!keyboardCode.includes('3.5')) failures.push(`keyboard course navigation: expected return to AQA 3.5, got '${keyboardCode}'`);

  await page.locator('#coachToggle').click();
  await page.waitForTimeout(120);
  if (!(await page.locator('#coachPanel').evaluate(el=>el.classList.contains('open')))) failures.push('AI coach: drawer did not open');
  const coachContext = await page.locator('#coachContextLabel').innerText();
  if (!coachContext.includes('3.5') || !/Electricity/i.test(coachContext)) failures.push(`AI coach: context did not follow active course: '${coachContext}'`);
  await page.locator('#coachMode').selectOption('hint');
  await page.locator('#coachInput').fill('Give me a hint for the current topic.');
  await page.locator('#coachSend').click();
  await page.waitForFunction(() => /Use V = IR as a starting relationship/i.test(document.querySelector('#coachMessages')?.innerText || ''), null, {timeout:8000}).catch(e=>failures.push(`AI coach: completed response did not appear: ${errorText(e)}`));
  const coachText = await page.locator('#coachMessages').innerText();
  if (!/Physics Coach/i.test(coachText)) failures.push('AI coach: response area did not contain coach output');
  if (!/Use V = IR as a starting relationship/i.test(coachText)) failures.push('AI coach: mocked live response was not rendered');
  await page.locator('#coachClose').click();

  const before = await page.locator('#progressText').innerText();
  await page.locator('#markComplete').click();
  const after = await page.locator('#progressText').innerText();
  if (before === after) failures.push('course shell: Mark topic complete did not update overall progress');
  reportDiagnostics('/', 'shell', d);
  await page.close();
}
await desktop.close();

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
for (const route of routes) {
  const page = await mobile.newPage();
  await installConsoleStackCapture(page);
  const d = attachDiagnostics(page, route, 'mobile');
  try {
    const res = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(900);
    if (!res || res.status() >= 400) failures.push(`mobile ${route}: HTTP ${res?.status() ?? 'no response'}`);
    const dims = await page.evaluate(() => ({scrollWidth:document.documentElement.scrollWidth, clientWidth:document.documentElement.clientWidth}));
    if (dims.scrollWidth > dims.clientWidth + 24) failures.push(`mobile ${route}: page-level horizontal overflow ${dims.scrollWidth}px > ${dims.clientWidth}px`);
    reportDiagnostics(route, 'mobile', d);
    console.log(`Mobile checked ${route}`);
  } catch (e) {
    failures.push(`mobile ${route}: navigation failed: ${errorText(e)}`);
  } finally {
    await page.close();
  }
}
await mobile.close();
await browser.close();

if (warnings.size) {
  console.log(`\nWarnings (${warnings.size}):`);
  for (const w of [...warnings].slice(0, 50)) console.log(' -', w);
}
if (failures.length) {
  console.error(`\nBROWSER AUDIT FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('\nPASS: desktop navigation, embedded-course integration, course switching, AI coach and mobile runtime checks passed.');
