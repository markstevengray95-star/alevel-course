const topics=[
{id:'measurements',code:'AQA 3.1',title:'Measurements and their errors',short:'Measurements',year:'Year 12',description:'SI units, prefixes, uncertainty, error, significant figures, gradients, logs and practical data handling.',modules:[{label:'Measurements & Errors',path:'topics/01-measurements/index.html',repo:'https://github.com/markstevengray95-star/Alevelmesurments-and-erros'}]},
{id:'particles',code:'AQA 3.2',title:'Particles and radiation',short:'Particles',year:'Year 12',description:'Particles, antiparticles, photons, particle interactions, quarks, conservation laws and wave–particle duality.',modules:[{label:'Particles & Radiation',path:'topics/02-particles-radiation/index.html',repo:'https://github.com/markstevengray95-star/Practical-and-radiation'}]},
{id:'waves',code:'AQA 3.3',title:'Waves',short:'Waves',year:'Year 12',description:'Progressive and stationary waves, interference, diffraction, refraction, optics and wave behaviour.',modules:[{label:'Waves',path:'topics/03-waves/index.html',repo:'https://github.com/markstevengray95-star/alevel-Wave'}]},
{id:'mechanics-materials',code:'AQA 3.4',title:'Mechanics and materials',short:'Mechanics',year:'Year 12',description:'Vectors, motion, forces, momentum, work and energy, followed by materials, stress, strain and Young modulus.',modules:[{label:'Mechanics',path:'topics/04-mechanics-materials/mechanics/index.html',repo:'https://github.com/markstevengray95-star/mechanicsnew'},{label:'Materials',path:'topics/04-mechanics-materials/materials/index.html',repo:'https://github.com/markstevengray95-star/Alevelmaterials'}]},
{id:'electricity',code:'AQA 3.5',title:'Electricity',short:'Electricity',year:'Year 12',description:'Current, charge, potential difference, resistance, resistivity, circuits, power, emf and internal resistance.',modules:[{label:'Electricity',path:'topics/05-electricity/index.html',repo:'https://github.com/markstevengray95-star/alevel-electricity'}]},
{id:'further-mechanics',code:'AQA 3.6',title:'Further mechanics and thermal physics',short:'Further mechanics',year:'Year 13',description:'Circular motion, SHM, resonance, thermal physics, ideal gases and kinetic theory.',modules:[{label:'Further Mechanics & Thermal',path:'topics/06-further-mechanics-thermal/index.html',repo:'https://github.com/markstevengray95-star/furthermechanics'}]},
{id:'fields',code:'AQA 3.7',title:'Fields and their consequences',short:'Fields',year:'Year 13',description:'Gravitational, electric and magnetic fields, orbits, capacitance and electromagnetic induction.',modules:[{label:'Fields',path:'topics/07-fields/index.html',repo:'https://github.com/markstevengray95-star/alevel-fields-'}]},
{id:'nuclear',code:'AQA 3.8',title:'Nuclear physics',short:'Nuclear',year:'Year 13',description:'Rutherford scattering, radioactivity, nuclear radius and density, mass–energy, fission, fusion and reactors.',modules:[{label:'Nuclear Physics',path:'topics/08-nuclear/index.html',repo:'https://github.com/markstevengray95-star/nuclear-physicsalevel'}]}
];

const progressKey='alevel-course-progress-v1';
const locationKey='alevel-course-location-v2';
let progress=safeJson(localStorage.getItem(progressKey),{});
let activeTopic=topics[0];
let activeModule=0;

const grid=document.getElementById('topicGrid');
const frame=document.getElementById('topicFrame');
const tabs=document.getElementById('moduleTabs');
const quickSelect=document.getElementById('quickCourseSelect');
const courseRail=document.getElementById('courseRail');

function safeJson(value,fallback){try{return JSON.parse(value)||fallback}catch{return fallback}}
function saveProgress(){localStorage.setItem(progressKey,JSON.stringify(progress));}
function saveLocation(){
  const state={topic:activeTopic.id,module:activeModule};
  localStorage.setItem(locationKey,JSON.stringify(state));
  const url=new URL(location.href);
  url.searchParams.set('topic',activeTopic.id);
  url.searchParams.set('module',String(activeModule));
  history.replaceState(state,'',url);
}
function topicIndex(){return Math.max(0,topics.findIndex(t=>t.id===activeTopic.id));}
function moduleUrl(){return activeTopic.modules[activeModule]?.path||activeTopic.modules[0].path;}
function dispatchContext(){
  window.dispatchEvent(new CustomEvent('coursecontextchange',{detail:getState()}));
}

