import { chromium } from 'playwright';

const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const failures = [];
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror', e => failures.push(`pageerror: ${e.message}`));
page.on('console', msg => { if(msg.type()==='error') failures.push(`console: ${msg.text()}`); });

try {
  const response = await page.goto(base+'/', {waitUntil:'domcontentloaded', timeout:30000});
  if(!response || response.status() >= 400) failures.push(`home navigation status ${response?.status()}`);
  await page.waitForFunction(() => window.ALEVEL_QUALITY_CONTROL?.report && window.ALEVEL_LESSONS?.length, null, {timeout:10000});

  const runtime = await page.evaluate(() => ({
    report: window.ALEVEL_QUALITY_CONTROL.report,
    lessons: window.ALEVEL_LESSONS.length,
    topics: window.CourseApp?.topics?.length || 0,
    apis: ['ALEVEL_PHASE3','ALEVEL_ACTIVITIES','ALEVEL_SIMULATIONS','ALEVEL_ASSESSMENT','ALEVEL_PROGRESSION','ALEVEL_TEACHER_TOOLS','ALEVEL_ASTAR'].map(k => [k, !!window[k]])
  }));
  if(runtime.lessons !== 118) failures.push(`expected 118 lessons, found ${runtime.lessons}`);
  if(runtime.topics !== 8) failures.push(`expected 8 core topics, found ${runtime.topics}`);
  if(!runtime.report?.passed) failures.push('runtime Phase 10 report did not pass');
  for(const [api, ok] of runtime.apis) if(!ok) failures.push(`${api} did not load`);

  const scope = page.locator('#qualificationScope');
  await scope.waitFor({state:'visible',timeout:5000});
  const scopeText = await scope.innerText();
  if(!/3\.9/.test(scopeText) || !/3\.13/.test(scopeText) || !/Paper 3/i.test(scopeText)) failures.push('qualification scope does not explain the Paper 3 optional topic requirement');

  await page.locator('#lessonCurriculumMap').waitFor({state:'visible',timeout:5000});
  if(await page.locator('.curriculum-lesson[data-lesson-id]').count() !== 118) failures.push('course map does not render all 118 lesson rows');
  if(await page.locator('.phase3-map-present').count() < 100) failures.push('presentation buttons were not attached across the lesson map');

  await page.locator('.curriculum-lesson[data-lesson-id]').first().click();
  await page.locator('.lesson-reader').waitFor({state:'visible',timeout:5000});
  await page.waitForTimeout(250);
  const requiredSections = ['lr-overview','lr-textbook','lr-equations','lr-activities','lr-simulation','lr-mastery','lr-astar','lr-teacher','lr-exam'];
  for(const id of requiredSections) if(await page.locator('#'+id).count() !== 1) failures.push(`open lesson missing #${id}`);
  if(await page.locator('.lesson-reader-nav [data-scroll-section="lr-activities"]').count() !== 1) failures.push('Activities lesson navigation missing');
  if(await page.locator('.lesson-reader-nav [data-scroll-section="lr-mastery"]').count() !== 1) failures.push('Mastery lesson navigation missing');
  if(await page.locator('.lesson-reader-nav [data-scroll-section="lr-teacher"]').count() !== 1) failures.push('Teacher lesson navigation missing');
  if(await page.locator('.lesson-reader-nav [data-scroll-section="lr-astar"]').count() !== 1) failures.push('A* lesson navigation missing');

  await page.locator('[data-close-lesson]').last().click();
  await page.locator('.phase3-map-present').first().click();
  await page.locator('.phase3-deck').waitFor({state:'visible',timeout:5000});
  const slideCount = await page.locator('.phase3-slide-list button').count();
  if(slideCount < 8) failures.push(`teacher presentation has too few slides: ${slideCount}`);
  await page.locator('.phase3-deck [data-close-deck]').last().click();

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(150);
  const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  if(homeOverflow) failures.push('course home has horizontal overflow at 390px viewport');
  await page.locator('.curriculum-lesson[data-lesson-id]').first().click();
  await page.waitForTimeout(200);
  const lessonOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  if(lessonOverflow) failures.push('lesson reader causes page-level horizontal overflow at 390px viewport');
} catch(error) {
  failures.push(`Phase 10 browser exception: ${error.message}`);
}

await browser.close();
if(failures.length){
  console.error('Phase 10 course-system failures:');
  [...new Set(failures)].forEach(x => console.error(`  - ${x}`));
  process.exit(1);
}
console.log('Phase 10 browser audit passed: curriculum, lesson systems, presentations, qualification scope and mobile shell verified.');
