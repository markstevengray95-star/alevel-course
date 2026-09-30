(()=>{
'use strict';
const OPTIONS=[
  ['astrophysics','3.9 Astrophysics'],
  ['medical-physics','3.10 Medical Physics'],
  ['engineering-physics','3.11 Engineering Physics'],
  ['turning-points','3.12 Turning Points'],
  ['electronics','3.13 Electronics']
];
const OPTION_IDS=new Set(OPTIONS.map(([id])=>id));
const FALLBACK_TERMS={
  'tp-electron':[
    ['thermionic emission','Release of electrons from a heated metal surface.'],
    ['specific charge','Charge-to-mass ratio, such as e/m for the electron.'],
    ['charge quantisation','Electric charge occurs in integer multiples of the elementary charge e.'],
    ['terminal velocity','Constant speed reached when resultant force becomes zero.']
  ],
  'el-signals':[
    ['analogue signal','A continuously varying signal whose value can take any value in a range.'],
    ['digital signal','A signal represented using discrete levels, commonly binary states.'],
    ['sampling rate','The number of samples taken from a signal each second.'],
    ['quantisation','Mapping sampled amplitudes onto a finite set of allowed digital levels.']
  ],
  'el-opamps':[
    ['negative feedback','Feeding part of the output back to oppose the input difference and control gain.'],
    ['virtual earth','A point held close to 0 V by negative feedback even though it is not directly connected to earth.'],
    ['inverting amplifier','An op-amp arrangement with negative voltage gain and a 180° phase inversion.'],
    ['non-inverting amplifier','An op-amp arrangement with positive voltage gain and high input resistance.']
  ]
};
let patched=false;

function state(){return window.CourseTextbook?.getState?.()||{};}

function ensureMainOptions(){
  const select=document.getElementById('textbookTopicSelect');
  if(!select)return;
  let group=[...select.querySelectorAll('optgroup')].find(g=>g.dataset.paper3Group==='1');
  if(!group){
    group=document.createElement('optgroup');
    group.label='Paper 3 options';
    group.dataset.paper3Group='1';
    select.appendChild(group);
  }
  for(const [id,label] of OPTIONS){
    let option=[...select.options].find(o=>o.value===id);
    if(!option){
      option=document.createElement('option');
      option.value=id;
      option.textContent=label;
      option.dataset.paper3='1';
      group.appendChild(option);
    }
  }
  const s=state();
  if(s.topicId&&window.CourseTextbook?.data?.[s.topicId])select.value=s.topicId;
}

function syncSecondary(){
  const select=document.getElementById('textbookSafeOptionSelect');
  const s=state();
  if(select)select.value=OPTION_IDS.has(s.topicId)?s.topicId:'';
}

function ensureSecondary(){
  const bar=document.querySelector('#textbookWorkspace .textbook-bar');
  if(!bar)return;
  let select=document.getElementById('textbookSafeOptionSelect');
  if(!select){
    select=document.createElement('select');
    select.id='textbookSafeOptionSelect';
    select.className='textbook-select';
    select.setAttribute('aria-label','Choose Paper 3 option');
    select.innerHTML='<option value="">Paper 3 option…</option>'+OPTIONS.map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
    document.getElementById('textbookTopicSelect')?.insertAdjacentElement('afterend',select);
    select.addEventListener('change',()=>{if(select.value)window.CourseTextbook?.setTopic?.(select.value);});
  }
  syncSecondary();
}

function augmentGlossary(){
  const s=state();
  if(!OPTION_IDS.has(s.topicId))return;
  const topic=window.CourseTextbook?.data?.[s.topicId];
  const chapter=topic?.chapters?.[Number(s.chapterIndex)||0];
  if(!chapter)return;
  const grid=document.querySelector('#textbookArticle .textbook-term-grid');
  if(!grid)return;
  const current=grid.querySelectorAll('.textbook-term-card').length;
  if(current>=4)return;
  const candidates=FALLBACK_TERMS[chapter.id]||[
    ['key model',chapter.summary||'A key model used in this Paper 3 option.'],
    ['evidence','An observation or measurement used to support a physical conclusion.'],
    ['assumption','A condition adopted when applying the model.'],
    ['limitation','A reason a model or method may not perfectly represent reality.']
  ];
  const existing=new Set([...grid.querySelectorAll('.textbook-term-card strong')].map(n=>n.textContent.trim().toLowerCase()));
  let needed=4-current;
  for(const [term,definition] of candidates){
    if(needed<=0)break;
    if(existing.has(term.toLowerCase()))continue;
    const card=document.createElement('div');
    card.className='textbook-term-card textbook-safe-term';
    card.tabIndex=0;
    card.innerHTML=`<strong>${term}</strong><span>${definition}</span><em>Paper 3 key term</em>`;
    grid.appendChild(card);
    existing.add(term.toLowerCase());
    needed--;
  }
}

function refresh(){
  ensureMainOptions();
  ensureSecondary();
  augmentGlossary();
}

function patchApi(){
  if(patched||!window.CourseTextbook)return;
  patched=true;
  for(const name of ['open','setTopic','setChapter']){
    const original=window.CourseTextbook[name];
    if(typeof original!=='function')continue;
    window.CourseTextbook[name]=function(...args){
      const result=original.apply(this,args);
      refresh();
      requestAnimationFrame(refresh);
      return result;
    };
  }
}

function start(){
  if(!window.CourseTextbook||!document.getElementById('textbookWorkspace')){setTimeout(start,120);return;}
  patchApi();
  refresh();
}

window.addEventListener('textbookchange',()=>{refresh();requestAnimationFrame(refresh);});
document.addEventListener('change',e=>{
  if(e.target?.id==='textbookTopicSelect'||e.target?.id==='textbookMobileChapter')requestAnimationFrame(refresh);
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.ALEVEL_TEXTBOOK_SAFE_MODE={refresh};
})();