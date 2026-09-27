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
  let active=null;

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

  function openTool(id){
    const tool=tools[id];
    if(!tool)return;
    document.getElementById('coachClose')?.click();
    window.CourseNotebook?.close?.();
    if(document.body.classList.contains('course-mode'))window.CourseApp?.exitCourse?.({scroll:false});
    active=tool;
    if(title)title.textContent=tool.label;
    if(eyebrow)eyebrow.textContent=tool.eyebrow;
    if(openFull){openFull.href=tool.url;openFull.title=`Open ${tool.label} in a new tab`;}
    if(source)source.href=tool.repo;
    if(externalNote){
      externalNote.hidden=!tool.external;
      externalNote.textContent=tool.external?'The marking app keeps its own secure Next.js/API deployment so AI marking and generated questions continue to work. Use Open full app if your browser blocks an embedded view.':'';
    }
    setShellForTool(true);
    if(frame){frame.title=tool.label;frame.src=tool.url;}
    window.scrollTo({top:0,left:0,behavior:'instant'});
    window.dispatchEvent(new CustomEvent('coursetoolchange',{detail:{open:true,tool:{...tool}}}));
  }

  function closeTool({scroll=true}={}){
    if(frame)frame.src='about:blank';
    active=null;
    setShellForTool(false);
    if(scroll){
      const target=document.getElementById('courseTools');
      window.setTimeout(()=>target?.scrollIntoView({behavior:'smooth',block:'start'}),20);
    }
    window.dispatchEvent(new CustomEvent('coursetoolchange',{detail:{open:false}}));
  }

  function showTools(){
    if(body.classList.contains('tool-mode')){closeTool({scroll:false});}
    else if(body.classList.contains('course-mode'))window.CourseApp?.exitCourse?.({scroll:false});
    window.setTimeout(()=>document.getElementById('courseTools')?.scrollIntoView({behavior:'smooth',block:'start'}),40);
  }

  document.querySelectorAll('[data-course-tool]').forEach(button=>button.addEventListener('click',()=>openTool(button.dataset.courseTool)));
  document.getElementById('toolBack')?.addEventListener('click',()=>closeTool());
  document.getElementById('toolNotebook')?.addEventListener('click',()=>window.CourseNotebook?.open?.({topicId:'all'}));
  document.getElementById('toolAI')?.addEventListener('click',()=>document.getElementById('coachToggle')?.click());
  document.getElementById('toolReload')?.addEventListener('click',()=>{if(frame&&active)frame.src=active.url;});
  document.getElementById('mobileDockTools')?.addEventListener('click',showTools);

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!body.classList.contains('tool-mode'))return;
    if(document.getElementById('notebookPanel')?.classList.contains('open'))return;
    if(document.getElementById('coachPanel')?.classList.contains('open'))return;
    const tag=document.activeElement?.tagName||'';
    if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;
    event.preventDefault();
    closeTool();
  });

  window.CourseTools={tools,openTool,closeTool,showTools,getActive:()=>active?{...active}:null,setMarkingUrl:url=>{if(url){localStorage.setItem('alevel-marking-app-url',String(url).replace(/\/$/,''));location.reload();}}};
})();
