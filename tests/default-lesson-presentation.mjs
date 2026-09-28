import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
const page=await context.newPage();
const failures=[];

try{
  await page.goto(base+'/#lesson=m01',{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.lesson-presentation-shell:not([hidden])').waitFor({state:'visible',timeout:12000}).catch(()=>failures.push('opening a lesson did not automatically launch the presentation'));

  const bodyClass=await page.locator('body').getAttribute('class').catch(()=>null);
  if(!String(bodyClass||'').includes('lesson-presentation-primary')) failures.push('presentation was not marked as the primary lesson view');

  const shell=page.locator('.lesson-presentation-shell:not([hidden])');
  if(await shell.count()){
    const kicker=await shell.locator('.phase3-deck-side .phase3-kicker').innerText().catch(()=> '');
    if(!/lesson presentation/i.test(kicker)) failures.push(`presentation heading is not lesson-facing (${kicker})`);

    const title=await shell.locator('[data-deep-title]').innerText().catch(()=> '');
    if(!/SI base units/i.test(title)) failures.push(`wrong lesson presentation opened (${title})`);

    const countText=await shell.locator('[data-deep-count]').innerText().catch(()=> '');
    const match=countText.match(/Slide\s+(\d+)\s*\/\s*(\d+)/i);
    if(!match) failures.push(`slide counter missing (${countText})`);
    else if(Number(match[2])<12) failures.push(`presentation has too few slides (${match[2]})`);

    const visibleSlides=await shell.locator('.deep-slide:visible').count();
    if(visibleSlides!==1) failures.push(`expected one visible presentation slide, found ${visibleSlides}`);

    const next=shell.locator('[data-deep-next]');
    if(!await next.count()) failures.push('Next slide control is missing');
    else{
      await next.click();
      await page.waitForTimeout(120);
      const after=await shell.locator('[data-deep-count]').innerText();
      if(!/Slide\s+2\s*\//i.test(after)) failures.push(`Next did not advance to slide 2 (${after})`);
    }

    const prev=shell.locator('[data-deep-prev]');
    if(!await prev.count()) failures.push('Previous slide control is missing');
    else{
      await prev.click();
      await page.waitForTimeout(120);
      const after=await shell.locator('[data-deep-count]').innerText();
      if(!/Slide\s+1\s*\//i.test(after)) failures.push(`Previous did not return to slide 1 (${after})`);
    }

    const notes=shell.locator('.phase3-deck-tools [data-deep-close]');
    const notesLabel=await notes.innerText().catch(()=> '');
    if(!/lesson notes/i.test(notesLabel)) failures.push(`secondary reader control is not labelled Lesson notes (${notesLabel})`);
    else{
      await notes.click();
      await page.waitForTimeout(160);
      if(await page.locator('.lesson-presentation-shell:not([hidden])').count()) failures.push('Lesson notes did not close the presentation');
      if(!await page.locator('.lesson-reader-shell:not([hidden])').count()) failures.push('Lesson notes view was not available after leaving the presentation');
    }
  }
} finally {
  await browser.close();
}

if(failures.length){
  console.error('Default lesson presentation audit failed:');
  failures.forEach(item=>console.error(`- ${item}`));
  process.exit(1);
}
console.log('Default lesson presentation audit passed: lesson opens as slides first, navigation works, and lesson notes remain available as a secondary view.');
