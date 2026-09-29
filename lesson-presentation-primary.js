(() => {
  'use strict';

  let activeId = window.ALEVEL_ACTIVE_LESSON?.id || null;
  let shellObserver = null;
  let lastSlideSignature = '';
  let decorateQueued = false;

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

  function slidePosition(shell){
    const text=shell?.querySelector('[data-deep-count]')?.textContent || '';
    const match=text.match(/(\d+)\s*\/\s*(\d+)/);
    return match ? {current:Number(match[1]), total:Number(match[2])} : {current:1,total:1};
  }

  function updateNavigationState(shell){
    if(!shell) return;
    const {current,total}=slidePosition(shell);
    const prev=shell.querySelector('[data-deep-prev]');
    const next=shell.querySelector('[data-deep-next]');
    if(prev){
      prev.disabled=current<=1;
      prev.setAttribute('aria-disabled',String(current<=1));
      prev.title=current<=1 ? 'First slide' : `Go to slide ${current-1}`;
    }
    if(next){
      next.disabled=current>=total;
      next.setAttribute('aria-disabled',String(current>=total));
      next.title=current>=total ? 'Last slide' : `Go to slide ${current+1}`;
    }
  }

  function fitCurrentSlide(shell){
    const slide=shell?.querySelector('.deep-slide');
    if(!slide) return;
    slide.classList.remove('presentation-dense','presentation-very-dense');
    const bulletCount=slide.querySelectorAll('li').length;
    const textLength=(slide.textContent || '').trim().length;
    if(bulletCount>=6 || textLength>650) slide.classList.add('presentation-dense');
    if(bulletCount>=8 || textLength>950) slide.classList.add('presentation-very-dense');

    requestAnimationFrame(()=>{
      if(slide.scrollHeight>slide.clientHeight+4){
        slide.classList.add('presentation-dense');
        requestAnimationFrame(()=>{
          if(slide.scrollHeight>slide.clientHeight+4) slide.classList.add('presentation-very-dense');
        });
      }
    });
  }

  function animateCurrentSlide(shell){
    const slide=shell?.querySelector('.deep-slide');
    if(!slide || !shellVisible()) return;
    const {current,total}=slidePosition(shell);
    const signature=`${activeId || ''}:${current}:${total}:${(slide.textContent || '').slice(0,120)}`;
    if(signature===lastSlideSignature) return;
    lastSlideSignature=signature;
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    slide.animate?.(
      [
        {opacity:.62, transform:'translateY(8px) scale(.995)'},
        {opacity:1, transform:'translateY(0) scale(1)'}
      ],
      {duration:220,easing:'cubic-bezier(.2,.8,.2,1)'}
    );
  }

  function updateFullscreenButton(shell){
    const button=shell?.querySelector('[data-presentation-fullscreen]');
    if(!button) return;
    const active=!!document.fullscreenElement;
    button.textContent=active ? 'Exit full screen' : 'Full screen';
    button.setAttribute('aria-pressed',String(active));
  }

  function queuePresentationRefresh(){
    if(decorateQueued) return;
    decorateQueued=true;
    requestAnimationFrame(()=>{
      decorateQueued=false;
      const shell=presentationShell();
      if(!shell) return;
      refreshSlideLabels(shell);
      updateNavigationState(shell);
      fitCurrentSlide(shell);
      animateCurrentSlide(shell);
      updateFullscreenButton(shell);
    });
  }

  function observePresentation(shell){
    if(!shell || shell.dataset.primaryObserved==='1') return;
    shell.dataset.primaryObserved='1';
    shellObserver?.disconnect();
    shellObserver=new MutationObserver(()=>queuePresentationRefresh());
    shellObserver.observe(shell,{subtree:true,childList:true,characterData:true});
  }

  function decoratePresentation(){
    const shell=presentationShell();
    if(!shell) return;
    shell.classList.add('lesson-presentation-shell');
    const dialog=shell.querySelector('.deep-deck');
    if(dialog?.getAttribute('aria-label')!=='Lesson presentation') dialog.setAttribute('aria-label','Lesson presentation');
    dialog?.setAttribute('aria-describedby','lesson-presentation-shortcuts');

    setText(shell.querySelector('.phase3-deck-side .phase3-kicker'),'Lesson presentation');
    const tools=shell.querySelector('.phase3-deck-tools');
    addToolButton(tools,'data-presentation-restart','Restart');
    addToolButton(tools,'data-presentation-fullscreen','Full screen');
    setText(tools?.querySelector('[data-deep-close]'),'Lesson notes');
    setText(tools?.querySelector('[data-deep-copy]'),'Copy slides');

    const topHint=shell.querySelector('.phase3-top span');
    if(topHint){
      topHint.id='lesson-presentation-shortcuts';
      setText(topHint,'← / → change slide · Esc exits presentation');
    }

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

    observePresentation(shell);
    refreshSlideLabels(shell);
    updateNavigationState(shell);
    fitCurrentSlide(shell);
    updateFullscreenButton(shell);
  }

  function enterPresentationState(){
    document.body.classList.add('lesson-presentation-primary');
    document.documentElement.classList.add('lesson-presentation-active');
    window.scrollTo?.(0,0);
  }

  function leavePresentationState(){
    document.body.classList.remove('lesson-presentation-primary');
    document.documentElement.classList.remove('lesson-presentation-active');
    lastSlideSignature='';
  }

  function openPresentation(id,force=false,attempt=0){
    if(!id) return false;
    if(!force && activeId===id && shellVisible() && document.body.classList.contains('lesson-presentation-primary')){
      decoratePresentation();
      queuePresentationRefresh();
      return true;
    }

    activeId=id;
    const controller=window.ALEVEL_DEEPENING;
    if(!controller?.open){
      if(attempt<24) window.setTimeout(()=>openPresentation(id,force,attempt+1),50);
      return false;
    }
    if(!controller.open(id)) return false;

    enterPresentationState();
    decoratePresentation();
    queuePresentationRefresh();
    return true;
  }

  function showLessonNotes(){
    const shell=presentationShell();
    shell?.querySelector('.phase3-deck-tools [data-deep-close]')?.click();
    leavePresentationState();
    const reader=document.querySelector('.lesson-reader-shell:not([hidden])');
    reader?.querySelector('.lesson-reader-body')?.focus?.();
  }

  function isTypingTarget(target){
    return !!target?.closest?.('input,textarea,select,[contenteditable="true"]');
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
      leavePresentationState();
    }
  },true);

  document.addEventListener('keydown',event=>{
    if(!document.body.classList.contains('lesson-presentation-primary') || !shellVisible() || isTypingTarget(event.target)) return;

    if(event.key==='Escape'){
      if(document.fullscreenElement) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showLessonNotes();
      return;
    }

    if(event.key==='ArrowLeft' || event.key==='PageUp'){
      event.preventDefault();
      event.stopImmediatePropagation();
      presentationShell()?.querySelector('[data-deep-prev]:not(:disabled)')?.click();
      return;
    }

    if(event.key==='ArrowRight' || event.key==='PageDown' || event.key===' '){
      event.preventDefault();
      event.stopImmediatePropagation();
      presentationShell()?.querySelector('[data-deep-next]:not(:disabled)')?.click();
    }
  },true);

  document.addEventListener('fullscreenchange',()=>{
    const shell=presentationShell();
    updateFullscreenButton(shell);
    queuePresentationRefresh();
  });

  window.addEventListener('resize',()=>queuePresentationRefresh(),{passive:true});

  window.addEventListener('alevel:lesson-selected',event=>{
    const id=event.detail?.id;
    if(!id) return;
    relabelLaunchers();
    openPresentation(id,false);
    window.setTimeout(()=>{
      relabelLaunchers();
      if(shellVisible()){
        decoratePresentation();
        queuePresentationRefresh();
      }
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