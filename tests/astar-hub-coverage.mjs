import fs from 'node:fs';
const html=fs.readFileSync('subjects/astar-hub.html','utf8');
const js=fs.readFileSync('subjects/astar-hub.js','utf8');
const bridge=fs.readFileSync('subject-tool-bridge.js','utf8');
const failures=[];
for(const token of ['Synoptic challenge','Evidence & evaluation','Extended response','Paper 3 mastery','biology-content.js','chemistry-content.js'])if(!html.includes(token))failures.push(`A* hub HTML missing: ${token}`);
for(const token of ['AO2','AO3','unfamiliar context','cross-topic connection','Paper 3 essay','Paper 3 synoptic','assumption','limitation','progress:read'])if(!js.includes(token))failures.push(`A* engine missing: ${token}`);
for(const token of ["'astar-hub':{hub:'subjects/astar-hub.html?subject=biology'","'astar-hub':{hub:'subjects/astar-hub.html?subject=chemistry'",'openBiologyAstarHub','openChemistryAstarHub','ensureAstarCard'])if(!bridge.includes(token))failures.push(`Subject bridge missing: ${token}`);
if(failures.length){console.error('A* Hub coverage audit failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('A* Hub coverage passed: Biology/Chemistry routes, AO2/AO3 challenge modes and Paper 3 mastery are represented.');