import fs from 'node:fs';
const html=fs.readFileSync('subjects/biology-data-coach.html','utf8');
const js=fs.readFileSync('subjects/biology-data-coach.js','utf8');
const bridge=fs.readFileSync('subject-tool-bridge.js','utf8');
const failures=[];
for(const token of ['AQA 7402','core data skills','Statistical-test coach','Graphs & data','Exam practice'])if(!html.includes(token))failures.push(`HTML missing: ${token}`);
const skills=['magnification','percentage','uncertainty','descriptive','chi','ttest','spearman','simpson','hardy','graphs'];
for(const skill of skills)if(!js.includes(`'${skill}'`))failures.push(`Skill missing: ${skill}`);
for(const token of ['n − 1','Chi-squared','Student\'s t-test','Spearman','Simpson','Hardy–Weinberg','Quadrat population estimate','percentage uncertainty'])if(!js.includes(token)&&!html.includes(token))failures.push(`Required maths/statistics feature missing: ${token}`);
for(const formula of ['(n-1)','N*(N-1)','Math.sqrt(q2)','6*d2','(v-e[i])**2/e[i]'])if(!js.includes(formula))failures.push(`Calculation implementation missing: ${formula}`);
if(!bridge.includes("'data-coach':{hub:'subjects/biology-data-coach.html'"))failures.push('Biology Data Coach route missing from subject bridge');
if(!bridge.includes('openBiologyDataCoach'))failures.push('Biology Data Coach routing guard missing');
if(!bridge.includes("ensureCoachCard('data-coach','biology'"))failures.push('Biology-only card guard missing');
if(failures.length){console.error('Biology Data Coach coverage audit failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('Biology Data Coach coverage passed: AQA 7402 maths/data/statistics features, formulas and Biology-only routing are represented.');