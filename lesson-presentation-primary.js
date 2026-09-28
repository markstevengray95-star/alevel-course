(() => {
  'use strict';

  let activeId = window.ALEVEL_ACTIVE_LESSON?.id || null;
  let decorating = false;

  function presentationShell(){
    return document.querySelector('.deep-deck-shell');
  }

  function setText(element,text){
    if(element && element.textContent!==text) element.textContent=text;
  }

  function relabelLaunchers(root=document){
    root.querySelectorAll?.('[data-present-lesson]').forEach(button=>setText(button,'Present lesson'));
    root.querySelectorAll?.('[data-teacher-presentation]').forEach(button=>setText(button,'Present lesson'));
    root.querySelectorAll?.('[data-open-deep-presentation]').forEach(button=>setText(button,'Present lesson'));
  }

  function addToolButton(container, attr, label){
    if(!container || container.querySelector(`[${attr}]`)) return;
    const button=document.createElement('button');
    button.type='button';
    button.setAttribute(attr,'');
    button.textContent=label;
    container.insertBefore(button,container.firstChild);
  }

  function refreshSlideLabels(shell){
    shell?.querySelectorAll('[data-deep-list] button').forEach((button,index)=>{
      const label=`Go to slide ${index+1}: ${button.textContent.replace(/^\d+\.\s*/, '')}`;
      if(button.getAttribute('aria-label')!==label) button.setAttribute('aria-label',label);
    });
  }

  function decoratePresentation(){
    if(decorating) return;
    const shell=presentationShell();
    if(!shell) return;
    if(shell.dataset.primaryPresentationReady==='1'){
      refreshSlideLabels(shell);
      return;
    }
    decorating=true;
    try{
      shell.dataset.primaryPresentationReady='1';
      shell.classList.add('lesson-presentation-shell');
      const dialog=shell.querySelector('.deep-deck');
      if(dialog?.getAttribute('aria-label')!=='Lesson presentation') dialog?.setAttribute('aria-label','Lesson presentation');

      setText(shell.querySelector('.phase3-deck-side .phase3-kicker'),'Lesson presentation');

      const tools=shell.querySelector('.phase3-deck-tools');
      addToolButton(tools,'data-presentation-restart','Restart');
      addToolButton(tools,'data-presentation-fullscreen','Full screen');

      setText(tools?.querySelector('[data-deep-close]'),'Lesson notes');
      setText(tools?.querySelector('[data-deep-copy]'),'Copy slides');
      setText(shell.querySelector('.phase3-top span'),'← / → change slide · Esc opens lesson notes');

      const prev=shell.querySelector('[data-deep-prev]');
      const next=shell.querySelector('[data-deep-next]');
      const prevMarkup='<span aria-hidden="true">←</span><span>Previous</span>';
      const nextMarkup='<span>Next</span><span aria-hidden="true">→</span>';
      if(prev){if(prev.innerHTML!==prevMarkup)prev.innerHTML=prevMarkup;if(prev.getAttribute('aria-label')!=='Previous slide')prev.setAttribute('aria-label','Previous slide');}
      if(next){if(next.innerHTML!==nextMarkup)next.innerHTML=nextMarkup;if(next.getAttribute('aria-label')!=='Next slide')next.setAttribute('aria-label','Next slide');}
      refreshSlideLabels(shell);
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