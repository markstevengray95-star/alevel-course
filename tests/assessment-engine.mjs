import {chromium} from 'playwright';
const base='http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
function assert(ok,msg){if(!ok)throw new Error(msg)}
async function exercise(subject){
  await page.goto(`${base}/subjects/assessment-hub.html?subject=${subject}`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.ALEVEL_ASSESSMENT_ENGINE&&window.ALEVEL_ASSESSMENT_DATA);
  const bank=await page.evaluate(()=>window.ALEVEL_ASSESSMENT_ENGINE.getBank().length);
  assert(bank>100,`${subject}: bank too small (${bank})`);
  await page.selectOption('#countSelect','5');
  await page.click('#startBtn');
  await page.waitForSelector('#sessionView:not([hidden])');
  assert((await page.locator('#qAO').textContent()).startsWith('AO'),`${subject}: AO tag missing`);
  assert(/marks/.test(await page.locator('#qMarks').textContent()),`${subject}: marks missing`);
  await page.fill('#answerInput','This answer uses the relevant scientific terminology and explains the process, evidence, variables and conclusion using the underlying mechanism.');
  await page.click('#markBtn');
  await page.waitForSelector('#feedbackPanel:not([hidden])');
  assert(/\/ 4/.test(await page.locator('#feedbackScore').textContent()),`${subject}: formative score missing`);
  await page.click('#nextBtn');
  for(let i=0;i<4;i++){await page.click('#skipBtn');if(i<3)await page.waitForTimeout(30)}
  await page.waitForSelector('#resultView:not([hidden])');
  assert(/%/.test(await page.locator('#resultPercent').textContent()),`${subject}: result percentage missing`);
  const stored=await page.evaluate(s=>JSON.parse(localStorage.getItem(`alevel-${s}-assessment-history-v1`)||'[]').length,subject);
  assert(stored>=1,`${subject}: result history not saved`);
}
await exercise('biology');
await exercise('chemistry');
async function route(subject,method,fragment){
  await page.goto(`${base}/?subject=${subject}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE&&window.CourseApp?.config?.id);
  const result=await page.evaluate(m=>window.ALEVEL_SUBJECT_TOOL_BRIDGE[m](),method);
  assert(result===true,`${subject}: ${method} did not open`);
  const src=await page.locator('#toolFrame').getAttribute('src');
  assert(src?.includes(fragment),`${subject}: assessment iframe route incorrect (${src})`);
}
await route('biology','openBiologyAssessments','assessment-hub.html?subject=biology');
await route('chemistry','openChemistryAssessments','assessment-hub.html?subject=chemistry');
await page.goto(`${base}/?subject=physics`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE&&window.CourseApp?.config?.id==='physics');
const physicsGuard=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openBiologyAssessments());
assert(physicsGuard===false,'Physics should not be routed to Biology assessments');
if(errors.length)throw new Error(`Page errors: ${errors.join(' | ')}`);
console.log('Assessment browser audit passed for Biology, Chemistry, saved results and subject routing.');
await browser.close();