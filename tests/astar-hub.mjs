import { chromium } from 'playwright';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const txt=async sel=>(await page.locator(sel).innerText()).replace(/\s+/g,' ');
try{
 await page.goto(`${base}/subjects/astar-hub.html?subject=biology`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ALEVEL_ASTAR_HUB?.version==='phase-14');
 if(await page.locator('.topic-card').count()!==39)throw new Error('Expected 39 Biology A* challenge sources');
 if(!(await txt('#brandTitle')).includes('Biology A* Hub'))throw new Error('Biology A* branding missing');
 await page.click('#randomBtn');
 if(await page.locator('.challenge-card').count()!==4)throw new Error('Biology synoptic challenge did not render four reasoning stages');
 await page.fill('#challengeResponse','This response selects a relevant biological mechanism, applies it to the unfamiliar context, links it to another topic, uses evidence and considers an assumption that could limit the conclusion. '.repeat(2));
 await page.click('#challengeCheck');if(!(await txt('#challengeFeedback')).includes('cross-topic'))throw new Error('Biology A* checklist missing synoptic criterion');
 await page.click('#challengeSave');
 const bioProgress=await page.evaluate(()=>window.ALEVEL_ASTAR_HUB.progress());if(!Object.keys(bioProgress.attempts||{}).length)throw new Error('Biology A* progress did not save');
 await page.click('[data-view="master"]');if(!(await txt('#masterTask')).includes('25-mark essay'))throw new Error('Biology Paper 3 essay mastery missing');

 await page.goto(`${base}/subjects/astar-hub.html?subject=chemistry`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ALEVEL_ASTAR_HUB?.version==='phase-14');
 if(await page.locator('.topic-card').count()!==34)throw new Error('Expected 34 Chemistry A* challenge sources');
 if(!(await txt('#brandTitle')).includes('Chemistry A* Hub'))throw new Error('Chemistry A* branding missing');
 await page.click('[data-view="evidence"]');if(!(await txt('#evidenceIntro')).includes('Evaluate'))throw new Error('Chemistry AO3 evidence mode missing');
 await page.click('[data-view="master"]');{const t=await txt('#masterTask');if(!t.includes('physical chemistry')||!t.includes('inorganic')||!t.includes('organic'))throw new Error('Chemistry Paper 3 synoptic branches missing')}
 await page.fill('#masterResponse','Use physical chemistry to quantify the system, inorganic chemistry to interpret catalyst evidence and organic chemistry to identify the product. Evaluate practical evidence, assumptions and uncertainty before reaching a justified conclusion. '.repeat(2));
 await page.click('#masterCheck');if(!(await txt('#masterFeedback')).includes('physical, inorganic and organic'))throw new Error('Chemistry mastery checklist missing synoptic criterion');

 await page.goto(`${base}/index.html?subject=biology`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CourseApp?.config?.id==='biology'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE?.openBiologyAstarHub);
 await page.waitForSelector('[data-course-tool="astar-hub"]',{state:'attached'});
 const bioOpen=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openBiologyAstarHub());if(!bioOpen)throw new Error('Biology A* bridge refused Biology');
 await page.waitForFunction(()=>document.getElementById('toolFrame')?.src.includes('astar-hub.html?subject=biology'));

 await page.goto(`${base}/index.html?subject=chemistry`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CourseApp?.config?.id==='chemistry'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE?.openChemistryAstarHub);
 await page.waitForSelector('[data-course-tool="astar-hub"]',{state:'attached'});
 const chemOpen=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openChemistryAstarHub());if(!chemOpen)throw new Error('Chemistry A* bridge refused Chemistry');
 await page.waitForFunction(()=>document.getElementById('toolFrame')?.src.includes('astar-hub.html?subject=chemistry'));

 await page.goto(`${base}/index.html?subject=physics`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CourseApp?.config?.id==='physics'&&window.ALEVEL_SUBJECT_TOOL_BRIDGE);
 await page.waitForTimeout(50);if(await page.locator('[data-course-tool="astar-hub"]').count())throw new Error('Biology/Chemistry A* hub card leaked into Physics');
 if(errors.length)throw new Error(`Page errors: ${errors.join(' | ')}`);
 console.log('Phase 14 A* Hub browser audit passed: full Biology/Chemistry coverage, challenge modes, Paper 3 mastery, progress and routing work.');
} finally {await browser.close()}