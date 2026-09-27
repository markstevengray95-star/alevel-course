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

function attachDiagnostics(page, route, mode='desktop') {
  const localFailures = new Set(), pageErrors = new Set(), consoleErrors = new Set();
  page.on('pageerror', e => pageErrors.add(errorText(e)));
  page.on('console', msg => { if (msg.type() === 'error' && !/favicon\.ico/i.test(msg.text())) consoleErrors.add(msg.text()); });
  page.on('requestfailed', req => {
    const reason = req.failure()?.errorText || 'failed';
    if (mode === 'shell' && /ERR_ABORTED/i.test(reason)) return;
    if (req.url().startsWith(base)) localFailures.add(`${req.method()} ${req.url()} :: ${reason}`);
    else warnings.add(`${mode} ${route}: external request failed: ${req.url()}`);
  });
  return {localFailures,pageErrors,consoleErrors};
}
function reportDiagnostics(route, mode, d) {
  if (d.localFailures.size) failures.push(`${mode} ${route}: local network failures:\n  ${[...d.localFailures].join('\n  ')}`);
  if (d.pageErrors.size) failures.push(`${mode} ${route}: page errors:\n  ${[...d.pageErrors].join('\n  ')}`);
  if (d.consoleErrors.size) failures.push(`${mode} ${route}: console errors:\n  ${[...d.consoleErrors].join('\n  ')}`);
}

const desktop = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
for (const route of routes) {
  const page = await desktop.newPage();
  const d = attachDiagnostics(page, route, 'desktop');
  try {
    const res = await page.goto(base + route,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForTimeout(1000);
    if (!res || res.status() >= 400) failures.push(`desktop ${route}: HTTP ${res?.status() ?? 'no response'}`);
    const textLen = await page.locator('body').innerText().then(t=>t.trim().length).catch(()=>0);
    if (textLen < 40) failures.push(`desktop ${route}: too little visible content (${textLen} chars)`);
    if (route !== '/') {
      const nav = page.locator('.main-nav .nav-button');
      const count = Math.min(await nav.count(),16);
      for (let i=0;i<count;i++) if (await nav.nth(i).isVisible().catch(()=>false)) {
        await nav.nth(i).click({timeout:5000}).catch(e=>failures.push(`desktop ${route}: nav click failed: ${errorText(e)}`));
        await page.waitForTimeout(180);
      }
    }
    reportDiagnostics(route,'desktop',d);
  } catch(e) { failures.push(`desktop ${route}: navigation failed: ${errorText(e)}`); }
  await page.close();
}

{
  const page = await desktop.newPage();
  await page.route('**/api/physics-coach', async route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({answer:'Use V = IR as a starting relationship. Identify the known electrical quantities, keep units in SI, and rearrange before substituting.',model:'test/physics-coach'})}));
  const d = attachDiagnostics(page,'/','shell');
  await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(500);

  if (!(await page.locator('#courseHome').isVisible())) failures.push('shell: home should be visible initially');
  if (await page.locator('#workspaceSection').isVisible()) failures.push('shell: workspace should be hidden initially');
  const cards = page.locator('.topic-card');
  if (await cards.count() !== 8) failures.push(`shell: expected 8 topic cards, found ${await cards.count()}`);

  await cards.nth(4).click();
  await page.waitForTimeout(700);
  if (!(await page.locator('#workspaceSection').isVisible())) failures.push('shell: opening Electricity did not enter focused topic mode');
  if (!(await page.locator('#exitCourse').isVisible())) failures.push('shell: Exit course is not visible in focused mode');
  if (!(await page.locator('#workspaceCode').innerText()).includes('3.5')) failures.push('shell: Electricity did not become active');

  let frame = page.frames().find(f=>f!==page.mainFrame()&&f.url().includes('/topics/05-electricity'));
  if (!frame) failures.push('shell: Electricity embedded frame did not load');
  else {
    if (!(await frame.locator('.uc-embedded-toolbar').isVisible().catch(()=>false))) failures.push('shell: compact embedded toolbar missing');
    if (!(await frame.locator('.uc-exit-course').isVisible().catch(()=>false))) failures.push('shell: embedded Exit course button missing');
    if (!(await frame.locator('.uc-view-picker select').isVisible().catch(()=>false))) failures.push('shell: embedded section picker missing');
    const internalNavVisible = await frame.locator('.main-nav').isVisible().catch(()=>false);
    if (internalNavVisible) failures.push('shell: old internal tab bar is still visible in embedded mode');
  }

  await page.locator('#nextCourse').click();
  await page.waitForTimeout(500);
  if (!(await page.locator('#workspaceCode').innerText()).includes('3.6')) failures.push('shell: next topic control failed');
  await page.keyboard.press('Alt+ArrowLeft');
  await page.waitForTimeout(350);
  if (!(await page.locator('#workspaceCode').innerText()).includes('3.5')) failures.push('shell: keyboard topic navigation failed');

  await page.locator('#coachToggle').click();
  if (!(await page.locator('#coachPanel').evaluate(el=>el.classList.contains('open')))) failures.push('AI coach: drawer did not open');
  await page.locator('#coachInput').fill('Give me a hint for the current topic.');
  await page.locator('#coachSend').click();
  await page.waitForFunction(()=>/Use V = IR as a starting relationship/i.test(document.querySelector('#coachMessages')?.innerText||''),null,{timeout:8000}).catch(e=>failures.push(`AI coach: response missing: ${errorText(e)}`));
  await page.locator('#coachClose').click();

  const before = await page.locator('#progressText').innerText();
  await page.locator('#markComplete').click();
  if (before === await page.locator('#progressText').innerText()) failures.push('shell: mark complete did not update progress');

  frame = page.frames().find(f=>f!==page.mainFrame()&&f.url().includes('/topics/'));
  if (frame) {
    await frame.locator('.uc-exit-course').click();
    await page.waitForTimeout(200);
    if (!(await page.locator('#courseHome').isVisible())) failures.push('shell: embedded Exit course did not return home');
  }

  await page.locator('.topic-card').first().click();
  await page.waitForTimeout(450);
  await page.locator('#exitCourse').click();
  await page.waitForTimeout(150);
  if (!(await page.locator('#courseHome').isVisible())) failures.push('shell: outer Exit course did not return home');
  if (await page.locator('#workspaceSection').isVisible()) failures.push('shell: workspace remained visible after exit');
  reportDiagnostics('/','shell',d);
  await page.close();
}
await desktop.close();

const mobile = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
for (const route of routes) {
  const page = await mobile.newPage();
  const d = attachDiagnostics(page,route,'mobile');
  try {
    const res = await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForTimeout(700);
    if (!res || res.status() >= 400) failures.push(`mobile ${route}: HTTP ${res?.status() ?? 'no response'}`);
    const dims = await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
    if (dims.scrollWidth > dims.clientWidth + 24) failures.push(`mobile ${route}: horizontal overflow ${dims.scrollWidth}px > ${dims.clientWidth}px`);
    reportDiagnostics(route,'mobile',d);
  } catch(e) { failures.push(`mobile ${route}: navigation failed: ${errorText(e)}`); }
  await page.close();
}
await mobile.close();
await browser.close();

if (warnings.size) { console.log(`\nWarnings (${warnings.size}):`); for (const w of [...warnings].slice(0,30)) console.log(' -',w); }
if (failures.length) { console.error(`\nBROWSER AUDIT FAILED (${failures.length}):`); failures.forEach(f=>console.error(' -',f)); process.exit(1); }
console.log('\nPASS: focused home/topic flow, both exit controls, AI coach, topic switching and mobile runtime checks passed.');
