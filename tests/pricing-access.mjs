import fs from 'node:fs';

const pricing=fs.readFileSync('pricing-access.js','utf8');
const presentation=fs.readFileSync('presentation-mode.js','utf8');
const build=fs.readFileSync('scripts/vercel-build.sh','utf8');
const failures=[];

function requireText(source,text,label){
  if(!source.includes(text))failures.push(label);
}

requireText(pricing,"VALID_PLANS=['free','plus','pro','teacher']",'Free, Plus, Pro and Teacher plans are not all defined');
requireText(pricing,"monthly:4.99,annual:39.99",'Plus price should be £4.99/month or £39.99/year');
requireText(pricing,"monthly:7.99,annual:59.99",'Pro price should be £7.99/month or £59.99/year');
requireText(pricing,"monthly:null,annual:89",'Teacher price should be £89/year');

for(const item of ["course:'plus'","textbook:'plus'","notebook:'plus'","simulations:'plus'"]){
  requireText(pricing,item,`Plus entitlement missing: ${item}`);
}
for(const item of ["practicals:'pro'","examTools:'pro'","aiCoach:'pro'","automarking:'pro'","mastery:'pro'","astar:'pro'","progression:'pro'"]){
  requireText(pricing,item,`Pro entitlement missing: ${item}`);
}
for(const item of ["teacherTools:'teacher'","presenterTools:'teacher'"]){
  requireText(pricing,item,`Teacher entitlement missing: ${item}`);
}

requireText(pricing,'School plans are not currently offered.','Pricing UI must explicitly omit school plans');
requireText(presentation,"feature:'simulations'",'Plus simulations are not tier-loaded');
requireText(presentation,"feature:'automarking'",'Pro auto-marking is not tier-loaded');
requireText(presentation,"feature:'teacherTools'",'Teacher tools are not tier-loaded');
requireText(presentation,"window.ALEVEL_ACCESS?.has?.('simulations')",'Lesson extras are not gated by access');
requireText(build,'pricing-access.js pricing-access.css','Pricing assets are not included in Vercel shell assets');
const syntaxLoop=build.match(/for file in \\[\s\S]*?do\s+node --check "\$file"/g)?.at(-1)||'';
requireText(syntaxLoop,'pricing-access.js','Pricing JavaScript is not syntax-checked in the build');

if(failures.length){
  console.error('Pricing/access validation failed:');
  failures.forEach(item=>console.error(`- ${item}`));
  process.exit(1);
}

console.log('Pricing/access validation passed: Free, Plus, Pro and Teacher tiers have the expected prices, entitlements and deployment assets.');
