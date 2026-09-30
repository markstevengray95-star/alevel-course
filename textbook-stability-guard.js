(()=>{
'use strict';
if(window.__ALEVEL_TEXTBOOK_STABILITY_GUARD__)return;
window.__ALEVEL_TEXTBOOK_STABILITY_GUARD__=true;

// Several textbook enhancement phases both observe and mutate #textbookArticle.
// With all phases enabled those observers can wake one another indefinitely and
// saturate the main thread. Keep MutationObserver fully functional everywhere
// else in the app, but make observation of the textbook article a no-op.
const NativeMutationObserver=window.MutationObserver;
if(typeof NativeMutationObserver==='function'){
  class TextbookSafeMutationObserver{
    constructor(callback){
      this._native=new NativeMutationObserver(callback);
      this._blocked=false;
    }
    observe(target,options){
      if(target?.id==='textbookArticle'){
        this._blocked=true;
        return;
      }
      this._native.observe(target,options);
    }
    disconnect(){this._native.disconnect();}
    takeRecords(){return this._native.takeRecords();}
  }
  window.MutationObserver=TextbookSafeMutationObserver;
}

let refreshTimer=0;
function detail(){
  const s=window.CourseTextbook?.getState?.()||{};
  return{
    open:!document.getElementById('textbookWorkspace')?.hidden,
    topicId:s.topicId,
    chapterIndex:Number(s.chapterIndex)||0,
    stabilityRefresh:true
  };
}
function refreshSoon(delay=40){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>{
    window.dispatchEvent(new CustomEvent('textbookchange',{detail:detail()}));
  },delay);
}

// The base textbook replaces the article synchronously. Refresh enhancements
// only after genuine navigation, never after arbitrary article DOM mutations.
document.addEventListener('click',event=>{
  if(event.target.closest('#textbookNext,#textbookPrevious,.textbook-chapter-button'))refreshSoon();
});
document.addEventListener('change',event=>{
  if(event.target.closest('#textbookMobileChapter,#textbookTopicSelect'))refreshSoon();
});

// Search, highlights and the Paper 3 map navigate through the public API rather
// than the visible controls, so wrap those calls with the same debounced refresh.
const api=window.CourseTextbook;
if(api&&!api.__stabilityWrapped){
  ['open','setTopic','setChapter'].forEach(name=>{
    const original=api[name];
    if(typeof original!=='function')return;
    api[name]=function(...args){
      const result=original.apply(this,args);
      refreshSoon(name==='open'?90:40);
      return result;
    };
  });
  Object.defineProperty(api,'__stabilityWrapped',{value:true,configurable:false});
}

window.ALEVEL_TEXTBOOK_STABILITY={refresh:refreshSoon};
})();