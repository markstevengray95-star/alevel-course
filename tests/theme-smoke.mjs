import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
const page = await context.newPage();
const failures = [];

async function inspectFocusedFrame(label){
  for(let attempt=0;attempt<4;attempt++){
    try{
      const frameHandle=await page.locator('#topicFrame').elementHandle({timeout:2000});
      const frame=await frameHandle?.contentFrame();
      if(!frame){await page.waitForTimeout(80);continue;}
      await frame.waitForLoadState('domcontentloaded',{timeout:1800}).catch(()=>{});
      await frame.waitForFunction(()=>document.documentElement.classList.contains('uc-embedded-ready'),null,{timeout:2500}).catch(()=>{});
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
      if(/Execution context was destroyed|Frame was detached|navigation|Timeout/i.test(String(error))){await page.waitForTimeout(100);continue;}
      throw error;
    }
  }
  failures.push(`${label}: embedded frame did not settle after navigation`);
  return {frame:null,result:null};
}

async function openTopic(id){
  await page.evaluate(topicId => window.CourseApp?.openTopic?.(topicId,false,0,{historyMode:'none'}), id);
  await page.waitForTimeout(180);
}
async function exitTopic(){
  await page.evaluate(() => window.CourseApp?.exitCourse?.({scroll:false,updateUrl:false}));
  await page.waitForTimeout(80);
}

await page.goto(base + '/', {waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(() => !!window.CourseApp?.topics?.length, null, {timeout:5000});
const topics = await page.evaluate(() => window.CourseApp.topics.map(t => ({id:t.id,title:t.title})));
if(topics.length !== 8) failures.push(`expected 8 topics, found ${topics.length}`);

for (const topic of topics) {
  await openTopic(topic.id);
  const {result}=await inspectFocusedFrame(topic.title);
  if(!result){ await exitTopic(); continue; }
  for (const [key,value] of Object.entries(result)) if (!value) failures.push(`${topic.title}: ${key} check failed`);
  console.log(`Focused topic UI checked: ${topic.title}`);
  await exitTopic();
  if (!(await page.locator('#courseHome').isVisible({timeout:1500}).catch(()=>false))) failures.push(`${topic.title}: home did not return after shell exit`);
}

await openTopic(topics.at(-1)?.id);
const last=await inspectFocusedFrame('final embedded exit check');
if (last.frame) {
  const exit=last.frame.locator('.uc-exit-course');
  if(await exit.isVisible({timeout:1500}).catch(()=>false)){
    await exit.click({timeout:2000}).catch(error=>failures.push(`embedded Exit course click failed: ${error.message}`));
    await page.waitForTimeout(120);
    if (!(await page.locator('#courseHome').isVisible({timeout:1500}).catch(()=>false))) failures.push('embedded Exit course did not return to home');
  } else failures.push('embedded Exit course was not ready for the exit test');
}

await page.setViewportSize({width:390,height:844});
await openTopic(topics.at(-1)?.id);
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
