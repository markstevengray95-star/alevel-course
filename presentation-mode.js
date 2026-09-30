(() => {
  'use strict';

  // Keep first paint deliberately small. Teacher-wide audits, the presentation
  // library and the adaptive dashboard used to synchronously rebuild/audit the
  // entire course before the home screen could paint. Those tools remain in the
  // repository but are no longer part of automatic application startup.
  const homeStyles = [
    'lesson-automarking.css',
    'lesson-navigator.css'
  ];
  const coreStyles = [
    'lesson-phase3.css',
    'lesson-spec-depth.css',
    'lesson-deepening.css',
    'lesson-presentation-primary.css',
    'lesson-presentation-phase3.css',
    'lesson-presentation-controls.css',
    'lesson-presentation-progressive.css',
    'lesson-presentation-visuals.css',
    'lesson-presentation-practical.css',
    'lesson-presenter-view.css'
  ];
  const extraStyles = [
    'lesson-activities.css',
    'lesson-simulations.css',
    'lesson-assessment.css',
    'lesson-progression.css',
    'lesson-teacher-tools.css',
    'lesson-astar.css'
  ];

  const homeScripts = [
    {src:'lesson-automarking.js', ready:()=>!!window.ALEVEL_AUTOMARK},
    {src:'lesson-navigator.js', ready:()=>!!window.ALEVEL_LESSON_NAVIGATOR},
    {src:'lesson-reader-quicknav.js', ready:()=>!!window.ALEVEL_LESSON_QUICKNAV}
  ];
  const coreScripts = [
    {src:'lesson-phase3.js', ready:()=>!!window.ALEVEL_PHASE3},
    {src:'lesson-spec-depth.js', ready:()=>!!window.ALEVEL_SPEC_DEPTH},
    {src:'lesson-deepening.js', ready:()=>!!window.ALEVEL_DEEPENING},
    {src:'lesson-presentation-primary.js', ready:()=>!!window.ALEVEL_PRIMARY_PRESENTATION},
    {src:'lesson-presentation-controls.js', ready:()=>!!window.ALEVEL_PRESENTATION_CONTROLS},
    {src:'lesson-presentation-progressive.js', ready:()=>!!window.ALEVEL_PROGRESSIVE_REVEAL},
    {src:'lesson-presentation-visuals.js', ready:()=>!!window.ALEVEL_PRESENTATION_VISUALS},
    {src:'lesson-presentation-practical.js', ready:()=>!!window.ALEVEL_PRACTICAL_PRESENTATION},
    {src:'lesson-presenter-view.js', ready:()=>!!window.ALEVEL_PRESENTER_VIEW}
  ];
  const extraScripts = [
    {src:'lesson-activities.js', ready:()=>!!window.ALEVEL_ACTIVITIES},
    {src:'lesson-simulations.js', ready:()=>!!window.ALEVEL_SIMULATIONS},
    {src:'lesson-assessment.js', ready:()=>!!window.ALEVEL_ASSESSMENT},
    {src:'lesson-progression.js', ready:()=>!!window.ALEVEL_PROGRESSION},
    {src:'lesson-teacher-tools.js', ready:()=>!!window.ALEVEL_TEACHER_TOOLS},
    {src:'lesson-astar.js', ready:()=>!!window.ALEVEL_ASTAR}
  ];

  let homeLoading=false, homeLoaded=false;
  let coreLoading=false, coreLoaded=false;
  let extraLoading=false, extraLoaded=false;
  const homeCallbacks=[], coreCallbacks=[], extraCallbacks=[];

  function addStyles(files){
    files.forEach(href=>{
      if(document.querySelector(`link[href="${href}"]`))return;
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
      document.head.appendChild(link);
    });
  }

  function loadSequence(items,index,onDone){
    if(index>=items.length){onDone();return;}
    const item=items[index];
    if(item.ready()){loadSequence(items,index+1,onDone);return;}
    const next=()=>loadSequence(items,index+1,onDone);
    const existing=document.querySelector(`script[src="${item.src}"]`);
    if(existing){
      if(item.ready()){next();return;}
      let finished=false;
      const finish=()=>{if(finished)return;finished=true;next();};
      existing.addEventListener('load',finish,{once:true});
      existing.addEventListener('error',finish,{once:true});
      window.setTimeout(finish,4000);
      return;
    }
    const script=document.createElement('script');
    script.src=item.src;
    script.async=false;
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;next();};
    script.addEventListener('load',finish,{once:true});
    script.addEventListener('error',finish,{once:true});
    window.setTimeout(finish,4000);
    document.body.appendChild(script);
  }

  function runCallbacks(queue){queue.splice(0).forEach(fn=>{try{fn();}catch{}});}
  function replayActiveLesson(){
    const lesson=window.ALEVEL_ACTIVE_LESSON;
    if(lesson)queueMicrotask(()=>window.dispatchEvent(new CustomEvent('alevel:lesson-selected',{detail:lesson})));
  }

  function installPresentationInteractionFix(){
    if(document.documentElement.dataset.presentationInteractionFix==='1')return;
    document.documentElement.dataset.presentationInteractionFix='1';
    const style=document.createElement('style');
    style.id='lesson-presentation-interaction-fix';
    style.textContent=`
      .lesson-presentation-primary .lesson-presentation-shell .phase3-deck-side{position:relative;z-index:2147483000;pointer-events:auto!important}
      .lesson-presentation-primary .lesson-presentation-shell .phase3-deck-tools{position:relative;z-index:2147483001;pointer-events:auto!important}
      .lesson-presentation-primary .lesson-presentation-shell .phase3-deck-tools button{position:relative;z-index:2147483002;pointer-events:auto!important}
      .lesson-presentation-primary .lesson-presentation-shell .phase3-deck-tools [data-deep-close]{
        display:inline-flex!important;align-items:center;justify-content:center;
        position:fixed!important;top:14px!important;right:18px!important;
        z-index:2147483646!important;pointer-events:auto!important;visibility:visible!important;
        opacity:1!important;transform:none!important;min-width:118px!important;min-height:44px!important;
      }
    `;
    document.head.appendChild(style);
  }

  function finishHome(){
    homeLoaded=true;homeLoading=false;
    document.documentElement.classList.add('lesson-automarking-ready','lesson-navigation-ready');
    runCallbacks(homeCallbacks);
  }
  function finishCore(){
    coreLoaded=true;coreLoading=false;
    installPresentationInteractionFix();
    document.documentElement.classList.add('lesson-presentation-engine-ready');
    window.dispatchEvent(new CustomEvent('alevel:presentation-engine-ready'));
    runCallbacks(coreCallbacks);
  }
  function finishExtras(){
    extraLoaded=true;extraLoading=false;
    document.documentElement.classList.add('lesson-enhancements-ready');
    runCallbacks(extraCallbacks);replayActiveLesson();
  }

  function loadHome(callback){
    if(homeLoaded){if(callback)try{callback();}catch{};return;}
    if(callback)homeCallbacks.push(callback);
    if(homeLoading)return;
    homeLoading=true;addStyles(homeStyles);loadSequence(homeScripts,0,finishHome);
  }
  function loadCore(callback){
    if(coreLoaded){if(callback)try{callback();}catch{};return;}
    if(callback)coreCallbacks.push(callback);
    if(coreLoading)return;
    coreLoading=true;addStyles(coreStyles);loadSequence(coreScripts,0,finishCore);
  }
  function loadExtras(callback){
    if(extraLoaded){if(callback)try{callback();}catch{};return;}
    if(callback)extraCallbacks.push(callback);
    if(extraLoading)return;
    extraLoading=true;addStyles(extraStyles);loadSequence(extraScripts,0,finishExtras);
  }

  function activateLessonPresentation(){
    loadHome();
    loadCore(()=>replayActiveLesson());
  }

  async function registerOfflineSupport(){
    if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
    try{
      const hadController=!!navigator.serviceWorker.controller;
      const registrations=await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg=>reg.unregister().catch(()=>false)));
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(key=>key.startsWith('alevel-physics-offline-')).map(key=>caches.delete(key)));
      }
      document.documentElement.classList.add('offline-recovery-mode');
      const reloadKey='alevel-recovery-network-reload-v2';
      if(hadController&&!sessionStorage.getItem(reloadKey)){
        sessionStorage.setItem(reloadKey,'1');
        location.reload();
      }
    }catch{}
  }

  function installLoadingFailsafe(){
    const topicFrame=document.getElementById('topicFrame');
    const topicShell=document.querySelector('.workspace-shell');
    let topicTimer=0;
    const clearTopic=()=>{
      if(topicTimer)clearTimeout(topicTimer);
      topicTimer=0;
      topicShell?.classList.remove('topic-loading');
      topicShell?.setAttribute('aria-busy','false');
    };
    const armTopic=()=>{
      if(topicTimer)clearTimeout(topicTimer);
      topicTimer=window.setTimeout(clearTopic,5000);
    };
    if(topicFrame){
      topicFrame.addEventListener('load',clearTopic);
      new MutationObserver(mutations=>{
        if(mutations.some(m=>m.type==='attributes'&&m.attributeName==='src'))armTopic();
      }).observe(topicFrame,{attributes:true,attributeFilter:['src']});
    }

    const toolFrame=document.getElementById('toolFrame');
    const toolLoading=document.getElementById('toolLoading');
    let toolTimer=0;
    const clearTool=()=>{if(toolTimer)clearTimeout(toolTimer);toolTimer=0;if(toolLoading)toolLoading.hidden=true;};
    const armTool=()=>{if(toolTimer)clearTimeout(toolTimer);toolTimer=window.setTimeout(clearTool,6500);};
    toolFrame?.addEventListener('load',clearTool);
    window.addEventListener('coursetoolchange',event=>event.detail?.open?armTool():clearTool());
  }

  window.addEventListener('alevel:lesson-selected',()=>{
    if(!coreLoaded&&!coreLoading)activateLessonPresentation();
  });

  const start=()=>{
    registerOfflineSupport();
    installLoadingFailsafe();
    if(window.ALEVEL_ACTIVE_LESSON||location.hash.startsWith('#lesson='))activateLessonPresentation();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.ALEVEL_PRESENTATION_MODE={
    load:loadCore,
    loadHome,
    loadExtras,
    get homeLoaded(){return homeLoaded;},
    get loaded(){return coreLoaded;},
    get extrasLoaded(){return extraLoaded;}
  };
})();