import { installAuditAccount } from '../tests/audit-account.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.argv[2] || 'dist');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const failures = [];
const pages = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}
for (const file of walk(root)) {
  if (path.basename(file).toLowerCase() === 'index.html') {
    const rel = path.relative(root, file).replaceAll(path.sep, '/');
    pages.push('/' + rel.replace(/index\.html$/i, ''));
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await installAuditAccount(context, base);

async function evaluateStable(frame, evaluator, attempts=6) {
  let lastError;
  for (let attempt=0; attempt<attempts; attempt++) {
    try {
      await frame.waitForLoadState('domcontentloaded', {timeout:2500}).catch(()=>{});
      return await frame.evaluate(evaluator);
    } catch (error) {
      lastError=error;
      if (!/Execution context was destroyed|navigation/i.test(error?.message||'')) throw error;
      await new Promise(resolve=>setTimeout(resolve,180));
    }
  }
  throw lastError || new Error('Embedded frame did not settle');
}

for (const route of pages) {
  const page = await context.newPage();
  const localFailures = [];
  page.on('pageerror', error => localFailures.push(`pageerror: ${error.message}`));
  page.on('console', msg => { if (msg.type() === 'error' && !/favicon\.ico/i.test(msg.text())) localFailures.push(`console: ${msg.text()}`); });
  page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) localFailures.push(`HTTP ${response.status()}: ${response.url()}`); });
  try {
    const response = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response || response.status() >= 400) localFailures.push(`navigation status: ${response?.status() ?? 'no response'}`);
    await page.waitForTimeout(900);
    const bodyText = (await page.locator('body').innerText().catch(() => '')).trim();
    if (bodyText.length < 20) localFailures.push('page rendered too little visible content');
    if (!(await page.title()).trim()) localFailures.push('empty document title');
  } catch (error) { localFailures.push(`navigation exception: ${error.message}`); }
  if (localFailures.length) failures.push({ route, errors: [...new Set(localFailures)] });
  console.log(`${localFailures.length ? 'FAIL' : 'PASS'} ${route}`);
  await page.close();
}

