import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
const page=await context.newPage();
const failures=[];
let managedGroups=0;
let interactiveNav=null;

await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:45000});
const cards=page.locator('.topic-card');
const cardCount=await cards.count();

for(let i=0;i<cardCount;i++){
  await page.locator('.topic-card').nth(i).click();
  await page.waitForTimeout(450);
  const frameHandle=await page.locator('#topicFrame').elementHandle();
  const frame=await frameHandle?.contentFrame();
  if(!frame){failures.push(`topic ${i+1}: iframe unavailable`);continue;}
  await frame.waitForFunction(()=>document.documentElement.classList.contains('uc-simple-navigation-ready'),null,{timeout:5000}).catch(()=>failures.push(`topic ${i+1}: simplified navigation did not initialise`));

  const sectionSelect=frame.locator('.uc-view-picker select');
  if(await sectionSelect.count()){
    const options=await sectionSelect.locator('option').allTextContents();
    const target=options.findIndex(text=>/(course|lesson|learn)/i.test(text));
    if(target>=0){await sectionSelect.selectOption(String(target));await page.waitForTimeout(180);}
  }

  const result=await frame.evaluate(()=>{
    const navs=[...document.querySelectorAll('.uc-simple-lesson-nav')];
    return navs.map(nav=>{
      const id=nav.dataset.targetId;
      const source=document.querySelector(`[data-uc-nav-id="${id}"]`);
      const select=nav.querySelector('select');
      return {
        options:select?.options.length||0,
        previous:!!nav.querySelector('.uc-lesson-prev'),
        next:!!nav.querySelector('.uc-lesson-next'),
        sourceHidden:source?.getAttribute('aria-hidden')==='true',
        sourceManaged:!!source?.classList.contains('uc-nav-managed'),
        navVisible:getComputedStyle(nav).display!=='none'&&!nav.hidden
      };
    });
  });

  managedGroups+=result.length;
  result.forEach((item,index)=>{
    if(item.options<2)failures.push(`topic ${i+1}, navigator ${index+1}: selector has fewer than two choices`);
    if(!item.previous||!item.next)failures.push(`topic ${i+1}, navigator ${index+1}: previous/next controls missing`);
    if(!item.sourceHidden||!item.sourceManaged)failures.push(`topic ${i+1}, navigator ${index+1}: old lesson tabs are still exposed`);
  });

  const visibleNav=frame.locator('.uc-simple-lesson-nav:visible').first();
  if(!interactiveNav&&await visibleNav.count()){
    const optionCount=await visibleNav.locator('select option').count();
    if(optionCount>1)interactiveNav={topic:i};
  }

  await page.locator('#exitCourse').click();
  await page.waitForTimeout(100);
}

if(managedGroups<1)failures.push('no lesson-tab groups were converted to the simplified navigator');

if(interactiveNav){
  await page.locator('.topic-card').nth(interactiveNav.topic).click();
  await page.waitForTimeout(450);
  const frameHandle=await page.locator('#topicFrame').elementHandle();
  const frame=await frameHandle?.contentFrame();
  if(frame){
    const sectionSelect=frame.locator('.uc-view-picker select');
    if(await sectionSelect.count()){
      const options=await sectionSelect.locator('option').allTextContents();
      const target=options.findIndex(text=>/(course|lesson|learn)/i.test(text));
      if(target>=0){await sectionSelect.selectOption(String(target));await page.waitForTimeout(180);}
    }
    const nav=frame.locator('.uc-simple-lesson-nav:visible').first();
    if(await nav.count()){
      const select=nav.locator('select');
      const count=await select.locator('option').count();
      if(count>1){
        await select.selectOption('1');
        await page.waitForTimeout(120);
        if(await select.inputValue()!=='1')failures.push('lesson dropdown did not move to the selected lesson');
        const position=await nav.locator('.uc-lesson-position').innerText();
        if(!/2 of /i.test(position))failures.push(`lesson position did not update after selection (${position})`);
        await nav.locator('.uc-lesson-prev').click();
        await page.waitForTimeout(120);
        if(await select.inputValue()!=='0')failures.push('previous lesson control did not return to the first lesson');
      }
    }
  }
}

await browser.close();
if(failures.length){console.error(`\nSIMPLE NAVIGATION FAILED (${failures.length})`);failures.forEach(item=>console.error(' -',item));process.exit(1);}
console.log(`PASS: ${managedGroups} lesson/stage tab group(s) are replaced by a single selector with Previous/Next navigation.`);
