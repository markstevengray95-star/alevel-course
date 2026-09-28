(() => {
  'use strict';

  const coreStyles = [
    'lesson-phase3.css',
    'lesson-spec-depth.css',
    'lesson-deepening.css',
    'lesson-presentation-primary.css'
  ];
  const extraStyles = [
    'lesson-activities.css',
    'lesson-simulations.css',
    'lesson-assessment.css',
    'lesson-progression.css',
    'lesson-teacher-tools.css',
    'lesson-astar.css'
  ];

  const coreScripts = [
    {src:'lesson-phase3.js', ready:()=>!!window.ALEVEL_PHASE3},
    {src:'lesson-spec-depth.js', ready:()=>!!window.ALEVEL_SPEC_DEPTH},
    {src:'lesson-deepening.js', ready:()=>!!window.ALEVEL_DEEPENING},
    {src:'lesson-presentation-primary.js', ready:()=>!!window.ALEVEL_PRIMARY_PRESENTATION}
  ];
  const extraScripts = [
    {src:'lesson-activities.js', ready:()=>!!window.ALEVEL_ACTIVITIES},
    {src:'lesson-simulations.js', ready:()=>!!window.ALEVEL_SIMULATIONS},
    {src:'lesson-assessment.js', ready:()=>!!window.ALEVEL_ASSESSMENT},
    {src:'lesson-progression.js', ready:()=>!!window.ALEVEL_PROGRESSION},
    {src:'lesson-teacher-tools.js', ready:()=>!!window.ALEVEL_TEACHER_TOOLS},
    {src:'lesson-astar.js', ready:()=>!!window.ALEVEL_ASTAR}
  ];

  let coreLoading=false;
  let coreLoaded=false;
  let extraLoading=false;
  let extraLoaded=false;
  const coreCallbacks=[];
  const extraCallbacks=[];

  function addStyles(files){
    files.forEach(href=>{
      if(document.querySelector(`link[href="${href}"]`)) return;
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
      document.head.appendChild(link);
    });
  }

  function loadSequence(items,index,onDone){
    if(index>=items.length){ onDone(); return; }
    const item=items[index];
    if(item.ready()){
      loadSequence(items,index+1,onDone);
      return;
    }
    const existing=document.querySelector(`script[src="${item.src}"]`);
    if(existing){
      if(item.ready()){
        loadSequence(items,index+1,onDone);
        return;
      }
      const next=()=>loadSequence(items,index+1,onDone);
      existing.addEventListener('load',next,{once:true});
      existing.addEventListener('error',next,{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src=item.src;
    script.async=false;
    const next=()=>loadSequence(items,index+1,onDone);
    script.addEventListener('load',next,{once:true});
    script.addEventListener('error',next,{once:true});
    document.body.appendChild(script);
  }

  function runCallbacks(queue){
    queue.splice(0).forEach(fn=>{try{fn();}catch{}});
  }

  function replayActiveLesson(){
    const lesson=window.ALEVEL_ACTIVE_LESSON;
    if(!lesson) return;
    queueMicrotask(()=>window.dispatchEvent(new CustomEvent('alevel:lesson-selected',{detail:lesson})));
  }

  function finishCore(){
    coreLoaded=true;
    coreLoading=false;
    document.documentElement.classList.add('lesson-presentation-engine-ready');
    runCallbacks(coreCallbacks);
  }

  function finishExtras(){
    extraLoaded=true;
    extraLoading=false;
    document.documentElement.classList.add('lesson-enhancements-ready');
    runCallbacks(extraCallbacks);
    replayActiveLesson();
  }

  function loadCore(callback){
    if(coreLoaded){
      if(callback){try{callback();}catch{}}
      return;
    }
    if(callback) coreCallbacks.push(callback);
    if(coreLoading) return;
    coreLoading=true;
    addStyles(coreStyles);
    loadSequence(coreScripts,0,finishCore);
  }

  function loadExtras(callback){
    if(extraLoaded){
      if(callback){try{callback();}catch{}}
      return;
    }
    if(callback) extraCallbacks.push(callback);
    if(extraLoading) return;
    extraLoading=true;
    addStyles(extraStyles);
    loadSequence(extraScripts,0,finishExtras);
  }

  function deferExtras(){
    if(extraLoaded||extraLoading) return;
    const run=()=>loadExtras();
    if('requestIdleCallback' in window) window.requestIdleCallback(run,{timeout:1800});
    else window.setTimeout(run,700);
  }

  function activateLessonPresentation(){
    loadCore(()=>{
      replayActiveLesson();
      deferExtras();
    });
  }

  window.addEventListener('alevel:lesson-selected',()=>{
    if(!coreLoaded&&!coreLoading) activateLessonPresentation();
    else if(coreLoaded) deferExtras();
  });

  const start=()=>{
    if(window.ALEVEL_ACTIVE_LESSON||location.hash.startsWith('#lesson=')) activateLessonPresentation();
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.ALEVEL_PRESENTATION_MODE={
    load:loadCore,
    loadExtras,
    get loaded(){return coreLoaded;},
    get extrasLoaded(){return extraLoaded;}
  };
})();