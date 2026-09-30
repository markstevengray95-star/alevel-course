const courseConfig=window.ALEVEL_COURSE_CONFIG;
if(!courseConfig||!Array.isArray(courseConfig.topics)||!courseConfig.topics.length){throw new Error('A valid A-Level course configuration must be loaded before app.js');}

const topics=courseConfig.topics;
const storageKeys=courseConfig.storage||{};
const progressKey=storageKeys.progress||`alevel-${courseConfig.id||'course'}-progress-v1`;
const locationKey=storageKeys.location||`alevel-${courseConfig.id||'course'}-location-v1`;
let progress=safeJson(localStorage.getItem(progressKey),{});
let activeTopic=topics[0];
let activeModule=0;
let courseOpen=false;

const grid=document.getElementById('topicGrid');
const frame=document.getElementById('topicFrame');
const tabs=document.getElementById('moduleTabs');
const quickSelect=document.getElementById('quickCourseSelect');
const courseRail=document.getElementById('courseRail');
const courseHome=document.getElementById('courseHome');
const workspace=document.getElementById('workspaceSection');
const jumpbar=document.getElementById('courseJumpbar');

function safeJson(value,fallback){try{return JSON.parse(value)||fallback}catch{return fallback}}
function saveProgress(){localStorage.setItem(progressKey,JSON.stringify(progress));}
function topicIndex(){return Math.max(0,topics.findIndex(t=>t.id===activeTopic.id));}
function moduleUrl(){return activeTopic.modules[activeModule]?.path||activeTopic.modules[0].path;}
function dispatchContext(){window.dispatchEvent(new CustomEvent('coursecontextchange',{detail:getState()}));}

function applyCourseIdentity(){
  const subject=courseConfig.subject||'Course';
  const board=courseConfig.board||'';
  const specCode=courseConfig.specCode||'';
  document.body.dataset.subject=courseConfig.id||subject.toLowerCase();
  document.body.dataset.examBoard=board.toLowerCase();
  if(courseConfig.metaTitle)document.title=courseConfig.metaTitle;
  const meta=document.querySelector('meta[name="description"]');
  if(meta&&courseConfig.metaDescription)meta.setAttribute('content',courseConfig.metaDescription);
  const mark=document.querySelector('#brandHome .brand-mark');
  const brand=document.querySelector('#brandHome .brand');
  const brandSpec=document.querySelector('#brandHome small');
  if(mark)mark.textContent=courseConfig.brandMark||mark.textContent;
  if(brand)brand.textContent=courseConfig.displayName||`A-Level ${subject}`;
  if(brandSpec)brandSpec.textContent=[board,specCode].filter(Boolean).join(' ');
  const intro=document.querySelector('.home-intro');
  if(intro){
    const eyebrow=intro.querySelector('.eyebrow');
    const title=intro.querySelector('h1');
    const description=intro.querySelector('p');
    if(eyebrow)eyebrow.textContent=courseConfig.heroEyebrow||`${board} A-level ${subject} ${specCode}`.trim();
    if(title)title.textContent=courseConfig.heroTitle||`Your ${subject} course.`;
    if(description&&courseConfig.heroDescription)description.textContent=courseConfig.heroDescription;
  }
  const map=document.getElementById('courseMap');
  if(map)map.setAttribute('aria-label',`${board} ${subject} core topics`.trim());
  if(frame)frame.title=`A-level ${subject} topic app`;
  const toolEyebrow=document.getElementById('toolEyebrow');
  if(toolEyebrow)toolEyebrow.textContent=[board,subject,specCode].filter(Boolean).join(' ');
}

function writeCourseUrl(mode='replace'){
  const state={subject:courseConfig.id,topic:activeTopic.id,module:activeModule,view:'course'};
  localStorage.setItem(locationKey,JSON.stringify({topic:activeTopic.id,module:activeModule}));
  const url=new URL(location.href);
  url.searchParams.set('view','course');
  url.searchParams.set('topic',activeTopic.id);
  url.searchParams.set('module',String(activeModule));
  if(courseConfig.id&&courseConfig.id!=='physics')url.searchParams.set('subject',courseConfig.id);
  history[mode==='push'?'pushState':'replaceState'](state,'',url);
}

