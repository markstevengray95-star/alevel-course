(()=>{
'use strict';
if(window.__ALEVEL_TEXTBOOK_STABILITY_GUARD__)return;
window.__ALEVEL_TEXTBOOK_STABILITY_GUARD__=true;

// The textbook enhancement phases were originally written with independent
// MutationObservers that watch and also mutate #textbookArticle. When several
// phases are active together those observers can repeatedly wake one another
// and saturate the main thread. Give only the textbook boot sequence inert
// observers, then restore the native browser implementation after every phase
// has completed its startup path.
const NativeMutationObserver=window.MutationObserver;
class InertMutationObserver{
  constructor(){ }
  observe(){ }
  disconnect(){ }
  takeRecords(){return[];}
}
window.MutationObserver=InertMutationObserver;

let restored=false;
function restoreNativeObserver(){
  if(restored)return;
  restored=true;
  window.MutationObserver=NativeMutationObserver;
}
// If the bundle runs while the document is still loading, phase modules add
// their own DOMContentLoaded handlers after this guard. Restore on the next
// task so all of those handlers construct inert observers first.
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>setTimeout(restoreNativeObserver,0),{once:true});
}else{
  setTimeout(restoreNativeObserver,0);
}

let refreshTimer=0;
function detail(){
  const s=window.CourseTextbook?.getState?.()||{};
  return{open:!document.getElementById('textbookWorkspace')?.hidden,topicId:s.topicId,chapterIndex:Number(s.chapterIndex)||0,stabilityRefresh:true};
}
function refreshSoon(delay=35){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>window.dispatchEvent(new CustomEvent('textbookchange',{detail:detail()})),delay);
}

// The base textbook replaces the article synchronously. Re-run enhancements
// only after actual navigation, never after arbitrary child-list mutations.
document.addEventListener('click',event=>{
  if(event.target.closest('#textbookNext,#textbookPrevious,.textbook-chapter-button'))refreshSoon();
});
document.addEventListener('change',event=>{
  if(event.target.closest('#textbookMobileChapter,#textbookTopicSelect'))refreshSoon();
});

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

window.ALEVEL_TEXTBOOK_STABILITY={refresh:refreshSoon,restore:restoreNativeObserver};
})();