import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('subjects/biology-content.js','utf8');
const sandbox={window:{},Object,Array,String,JSON};
vm.runInNewContext(source,sandbox,{filename:'subjects/biology-content.js'});
const content=sandbox.window.ALEVEL_BIOLOGY_CONTENT;
const expected=["3.1.1","3.1.2","3.1.3","3.1.4","3.1.5","3.1.6","3.1.7","3.1.8","3.2.1","3.2.2","3.2.3","3.2.4","3.3.1","3.3.2","3.3.3","3.3.4","3.4.1","3.4.2","3.4.3","3.4.4","3.4.5","3.4.6","3.4.7","3.5.1","3.5.2","3.5.3","3.5.4","3.6.1","3.6.2","3.6.3","3.6.4","3.7.1","3.7.2","3.7.3","3.7.4","3.8.1","3.8.2","3.8.3","3.8.4"];
const failures=[];
if(!content)failures.push('ALEVEL_BIOLOGY_CONTENT was not created');
else{
  if(content.count!==expected.length)failures.push(`expected ${expected.length} Biology profiles, found ${content.count}`);
  for(const ref of expected){
    const p=content.get(ref);
    if(!p){failures.push(`missing Biology profile ${ref}`);continue;}
    if(typeof p.q!=='string'||p.q.length<20)failures.push(`${ref} missing lesson question`);
    for(const [field,min] of [['core',4],['model',3],['terms',4],['practical',2],['maths',2],['syn',2],['exam',3]]){
      if(!Array.isArray(p[field])||p[field].length<min)failures.push(`${ref} ${field} is incomplete`);
    }
    if(typeof p.mis!=='string'||p.mis.length<20)failures.push(`${ref} missing misconception repair`);
  }
  const unexpected=content.refs.filter(ref=>!expected.includes(ref));
  if(unexpected.length)failures.push(`unexpected Biology refs: ${unexpected.join(', ')}`);
}
if(failures.length){
  console.error('Biology content coverage audit failed:');
  failures.forEach(x=>console.error(`- ${x}`));
  process.exit(1);
}
console.log(`Biology content coverage passed: ${expected.length} AQA sections each contain detailed teaching, model, practical, maths, misconception, synoptic and exam content.`);
