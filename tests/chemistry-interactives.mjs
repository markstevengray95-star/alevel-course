import { chromium } from 'playwright';
const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});
const failures=[];const pageErrors=[];page.on('pageerror',err=>pageErrors.push(err.message));
async function open(topic,section,title){
  await page.goto(`${base}/subjects/topic-shell.html?subject=chemistry&topic=${topic}&section=${section}`,{waitUntil:'domcontentloaded',timeout:45000});
  const h=await page.locator('#sectionTitle').innerText().catch(()=> '');if(!h.includes(title))failures.push(`${section}: wrong heading ${h}`);
  const int=page.locator('[data-chem-interactive]');await int.waitFor({state:'visible',timeout:8000}).catch(()=>failures.push(`${section}: interactive did not render${pageErrors.length?` (${pageErrors.at(-1)})`:''}`));if(!await int.count())return null;return int;
}
try{
  let int=await open('chem-physical','3.1.1','Atomic structure');
  if(int){await int.locator('[data-mass]').fill('14');await int.locator('[data-mass]').dispatchEvent('input');if(!/8n/.test(await int.locator('[data-neutrons]').innerText()))failures.push('3.1.1 mass-number control did not update neutrons');}

  int=await open('chem-physical','3.1.5','Kinetics');
  if(int){const r1=await int.locator('[data-rate]').innerText();await int.locator('[data-kt]').fill('650');await int.locator('[data-kt]').dispatchEvent('input');const r2=await int.locator('[data-rate]').innerText();if(r1===r2)failures.push('3.1.5 temperature did not change relative rate');await int.locator('[data-cat]').check();if(!await int.locator('[data-cat]').isChecked())failures.push('3.1.5 catalyst control failed');}

  int=await open('chem-physical','3.1.12','Acids and bases');
  if(int){await int.locator('[data-h]').fill('0.001');await int.locator('[data-ph-calc]').click();if(!/3\.00/.test(await int.locator('[data-ph-out]').innerText()))failures.push('3.1.12 pH calculation incorrect for 0.001 M H+');}

  int=await open('chem-inorganic','3.2.5','Transition metals');
  if(int){await int.locator('[data-ligand]').selectOption({label:'NH₃'});await int.locator('[data-complex-go]').click();if(!/ammine|NH₃/i.test(await int.locator('[data-complex-result]').innerText()))failures.push('3.2.5 ligand interaction did not update explanation');}

  int=await open('chem-organic','3.3.4','Alkenes');
  if(int){const step1=await int.locator('[data-mech-step]').innerText();await int.locator('[data-mech-next]').click();const step2=await int.locator('[data-mech-step]').innerText();if(step1===step2)failures.push('3.3.4 mechanism stepper did not advance');}

  int=await open('chem-organic','3.3.15','Nuclear magnetic resonance spectroscopy');
  if(int){await int.locator('[data-neighbours]').fill('3');await int.locator('[data-nmr-check]').click();if(!/4 peaks/.test(await int.locator('[data-nmr-out]').innerText()))failures.push('3.3.15 n+1 splitting did not calculate quartet');}

  int=await open('chem-organic','3.3.16','Chromatography');
  if(int){await int.locator('[data-front-r]').fill('80');await int.locator('[data-spot1-r]').fill('40');await int.locator('[data-front-r]').dispatchEvent('input');await int.locator('[data-spot1-r]').dispatchEvent('input');if(!/Rf₁ = 0\.50/.test(await int.locator('[data-rf]').innerText()))failures.push('3.3.16 Rf calculation incorrect');}
}finally{await browser.close();}
if(failures.length){console.error('Chemistry interactive browser audit failed:');failures.forEach(x=>console.error(`- ${x}`));if(pageErrors.length){console.error('Page errors:');pageErrors.forEach(x=>console.error(`- ${x}`));}process.exit(1);}console.log('Chemistry interactive browser audit passed: atomic structure, kinetics, acids/bases, transition metals, mechanisms, NMR and chromatography controls work.');
