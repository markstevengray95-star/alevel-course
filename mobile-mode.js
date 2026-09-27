(()=>{
  'use strict';
  const key='alevel-course-mobile-mode-v1';
  const media=window.matchMedia('(max-width: 820px), (pointer: coarse)');
  const body=document.body;
  const frame=document.getElementById('topicFrame');
  const homeToggle=document.getElementById('homeMobileModeBtn');
  const menuToggle=document.getElementById('mobileModeToggle');
  const dock=document.getElementById('mobileStudyDock');
  let stored=localStorage.getItem(key);

  function preferred(){return stored==='on'?true:stored==='off'?false:media.matches;}
  function sendToTopic(enabled){
    try{frame?.contentWindow?.postMessage({type:'alevel-mobile-mode',enabled},'*');}catch{}
  }
  function setToggleLabel(enabled){
    [homeToggle,menuToggle].forEach(button=>{
      if(!button)return;
      button.setAttribute('aria-pressed',String(enabled));
      button.classList.toggle('active',enabled);
    });
    if(homeToggle)homeToggle.innerHTML=enabled?'▣ Mobile mode ✓':'▣ Mobile mode';
    if(menuToggle)menuToggle.textContent=enabled?'Turn off mobile mode':'Turn on mobile mode';
  }
  function syncDock(){
    if(!dock)return;
    const show=body.classList.contains('mobile-ui')&&body.classList.contains('course-mode');
    dock.hidden=!show;
    document.documentElement.classList.toggle('mobile-course-open',show);
  }
  function apply(enabled,{persist=false}={}){
    body.classList.toggle('mobile-ui',!!enabled);
    document.documentElement.classList.toggle('mobile-ui',!!enabled);
    body.dataset.mobileMode=enabled?'on':'off';
    if(persist){stored=enabled?'on':'off';localStorage.setItem(key,stored);}
    setToggleLabel(!!enabled);
    syncDock();
    sendToTopic(!!enabled);
    window.dispatchEvent(new CustomEvent('mobilemodechange',{detail:{enabled:!!enabled}}));
  }
  function toggle(){apply(!body.classList.contains('mobile-ui'),{persist:true});}
  function openTopicPicker(){
    const select=document.getElementById('quickCourseSelect');
    if(!select)return;
    select.focus({preventScroll:true});
    try{if(typeof select.showPicker==='function')select.showPicker();else select.click();}catch{select.click();}
  }

  homeToggle?.addEventListener('click',toggle);
  menuToggle?.addEventListener('click',()=>{toggle();document.querySelector('.shell-more[open]')?.removeAttribute('open');});
  document.getElementById('mobileDockHome')?.addEventListener('click',()=>window.CourseApp?.exitCourse?.());
  document.getElementById('mobileDockTopic')?.addEventListener('click',openTopicPicker);
  document.getElementById('mobileDockNotebook')?.addEventListener('click',()=>window.CourseNotebook?.open?.());
  document.getElementById('mobileDockAI')?.addEventListener('click',()=>document.getElementById('coachToggle')?.click());
  document.getElementById('mobileDockComplete')?.addEventListener('click',()=>document.getElementById('markComplete')?.click());
  frame?.addEventListener('load',()=>window.setTimeout(()=>sendToTopic(body.classList.contains('mobile-ui')),80));

  const observer=new MutationObserver(syncDock);
  observer.observe(body,{attributes:true,attributeFilter:['class']});
  media.addEventListener?.('change',event=>{if(stored!=='on'&&stored!=='off')apply(event.matches);});

  window.CourseMobileMode={
    enable:()=>apply(true,{persist:true}),
    disable:()=>apply(false,{persist:true}),
    toggle,
    isEnabled:()=>body.classList.contains('mobile-ui'),
    useAuto:()=>{stored=null;localStorage.removeItem(key);apply(media.matches);}
  };
  apply(preferred());
})();