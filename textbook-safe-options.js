(()=>{
'use strict';
const OPTIONS=[
  ['astrophysics','3.9 Astrophysics'],
  ['medical-physics','3.10 Medical Physics'],
  ['engineering-physics','3.11 Engineering Physics'],
  ['turning-points','3.12 Turning Points'],
  ['electronics','3.13 Electronics']
];
function sync(){
  const select=document.getElementById('textbookSafeOptionSelect');
  const state=window.CourseTextbook?.getState?.();
  if(select) select.value=OPTIONS.some(([id])=>id===state?.topicId)?state.topicId:'';
}
function ensure(){
  const bar=document.querySelector('#textbookWorkspace .textbook-bar');
  if(!bar||document.getElementById('textbookSafeOptionSelect'))return;
  const select=document.createElement('select');
  select.id='textbookSafeOptionSelect';
  select.className='textbook-select';
  select.setAttribute('aria-label','Choose Paper 3 option');
  select.innerHTML='<option value="">Paper 3 option…</option>'+OPTIONS.map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
  const core=document.getElementById('textbookTopicSelect');
  core?.insertAdjacentElement('afterend',select);
  select.addEventListener('change',()=>{
    if(select.value) window.CourseTextbook?.open?.(select.value,0);
  });
  sync();
}
function start(){
  if(!window.CourseTextbook||!document.getElementById('textbookWorkspace')){setTimeout(start,120);return;}
  ensure();
}
window.addEventListener('textbookchange',e=>{if(e.detail?.open){ensure();sync();}});
document.addEventListener('change',e=>{if(e.target?.id==='textbookTopicSelect')setTimeout(sync,0);});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.ALEVEL_TEXTBOOK_SAFE_MODE={refresh:()=>{ensure();sync();}};
})();