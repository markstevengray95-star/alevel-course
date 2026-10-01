import { chromium } from 'playwright';
const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});
const failures=[];const errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function expectText(selector,re,label){const text=await page.locator(selector).innerText().catch(()=> '');if(!re.test(text))failures.push(`${label}: found ${JSON.stringify(text)}`);}
try{
  await page.goto(`${base}/subjects/biology-practicals.html`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.ALEVEL_BIOLOGY_PRACTICALS?.count===12,{timeout:8000}).catch(()=>failures.push('Biology practical runtime did not initialise with 12 activities'));
  const navCount=await page.locator('[data-practical-nav]').count();if(navCount!==12)failures.push(`Expected 12 practical nav entries, found ${navCount}`);

  await page.locator('[data-practical-nav="2"]').click();
  await page.locator('[data-tab="simulate"]').click();
  await page.locator('#panelSimulate [data-a]').fill('200');
  await page.locator('#panelSimulate [data-b]').fill('50');
  await page.locator('#panelSimulate [data-run]').click();
  await expectText('#panelSimulate [data-graph]',/25\.0%/,'RP2 mitotic index should calculate 25.0%');

  await page.locator('[data-practical-nav="7"]').click();
  await page.locator('[data-tab="simulate"]').click();
  await page.locator('#panelSimulate [data-a]').fill('42');
  await page.locator('#panelSimulate [data-b]').fill('60');
  await page.locator('#panelSimulate [data-run]').click();
  await expectText('#panelSimulate [data-graph]',/Rf = 0\.70/,'RP7 chromatography should calculate Rf 0.70');

  await page.locator('[data-practical-nav="11"]').click();
  await page.locator('[data-tab="simulate"]').click();
  await page.locator('#panelSimulate [data-a]').fill('55');
  await page.locator('#panelSimulate [data-b]').fill('11');
  await page.locator('#panelSimulate [data-run]').click();
  await expectText('#panelSimulate [data-visual]',/5\.00/,'RP11 calibration model should interpolate 5.00 concentration units');

  await page.locator('[data-practical-nav="1"]').click();
  await page.locator('#completeBtn').click();
  await expectText('#progressText',/1 \/ 12 complete/,'completion tracker should update');
  await page.reload({waitUntil:'domcontentloaded'});
  await expectText('#progressText',/1 \/ 12 complete/,'completion tracker should persist after reload');

  await page.goto(`${base}/index.html?subject=biology`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.CourseApp?.config?.id==='biology'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE,{timeout:10000}).catch(()=>failures.push('Biology main course did not initialise subject tool bridge'));
  const bioCard=page.locator('.course-tool-card[data-course-tool="practicals"]');
  await expectText('.course-tool-card[data-course-tool="practicals"] h3',/Biology Required Practicals/,'Biology practical card should be relabelled');
  await bioCard.click();
  const src=await page.locator('#toolFrame').getAttribute('src').catch(()=> '');if(!/subjects\/biology-practicals\.html/.test(src||''))failures.push(`Biology Practicals routed to ${src} instead of Biology hub`);
  await page.locator('#toolFrame').waitFor({state:'visible',timeout:5000}).catch(()=>failures.push('Biology practical iframe not visible'));

  await page.goto(`${base}/index.html?subject=physics`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.CourseApp?.config?.id==='physics',{timeout:8000});
  await page.locator('.course-tool-card[data-course-tool="practicals"]').click();
  const physicsSrc=await page.locator('#toolFrame').getAttribute('src').catch(()=> '');if(!/tools\/practicals\/index\.html/.test(physicsSrc||''))failures.push(`Physics practical route regressed: ${physicsSrc}`);
}finally{await browser.close();}
if(errors.length){failures.push(`Page JavaScript errors: ${[...new Set(errors)].join(' | ')}`);}
if(failures.length){console.error('Biology practical browser audit failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1);}
console.log('Biology practical browser audit passed: 12-practical hub, mitotic index, Rf, colorimetry, completion persistence and subject-aware routing all work.');
