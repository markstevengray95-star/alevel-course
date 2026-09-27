(()=>{
  'use strict';

  const markingUrl=(window.ALEVEL_MARKING_APP_URL||localStorage.getItem('alevel-marking-app-url')||'https://alevel-marking.vercel.app').replace(/\/$/,'');
  const tools={
    practicals:{
      id:'practicals',
      label:'Required Practicals',
      eyebrow:'AQA Physics 7408 · Practicals 1–12',
      url:'tools/practicals/index.html',
      repo:'https://github.com/markstevengray95-star/Alevel-prac',
      external:false
    },
    marking:{
      id:'marking',
      label:'Exam Practice & Marking',
      eyebrow:'AQA A-Level Physics · Exam practice',
      url:markingUrl,
      repo:'https://github.com/markstevengray95-star/alevel-marking-',
      external:true
    }
  };

  const practicalViews=['home','skills','quiz','equations','circuit'];
  const body=document.body;
  const home=document.getElementById('courseHome');
  const workspace=document.getElementById('workspaceSection');
  const jumpbar=document.getElementById('courseJumpbar');
  const toolWorkspace=document.getElementById('toolWorkspace');
  const frame=document.getElementById('toolFrame');
  const title=document.getElementById('toolTitle');
  const eyebrow=document.getElementById('toolEyebrow');
  const openFull=document.getElementById('toolOpenFull');
  const source=document.getElementById('toolSource');
  const externalNote=document.getElementById('toolExternalNote');
  const loading=document.getElementById('toolLoading');
  const loadingText=document.getElementById('toolLoadingText');
  const practicalWrap=document.getElementById('practicalSectionWrap');
  const practicalPicker=document.getElementById('practicalSectionPicker');
  let active=null;
  let lastCourseState=null;
  let practicalObserver=null;

  function setAreaState(area){
    document.querySelectorAll('.course-area-button').forEach(button=>button.setAttribute('aria-current',button.dataset.area===area?'page':'false'));
    document.querySelectorAll('[data-tool-area]').forEach(button=>button.setAttribute('aria-current',button.dataset.toolArea===area?'page':'false'));
    body.dataset.courseArea=area;
  }

  function setLoading(show,text='Opening course tool…'){
    if(loadingText)loadingText.textContent=text;
    if(loading)loading.hidden=!show;
  }

  function setShellForTool(open){
    body.classList.toggle('tool-mode',open);
    if(open){
      body.classList.remove('home-mode','course-mode');
      if(home)home.hidden=true;
      if(workspace)workspace.hidden=true;
      if(jumpbar)jumpbar.hidden=true;
      if(toolWorkspace)toolWorkspace.hidden=false;
      document.documentElement.classList.add('tool-open');
    }else{
      body.classList.remove('tool-mode');
      body.classList.add('home-mode');
      if(home)home.hidden=false;
      if(workspace)workspace.hidden=true;
      if(jumpbar)jumpbar.hidden=true;
      if(toolWorkspace)toolWorkspace.hidden=true;
      document.documentElement.classList.remove('tool-open');
    }
  }

  function clearPracticalBridge(){
    practicalObserver?.disconnect?.();
    practicalObserver=null;
    if(practicalWrap)practicalWrap.hidden=true;
  }

  function integratePracticalLab(){
    if(!active||active.id!=='practicals'||!frame)return;
    let doc;
    try{doc=frame.contentDocument;}catch{return;}
    if(!doc?.documentElement)return;

    doc.documentElement.classList.add('course-tool-embedded');
    if(!doc.getElementById('course-tool-embed-style')){
      const style=doc.createElement('style');
      style.id='course-tool-embed-style';
      style.textContent=`
        .lab-header{display:none!important}
        footer{display:none!important}
        main{padding-top:12px!important;padding-bottom:26px!important}
        body{min-height:100vh!important}
        .view{scroll-margin-top:12px!important}
        @media(max-width:760px){main{padding-top:7px!important}.hero-panel{margin-top:0!important}}
      `;
      doc.head?.appendChild(style);
    }

    if(practicalWrap)practicalWrap.hidden=false;
    const syncPicker=()=>{
      if(!practicalPicker)return;
      const activeView=[...doc.querySelectorAll('.view.active')].find(Boolean);
      const id=(activeView?.id||'').replace(/^view-/,'');
      practicalPicker.value=practicalViews.includes(id)?id:'home';
    };
    syncPicker();
    practicalObserver?.disconnect?.();
    practicalObserver=new MutationObserver(syncPicker);
    doc.querySelectorAll('.view').forEach(view=>practicalObserver.observe(view,{attributes:true,attributeFilter:['class']}));
  }

  function openPracticalSection(view){
    if(!active||active.id!=='practicals'||!frame)return;
    try{
      const doc=frame.contentDocument;
      const target=doc?.querySelector(`.lab-header [data-view="${view}"], [data-view="${view}"]`);
      target?.click();
      frame.contentWindow?.scrollTo?.({top:0,behavior:'smooth'});
    }catch{}
  }

  function openTool(id){
    const tool=tools[id];
    if(!tool)return;
    const courseState=window.CourseApp?.getState?.();
    if(courseState?.topicId)lastCourseState=courseState;
    document.getElementById('coachClose')?.click();
    window.CourseNotebook?.close?.();
    if(body.classList.contains('course-mode'))window.CourseApp?.exitCourse?.({scroll:false});

    active=tool;
    clearPracticalBridge();
    setAreaState(tool.id);
    if(title)title.textContent=tool.label;
    if(eyebrow)eyebrow.textContent=tool.eyebrow;
    if(openFull){openFull.href=tool.url;openFull.title=`Open ${tool.label} in a new tab`;}
    if(source)source.href=tool.repo;
    if(externalNote){
      externalNote.hidden=!tool.external;
      externalNote.textContent=tool.external?'The marking engine stays on its own secure deployment so AI marking continues to work. If embedding is blocked, use Open full app.':'';
    }
    setLoading(true,tool.id==='practicals'?'Opening Practical Lab…':'Opening Exam Practice & Marking…');
    setShellForTool(true);
    if(frame){frame.title=tool.label;if(frame.getAttribute('src')!==tool.url)frame.src=tool.url;else frame.src=tool.url;}
    window.scrollTo({top:0,left:0,behavior:'instant'});
    window.dispatchEvent(new CustomEvent('coursetoolchange',{detail:{open:true,tool:{...tool}}}));
  }

  function closeTool({scroll=true}={}){
    clearPracticalBridge();
    if(frame)frame.src='about:blank';
    active=null;
    setAreaState('learn');
    setLoading(false);
    setShellForTool(false);
    if(scroll){
      const target=document.getElementById('courseTools');
      window.setTimeout(()=>target?.scrollIntoView({behavior:'smooth',block:'start'}),20);
    }
    window.dispatchEvent(new CustomEvent('coursetoolchange',{detail:{open:false}}));
  }

  function resumeLearning(){
    const state=lastCourseState||window.CourseApp?.getState?.();
    if(body.classList.contains('tool-mode'))closeTool({scroll:false});
    setAreaState('learn');
    if(state?.topicId){
      window.setTimeout(()=>window.CourseApp?.openTopic?.(state.topicId,true,state.moduleIndex||0),20);
      return;
    }
    window.setTimeout(()=>document.getElementById('courseMap')?.scrollIntoView({behavior:'smooth',block:'start'}),20);
  }

  function showLearningMap(){
    if(body.classList.contains('tool-mode'))closeTool({scroll:false});
    if(body.classList.contains('course-mode'))window.CourseApp?.exitCourse?.({scroll:false});
    setAreaState('learn');
    window.setTimeout(()=>document.getElementById('courseMap')?.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  function showTools(){
    if(body.classList.contains('tool-mode'))closeTool({scroll:false});
    else if(body.classList.contains('course-mode'))window.CourseApp?.exitCourse?.({scroll:false});
    setAreaState('learn');
    window.setTimeout(()=>document.getElementById('courseTools')?.scrollIntoView({behavior:'smooth',block:'start'}),40);
  }

  document.querySelectorAll('[data-course-tool]').forEach(button=>button.addEventListener('click',()=>openTool(button.dataset.courseTool)));
  document.getElementById('navLearn')?.addEventListener('click',showLearningMap);
  document.getElementById('cycleLearn')?.addEventListener('click',showLearningMap);
  document.getElementById('toolAreaLearn')?.addEventListener('click',resumeLearning);
  document.getElementById('toolAreaPracticals')?.addEventListener('click',()=>openTool('practicals'));
  document.getElementById('toolAreaMarking')?.addEventListener('click',()=>openTool('marking'));
  practicalPicker?.addEventListener('change',()=>openPracticalSection(practicalPicker.value));
  document.getElementById('toolBack')?.addEventListener('click',()=>closeTool());
  document.getElementById('toolNotebook')?.addEventListener('click',()=>window.CourseNotebook?.open?.({topicId:'all'}));
  document.getElementById('toolAI')?.addEventListener('click',()=>document.getElementById('coachToggle')?.click());
  document.getElementById('toolReload')?.addEventListener('click',()=>{if(frame&&active){setLoading(true,`Reloading ${active.label}…`);frame.src=active.url;}});
  document.getElementById('mobileDockTools')?.addEventListener('click',showTools);

  frame?.addEventListener('load',()=>{
    if(!active){setLoading(false);return;}
    if(active.id==='practicals')window.setTimeout(integratePracticalLab,40);
    else clearPracticalBridge();
    window.setTimeout(()=>setLoading(false),120);
  });

  window.addEventListener('coursecontextchange',event=>{
    if(event.detail?.topicId)lastCourseState=event.detail;
    if(event.detail?.courseOpen)setAreaState('learn');
  });

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!body.classList.contains('tool-mode'))return;
    if(document.getElementById('notebookPanel')?.classList.contains('open'))return;
    if(document.getElementById('coachPanel')?.classList.contains('open'))return;
    const tag=document.activeElement?.tagName||'';
    if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;
    event.preventDefault();
    closeTool();
  });

  setAreaState('learn');
  window.CourseTools={tools,openTool,closeTool,showTools,resumeLearning,getActive:()=>active?{...active}:null,setMarkingUrl:url=>{if(url){localStorage.setItem('alevel-marking-app-url',String(url).replace(/\/$/,''));location.reload();}}};
})();
