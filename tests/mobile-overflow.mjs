import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const routes=[
  '/topics/01-measurements/index.html',
  '/topics/02-particles-radiation/index.html',
  '/topics/03-waves/index.html',
  '/topics/04-mechanics-materials/mechanics/index.html',
  '/topics/04-mechanics-materials/materials/index.html',
  '/topics/05-electricity/index.html',
  '/topics/06-further-mechanics-thermal/index.html',
  '/topics/07-fields/index.html',
  '/topics/08-nuclear/index.html'
];
const failures=[];
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});

for(const route of routes){
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400)errors.push(`HTTP ${response.status()}: ${response.url()}`);});
  try{
    const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});
    if(!response||response.status()>=400)errors.push(`navigation status: ${response?.status()??'no response'}`);
    await page.waitForTimeout(1100);
    const info=await page.evaluate(()=>{
      const root=document.documentElement,vw=root.clientWidth;
      const visible=el=>{const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&el.getClientRects().length>0;};
      const offenders=[...document.querySelectorAll('body *')].filter(visible).map(el=>{
        const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
        return {tag:el.tagName.toLowerCase(),id:el.id||'',cls:typeof el.className==='string'?el.className.slice(0,90):'',left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),overflowX:cs.overflowX};
      }).filter(x=>x.left<-12||x.right>vw+12||x.width>vw+12).slice(0,10);
      return {vw,scrollWidth:root.scrollWidth,bodyWidth:document.body.scrollWidth,offenders};
    });
    if(info.scrollWidth>info.vw+8||info.bodyWidth>info.vw+8){
      errors.push(`document overflow ${Math.max(info.scrollWidth,info.bodyWidth)}px > ${info.vw}px`);
      errors.push(`offenders ${JSON.stringify(info.offenders.slice(0,5))}`);
    }
  }catch(error){errors.push(`navigation exception: ${error.message}`);}
  console.log(`${errors.length?'FAIL':'PASS'} mobile ${route}`);
  if(errors.length)failures.push(`${route}: ${[...new Set(errors)].join(' | ')}`);
  await page.close();
}
await context.close();
await browser.close();

if(failures.length){
  console.error(`\nPHYSICS MOBILE OVERFLOW AUDIT FAILED (${failures.length})`);
  failures.forEach(item=>console.error(' -',item));
  process.exit(1);
}
console.log('\nPASS: all nine Physics topic modules fit a 390 px viewport without document-level horizontal overflow or runtime failures.');
