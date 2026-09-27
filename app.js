const topics=[
{id:'measurements',code:'AQA 3.1',title:'Measurements and their errors',year:'Year 12',description:'SI units, prefixes, uncertainty, error, significant figures, gradients, logs and practical data handling.',modules:[{label:'Measurements & Errors',path:'topics/01-measurements/index.html',repo:'https://github.com/markstevengray95-star/Alevelmesurments-and-erros'}]},
{id:'particles',code:'AQA 3.2',title:'Particles and radiation',year:'Year 12',description:'Particles, antiparticles, photons, particle interactions, quarks, conservation laws and wave–particle duality.',modules:[{label:'Particles & Radiation',path:'topics/02-particles-radiation/index.html',repo:'https://github.com/markstevengray95-star/Practical-and-radiation'}]},
{id:'waves',code:'AQA 3.3',title:'Waves',year:'Year 12',description:'Progressive and stationary waves, interference, diffraction, refraction, optics and wave behaviour.',modules:[{label:'Waves',path:'topics/03-waves/index.html',repo:'https://github.com/markstevengray95-star/alevel-Wave'}]},
{id:'mechanics-materials',code:'AQA 3.4',title:'Mechanics and materials',year:'Year 12',description:'Vectors, motion, forces, momentum, work and energy, followed by materials, stress, strain and Young modulus.',modules:[{label:'Mechanics',path:'topics/04-mechanics-materials/mechanics/index.html',repo:'https://github.com/markstevengray95-star/mechanicsnew'},{label:'Materials',path:'topics/04-mechanics-materials/materials/index.html',repo:'https://github.com/markstevengray95-star/Alevelmaterials'}]},
{id:'electricity',code:'AQA 3.5',title:'Electricity',year:'Year 12',description:'Current, charge, potential difference, resistance, resistivity, circuits, power, emf and internal resistance.',modules:[{label:'Electricity',path:'topics/05-electricity/index.html',repo:'https://github.com/markstevengray95-star/alevel-electricity'}]},
{id:'further-mechanics',code:'AQA 3.6',title:'Further mechanics and thermal physics',year:'Year 13',description:'Circular motion, SHM, resonance, thermal physics, ideal gases and kinetic theory.',modules:[{label:'Further Mechanics & Thermal',path:'topics/06-further-mechanics-thermal/index.html',repo:'https://github.com/markstevengray95-star/furthermechanics'}]},
{id:'fields',code:'AQA 3.7',title:'Fields and their consequences',year:'Year 13',description:'Gravitational, electric and magnetic fields, orbits, capacitance and electromagnetic induction.',modules:[{label:'Fields',path:'topics/07-fields/index.html',repo:'https://github.com/markstevengray95-star/alevel-fields-'}]},
{id:'nuclear',code:'AQA 3.8',title:'Nuclear physics',year:'Year 13',description:'Rutherford scattering, radioactivity, nuclear radius and density, mass–energy, fission, fusion and reactors.',modules:[{label:'Nuclear Physics',path:'topics/08-nuclear/index.html',repo:'https://github.com/markstevengray95-star/nuclear-physicsalevel'}]}
];

const key='alevel-course-progress-v1';
let progress=JSON.parse(localStorage.getItem(key)||'{}');
let activeTopic=topics[0];
let activeModule=0;

const grid=document.getElementById('topicGrid');
const frame=document.getElementById('topicFrame');
const tabs=document.getElementById('moduleTabs');

function save(){localStorage.setItem(key,JSON.stringify(progress));}
function renderProgress(){
 const done=topics.filter(t=>progress[t.id]).length;
 document.getElementById('progressText').textContent=`${done} / ${topics.length} complete`;
 document.getElementById('progressFill').style.width=`${done/topics.length*100}%`;
 document.getElementById('markComplete').textContent=progress[activeTopic.id]?'Completed ✓':'Mark topic complete';
 document.getElementById('markComplete').classList.toggle('complete-button',!!progress[activeTopic.id]);
 [...grid.children].forEach((el,i)=>el.classList.toggle('complete',!!progress[topics[i].id]));
}
function renderGrid(){
 grid.innerHTML=topics.map((t,i)=>`<article class="topic-card ${t.id===activeTopic.id?'active':''} ${progress[t.id]?'complete':''}" data-id="${t.id}"><span class="topic-index">${String(i+1).padStart(2,'0')} · ${t.code}</span><h3>${t.title}</h3><p>${t.description}</p><div class="topic-footer"><span>${t.year}</span><span>${t.modules.length>1?`${t.modules.length} linked modules`:'Open topic →'}</span></div></article>`).join('');
 grid.querySelectorAll('.topic-card').forEach(card=>card.addEventListener('click',()=>openTopic(card.dataset.id,true)));
}
function moduleUrl(){return activeTopic.modules[activeModule].path;}
function openTopic(id,scroll=false){
 activeTopic=topics.find(t=>t.id===id)||topics[0];activeModule=0;
 document.getElementById('workspaceCode').textContent=activeTopic.code;
 document.getElementById('workspaceTitle').textContent=activeTopic.title;
 document.getElementById('workspaceDescription').textContent=activeTopic.description;
 renderTabs();loadModule();renderGrid();renderProgress();
 if(scroll)document.getElementById('workspaceSection').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderTabs(){
 if(activeTopic.modules.length<2){tabs.classList.add('hidden');tabs.innerHTML='';return;}
 tabs.classList.remove('hidden');
 tabs.innerHTML=activeTopic.modules.map((m,i)=>`<button class="${i===activeModule?'active':''}" data-index="${i}">${m.label}</button>`).join('');
 tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{activeModule=Number(b.dataset.index);renderTabs();loadModule();}));
}
function loadModule(){
 const m=activeTopic.modules[activeModule];
 frame.src=m.path;
 document.getElementById('moduleLabel').textContent=m.label;
 document.getElementById('sourceLink').href=m.repo;
 document.getElementById('openModule').href=m.path;
}

document.getElementById('markComplete').addEventListener('click',()=>{progress[activeTopic.id]=!progress[activeTopic.id];save();renderProgress();renderGrid();});
document.getElementById('resetProgress').addEventListener('click',()=>{progress={};save();renderProgress();renderGrid();});
document.getElementById('reloadFrame').addEventListener('click',()=>{frame.src=moduleUrl();});
document.getElementById('courseMapBtn').addEventListener('click',()=>document.getElementById('courseMap').scrollIntoView({behavior:'smooth'}));
document.getElementById('continueBtn').addEventListener('click',()=>{const next=topics.find(t=>!progress[t.id])||topics[0];openTopic(next.id,true);});

renderGrid();openTopic(topics[0].id,false);
