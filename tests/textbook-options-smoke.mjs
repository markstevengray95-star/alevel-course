import { installAuditAccount } from './audit-account.mjs';
import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
await installAuditAccount(context, base);
const page=await context.newPage();
page.setDefaultTimeout(8000);
const failures=[];

try{
  await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:15000});
  await page.waitForFunction(()=>window.CourseTextbook?.data&&Object.keys(window.CourseTextbook.data).length>=13,null,{timeout:8000});
  const shape=await page.evaluate(()=>({
    count:Object.keys(window.CourseTextbook.data).length,
    options:Object.entries(window.CourseTextbook.data).filter(([,topic])=>topic?.option).map(([id,topic])=>({id,title:topic.title,chapters:topic.chapters?.length||0}))
  }));
  if(shape.count!==13)failures.push(`expected 13 total textbook topics (8 core + 5 options), found ${shape.count}`);
  if(shape.options.length!==5)failures.push(`expected five Paper 3 option textbooks, found ${shape.options.length}`);
  for(const option of shape.options){if(option.chapters<3)failures.push(`${option.title}: expected a multi-chapter option textbook, found ${option.chapters}`);}

  await page.evaluate(()=>window.CourseTextbook.open('astrophysics'));
  await page.locator('#textbookWorkspace').waitFor({state:'visible'});

  for(const option of shape.options){
    await page.evaluate(id=>window.CourseTextbook.setTopic(id),option.id);
    for(let i=0;i<option.chapters;i++){
      await page.evaluate(index=>window.CourseTextbook.setChapter(index),i);
      const title=await page.locator('#textbookArticle h1').innerText().catch(()=>`${option.title} chapter ${i+1}`);
      const diagramCount=await page.locator('#textbookArticle .textbook-diagram svg').count();
      const termCount=await page.locator('#textbookArticle .textbook-term-card').count();
      if(diagramCount<1)failures.push(`${option.title} / ${title}: missing chapter diagram`);
      if(termCount<4)failures.push(`${option.title} / ${title}: expected at least 4 glossary terms, found ${termCount}`);
    }
  }

  await page.evaluate(()=>window.CourseTextbook.setTopic('astrophysics'));
  const selectValue=await page.locator('#textbookTopicSelect').inputValue();
  if(selectValue!=='astrophysics')failures.push(`option selector did not remain on Astrophysics (${selectValue})`);
} finally {
  await browser.close();
}

if(failures.length){
  console.error(`\nPAPER 3 TEXTBOOK AUDIT FAILED (${failures.length})`);
  failures.forEach(item=>console.error(' -',item));
  process.exit(1);
}
console.log('PASS: all five Paper 3 option textbooks open with chapter navigation, diagrams and at least four glossary terms per chapter.');
