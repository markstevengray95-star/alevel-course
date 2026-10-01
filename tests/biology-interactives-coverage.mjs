import fs from 'node:fs';
import vm from 'node:vm';

const sandbox={window:{},Object,Array,String,JSON,Math,Number};
for(const file of ['subjects/biology-interactives.js','subjects/biology-interactive-alignment.js']){
  vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
}
const api=sandbox.window.ALEVEL_BIOLOGY_INTERACTIVES;
const expected=[
  '3.1.1','3.1.2','3.1.3','3.1.4','3.1.5','3.1.6','3.1.7','3.1.8',
  '3.2.1','3.2.2','3.2.3','3.2.4','3.3.1','3.3.2','3.3.3','3.3.4',
  '3.4.1','3.4.2','3.4.3','3.4.4','3.4.5','3.4.6','3.4.7',
  '3.5.1','3.5.2','3.5.3','3.5.4','3.6.1','3.6.2','3.6.3','3.6.4',
  '3.7.1','3.7.2','3.7.3','3.7.4','3.8.1','3.8.2','3.8.3','3.8.4'
];
const failures=[];
if(!api)failures.push('ALEVEL_BIOLOGY_INTERACTIVES was not created');
else{
  if(api.version!=='phase-7')failures.push(`unexpected version ${api.version}`);
  if(api.coverage!==expected.length)failures.push(`expected ${expected.length} mapped sections, found ${api.coverage}`);
  for(const ref of expected){
    const item=api.definitions?.[ref];
    if(!item){failures.push(`missing interactive definition ${ref}`);continue;}
    if(!item.kind||!item.title||!item.goal)failures.push(`${ref} interactive metadata is incomplete`);
  }
  const unexpected=Object.keys(api.definitions||{}).filter(ref=>!expected.includes(ref));
  if(unexpected.length)failures.push(`unexpected refs: ${unexpected.join(', ')}`);
  const requiredKinds=['cell','transport','enzyme','dna','diffusion','process','energy','genetics','hardy','population','homeostasis','geneTech','data'];
  const present=new Set(Object.values(api.definitions||{}).map(x=>x.kind));
  for(const kind of requiredKinds)if(!present.has(kind))failures.push(`missing required Biology interactive kind: ${kind}`);
  const priority={
    '3.2.1':'cell','3.2.2':'process','3.2.3':'transport','3.1.4':'enzyme','3.4.2':'dna','3.4.4':'population',
    '3.5.1':'energy','3.6.2':'process','3.6.3':'process','3.7.1':'genetics','3.7.2':'hardy',
    '3.8.1':'dna','3.8.2':'process','3.8.4':'geneTech'
  };
  for(const [ref,kind] of Object.entries(priority))if(api.definitions?.[ref]?.kind!==kind)failures.push(`${ref} should use ${kind}`);
}
if(failures.length){
  console.error('Biology interactive coverage audit failed:');
  failures.forEach(x=>console.error(`- ${x}`));
  process.exit(1);
}
console.log(`Biology interactive coverage passed: all ${expected.length} AQA sections map to a working Phase 7 interactive type with corrected section alignment.`);
