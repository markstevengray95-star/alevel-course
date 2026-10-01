import { chromium } from 'playwright';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`${base}/index.html?subject=physics`,{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{
  localStorage.clear();
  localStorage.setItem('alevel-course-progress-v1',JSON.stringify({measurements:true,particles:true,waves:true,'mechanics-materials':true}));
  localStorage.setItem('alevel-biology-progress-v1',JSON.stringify({'bio-molecules':true,'bio-cells':true,'bio-exchange':true,'bio-genetic-info':true}));
  localStorage.setItem('alevel-chemistry-progress-v1',JSON.stringify({'chem-physical':true,'chem-inorganic':true}));
  localStorage.setItem('alevel-biology-required-practicals-v1',JSON.stringify([1,2,3,4,5,6]));
  localStorage.setItem('alevel-chemistry-required-practicals-v1',JSON.stringify([1,2,3,4]));
  localStorage.setItem('alevel-biology-data-coach-v1',JSON.stringify({skills:['magnification','percentage','uncertainty'],practice:2}));
  localStorage.setItem('alevel-chemistry-calculation-coach-v1',JSON.stringify({skills:['moles','particles','solutions','gas'],practice:2}));
  localStorage.setItem('alevel-biology-astar-hub-v1',JSON.stringify({attempts:{'3.1.1':{}},master:0}));
  localStorage.setItem('alevel-chemistry-astar-hub-v1',JSON.stringify({attempts:{'3.1.1':{}},master:0}));
  localStorage.setItem('alevel-biology-assessment-history-v1',JSON.stringify([{id:1,date:'2026-10-01T09:00:00Z',subject:'biology',mode:'quick',score:1,total:3,pct:33,answers:[{id:'bio-secret',ref:'3.2.3',topic:'3.2',ao:'AO2',marks:3,score:1,answer:'SECRET-ANSWER-TEXT should never leave this browser'}]}]));
  localStorage.setItem('alevel-chemistry-assessment-history-v1',JSON.stringify([{id:2,date:'2026-10-01T10:00:00Z',subject:'chemistry',mode:'quick',score:2,total:3,pct:67,answers:[{id:'chem-1',ref:'3.1.2',topic:'3.1',ao:'AO1',marks:3,score:2,answer:'another private student response'}]}]));
 });
 let supabaseRequests=0;const countReq=r=>{if(r.url().includes('supabase.co'))supabaseRequests++};page.on('request',countReq);
 await page.goto(`${base}/subjects/progress-mastery.html?from=physics`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ALEVEL_CLASS_SYNC?.version==='phase-16'&&window.ALEVEL_PROGRESS_MASTERY?.collect);
 await page.waitForTimeout(650);
 const snapshot=await page.evaluate(()=>window.ALEVEL_CLASS_SYNC.buildSnapshot());
 const serial=JSON.stringify(snapshot);
 if(serial.includes('SECRET-ANSWER-TEXT')||serial.includes('another private student response'))throw new Error('Sanitised class snapshot leaked written student answers');
 if(!Array.isArray(snapshot.misconceptions)||snapshot.misconceptions.length<2)throw new Error('Misconception summary was not generated');
 if(!Array.isArray(snapshot.ao)||snapshot.ao.length!==3)throw new Error('AO summary missing from class snapshot');
 if(!snapshot.subjects?.physics||!snapshot.subjects?.biology||!snapshot.subjects?.chemistry)throw new Error('Three-subject snapshot missing');
 const syncStatus=(await page.locator('#classSyncStatus').innerText()).trim();if(!/sign in to sync/i.test(syncStatus))throw new Error(`Signed-out sync state incorrect: ${syncStatus}`);
 if(supabaseRequests!==0)throw new Error(`Signed-out progress dashboard made ${supabaseRequests} Supabase request(s)`);
 page.off('request',countReq);

 await page.goto(`${base}/subjects/teacher-analytics.html?fixture=1&from=biology`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ALEVEL_TEACHER_ANALYTICS?.version==='phase-16');
 if((await page.locator('#joinCode').innerText()).trim()!=='ABC12345')throw new Error('Fixture class code not rendered');
 if(await page.locator('#summaryGrid .summary-card').count()!==4)throw new Error('Teacher summary cards missing');
 if(await page.locator('#studentRows tr').count()!==3)throw new Error('Expected three fixture students');
 if(await page.locator('#aoGrid .ao-card').count()!==3)throw new Error('Teacher AO profile missing');
 if(await page.locator('#hotspotList .hotspot').count()<1)throw new Error('Misconception hotspots missing');
 if(await page.locator('#interventionList .intervention').count()!==3)throw new Error('Intervention queue missing fixture students');
 const analytics=await page.evaluate(()=>window.ALEVEL_TEACHER_ANALYTICS.aggregate(window.ALEVEL_TEACHER_ANALYTICS.fixturePayload()));
 if(analytics.students.length!==3||analytics.synced.length!==2)throw new Error('Class aggregation did not separate synced students');
 if(!analytics.hotspots.length)throw new Error('Class hotspot aggregation failed');

 for(const subject of ['physics','biology','chemistry']){
  await page.goto(`${base}/index.html?subject=${subject}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(s=>window.CourseApp?.config?.id===s&&window.ALEVEL_SUBJECT_TOOL_BRIDGE?.openTeacherAnalytics,subject);
  if(!await page.locator('[data-course-tool="teacher-analytics"]').count())throw new Error(`Teacher Analytics card missing in ${subject}`);
  const opened=await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openTeacherAnalytics());if(!opened)throw new Error(`Teacher Analytics refused ${subject}`);
  await page.waitForFunction(s=>document.getElementById('toolFrame')?.src.includes(`teacher-analytics.html?from=${s}`),subject);
 }
 if(errors.length)throw new Error(`Page errors: ${errors.join(' | ')}`);
 console.log('Teacher Analytics browser audit passed: privacy-safe snapshots, fixture aggregation, interventions and three-subject routing work.');
} finally {await browser.close()}