function writeHomeUrl(){
  const url=new URL(location.href);
  url.searchParams.delete('view');
  url.searchParams.delete('topic');
  url.searchParams.delete('module');
  history.replaceState({subject:courseConfig.id,view:'home'},'',url);
}

function setCourseMode(open,{scroll=true,updateUrl=true}={}){
  courseOpen=!!open;
  document.body.classList.toggle('course-mode',courseOpen);
  document.body.classList.toggle('home-mode',!courseOpen);
  document.body.classList.toggle('multi-module-topic',courseOpen&&activeTopic.modules.length>1);
  courseHome.hidden=courseOpen;
  workspace.hidden=!courseOpen;
  jumpbar.hidden=!courseOpen;
  if(!courseOpen){
    if(updateUrl)writeHomeUrl();
    if(scroll)window.scrollTo({top:0,behavior:'smooth'});
    document.getElementById('brandHome')?.focus({preventScroll:true});
  }else if(scroll){
    workspace.scrollIntoView({behavior:'smooth',block:'start'});
  }
}

function renderHomeSummary(){
  const done=topics.filter(t=>progress[t.id]).length;
  const summary=document.getElementById('homeProgressSummary');
  const range=courseConfig.topicRange||`${topics.length} topics`;
  if(summary)summary.textContent=done?`${done} of ${topics.length} complete · ${range}`:`${topics.length} topics · ${range}`;
  const stored=safeJson(localStorage.getItem(locationKey),{});
  const resume=topics.find(t=>t.id===stored.topic)||topics.find(t=>!progress[t.id])||topics[0];
  const continueBtn=document.getElementById('continueBtn');
  if(continueBtn)continueBtn.textContent=done===topics.length?`Review ${resume.short}`:`Continue ${resume.short}`;
}

function renderProgress(){
 const done=topics.filter(t=>progress[t.id]).length;
 document.getElementById('progressText').textContent=`${done} / ${topics.length} complete`;
 document.getElementById('progressFill').style.width=`${done/topics.length*100}%`;
 document.getElementById('markComplete').textContent=progress[activeTopic.id]?'Completed ✓':'Mark complete';
 document.getElementById('markComplete').classList.toggle('complete-button',!!progress[activeTopic.id]);
 [...grid.children].forEach((el,i)=>el.classList.toggle('complete',!!progress[topics[i].id]));
 courseRail?.querySelectorAll('[data-topic-id]').forEach(btn=>btn.classList.toggle('complete',!!progress[btn.dataset.topicId]));
 renderHomeSummary();
}

function renderGrid(){
 grid.innerHTML=topics.map((t)=>{
   const status=progress[t.id]?'Completed ✓':(t.id===activeTopic.id?'Continue →':'Open →');
   return `<article class="topic-card ${t.id===activeTopic.id?'active':''} ${progress[t.id]?'complete':''}" data-id="${t.id}" tabindex="0" role="button" aria-label="Open ${t.title}"><span class="topic-index">${t.code}</span><h3>${t.title}</h3><p>${t.description}</p><div class="topic-footer"><span>${t.year}</span><span>${status}</span></div></article>`;
 }).join('');
 grid.querySelectorAll('.topic-card').forEach(card=>{
   const open=()=>openTopic(card.dataset.id,true,0);
   card.addEventListener('click',open);
   card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
 });
}

function renderQuickNavigation(){
 quickSelect.innerHTML=topics.map((t,i)=>`<option value="${t.id}">${i+1}. ${t.code.replace(`${courseConfig.board||'AQA'} `,'')} · ${t.title}</option>`).join('');
 quickSelect.value=activeTopic.id;
 const i=topicIndex();
 document.getElementById('coursePosition').textContent=`${i+1} / ${topics.length}`;
 document.getElementById('prevCourse').disabled=i===0;
 document.getElementById('nextCourse').disabled=i===topics.length-1;
 document.getElementById('workspacePrev').disabled=i===0;
 document.getElementById('workspaceNext').disabled=i===topics.length-1;
}

