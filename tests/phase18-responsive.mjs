import { installAuditAccount } from './audit-account.mjs';
import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const failures=[];
const routes=[
  '/',
  '/?subject=biology',
  '/?subject=chemistry',
  '/subjects/topic-shell.html?subject=biology&topic=bio-cells&section=3.2.3',
  '/subjects/topic-shell.html?subject=chemistry&topic=chem-physical&section=3.1.2',
  '/subjects/biology-practicals.html',
  '/subjects/chemistry-practicals.html',
  '/subjects/assessment-hub.html?subject=biology',
  '/subjects/assessment-hub.html?subject=chemistry',
  '/subjects/biology-data-coach.html',
  '/subjects/chemistry-calculation-coach.html',
  '/subjects/astar-hub.html?subject=biology',
  '/subjects/astar-hub.html?subject=chemistry',
  '/subjects/progress-mastery.html?from=physics',
  '/subjects/teacher-analytics.html?from=physics',
  '/subjects/specification-audit.html?from=physics'
];
const profiles=[
  {name:'phone',viewport:{width:390,height:844},isMobile:true,hasTouch:true},
  {name:'tablet',viewport:{width:768,height:1024},isMobile:true,hasTouch:true},
  {name:'desktop',viewport:{width:1440,height:1000},isMobile:false,hasTouch:false}
];

function unique(items){return [...new Set(items)];}
function localRoute(url){try{return new URL(url).origin===new URL(base).origin}catch{return false}}

async function layout(page){
  return page.evaluate(()=>{
    const root=document.documentElement;
    const body=document.body;
    const vw=root.clientWidth;
    const visible=el=>{const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&el.getClientRects().length>0;};
    const key=[...document.querySelectorAll('header,nav,main,.topbar,.tool-bar,.hero,.panel,.course-home,.workspace-section,.mobile-study-dock')]
      .filter(visible).map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName.toLowerCase(),id:el.id||'',cls:typeof el.className==='string'?el.className.slice(0,80):'',left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)};})
      .filter(x=>x.right>vw+5||x.left<-5||x.width>vw+5).slice(0,12);
    return {vw,doc:root.scrollWidth,body:body.scrollWidth,key};
  });
}