function renderProgress(){
 const done=topics.filter(t=>progress[t.id]).length;
 document.getElementById('progressText').textContent=`${done} / ${topics.length} complete`;
 document.getElementById('progressFill').style.width=`${done/topics.length*100}%`;
 document.getElementById('markComplete').textContent=progress[activeTopic.id]?'Completed ✓':'Mark topic complete';
 document.getElementById('markComplete').classList.toggle('complete-button',!!progress[activeTopic.id]);
 [...grid.children].forEach((el,i)=>el.classList.toggle('complete',!!progress[topics[i].id]));
 courseRail.querySelectorAll('[data-topic-id]').forEach(btn=>btn.classList.toggle('complete',!!progress[btn.dataset.topicId]));
}

function renderGrid(){
 grid.innerHTML=topics.map((t,i)=>`<article class="topic-card ${t.id===activeTopic.id?'active':''} ${progress[t.id]?'complete':''}" data-id="${t.id}" tabindex="0" role="button" aria-label="Open ${t.title}"><span class="topic-index">${String(i+1).padStart(2,'0')} · ${t.code}</span><h3>${t.title}</h3><p>${t.description}</p><div class="topic-footer"><span>${t.year}</span><span>${t.modules.length>1?`${t.modules.length} linked modules`:'Open topic →'}</span></div></article>`).join('');
 grid.querySelectorAll('.topic-card').forEach(card=>{
   const open=()=>openTopic(card.dataset.id,true,0);
   card.addEventListener('click',open);
   card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
 });
}

function renderQuickNavigation(){
 quickSelect.innerHTML=topics.map((t,i)=>`<option value="${t.id}">${i+1}. ${t.code.replace('AQA ','')} · ${t.title}</option>`).join('');
 quickSelect.value=activeTopic.id;
 courseRail.innerHTML=topics.map((t,i)=>`<button type="button" class="rail-topic ${t.id===activeTopic.id?'active':''} ${progress[t.id]?'complete':''}" data-topic-id="${t.id}" title="${t.code} ${t.title}"><span>${i+1}</span><b>${t.short}</b></button>`).join('');
 courseRail.querySelectorAll('[data-topic-id]').forEach(btn=>btn.addEventListener('click',()=>openTopic(btn.dataset.topicId,true,0)));
 const i=topicIndex();
 document.getElementById('coursePosition').textContent=`${i+1} of ${topics.length}`;
 document.getElementById('prevCourse').disabled=i===0;
 document.getElementById('nextCourse').disabled=i===topics.length-1;
 document.getElementById('workspacePrev').disabled=i===0;
 document.getElementById('workspaceNext').disabled=i===topics.length-1;
}

function openTopic(id,scroll=false,moduleIndex=0){
 const next=topics.find(t=>t.id===id)||topics[0];
 activeTopic=next;
 activeModule=Math.min(Math.max(Number(moduleIndex)||0,0),activeTopic.modules.length-1);
 document.getElementById('workspaceCode').textContent=activeTopic.code;
 document.getElementById('workspaceTitle').textContent=activeTopic.title;
 document.getElementById('workspaceDescription').textContent=activeTopic.description;
 renderTabs();
 loadModule();
 renderGrid();
 renderQuickNavigation();
 renderProgress();
 saveLocation();
 dispatchContext();
 if(scroll)document.getElementById('workspaceSection').scrollIntoView({behavior:'smooth',block:'start'});
}

function changeModule(index){
 activeModule=Math.min(Math.max(Number(index)||0,0),activeTopic.modules.length-1);
 renderTabs();
 loadModule();
 saveLocation();
 dispatchContext();
}

function renderTabs(){
 const count=activeTopic.modules.length;
 document.getElementById('modulePrev').hidden=count<2;
 document.getElementById('moduleNext').hidden=count<2;
 if(count<2){tabs.classList.add('hidden');tabs.innerHTML='';return;}
 tabs.classList.remove('hidden');
 tabs.innerHTML=activeTopic.modules.map((m,i)=>`<button type="button" class="${i===activeModule?'active':''}" data-index="${i}">${m.label}</button>`).join('');
 tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>changeModule(Number(b.dataset.index))));
}