function updateWorkspaceMetadata(){
 document.getElementById('workspaceCode').textContent=activeTopic.code;
 document.getElementById('workspaceTitle').textContent=activeTopic.title;
 document.getElementById('workspaceDescription').textContent=activeTopic.description;
 document.getElementById('workspaceYear').textContent=activeTopic.year;
 document.body.classList.toggle('multi-module-topic',courseOpen&&activeTopic.modules.length>1);
 renderTabs();
 renderQuickNavigation();
 renderGrid();
 renderProgress();
}

function openTopic(id,scroll=false,moduleIndex=0,{historyMode='auto'}={}){
 const wasOpen=courseOpen;
 activeTopic=topics.find(t=>t.id===id)||topics[0];
 activeModule=Math.min(Math.max(Number(moduleIndex)||0,0),activeTopic.modules.length-1);
 updateWorkspaceMetadata();
 loadModule();
 setCourseMode(true,{scroll:false,updateUrl:false});
 const mode=historyMode==='auto'?(wasOpen?'replace':'push'):historyMode;
 if(mode!=='none')writeCourseUrl(mode);
 dispatchContext();
 if(scroll)workspace.scrollIntoView({behavior:'smooth',block:'start'});
}

function exitCourse({scroll=true,updateUrl=true}={}){
 document.querySelector('.shell-more[open]')?.removeAttribute('open');
 setCourseMode(false,{scroll,updateUrl});
 renderGrid();
 renderHomeSummary();
 dispatchContext();
}

function changeModule(index){
 activeModule=Math.min(Math.max(Number(index)||0,0),activeTopic.modules.length-1);
 renderTabs();
 loadModule();
 writeCourseUrl('replace');
 dispatchContext();
}

function renderTabs(){
 const count=activeTopic.modules.length;
 document.getElementById('modulePrev').hidden=count<2;
 document.getElementById('moduleNext').hidden=count<2;
 if(count<2){tabs.classList.add('hidden');tabs.innerHTML='';return;}
 tabs.classList.remove('hidden');
 tabs.setAttribute('aria-label',`${activeTopic.title} modules`);
 tabs.innerHTML=activeTopic.modules.map((m,i)=>`<button type="button" class="${i===activeModule?'active':''}" data-index="${i}" aria-pressed="${i===activeModule}">${m.label}</button>`).join('');
 tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>changeModule(Number(b.dataset.index))));
}

function loadModule(){
 const m=activeTopic.modules[activeModule];
 if(frame.getAttribute('src')!==m.path)frame.src=m.path;
 document.getElementById('moduleLabel').textContent=m.label;
 document.getElementById('modulePosition').textContent=activeTopic.modules.length>1?`Module ${activeModule+1} of ${activeTopic.modules.length}`:`${activeTopic.code} specialist app`;
 document.getElementById('sourceLink').href=m.repo;
 document.getElementById('openModule').href=m.path;
 document.getElementById('modulePrev').disabled=activeModule===0;
 document.getElementById('moduleNext').disabled=activeModule===activeTopic.modules.length-1;
}

function previousTopic(){const i=topicIndex();if(i>0)openTopic(topics[i-1].id,true,0);}
function nextTopic(){const i=topicIndex();if(i<topics.length-1)openTopic(topics[i+1].id,true,0);}
function previousModule(){if(activeModule>0)changeModule(activeModule-1);}
function nextModule(){if(activeModule<activeTopic.modules.length-1)changeModule(activeModule+1);}

function getState(){
 const m=activeTopic.modules[activeModule];
 return {subjectId:courseConfig.id,subject:courseConfig.subject,board:courseConfig.board,specCode:courseConfig.specCode,topicId:activeTopic.id,topicIndex:topicIndex(),code:activeTopic.code,title:activeTopic.title,short:activeTopic.short,year:activeTopic.year,description:activeTopic.description,moduleIndex:activeModule,moduleLabel:m.label,modulePath:m.path,complete:!!progress[activeTopic.id],courseOpen};
}

