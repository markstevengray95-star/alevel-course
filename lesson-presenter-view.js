(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const list = value => Array.isArray(value) ? value.filter(Boolean) : [];

  let panel=null, toggle=null, openState=false, observer=null, lessonStartedAt=Date.now(), ticker=null;

  function shell(){ return document.querySelector('.lesson-presentation-shell'); }
  function deck(){ return shell()?.querySelector('.deep-deck'); }
  function dock(){ return shell()?.querySelector('.presentation-control-dock'); }
  function activeId(){ return window.ALEVEL_DEEPENING?.activeLessonId || window.ALEVEL_PRIMARY_PRESENTATION?.activeLessonId || window.ALEVEL_ACTIVE_LESSON?.id || null; }
  function profile(){ const id=activeId(); return id ? window.ALEVEL_PHASE3?.profile?.(id) : null; }
  function currentIndex(){
    const m=(shell()?.querySelector('[data-deep-count]')?.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
    return m ? Math.max(0,Number(m[1])-1) : 0;
  }
  function sourceDeck(){ const id=activeId(); return id ? window.ALEVEL_DEEPENING?.deck?.(id) : null; }
  function formatElapsed(ms){ const s=Math.max(0,Math.floor(ms/1000)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
  function activeLibraryId(){
    const candidate=window.ALEVEL_ACTIVE_LIBRARY_DECK_ID;
    if(!candidate) return activeId();
    const entry=window.ALEVEL_PRESENTATION_LIBRARY?.getEntry?.(candidate);
    return entry?.sourceId===activeId() ? candidate : activeId();
  }

  function ensureToggle(){
    const bar=dock();
    if(!bar) return;
    toggle=bar.querySelector('[data-p8-presenter]');
    if(toggle) return;
    toggle=document.createElement('button');
    toggle.type='button';
    toggle.dataset.p8Presenter='';
    toggle.textContent='Presenter';
    toggle.title='Toggle presenter view (V)';
    const fullscreen=bar.querySelector('[data-p4-fullscreen]');
    if(fullscreen) fullscreen.insertAdjacentElement('beforebegin',toggle); else bar.appendChild(toggle);
    toggle.addEventListener('click',()=>setOpen(!openState));

    const shortcuts=bar.querySelector('[data-p4-shortcuts-panel]');
    if(shortcuts && !shortcuts.querySelector('[data-p8-shortcut]')){
      const line=document.createElement('span');
      line.dataset.p8Shortcut='';
      line.innerHTML='<kbd>V</kbd> presenter view';
      shortcuts.appendChild(line);
    }
  }

  function ensurePanel(){
    const d=deck();
    if(!d || panel?.isConnected) return panel;
    panel=document.createElement('aside');
    panel.className='p8-presenter-panel';
    panel.hidden=true;
    panel.setAttribute('aria-label','Teacher presenter view');
    panel.innerHTML=`
      <header class="p8-head"><div><span>Presenter view</span><strong data-p8-position></strong></div><button type="button" data-p8-close aria-label="Close presenter view">×</button></header>
      <section class="p8-section p8-next"><span class="p8-label">Next slide</span><div data-p8-next-preview></div></section>
      <section class="p8-section"><span class="p8-label">Teacher note</span><p data-p8-note></p></section>
      <section class="p8-section" data-p8-library-note-section hidden><span class="p8-label">Library note</span><p data-p8-library-note></p></section>
      <section class="p8-section"><span class="p8-label">AQA focus</span><p data-p8-spec></p></section>
      <section class="p8-section"><span class="p8-label">Misconception watch</span><ul data-p8-misconceptions></ul></section>
      <section class="p8-metrics">
        <article><span>Lesson elapsed</span><strong data-p8-elapsed>00:00</strong></article>
        <article><span>Class timer</span><strong data-p8-class-timer>05:00</strong></article>
        <article><span>Build</span><strong data-p8-build>—</strong></article>
      </section>
      <footer class="p8-actions"><button type="button" data-p8-prev>← Previous</button><button type="button" data-p8-reveal>Reveal</button><button type="button" class="primary" data-p8-next>Next →</button></footer>`;
    d.appendChild(panel);
    panel.addEventListener('click',event=>{
      if(event.target.closest('[data-p8-close]')) setOpen(false);
      if(event.target.closest('[data-p8-prev]')) shell()?.querySelector('[data-deep-prev]:not(:disabled)')?.click();
      if(event.target.closest('[data-p8-reveal]')) shell()?.querySelector('[data-p4-reveal]:not(:disabled)')?.click();
      if(event.target.closest('[data-p8-next]')) shell()?.querySelector('[data-deep-next]:not(:disabled)')?.click();
    });
    return panel;
  }

  function renderNextSlide(slide){
    if(!slide) return '<div class="p8-end">End of lesson</div>';
    const bullets=list(slide.bullets).slice(0,3);
    return `<div class="p8-preview-card" data-layout="${esc(slide.layout || '')}"><span>${esc(slide.kicker || 'Next')}</span><h3>${esc(slide.title || '')}</h3>${slide.equation?`<div class="p8-preview-equation">${esc(slide.equation)}</div>`:''}<ul>${bullets.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div>`;
  }

  function render(){
    if(!panel?.isConnected) return;
    const p=profile(), d=sourceDeck(), index=currentIndex(), slides=list(d?.slides), current=slides[index], next=slides[index+1];
    panel.querySelector('[data-p8-position]').textContent=`${index+1} / ${slides.length || '?'}`;
    panel.querySelector('[data-p8-next-preview]').innerHTML=renderNextSlide(next);
    panel.querySelector('[data-p8-note]').textContent=current?.note || 'No additional teacher note for this slide.';
    const libraryNote=window.ALEVEL_PRESENTATION_LIBRARY?.getNotes?.(activeLibraryId()) || '';
    const librarySection=panel.querySelector('[data-p8-library-note-section]');
    if(librarySection){librarySection.hidden=!libraryNote;panel.querySelector('[data-p8-library-note]').textContent=libraryNote;}
    panel.querySelector('[data-p8-spec]').textContent=p ? `AQA ${p.ref || ''} — ${p.focus || p.title}` : 'Mapped lesson focus unavailable.';
    const misconceptions=list(p?.misconceptions).length ? list(p.misconceptions) : [p?.concept?.pitfall].filter(Boolean);
    panel.querySelector('[data-p8-misconceptions]').innerHTML=misconceptions.slice(0,3).map(item=>`<li>${esc(item)}</li>`).join('') || '<li>Check students are linking claims to evidence.</li>';
    panel.querySelector('[data-p8-elapsed]').textContent=formatElapsed(Date.now()-lessonStartedAt);
    panel.querySelector('[data-p8-class-timer]').textContent=shell()?.querySelector('[data-p4-timer]')?.textContent || '—';
    const build=shell()?.querySelector('[data-p5-status]');
    panel.querySelector('[data-p8-build]').textContent=(build && !build.hidden && build.textContent) ? build.textContent.replace(/^Build\s*/,'') : '—';
    panel.querySelector('[data-p8-prev]').disabled=index<=0;
    panel.querySelector('[data-p8-next]').disabled=index>=Math.max(0,slides.length-1);
    panel.querySelector('[data-p8-reveal]').disabled=!!shell()?.querySelector('[data-p4-reveal]')?.disabled;
  }

  function setOpen(force){
    openState=!!force;
    ensurePanel(); ensureToggle();
    if(panel) panel.hidden=!openState;
    deck()?.classList.toggle('p8-presenter-open',openState);
    toggle?.classList.toggle('active',openState);
    toggle?.setAttribute('aria-pressed',String(openState));
    if(openState){
      window.ALEVEL_PRACTICAL_PRESENTATION?.close?.();
      render();
    }
  }

  function observe(){
    observer?.disconnect();
    if(!shell()) return;
    observer=new MutationObserver(()=>window.requestAnimationFrame(render));
    observer.observe(shell(),{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-layout','hidden','class']});
  }

  function keydown(event){
    if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]')) return;
    if(event.key==='v' || event.key==='V'){
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(!openState);
    }
  }

  function resetForLesson(){ lessonStartedAt=Date.now(); if(openState) window.setTimeout(render,120); }

  function start(){
    if(!shell() || !dock()){ window.setTimeout(start,100); return; }
    ensurePanel(); ensureToggle(); observe(); render();
    window.clearInterval(ticker);
    ticker=window.setInterval(()=>{ if(openState) render(); },1000);
  }

  window.addEventListener('keydown',keydown,true);
  window.addEventListener('alevel:lesson-selected',resetForLesson);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();

  window.ALEVEL_PRESENTER_VIEW={open:()=>setOpen(true),close:()=>setOpen(false),toggle:()=>setOpen(!openState),get active(){return openState;}};
})();