const shell = await context.newPage();
const shellErrors = [];
shell.on('pageerror', error => shellErrors.push(`pageerror: ${error.message}`));
shell.on('console', msg => { if (msg.type() === 'error') shellErrors.push(`console: ${msg.text()}`); });
try {
  await shell.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await shell.evaluate(() => localStorage.removeItem('alevel-physics-student-notebook-v1'));
  await shell.waitForTimeout(500);
  const cards = shell.locator('.topic-card');
  const count = await cards.count();
  if (count !== 8) shellErrors.push(`expected 8 topic cards, found ${count}`);
  if (!(await shell.locator('#courseHome').isVisible())) shellErrors.push('course home is not visible on initial load');
  if (await shell.locator('#workspaceSection').isVisible()) shellErrors.push('workspace should be hidden before a topic is opened');
  if (!(await shell.locator('#homeNotebookBtn').isVisible())) shellErrors.push('course-wide notebook is missing from Course Home');

  for (let i = 0; i < count; i++) {
    await shell.locator('.topic-card').nth(i).click();
    await shell.waitForTimeout(400);
    if (!(await shell.locator('#workspaceSection').isVisible())) shellErrors.push(`topic ${i + 1}: workspace did not open`);
    if (!(await shell.locator('#exitCourse').isVisible())) shellErrors.push(`topic ${i + 1}: Course home control is not visible`);
    if (!(await shell.locator('#markComplete').isVisible())) shellErrors.push(`topic ${i + 1}: completion control missing from main course bar`);
    if (!(await shell.locator('#notebookToggle').isVisible())) shellErrors.push(`topic ${i + 1}: notebook control missing from main course bar`);
    if (await shell.locator('body > .topbar').isVisible()) shellErrors.push(`topic ${i + 1}: duplicate site header is visible in focused mode`);
    if (await shell.locator('.workspace-toolbar').count()) shellErrors.push(`topic ${i + 1}: legacy workspace toolbar returned`);
    const src = await shell.locator('#topicFrame').getAttribute('src');
    if (!src) shellErrors.push(`topic ${i + 1}: iframe src missing`);

    const frame = shell.frames().find(f => f !== shell.mainFrame() && f.url().includes('/topics/'));
    if (!frame) shellErrors.push(`topic ${i + 1}: embedded frame unavailable`);
    else {
      const embeddedExit = frame.locator('.uc-exit-course');
      const navSelect = frame.locator('.uc-view-picker select');
      const notebookButton = frame.locator('.uc-notebook-button');
      await embeddedExit.waitFor({state:'visible',timeout:5500}).catch(()=>shellErrors.push(`topic ${i + 1}: embedded Home button missing`));
      await navSelect.waitFor({state:'visible',timeout:5500}).catch(()=>shellErrors.push(`topic ${i + 1}: compact embedded section picker missing`));
      await notebookButton.waitFor({state:'visible',timeout:5500}).catch(()=>shellErrors.push(`topic ${i + 1}: embedded notebook button missing`));
      if (await frame.locator('.main-nav').isVisible().catch(()=>false)) shellErrors.push(`topic ${i + 1}: original internal navigation is still visible`);
    }

    await shell.locator('#exitCourse').click();
    await shell.waitForTimeout(120);
    if (!(await shell.locator('#courseHome').isVisible())) shellErrors.push(`topic ${i + 1}: course home did not return after exit`);
    if (await shell.locator('#workspaceSection').isVisible()) shellErrors.push(`topic ${i + 1}: workspace remained visible after exit`);
  }

  // The notebook must persist a note from one topic and show it while studying another topic.
  await shell.locator('.topic-card').first().click();
  await shell.waitForTimeout(400);
  await shell.locator('#notebookToggle').click();
  await shell.locator('#notebookPanel').waitFor({state:'visible',timeout:1500});
  await shell.locator('#notebookInput').fill('Test note saved from Measurements');
  await shell.locator('#notebookSave').click();
  await shell.locator('#notebookClose').click();
  await shell.locator('#exitCourse').click();
  await shell.locator('.topic-card').last().click();
  await shell.waitForTimeout(400);
  await shell.locator('#notebookToggle').click();
  await shell.locator('#notebookFilter').selectOption('all');
  if (!(await shell.locator('#notebookList').innerText()).includes('Test note saved from Measurements')) shellErrors.push('student notebook did not persist a note across topics');
  await shell.locator('#notebookClose').click();
  await shell.locator('#exitCourse').click();

  // Selected lesson text can be captured directly without losing the browser selection on button focus.
  await shell.locator('.topic-card').first().click();
  await shell.waitForTimeout(450);
  let embeddedFrame = shell.frames().find(f => f !== shell.mainFrame() && f.url().includes('/topics/'));
  if (embeddedFrame) {
    await embeddedFrame.locator('.uc-embedded-toolbar').waitFor({state:'visible',timeout:5500}).catch(()=>{});
    const selected = await evaluateStable(embeddedFrame, () => {
      const toolbar=document.querySelector('.uc-embedded-toolbar');
      const visible=el=>{if(!el||toolbar?.contains(el))return false;const style=getComputedStyle(el);return style.display!=='none'&&style.visibility!=='hidden'&&el.getClientRects().length>0;};
      const preferred=[...document.querySelectorAll('.lesson-panel p,.lesson-panel li,.textbook-article p,.textbook-article li,.view:not([hidden]) p,.view:not([hidden]) li,.panel p,.panel li,p,li,h2,h3')];
      let target=preferred.find(el=>visible(el)&&(el.textContent||'').replace(/\s+/g,' ').trim().length>12);
      if(!target){
        target=[...document.querySelectorAll('main *, .main *')].find(el=>visible(el)&&el.children.length===0&&(el.textContent||'').replace(/\s+/g,' ').trim().length>12);
      }
      if(!target)return '';
      const node=[...target.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&(n.textContent||'').trim().length>4)||target.firstChild;
      if(!node)return '';
      const range=document.createRange();
      if(node.nodeType===Node.TEXT_NODE){range.setStart(node,0);range.setEnd(node,Math.min(node.textContent.length,240));}
      else range.selectNodeContents(target);
      const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
      return selection.toString().replace(/\s+/g,' ').trim();
    });
    if(!selected) shellErrors.push('could not create a visible lesson text selection for notebook audit');
    else {
      await embeddedFrame.locator('.uc-notebook-button').click();
      await shell.waitForTimeout(180);
      const saved=await shell.evaluate(() => {try{return JSON.parse(localStorage.getItem('alevel-physics-student-notebook-v1')||'[]')}catch{return []}});
      if(saved.length < 2) shellErrors.push('selected lesson text was not saved into the course notebook');
      else {
        const latest=saved[saved.length-1];
        if(!latest.sectionTitle) shellErrors.push('saved lesson selection was not tagged with lesson/section context');
      }
    }
  }
  if(await shell.locator('#notebookPanel').evaluate(el=>el.classList.contains('open')).catch(()=>false)) await shell.locator('#notebookClose').click();
  await shell.locator('#exitCourse').click();

  // Mechanics and materials is the only core section with two linked modules.
  await shell.locator('.topic-card[data-id="mechanics-materials"]').click();
  await shell.waitForTimeout(450);
  const moduleButtons = shell.locator('#moduleTabs button');
  if (await moduleButtons.count() !== 2) shellErrors.push('Mechanics and materials should expose exactly two module tabs');
  else {
    await moduleButtons.nth(1).click();
    await shell.waitForTimeout(250);
    const materialsSrc = await shell.locator('#topicFrame').getAttribute('src');
    if (!materialsSrc?.includes('/materials/')) shellErrors.push('Materials module tab did not switch the embedded app');
  }
  await shell.locator('#exitCourse').click();

  // Embedded Home button path.
  await shell.locator('.topic-card').first().click();
  await shell.waitForTimeout(400);
  embeddedFrame = shell.frames().find(f => f !== shell.mainFrame() && f.url().includes('/topics/'));
  if (embeddedFrame) {
    const embeddedExit = embeddedFrame.locator('.uc-exit-course');
    await embeddedExit.waitFor({state:'visible',timeout:5500});
    await embeddedExit.click();
    await shell.waitForTimeout(150);
    if (!(await shell.locator('#courseHome').isVisible())) shellErrors.push('embedded Home button did not return to Course Home');
  }

  // Escape should also work while keyboard focus is inside an embedded topic.
  await shell.locator('.topic-card').first().click();
  await shell.waitForTimeout(400);
  embeddedFrame = shell.frames().find(f => f !== shell.mainFrame() && f.url().includes('/topics/'));
  if (embeddedFrame) {
    await embeddedFrame.locator('.uc-embedded-toolbar').waitFor({state:'visible',timeout:5500}).catch(()=>{});
    await embeddedFrame.locator('body').press('Escape');
    await shell.waitForTimeout(150);
    if (!(await shell.locator('#courseHome').isVisible())) shellErrors.push('Escape from embedded topic did not return to Course Home');
  }

  await shell.locator('#continueBtn').click();
  await shell.waitForTimeout(300);
  const markButton = shell.locator('#markComplete');
  await markButton.click();
  if (!/Completed/i.test(await markButton.innerText())) shellErrors.push('Mark topic complete did not update state');
} catch (error) { shellErrors.push(`course-shell interaction exception: ${error.message}`); }
if (shellErrors.length) failures.push({ route: 'COURSE SHELL INTERACTIONS', errors: [...new Set(shellErrors)] });
await shell.close();
await browser.close();

console.log(`Browser audit visited ${pages.length} index pages.`);
if (failures.length) {
  console.error(`Browser audit failures: ${failures.length}`);
  for (const item of failures) { console.error(`\n${item.route}`); for (const error of item.errors) console.error(`  - ${error}`); }
  process.exit(1);
}
console.log('Browser audit passed: consistent topic layout, course-wide notebook persistence, lesson tagging, module switching and exit paths work.');
