import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const curriculumPath = path.join(root, 'curriculum-map.js');
const deepeningPath = path.join(root, 'lesson-deepening.js');
const curriculum = fs.readFileSync(curriculumPath, 'utf8');
const deepening = fs.readFileSync(deepeningPath, 'utf8');

const call = /\bL\('((?:\\.|[^'])*)','((?:\\.|[^'])*)','((?:\\.|[^'])*)','((?:\\.|[^'])*)'/g;
const decode = value => value.replace(/\\'/g, "'").replace(/\\n/g, ' ').replace(/\\\\/g, '\\');
const lessons = [];
let match;
while((match = call.exec(curriculum))){
  lessons.push({id:decode(match[1]), title:decode(match[2]), ref:decode(match[3]), focus:decode(match[4])});
}

if(lessons.length < 50) throw new Error(`Lesson uniqueness audit parsed only ${lessons.length} lessons; parser or curriculum structure may have changed.`);

const normalise = value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const stop = new Set(['the','and','with','from','into','using','use','apply','explain','calculate','describe','lesson','students','student','physics','relevant','appropriate','given']);
const tokenSet = value => new Set(normalise(value).split(' ').filter(word => word.length > 2 && !stop.has(word)));
const similarity = (a,b) => {
  const A = tokenSet(a), B = tokenSet(b);
  if(!A.size || !B.size) return 0;
  let intersection = 0;
  for(const word of A) if(B.has(word)) intersection += 1;
  return intersection / (A.size + B.size - intersection);
};

const seenIds = new Map();
const seenTitles = new Map();
const seenFingerprints = new Map();
const failures = [];
const warnings = [];

for(const lesson of lessons){
  if(seenIds.has(lesson.id)) failures.push(`Duplicate lesson id ${lesson.id}: ${seenIds.get(lesson.id)} / ${lesson.title}`);
  seenIds.set(lesson.id, lesson.title);

  const titleKey = normalise(lesson.title);
  if(seenTitles.has(titleKey)) failures.push(`Duplicate lesson title: ${lesson.title}`);
  seenTitles.set(titleKey, lesson.id);

  const fingerprint = normalise(`${lesson.title} ${lesson.ref} ${lesson.focus}`);
  if(seenFingerprints.has(fingerprint)) failures.push(`Duplicate lesson content fingerprint: ${lesson.id} and ${seenFingerprints.get(fingerprint)}`);
  seenFingerprints.set(fingerprint, lesson.id);
}

for(let i=0;i<lessons.length;i+=1){
  for(let j=i+1;j<lessons.length;j+=1){
    const a = lessons[i], b = lessons[j];
    const score = similarity(`${a.title} ${a.focus}`, `${b.title} ${b.focus}`);
    if(score >= 0.92) warnings.push(`${a.id} ↔ ${b.id}: ${(score*100).toFixed(0)}% token overlap`);
  }
}

const requiredDeepeningSignals = [
  'Reasoning chain',
  'Second representation',
  'Misconception repair',
  'Claim → Evidence → Reasoning',
  'Defend the physics',
  'profile.focus',
  'profile.title',
  'primaryEquation'
];
for(const signal of requiredDeepeningSignals){
  if(!deepening.includes(signal)) failures.push(`Deepening generator is missing required lesson-specific signal: ${signal}`);
}

if(failures.length){
  console.error('Lesson uniqueness audit failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`Lesson uniqueness audit passed for ${lessons.length} mapped lessons.`);
console.log(`Unique lesson IDs: ${seenIds.size}; unique titles: ${seenTitles.size}; unique title/ref/focus fingerprints: ${seenFingerprints.size}.`);
if(warnings.length){
  console.log(`Near-duplicate review queue (${warnings.length} pairs at ≥92% token overlap):`);
  warnings.slice(0,30).forEach(item => console.log(`- ${item}`));
  if(warnings.length > 30) console.log(`- …and ${warnings.length - 30} more pair(s).`);
}else{
  console.log('No near-duplicate lesson pairs crossed the 92% review threshold.');
}
