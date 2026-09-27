import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
const page = await context.newPage();
const failures = [];

await page.goto(base + '/', {waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(800);

const select = page.locator('#quickCourseSelect');
const options = await select.locator('option').evaluateAll(opts => opts.map(o => ({value:o.value,label:o.textContent?.trim()||o.value})));

for (const option of options) {
  await select.selectOption(option.value);
  await page.waitForTimeout(900);

  const frameHandle = await page.locator('#topicFrame').elementHandle();
  const frame = await frameHandle?.contentFrame();
  if (!frame) {
    failures.push(`${option.label}: embedded frame unavailable`);
    continue;
  }

  const result = await frame.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const themeLink = [...document.querySelectorAll('link[rel="stylesheet"]')].some(link => (link.getAttribute('href')||'').includes('unified-course-theme.css'));
    const embeddedClass = root.classList.contains('unified-course-embedded');
    const accent = getComputedStyle(root).getPropertyValue('--uc-accent').trim();
    const hero = document.querySelector('.hero');
    const heroHidden = !hero || getComputedStyle(hero).display === 'none';
    const nav = document.querySelector('.main-nav');
    const navStyle = nav ? getComputedStyle(nav) : null;
    const navUnified = !nav || (parseFloat(navStyle.borderRadius) >= 10 && ['auto','scroll'].includes(navStyle.overflowX));
    const panel = document.querySelector('.panel');
    const panelUnified = !panel || parseFloat(getComputedStyle(panel).borderRadius) >= 10;
    const bodyFont = getComputedStyle(body).fontFamily;
    return {themeLink,embeddedClass,accent,heroHidden,navUnified,panelUnified,bodyFont,title:document.title};
  });

  if (!result.themeLink) failures.push(`${option.label}: unified stylesheet link missing`);
  if (!result.embeddedClass) failures.push(`${option.label}: embedded theme class missing`);
  if (!result.accent) failures.push(`${option.label}: unified CSS variables not active`);
  if (!result.heroHidden) failures.push(`${option.label}: duplicated internal hero is still visible`);
  if (!result.navUnified) failures.push(`${option.label}: main navigation does not use unified styling`);
  if (!result.panelUnified) failures.push(`${option.label}: panels do not use unified styling`);

  console.log(`Theme checked ${option.label}: ${result.title}`);
}

await page.setViewportSize({width:390,height:844});
await select.selectOption(options.at(-1)?.value || 'nuclear');
await page.waitForTimeout(700);
const dims = await page.locator('#topicFrame').evaluate(frameEl => {
  const doc = frameEl.contentDocument;
  return doc ? {scrollWidth:doc.documentElement.scrollWidth,clientWidth:doc.documentElement.clientWidth} : null;
});
if (!dims) failures.push('mobile embedded theme: frame document unavailable');
else if (dims.scrollWidth > dims.clientWidth + 24) failures.push(`mobile embedded theme: horizontal overflow ${dims.scrollWidth}px > ${dims.clientWidth}px`);

await browser.close();

if (failures.length) {
  console.error(`\nUNIFIED THEME AUDIT FAILED (${failures.length}):`);
  failures.forEach(f => console.error(' -', f));
  process.exit(1);
}

console.log('\nPASS: all embedded topic apps use the shared visual system and compact embedded layout.');
