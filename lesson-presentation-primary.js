(() => {
  'use strict';

  let activeId = window.ALEVEL_ACTIVE_LESSON?.id || null;

  function presentationShell(){
    return document.querySelector('.deep-deck-shell');
  }

  function shellVisible(){
    const shell=presentationShell();
    return !!shell && !shell.hidden;
  }

  function setText(element,text){
    if(element && element.textContent!==text) element.textContent=text;
  }

  function relabelLaunchers(root=document){
    root.querySelectorAll?.('[data-present-lesson]').forEach(button=>setText(button,'Present lesson'));
    root.querySelectorAll?.('[data-teacher-presentation]').forEach(button=>setText(button,'Present lesson'));
    root.querySelectorAll?.('[data-open-deep-presentation]').forEach(button=>setText(button,'Present lesson'));
  }

  function addToolButton(container,attr,label){
    if(!container || container.querySelector(`[${attr}]`)) return;
    const button=document.createElement('button');
    button.type='button';
    button.setAttribute(attr,'');
    button.textContent=label;
    container.insertBefore(button,container.firstChild);
  }

  function refreshSlideLabels(shell){
    shell?.querySelectorAll('[data-deep-list] button').forEach((button,index)=>{
      const title=button.textContent.replace(/^\d+\.\s*/, '');
      const label=`Go to slide ${index+1}: ${title}`;
      if(button.getAttribute('aria-label')!==label) button.setAttribute('aria-label',label);
    });
  }

  function decoratePresentation(){
    const shell=presentationShell();
    if(!shell) return;
    shell.classList.add('lesson-presentation-shell');
    const dialog=shell.querySelector('.deep-deck');
    if(dialog?.getAttribute('aria-label')!=='Lesson presentation') dialog.setAttribute('aria-label','Lesson presentation');

    setText(shell.querySelector('.phase3-deck-side .phase3-kicker'),'Lesson presentation');
    const tools=shell.querySelector('.phase3-deck-tools');
    addToolButton(tools,'data-presentation-restart','Restart');
    addToolButton(tools,'data-presentation-fullscreen','Full screen');
    setText(tools?.querySelector('[data-deep-close]'),'Lesson notes');
    setText(tools?.querySelector('[data-deep-copy]'),'Copy slides');
    setText(shell.querySelector('.phase3-top span'),'← / → change slide · Esc opens lesson notes');

    const prev=shell.querySelector('[data-deep-prev]');
    const next=shell.querySelector('[data-deep-next]');
    if(prev && !prev.dataset.primaryLabelled){
      prev.dataset.primaryLabelled='1';
      prev.innerHTML='<span aria-hidden="true">←</span><span>Previous</span>';
      prev.setAttribute('aria-label','Previous slide');
    }
    if(next && !next.dataset.primaryLabelled){
      next.dataset.primaryLabelled='1';
      next.innerHTML='<span>Next</span><span aria-hidden="true">→</span>';
      next.setAttribute('aria-label','Next slide');
    }
    refreshSlideLabels(shell);
  }

  function openPresentation(id,force=false,attempt=0){
    if(!id) return false;
    if(!force && activeId===id && shellVisible() && document.body.classList.contains('lesson-presentation-primary')){
      decoratePresentation();
      return true;
    }

    activeId=id;
    const controller=window.ALEVEL_DEEPENING;
    if(!controller?.open){
      if(attempt<24) window.setTimeout(()=>openPresentation(id,force,attempt+1),50);
      return false;
    }
    if(!controller.open(id)) return false;

    document.body.classList.add('lesson-presentation-primary');
    decoratePresentation();
    return true;
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
      openPresentation(activeId,true);
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

    if(event.target.closest?.('.lesson-presentation-shell [data-deep-close]')){
      document.body.classList.remove('lesson-presentation-primary');
    }
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && document.body.classList.contains('lesson-presentation-primary')){
      document.body.classList.remove('lesson-presentation-primary');
    }
  });

  window.addEventListener('alevel:lesson-selected',event=>{
    const id=event.detail?.id;
    if(!id) return;
    relabelLaunchers();
    openPresentation(id,false);
    window.setTimeout(()=>{
      relabelLaunchers();
      if(shellVisible()) decoratePresentation();
    },80);
  });

  const start=()=>{
    relabelLaunchers();
    if(activeId) openPresentation(activeId,false);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.ALEVEL_PRIMARY_PRESENTATION={
    open:(id)=>openPresentation(id,true),
    notes:showLessonNotes,
    get activeLessonId(){return activeId;}
  };
})();