function loadModule(){
 const m=activeTopic.modules[activeModule];
 frame.src=m.path;
 document.getElementById('moduleLabel').textContent=m.label;
 document.getElementById('modulePosition').textContent=activeTopic.modules.length>1?`Module ${activeModule+1} of ${activeTopic.modules.length}`:`${activeTopic.code} specialist app`;
 document.getElementById('sourceLink').href=m.repo;
 document.getElementById('openModule').href=m.path;
 document.getElementById('modulePrev').disabled=activeModule===0;
 document.getElementById('moduleNext').disabled=activeModule===activeTopic.modules.length-1;
}

function previousTopic(){
 const i=topicIndex();
 if(i>0)openTopic(topics[i-1].id,true,0);
}
function nextTopic(){
 const i=topicIndex();
 if(i<topics.length-1)openTopic(topics[i+1].id,true,0);
}
function previousModule(){if(activeModule>0)changeModule(activeModule-1);}
function nextModule(){if(activeModule<activeTopic.modules.length-1)changeModule(activeModule+1);}

function getState(){
 const m=activeTopic.modules[activeModule];
 return {
   topicId:activeTopic.id,
   topicIndex:topicIndex(),
   code:activeTopic.code,
   title:activeTopic.title,
   short:activeTopic.short,
   year:activeTopic.year,
   description:activeTopic.description,
   moduleIndex:activeModule,
   moduleLabel:m.label,
   modulePath:m.path,
   complete:!!progress[activeTopic.id]
 };
}

function getActiveContext(){
 const state=getState();
 let pageText='';
 let pageTitle='';
 try{
   const doc=frame.contentDocument;
   if(doc){
     pageTitle=doc.title||'';
     const candidates=[...doc.querySelectorAll('h1,h2,h3,p,li,.equation,.formula-chip,.lesson-lead,.lesson-content,.textbook-section,.worked,.worked-example')];
     const visible=candidates.filter(el=>{
       const s=frame.contentWindow.getComputedStyle(el);
       return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0;
     });
     pageText=visible.map(el=>el.textContent.trim()).filter(Boolean).join('\n').replace(/\n{3,}/g,'\n\n').slice(0,6500);
     if(!pageText)pageText=(doc.body?.innerText||'').trim().slice(0,6500);
   }
 }catch{}
 return {...state,pageTitle,pageText};
}

function restoreLocation(){
 const params=new URLSearchParams(location.search);
 const stored=safeJson(localStorage.getItem(locationKey),{});
 const requested=params.get('topic')||stored.topic||topics[0].id;
 const topic=topics.find(t=>t.id===requested)||topics[0];
 const moduleParam=params.has('module')?Number(params.get('module')):Number(stored.module||0);
 return {topic:topic.id,module:Number.isFinite(moduleParam)?moduleParam:0};
}

document.getElementById('markComplete').addEventListener('click',()=>{progress[activeTopic.id]=!progress[activeTopic.id];saveProgress();renderProgress();renderGrid();renderQuickNavigation();});
document.getElementById('resetProgress').addEventListener('click',()=>{progress={};saveProgress();renderProgress();renderGrid();renderQuickNavigation();});
document.getElementById('reloadFrame').addEventListener('click',()=>{frame.src=moduleUrl();});
document.getElementById('courseMapBtn').addEventListener('click',()=>document.getElementById('courseMap').scrollIntoView({behavior:'smooth'}));
document.getElementById('continueBtn').addEventListener('click',()=>{const next=topics.find(t=>!progress[t.id])||topics[0];openTopic(next.id,true,0);});
quickSelect.addEventListener('change',()=>openTopic(quickSelect.value,true,0));
document.getElementById('prevCourse').addEventListener('click',previousTopic);
document.getElementById('nextCourse').addEventListener('click',nextTopic);
document.getElementById('workspacePrev').addEventListener('click',previousTopic);
document.getElementById('workspaceNext').addEventListener('click',nextTopic);
document.getElementById('modulePrev').addEventListener('click',previousModule);
document.getElementById('moduleNext').addEventListener('click',nextModule);
frame.addEventListener('load',()=>dispatchContext());
window.addEventListener('popstate',()=>{const restored=restoreLocation();openTopic(restored.topic,false,restored.module);});
document.addEventListener('keydown',e=>{
 if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();previousTopic();}
 if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();nextTopic();}
});

window.CourseApp={topics,getState,getActiveContext,openTopic,previousTopic,nextTopic,changeModule};

const restored=restoreLocation();
renderGrid();
openTopic(restored.topic,false,restored.module);
