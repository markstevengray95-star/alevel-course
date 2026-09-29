(()=>{
  'use strict';

  const STORE='alevel-lesson-automarking-v1';
  const PROGRESS='alevel-course-progress-v1';
  const LOCATION='alevel-course-location-v2';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let root=null;

  function attempts(){
    if(window.ALEVEL_AUTOMARK?.history){try{return window.ALEVEL_AUTOMARK.history()||[];}catch{}}
    try{const v=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(v)?v:[];}catch{return[];}
  }
  function progress(){try{return JSON.parse(localStorage.getItem(PROGRESS)||'{}')||{};}catch{return{};}}
  function locationState(){try{return JSON.parse(localStorage.getItem(LOCATION)||'{}')||{};}catch{return{};}}
  function allLessons(){return window.ALEVEL_LESSONS||[];}
  function curriculum(){return window.ALEVEL_CURRICULUM_MAP||[];}
  function builtLesson(base){try{return window.ALEVEL_LESSON_CONTENT?.build?.(base)||base;}catch{return base;}}
  function byLesson(records){
    const map=new Map();
    records.forEach(r=>{if(!r?.lessonId)return;const arr=map.get(r.lessonId)||[];arr.push(r);map.set(r.lessonId,arr);});
    return map;
  }
  function stats(records){
    const valid=records.filter(r=>Number(r.max)>0&&Number.isFinite(Number(r.score)));
    if(!valid.length)return{attempts:0,percent:null,recent:null,best:null,trend:0};
    const recent=valid.slice(-8);const total=recent.reduce((n,r)=>n+Number(r.max),0);const earned=recent.reduce((n,r)=>n+Number(r.score),0);
    const pct=total?earned/total:0;const best=Math.max(...valid.map(r=>Number(r.score)/Number(r.max)));
    const last=valid.slice(-3),prev=valid.slice(-6,-3);
    const avg=a=>a.length?a.reduce((n,r)=>n+Number(r.score)/Number(r.max),0)/a.length:0;
    return{attempts:valid.length,percent:pct,recent:valid[valid.length-1],best,trend:prev.length?avg(last)-avg(prev):0};
  }
  function statusFor(s){
    if(s.percent===null)return{key:'new',label:'Not assessed'};
    if(s.percent<.45)return{key:'relearn',label:'Relearn'};
    if(s.percent<.7)return{key:'develop',label:'Needs practice'};
    if(s.percent<.86)return{key:'secure',label:'Secure'};
    return{key:'strong',label:'Strong'};
  }
  function pct(value){return value===null?'—':`${Math.round(value*100)}%`;}
  function questionSkill(record){
    const q=String(record?.question||'').toLowerCase();
    if(/calculate|determine|find|show/.test(q))return'Calculation method, units and substitution';
    if(/explain|why|justify|discuss/.test(q))return'Explanation and cause-effect reasoning';
    if(/graph|gradient|intercept|trend/.test(q))return'Graph interpretation and evidence';
    if(/uncertainty|error|evaluate|improve|practical/.test(q))return'Practical evaluation and uncertainty';
    return'Core physics knowledge and precise terminology';
  }
  function improvementFor(base,records){
    const l=builtLesson(base);const weak=records.filter(r=>Number(r.max)>0&&Number(r.score)/Number(r.max)<.7).slice(-4);
    const recent=weak[weak.length-1];
    const misconception=l?.misconceptions?.[0];
    const objective=l?.objectives?.[0]||l?.focus;
    return{
      title:questionSkill(recent),
      detail:misconception?`Watch for this misconception: ${misconception}`:`Revisit: ${objective||base.focus||base.title}`,
      focus:l?.focus||base.focus||base.title
    };
  }
  function lessonModels(){
    const grouped=byLesson(attempts());
    return allLessons().map(base=>{
      const rec=grouped.get(base.id)||[];const s=stats(rec);const status=statusFor(s);const imp=improvementFor(base,rec);
      return{base,records:rec,stats:s,status,improvement:imp};
    });
  }
  function priorityScore(model){
    if(model.stats.percent===null)return .28;
    const weakness=1-model.stats.percent;const evidence=Math.min(.22,model.stats.attempts*.025);const recency=model.stats.recent?.at?Math.max(0,.12-(Date.now()-model.stats.recent.at)/864000000):0;
    return weakness+evidence+recency;
  }
  function priorities(models){
    const weak=models.filter(m=>m.stats.percent!==null&&m.stats.percent<.75).sort((a,b)=>priorityScore(b)-priorityScore(a));
    const currentTopic=locationState().topic;
    const unattempted=models.filter(m=>m.stats.percent===null).sort((a,b)=>Number(b.base.topicId===currentTopic)-Number(a.base.topicId===currentTopic));
    return [...weak,...unattempted].slice(0,3);
  }
  function topicModels(models){
    const map=new Map(models.map(m=>[m.base.id,m]));
    return curriculum().map(topic=>{
      const lessons=(topic.lessons||[]).map(l=>map.get(l.id)).filter(Boolean);const assessed=lessons.filter(m=>m.stats.percent!==null);
      const weighted=assessed.length?assessed.reduce((n,m)=>n+m.stats.percent,0)/assessed.length:null;
      return{topic,lessons,assessed:assessed.length,percent:weighted};
    });
  }
  function overall(models){
    const assessed=models.filter(m=>m.stats.percent!==null);const avg=assessed.length?assessed.reduce((n,m)=>n+m.stats.percent,0)/assessed.length:null;
    const needs=models.filter(m=>m.stats.percent!==null&&m.stats.percent<.7).length;
    return{assessed:assessed.length,total:models.length,avg,needs};
  }
  function topicLabel(topic){return `${topic.code||''} · ${topic.title}`;}
  function openLesson(id,withTutor=false){
    window.ALEVEL_LESSON_CONTENT?.open?.(id);
    if(withTutor){setTimeout(()=>{
      document.getElementById('heroCoachBtn')?.click();
      const model=lessonModels().find(m=>m.base.id===id);const input=document.getElementById('coachInput');
      if(input&&model){input.value=`Help me improve ${model.improvement.title.toLowerCase()} in ${model.base.title}. Focus on my weak areas and give me hints before answers.`;input.focus();}
    },180);}
  }
  function openTopic(id){window.CourseApp?.openTopic?.(id,true,0);}

  function metric(label,value,sub=''){return `<article class="gtd-metric"><span>${esc(label)}</span><strong>${esc(value)}</strong>${sub?`<small>${esc(sub)}</small>`:''}</article>`;}
  function priorityCard(model,index){
    const s=model.stats;const percentage=pct(s.percent);const reason=s.percent===null?'No marked evidence yet — start with the lesson checks.':`${percentage} across ${s.attempts} marked attempt${s.attempts===1?'':'s'}.`;
    return `<article class="gtd-priority ${model.status.key}">
      <div class="gtd-priority-rank">${index+1}</div>
      <div class="gtd-priority-copy"><span>${esc(model.base.topicCode||'')} · ${esc(model.base.ref||'')}</span><h4>${esc(model.base.title)}</h4><p>${esc(reason)}</p><div class="gtd-focus"><b>Improve:</b> ${esc(model.improvement.title)}</div></div>
      <div class="gtd-priority-actions"><button type="button" class="primary" data-gtd-open="${esc(model.base.id)}">Open lesson</button><button type="button" data-gtd-tutor="${esc(model.base.id)}">Tutor me</button></div>
    </article>`;
  }
  function lessonRow(model){
    const trend=model.stats.trend>.08?'↑':model.stats.trend<-.08?'↓':'→';
    return `<div class="gtd-lesson-row" data-status="${model.status.key}">
      <div class="gtd-lesson-main"><span class="gtd-status-dot"></span><div><strong>${esc(model.base.title)}</strong><small>${esc(model.base.ref||'')} · ${esc(model.base.type||'lesson')}</small></div></div>
      <div class="gtd-lesson-score"><b>${pct(model.stats.percent)}</b><span>${esc(model.status.label)} ${model.stats.percent===null?'':trend}</span></div>
      <div class="gtd-lesson-actions"><button type="button" data-gtd-open="${esc(model.base.id)}">Lesson</button><button type="button" data-gtd-tutor="${esc(model.base.id)}">Tutor</button></div>
    </div>`;
  }
  function topicCard(tm){
    const weak=tm.lessons.filter(m=>m.stats.percent!==null&&m.stats.percent<.7).length;
    return `<details class="gtd-topic" ${weak?'open':''}>
      <summary><div><span>${esc(tm.topic.code)}</span><strong>${esc(tm.topic.title)}</strong></div><div class="gtd-topic-summary"><b>${pct(tm.percent)}</b><span>${tm.assessed}/${tm.lessons.length} assessed${weak?` · ${weak} priority`:''}</span></div></summary>
      <div class="gtd-topic-body"><div class="gtd-topic-action"><button type="button" data-gtd-topic="${esc(tm.topic.id)}">Open full ${esc(tm.topic.title)} topic →</button></div>${tm.lessons.map(lessonRow).join('')}</div>
    </details>`;
  }
  function improvementCards(models){
    const weak=models.filter(m=>m.stats.percent!==null&&m.stats.percent<.7).sort((a,b)=>(a.stats.percent??1)-(b.stats.percent??1)).slice(0,6);
    if(!weak.length)return '<div class="gtd-empty"><strong>No weak areas identified yet.</strong><span>Mark lesson questions and this section will update automatically.</span></div>';
    return weak.map(m=>`<article class="gtd-improvement"><span>${esc(m.base.topicCode||'')} · ${pct(m.stats.percent)}</span><strong>${esc(m.improvement.title)}</strong><p>${esc(m.improvement.detail)}</p><button type="button" data-gtd-open="${esc(m.base.id)}">Practise ${esc(m.base.title)} →</button></article>`).join('');
  }

  function render(){
    if(!root)return;
    const models=lessonModels(),o=overall(models),prio=priorities(models),topics=topicModels(models),completed=Object.values(progress()).filter(Boolean).length;
    root.innerHTML=`
      <div class="gtd-head"><div><span class="gtd-eyebrow">Adaptive study guidance</span><h2>Guided Tutor Dashboard</h2><p>Uses your lesson auto-marking to decide what to revisit next. Results stay on this device and update after each marked answer.</p></div><button type="button" data-gtd-refresh>Refresh analysis</button></div>
      <div class="gtd-metrics">${metric('Lessons assessed',`${o.assessed}/${o.total}`,'marked evidence')}${metric('Average score',pct(o.avg),'recent lesson evidence')}${metric('Priority lessons',String(o.needs),'below 70%')}${metric('Topics complete',`${completed}/8`,'course progress')}</div>
      <div class="gtd-grid">
        <section class="gtd-panel gtd-next"><div class="gtd-panel-head"><div><span>Guided route</span><h3>What to do next</h3></div><small>Lowest-confidence evidence first</small></div>${prio.length?prio.map(priorityCard).join(''):'<div class="gtd-empty">Complete a lesson question to create your first guided step.</div>'}</section>
        <section class="gtd-panel"><div class="gtd-panel-head"><div><span>Live diagnosis</span><h3>Areas for improvement</h3></div><small>Updates from auto-marking</small></div><div class="gtd-improvements">${improvementCards(models)}</div></section>
      </div>
      <section class="gtd-panel gtd-course"><div class="gtd-panel-head"><div><span>AQA 7408</span><h3>All topics and lessons</h3></div><div class="gtd-legend"><span class="strong">Strong</span><span class="secure">Secure</span><span class="develop">Practice</span><span class="relearn">Relearn</span></div></div><div class="gtd-topics">${topics.map(topicCard).join('')}</div></section>`;
  }
  function ensure(){
    if(root?.isConnected)return root;
    const home=document.getElementById('courseHome');if(!home)return null;
    root=document.createElement('section');root.className='guided-tutor-dashboard';root.id='guidedTutorDashboard';root.setAttribute('aria-label','Guided tutor dashboard');
    const cycle=home.querySelector('.study-cycle');if(cycle)cycle.insertAdjacentElement('afterend',root);else home.prepend(root);
    root.addEventListener('click',event=>{
      const open=event.target.closest('[data-gtd-open]');if(open){openLesson(open.dataset.gtdOpen,false);return;}
      const tutor=event.target.closest('[data-gtd-tutor]');if(tutor){openLesson(tutor.dataset.gtdTutor,true);return;}
      const topic=event.target.closest('[data-gtd-topic]');if(topic){openTopic(topic.dataset.gtdTopic);return;}
      if(event.target.closest('[data-gtd-refresh]'))render();
    });
    render();return root;
  }
  function refreshSoon(){setTimeout(()=>{ensure();render();},60);}

  document.addEventListener('click',event=>{if(event.target.closest('.automark-button'))setTimeout(render,90);});
  window.addEventListener('storage',event=>{if([STORE,PROGRESS,LOCATION].includes(event.key))render();});
  window.addEventListener('coursecontextchange',()=>render());
  window.addEventListener('alevel:lesson-selected',()=>render());
  window.addEventListener('focus',()=>render());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});

  const start=()=>{if(!ensure())setTimeout(start,100);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.ALEVEL_GUIDED_TUTOR={refresh:refreshSoon,models:lessonModels,priorities:()=>priorities(lessonModels()),openLesson};
})();