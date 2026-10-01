import fs from 'node:fs';
const html=fs.readFileSync('subjects/progress-mastery.html','utf8');
const js=fs.readFileSync('subjects/progress-mastery.js','utf8');
const bridge=fs.readFileSync('subject-tool-bridge.js','utf8');
const failures=[];
for(const token of ['Progress & Mastery','Subject readiness','Priority actions','AO profile','Evidence matrix','Weak areas from assessed work'])if(!html.includes(token))failures.push(`HTML missing: ${token}`);
for(const key of ['alevel-course-progress-v1','alevel-biology-progress-v1','alevel-chemistry-progress-v1','alevel-biology-assessment-history-v1','alevel-chemistry-assessment-history-v1','alevel-biology-required-practicals-v1','alevel-chemistry-required-practicals-v1','alevel-biology-data-coach-v1','alevel-chemistry-calculation-coach-v1','alevel-biology-astar-hub-v1','alevel-chemistry-astar-hub-v1'])if(!js.includes(key))failures.push(`Storage source missing: ${key}`);
for(const token of ["topicTotal:8","topicTotal:3","sectionTotal:39","sectionTotal:34","weight:.35","weight:.15","weight:.10","weight:.05","aggregateAO","assessedAreas","priorityActions"])if(!js.includes(token))failures.push(`Mastery logic missing: ${token}`);
if(!bridge.includes("'progress-mastery'"))failures.push('Global progress/mastery tool config missing');
if(!bridge.includes('openProgressMastery'))failures.push('Progress/mastery bridge function missing');
if(!bridge.includes("ensureCard('progress-mastery'"))failures.push('Progress/mastery course card missing');
if(failures.length){console.error('Progress & Mastery coverage audit failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('Progress & Mastery coverage passed: all three subjects and existing evidence stores are represented.');