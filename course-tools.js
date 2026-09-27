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
  const topicSectionKey='alevel-course-topic-sections-v1';
  const progressKey='alevel-course-progress-v1';
  const locationKey='alevel-course-location-v2';
  const notebookKey='alevel-physics-student-notebook-v1';
  const body=document.body;
  const home=document.getElementById('courseHome');
  const workspace=document.getElementById('workspaceSection');
  const jumpbar=document.getElementById('courseJumpbar');
  const topicFrame=document.getElementById('topicFrame');
  const topicShell=document.querySelector('.workspace-shell');
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
  let lastToolTrigger=null;
  let topicSections=safeJson(localStorage.getItem(topicSectionKey),{});

  function safeJson(value,fallback){try{return JSON.parse(value)||fallback}catch{return fallback}}
  function setAreaState(area){
    document.querySelectorAll('.course-area-button').forEach(button=>button.setAttribute('aria-current',button.dataset.area===area?'page':'false'));
    document.querySelectorAll('[data-tool-area]').forEach(button=>button.setAttribute('aria-current',button.dataset.toolArea===area?'page':'false'));
    body.dataset.courseArea=area;
  }

  function courseTopics(){return window.CourseApp?.topics||[];}
  function courseProgress(){return safeJson(localStorage.getItem(progressKey),{});}
  function courseLocation(){return safeJson(localStorage.getItem(locationKey),{});}
  function notebookNotes(){const value=safeJson(localStorage.getItem(notebookKey),[]);return Array.isArray(value)?value:[];}
  function yearTopics(year){return courseTopics().filter(topic=>topic.year===year);}
  function completedInYear(year){const done=courseProgress();return yearTopics(year).filter(topic=>done[topic.id]).length;}
  function resumeState(){
    const topics=courseTopics();
    const stored=courseLocation();
    const progress=courseProgress();
    const topic=topics.find(item=>item.id===stored.topic)||topics.find(item=>!progress[item.id])||topics[0];
    const moduleIndex=Math.min(Math.max(Number(stored.module)||0,0),Math.max(0,(topic?.modules?.length||1)-1));
    return {topic,moduleIndex};
  }

  function ensureHomeDashboard(){
    if(!home||document.getElementById('homeLearningDashboard'))return;
    const intro=home.querySelector('.home-intro');
    const cycle=home.querySelector('.study-cycle');
    const map=document.getElementById('courseMap');
    if(!intro||!cycle||!map)return;

    const dashboard=document.createElement('section');
    dashboard.id='homeLearningDashboard';
    dashboard.className='home-learning-dashboard';
    dashboard.setAttribute('aria-label','Learning overview');
    dashboard.innerHTML=`
      <button class="home-resume-card" id="homeResumeCard" type="button">
        <span class="home-resume-kicker">Resume learning</span>
        <span class="home-resume-main"><strong id="homeResumeTitle">Measurements and their errors</strong><span id="homeResumeAction">Continue →</span></span>
        <span class="home-resume-detail" id="homeResumeDetail">AQA 3.1 · Year 12</span>
        <span class="home-resume-progress"><span id="homeResumeProgressBar"></span></span>
      </button>
      <div class="home-overview-stats" aria-label="Course overview">
        <div class="home-overview-stat"><span>Year 12</span><strong id="homeYear12Stat">0 / 5</strong><small>AQA 3.1–3.5</small></div>
        <div class="home-overview-stat"><span>Year 13</span><strong id="homeYear13Stat">0 / 3</strong><small>AQA 3.6–3.8</small></div>
        <div class="home-overview-stat"><span>Notebook</span><strong id="homeNotesStat">0</strong><small>saved notes</small></div>
      </div>`;
    cycle.before(dashboard);

    const stages=document.createElement('div');
    stages.id='courseStageStrip';
    stages.className='course-stage-strip';
    stages.setAttribute('aria-label','A-Level course stages');
    stages.innerHTML=`
      <div class="course-stage year12"><span class="course-stage-number">01</span><span><small>Year 12</small><strong>Core foundations</strong><em>AQA 3.1–3.5 · 5 topics</em></span><b id="year12StageProgress">0 / 5</b></div>
      <span class="course-stage-connector" aria-hidden="true">→</span>
      <div class="course-stage year13"><span class="course-stage-number">02</span><span><small>Year 13</small><strong>Advanced core</strong><em>AQA 3.6–3.8 · 3 topics</em></span><b id="year13StageProgress">0 / 3</b></div>`;
    map.querySelector('.home-section-head')?.after(stages);

    document.getElementById('homeResumeCard')?.addEventListener('click',()=>{
      const {topic,moduleIndex}=resumeState();
      if(topic)window.CourseApp?.openTopic?.(topic.id,true,moduleIndex);
    });
    updateHomeDashboard();
  }

  function updateHomeDashboard(){
    if(!document.getElementById('homeLearningDashboard'))return;
    const topics=courseTopics();
    const {topic,moduleIndex}=resumeState();
    const progress=courseProgress();
    const done=topics.filter(item=>progress[item.id]).length;
    const notes=notebookNotes();
    const y12Done=completedInYear('Year 12');
    const y13Done=completedInYear('Year 13');
    const y12Total=yearTopics('Year 12').length||5;
    const y13Total=yearTopics('Year 13').length||3;
    const section=topic?topicSections[`${topic.id}:${moduleIndex}`]:null;
    const module=topic?.modules?.[moduleIndex];
    const detail=[topic?.code,topic?.year,module&&topic?.modules?.length>1?module.label:'',section?.label].filter(Boolean).join(' · ');
    const resumeTitle=document.getElementById('homeResumeTitle');
    const resumeDetail=document.getElementById('homeResumeDetail');
    const resumeAction=document.getElementById('homeResumeAction');
    const resumeBar=document.getElementById('homeResumeProgressBar');
    if(resumeTitle)resumeTitle.textContent=topic?.title||'Start the A-Level Physics course';
    if(resumeDetail)resumeDetail.textContent=detail||'AQA 7408 · Start with Measurements';
    if(resumeAction)resumeAction.textContent=done===topics.length?'Review →':done?'Continue →':'Start →';
    if(resumeBar)resumeBar.style.width=`${topics.length?Math.round(done/topics.length*100):0}%`;
    const y12=document.getElementById('homeYear12Stat');if(y12)y12.textContent=`${y12Done} / ${y12Total}`;
    const y13=document.getElementById('homeYear13Stat');if(y13)y13.textContent=`${y13Done} / ${y13Total}`;
    const noteStat=document.getElementById('homeNotesStat');if(noteStat)noteStat.textContent=String(notes.length);
    const s12=document.getElementById('year12StageProgress');if(s12)s12.textContent=`${y12Done} / ${y12Total}`;
    const s13=document.getElementById('year13StageProgress');if(s13)s13.textContent=`${y13Done} / ${y13Total}`;
    document.querySelector('.course-stage.year12')?.classList.toggle('complete',y12Done>=y12Total);
    document.querySelector('.course-stage.year13')?.classList.toggle('complete',y13Done>=y13Total);
  }

  function setLoading(show,text='Opening course tool…'){
    if(loadingText)loadingText.textContent=text;
    if(loading)loading.hidden=!show;
  }

  function setTopicLoading(show){
    if(!topicShell)return;
    topicShell.classList.toggle('topic-loading',!!show);
    topicShell.setAttribute('aria-busy',show?'true':'false');
  }

  function topicStateKey(state=window.CourseApp?.getState?.()){
    return state?.topicId?`${state.topicId}:${Number(state.moduleIndex)||0}`:'';
  }

  function saveTopicSection(index,label=''){
    const state=window.CourseApp?.getState?.();
    const key=topicStateKey(state);
    const value=Number(index);
    if(!key||!Number.isInteger(value))return;
    topicSections[key]={index:value,label:String(label||'').trim()};
    localStorage.setItem(topicSectionKey,JSON.stringify(topicSections));
    updateHomeDashboard();
  }

  function restoreTopicSection(){
    if(!topicFrame?.contentWindow)return;
    const key=topicStateKey();
    const saved=key?topicSections[key]:null;
    if(!Number.isInteger(saved?.index))return;
    topicFrame.contentWindow.postMessage({type:'alevel-topic-restore-section',index:saved.index},'*');
  }

  function focusActiveTopicCard(topicId){
    if(!topicId||body.classList.contains('tool-mode')||body.classList.contains('course-mode'))return;
    const card=[...document.querySelectorAll('.topic-card')].find(item=>item.dataset.id===topicId);
    card?.focus?.({preventScroll:true});
  }

  function focusHomeTool(toolId){
    const target=document.querySelector(`.course-tool-card[data-course-tool="${toolId}"]`);
    target?.focus?.({preventScroll:true});
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
      updateHomeDashboard();
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
    if(frame){frame.title=tool.label;frame.src=tool.url;}
    window.scrollTo({top:0,left:0,behavior:'instant'});
    window.dispatchEvent(new CustomEvent('coursetoolchange',{detail:{open:true,tool:{...tool}}}));
  }

  function closeTool({scroll=true}={}){
    const closingTool=active?.id||lastToolTrigger?.dataset?.courseTool||'';
    clearPracticalBridge();
    if(frame)frame.src='about:blank';
    active=null;
    setAreaState('learn');
    setLoading(false);
    setShellForTool(false);
    if(scroll){
      const target=document.getElementById('courseTools');
      window.setTimeout(()=>{
        target?.scrollIntoView({behavior:'smooth',block:'start'});
        focusHomeTool(closingTool);
      },20);
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
    updateHomeDashboard();
    window.setTimeout(()=>document.getElementById('courseMap')?.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  function showTools(){
    if(body.classList.contains('tool-mode'))closeTool({scroll:false});
    else if(body.classList.contains('course-mode'))window.CourseApp?.exitCourse?.({scroll:false});
    setAreaState('learn');
    updateHomeDashboard();
    window.setTimeout(()=>document.getElementById('courseTools')?.scrollIntoView({behavior:'smooth',block:'start'}),40);
  }

  document.querySelectorAll('[data-course-tool]').forEach(button=>button.addEventListener('click',()=>{lastToolTrigger=button;openTool(button.dataset.courseTool);}));
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
  document.getElementById('reloadFrame')?.addEventListener('click',()=>setTopicLoading(true),{capture:true});
  document.getElementById('resetProgress')?.addEventListener('click',()=>window.setTimeout(updateHomeDashboard,0));
  document.getElementById('markComplete')?.addEventListener('click',()=>window.setTimeout(updateHomeDashboard,0));

  frame?.addEventListener('load',()=>{
    if(!active){setLoading(false);return;}
    if(active.id==='practicals')window.setTimeout(integratePracticalLab,40);
    else clearPracticalBridge();
    window.setTimeout(()=>setLoading(false),120);
  });

  if(topicFrame){
    new MutationObserver(mutations=>{
      if(mutations.some(mutation=>mutation.type==='attributes'&&mutation.attributeName==='src'))setTopicLoading(true);
    }).observe(topicFrame,{attributes:true,attributeFilter:['src']});
    topicFrame.addEventListener('load',()=>{
      window.setTimeout(restoreTopicSection,20);
      window.setTimeout(()=>setTopicLoading(false),160);
    });
  }

  const notebookList=document.getElementById('notebookList');
  if(notebookList)new MutationObserver(updateHomeDashboard).observe(notebookList,{childList:true,subtree:true});

  window.addEventListener('message',event=>{
    if(!topicFrame||event.source!==topicFrame.contentWindow)return;
    if(event.data?.type==='alevel-topic-section')saveTopicSection(event.data.index,event.data.label);
  });

  window.addEventListener('coursecontextchange',event=>{
    if(event.detail?.topicId)lastCourseState=event.detail;
    if(event.detail?.courseOpen)setAreaState('learn');
    updateHomeDashboard();
    if(event.detail?.courseOpen===false&&event.detail?.topicId){
      const topicId=event.detail.topicId;
      window.setTimeout(()=>focusActiveTopicCard(topicId),35);
    }
  });
  window.addEventListener('focus',updateHomeDashboard);
  window.addEventListener('storage',event=>{if([progressKey,locationKey,notebookKey,topicSectionKey].includes(event.key))updateHomeDashboard();});

  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!body.classList.contains('tool-mode'))return;
    if(document.getElementById('notebookPanel')?.classList.contains('open'))return;
    if(document.getElementById('coachPanel')?.classList.contains('open'))return;
    const tag=document.activeElement?.tagName||'';
    if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;
    event.preventDefault();
    closeTool();
  });

  ensureHomeDashboard();
  setAreaState('learn');
  window.CourseTools={tools,openTool,closeTool,showTools,resumeLearning,updateHomeDashboard,getActive:()=>active?{...active}:null,setMarkingUrl:url=>{if(url){localStorage.setItem('alevel-marking-app-url',String(url).replace(/\/$/,''));location.reload();}}};
})();