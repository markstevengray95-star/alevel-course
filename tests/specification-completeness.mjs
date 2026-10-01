import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const failures=[];
const fail=m=>failures.push(m);
const read=p=>fs.readFileSync(p,'utf8');
const norm=s=>String(s||'').toLowerCase().replace(/[–—−]/g,'-');
function walkText(dir){
  if(!fs.existsSync(dir))return'';
  let out='';
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='.git'||entry.name==='node_modules'||entry.name==='vendor'||entry.name==='assets')continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out+='\n'+walkText(full);
    else if(/\.(?:html|js|mjs|css|md|json)$/i.test(entry.name))out+='\n'+read(full);
  }
  return norm(out);
}
function countObjects(source){return [...source.matchAll(/\{id:(\d+),title:/g)].map(m=>Number(m[1]));}
function hasAll(source,patterns,label){for(const pattern of patterns)if(!pattern.test(source))fail(`${label}: missing evidence for ${pattern}`);}

const sandbox={window:{},Object,Array,String,JSON};
vm.runInNewContext(read('subjects/specification-manifest.js'),sandbox,{filename:'subjects/specification-manifest.js'});
const M=sandbox.window.ALEVEL_SPECIFICATION_MANIFEST;
if(!M)fail('specification manifest did not initialise');
else{
  if(M.board!=='AQA')fail(`expected AQA manifest, found ${M.board}`);
  if(M.verified!=='2026-10-01')fail(`unexpected verification date ${M.verified}`);
  if(M.totals.physicsCore!==8)fail(`expected 8 Physics core areas, found ${M.totals.physicsCore}`);
  if(M.totals.physicsOptions!==5)fail(`expected 5 Physics options, found ${M.totals.physicsOptions}`);
  if(M.totals.biologySections!==39)fail(`expected 39 Biology sections, found ${M.totals.biologySections}`);
  if(M.totals.chemistrySections!==34)fail(`expected 34 Chemistry sections, found ${M.totals.chemistrySections}`);
  if(M.totals.requiredPracticals!==36)fail(`expected 36 required practicals, found ${M.totals.requiredPracticals}`);
  for(const s of Object.values(M.subjects)){
    if(!/^https:\/\/www\.aqa\.org\.uk\//.test(s.source))fail(`${s.name}: source is not an official AQA URL`);
    if(s.practicals.length!==12)fail(`${s.name}: expected 12 required practicals, found ${s.practicals.length}`);
    if(s.apparatus.join('')!=='abcdefghijkl')fail(`${s.name}: apparatus-and-technique set is not a–l`);
    if(s.practicalMinimum!==15)fail(`${s.name}: practical assessment minimum should be 15%`);
  }
  if(M.subjects.physics.mathsMinimum!==40)fail('Physics maths minimum should be 40%');
  if(M.subjects.biology.mathsMinimum!==10)fail('Biology maths minimum should be 10%');
  if(M.subjects.chemistry.mathsMinimum!==20)fail('Chemistry maths minimum should be 20%');
  const paperShapes={physics:[[85,34],[85,34],[80,32]],biology:[[91,35],[91,35],[78,30]],chemistry:[[105,35],[105,35],[90,30]]};
  for(const [id,shape] of Object.entries(paperShapes))M.subjects[id].papers.forEach((p,i)=>{if(p.marks!==shape[i][0]||p.weight!==shape[i][1]||p.minutes!==120)fail(`${id} ${p.id}: paper metadata does not match manifest expectation`);});
}

const config=read('course-config.js');
for(const ref of M.subjects.biology.sections)if(!config.includes(`'${ref}'`))fail(`course-config missing Biology ${ref}`);
for(const ref of M.subjects.chemistry.sections)if(!config.includes(`'${ref}'`))fail(`course-config missing Chemistry ${ref}`);
for(const core of M.subjects.physics.core)if(!config.includes(`code:'AQA ${core.ref}'`))fail(`course-config missing Physics core ${core.ref}`);
if(!/3\.9[^\n]*3\.13|3\.1–3\.8 core[^\n]*3\.9–3\.13/.test(config))fail('Physics course metadata does not acknowledge Paper 3 options 3.9–3.13');

for(const [file,globalName,expected] of [
 ['subjects/biology-content.js','ALEVEL_BIOLOGY_CONTENT',M.subjects.biology.sections],
 ['subjects/chemistry-content.js','ALEVEL_CHEMISTRY_CONTENT',M.subjects.chemistry.sections]
]){
  const box={window:{},Object,Array,String,JSON};
  vm.runInNewContext(read(file),box,{filename:file});
  const data=box.window[globalName];
  if(!data){fail(`${file}: content registry missing`);continue;}
  const actual=[...(data.refs||[])];
  if(actual.length!==expected.length)fail(`${file}: expected ${expected.length} sections, found ${actual.length}`);
  for(const ref of expected){
    const p=data.get?.(ref)||data.all?.[ref];
    if(!p){fail(`${file}: missing ${ref}`);continue;}
    for(const [field,min] of [['core',4],['model',3],['terms',4],['practical',2],['maths',2],['syn',2],['exam',3]])if(!Array.isArray(p[field])||p[field].length<min)fail(`${file}: ${ref} ${field} evidence is incomplete`);
    if(typeof p.mis!=='string'||p.mis.length<20)fail(`${file}: ${ref} misconception repair is incomplete`);
  }
}

for(const [file,subject] of [['subjects/biology-practicals.js','biology'],['subjects/chemistry-practicals.js','chemistry']]){
  const source=read(file),ids=countObjects(source);
  if(new Set(ids).size!==12||!Array.from({length:12},(_,i)=>i+1).every(id=>ids.includes(id)))fail(`${file}: practical IDs 1–12 are not all present`);
  for(const p of M.subjects[subject].practicals){const words=p.title.toLowerCase().split(/\W+/).filter(w=>w.length>6).slice(0,2);if(words.length&&!words.some(w=>source.toLowerCase().includes(w)))fail(`${file}: weak title evidence for practical ${p.id} ${p.title}`);}
  for(const letter of M.subjects[subject].apparatus)if(!new RegExp(`(?:^|[,{\\s])${letter}:`).test(source))fail(`${file}: apparatus technique ${letter} missing`);
}

const physicsPractical=read('tools/practicals/aqa-setup-alignment.js');
for(const p of M.subjects.physics.practicals){if(!new RegExp(`(?:^|\\n)${p.id}:\\{title:`).test(physicsPractical))fail(`Physics practical ${p.id} missing from AQA setup guide`);const key=p.title.toLowerCase().split(/\W+/).filter(w=>w.length>5)[0];if(key&&!physicsPractical.toLowerCase().includes(key))fail(`Physics practical ${p.id}: title evidence missing`);}

const options=read('textbook-options.js');
for(const o of M.subjects.physics.options){if(!options.includes(`code:'AQA ${o.ref}'`))fail(`Physics option ${o.ref} missing from textbook-options.js`);if(!options.includes(`title:'${o.title}'`))fail(`Physics option ${o.ref} title missing from textbook-options.js`);}

const physicsConcepts={
 '3.1':['uncertainty','significant'],
 '3.2':['quark','antiparticle','photoelectric'],
 '3.3':['stationary','diffraction','interference'],
 '3.4':['momentum','young modulus','stress'],
 '3.5':['resistivity','internal resistance','emf'],
 '3.6':['simple harmonic','resonance','ideal gas'],
 '3.7':['capacitance','electromagnetic induction','gravitational'],
 '3.8':['half-life','fission','binding energy']
};
for(const core of M.subjects.physics.core){const text=walkText(core.path);if(text.length<1000){fail(`Physics ${core.ref}: topic source is unexpectedly small or missing`);continue;}for(const term of physicsConcepts[core.ref])if(!text.includes(term))fail(`Physics ${core.ref}: expected concept '${term}' not found in topic source`);}

const assessment=read('subjects/assessment-data.js');
hasAll(assessment,[/paper1:\{label:'Paper 1',marks:91,minutes:120/,/paper3:\{label:'Paper 3',marks:78,minutes:120/,/paper1:\{label:'Paper 1',marks:105,minutes:120/,/paper3:\{label:'Paper 3',marks:90,minutes:120/],'assessment-data.js');
for(const ref of ['3.1.1','3.1.2','3.1.3','3.1.4','3.1.6','3.1.7','3.1.8','3.1.10','3.1.11','3.1.12'])if(!assessment.includes(`'${ref}'`))fail(`Chemistry Paper 1 mapping missing ${ref}`);
for(const ref of ['3.1.2','3.1.3','3.1.4','3.1.5','3.1.6','3.1.9'])if(!assessment.includes(`'${ref}'`))fail(`Chemistry Paper 2 mapping missing ${ref}`);

for(const file of ['subjects/biology-data-coach.js','subjects/chemistry-calculation-coach.js','subjects/specification-audit.html','subjects/specification-audit.js','subjects/specification-audit.css'])if(!fs.existsSync(file))fail(`missing Phase 17 evidence asset ${file}`);

if(failures.length){console.error(`\nSPECIFICATION COMPLETENESS AUDIT FAILED (${failures.length})`);for(const x of failures)console.error(' -',x);process.exit(1);}
console.log(`PASS: AQA specification completeness verified — Physics 8 core + 5 options, Biology ${M.totals.biologySections} sections, Chemistry ${M.totals.chemistrySections} sections, and ${M.totals.requiredPracticals} required practicals.`);
