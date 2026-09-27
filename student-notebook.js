(()=>{
  'use strict';
  const storageKey='alevel-physics-student-notebook-v1';
  const panel=document.getElementById('notebookPanel');
  const backdrop=document.getElementById('notebookBackdrop');
  const input=document.getElementById('notebookInput');
  const list=document.getElementById('notebookList');
  const filter=document.getElementById('notebookFilter');
  const search=document.getElementById('notebookSearch');
  const count=document.getElementById('notebookCount');
  const exportBtn=document.getElementById('notebookExport');
  const contextLabel=document.getElementById('notebookContextLabel');
  const saveBtn=document.getElementById('notebookSave');
  const closeBtn=document.getElementById('notebookClose');
  const toast=document.getElementById('notebookToast');
  let pendingContext=null;
  let toastTimer=null;
  let editingId=null;

  function load(){
    try{
      const value=JSON.parse(localStorage.getItem(storageKey)||'[]');
      return Array.isArray(value)?value.map(note=>({...note,pinned:!!note.pinned})):[];
    }catch{return []}
  }
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
  function showToast(message='Saved to notebook'){
    if(!toast)return;toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1700);
  }
  function sourceLabel(type){return type==='coach'?'AI explanation':type==='selection'?'Lesson selection':'Student note';}
  function save(text,meta={}){
    const cleanValue=String(text||'').trim();if(!cleanValue)return false;
    const c=context(meta);
    notes.push({id:`n-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,text:cleanValue.slice(0,5000),topicId:c.topicId,code:c.code,title:c.title,moduleLabel:c.moduleLabel,sectionTitle:c.sectionTitle,pageTitle:c.pageTitle,sourceType:meta.sourceType||'manual',pinned:false,createdAt:new Date().toISOString()});
    persist();render();showToast(meta.sourceType==='selection'?'Lesson text saved':'Saved to notebook');return true;
  }
  function remove(id){notes=notes.filter(note=>note.id!==id);if(editingId===id)editingId=null;persist();render();showToast('Note deleted');}
  function togglePin(id){
    const note=notes.find(item=>item.id===id);if(!note)return;note.pinned=!note.pinned;persist();render();showToast(note.pinned?'Pinned for revision':'Unpinned');
  }
  function beginEdit(id){editingId=id;render();requestAnimationFrame(()=>list.querySelector(`[data-note-id="${CSS.escape(id)}"] .notebook-edit-input`)?.focus());}
  function cancelEdit(){editingId=null;render();}
  function saveEdit(id){
    const card=list.querySelector(`[data-note-id="${CSS.escape(id)}"]`);const editor=card?.querySelector('.notebook-edit-input');const value=editor?.value.trim();if(!value)return;
    const note=notes.find(item=>item.id===id);if(!note)return;note.text=value.slice(0,5000);note.updatedAt=new Date().toISOString();editingId=null;persist();render();showToast('Note updated');
  }
  function filterOptions(preferred){
    const selected=preferred||filter.value||'all';const topics=window.CourseApp?.topics||[];
    filter.innerHTML='<option value="all">All topics</option>'+topics.map(t=>`<option value="${esc(t.id)}">${esc(t.code)} · ${esc(t.short||t.title)}</option>`).join('');
    filter.value=[...filter.options].some(o=>o.value===selected)?selected:'all';
  }
  function matchesSearch(note,term){
    if(!term)return true;
    return [note.text,note.code,note.title,note.moduleLabel,note.sectionTitle,note.pageTitle,sourceLabel(note.sourceType)].join(' ').toLowerCase().includes(term);
  }
  function sortNotes(items){return items.slice().sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));}
  function cardMarkup(note){
    const detail=[note.moduleLabel,note.sectionTitle].filter(Boolean).join(' · ');const date=new Date(note.updatedAt||note.createdAt);const dateLabel=Number.isNaN(date.getTime())?'':date.toLocaleDateString(undefined,{day:'numeric',month:'short'});const editing=editingId===note.id;
    return `<article class="notebook-card ${note.pinned?'pinned':''} ${editing?'editing':''}" data-note-id="${esc(note.id)}"><div class="notebook-card-head"><div class="notebook-meta"><strong>${esc(note.code)} · ${esc(note.title)}</strong><span>${esc(detail||dateLabel)}${detail&&dateLabel?` · ${esc(dateLabel)}`:''}</span></div><div class="notebook-card-actions"><button type="button" class="notebook-pin" aria-label="${note.pinned?'Unpin':'Pin'} note" aria-pressed="${note.pinned?'true':'false'}" title="${note.pinned?'Unpin':'Pin for revision'}">${note.pinned?'★':'☆'}</button><button type="button" class="notebook-edit" aria-label="Edit note">Edit</button><button type="button" class="notebook-delete" aria-label="Delete note">Delete</button></div></div>${editing?`<div class="notebook-inline-edit"><textarea class="notebook-edit-input" maxlength="5000">${esc(note.text)}</textarea><div><button type="button" class="text-button notebook-edit-cancel">Cancel</button><button type="button" class="button primary notebook-edit-save">Save</button></div></div>`:`<p>${esc(note.text)}</p>`}<div class="notebook-card-foot"><span class="notebook-source">${esc(sourceLabel(note.sourceType))}</span>${note.pinned?'<span class="notebook-pinned-label">Pinned</span>':''}</div></article>`;
  }
  function render(preferredFilter){
    if(!list||!filter)return;filterOptions(preferredFilter);const value=filter.value;const term=(search?.value||'').trim().toLowerCase();
    const topicFiltered=value==='all'?notes:notes.filter(note=>note.topicId===value);const visible=sortNotes(topicFiltered.filter(note=>matchesSearch(note,term)));
    if(count)count.textContent=visible.length===notes.length?`${notes.length} ${notes.length===1?'note':'notes'}`:`${visible.length} of ${notes.length} notes`;
    if(!visible.length){list.innerHTML=`<div class="notebook-empty">${term?'No notes match your search.':'No notes here yet. Write your own note, save an AI explanation, or select useful lesson text and tap <strong>Save note</strong>.'}</div>`;return;}
    const pinned=visible.filter(note=>note.pinned);const regular=visible.filter(note=>!note.pinned);let html='';
    if(pinned.length)html+=`<div class="notebook-group-label"><span>★ Revision pins</span><small>${pinned.length}</small></div>${pinned.map(cardMarkup).join('')}`;
    if(regular.length){
      if(pinned.length)html+='<div class="notebook-group-label"><span>Notes</span></div>';
      if(value==='all'&&!term){
        const groups=new Map();regular.forEach(note=>{const key=`${note.code} · ${note.title}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(note);});
        html+=[...groups.entries()].map(([label,items])=>`<div class="notebook-topic-group"><div class="notebook-topic-label">${esc(label)}<span>${items.length}</span></div>${items.map(cardMarkup).join('')}</div>`).join('');
      }else html+=regular.map(cardMarkup).join('');
    }
    list.innerHTML=html;
  }
  function updateContextLabel(extra={}){if(!contextLabel)return;const c=context(extra);contextLabel.textContent=[c.code,c.title,c.sectionTitle].filter(Boolean).join(' · ');}
  function open(extra={}){
    pendingContext=extra||{};document.getElementById('coachClose')?.click();panel.classList.add('open');panel.setAttribute('aria-hidden','false');backdrop.hidden=false;
    updateContextLabel(pendingContext);const desired=pendingContext.topicId==='all'?'all':(pendingContext.topicId||state().topicId||'all');render(desired);setTimeout(()=>input.focus(),70);
  }
  function close(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');backdrop.hidden=true;pendingContext=null;editingId=null;}
  function saveComposer(){const value=input.value.trim();if(!value)return;save(value,{...pendingContext,sourceType:'manual'});input.value='';}
  function exportMarkdown(){
    if(!notes.length){showToast('No notes to export');return;}
    const ordered=sortNotes(notes);const lines=['# AQA A-Level Physics Student Notebook','',`Exported ${new Date().toLocaleString()}`,''];let lastTopic='';
    ordered.forEach(note=>{const topic=`${note.code} — ${note.title}`;if(topic!==lastTopic){lines.push(`## ${topic}`,'');lastTopic=topic;}if(note.pinned)lines.push('**★ Pinned for revision**','');if(note.sectionTitle||note.moduleLabel)lines.push(`**Lesson:** ${note.sectionTitle||note.moduleLabel}`,'');lines.push(`**Source:** ${sourceLabel(note.sourceType)}`,'',note.text,'','---','');});
    const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`aqa-physics-notebook-${new Date().toISOString().slice(0,10)}.md`;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Notebook exported');
  }

  saveBtn.addEventListener('click',saveComposer);
  input.addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();saveComposer();}});
  closeBtn.addEventListener('click',close);backdrop.addEventListener('click',close);filter.addEventListener('change',()=>render());search?.addEventListener('input',()=>render());exportBtn?.addEventListener('click',exportMarkdown);
  list?.addEventListener('click',event=>{const card=event.target.closest('.notebook-card');if(!card)return;const id=card.dataset.noteId;if(event.target.closest('.notebook-pin'))togglePin(id);else if(event.target.closest('.notebook-edit'))beginEdit(id);else if(event.target.closest('.notebook-delete'))remove(id);else if(event.target.closest('.notebook-edit-save'))saveEdit(id);else if(event.target.closest('.notebook-edit-cancel'))cancelEdit();});
  list?.addEventListener('keydown',event=>{if(event.target.classList.contains('notebook-edit-input')&&event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();saveEdit(event.target.closest('.notebook-card')?.dataset.noteId);}});
  document.getElementById('notebookToggle')?.addEventListener('click',()=>open());
  document.getElementById('homeNotebookBtn')?.addEventListener('click',()=>open({topicId:'all'}));
  window.addEventListener('message',event=>{const data=event.data||{};if(data.type==='alevel-notebook-open')open(data);if(data.type==='alevel-notebook-save'&&data.text)save(data.text,{...data,sourceType:data.sourceType||'selection'});});
  window.addEventListener('coursecontextchange',()=>{if(panel.classList.contains('open'))updateContextLabel(pendingContext||{});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('open')){event.preventDefault();if(editingId)cancelEdit();else close();}});

  window.CourseNotebook={open,close,save,render,getNotes:()=>notes.slice(),exportMarkdown};
  render();updateContextLabel();
})();
