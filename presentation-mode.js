(() => {
  const styles = ['lesson-phase3.css','lesson-activities.css','lesson-simulations.css'];
  const scripts = [
    {src:'lesson-phase3.js', ready:()=>!!window.ALEVEL_PHASE3},
    {src:'lesson-activities.js', ready:()=>!!window.ALEVEL_ACTIVITIES},
    {src:'lesson-simulations.js', ready:()=>!!window.ALEVEL_SIMULATIONS}
  ];

  function loadStyles(){
    styles.forEach(href=>{
      if(document.querySelector(`link[href="${href}"]`)) return;
      const link=document.createElement('link');
      link.rel='stylesheet'; link.href=href; document.head.appendChild(link);
    });
  }

  function loadScripts(index=0){
    if(index>=scripts.length) return;
    const item=scripts[index];
    if(item.ready()){ loadScripts(index+1); return; }
    const existing=document.querySelector(`script[src="${item.src}"]`);
    if(existing){ existing.addEventListener('load',()=>loadScripts(index+1),{once:true}); return; }
    const script=document.createElement('script');
    script.src=item.src; script.async=false;
    script.addEventListener('load',()=>loadScripts(index+1),{once:true});
    document.body.appendChild(script);
  }

  function loadEnhancements(){ loadStyles(); loadScripts(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',loadEnhancements,{once:true}); else loadEnhancements();
})();