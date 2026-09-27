import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:960},serviceWorkers:'block'});
const page=await context.newPage();
const failures=[];
const fail=(message)=>failures.push(message);

await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:45000});
await page.waitForFunction(()=>window.CourseTextbook?.data,{timeout:5000}).catch(()=>fail('textbook: reader did not bootstrap'));
await page.waitForTimeout(350);

if(await page.locator('.study-cycle-step').count()!==3)fail('home: expected Learn, Practise and Assess study-cycle controls');
if(await page.locator('.global-course-nav .course-area-button').count()!==3)fail('home: global course-area navigation is incomplete');
if(!(await page.locator('#navLearn').getAttribute('aria-current')).includes('page'))fail('home: Learn area is not active initially');
if(!(await page.locator('#homeLearningDashboard').isVisible().catch(()=>false)))fail('home: learning overview dashboard is missing');
if(!(await page.locator('#homeResumeCard').isVisible().catch(()=>false)))fail('home: resume learning card is missing');
if(await page.locator('.course-stage').count()!==2)fail('home: expected Year 12 and Year 13 course stages');
if((await page.locator('#homeYear12Stat').innerText().catch(()=>''))!=='0 / 5')fail('home: Year 12 progress summary is incorrect initially');
if((await page.locator('#homeYear13Stat').innerText().catch(()=>''))!=='0 / 3')fail('home: Year 13 progress summary is incorrect initially');
if(!(await page.locator('#homeTextbookBtn').isVisible().catch(()=>false)))fail('textbook: Course Home textbook entry is missing');
const textbookShape=await page.evaluate(()=>({topics:Object.keys(window.CourseTextbook?.data||{}).length,chapters:Object.values(window.CourseTextbook?.data||{}).reduce((n,t)=>n+(t.chapters?.length||0),0)}));
if(textbookShape.topics!==8)fail(`textbook: expected 8 core topic books, found ${textbookShape.topics}`);
if(textbookShape.chapters<34)fail(`textbook: expected at least 34 full chapters, found ${textbookShape.chapters}`);

await page.locator('.topic-card[data-id="electricity"]').click();
await page.waitForTimeout(650);
if(!(await page.locator('#workspaceSection').isVisible()))fail('learn: topic workspace did not open');
if(!(await page.locator('.area-tool-button[data-course-tool="practicals"]').isVisible().catch(()=>false)))fail('learn: Practical shortcut missing from focused course bar');
if(!(await page.locator('#textbookToggle').isVisible().catch(()=>false)))fail('textbook: focused course Textbook control is missing');

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
  if(!(await topicFrame.locator('.uc-textbook-button').isVisible().catch(()=>false)))fail('textbook: embedded Electricity toolbar is missing Textbook access');
  else{
    await topicFrame.locator('.uc-textbook-button').click();
    await page.waitForTimeout(180);
    if(!(await page.locator('#textbookWorkspace').isVisible().catch(()=>false)))fail('textbook: embedded toolbar did not open textbook workspace');
    if((await page.locator('#textbookTopicSelect').inputValue().catch(()=>''))!=='electricity')fail('textbook: reader did not open the active Electricity book');
    if(await page.locator('#textbookChapterList .textbook-chapter-button').count()<4)fail('textbook: Electricity book is missing full chapter navigation');
    await page.locator('#textbookChapterList .textbook-chapter-button').nth(1).click();
    await page.waitForTimeout(80);
    if(!/Resistance/i.test(await page.locator('#textbookArticle h1').innerText().catch(()=>'')))fail('textbook: chapter switching did not render Electricity resistance chapter');
    const beforeNotes=await page.evaluate(()=>window.CourseNotebook?.getNotes?.().length||0);
    await page.locator('#textbookSaveSummary').click();
    await page.waitForTimeout(60);
    const afterNotes=await page.evaluate(()=>window.CourseNotebook?.getNotes?.().length||0);
    if(afterNotes!==beforeNotes+1)fail('textbook: chapter summary did not save into Student Notebook');
    await page.locator('#textbookMarkRead').click();
    if(!(await page.locator('#textbookChapterList .textbook-chapter-button').nth(1).innerText().catch(()=>'' )).includes('✓'))fail('textbook: mark-as-read state did not update chapter navigation');
    await page.locator('#textbookBack').click();
    await page.waitForTimeout(80);
    if(!(await page.locator('#workspaceSection').isVisible().catch(()=>false)))fail('textbook: closing reader did not return to active lesson workspace');
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
if(!(await page.locator('#toolTextbook').isVisible().catch(()=>false)))fail('textbook: Course Tools workspace is missing Textbook access');

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

await page.locator('#markComplete').click();
await page.waitForTimeout(40);
await page.locator('#exitCourse').click();
await page.waitForTimeout(150);
const focusedTopic=await page.evaluate(()=>document.activeElement?.classList?.contains('topic-card')?document.activeElement.dataset.id:'');
if(focusedTopic!=='electricity')fail(`accessibility: exiting a topic should restore focus to its Course Home card (got ${focusedTopic||'none'})`);
if((await page.locator('#homeYear12Stat').innerText().catch(()=>''))!=='1 / 5')fail('home: Year 12 progress did not update after completing Electricity');
if(!/Electricity/i.test(await page.locator('#homeResumeTitle').innerText().catch(()=>'')))fail('home: resume card did not retain the last studied topic');
if(!/AQA 3\.5/i.test(await page.locator('#homeResumeDetail').innerText().catch(()=>'')))fail('home: resume card is missing AQA topic context');

await page.locator('#homeResumeCard').click();
await page.waitForTimeout(650);
if(!(await page.locator('#workspaceCode').innerText()).includes('3.5'))fail('home: resume card did not reopen Electricity');
topicFrame=page.frames().find(frame=>frame!==page.mainFrame()&&frame.url().includes('/topics/05-electricity/'));
if(topicFrame&&(await topicFrame.locator('.uc-view-picker select').inputValue().catch(()=>''))!=='1')fail('home: resume card did not restore the remembered Electricity section');
await page.locator('#exitCourse').click();
await page.waitForTimeout(120);

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
if(!(await page.locator('#homeResumeCard').isVisible().catch(()=>false)))fail('mobile home: resume card is not visible');
if(!(await page.locator('#courseStageStrip').isVisible().catch(()=>false)))fail('mobile home: Year 12/Year 13 stage strip is not visible');
await page.locator('#homeTextbookBtn').click();
await page.waitForTimeout(100);
if(!(await page.locator('#textbookWorkspace').isVisible().catch(()=>false)))fail('mobile textbook: reader did not open');
const textbookDims=await page.locator('#textbookWorkspace').evaluate(el=>({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth})).catch(()=>({scrollWidth:999,clientWidth:0}));
if(textbookDims.scrollWidth>textbookDims.clientWidth+10)fail(`mobile textbook: horizontal overflow ${textbookDims.scrollWidth}px > ${textbookDims.clientWidth}px`);
if(!(await page.locator('#textbookMobileChapter').isVisible().catch(()=>false)))fail('mobile textbook: compact chapter picker is missing');

await browser.close();
if(failures.length){console.error(`\nEXPERIENCE FLOW FAILED (${failures.length})`);failures.forEach(item=>console.error(' -',item));process.exit(1);}
console.log('PASS: full textbook, premium Course Home, Learn → Practise → Assess navigation, remembered topic sections, notebook saving, focus return and compact mobile shell work together.');