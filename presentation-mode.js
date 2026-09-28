(() => {
  const styles = ['lesson-phase3.css','lesson-deepening.css','lesson-activities.css','lesson-simulations.css','lesson-assessment.css','lesson-progression.css','lesson-teacher-tools.css','lesson-astar.css'];
  const scripts = [
    {src:'lesson-phase3.js', ready:()=>!!window.ALEVEL_PHASE3},
    {src:'lesson-deepening.js', ready:()=>!!window.ALEVEL_DEEPENING},
    {src:'lesson-activities.js', ready:()=>!!window.ALEVEL_ACTIVITIES},
    {src:'lesson-simulations.js', ready:()=>!!window.ALEVEL_SIMULATIONS},
    {src:'lesson-assessment.js', ready:()=>!!window.ALEVEL_ASSESSMENT},
    {src:'lesson-progression.js', ready:()=>!!window.ALEVEL_PROGRESSION},
    {src:'lesson-teacher-tools.js', ready:()=>!!window.ALEVEL_TEACHER_TOOLS},
    {src:'lesson-astar.js', ready:()=>!!window.ALEVEL_ASTAR}
  ];
  let loading=false;
  let loaded=false;
  const callbacks=[];

  function loadStyles(){
    styles.forEach(href=>{
      if(document.querySelector(`link[href="${href}"]`)) return;
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=href;
      document.head.appendChild(link);
    });
  }

  function finish(){
    loaded=true;
    loading=false;
    document.documentElement.classList.add('lesson-enhancements-ready');
    callbacks.splice(0).forEach(fn=>{try{fn();}catch{}});
  }

  function loadScripts(index=0){
    if(index>=scripts.length){finish();return;}
    const item=scripts[index];
    if(item.ready()){loadScripts(index+1);return;}
    const existing=document.querySelector(`script[src="${item.src}"]`);
    if(existing){
      if(item.ready()){loadScripts(index+1);return;}
      existing.addEventListener('load',()=>loadScripts(index+1),{once:true});
      existing.addEventListener('error',()=>loadScripts(index+1),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src=item.src;
    script.async=false;
    script.addEventListener('load',()=>loadScripts(index+1),{once:true});
    script.addEventListener('error',()=>loadScripts(index+1),{once:true});
    document.body.appendChild(script);
  }

  function loadEnhancements(callback){
    if(callback)callbacks.push(callback);
    if(loaded){finish();return;}
    if(loading)return;
    loading=true;
    loadStyles();
    loadScripts();
  }

  function replayActiveLesson(){
    const lesson=window.ALEVEL_ACTIVE_LESSON;
    if(!lesson)return;
    queueMicrotask(()=>window.dispatchEvent(new CustomEvent('alevel:lesson-selected',{detail:lesson})));
  }

  window.addEventListener('alevel:lesson-selected',()=>{
    if(loaded||loading)return;
    loadEnhancements(replayActiveLesson);
  });

  const start=()=>{
    if(window.ALEVEL_ACTIVE_LESSON||location.hash.startsWith('#lesson='))loadEnhancements(replayActiveLesson);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.ALEVEL_PRESENTATION_MODE={load:loadEnhancements,get loaded(){return loaded;}};
})();