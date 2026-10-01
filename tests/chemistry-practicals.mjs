import { chromium } from 'playwright';
const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});
const failures=[];const errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function expectText(selector,re,label){const text=await page.locator(selector).innerText().catch(()=> '');if(!re.test(text))failures.push(`${label}: found ${JSON.stringify(text)}`);}
async function openPractical(id){await page.locator(`[data-practical-nav="${id}"]`).click();await page.locator('[data-tab="simulate"]').click();}
try{
  await page.goto(`${base}/subjects/chemistry-practicals.html`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.ALEVEL_CHEMISTRY_PRACTICALS?.count===12,{timeout:8000}).catch(()=>failures.push('Chemistry practical runtime did not initialise with 12 activities'));
  const navCount=await page.locator('[data-practical-nav]').count();if(navCount!==12)failures.push(`Expected 12 practical nav entries, found ${navCount}`);

  await openPractical(1);
  const rp1=page.locator('#panelSimulate [data-sim-input]');
  await rp1.nth(0).fill('0.100');await rp1.nth(1).fill('25');await rp1.nth(2).fill('20');
  await page.locator('#panelSimulate [data-run]').click();
  await expectText('#panelSimulate [data-visual]',/0\.1250 mol dm⁻³/,'RP1 virtual titration should calculate 0.1250 mol dm⁻³');

  await openPractical(8);
  const rp8=page.locator('#panelSimulate [data-sim-input]');
  await rp8.nth(0).fill('0.34');await rp8.nth(1).fill('-0.76');
  await page.locator('#panelSimulate [data-run]').click();
  await expectText('#panelSimulate [data-visual]',/\+1\.10 V/,'RP8 electrochemical cell should calculate +1.10 V');

  await openPractical(10);
  const rp10=page.locator('#panelSimulate [data-sim-input]');
  await rp10.nth(0).fill('6.8');await rp10.nth(1).fill('8.0');
  await page.locator('#panelSimulate [data-run]').click();
  await expectText('#panelSimulate [data-visual]',/85\.0%/,'RP10 percentage yield should calculate 85.0%');

  await openPractical(12);
  const rp12=page.locator('#panelSimulate [data-sim-input]');
  await rp12.nth(0).fill('36');await rp12.nth(1).fill('48');
  await page.locator('#panelSimulate [data-run]').click();
  await expectText('#panelSimulate [data-visual]',/Rf = 0\.75/,'RP12 TLC should calculate Rf 0.75');

  await page.locator('[data-practical-nav="1"]').click();await page.locator('#completeBtn').click();
  await expectText('#progressText',/1 \/ 12 complete/,'completion tracker should update');
  await page.reload({waitUntil:'domcontentloaded'});await expectText('#progressText',/1 \/ 12 complete/,'completion tracker should persist after reload');

  await page.goto(`${base}/index.html?subject=chemistry`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.CourseApp?.config?.id==='chemistry'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE,{timeout:10000}).catch(()=>failures.push('Chemistry main course did not initialise subject tool bridge'));
  await expectText('.course-tool-card[data-course-tool="practicals"] h3',/Chemistry Required Practicals/,'Chemistry practical card should be relabelled');
  const opened=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openChemistryPracticals());if(!opened)failures.push('Chemistry practical bridge refused Chemistry subject');
  const src=await page.locator('#toolFrame').getAttribute('src').catch(()=> '');if(!/subjects\/chemistry-practicals\.html/.test(src||''))failures.push(`Chemistry Practicals routed to ${src} instead of Chemistry hub`);

  await page.goto(`${base}/index.html?subject=biology`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.CourseApp?.config?.id==='biology'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE,{timeout:10000});
  const bioOpened=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openBiologyPracticals());if(!bioOpened)failures.push('Biology practical bridge regressed');
  const bioSrc=await page.locator('#toolFrame').getAttribute('src').catch(()=> '');if(!/subjects\/biology-practicals\.html/.test(bioSrc||''))failures.push(`Biology practical route regressed: ${bioSrc}`);

  await page.goto(`${base}/index.html?subject=physics`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.CourseApp?.config?.id==='physics'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE,{timeout:10000});
  const chemistryGuard=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openChemistryPracticals());if(chemistryGuard!==false)failures.push('Chemistry practical override should refuse Physics subject');
  const biologyGuard=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openBiologyPracticals());if(biologyGuard!==false)failures.push('Biology practical override should refuse Physics subject');
}finally{await browser.close();}
if(errors.length)failures.push(`Page JavaScript errors: ${[...new Set(errors)].join(' | ')}`);
if(failures.length){console.error('Chemistry practical browser audit failed:');failures.forEach(f=>console.error(`- ${f}`));process.exit(1);}
console.log('Chemistry practical browser audit passed: 12-practical hub, titration, EMF, yield, TLC, completion persistence and subject-aware routing all work.');