(()=>{
'use strict';
if(window.__ALEVEL_TEXTBOOK_STABILITY_GUARD__)return;
window.__ALEVEL_TEXTBOOK_STABILITY_GUARD__=true;

// The Phase 1–8 textbook enhancers were originally written with their own
// MutationObservers. Several of those enhancers also mutate textbookArticle,
// so many observers could wake one another repeatedly and peg the main thread.
// During the synchronous enhancer boot sequence we temporarily give those
// modules inert observers, then restore the browser implementation immediately.
const NativeMutationObserver=window.MutationObserver;
class InertMutationObserver{
  constructor(){ }
  observe(){ }
  disconnect(){ }
  takeRecords(){return[];}
}
window.MutationObserver=InertMutationObserver;
queueMicrotask(()=>{window.MutationObserver=NativeMutationObserver;});

let refreshTimer=0;
function detail(){
  const s=window.CourseTextbook?.getState?.()||{};
  return{open:!document.getElementById('textbookWorkspace')?.hidden,topicId:s.topicId,chapterIndex:Number(s.chapterIndex)||0,stabilityRefresh:true};
}
function refreshSoon(delay=35){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>{
    window.dispatchEvent(new CustomEvent('textbookchange',{detail:detail()}));
  },delay);
}

// The core textbook renders chapters synchronously. Refresh enhancements only
// after genuine navigation actions rather than after every DOM mutation.
document.addEventListener('click',event=>{
  if(event.target.closest('#textbookNext,#textbookPrevious,.textbook-chapter-button'))refreshSoon();
});
document.addEventListener('change',event=>{
  if(event.target.closest('#textbookMobileChapter,#textbookTopicSelect'))refreshSoon();
});

// Public open/set methods are also used by search, highlights and Paper 3.
const api=window.CourseTextbook;
if(api&&!api.__stabilityWrapped){
  ['open','setTopic','setChapter'].forEach(name=>{
    const original=api[name];
    if(typeof original!=='function')return;
    api[name]=function(...args){
      const result=original.apply(this,args);
      refreshSoon(name==='open'?80:35);
      return result;
    };
  });
  Object.defineProperty(api,'__stabilityWrapped',{value:true,configurable:false});
}

window.ALEVEL_TEXTBOOK_STABILITY={refresh:refreshSoon};
})();