import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const failures = [];
const warnings = [];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const fail = message => failures.push(message);
const warn = message => warnings.push(message);

const curriculum = read('curriculum-map.js');
const app = read('app.js');
const loader = read('presentation-mode.js');
const build = read('scripts/vercel-build.sh');
const qc = fs.existsSync(path.join(root, 'quality-control.js')) ? read('quality-control.js') : '';

const topicMatches = [...curriculum.matchAll(/id:\s*'([^']+)',\s*code:\s*'AQA\s+(3\.\d+)',\s*title:\s*'([^']+)',\s*year:\s*'([^']+)'/g)];
const expectedCodes = ['3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8'];
const codes = topicMatches.map(m => m[2]);
if (topicMatches.length !== 8) fail(`Expected 8 compulsory core topic definitions, found ${topicMatches.length}.`);
if (JSON.stringify(codes) !== JSON.stringify(expectedCodes)) fail(`Core topic order mismatch: ${codes.join(', ')}.`);
for (const m of topicMatches) {
  const code = m[2], year = m[4];
  const expectedYear = Number(code.split('.')[1]) <= 5 ? 'Year 12' : 'Year 13';
  if (year !== expectedYear) fail(`${code} is labelled ${year}; expected ${expectedYear}.`);
}

const lessonMatches = [...curriculum.matchAll(/\bL\('([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/g)];
const ids = lessonMatches.map(m => m[1]);
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (lessonMatches.length !== 118) fail(`Expected 118 mapped core lessons, found ${lessonMatches.length}.`);
if (duplicateIds.length) fail(`Duplicate lesson IDs: ${[...new Set(duplicateIds)].join(', ')}.`);
for (const [, id, title, ref] of lessonMatches) {
  if (!/^3\.[1-8](?:\b|[.\s/–-])/.test(ref)) fail(`${id} ${title}: AQA ref '${ref}' is outside compulsory core 3.1–3.8.`);
}

const practicalCount = (curriculum.match(/'practical'/g) || []).length;
if (practicalCount < 10) warn(`Only ${practicalCount} mapped lessons are explicitly typed practical; verify practical coverage manually.`);

for (const code of expectedCodes) {
  if (!app.includes(`code:'AQA ${code}'`)) fail(`app.js is missing core shell topic AQA ${code}.`);
}

const phaseAssets = [
  'curriculum-map.js','curriculum-map.css','lesson-content.js','lesson-content.css',
  'lesson-phase3.js','lesson-phase3.css','lesson-activities.js','lesson-activities.css',
  'lesson-simulations.js','lesson-simulations.css','lesson-assessment.js','lesson-assessment.css',
  'lesson-progression.js','lesson-progression.css','lesson-teacher-tools.js','lesson-teacher-tools.css',
  'lesson-astar.js','lesson-astar.css','quality-control.js','quality-control.css'
];
for (const asset of phaseAssets) {
  if (!fs.existsSync(path.join(root, asset))) fail(`Missing Phase 1–10 asset: ${asset}.`);
  if (!build.includes(asset)) fail(`Production build does not explicitly include ${asset}.`);
}

const apiChecks = [
  ['lesson-phase3.js','ALEVEL_PHASE3'],['lesson-activities.js','ALEVEL_ACTIVITIES'],
  ['lesson-simulations.js','ALEVEL_SIMULATIONS'],['lesson-assessment.js','ALEVEL_ASSESSMENT'],
  ['lesson-progression.js','ALEVEL_PROGRESSION'],['lesson-teacher-tools.js','ALEVEL_TEACHER_TOOLS'],
  ['lesson-astar.js','ALEVEL_ASTAR']
];
for (const [file, api] of apiChecks) {
  const text = read(file);
  if (!text.includes(`window.${api}`)) fail(`${file} does not expose window.${api}.`);
  if (!loader.includes(file)) fail(`Enhancement loader does not load ${file}.`);
}

if (!qc.includes('3.9') || !qc.includes('3.13') || !qc.includes('Paper 3')) {
  fail('Course UI must state that full A-level Paper 3 requires one optional section 3.9–3.13.');
}

console.log(`Specification audit: ${topicMatches.length} core topics, ${lessonMatches.length} lessons, ${practicalCount} practical-tagged lessons.`);
if (warnings.length) warnings.forEach(x => console.log(`WARN ${x}`));
if (failures.length) {
  failures.forEach(x => console.error(`FAIL ${x}`));
  process.exit(1);
}
console.log('Phase 10 specification and architecture audit passed.');
