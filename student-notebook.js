(()=>{
  'use strict';
  const storageKey='alevel-physics-student-notebook-v1';
  const panel=document.getElementById('notebookPanel');
  const backdrop=document.getElementById('notebookBackdrop');
  const input=document.getElementById('notebookInput');
  const list=document.getElementById('notebookList');
  const filter=document.getElementById('notebookFilter');
  const contextLabel=document.getElementById('notebookContextLabel');
  const saveBtn=document.getElementById('notebookSave');
  const closeBtn=document.getElementById('notebookClose');
  const toast=document.getElementById('notebookToast');
  let pendingContext=null;
  let toastTimer=null;

  function load(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(value)?value:[];}catch{return []}}
  let notes=load();
  function persist(){localStorage.setItem(storageKey,JSON.stringify(notes.slice(-400)));}
  function esc(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function clean(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function state(){return window.CourseApp?.getState?.()||{topicId:'measurements',code:'AQA 3.1',title:'Measurements and their errors',moduleLabel:'Measurements & Errors'};}
  function activeLessonContext(){
    try{
      const frame=document.getElementById('topicFrame');const doc=frame?.contentDocument;if(!doc)return {};
      const visible=el=>{if(!el)return false;const s=frame.contentWindow.getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0;};
      const nav=[...doc.querySelectorAll('.nav-button')].find(el=>el.classList.contains('active')||el.getAttribute('aria-current')==='page');
      const lesson=doc.querySelector('.course-button.active,.lesson-path-step.active,.chapter-button.active,.textbook-sidebar button.active,.lesson-stage-button.active,.chunk-button.active');
      const heading=[...doc.querySelectorAll('.lesson-panel h2,.lesson-panel h3,.view:not([hidden]) .section-head h2,.view:not([hidden]) h2')].find(el=>visible(el)&&clean(el.textContent));
      const parts=[clean(nav?.textContent),clean(lesson?.textContent)||clean(heading?.textContent)].filter(Boolean);
      return {sectionTitle:[...new Set(parts)].join(' · '),pageTitle:doc.title||''};
    }catch{return {}}
  }
  function context(extra={}){
    const s=state();const lesson=activeLessonContext();
    return {topicId:extra.topicId||s.topicId,code:extra.code||s.code,title:extra.title||s.title,moduleLabel:extra.moduleLabel||s.moduleLabel||'',sectionTitle:extra.sectionTitle||lesson.sectionTitle||'',pageTitle:extra.pageTitle||lesson.pageTitle||''};
  }
  function showToast(message='Saved to notebook'){if(!toast)return;toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1700);}
  function sourceLabel(type){return type==='coach'?'AI explanation':type==='selection'?'Lesson selection':'Student note';}
  function save(text,meta={}){
    const cleanValue=String(text||'').trim();if(!cleanValue)return false;
    const c=context(meta);
    notes.push({id:`n-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,text:cleanValue.slice(0,5000),topicId:c.topicId,code:c.code,title:c.title,moduleLabel:c.moduleLabel,sectionTitle:c.sectionTitle,pageTitle:c.pageTitle,sourceType:meta.sourceType||'manual',createdAt:new Date().toISOString()});
    persist();render();showToast(meta.sourceType==='selection'?'Lesson text saved':'Saved to notebook');return true;
  }
  function remove(id){notes=notes.filter(note=>note.id!==id);persist();render();}
  function filterOptions(preferred){
    const selected=preferred||filter.value||'all';const topics=window.CourseApp?.topics||[];
    filter.innerHTML='<option value="all">All topics</option>'+topics.map(t=>`<option value="${esc(t.id)}">${esc(t.code)} · ${esc(t.short||t.title)}</option>`).join('');
    filter.value=[...filter.options].some(o=>o.value===selected)?selected:'all';
  }
  function render(preferredFilter){
    if(!list||!filter)return;filterOptions(preferredFilter);const value=filter.value;
    const visible=(value==='all'?notes:notes.filter(note=>note.topicId===value)).slice().reverse();
    if(!visible.length){list.innerHTML='<div class="notebook-empty">No notes here yet. Write your own note, save an AI explanation, or select useful lesson text and tap <strong>Save note</strong>.</div>';return;}
    list.innerHTML=visible.map(note=>{
      const detail=[note.moduleLabel,note.sectionTitle].filter(Boolean).join(' · ');const date=new Date(note.createdAt);const dateLabel=Number.isNaN(date.getTime())?'':date.toLocaleDateString(undefined,{day:'numeric',month:'short'});
      return `<article class="notebook-card" data-note-id="${esc(note.id)}"><div class="notebook-card-head"><div class="notebook-meta"><strong>${esc(note.code)} · ${esc(note.title)}</strong><span>${esc(detail||dateLabel)}${detail&&dateLabel?` · ${esc(dateLabel)}`:''}</span></div><button type="button" class="notebook-delete" aria-label="Delete note">Delete</button></div><p>${esc(note.text)}</p><span class="notebook-source">${esc(sourceLabel(note.sourceType))}</span></article>`;
    }).join('');
    list.querySelectorAll('.notebook-delete').forEach(button=>button.addEventListener('click',()=>remove(button.closest('.notebook-card')?.dataset.noteId)));
  }
  function updateContextLabel(extra={}){if(!contextLabel)return;const c=context(extra);contextLabel.textContent=[c.code,c.title,c.sectionTitle].filter(Boolean).join(' · ');}
  function open(extra={}){
    pendingContext=extra||{};document.getElementById('coachClose')?.click();panel.classList.add('open');panel.setAttribute('aria-hidden','false');backdrop.hidden=false;
    updateContextLabel(pendingContext);const desired=pendingContext.topicId==='all'?'all':(pendingContext.topicId||state().topicId||'all');render(desired);setTimeout(()=>input.focus(),70);
  }
  function close(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');backdrop.hidden=true;pendingContext=null;}
  function saveComposer(){const value=input.value.trim();if(!value)return;save(value,{...pendingContext,sourceType:'manual'});input.value='';}

  saveBtn.addEventListener('click',saveComposer);
  input.addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();saveComposer();}});
  closeBtn.addEventListener('click',close);backdrop.addEventListener('click',close);filter.addEventListener('change',()=>render());
  document.getElementById('notebookToggle')?.addEventListener('click',()=>open());
  document.getElementById('homeNotebookBtn')?.addEventListener('click',()=>open({topicId:'all'}));
  window.addEventListener('message',event=>{const data=event.data||{};if(data.type==='alevel-notebook-open')open(data);if(data.type==='alevel-notebook-save'&&data.text)save(data.text,{...data,sourceType:data.sourceType||'selection'});});
  window.addEventListener('coursecontextchange',()=>{if(panel.classList.contains('open'))updateContextLabel(pendingContext||{});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('open')){event.preventDefault();close();}});

  window.CourseNotebook={open,close,save,getNotes:()=>notes.slice()};
  render();updateContextLabel();
})();
