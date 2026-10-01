import fs from 'node:fs';
global.window={};
await import('../subjects/biology-content.js');
await import('../subjects/chemistry-content.js');
await import('../subjects/assessment-data.js');
const data=window.ALEVEL_ASSESSMENT_DATA;
const bridge=fs.readFileSync('subject-tool-bridge.js','utf8');
const failures=[];
if(!data)failures.push('Assessment data registry missing');
const expected={biology:window.ALEVEL_BIOLOGY_CONTENT?.count||0,chemistry:window.ALEVEL_CHEMISTRY_CONTENT?.count||0};
for(const subject of ['biology','chemistry']){
  const bank=data?.banks?.[subject]||[];
  if(!expected[subject])failures.push(`${subject}: source profile registry missing`);
  if(bank.length!==expected[subject]*4)failures.push(`${subject}: expected ${expected[subject]*4} generated questions, found ${bank.length}`);
  const refs=new Set(bank.map(q=>q.ref));
  if(refs.size!==expected[subject])failures.push(`${subject}: not every specification section is represented`);
  for(const ref of refs){
    const q=bank.filter(x=>x.ref===ref);
    for(const ao of ['AO1','AO2','AO3'])if(!q.some(x=>x.ao===ao))failures.push(`${subject} ${ref}: ${ao} missing`);
    if(!q.some(x=>x.practical))failures.push(`${subject} ${ref}: practical/data question missing`);
  }
  if(!bank.every(q=>q.marks===4&&Array.isArray(q.markPoints)&&q.markPoints.length))failures.push(`${subject}: invalid marks or mark points`);
}
if(data?.exam?.biology?.papers?.paper1?.marks!==91||data?.exam?.biology?.papers?.paper2?.marks!==91||data?.exam?.biology?.papers?.paper3?.marks!==78)failures.push('Biology paper mark structure incorrect');
if(data?.exam?.chemistry?.papers?.paper1?.marks!==105||data?.exam?.chemistry?.papers?.paper2?.marks!==105||data?.exam?.chemistry?.papers?.paper3?.marks!==90)failures.push('Chemistry paper mark structure incorrect');
const bio=data?.banks?.biology||[],chem=data?.banks?.chemistry||[];
if(!bio.filter(q=>q.ref.startsWith('3.1.')||q.ref.startsWith('3.2.')||q.ref.startsWith('3.3.')||q.ref.startsWith('3.4.')).every(q=>q.papers.includes('paper1')))failures.push('Biology Paper 1 topic mapping incomplete');
if(!bio.filter(q=>/^3\.[5-8]\./.test(q.ref)).every(q=>q.papers.includes('paper2')))failures.push('Biology Paper 2 topic mapping incomplete');
if(!bio.every(q=>q.papers.includes('paper3')))failures.push('Biology Paper 3 should accept all topics');
if(!chem.every(q=>q.papers.includes('paper3')))failures.push('Chemistry Paper 3 should accept all topics');
if(!chem.filter(q=>q.ref.startsWith('3.2.')).every(q=>q.papers.includes('paper1')))failures.push('Chemistry inorganic mapping to Paper 1 incomplete');
if(!chem.filter(q=>q.ref.startsWith('3.3.')).every(q=>q.papers.includes('paper2')))failures.push('Chemistry organic mapping to Paper 2 incomplete');
for(const token of ['openBiologyAssessments','openChemistryAssessments','assessment-hub.html?subject=biology','assessment-hub.html?subject=chemistry'])if(!bridge.includes(token))failures.push(`Assessment route missing: ${token}`);
if(failures.length){console.error('Assessment coverage audit failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log(`Assessment coverage passed: ${bio.length} Biology + ${chem.length} Chemistry questions generated across every detailed specification section.`);