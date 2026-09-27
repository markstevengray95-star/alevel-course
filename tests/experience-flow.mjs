import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:960},serviceWorkers:'block'});
const page=await context.newPage();
const failures=[];
const fail=(message)=>failures.push(message);

await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:45000});
await page.waitForTimeout(350);

if(await page.locator('.study-cycle-step').count()!==3)fail('home: expected Learn, Practise and Assess study-cycle controls');
if(await page.locator('.global-course-nav .course-area-button').count()!==3)fail('home: global course-area navigation is incomplete');
if(!(await page.locator('#navLearn').getAttribute('aria-current')).includes('page'))fail('home: Learn area is not active initially');

await page.locator('.topic-card[data-id="electricity"]').click();
await page.waitForTimeout(650);
if(!(await page.locator('#workspaceSection').isVisible()))fail('learn: topic workspace did not open');
if(!(await page.locator('.area-tool-button[data-course-tool="practicals"]').isVisible().catch(()=>false)))fail('learn: Practical shortcut missing from focused course bar');

let topicFrame=page.frames().find(frame=>frame!==page.mainFrame()&&frame.url().includes('/topics/05-electricity/'));
if(!topicFrame)fail('learn: Electricity topic iframe did not load');
else{
  const sectionPicker=topicFrame.locator('.uc-view-picker select');
  const sectionCount=await sectionPicker.locator('option').count().catch(()=>0);
  if(sectionCount<2)fail('continuity: Electricity topic does not expose enough sections to test resume state');
  else{
    await sectionPicker.selectOption('1');
    await page.waitForTimeout(180);
    if((await sectionPicker.inputValue().catch(()=>''))!=='1')fail('continuity: could not move Electricity to its second section');
  }
}

await page.locator('#quickCourseSelect').selectOption('waves');
await page.waitForFunction(()=>document.querySelector('.workspace-shell')?.classList.contains('topic-loading'),null,{timeout:2000}).catch(()=>fail('continuity: topic loading state did not appear while switching topics'));
await page.waitForTimeout(450);
await page.locator('#quickCourseSelect').selectOption('electricity');
await page.waitForTimeout(700);
topicFrame=page.frames().find(frame=>frame!==page.mainFrame()&&frame.url().includes('/topics/05-electricity/'));
if(!topicFrame)fail('continuity: Electricity iframe did not reload after switching back');
else if((await topicFrame.locator('.uc-view-picker select').inputValue().catch(()=>''))!=='1')fail('continuity: Electricity did not restore its previous inner section');
if(await page.locator('.workspace-shell').getAttribute('aria-busy')!=='false')fail('continuity: topic loading state did not clear after the iframe loaded');

await page.locator('.area-tool-button[data-course-tool="practicals"]').click();
await page.waitForTimeout(850);
if(!(await page.locator('#toolWorkspace').isVisible().catch(()=>false)))fail('practise: tool workspace did not open');
if(!(await page.locator('#practicalSectionWrap').isVisible().catch(()=>false)))fail('practise: integrated Practical Lab section picker is missing');
if((await page.locator('#toolAreaPracticals').getAttribute('aria-current'))!=='page')fail('practise: Practical area is not marked active');

const practicalFrame=page.frames().find(frame=>frame!==page.mainFrame()&&frame.url().includes('/tools/practicals/'));
if(!practicalFrame)fail('practise: Practical Lab iframe did not load');
else{
  const originalHeaderVisible=await practicalFrame.locator('.lab-header').isVisible().catch(()=>false);
  if(originalHeaderVisible)fail('practise: duplicate Practical Lab header is still visible when embedded');
  await page.locator('#practicalSectionPicker').selectOption('skills');
  await page.waitForTimeout(180);
  if(!(await practicalFrame.locator('#view-skills').isVisible().catch(()=>false)))fail('practise: parent section picker did not open Skills hub');
  await page.locator('#practicalSectionPicker').selectOption('quiz');
  await page.waitForTimeout(180);
  if(!(await practicalFrame.locator('#view-quiz').isVisible().catch(()=>false)))fail('practise: parent section picker did not open Quiz studio');
}

const markingButton=page.locator('#toolAreaMarking');
if(!(await markingButton.isVisible().catch(()=>false)))fail('assess: Marking switch is missing from tool bar');
const markingUrl=await page.evaluate(()=>window.CourseTools?.tools?.marking?.url||'');
if(!/alevel-marking/i.test(markingUrl))fail('assess: Marking app URL is not configured');

await page.locator('#toolAreaLearn').click();
await page.waitForTimeout(550);
if(!(await page.locator('#workspaceSection').isVisible().catch(()=>false)))fail('integration: Learn switch did not restore the topic workspace');
if(!(await page.locator('#workspaceCode').innerText()).includes('3.5'))fail('integration: returning from Practicals did not preserve the Electricity topic context');

topicFrame=page.frames().find(frame=>frame!==page.mainFrame()&&frame.url().includes('/topics/05-electricity/'));
if(topicFrame&&(await topicFrame.locator('.uc-view-picker select').inputValue().catch(()=>''))!=='1')fail('integration: returning from Practicals lost the remembered Electricity section');

await page.locator('#exitCourse').click();
await page.waitForTimeout(120);
const focusedTopic=await page.evaluate(()=>document.activeElement?.classList?.contains('topic-card')?document.activeElement.dataset.id:'');
if(focusedTopic!=='electricity')fail(`accessibility: exiting a topic should restore focus to its Course Home card (got ${focusedTopic||'none'})`);

await page.locator('.course-tool-card[data-course-tool="practicals"]').click();
await page.waitForTimeout(500);
await page.locator('#toolBack').click();
await page.waitForTimeout(120);
const focusedTool=await page.evaluate(()=>document.activeElement?.classList?.contains('course-tool-card')?document.activeElement.dataset.courseTool:'');
if(focusedTool!=='practicals')fail(`accessibility: closing a course tool should restore focus to its Home card (got ${focusedTool||'none'})`);

await page.setViewportSize({width:390,height:844});
const dims=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
if(dims.scrollWidth>dims.clientWidth+20)fail(`mobile home: horizontal overflow ${dims.scrollWidth}px > ${dims.clientWidth}px`);
if(!(await page.locator('.global-course-nav').isVisible().catch(()=>false)))fail('mobile home: compact course-area navigation is missing');

await browser.close();
if(failures.length){console.error(`\nEXPERIENCE FLOW FAILED (${failures.length})`);failures.forEach(item=>console.error(' -',item));process.exit(1);}
console.log('PASS: Learn → Practise → Assess navigation, remembered topic sections, loading feedback, focus return and compact mobile shell work together.');