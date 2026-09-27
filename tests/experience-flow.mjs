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
await page.waitForTimeout(500);
if(!(await page.locator('#workspaceSection').isVisible()))fail('learn: topic workspace did not open');
if(!(await page.locator('.area-tool-button[data-course-tool="practicals"]').isVisible().catch(()=>false)))fail('learn: Practical shortcut missing from focused course bar');

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
await page.waitForTimeout(450);
if(!(await page.locator('#workspaceSection').isVisible().catch(()=>false)))fail('integration: Learn switch did not restore the topic workspace');
if(!(await page.locator('#workspaceCode').innerText()).includes('3.5'))fail('integration: returning from Practicals did not preserve the Electricity topic context');

await page.locator('#exitCourse').click();
await page.waitForTimeout(140);
await page.setViewportSize({width:390,height:844});
const dims=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
if(dims.scrollWidth>dims.clientWidth+20)fail(`mobile home: horizontal overflow ${dims.scrollWidth}px > ${dims.clientWidth}px`);
if(!(await page.locator('.global-course-nav').isVisible().catch(()=>false)))fail('mobile home: compact course-area navigation is missing');

await browser.close();
if(failures.length){console.error(`\nEXPERIENCE FLOW FAILED (${failures.length})`);failures.forEach(item=>console.error(' -',item));process.exit(1);}
console.log('PASS: Learn → Practise → Assess navigation, embedded Practical Lab bridge, context return and compact mobile shell work together.');
