import { installAuditAccount } from './audit-account.mjs';
import { chromium } from 'playwright';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1365,height:900},serviceWorkers:'block'});
await installAuditAccount(context, base);
const page=await context.newPage();
const failures=[];
const fail=message=>failures.push(message);

async function selectUsefulText(target){
  await target.scrollIntoViewIfNeeded().catch(()=>{});
  return target.evaluate(el=>{
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.textContent.trim().length>28?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;}});
    const node=walker.nextNode();
    if(!node)return '';
    const text=node.textContent.trim();
    const range=document.createRange();
    range.setStart(node,0);
    range.setEnd(node,Math.min(node.textContent.length,Math.max(30,Math.min(180,node.textContent.length))));
    const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
    (node.parentElement||el).dispatchEvent(new MouseEvent('mouseup',{bubbles:true,clientX:120,clientY:120}));
    return text;
  }).catch(()=> '');
}

await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:45000});
await page.waitForFunction(()=>window.CourseTextbook?.data&&window.CourseLessonEnrichment,{timeout:7000}).catch(()=>fail('enrichment: course textbook/enrichment bridge did not bootstrap'));

await page.locator('.topic-card[data-id="electricity"]').click();
await page.waitForTimeout(700);
let frame=page.frames().find(item=>item!==page.mainFrame()&&item.url().includes('/topics/05-electricity/'));
if(!frame)fail('enrichment: Electricity iframe did not load');
else{
  await frame.waitForSelector('.uc-lesson-essentials[data-ready="true"]',{timeout:5000}).catch(()=>fail('enrichment: Lesson Essentials did not render'));
  await frame.waitForFunction(()=>document.documentElement.classList.contains('uc-lesson-visuals-ready'),null,{timeout:5000}).catch(()=>fail('enrichment: rich lesson presentation visuals did not initialise'));
  if(!(await frame.locator('.uc-essential-intro p').innerText().catch(()=>'')))fail('enrichment: lesson summary is missing');
  if(await frame.locator('.uc-essential-section li').count()<1)fail('enrichment: lesson key ideas are missing');
  if(await frame.locator('.uc-essential-equation').count()<1)fail('enrichment: lesson equations are missing');
  if(!(await frame.locator('.uc-essential-textbook').isVisible().catch(()=>false)))fail('enrichment: full textbook chapter link is missing');

  if(await frame.locator('.uc-slide-enrichment .uc-lesson-visual svg').count()<1)fail('visuals: lesson does not contain a topic-matched physics diagram');
  if(await frame.locator('.uc-visual-guide b').count()<2)fail('visuals: diagram does not explain what students should notice');
  if(await frame.locator('.uc-term-item').count()<2)fail('visuals: lesson key terminology detail is missing');
  if(await frame.locator('.uc-misconception').count()<2)fail('teaching: common misconception corrections are missing');
  if(await frame.locator('.uc-misconception p').first().innerText().catch(()=>'' )==='')fail('teaching: misconception correction has no explanation');
  if(await frame.locator('.uc-concept-node').count()<4)fail('teaching: concept-connection chain is missing or too shallow');
  if(await frame.locator('.uc-equation-card').count()<1)fail('visuals: equation meaning cards are missing');
  if(await frame.locator('.uc-equation-card p').count()<1)fail('teaching: equation cards do not explain when to use the relationship');
  if(await frame.locator('.uc-equation-card em').count()<1)fail('teaching: equation cards do not include a calculation/model check');
  if(await frame.locator('.uc-worked-step').count()<1)fail('visuals: worked-example reasoning flow is missing');
  if(await frame.locator('.uc-sense-check').count()<1)fail('teaching: worked example does not include an answer sense-check');
  if(await frame.locator('.uc-application-card').count()<1)fail('teaching: application/stretch task is missing');
  if(await frame.locator('.uc-hinge-card').count()<1)fail('teaching: diagnostic hinge question is missing');
  if(await frame.locator('.uc-exam-focus').count()<1)fail('visuals: AQA exam-focus panel is missing');
  if(await frame.locator('.uc-command-guide>div').count()<1)fail('teaching: exam command-word guidance is missing');

  const term=frame.locator('.uc-term-item').first();
  if(await term.count()){
    await term.locator('summary').click().catch(()=>{});
    const detail=await term.locator('p').innerText().catch(()=> '');
    if(detail.length<12)fail('visuals: terminology card does not reveal useful detail');
  }

  const hinge=frame.locator('.uc-hinge-card details').first();
  if(await hinge.count()){
    await hinge.locator('summary').click().catch(()=>{});
    const correction=await hinge.locator('p').innerText().catch(()=> '');
    if(correction.length<20)fail('teaching: diagnostic hinge reveal does not contain a useful physics correction');
  }

  const simulationStage=frame.locator('.lesson-stage[data-stage="simulation"],.lesson-stage[data-stage="sim"]');
  if(await simulationStage.count()&&await frame.locator('.uc-simulation-cycle').count()<1)fail('teaching: simulation slide is missing Predict → Observe → Explain prompts');

  const courseLayout=frame.locator('.course-layout').first();
  if(await courseLayout.count()){
    const columns=await courseLayout.evaluate(el=>getComputedStyle(el).gridTemplateColumns).catch(()=> '');
    if(columns&&columns.trim().split(/\s+/).length>1)fail(`layout: embedded lesson still uses a multi-column sidebar layout (${columns})`);
  }

  let selectable=frame.locator('.lesson-panel p,.lesson-panel li,.uc-essential-intro p,.uc-essential-section li span').filter({visible:true}).first();
  if(!(await selectable.count()))selectable=frame.locator('.uc-essential-intro p').first();
  const selected=await selectUsefulText(selectable);
  if(!selected)fail('notebook: could not create a lesson text selection');
  await frame.waitForSelector('.uc-selection-save:not([hidden])',{timeout:2500}).catch(()=>fail('notebook: highlight-to-save action did not appear in the lesson'));
  const before=await page.evaluate(()=>window.CourseNotebook?.getNotes?.().length||0);
  if(await frame.locator('.uc-selection-save:not([hidden])').isVisible().catch(()=>false))await frame.locator('.uc-selection-save:not([hidden])').click({timeout:4000});
  await page.waitForTimeout(120);
  const after=await page.evaluate(()=>window.CourseNotebook?.getNotes?.().length||0);
  if(after!==before+1)fail(`notebook: highlighted lesson text did not save (${before} → ${after})`);

  await frame.locator('.uc-textbook-button').click();
  await page.waitForFunction(()=>{const w=document.getElementById('textbookWorkspace');return !!w&&!w.hidden&&document.querySelector('.textbook-section p');},null,{timeout:5000}).catch(()=>fail('textbook: reader did not open from lesson'));
  const paragraph=page.locator('.textbook-section p').first();
  await paragraph.scrollIntoViewIfNeeded().catch(()=>{});
  const textbookSelected=await selectUsefulText(paragraph);
  if(!textbookSelected)fail('notebook: could not create a textbook text selection');
  await page.locator('#textbookSelectionSave:not([hidden])').waitFor({state:'visible',timeout:2500}).catch(()=>fail('notebook: highlight-to-save action did not appear in textbook'));
  const beforeTextbook=await page.evaluate(()=>window.CourseNotebook?.getNotes?.().length||0);
  if(await page.locator('#textbookSelectionSave:not([hidden])').isVisible().catch(()=>false))await page.locator('#textbookSelectionSave:not([hidden])').click({timeout:4000});
  await page.waitForTimeout(120);
  const afterTextbook=await page.evaluate(()=>window.CourseNotebook?.getNotes?.().length||0);
  if(afterTextbook!==beforeTextbook+1)fail(`notebook: highlighted textbook text did not save (${beforeTextbook} → ${afterTextbook})`);

  await page.locator('#textbookBack').click().catch(()=>{});
}

