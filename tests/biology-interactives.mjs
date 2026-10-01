import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1360,height:900},serviceWorkers:'block'});
const failures=[];

async function open(topic,section,kind){
  await page.goto(`${base}/subjects/topic-shell.html?subject=biology&topic=${topic}&section=${section}`,{waitUntil:'domcontentloaded',timeout:45000});
  const host=page.locator('#biologyLessonContent [data-bio-interactive]');
  await host.waitFor({state:'visible',timeout:8000}).catch(()=>failures.push(`${section}: interactive did not render`));
  if(!await host.count())return null;
  const actual=await host.getAttribute('data-kind');
  if(actual!==kind)failures.push(`${section}: expected ${kind}, found ${actual}`);
  return host;
}

try{
  let host=await open('bio-cells','3.2.1','cell');
  if(host){
    const info=host.locator('[data-organelle-info]');
    await host.locator('[data-organelle="mitochondrion"]').click();
    const text=await info.innerText();
    if(!/ATP|respiration/i.test(text))failures.push('3.2.1: organelle explorer did not reveal mitochondrion function');
    const rotate=host.locator('[data-cell-rotate]');
    await rotate.fill('35');await rotate.dispatchEvent('input');
    const style=await host.locator('[data-cell]').getAttribute('style');
    if(!/35deg/.test(style||''))failures.push('3.2.1: cell rotation control did not update the model');
  }

  host=await open('bio-molecules','3.1.4','enzyme');
  if(host){
    const before=await host.locator('[data-enzyme-output]').innerText();
    const temp=host.locator('[data-enzyme-temp]');await temp.fill('65');await temp.dispatchEvent('input');
    const after=await host.locator('[data-enzyme-output]').innerText();
    if(before===after||!/denaturation|activity/i.test(after))failures.push('3.1.4: enzyme simulator did not respond to temperature');
  }

  host=await open('bio-cells','3.2.3','transport');
  if(host){
    const output=host.locator('[data-transport-output]');
    const before=await output.innerText();
    await host.locator('[data-mode]').selectOption({label:'active transport'});
    const after=await output.innerText();
    if(before===after||!/ATP/i.test(after))failures.push('3.2.3: membrane transport mode did not update');
  }

  host=await open('bio-populations','3.7.2','hardy');
  if(host){
    const q=host.locator('[data-q]');await q.fill('20');await q.dispatchEvent('input');
    const p=await host.locator('[data-hardy-p]').innerText();
    const check=await host.locator('[data-hardy-check]').innerText();
    if(p!=='0.80'||!/1\.000/.test(check))failures.push(`3.7.2: Hardy–Weinberg calculation incorrect (p=${p}, ${check})`);
  }

  host=await open('bio-gene-expression','3.8.4','geneTech');
  if(host){
    const cycles=host.locator('[data-cycles]');await cycles.fill('6');await cycles.dispatchEvent('input');
    await host.locator('[data-pcr]').click();
    const copies=await host.locator('[data-pcr-copies]').innerText();
    if(!/64/.test(copies))failures.push(`3.8.4: PCR model expected 64 copies after 6 ideal cycles, found ${copies}`);
    const fragment=host.locator('[data-fragment]');await fragment.fill('300');await fragment.dispatchEvent('input');await host.locator('[data-gel-run]').click();
    const message=await host.locator('[data-gene-message]').innerText();
    if(!/300 bp/.test(message))failures.push('3.8.4: electrophoresis control did not use selected fragment size');
  }
}finally{await browser.close();}

if(failures.length){
  console.error('Biology interactive browser audit failed:');
  failures.forEach(x=>console.error(`- ${x}`));
  process.exit(1);
}
console.log('Biology interactive browser audit passed: cell, enzyme, membrane transport, Hardy–Weinberg and gene-technology controls all respond correctly.');
