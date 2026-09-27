import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
const page = await context.newPage();
const failures = [];

await page.goto(base + '/', {waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(500);
const cards = page.locator('.topic-card');
const count = await cards.count();

for (let i=0;i<count;i++) {
  await page.locator('.topic-card').nth(i).click();
  await page.waitForTimeout(750);
  const label = (await page.locator('#workspaceTitle').innerText()).trim();
  const frameHandle = await page.locator('#topicFrame').elementHandle();
  const frame = await frameHandle?.contentFrame();
  if (!frame) { failures.push(`${label}: embedded frame unavailable`); continue; }

  const result = await frame.evaluate(() => {
    const root=document.documentElement;
    const links=[...document.querySelectorAll('link[rel="stylesheet"]')].map(l=>l.getAttribute('href')||'');
    const scripts=[...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src')||'');
    const hero=document.querySelector('.hero');
    const topbar=document.querySelector('.topbar');
    const oldNav=document.querySelector('.main-nav');
    const toolbar=document.querySelector('.uc-embedded-toolbar');
    return {
      theme:links.some(h=>h.includes('unified-course-theme.css')),
      focus:links.some(h=>h.includes('unified-course-focus.css')),
      script:scripts.some(h=>h.includes('unified-course-embedded.js')),
      embedded:root.classList.contains('unified-course-embedded'),
      heroHidden:!hero||getComputedStyle(hero).display==='none',
      topbarHidden:!topbar||getComputedStyle(topbar).display==='none',
      oldNavHidden:!oldNav||getComputedStyle(oldNav).display==='none',
      toolbarVisible:!!toolbar&&getComputedStyle(toolbar).display!=='none',
      exitVisible:!!document.querySelector('.uc-exit-course'),
      pickerVisible:!!document.querySelector('.uc-view-picker select'),
      accent:getComputedStyle(root).getPropertyValue('--uc-accent').trim()
    };
  });

  for (const [key,value] of Object.entries(result)) if ((key!=='accent' && !value) || (key==='accent' && !value)) failures.push(`${label}: ${key} check failed`);
  console.log(`Focused topic UI checked: ${label}`);

  await page.locator('#exitCourse').click();
  await page.waitForTimeout(120);
  if (!(await page.locator('#courseHome').isVisible())) failures.push(`${label}: home did not return after shell exit`);
}

await page.locator('.topic-card').last().click();
await page.waitForTimeout(650);
const frameHandle = await page.locator('#topicFrame').elementHandle();
const frame = await frameHandle?.contentFrame();
if (frame) {
  await frame.locator('.uc-exit-course').click();
  await page.waitForTimeout(150);
  if (!(await page.locator('#courseHome').isVisible())) failures.push('embedded Exit course did not return to home');
}

await page.setViewportSize({width:390,height:844});
await page.locator('.topic-card').last().click();
await page.waitForTimeout(550);
const dims = await page.locator('#topicFrame').evaluate(frameEl => {
  const doc=frameEl.contentDocument;
  return doc ? {scrollWidth:doc.documentElement.scrollWidth,clientWidth:doc.documentElement.clientWidth} : null;
});
if (!dims) failures.push('mobile embedded topic: frame document unavailable');
else if (dims.scrollWidth > dims.clientWidth + 24) failures.push(`mobile embedded topic: horizontal overflow ${dims.scrollWidth}px > ${dims.clientWidth}px`);

await browser.close();
if (failures.length) { console.error(`\nFOCUSED TOPIC UI AUDIT FAILED (${failures.length}):`); failures.forEach(f=>console.error(' -',f)); process.exit(1); }
console.log('\nPASS: every topic uses the compact embedded toolbar, hides duplicate chrome, and can exit back to Course Home.');
