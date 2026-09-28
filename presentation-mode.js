(() => {
  const cssHref = 'lesson-phase3.css';
  const scriptSrc = 'lesson-phase3.js';
  function loadPhase3(){
    if(!document.querySelector(`link[href="${cssHref}"]`)){
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }
    if(window.ALEVEL_PHASE3 || document.querySelector(`script[src="${scriptSrc}"]`)) return;
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.defer = true;
    document.body.appendChild(script);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadPhase3); else loadPhase3();
})();