function getActiveContext(){
 const state=getState();let pageText='';let pageTitle='';
 try{
   const doc=frame.contentDocument;
   if(doc){
     pageTitle=doc.title||'';
     const candidates=[...doc.querySelectorAll('h1,h2,h3,p,li,.equation,.formula-chip,.lesson-lead,.lesson-content,.textbook-section,.worked,.worked-example')];
     const visible=candidates.filter(el=>{const s=frame.contentWindow.getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0;});
     pageText=visible.map(el=>el.textContent.trim()).filter(Boolean).join('\n').replace(/\n{3,}/g,'\n\n').slice(0,6500);
     if(!pageText)pageText=(doc.body?.innerText||'').trim().slice(0,6500);
   }
 }catch{}
 return {...state,pageTitle,pageText};
}

function restoreLocation(){
 const params=new URLSearchParams(location.search);
 const stored=safeJson(localStorage.getItem(locationKey),{});
 const requested=params.get('topic')||stored.topic||topics[0].id;
 const topic=topics.find(t=>t.id===requested)||topics[0];
 const moduleParam=params.has('module')?Number(params.get('module')):Number(stored.module||0);
 return {topic:topic.id,module:Number.isFinite(moduleParam)?moduleParam:0,open:params.get('view')==='course'};
}

document.getElementById('markComplete').addEventListener('click',()=>{progress[activeTopic.id]=!progress[activeTopic.id];saveProgress();renderProgress();renderGrid();});
document.getElementById('resetProgress').addEventListener('click',()=>{progress={};saveProgress();renderProgress();renderGrid();});
document.getElementById('reloadFrame').addEventListener('click',()=>{frame.src=moduleUrl();document.querySelector('.shell-more[open]')?.removeAttribute('open');});
document.getElementById('continueBtn').addEventListener('click',()=>{const stored=safeJson(localStorage.getItem(locationKey),{});const next=topics.find(t=>t.id===stored.topic)||topics.find(t=>!progress[t.id])||topics[0];openTopic(next.id,true,stored.module||0);});
quickSelect.addEventListener('change',()=>openTopic(quickSelect.value,true,0));
document.getElementById('prevCourse').addEventListener('click',previousTopic);
document.getElementById('nextCourse').addEventListener('click',nextTopic);
document.getElementById('workspacePrev').addEventListener('click',previousTopic);
document.getElementById('workspaceNext').addEventListener('click',nextTopic);
document.getElementById('modulePrev').addEventListener('click',previousModule);
document.getElementById('moduleNext').addEventListener('click',nextModule);
document.getElementById('exitCourse').addEventListener('click',()=>exitCourse());
document.getElementById('brandHome').addEventListener('click',()=>exitCourse());
frame.addEventListener('load',()=>dispatchContext());
window.addEventListener('message',event=>{if(event.data?.type==='alevel-course-exit')exitCourse();});
window.addEventListener('popstate',()=>{
 const restored=restoreLocation();
 if(restored.open)openTopic(restored.topic,false,restored.module,{historyMode:'none'});
 else exitCourse({scroll:false,updateUrl:false});
});
document.addEventListener('keydown',e=>{
 const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName||'');
 if(e.key==='Escape'&&!typing){
   const openMenu=document.querySelector('.shell-more[open]');
   if(openMenu){openMenu.removeAttribute('open');return;}
   if(courseOpen&&!document.getElementById('coachPanel')?.classList.contains('open')){e.preventDefault();exitCourse();return;}
 }
 if(!courseOpen)return;
 if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();previousTopic();}
 if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();nextTopic();}
});

window.CourseApp={config:courseConfig,topics,storageKeys,getState,getActiveContext,openTopic,exitCourse,previousTopic,nextTopic,changeModule};

applyCourseIdentity();
const restored=restoreLocation();
activeTopic=topics.find(t=>t.id===restored.topic)||topics[0];
activeModule=Math.min(Math.max(Number(restored.module)||0,0),activeTopic.modules.length-1);
renderGrid();
renderQuickNavigation();
renderTabs();
renderProgress();
updateWorkspaceMetadata();
if(restored.open)openTopic(activeTopic.id,false,activeModule,{historyMode:'none'});
else setCourseMode(false,{scroll:false,updateUrl:false});