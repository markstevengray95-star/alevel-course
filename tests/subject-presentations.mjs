import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
const page=await context.newPage();
const failures=[];

async function checkSubject({subject,topic,section,expectedTitle,expectedSlides,biology=false}){
  await page.goto(`${base}/subjects/topic-shell.html?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&section=${encodeURIComponent(section)}`,{waitUntil:'domcontentloaded',timeout:45000});
  const heading=await page.locator('#sectionTitle').innerText().catch(()=> '');
  if(!heading.includes(expectedTitle)) failures.push(`${subject}: wrong section loaded (${heading})`);

  if(biology){
    const lesson=page.locator('#biologyLessonContent:not([hidden])');
    if(!await lesson.count()) failures.push(`${subject}: detailed Biology lesson notes did not render`);
    else{
      const text=await lesson.innerText();
      if(!/Detailed Biology lesson/i.test(text)) failures.push(`${subject}: detailed lesson heading missing`);
      if(!/AQA-style exam practice/i.test(text)) failures.push(`${subject}: exam-practice section missing`);
      if(!/Maths & data/i.test(text)) failures.push(`${subject}: maths/data section missing`);
    }
  }

  const present=page.locator('#presentLessonBtn');
  if(!await present.count()){failures.push(`${subject}: Present lesson button missing`);return;}
  await present.click();

  const shell=page.locator(biology?'.biology-presentation-shell:not([hidden])':'.subject-presentation-shell:not([hidden])');
  await shell.waitFor({state:'visible',timeout:8000}).catch(()=>failures.push(`${subject}: presentation did not open`));
  if(!await shell.count())return;

  const countSel=biology?'[data-bio-count]':'[data-subject-count]';
  const titleSel=biology?'[data-bio-title]':'[data-subject-title]';
  const nextSel=biology?'[data-bio-next]':'[data-subject-next]';
  const prevSel=biology?'[data-bio-prev]':'[data-subject-prev]';
  const restartSel=biology?'[data-bio-restart]':'[data-subject-restart]';
  const fullscreenSel=biology?'[data-bio-fullscreen]':'[data-subject-fullscreen]';
  const copySel=biology?'[data-bio-copy]':'[data-subject-copy]';
  const notesSel=biology?'[data-bio-notes]':'[data-subject-notes]';
  const closeSel=biology?'button[data-bio-close]':'button[data-subject-close]';

  const countText=await shell.locator(countSel).innerText().catch(()=> '');
  const match=countText.match(/Slide\s+(\d+)\s*\/\s*(\d+)/i);
  if(!match) failures.push(`${subject}: slide counter missing (${countText})`);
  else if(Number(match[2])!==expectedSlides) failures.push(`${subject}: expected ${expectedSlides} slides, found ${match[2]}`);

  const title=await shell.locator(titleSel).innerText().catch(()=> '');
  if(!title.includes(expectedTitle)) failures.push(`${subject}: presentation title mismatch (${title})`);

  const next=shell.locator(nextSel);
  if(!await next.count()) failures.push(`${subject}: Next control missing`);
  else{
    await next.click();
    await page.waitForTimeout(100);
    const after=await shell.locator(countSel).innerText().catch(()=> '');
    if(!/Slide\s+2\s*\//i.test(after)) failures.push(`${subject}: Next did not advance (${after})`);
  }

  const prev=shell.locator(prevSel);
  if(!await prev.count()) failures.push(`${subject}: Previous control missing`);
  else{
    await prev.click();
    await page.waitForTimeout(100);
    const after=await shell.locator(countSel).innerText().catch(()=> '');
    if(!/Slide\s+1\s*\//i.test(after)) failures.push(`${subject}: Previous did not return to slide 1 (${after})`);
  }

  if(!await shell.locator(restartSel).count()) failures.push(`${subject}: Restart control missing`);
  if(!await shell.locator(fullscreenSel).count()) failures.push(`${subject}: Full screen control missing`);
  if(!await shell.locator(copySel).count()) failures.push(`${subject}: Copy slides control missing`);
  if(!await shell.locator(notesSel).count()) failures.push(`${subject}: Teacher notes control missing`);

  await shell.locator(closeSel).click();
  await page.waitForTimeout(80);
  if(await page.locator(`${biology?'.biology-presentation-shell':'.subject-presentation-shell'}:not([hidden])`).count()) failures.push(`${subject}: Lesson notes/close control did not leave presentation mode`);
}

try{
  await checkSubject({subject:'biology',topic:'bio-molecules',section:'3.1.1',expectedTitle:'Monomers and polymers',expectedSlides:15,biology:true});
  await checkSubject({subject:'biology',topic:'bio-gene-expression',section:'3.8.4',expectedTitle:'Gene technologies allow the study and alteration of gene function',expectedSlides:15,biology:true});
  await checkSubject({subject:'chemistry',topic:'chem-physical',section:'3.1.1',expectedTitle:'Atomic structure',expectedSlides:12});
}finally{
  await browser.close();
}

if(failures.length){
  console.error('Biology/Chemistry presentation audit failed:');
  failures.forEach(item=>console.error(`- ${item}`));
  process.exit(1);
}
console.log('Biology/Chemistry presentation audit passed: Biology detailed 15-slide lessons and Chemistry 12-slide scaffold both render with working controls.');
