import { installAuditAccount } from './audit-account.mjs';
import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
await installAuditAccount(context, base);
const page = await context.newPage();
page.setDefaultTimeout(8000);

const failures=[];
const pageErrors=[];
page.on('pageerror',error=>pageErrors.push(String(error)));
page.on('console',message=>{
  if(message.type()==='error') pageErrors.push(`console: ${message.text()}`);
});
page.on('requestfailed',request=>{
  const url=request.url();
  if(url.startsWith(base)) pageErrors.push(`request failed: ${url} :: ${request.failure()?.errorText||'unknown'}`);
});

async function frameReady(label){
  const handle=await page.locator('#topicFrame').elementHandle({timeout:5000});
  const frame=await handle?.contentFrame();
  if(!frame)throw new Error(`${label}: topic iframe unavailable`);
  await frame.waitForLoadState('domcontentloaded',{timeout:6000});
  await frame.locator('html.uc-embedded-ready').waitFor({state:'attached',timeout:6000});
  const bodyText=(await frame.locator('body').innerText({timeout:4000})).trim();
  if(bodyText.length<20)throw new Error(`${label}: topic iframe rendered almost no content`);
  return frame;
}

try{
  console.log('Recovery audit: opening course home');
  await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:15000});
  await page.locator('#courseHome').waitFor({state:'visible',timeout:6000});
  await page.locator('.topic-card').first().waitFor({state:'visible',timeout:6000});
  const count=await page.locator('.topic-card').count();
  if(count!==8)failures.push(`expected 8 core topic cards, found ${count}`);

  for(let i=0;i<count;i++){
    const card=page.locator('.topic-card').nth(i);
    const cardTitle=clean(await card.locator('h3').innerText().catch(()=>`Topic ${i+1}`));
    console.log(`Recovery audit: opening ${i+1}/${count} ${cardTitle}`);
    try{
      await card.click({timeout:5000});
      await page.locator('#workspaceSection').waitFor({state:'visible',timeout:4000});
      await page.locator('.workspace-shell').waitFor({state:'visible',timeout:4000});
      await frameReady(cardTitle);
      await page.waitForFunction(()=>!document.querySelector('.workspace-shell')?.classList.contains('topic-loading'),null,{timeout:7000});
      console.log(`Recovery audit: loaded ${cardTitle}`);
    }catch(error){
      failures.push(`${cardTitle}: ${error.message}`);
      break;
    }

    try{
      await page.locator('#exitCourse').click({timeout:4000});
      await page.locator('#courseHome').waitFor({state:'visible',timeout:4000});
    }catch(error){
      failures.push(`${cardTitle}: could not return to course home: ${error.message}`);
      break;
    }
  }

  const seriousErrors=pageErrors.filter(text=>!/(favicon|ERR_ABORTED|ResizeObserver loop limit exceeded)/i.test(text));
  if(seriousErrors.length) failures.push(...seriousErrors.slice(0,12));
}finally{
  await browser.close();
}

function clean(value){return String(value||'').replace(/\s+/g,' ').trim();}

if(failures.length){
  console.error(`\nRUNTIME RECOVERY AUDIT FAILED (${failures.length})`);
  failures.forEach(failure=>console.error(' -',failure));
  process.exit(1);
}
console.log('\nPASS: course home and all eight core topics open, settle and return without freezing.');
