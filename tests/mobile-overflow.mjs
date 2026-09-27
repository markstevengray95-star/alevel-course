import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const routes = [
  '/topics/03-waves/index.html',
  '/topics/04-mechanics-materials/mechanics/index.html',
  '/topics/05-electricity/index.html',
  '/topics/06-further-mechanics-thermal/index.html',
];

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});

for (const route of routes) {
  const page = await context.newPage();
  await page.goto(base + route,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const all = [...document.querySelectorAll('body *')];
    const offenders = all.map(el => {
      const r=el.getBoundingClientRect(), cs=getComputedStyle(el);
      return {
        tag:el.tagName.toLowerCase(),
        id:el.id||'',
        cls:typeof el.className==='string'?el.className.slice(0,100):'',
        left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),
        scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
        display:cs.display,position:cs.position,overflowX:cs.overflowX,
      };
    }).filter(x => x.display!=='none' && (x.right>vw+20 || x.width>vw+20 || x.scrollWidth>x.clientWidth+20))
      .sort((a,b)=>Math.max(b.right,b.width,b.scrollWidth)-Math.max(a.right,a.width,a.scrollWidth))
      .slice(0,12);
    return {vw,scrollWidth:document.documentElement.scrollWidth,offenders};
  });
  console.log(`\nOVERFLOW ${route}: document ${info.scrollWidth}px / viewport ${info.vw}px`);
  for (const x of info.offenders) console.log(JSON.stringify(x));
  await page.close();
}
await context.close();
await browser.close();
