import { chromium } from 'playwright';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const text=async id=>(await page.locator(id).innerText()).replace(/\s+/g,' ');
try{
 await page.goto(`${base}/subjects/biology-data-coach.html`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ALEVEL_BIOLOGY_DATA_COACH?.version==='phase-12');
 if(await page.locator('.skill-card').count()!==10)throw new Error('Expected 10 Biology data skills');
 await page.click('[data-view="calculators"]');
 await page.click('#magBtn'); {const mag=await text('#magResult'); if(!mag.includes('2.000e+3')&&!mag.includes('2000'))throw new Error(`Magnification calculation failed: ${mag}`)}
 await page.click('#pctBtn'); if(!(await text('#pctResult')).includes('30%'))throw new Error('Percentage change calculation failed');
 await page.click('#descBtn'); if(!(await text('#descResult')).includes('1.5811'))throw new Error('Sample standard deviation calculation failed');
 await page.click('#chiBtn'); if(!(await text('#chiResult')).includes('2.56'))throw new Error('Chi-squared calculation failed');
 await page.click('#simpsonBtn'); if(!(await text('#simpsonResult')).includes('3.5'))throw new Error('Simpson diversity calculation failed');
 await page.click('#hwBtn'); const hw=await text('#hwResult'); if(!hw.includes('q=0.4')||!hw.includes('p=0.6')||!hw.includes('48%'))throw new Error('Hardy-Weinberg calculation failed');
 await page.click('#spearBtn'); if(!(await text('#spearResult')).includes('0.9'))throw new Error('Spearman calculation failed');
 await page.click('[data-view="statistics"]');
 await page.selectOption('#testPurpose','fit'); await page.selectOption('#testData','frequency'); await page.click('#chooseTestBtn'); if(!(await text('#testAnswer')).includes('Chi-squared'))throw new Error('Statistical-test chooser failed');
 await page.click('[data-view="graphs"]'); await page.selectOption('#graphType','continuous'); await page.click('#graphRecommendBtn'); if(!(await text('#graphAnswer')).includes('Scatter graph'))throw new Error('Graph recommendation failed');
 await page.goto(`${base}/index.html?subject=biology`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CourseApp?.config?.id==='biology'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE?.openBiologyDataCoach);
 await page.waitForSelector('[data-course-tool="data-coach"]',{state:'attached'});
 const opened=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openBiologyDataCoach()); if(!opened)throw new Error('Biology Data Coach bridge refused Biology');
 await page.waitForFunction(()=>document.getElementById('toolFrame')?.src.includes('biology-data-coach.html'));
 await page.goto(`${base}/index.html?subject=chemistry`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CourseApp?.config?.id==='chemistry'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE);
 await page.waitForTimeout(50);
 if(await page.locator('[data-course-tool="data-coach"]').count())throw new Error('Biology Data Coach card leaked into Chemistry');
 const refused=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openBiologyDataCoach()); if(refused)throw new Error('Biology Data Coach bridge opened from Chemistry');
 if(errors.length)throw new Error(`Page errors: ${errors.join(' | ')}`);
 console.log('Biology Data Coach browser audit passed: calculations, test selection, graphs and Biology-only routing work.');
} finally {await browser.close()}
