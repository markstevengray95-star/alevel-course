import { installAuditAccount } from './audit-account.mjs';
import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const failures=[];
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
await installAuditAccount(context,base);

const expected={
  biology:['practicals','marking','data-coach','astar-hub','progress-mastery','teacher-analytics','specification-audit'],
  chemistry:['practicals','marking','calculation-coach','astar-hub','progress-mastery','teacher-analytics','specification-audit']
};

for(const subject of ['biology','chemistry']){
  const page=await context.newPage();
  try{
    await page.goto(`${base}/?subject=${subject}`,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(1000);
    if(!(await page.locator('#courseTools').isVisible().catch(()=>false))) failures.push(`${subject}: course tool section is hidden`);
    for(const tool of expected[subject]){
      const card=page.locator(`.course-tool-card[data-course-tool="${tool}"]`);
      if(!(await card.isVisible().catch(()=>false))) failures.push(`${subject}: ${tool} card is not visible`);
    }
    for(const tool of ['practicals','marking']){
      const nav=page.locator(`.global-course-nav [data-course-tool="${tool}"]`);
      if(!(await nav.isVisible().catch(()=>false))) failures.push(`${subject}: ${tool} global navigation is hidden`);
    }

    const firstTopic=page.locator('.topic-card').first();
    await firstTopic.click();
    await page.locator('#mobileStudyDock').waitFor({state:'visible',timeout:4000});
    const toolsButton=page.locator('#mobileDockTools');
    if(!(await toolsButton.isVisible().catch(()=>false))) failures.push(`${subject}: mobile Tools button is hidden`);
    else{
      await toolsButton.click();
      await page.waitForTimeout(250);
      if(!(await page.locator('#courseHome').isVisible().catch(()=>false))) failures.push(`${subject}: mobile Tools button did not return to course home`);
      if(!(await page.locator('#courseTools').isVisible().catch(()=>false))) failures.push(`${subject}: tool section is not visible after mobile Tools action`);
      if(await page.locator('#mobileStudyDock').isVisible().catch(()=>false)) failures.push(`${subject}: mobile dock stayed visible after returning to tool section`);
    }
  }catch(error){failures.push(`${subject}: ${error.message}`);}
  await page.close();
}

await context.close();
await browser.close();
if(failures.length){
  console.error(`\nPHASE 18 SUBJECT TOOL VISIBILITY FAILED (${failures.length})`);
  failures.forEach(item=>console.error(' -',item));
  process.exit(1);
}
console.log('PASS: Biology and Chemistry expose their complete tool sets and the mobile Tools control returns to the visible tool section.');
