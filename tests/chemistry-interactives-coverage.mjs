import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('subjects/chemistry-interactives.js','utf8');
const sandbox={window:{},Object,Array,String,JSON,Math,Number};
vm.runInNewContext(source,sandbox,{filename:'subjects/chemistry-interactives.js'});
const api=sandbox.window.ALEVEL_CHEMISTRY_INTERACTIVES;
const expected=['3.1.1','3.1.2','3.1.3','3.1.4','3.1.5','3.1.6','3.1.7','3.1.8','3.1.9','3.1.10','3.1.11','3.1.12','3.2.1','3.2.2','3.2.3','3.2.4','3.2.5','3.2.6','3.3.1','3.3.2','3.3.3','3.3.4','3.3.5','3.3.6','3.3.7','3.3.8','3.3.9','3.3.10','3.3.11','3.3.12','3.3.13','3.3.14','3.3.15','3.3.16'];
const failures=[];
if(!api)failures.push('ALEVEL_CHEMISTRY_INTERACTIVES was not created');
else{
  if(api.version!=='phase-8')failures.push(`unexpected version ${api.version}`);
  if(api.coverage!==34)failures.push(`expected 34 mapped Chemistry sections, found ${api.coverage}`);
  for(const ref of expected){const x=api.definitions?.[ref];if(!x)failures.push(`missing ${ref}`);else if(!x.kind||!x.title||!x.goal)failures.push(`${ref} metadata incomplete`);}
  const extra=Object.keys(api.definitions||{}).filter(x=>!expected.includes(x));if(extra.length)failures.push(`unexpected refs ${extra.join(', ')}`);
  const required=['atom','amount','bonding','energy','kinetics','equilibrium','redox','thermo','rate','kp','electro','acid','periodic','inorganic','complex','organic','mechanism','analysis','chirality','polymer','bioorganic','synthesis','nmr','chrom'];
  const present=new Set(Object.values(api.definitions||{}).map(x=>x.kind));for(const kind of required)if(!present.has(kind))failures.push(`missing interactive kind ${kind}`);
  const priority={'3.1.1':'atom','3.1.5':'kinetics','3.1.6':'equilibrium','3.1.11':'electro','3.1.12':'acid','3.2.5':'complex','3.3.4':'mechanism','3.3.14':'synthesis','3.3.15':'nmr','3.3.16':'chrom'};
  for(const [ref,kind] of Object.entries(priority))if(api.definitions?.[ref]?.kind!==kind)failures.push(`${ref} should use ${kind}`);
}
if(failures.length){console.error('Chemistry interactive coverage audit failed:');failures.forEach(x=>console.error(`- ${x}`));process.exit(1);}console.log('Chemistry interactive coverage passed: all 34 AQA Chemistry 7405 sections have Phase 8 interactives.');
