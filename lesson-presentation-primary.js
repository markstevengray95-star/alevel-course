(() => {
  'use strict';

  let activeId = window.ALEVEL_ACTIVE_LESSON?.id || null;
  let decorating = false;

  function presentationShell(){
    return document.querySelector('.deep-deck-shell');
  }

  function relabelLaunchers(root=document){
    root.querySelectorAll?.('[data-present-lesson]').forEach(button=>{button.textContent='Present lesson';});
    root.querySelectorAll?.('[data-teacher-presentation]').forEach(button=>{button.textContent='Present lesson';});
    root.querySelectorAll?.('[data-open-deep-presentation]').forEach(button=>{button.textContent='Present lesson';});
  }

  function addToolButton(container, attr, label){
    if(!container || container.querySelector(`[${attr}]`)) return;
    const button=document.createElement('button');
    button.type='button';
    button.setAttribute(attr,'');
    button.textContent=label;
    container.insertBefore(button,container.firstChild);
  }

  function decoratePresentation(){
    if(decorating) return;
    decorating=true;
    try{
      const shell=presentationShell();
      if(!shell) return;
      shell.classList.add('lesson-presentation-shell');
      const dialog=shell.querySelector('.deep-deck');
      dialog?.setAttribute('aria-label','Lesson presentation');

      const sideKicker=shell.querySelector('.phase3-deck-side .phase3-kicker');
      if(sideKicker) sideKicker.textContent='Lesson presentation';

      const tools=shell.querySelector('.phase3-deck-tools');
      addToolButton(tools,'data-presentation-restart','Restart');
      addToolButton(tools,'data-presentation-fullscreen','Full screen');

      const closeButton=tools?.querySelector('[data-deep-close]');
      if(closeButton) closeButton.textContent='Lesson notes';
      const copyButton=tools?.querySelector('[data-deep-copy]');
      if(copyButton) copyButton.textContent='Copy slides';

      const topHint=shell.querySelector('.phase3-top span');
      if(topHint) topHint.textContent='← / → change slide · Esc opens lesson notes';

      const prev=shell.querySelector('[data-deep-prev]');
      const next=shell.querySelector('[data-deep-next]');
      if(prev){prev.innerHTML='<span aria-hidden="true">←</span><span>Previous</span>';prev.setAttribute('aria-label','Previous slide');}
      if(next){next.innerHTML='<span>Next</span><span aria-hidden="true">→</span>';next.setAttribute('aria-label','Next slide');}

      shell.querySelectorAll('[data-deep-list] button').forEach((button,index)=>button.setAttribute('aria-label',`Go to slide ${index+1}: ${button.textContent.replace(/^\d+\.\s*/, '')}`));
    } finally {
      decorating=false;
    }
  }

  function openPresentation(id, attempt=0){
    if(!id) return;
    activeId=id;
    const controller=window.ALEVEL_DEEPENING;
    if(!controller?.open){
      if(attempt<30) window.setTimeout(()=>openPresentation(id,attempt+1),50);
      return;
    }
    if(controller.open(id)){
      document.body.classList.add('lesson-presentation-primary');
      window.setTimeout(decoratePresentation,0);
    }
  }

  function showLessonNotes(){
    presentationShell()?.querySelector('.phase3-deck-tools [data-deep-close]')?.click();
    document.body.classList.remove('lesson-presentation-primary');
    const reader=document.querySelector('.lesson-reader-shell:not([hidden])');
    reader?.querySelector('.lesson-reader-body')?.focus?.();
  }

  document.addEventListener('click',event=>{
    const restart=event.target.closest?.('[data-presentation-restart]');
    if(restart){
      event.preventDefault();
      openPresentation(activeId);
      return;
    }
    const fullscreen=event.target.closest?.('[data-presentation-fullscreen]');
    if(fullscreen){
      event.preventDefault();
      const target=presentationShell()?.querySelector('.deep-deck') || presentationShell();
      if(!document.fullscreenElement) target?.requestFullscreen?.().catch(()=>{});
      else document.exitFullscreen?.().catch(()=>{});
      return;
    }
    const close=event.target.closest?.('.lesson-presentation-shell [data-deep-close]');
    if(close){
      window.setTimeout(()=>document.body.classList.remove('lesson-presentation-primary'),0);
    }
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && document.body.classList.contains('lesson-presentation-primary')){
      window.setTimeout(()=>document.body.classList.remove('lesson-presentation-primary'),0);
    }
  });

  window.addEventListener('alevel:lesson-selected',event=>{
    const id=event.detail?.id;
    if(!id) return;
    activeId=id;
    openPresentation(id);
  });

  const observer=new MutationObserver(()=>{
    relabelLaunchers();
    if(document.body.classList.contains('lesson-presentation-primary')) decoratePresentation();
  });
  const start=()=>{
    relabelLaunchers();
    observer.observe(document.body,{childList:true,subtree:true});
    if(activeId) openPresentation(activeId);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();

  window.ALEVEL_PRIMARY_PRESENTATION={open:openPresentation,notes:showLessonNotes,get activeLessonId(){return activeId;}};
})();