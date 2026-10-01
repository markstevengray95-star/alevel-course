import { chromium } from 'playwright';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const text=async id=>(await page.locator(id).innerText()).replace(/\s+/g,' ');
try{
 await page.goto(`${base}/subjects/chemistry-calculation-coach.html`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ALEVEL_CHEMISTRY_CALCULATION_COACH?.version==='phase-13');
 if(await page.locator('.skill-card').count()!==14)throw new Error('Expected 14 Chemistry calculation skills');
 await page.click('[data-view="core"]');
 await page.click('#molBtn'); if(!(await text('#molResult')).includes('0.1 mol'))throw new Error('Mole calculation failed');
 await page.click('#gasBtn'); {const v=await text('#gasResult');if(!v.includes('0.1')&&!v.includes('0.100'))throw new Error(`Gas calculation failed: ${v}`)}
 await page.click('#stBtn'); if(!(await text('#stResult')).includes('0.3 mol'))throw new Error('Stoichiometry calculation failed');
 await page.click('#empBtn'); if(!(await text('#empResult')).includes('1 : 1'))throw new Error('Empirical formula ratio failed');
 await page.click('#yieldBtn'); {const v=await text('#yieldResult');if(!v.includes('80%')||!v.includes('60%'))throw new Error('Yield/atom economy calculation failed')}
 await page.click('#titBtn'); if(!(await text('#titResult')).includes('0.125'))throw new Error('Titration calculation failed');
 await page.click('#uncBtn'); {const v=await text('#uncResult');if(!v.includes('0.15')||!v.includes('23.23'))throw new Error(`Titration uncertainty/concordance failed: ${v}`)}
 await page.click('[data-view="physical"]');
 await page.click('#enBtn'); {const v=await text('#enResult');if(!v.includes('2508')||!v.includes('-50.16')||!v.includes('-242')||!v.includes('-40.4'))throw new Error(`Energetics calculation failed: ${v}`)}
 await page.click('#rateBtn'); if(!(await text('#rateResult')).includes('k = 2'))throw new Error('Rate constant calculation failed');
 await page.click('#kcBtn'); if(!(await text('#eqResult')).includes('Kc = 10'))throw new Error('Kc calculation failed');
 await page.click('#kpBtn'); if(!(await text('#eqResult')).includes('Kp = 10'))throw new Error('Kp calculation failed');
 await page.click('#cellBtn'); if(!(await text('#cellResult')).includes('1.1 V'))throw new Error('Cell EMF calculation failed');
 await page.click('[data-view="acidbase"]');
 await page.click('#acidBtn'); if(!(await text('#acidResult')).includes('pH = 2'))throw new Error('Strong-acid pH failed');
 await page.selectOption('#acidMode','buffer'); await page.click('#acidBtn'); {const v=await text('#acidResult');if(!v.includes('4.7447'))throw new Error(`Buffer pH failed: ${v}`)}
 await page.goto(`${base}/index.html?subject=chemistry`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CourseApp?.config?.id==='chemistry'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE?.openChemistryCalculationCoach);
 await page.waitForSelector('[data-course-tool="calculation-coach"]',{state:'attached'});
 const opened=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openChemistryCalculationCoach());if(!opened)throw new Error('Chemistry Calculation Coach bridge refused Chemistry');
 await page.waitForFunction(()=>document.getElementById('toolFrame')?.src.includes('chemistry-calculation-coach.html'));
 await page.goto(`${base}/index.html?subject=biology`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CourseApp?.config?.id==='biology'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE);
 await page.waitForTimeout(50);
 if(await page.locator('[data-course-tool="calculation-coach"]').count())throw new Error('Chemistry Calculation Coach card leaked into Biology');
 const refused=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openChemistryCalculationCoach());if(refused)throw new Error('Chemistry Calculation Coach opened from Biology');
 if(errors.length)throw new Error(`Page errors: ${errors.join(' | ')}`);
 console.log('Chemistry Calculation Coach browser audit passed: calculations and Chemistry-only routing work.');
} finally {await browser.close()}