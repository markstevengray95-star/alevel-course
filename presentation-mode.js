(() => {
  'use strict';

  // Stability-first startup: keep the presentation engine small, then load
  // only the lesson extras included in the learner's current access tier.
  const homeStyles = ['lesson-navigator.css'];
  const coreStyles = [
    'lesson-phase3.css',
    'lesson-deepening.css',
    'lesson-presentation-primary.css',
    'lesson-presentation-phase3.css',
    'lesson-slide-design.css'
  ];

  const homeScripts = [
    {src:'lesson-navigator.js', ready:()=>!!window.ALEVEL_LESSON_NAVIGATOR},
    {src:'lesson-reader-quicknav.js', ready:()=>!!window.ALEVEL_LESSON_QUICKNAV}
  ];
  const coreScripts = [
    {src:'lesson-phase3.js', ready:()=>!!window.ALEVEL_PHASE3},
    {src:'lesson-slide-design.js', ready:()=>!!window.ALEVEL_SLIDE_DESIGN},
    {src:'lesson-deepening.js', ready:()=>!!window.ALEVEL_DEEPENING},
    {src:'lesson-presentation-primary.js', ready:()=>!!window.ALEVEL_PRIMARY_PRESENTATION}
  ];

  const extraDefinitions = [
    {feature:'simulations',style:'lesson-simulations.css',script:{src:'lesson-simulations.js',ready:()=>!!window.ALEVEL_SIMULATIONS}},
    {feature:'activities',style:'lesson-activities.css',script:{src:'lesson-activities.js',ready:()=>!!window.ALEVEL_ACTIVITIES}},
    {feature:'automarking',style:'lesson-automarking.css',script:{src:'lesson-automarking.js',ready:()=>!!window.ALEVEL_AUTOMARK}},
    {feature:'mastery',style:'lesson-assessment.css',script:{src:'lesson-assessment.js',ready:()=>!!window.ALEVEL_ASSESSMENT}},
    {feature:'progression',style:'lesson-progression.css',script:{src:'lesson-progression.js',ready:()=>!!window.ALEVEL_PROGRESSION}},
    {feature:'astar',style:'lesson-astar.css',script:{src:'lesson-astar.js',ready:()=>!!window.ALEVEL_ASTAR}},
    {feature:'teacherTools',style:'lesson-teacher-tools.css',script:{src:'lesson-teacher-tools.js',ready:()=>!!window.ALEVEL_TEACHER_TOOLS}}
  ];

  let accessPromise=null;
  let billingPromise=null;
  let homeLoading=false, homeLoaded=false;
  let coreLoading=false, coreLoaded=false;
  let extraLoading=false, extraLoaded=false, extrasForPlan='';
  const homeCallbacks=[], coreCallbacks=[], extraCallbacks=[];

  function ensureBillingLayer(){
    if(window.ALEVEL_BILLING)return Promise.resolve(window.ALEVEL_BILLING);
    if(billingPromise)return billingPromise;
    billingPromise=new Promise(resolve=>{
      const existing=document.querySelector('script[src="billing-client.js"]');
      let finished=false;
      const finish=()=>{if(finished)return;finished=true;resolve(window.ALEVEL_BILLING||null);};
      if(existing){existing.addEventListener('load',finish,{once:true});existing.addEventListener('error',finish,{once:true});window.setTimeout(finish,4000);return;}
      const script=document.createElement('script');script.src='billing-client.js';script.async=false;
      script.addEventListener('load',finish,{once:true});script.addEventListener('error',finish,{once:true});window.setTimeout(finish,4000);
      document.body.appendChild(script);
    });
    return billingPromise;
  }

  function ensureAccessLayer(){
    if(!document.querySelector('link[href="pricing-access.css"]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='pricing-access.css';document.head.appendChild(link);
    }
    if(window.ALEVEL_ACCESS)return ensureBillingLayer().then(()=>window.ALEVEL_ACCESS);
    if(accessPromise)return accessPromise;
    accessPromise=new Promise(resolve=>{
      const existing=document.querySelector('script[src="pricing-access.js"]');
      let finished=false;
      const finish=()=>{
        if(finished)return;finished=true;
        ensureBillingLayer().finally(()=>resolve(window.ALEVEL_ACCESS||null));
      };
      if(existing){existing.addEventListener('load',finish,{once:true});existing.addEventListener('error',finish,{once:true});window.setTimeout(finish,4000);return;}
      const script=document.createElement('script');script.src='pricing-access.js';script.async=false;
      script.addEventListener('load',finish,{once:true});script.addEventListener('error',finish,{once:true});window.setTimeout(finish,4000);
      document.body.appendChild(script);
    });
    return accessPromise;
  }

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
      .lesson-presentation-primary .lesson-presentation-shell .phase3-deck-side{position:relative;z-index:50;pointer-events:auto!important}
      .lesson-presentation-primary .lesson-presentation-shell .phase3-deck-tools{position:relative;z-index:60;pointer-events:auto!important}
      .lesson-presentation-primary .lesson-presentation-shell .phase3-deck-tools button{pointer-events:auto!important}
    `;
    document.head.appendChild(style);
  }

  function finishHome(){
    homeLoaded=true;homeLoading=false;
    document.documentElement.classList.add('lesson-navigation-ready');
    runCallbacks(homeCallbacks);
  }
  function finishCore(){
    coreLoaded=true;coreLoading=false;
    installPresentationInteractionFix();
    document.documentElement.classList.add('lesson-presentation-engine-ready');
    window.dispatchEvent(new CustomEvent('alevel:presentation-engine-ready'));
    runCallbacks(coreCallbacks);
  }
  function finishExtras(plan){
    extraLoaded=true;extraLoading=false;extrasForPlan=plan;
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
  function allowedExtras(){
    const access=window.ALEVEL_ACCESS;
    if(!access?.has)return [];
    return extraDefinitions.filter(item=>access.has(item.feature));
  }
  function loadExtras(callback){
    const plan=window.ALEVEL_ACCESS?.plan||'free';
    if(extraLoaded&&extrasForPlan===plan){if(callback)try{callback();}catch{};return;}
    if(callback)extraCallbacks.push(callback);
    if(extraLoading)return;
    extraLoading=true;
    const allowed=allowedExtras();
    if(!allowed.length){finishExtras(plan);return;}
    addStyles(allowed.map(item=>item.style));
    loadSequence(allowed.map(item=>item.script),0,()=>finishExtras(plan));
  }

  function activateLessonPresentation(){
    loadHome();
    loadCore(()=>{
      replayActiveLesson();
      if(window.ALEVEL_ACCESS?.has?.('simulations'))window.setTimeout(()=>loadExtras(),0);
    });
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
    ensureAccessLayer().then(()=>{
      if(!coreLoaded&&!coreLoading)activateLessonPresentation();
      else if(window.ALEVEL_ACCESS?.has?.('simulations'))loadExtras();
    });
  });

  window.addEventListener('alevel:plan-changed',()=>{
    extraLoaded=false;extrasForPlan='';
    if(window.ALEVEL_ACTIVE_LESSON&&window.ALEVEL_ACCESS?.has?.('simulations'))window.setTimeout(()=>loadExtras(),0);
  });

  const start=()=>{
    loadHome();
    ensureAccessLayer().finally(()=>{
      registerOfflineSupport();
      installLoadingFailsafe();
      if(window.ALEVEL_ACTIVE_LESSON||location.hash.startsWith('#lesson='))activateLessonPresentation();
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.ALEVEL_PRESENTATION_MODE={
    load:loadCore,
    loadHome,
    loadExtras,
    ensureAccess:ensureAccessLayer,
    get homeLoaded(){return homeLoaded;},
    get loaded(){return coreLoaded;},
    get extrasLoaded(){return extraLoaded;}
  };
})();
