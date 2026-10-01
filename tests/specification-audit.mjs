import { installAuditAccount } from './audit-account.mjs';
import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
await installAuditAccount(context,base);
const page=await context.newPage();
page.setDefaultTimeout(9000);
const failures=[];

try{
  await page.goto(`${base}/subjects/specification-audit.html?from=physics`,{waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForFunction(()=>window.ALEVEL_SPECIFICATION_AUDIT?.status==='complete');
  const shape=await page.evaluate(()=>({
    status:window.ALEVEL_SPECIFICATION_AUDIT.status,
    totals:window.ALEVEL_SPECIFICATION_AUDIT.manifest.totals,
    summary:[...document.querySelectorAll('#summaryGrid .summary-card strong')].map(x=>x.textContent.trim()),
    options:[...document.querySelectorAll('#optionGrid .option b')].map(x=>x.textContent.trim()),
    sources:[...document.querySelectorAll('#sourceLinks a')].map(a=>a.href),
    overall:document.querySelector('#overallStatus')?.textContent.trim()
  }));
  if(shape.status!=='complete'||shape.overall!=='COMPLETE')failures.push('specification audit did not render complete status');
  for(const expected of ['8/8','5/5','39/39','34/34','36/36'])if(!shape.summary.includes(expected))failures.push(`summary missing ${expected}`);
  if(JSON.stringify(shape.options)!==JSON.stringify(['3.9','3.10','3.11','3.12','3.13']))failures.push(`Physics options incorrect: ${shape.options.join(', ')}`);
  if(shape.sources.length!==3||shape.sources.some(url=>!url.startsWith('https://www.aqa.org.uk/')))failures.push('official source links are incomplete or not AQA URLs');

  for(const subject of ['physics','biology','chemistry']){
    const url=subject==='physics'?`${base}/`:`${base}/?subject=${subject}`;
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:15000});
    await page.waitForFunction(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE?.openSpecificationAudit&&window.CourseApp?.config?.id);
    const actual=await page.evaluate(()=>window.CourseApp.config.id);
    if(actual!==subject){failures.push(`expected ${subject} shell, found ${actual}`);continue;}
    await page.evaluate(()=>window.ALEVEL_SUBJECT_TOOL_BRIDGE.openSpecificationAudit());
    await page.locator('#toolWorkspace').waitFor({state:'visible'});
    const src=await page.locator('#toolFrame').getAttribute('src');
    const title=await page.locator('#toolTitle').innerText();
    if(!src?.includes(`subjects/specification-audit.html?from=${subject}`))failures.push(`${subject}: audit tool routed to ${src}`);
    if(!/AQA Specification Audit/i.test(title))failures.push(`${subject}: audit tool title was ${title}`);
  }
} finally {
  await browser.close();
}

if(failures.length){console.error(`\nSPECIFICATION AUDIT BROWSER TEST FAILED (${failures.length})`);failures.forEach(x=>console.error(' -',x));process.exit(1);}
console.log('PASS: Phase 17 audit renders verified totals and opens from Physics, Biology and Chemistry.');
