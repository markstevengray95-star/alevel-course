import { installAuditAccount } from './audit-account.mjs';
import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
await installAuditAccount(context, base);
const page = await context.newPage();
const failures = [];

async function inspectFocusedFrame(label){
  for(let attempt=0;attempt<8;attempt++){
    try{
      const frameHandle=await page.locator('#topicFrame').elementHandle();
      const frame=await frameHandle?.contentFrame();
      if(!frame){await page.waitForTimeout(100);continue;}
      await frame.waitForLoadState('domcontentloaded',{timeout:2500}).catch(()=>{});
      await frame.waitForFunction(()=>document.documentElement.classList.contains('uc-embedded-ready'),null,{timeout:5500}).catch(()=>{});
      const result=await frame.evaluate(() => {
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
          textbookVisible:!!document.querySelector('.uc-textbook-button'),
          notebookVisible:!!document.querySelector('.uc-notebook-button'),
          accent:getComputedStyle(root).getPropertyValue('--uc-accent').trim()
        };
      });
      return {frame,result};
    }catch(error){
      if(/Execution context was destroyed|Frame was detached|navigation/i.test(String(error))){await page.waitForTimeout(140);continue;}
      throw error;
    }
  }
  failures.push(`${label}: embedded frame did not settle after navigation`);
  return {frame:null,result:null};
}

await page.goto(base + '/', {waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(500);
const cards = page.locator('.topic-card');
const count = await cards.count();

for (let i=0;i<count;i++) {
  await page.locator('.topic-card').nth(i).click();
  const label = (await page.locator('#workspaceTitle').innerText()).trim();
  const {result}=await inspectFocusedFrame(label);
  if(!result){
    await page.locator('#exitCourse').click().catch(()=>{});
    await page.waitForTimeout(120);
    continue;
  }

  for (const [key,value] of Object.entries(result)) if ((key!=='accent' && !value) || (key==='accent' && !value)) failures.push(`${label}: ${key} check failed`);
  console.log(`Focused topic UI checked: ${label}`);

  await page.locator('#exitCourse').click();
  await page.waitForTimeout(120);
  if (!(await page.locator('#courseHome').isVisible())) failures.push(`${label}: home did not return after shell exit`);
}

await page.locator('.topic-card').last().click();
const last=await inspectFocusedFrame('final embedded exit check');
if (last.frame) {
  if(await last.frame.locator('.uc-exit-course').isVisible().catch(()=>false)){
    await last.frame.locator('.uc-exit-course').click();
    await page.waitForTimeout(150);
    if (!(await page.locator('#courseHome').isVisible())) failures.push('embedded Exit course did not return to home');
  } else failures.push('embedded Exit course was not ready for the exit test');
}

await page.setViewportSize({width:390,height:844});
await page.locator('.topic-card').last().click();
await page.waitForTimeout(550);
await inspectFocusedFrame('mobile embedded topic');
const dims = await page.locator('#topicFrame').evaluate(frameEl => {
  const doc=frameEl.contentDocument;
  return doc ? {scrollWidth:doc.documentElement.scrollWidth,clientWidth:doc.documentElement.clientWidth} : null;
});
if (!dims) failures.push('mobile embedded topic: frame document unavailable');
else if (dims.scrollWidth > dims.clientWidth + 24) failures.push(`mobile embedded topic: horizontal overflow ${dims.scrollWidth}px > ${dims.clientWidth}px`);

await browser.close();
if (failures.length) { console.error(`\nFOCUSED TOPIC UI AUDIT FAILED (${failures.length}):`); failures.forEach(f=>console.error(' -',f)); process.exit(1); }
console.log('\nPASS: every topic uses the same compact embedded toolbar with Textbook, Notebook and focused visual system.');