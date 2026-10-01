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
  function sendToTopic(enabled){try{frame?.contentWindow?.postMessage({type:'alevel-mobile-mode',enabled},'*');}catch{}}
  function setToggleLabel(enabled){
    [homeToggle,menuToggle].forEach(button=>{if(!button)return;button.setAttribute('aria-pressed',String(enabled));button.classList.toggle('active',enabled);});
    if(homeToggle)homeToggle.innerHTML=enabled?'▣ Mobile mode ✓':'▣ Mobile mode';
    if(menuToggle)menuToggle.textContent=enabled?'Turn off mobile mode':'Turn on mobile mode';
  }
  function syncDock(){if(!dock)return;const show=body.classList.contains('mobile-ui')&&body.classList.contains('course-mode');dock.hidden=!show;document.documentElement.classList.toggle('mobile-course-open',show);}
  function apply(enabled,{persist=false}={}){
    body.classList.toggle('mobile-ui',!!enabled);document.documentElement.classList.toggle('mobile-ui',!!enabled);body.dataset.mobileMode=enabled?'on':'off';
    if(persist){stored=enabled?'on':'off';localStorage.setItem(key,stored);}
    setToggleLabel(!!enabled);syncDock();sendToTopic(!!enabled);window.dispatchEvent(new CustomEvent('mobilemodechange',{detail:{enabled:!!enabled}}));
  }
  function toggle(){apply(!body.classList.contains('mobile-ui'),{persist:true});}
  function openTopicPicker(){const select=document.getElementById('quickCourseSelect');if(!select)return;select.focus({preventScroll:true});try{if(typeof select.showPicker==='function')select.showPicker();else select.click();}catch{select.click();}}
  function loadLessonEnrichment(){if(window.CourseLessonEnrichment||document.querySelector('script[data-course-lesson-enrichment]'))return;const script=document.createElement('script');script.src='lesson-enrichment.js';script.dataset.courseLessonEnrichment='true';document.body.appendChild(script);}
  function loadTextbook(){
    if(window.CourseTextbook){loadLessonEnrichment();return;}
    if(document.querySelector('script[data-course-textbook="reader"]')){const wait=window.setInterval(()=>{if(window.CourseTextbook){window.clearInterval(wait);loadLessonEnrichment();}},80);window.setTimeout(()=>window.clearInterval(wait),5000);return;}
    const dataScript=document.createElement('script');dataScript.src='textbook-data.js';dataScript.dataset.courseTextbook='data';dataScript.onload=()=>{const reader=document.createElement('script');reader.src='textbook.js';reader.dataset.courseTextbook='reader';reader.onload=loadLessonEnrichment;document.body.appendChild(reader);};document.body.appendChild(dataScript);
  }

  homeToggle?.addEventListener('click',toggle);
  menuToggle?.addEventListener('click',()=>{toggle();document.querySelector('.shell-more[open]')?.removeAttribute('open');});
  document.getElementById('mobileDockHome')?.addEventListener('click',()=>window.CourseApp?.exitCourse?.());
  document.getElementById('mobileDockTopic')?.addEventListener('click',openTopicPicker);
  document.getElementById('mobileDockNotebook')?.addEventListener('click',()=>window.CourseNotebook?.open?.());
  document.getElementById('mobileDockAI')?.addEventListener('click',()=>document.getElementById('coachToggle')?.click());
  document.getElementById('mobileDockComplete')?.addEventListener('click',()=>document.getElementById('markComplete')?.click());
  frame?.addEventListener('load',()=>window.setTimeout(()=>sendToTopic(body.classList.contains('mobile-ui')),80));

  const observer=new MutationObserver(syncDock);observer.observe(body,{attributes:true,attributeFilter:['class']});
  media.addEventListener?.('change',event=>{if(stored!=='on'&&stored!=='off')apply(event.matches);});
  window.CourseMobileMode={enable:()=>apply(true,{persist:true}),disable:()=>apply(false,{persist:true}),toggle,isEnabled:()=>body.classList.contains('mobile-ui'),useAuto:()=>{stored=null;localStorage.removeItem(key);apply(media.matches);}};
  apply(preferred());loadTextbook();
})();

(()=>{
  if(!document.querySelector('link[href="auth.css"]')){const style=document.createElement('link');style.rel='stylesheet';style.href='auth.css';document.head.appendChild(style);}
  if(!document.querySelector('script[src="auth.js"]')){const auth=document.createElement('script');auth.type='module';auth.src='auth.js';document.body.appendChild(auth);}
  if(!document.querySelector('script[src="billing-client.js"]')){const billing=document.createElement('script');billing.type='module';billing.src='billing-client.js';document.body.appendChild(billing);}
})();

(()=>{
  if(document.querySelector('script[src="subject-tool-bridge.js"]'))return;
  const script=document.createElement('script');
  script.src='subject-tool-bridge.js';
  script.async=false;
  document.body.appendChild(script);
})();
