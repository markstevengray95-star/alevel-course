import fs from 'node:fs';
const source=fs.readFileSync('subjects/biology-practicals.js','utf8');
const html=fs.readFileSync('subjects/biology-practicals.html','utf8');
const bridge=fs.readFileSync('subject-tool-bridge.js','utf8');
const expected=[
  [1,"Enzyme-controlled reaction",['a','b','c','f','l']],
  [2,"Root-tip squash, mitosis and mitotic index",['d','e','f']],
  [3,"Water potential using a dilution series",['c','h','j','l']],
  [4,"Permeability of cell-surface membranes",['a','b','c','j','l']],
  [5,"Dissection of a gas-exchange or mass-transport system",['e','h','j']],
  [6,"Aseptic technique and antimicrobial substances",['c','i']],
  [7,"Chromatography of leaf pigments",['b','c','g']],
  [8,"Dehydrogenase activity in chloroplast extracts",['a','b','c']],
  [9,"Respiration in single-celled organisms",['a','b','c','i']],
  [10,"Animal movement using a choice chamber or maze",['h']],
  [11,"Glucose dilution series and colorimetry",['b','c','f']],
  [12,"Environmental factor and species distribution",['a','b','h','k','l']]
];
const failures=[];
for(const [id,title,ats] of expected){
  if(!source.includes(`id:${id},title:'${title}'`))failures.push(`RP${id}: title missing or changed`);
  for(const at of ats){if(!source.includes(`'${at}'`))failures.push(`RP${id}: AT ${at} not represented`);}
}
for(const at of 'abcdefghijkl')if(!source.includes(`${at}:'`))failures.push(`AT ${at}: apparatus/technique definition missing`);
for(const token of ['Purpose','Variables','Apparatus & techniques','Method outline','Safety, ethics & good practice','How to analyse','Uncertainty & error','AQA-style practical reasoning'])if(!source.includes(token))failures.push(`Learning workflow token missing: ${token}`);
for(const sim of ['enzyme','mitosis','water','membrane','dissection','antimicrobial','chrom','chloroplast','respiration','choice','glucose','ecology'])if(!source.includes(`sim:'${sim}'`))failures.push(`Simulation missing: ${sim}`);
if(!html.includes('AQA 7402 · Activities 1–12'))failures.push('Practical hub identity missing');
if(!bridge.includes("openBiologyPracticals:()=>openSubjectPracticals('biology')"))failures.push('Biology subject routing guard missing');
if(!bridge.includes("biology:{hub:'subjects/biology-practicals.html'"))failures.push('Biology practical hub route missing from bridge');
if(failures.length){console.error('Biology practical coverage audit failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1);}
console.log('Biology practical coverage passed: all 12 AQA 7402 required activities, AT a–l definitions, Phase 9 learning stages and subject-aware routing are represented.');