const browser=await chromium.launch({headless:true});
for(const profile of profiles){
  const context=await browser.newContext({viewport:profile.viewport,isMobile:profile.isMobile,hasTouch:profile.hasTouch,serviceWorkers:'block'});
  await installAuditAccount(context,base);
  for(const route of routes){
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
    page.on('response',response=>{if(localRoute(response.url())&&response.status()>=400)errors.push(`HTTP ${response.status()}: ${response.url()}`);});
    try{
      const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
      if(!response||response.status()>=400)errors.push(`navigation status: ${response?.status()??'no response'}`);
      await page.waitForTimeout(profile.name==='desktop'?350:550);
      const text=(await page.locator('body').innerText().catch(()=>'' )).replace(/\s+/g,' ').trim();
      if(text.length<30)errors.push('too little visible content');
      const meta=await page.locator('meta[name="viewport"]').getAttribute('content').catch(()=>null);
      if(!meta||!/width=device-width/i.test(meta))errors.push('missing responsive viewport meta');
      const dims=await layout(page);
      if(dims.doc>dims.vw+6||dims.body>dims.vw+6)errors.push(`horizontal document overflow ${Math.max(dims.doc,dims.body)}px > ${dims.vw}px`);
      if(dims.key.length)errors.push(`key UI outside viewport: ${JSON.stringify(dims.key.slice(0,4))}`);
    }catch(error){errors.push(`navigation exception: ${error.message}`);}
    if(errors.length)failures.push(`${profile.name} ${route}: ${unique(errors).join(' | ')}`);
    console.log(`${errors.length?'FAIL':'PASS'} ${profile.name} ${route}`);
    await page.close();
  }

  if(profile.name!=='desktop'){
    for(const subject of ['physics','biology','chemistry']){
      const page=await context.newPage();
      const route=subject==='physics'?'/' : `/?subject=${subject}`;
      try{
        await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForTimeout(650);
        const mobileOn=await page.locator('body').evaluate(el=>el.classList.contains('mobile-ui'));
        if(!mobileOn)failures.push(`${profile.name} ${subject}: automatic mobile mode was not enabled`);
        const cards=page.locator('.topic-card');
        if(await cards.count()<1)failures.push(`${profile.name} ${subject}: no topic cards available`);
        else{
          await cards.first().click();
          await page.waitForTimeout(700);
          if(!(await page.locator('#workspaceSection').isVisible().catch(()=>false)))failures.push(`${profile.name} ${subject}: topic workspace did not open`);
          if(!(await page.locator('#mobileStudyDock').isVisible().catch(()=>false)))failures.push(`${profile.name} ${subject}: mobile study dock is not visible in a topic`);
          if(!(await page.locator('#quickCourseSelect').isVisible().catch(()=>false)))failures.push(`${profile.name} ${subject}: topic picker is not visible`);
          const shellDims=await layout(page);
          if(shellDims.doc>shellDims.vw+6)failures.push(`${profile.name} ${subject}: focused shell overflow ${shellDims.doc}px > ${shellDims.vw}px`);
          const frame=page.frames().find(f=>f!==page.mainFrame()&&(f.url().includes('/topics/')||f.url().includes('/subjects/topic-shell')));
          if(!frame)failures.push(`${profile.name} ${subject}: embedded topic frame unavailable`);
          else{
            await frame.waitForLoadState('domcontentloaded',{timeout:4000}).catch(()=>{});
            const fd=await frame.evaluate(()=>({vw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth})).catch(()=>null);
            if(!fd)failures.push(`${profile.name} ${subject}: embedded frame layout unavailable`);
            else if(fd.sw>fd.vw+10)failures.push(`${profile.name} ${subject}: embedded frame overflow ${fd.sw}px > ${fd.vw}px`);
          }
        }
      }catch(error){failures.push(`${profile.name} ${subject}: shell interaction exception ${error.message}`);}
      await page.close();
    }
  }

  const toolPage=await context.newPage();
  try{
    await toolPage.goto(base+'/',{waitUntil:'domcontentloaded',timeout:30000});
    await toolPage.waitForTimeout(900);
    const toolCard=toolPage.locator('[data-course-tool="progress-mastery"]').last();
    await toolCard.waitFor({state:'visible',timeout:4000});
    await toolCard.click();
    await toolPage.locator('#toolWorkspace').waitFor({state:'visible',timeout:4000});
    const bar=toolPage.locator('.tool-bar');
    const barBox=await bar.boundingBox();
    if(!barBox)failures.push(`${profile.name} tool workspace: toolbar missing`);
    else if(barBox.x<-3||barBox.x+barBox.width>profile.viewport.width+3)failures.push(`${profile.name} tool workspace: toolbar outside viewport`);
    const dims=await layout(toolPage);
    if(dims.doc>dims.vw+6)failures.push(`${profile.name} tool workspace: horizontal overflow ${dims.doc}px > ${dims.vw}px`);
    if(!(await toolPage.locator('#toolBack').isVisible().catch(()=>false)))failures.push(`${profile.name} tool workspace: course-home button missing`);
  }catch(error){failures.push(`${profile.name} tool workspace: ${error.message}`);}
  await toolPage.close();
  await context.close();
}
await browser.close();

if(failures.length){
  console.error(`\nPHASE 18 RESPONSIVE AUDIT FAILED (${failures.length})`);
  failures.forEach(item=>console.error(' -',item));
  process.exit(1);
}
console.log('\nPASS: phone, tablet and desktop layouts are contained; all subject shells, course tools and major dashboards render without horizontal overflow or runtime failures.');
