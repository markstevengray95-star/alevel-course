import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
const page=await context.newPage();
const failures=[];
let managedGroups=0;
let presentationGroups=0;
let interactiveNav=null;
let presentationTarget=null;

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
    if(target>=0){await sectionSelect.selectOption(String(target));await page.waitForTimeout(220);}
  }

  const result=await frame.evaluate(()=>{
    const navs=[...document.querySelectorAll('.uc-simple-lesson-nav')];
    return navs.map(nav=>{
      const id=nav.dataset.targetId;
      const source=document.querySelector(`[data-uc-nav-id="${id}"]`);
      const select=nav.querySelector('select');
      const deck=source?.closest?.('.lesson-panel');
      const presentation=nav.classList.contains('uc-presentation-nav');
      const stages=deck?[...deck.querySelectorAll('.lesson-stage')]:[];
      const visibleStages=stages.filter(stage=>!stage.hidden&&getComputedStyle(stage).display!=='none').length;
      return {
        options:select?.options.length||0,
        previous:!!nav.querySelector('.uc-lesson-prev'),
        next:!!nav.querySelector('.uc-lesson-next'),
        sourceHidden:source?.getAttribute('aria-hidden')==='true',
        sourceManaged:!!source?.classList.contains('uc-nav-managed'),
        navVisible:getComputedStyle(nav).display!=='none'&&!nav.hidden,
        presentation,
        deckReady:!presentation||!!deck?.classList.contains('uc-presentation-deck'),
        overviewReady:!presentation||!!deck?.querySelector('.uc-lesson-overview'),
        visibleStages
      };
    });
  });

  managedGroups+=result.length;
  result.forEach((item,index)=>{
    if(item.options<2)failures.push(`topic ${i+1}, navigator ${index+1}: selector has fewer than two choices`);
    if(!item.previous||!item.next)failures.push(`topic ${i+1}, navigator ${index+1}: previous/next controls missing`);
    if(!item.sourceHidden||!item.sourceManaged)failures.push(`topic ${i+1}, navigator ${index+1}: old lesson tabs are still exposed`);
    if(item.presentation){
      presentationGroups++;
      if(!item.deckReady)failures.push(`topic ${i+1}, navigator ${index+1}: presentation deck styling was not applied`);
      if(item.visibleStages>1)failures.push(`topic ${i+1}, navigator ${index+1}: more than one lesson slide is visible at once`);
    }
  });

  const visibleNav=frame.locator('.uc-simple-lesson-nav:visible').first();
  if(!interactiveNav&&await visibleNav.count()){
    const optionCount=await visibleNav.locator('select option').count();
    if(optionCount>1)interactiveNav={topic:i};
  }

  const presentationNav=frame.locator('.uc-presentation-nav:visible').first();
  if(!presentationTarget&&await presentationNav.count()){
    const optionCount=await presentationNav.locator('select option').count();
    if(optionCount>1)presentationTarget={topic:i};
  }

  await page.locator('#exitCourse').click();
  await page.waitForTimeout(100);
}

if(managedGroups<1)failures.push('no lesson-tab groups were converted to the simplified navigator');
if(presentationGroups<1)failures.push('no staged lesson was converted into a presentation deck');

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
  await page.locator('#exitCourse').click().catch(()=>{});
  await page.waitForTimeout(100);
}

if(presentationTarget){
  await page.locator('.topic-card').nth(presentationTarget.topic).click();
  await page.waitForTimeout(500);
  const frameHandle=await page.locator('#topicFrame').elementHandle();
  const frame=await frameHandle?.contentFrame();
  if(frame){
    const sectionSelect=frame.locator('.uc-view-picker select');
    if(await sectionSelect.count()){
      const options=await sectionSelect.locator('option').allTextContents();
      const target=options.findIndex(text=>/(course|lesson|learn)/i.test(text));
      if(target>=0){await sectionSelect.selectOption(String(target));await page.waitForTimeout(220);}
    }
    const nav=frame.locator('.uc-presentation-nav:visible').first();
    if(!(await nav.count()))failures.push('presentation navigator disappeared when reopening the lesson');
    else{
      const select=nav.locator('select');
      const count=await select.locator('option').count();
      if(count>1){
        await select.selectOption('1');
        await page.waitForTimeout(160);
        const position=await nav.locator('.uc-lesson-position').innerText();
        if(!/Slide 2 of /i.test(position))failures.push(`presentation position did not update (${position})`);
        const visibleStages=await frame.locator('.uc-presentation-deck .lesson-stage:visible').count();
        if(visibleStages!==1)failures.push(`presentation should show exactly one slide (${visibleStages} visible)`);
        const slideText=await frame.locator('.uc-presentation-deck .lesson-stage:visible').innerText().catch(()=> '');
        if(slideText.trim().length<20)failures.push('presentation slide does not contain meaningful lesson content');
        await nav.locator('.uc-lesson-prev').click();
        await page.waitForTimeout(120);
        if(await select.inputValue()!=='0')failures.push('presentation Previous control did not return to slide 1');
      }
    }
  }
}

await browser.close();
if(failures.length){console.error(`\nSIMPLE/PRESENTATION NAVIGATION FAILED (${failures.length})`);failures.forEach(item=>console.error(' -',item));process.exit(1);}
console.log(`PASS: ${managedGroups} lesson/stage group(s) use simplified navigation and ${presentationGroups} staged lesson group(s) render as presentation slides.`);
