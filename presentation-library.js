(() => {
  'use strict';

  const STORAGE_KEY='alevel-presentation-library-v1';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let state=loadState(), root=null, grid=null, searchInput=null, topicSelect=null, typeSelect=null, modal=null, activeEditId=null, editMode='edit';

  function loadState(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return {overrides:parsed.overrides&&typeof parsed.overrides==='object'?parsed.overrides:{},notes:parsed.notes&&typeof parsed.notes==='object'?parsed.notes:{},copies:Array.isArray(parsed.copies)?parsed.copies:[]};
    }catch{return {overrides:{},notes:{},copies:[]};}
  }
  function saveState(){ try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{} }
  function lessons(){return window.ALEVEL_LESSONS||[];}
  function topics(){return window.ALEVEL_CURRICULUM_MAP||[];}
  function sourceLesson(id){return lessons().find(item=>item.id===id)||null;}

  function baseEntries(){
    return lessons().map(lesson=>{
      const o=state.overrides[lesson.id]||{};
      return {libraryId:lesson.id,sourceId:lesson.id,isCopy:false,title:o.title||lesson.title,minutes:Number(o.minutes)||lesson.minutes||60,topicId:lesson.topicId,topicTitle:lesson.topicTitle,topicCode:lesson.topicCode,ref:lesson.ref,type:lesson.type||'lesson',year:lesson.year};
    });
  }
  function copyEntries(){
    return state.copies.map(copy=>{
      const source=sourceLesson(copy.sourceId)||{};
      const o=state.overrides[copy.id]||{};
      return {libraryId:copy.id,sourceId:copy.sourceId,isCopy:true,title:o.title||copy.title||`${source.title||'Lesson'} — Copy`,minutes:Number(o.minutes)||copy.minutes||source.minutes||60,topicId:source.topicId,topicTitle:source.topicTitle,topicCode:source.topicCode,ref:source.ref,type:source.type||'lesson',year:source.year};
    });
  }
  function entries(){return [...baseEntries(),...copyEntries()];}
  function audit(entry){return window.ALEVEL_QUALITY_AUDIT?.audit?.(entry.sourceId)||null;}
  function notesFor(id){return String(state.notes[id]||'').trim();}
  function typeLabel(type){return ({lesson:'Core lesson',practical:'Practical',skills:'Skills',review:'Mastery'}[type]||'Lesson');}
  function slideLabel(entry){return entry.type==='practical'?'18 lesson slides + 13 practical':'18 lesson slides';}
  function readyLabel(result){if(!result)return 'Audit pending';return result.score===100?'Teaching ready':`${result.passed}/${result.total} checks`;}

  function ensureRoot(){
    if(root?.isConnected) return root;
    const courseMap=document.getElementById('courseMap');
    const tools=document.getElementById('courseTools');
    if(!courseMap||!tools) return null;
    root=document.createElement('section');
    root.id='presentationLibrary';
    root.className='presentation-library-block';
    root.innerHTML=`
      <div class="presentation-library-head">
        <div><span class="eyebrow">Teacher presentation system</span><h2>Presentation library</h2><p>All AQA lessons in one place, with slide counts, lesson duration, teaching-readiness checks and teacher notes.</p></div>
        <div class="presentation-library-summary"><strong data-pl-count>0</strong><span>decks</span><b data-pl-ready>0 ready</b></div>
      </div>
      <div class="presentation-library-controls">
        <label class="pl-search"><span>Search</span><input type="search" data-pl-search placeholder="Search lesson, AQA reference or topic…"></label>
        <label><span>Topic</span><select data-pl-topic><option value="all">All topics</option></select></label>
        <label><span>Type</span><select data-pl-type><option value="all">All lesson types</option><option value="lesson">Core lessons</option><option value="practical">Practicals</option><option value="skills">Skills</option><option value="review">Mastery</option><option value="copy">My copies</option></select></label>
        <button type="button" class="button quiet" data-pl-clear>Clear filters</button>
      </div>
      <div class="presentation-library-topics" data-pl-topics></div>
      <div class="presentation-library-grid" data-pl-grid></div>`;
    tools.insertAdjacentElement('beforebegin',root);
    grid=root.querySelector('[data-pl-grid]'); searchInput=root.querySelector('[data-pl-search]'); topicSelect=root.querySelector('[data-pl-topic]'); typeSelect=root.querySelector('[data-pl-type]');
    topics().forEach(topic=>topicSelect.insertAdjacentHTML('beforeend',`<option value="${esc(topic.id)}">${esc(topic.code)} · ${esc(topic.title)}</option>`));
    searchInput.addEventListener('input',render);
    topicSelect.addEventListener('change',render);
    typeSelect.addEventListener('change',render);
    root.querySelector('[data-pl-clear]').addEventListener('click',()=>{searchInput.value='';topicSelect.value='all';typeSelect.value='all';render();});
    root.addEventListener('click',handleClick);
    ensureModal();
    addHomeShortcut();
    render();
    return root;
  }

  function addHomeShortcut(){
    const actions=document.querySelector('.home-actions');
    if(!actions||actions.querySelector('[data-open-presentation-library]')) return;
    const button=document.createElement('button');button.type='button';button.className='button quiet';button.dataset.openPresentationLibrary='';button.textContent='▦ Presentations';
    button.addEventListener('click',()=>openLibrary());
    actions.appendChild(button);
  }

  function filteredEntries(){
    const q=(searchInput?.value||'').trim().toLowerCase(), topic=topicSelect?.value||'all', type=typeSelect?.value||'all';
    return entries().filter(entry=>{
      if(topic!=='all'&&entry.topicId!==topic)return false;
      if(type==='copy'&&!entry.isCopy)return false;
      if(type!=='all'&&type!=='copy'&&entry.type!==type)return false;
      if(q&&!`${entry.title} ${entry.ref} ${entry.topicTitle} ${entry.topicCode}`.toLowerCase().includes(q))return false;
      return true;
    });
  }

  function topicCards(items){
    const counts=new Map();items.forEach(entry=>counts.set(entry.topicId,(counts.get(entry.topicId)||0)+1));
    const host=root.querySelector('[data-pl-topics]');
    host.innerHTML=topics().map(topic=>`<button type="button" data-pl-topic-jump="${esc(topic.id)}" class="${topicSelect?.value===topic.id?'active':''}"><span>${esc(topic.code)}</span><strong>${esc(topic.title)}</strong><small>${counts.get(topic.id)||0} deck${(counts.get(topic.id)||0)===1?'':'s'}</small></button>`).join('');
  }

  function card(entry){
    const result=audit(entry), note=notesFor(entry.libraryId), ready=result?.level||'pending';
    return `<article class="presentation-card ${entry.isCopy?'is-copy':''}" data-library-id="${esc(entry.libraryId)}">
      <div class="presentation-card-top"><div><span>${esc(entry.topicCode||'AQA')} · ${esc(entry.ref||'')}</span><b>${esc(typeLabel(entry.type))}${entry.isCopy?' · Copy':''}</b></div><span class="pl-audit qa-${esc(ready)}">${esc(readyLabel(result))}</span></div>
      <h3>${esc(entry.title)}</h3>
      <p>${esc(entry.topicTitle||'AQA Physics')} · ${esc(entry.year||'')}</p>
      <div class="presentation-card-stats"><span><strong>${esc(slideLabel(entry))}</strong><small>Presentation</small></span><span><strong>${entry.minutes} min</strong><small>Planned time</small></span><span><strong>${note?'Saved':'—'}</strong><small>Teacher notes</small></span></div>
      <div class="presentation-card-actions"><button type="button" class="primary" data-pl-start>Start</button><button type="button" data-pl-edit>Edit</button><button type="button" data-pl-duplicate>Duplicate</button><button type="button" data-pl-notes>Teacher Notes</button></div>
    </article>`;
  }

  function render(){
    if(!root?.isConnected)return;
    const visible=filteredEntries(), allEntries=entries(), ready=allEntries.filter(entry=>audit(entry)?.score===100).length;
    root.querySelector('[data-pl-count]').textContent=String(allEntries.length);
    root.querySelector('[data-pl-ready]').textContent=`${ready} ready`;
    topicCards(visible);
    grid.innerHTML=visible.length?visible.map(card).join(''):'<div class="presentation-library-empty"><strong>No presentations match these filters.</strong><span>Clear the filters or try a different search.</span></div>';
  }

  function handleClick(event){
    const jump=event.target.closest('[data-pl-topic-jump]');
    if(jump){topicSelect.value=jump.dataset.plTopicJump;render();return;}
    const cardNode=event.target.closest('[data-library-id]');if(!cardNode)return;const id=cardNode.dataset.libraryId;
    if(event.target.closest('[data-pl-start]')) startDeck(id);
    else if(event.target.closest('[data-pl-edit]')) openEditor(id,'edit');
    else if(event.target.closest('[data-pl-duplicate]')) duplicate(id);
    else if(event.target.closest('[data-pl-notes]')) openEditor(id,'notes');
  }

  function getEntry(id){return entries().find(entry=>entry.libraryId===id)||null;}
  function startDeck(id){
    const entry=getEntry(id);if(!entry)return;
    window.ALEVEL_ACTIVE_LIBRARY_DECK_ID=id;
    window.ALEVEL_LESSON_CONTENT?.open?.(entry.sourceId);
    let attempts=0;
    const launch=()=>{
      attempts++;
      if(window.ALEVEL_PRIMARY_PRESENTATION?.open){window.ALEVEL_PRIMARY_PRESENTATION.open(entry.sourceId);return;}
      if(attempts<30)window.setTimeout(launch,100);
    };
    window.setTimeout(launch,80);
  }

  function duplicate(id){
    const entry=getEntry(id);if(!entry)return;
    const copyId=`copy-${entry.sourceId}-${Date.now().toString(36)}`;
    state.copies.push({id:copyId,sourceId:entry.sourceId,title:`${entry.title} — Copy`,minutes:entry.minutes,createdAt:Date.now()});
    state.notes[copyId]=notesFor(id);
    saveState();render();openEditor(copyId,'edit');
  }

  function ensureModal(){
    if(modal?.isConnected)return modal;
    modal=document.createElement('div');modal.className='pl-modal-shell';modal.hidden=true;
    modal.innerHTML=`<div class="pl-modal-backdrop" data-pl-modal-close></div><section class="pl-modal" role="dialog" aria-modal="true" aria-label="Presentation editor"><header><div><span data-pl-modal-kicker>Presentation</span><h3 data-pl-modal-title>Edit presentation</h3></div><button type="button" data-pl-modal-close aria-label="Close">×</button></header><div class="pl-modal-body"><label><span>Library title</span><input type="text" maxlength="140" data-pl-edit-title></label><label><span>Planned lesson time</span><div class="pl-minutes"><input type="number" min="10" max="180" step="5" data-pl-edit-minutes><span>minutes</span></div></label><label class="pl-note-field"><span>Teacher notes</span><textarea rows="9" maxlength="8000" data-pl-edit-notes placeholder="Add reminders, questions to ask, equipment notes, differentiation or class-specific prompts…"></textarea></label><div class="pl-source"><span>Source lesson</span><strong data-pl-source></strong></div></div><footer><button type="button" class="danger-subtle" data-pl-delete hidden>Delete copy</button><span></span><button type="button" data-pl-modal-close>Cancel</button><button type="button" class="primary" data-pl-save>Save changes</button></footer></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',event=>{if(event.target.closest('[data-pl-modal-close]'))closeEditor();if(event.target.closest('[data-pl-save]'))saveEditor();if(event.target.closest('[data-pl-delete]'))deleteCopy();});
    return modal;
  }

  function openEditor(id,mode='edit'){
    const entry=getEntry(id);if(!entry)return;ensureModal();activeEditId=id;editMode=mode;
    modal.querySelector('[data-pl-modal-kicker]').textContent=mode==='notes'?'Teacher notes':'Presentation library';
    modal.querySelector('[data-pl-modal-title]').textContent=mode==='notes'?'Teacher Notes':'Edit presentation';
    modal.querySelector('[data-pl-edit-title]').value=entry.title;
    modal.querySelector('[data-pl-edit-minutes]').value=entry.minutes;
    modal.querySelector('[data-pl-edit-notes]').value=notesFor(id);
    modal.querySelector('[data-pl-source]').textContent=`${entry.topicCode||''} · ${entry.ref||''} · ${sourceLesson(entry.sourceId)?.title||entry.title}`;
    modal.querySelector('[data-pl-delete]').hidden=!entry.isCopy;
    modal.classList.toggle('notes-only',mode==='notes');modal.hidden=false;document.body.classList.add('pl-modal-open');
    window.setTimeout(()=>modal.querySelector(mode==='notes'?'[data-pl-edit-notes]':'[data-pl-edit-title]')?.focus(),0);
  }
  function closeEditor(){if(!modal)return;modal.hidden=true;document.body.classList.remove('pl-modal-open');activeEditId=null;}
  function saveEditor(){
    const entry=getEntry(activeEditId);if(!entry)return;
    const title=modal.querySelector('[data-pl-edit-title]').value.trim()||entry.title;
    const minutes=Math.max(10,Math.min(180,Number(modal.querySelector('[data-pl-edit-minutes]').value)||entry.minutes));
    state.overrides[activeEditId]={...(state.overrides[activeEditId]||{}),title,minutes};
    state.notes[activeEditId]=modal.querySelector('[data-pl-edit-notes]').value.trim();
    saveState();closeEditor();render();
  }
  function deleteCopy(){
    const entry=getEntry(activeEditId);if(!entry?.isCopy)return;
    state.copies=state.copies.filter(copy=>copy.id!==activeEditId);delete state.overrides[activeEditId];delete state.notes[activeEditId];saveState();closeEditor();render();
  }

  function openLibrary(){
    ensureRoot();
    if(document.getElementById('courseHome')?.hidden) document.getElementById('brandHome')?.click?.();
    window.setTimeout(()=>root?.scrollIntoView({behavior:'smooth',block:'start'}),60);
  }

  function start(){
    if(!window.ALEVEL_LESSONS?.length||!document.getElementById('courseTools')){window.setTimeout(start,80);return;}
    ensureRoot();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.ALEVEL_PRESENTATION_LIBRARY={open:openLibrary,refresh:render,getEntry,getNotes:notesFor,start:startDeck,duplicate};
})();