await page.setViewportSize({width:390,height:844});
await page.waitForTimeout(120);
frame=page.frames().find(item=>item!==page.mainFrame()&&item.url().includes('/topics/05-electricity/'));
if(frame){
  const dims=await frame.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth})).catch(()=>({scrollWidth:999,clientWidth:0}));
  if(dims.scrollWidth>dims.clientWidth+12)fail(`layout: enriched mobile lesson overflows horizontally (${dims.scrollWidth}px > ${dims.clientWidth}px)`);
  const visualWidth=await frame.locator('.uc-slide-enrichment .uc-lesson-visual').first().evaluate(el=>el.getBoundingClientRect().width).catch(()=>0);
  if(visualWidth>390)fail(`layout: lesson visual is wider than mobile viewport (${visualWidth}px)`);
  const cards=await frame.locator('.uc-misconception,.uc-application-body>*,.uc-command-guide>div,.uc-concept-node,.uc-hinge-body>*,.uc-poe-grid>div').evaluateAll(nodes=>nodes.map(el=>el.getBoundingClientRect().right)).catch(()=>[]);
  if(cards.some(right=>right>402))fail('layout: new teaching-detail cards overflow the mobile viewport');
}

await browser.close();
if(failures.length){console.error(`\nLESSON ENRICHMENT FAILED (${failures.length})`);failures.forEach(item=>console.error(' -',item));process.exit(1);}
console.log('PASS: lessons use presentation-style navigation with contextual diagrams, concept chains, what-to-notice guidance, terminology, misconception correction, diagnostic hinge questions, equation-use coaching, worked methods with sense checks, application/stretch tasks, simulation reasoning prompts, AQA command-word support and highlight-to-notebook saving.');
