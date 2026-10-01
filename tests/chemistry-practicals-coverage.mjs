import fs from 'node:fs';
const src=fs.readFileSync('subjects/chemistry-practicals.js','utf8');
const html=fs.readFileSync('subjects/chemistry-practicals.html','utf8');
const failures=[];
for(let i=1;i<=12;i++){if(!new RegExp(`id:${i},title:`).test(src))failures.push(`missing required practical ${i}`);}
for(const letter of 'abcdefghijkl'){if(!new RegExp(`\\n${letter}:'`).test(src))failures.push(`missing AT ${letter} definition`);}
const required=['Volumetric solution and acid–base titration','Measurement of an enthalpy change','Effect of temperature on reaction rate','Qualitative tests for selected cations and anions','Distillation of a product from a reaction','Tests for organic functional groups','Rate measurement by initial and continuous methods','Measuring the EMF of an electrochemical cell','pH change during acid–base titrations','Preparation and purity of organic products','Qualitative tests for transition-metal ions','Separation by thin-layer chromatography'];
for(const title of required){if(!src.includes(title))failures.push(`missing title: ${title}`);}
for(const stage of ['Plan','Method','Interactive lab','Analyse','Exam practice']){if(!html.includes(stage))failures.push(`missing learning stage: ${stage}`);}
if(!src.includes("ALEVEL_CHEMISTRY_PRACTICALS"))failures.push('missing Chemistry practical runtime export');
if(!src.includes("Real ")||!src.includes("teacher supervision"))failures.push('missing supervised-lab safety framing');
if(failures.length){console.error('Chemistry practical coverage failed:');failures.forEach(x=>console.error(`- ${x}`));process.exit(1);}
console.log('Chemistry practical coverage passed: all 12 AQA 7405 activities, AT a–l definitions, learning stages and supervised-lab framing are represented.');