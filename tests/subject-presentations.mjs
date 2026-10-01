import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
const page=await context.newPage();
const failures=[];

async function checkSubject({subject,topic,section,expectedTitle}){
  await page.goto(`${base}/subjects/topic-shell.html?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&section=${encodeURIComponent(section)}`,{waitUntil:'domcontentloaded',timeout:45000});
  const heading=await page.locator('#sectionTitle').innerText().catch(()=> '');
  if(!heading.includes(expectedTitle)) failures.push(`${subject}: wrong section loaded (${heading})`);

  const present=page.locator('#presentLessonBtn');
  if(!await present.count()){failures.push(`${subject}: Present lesson button missing`);return;}
  await present.click();
  const shell=page.locator('.subject-presentation-shell:not([hidden])');
  await shell.waitFor({state:'visible',timeout:8000}).catch(()=>failures.push(`${subject}: presentation did not open`));
  if(!await shell.count())return;

  const countText=await shell.locator('[data-subject-count]').innerText().catch(()=> '');
  const match=countText.match(/Slide\s+(\d+)\s*\/\s*(\d+)/i);
  if(!match) failures.push(`${subject}: slide counter missing (${countText})`);
  else if(Number(match[2])!==12) failures.push(`${subject}: expected 12 slides, found ${match[2]}`);

  const title=await shell.locator('[data-subject-title]').innerText().catch(()=> '');
  if(!title.includes(expectedTitle)) failures.push(`${subject}: presentation title mismatch (${title})`);

  const next=shell.locator('[data-subject-next]');
  if(!await next.count()) failures.push(`${subject}: Next control missing`);
  else{
    await next.click();
    await page.waitForTimeout(100);
    const after=await shell.locator('[data-subject-count]').innerText().catch(()=> '');
    if(!/Slide\s+2\s*\//i.test(after)) failures.push(`${subject}: Next did not advance (${after})`);
  }

  const prev=shell.locator('[data-subject-prev]');
  if(!await prev.count()) failures.push(`${subject}: Previous control missing`);
  else{
    await prev.click();
    await page.waitForTimeout(100);
    const after=await shell.locator('[data-subject-count]').innerText().catch(()=> '');
    if(!/Slide\s+1\s*\//i.test(after)) failures.push(`${subject}: Previous did not return to slide 1 (${after})`);
  }

  const restart=shell.locator('[data-subject-restart]');
  const fullscreen=shell.locator('[data-subject-fullscreen]');
  const copy=shell.locator('[data-subject-copy]');
  const notes=shell.locator('[data-subject-notes]');
  if(!await restart.count()) failures.push(`${subject}: Restart control missing`);
  if(!await fullscreen.count()) failures.push(`${subject}: Full screen control missing`);
  if(!await copy.count()) failures.push(`${subject}: Copy slides control missing`);
  if(!await notes.count()) failures.push(`${subject}: Teacher notes control missing`);

  await shell.locator('[data-subject-close]').click();
  await page.waitForTimeout(80);
  if(await page.locator('.subject-presentation-shell:not([hidden])').count()) failures.push(`${subject}: Lesson notes/close control did not leave presentation mode`);
}

try{
  await checkSubject({subject:'biology',topic:'bio-molecules',section:'3.1.1',expectedTitle:'Monomers and polymers'});
  await checkSubject({subject:'chemistry',topic:'chem-physical',section:'3.1.1',expectedTitle:'Atomic structure'});
} finally {
  await browser.close();
}

if(failures.length){
  console.error('Biology/Chemistry presentation audit failed:');
  failures.forEach(item=>console.error(`- ${item}`));
  process.exit(1);
}
console.log('Biology/Chemistry presentation audit passed: both subjects open 12-slide Physics-style presentations with working navigation and presenter controls.');
