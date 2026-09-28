import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const curriculum = fs.readFileSync(path.join(root,'curriculum-map.js'),'utf8');
const deepening = fs.readFileSync(path.join(root,'lesson-deepening.js'),'utf8');
const specDepth = fs.readFileSync(path.join(root,'lesson-spec-depth.js'),'utf8');
const phase3 = fs.readFileSync(path.join(root,'lesson-phase3.js'),'utf8');

const lessonRegex = /\bL\('((?:\\.|[^'])*)','((?:\\.|[^'])*)','((?:\\.|[^'])*)','((?:\\.|[^'])*)'/g;
const decode = value => value.replace(/\\'/g,"'").replace(/\\n/g,' ').replace(/\\\\/g,'\\');
const lessons = [];
let match;
while((match = lessonRegex.exec(curriculum))){
  lessons.push({id:decode(match[1]),title:decode(match[2]),ref:decode(match[3]),focus:decode(match[4])});
}
if(lessons.length < 50) throw new Error(`Teaching-strength audit parsed only ${lessons.length} lessons.`);

const actionVerb = /\b(use|explain|calculate|apply|analyse|analyze|interpret|compare|evaluate|determine|distinguish|identify|relate|describe|investigate|derive|estimate|judge|connect|test|classify|predict|measure|construct|model)\b/i;
const failures = [];
const weak = [];

for(const lesson of lessons){
  if(!lesson.ref.trim()) failures.push(`${lesson.id}: missing AQA reference`);
  if(lesson.focus.trim().length < 28) failures.push(`${lesson.id}: mapped focus is too short to guide teaching`);
  if(!actionVerb.test(lesson.focus)) weak.push(`${lesson.id}: focus lacks an explicit assessable action verb — ${lesson.focus}`);
  if(lesson.title.trim().length < 4) failures.push(`${lesson.id}: title is not meaningful`);
}

const requiredPresentationFeatures = [
  ['retrieval','Retrieval starter'],
  ['objectives','Learning objectives'],
  ['worked example','Worked example method'],
  ['checkpoint','Student checkpoint'],
  ['AQA practice','AQA-style practice'],
  ['plenary','Plenary and mastery']
];
for(const [label,signal] of requiredPresentationFeatures){
  if(!phase3.includes(signal)) failures.push(`Core presentation generator missing ${label} signal: ${signal}`);
}

const requiredDeepening = [
  'Reasoning chain','Second representation','Misconception repair','Claim → Evidence → Reasoning','Defend the physics','Teacher move:'
];
for(const signal of requiredDeepening){
  if(!deepening.includes(signal)) failures.push(`Deep-teaching layer missing: ${signal}`);
}

const requiredSpecDepth = [
  'Exact lesson focus:','Specification precision','Identify:','Describe:','Explain:','Apply:','Justify:','Evaluate:','shortLesson','depthLabel'
];
for(const signal of requiredSpecDepth){
  if(!specDepth.includes(signal)) failures.push(`Specification-depth layer missing: ${signal}`);
}

const actionCoverage = (lessons.length - weak.length) / lessons.length;
if(actionCoverage < 0.9){
  failures.push(`Only ${(actionCoverage*100).toFixed(1)}% of lesson focuses contain an assessable action verb; minimum is 90%.`);
}

if(failures.length){
  console.error('Independent teaching-strength audit failed:');
  failures.forEach(item=>console.error(`- ${item}`));
  if(weak.length) weak.slice(0,20).forEach(item=>console.error(`- Review: ${item}`));
  process.exit(1);
}

console.log(`Independent teaching-strength audit passed for ${lessons.length} mapped lessons.`);
console.log(`Assessable-action coverage: ${(actionCoverage*100).toFixed(1)}%.`);
console.log('Every lesson retains its AQA reference/focus and the teaching architecture includes retrieval, explanation, modelling, representation, misconception repair, practice, justify/evaluate reasoning and plenary.');
if(weak.length){
  console.log(`Non-blocking wording review queue: ${weak.length} lesson focus(es).`);
  weak.slice(0,15).forEach(item=>console.log(`- ${item}`));
}
