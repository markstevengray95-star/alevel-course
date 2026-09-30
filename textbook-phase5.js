(()=>{
  'use strict';

  const STORE='alevel-lesson-automarking-v1';
  const DEPTH_STORE='alevel-textbook-depth-v1';
  const RETEST_STORE='alevel-textbook-retest-v1';
  let observer=null;
  let applying=false;
  let activeRetest=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const words=s=>clean(s).toLowerCase().replace(/[^a-z0-9α-ωλφρσεμνπτθ]+/g,' ').split(/\s+/).filter(w=>w.length>3);
  const state=()=>window.CourseTextbook?.getState?.()||{};
  const current=()=>{const s=state(),data=window.CourseTextbook?.data||{};const topic=data[s.topicId];return{s,topic,chapter:topic?.chapters?.[Number(s.chapterIndex)||0],index:Number(s.chapterIndex)||0};};

  function loadJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'');return v??fallback;}catch{return fallback;}}
  function saveJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
  function attempts(){if(window.ALEVEL_AUTOMARK?.history){try{return window.ALEVEL_AUTOMARK.history()||[];}catch{}}const v=loadJson(STORE,[]);return Array.isArray(v)?v:[];}
  function allLessons(){return window.ALEVEL_LESSONS||[];}

  function bestLesson(topicId,chapter){
    const candidates=allLessons().filter(l=>l.topicId===topicId);if(!candidates.length)return null;
    const query=new Set(words(`${chapter?.title||''} ${chapter?.summary||''} ${(chapter?.sections||[]).map(s=>s[0]).join(' ')}`));
    let best=null,bestScore=-1;
    candidates.forEach(l=>{const hay=words(`${l.title} ${l.focus}`);let score=hay.reduce((n,w)=>n+(query.has(w)?2:0),0);const stem=clean(l.title).toLowerCase().split(/[:–-]/)[0];if(stem&&String(chapter.title||'').toLowerCase().includes(stem))score+=10;if(score>bestScore){bestScore=score;best=l;}});
    return best;
  }

  function statsFor(lessonId){
    const records=attempts().filter(r=>r.lessonId===lessonId&&Number(r.max)>0&&Number.isFinite(Number(r.score))).slice(-10);
    if(!records.length)return{records,percent:null,attempts:0,trend:0,last:null};
    const total=records.reduce((n,r)=>n+Number(r.max),0),earned=records.reduce((n,r)=>n+Number(r.score),0);
    const last3=records.slice(-3),prev=records.slice(-6,-3);const avg=a=>a.length?a.reduce((n,r)=>n+Number(r.score)/Number(r.max),0)/a.length:0;
    return{records,percent:total?earned/total:null,attempts:records.length,trend:prev.length?avg(last3)-avg(prev):0,last:records[records.length-1]};
  }
  function statusFor(stats){
    if(stats.percent===null)return{key:'new',label:'Not assessed',message:'Start with a short diagnostic so the textbook can adapt to you.'};
    if(stats.percent<.45)return{key:'relearn',label:'Relearn',message:'Rebuild the core idea before attempting harder questions.'};
    if(stats.percent<.7)return{key:'practice',label:'Practise',message:'The core idea is developing; focus on targeted practice and feedback.'};
    if(stats.percent<.86)return{key:'secure',label:'Secure',message:'You are broadly secure. Use exam application to strengthen precision.'};
    return{key:'strong',label:'Strong',message:'Evidence is strong. Push into unfamiliar contexts and A* reasoning.'};
  }
  const pct=v=>v===null?'No score yet':`${Math.round(v*100)}%`;

  function weakSection(chapter,records){
    const sections=chapter?.sections||[];if(!sections.length)return null;
    const weak=records.filter(r=>Number(r.max)>0&&Number(r.score)/Number(r.max)<.72).slice(-6);
    if(!weak.length)return{index:0,title:sections[0][0],reason:'No weak subsection has been identified yet, so start with the first core idea.'};
    let best={index:0,score:-1};
    sections.forEach(([heading,body],index)=>{const hay=new Set(words(`${heading} ${body}`));let score=0;weak.forEach(r=>words(r.question).forEach(w=>{if(hay.has(w))score+=1;}));if(score>best.score)best={index,score};});
    return{index:best.index,title:sections[best.index][0],reason:`Recent lower-scoring questions overlap most with ${sections[best.index][0].toLowerCase()}.`};
  }

  function suggestedDepth(stats){if(stats.percent===null)return'alevel';if(stats.percent<.55)return'foundation';if(stats.percent>=.86)return'astar';return'alevel';}
  function depthState(){const v=loadJson(DEPTH_STORE,{});return v&&typeof v==='object'?v:{};}
  function chapterKey(){const {s,index}=current();return`${s.topicId}:${index}`;}
  function chosenDepth(stats){const saved=depthState()[chapterKey()];return['foundation','alevel','astar'].includes(saved)?saved:suggestedDepth(stats);}
  function setDepth(depth){const all=depthState();all[chapterKey()]=depth;saveJson(DEPTH_STORE,all);applyDepth(depth);renderAdaptive();}

  function firstSentence(text){const t=clean(text);const m=t.match(/^(.+?[.!?])(?:\s|$)/);return(m?.[1]||t).slice(0,260);}
  function foundationPoints(chapter){return(chapter.sections||[]).slice(0,4).map(([h,b])=>({title:h,text:firstSentence(b)}));}
  function astarTasks(chapter,topic){
    const eq=(chapter.equations||[])[0];const second=(chapter.equations||[])[1];
    return[
      {title:'Derive or connect',text:eq?`Start from ${eq[1]} and explain how it connects to the physical model, including what must remain constant.`:`Build a mathematical model from the definitions in this chapter and justify each step.`},
      {title:'Challenge the model',text:`State at least two assumptions or limitations behind the model used in ${clean(chapter.title).replace(/^\d+\.\s*/,'').toLowerCase()}, and predict when it would break down.`},
      {title:'Synoptic link',text:second?`Connect ${eq?.[0]||'the main relationship'} with ${second[0]}. Explain what a question could require you to combine.`:`Connect this chapter to a different part of ${topic.title} and explain a shared principle or mathematical pattern.`},
      {title:'Unfamiliar context',text:`Apply the chapter to a situation you have not seen before. Decide which information matters, which can be ignored, and justify the model before calculating.`}
    ];
  }

  function ensureFoundation(article,chapter){
    let box=article.querySelector('.tbp5-foundation');if(box)return box;
    box=document.createElement('section');box.className='tbp5-foundation';
    const points=foundationPoints(chapter);
    box.innerHTML=`<div class="tbp5-depth-kicker">Foundation explanation</div><h2>Build the idea first</h2><p>${esc(chapter.summary||'Start with the core physical idea before adding mathematical detail.')}</p><div class="tbp5-foundation-grid">${points.map((p,i)=>`<article><b>${i+1}</b><div><strong>${esc(p.title)}</strong><p>${esc(p.text)}</p></div></article>`).join('')}</div><div class="tbp5-foundation-actions"><button type="button" data-tbp5-foundation-tutor>✦ Explain these ideas simply</button><button type="button" data-tbp5-foundation-check>Check my basics</button></div>`;
    const anchor=article.querySelector('.tbp5-adaptive')||article.querySelector('.tbp3-chapter-tutor')||article.querySelector('.tbp1-overview');anchor?.insertAdjacentElement('afterend',box);
    box.querySelector('[data-tbp5-foundation-tutor]')?.addEventListener('click',()=>window.ALEVEL_TEXTBOOK_PHASE3?.send?.('simpler',box));
    box.querySelector('[data-tbp5-foundation-check]')?.addEventListener('click',()=>startRetest(true));
    return box;
  }

  function ensureAstar(article,chapter,topic){
    let box=article.querySelector('.tbp5-astar');if(box)return box;
    const tasks=astarTasks(chapter,topic);box=document.createElement('section');box.className='tbp5-astar';
    box.innerHTML=`<div class="tbp5-astar-head"><div><span>A* extension</span><h2>Push beyond routine application</h2><p>Use derivation, assumptions, synoptic links and unfamiliar contexts rather than simply doing a harder calculation.</p></div><span class="tbp5-star">A*</span></div><div class="tbp5-astar-grid">${tasks.map((t,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(t.title)}</strong><p>${esc(t.text)}</p><button type="button" data-tbp5-astar-task="${i}">✦ Tutor challenge</button></article>`).join('')}</div>`;
    const anchor=article.querySelector('.tbp4-graph-clinic')||article.querySelector('.textbook-example')||article.querySelector('.textbook-check');anchor?.insertAdjacentElement('beforebegin',box);
    box.addEventListener('click',e=>{const b=e.target.closest('[data-tbp5-astar-task]');if(!b)return;const card=b.closest('article');window.ALEVEL_TEXTBOOK_PHASE3?.send?.('explain',card);});
    return box;
  }

  function applyDepth(depth){
    const article=document.getElementById('textbookArticle');if(!article)return;article.dataset.tbp5Depth=depth;
    article.querySelectorAll('[data-tbp5-depth]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tbp5Depth===depth?'true':'false'));
    const label=article.querySelector('[data-tbp5-depth-label]');if(label)label.textContent=depth==='foundation'?'Foundation':depth==='astar'?'A*':'A-Level';
  }

  function buildSyntheticLesson(lesson,chapter,topic){
    return{id:lesson?.id||`textbook-${state().topicId}-${state().chapterIndex}`,title:lesson?.title||chapter.title,ref:lesson?.ref||String(topic.code||'').replace(/^AQA\s*/i,''),focus:chapter.summary,objectives:(chapter.sections||[]).map(s=>`Explain and apply ${s[0]}.`),keywords:[],equations:chapter.equations||[],chunks:(chapter.sections||[]).map(s=>({title:s[0],text:[s[1]]})),worked:chapter.example?{question:chapter.example.q,steps:chapter.example.steps,answer:chapter.example.answer}:{},checks:chapter.checks||[],exam:[],misconceptions:chapter.examTip?[chapter.examTip]:[],concept:{key:chapter.title}};
  }

  function retestQuestions(chapter,status){
    const checks=(chapter.checks||[]).slice();
    const pool=checks.map((q,i)=>({q,marks:i===0?2:3}));
    if(status.key==='strong'||status.key==='secure')pool.push({q:`Apply ${clean(chapter.title).replace(/^\d+\.\s*/,'').toLowerCase()} to an unfamiliar situation and justify the model you choose.`,marks:4});
    while(pool.length<3)pool.push({q:`Explain one important cause-and-effect relationship in ${clean(chapter.title).replace(/^\d+\.\s*/,'').toLowerCase()}.`,marks:3});
    return pool.slice(0,3);
  }

  function saveRetestAttempt(lessonId,q,answer,result,index){
    const record={lessonId,question:q.q,type:'textbook-retest',index,answer,score:result.score,max:result.max,at:Date.now()};
    const all=attempts();all.push(record);saveJson(STORE,all.slice(-300));
    const own=loadJson(RETEST_STORE,[]);own.push(record);saveJson(RETEST_STORE,own.slice(-100));
    window.dispatchEvent(new CustomEvent('alevel:automark-updated',{detail:record}));
    window.ALEVEL_GUIDED_TUTOR?.refresh?.();
  }

  function startRetest(basicsOnly=false){
    const article=document.getElementById('textbookArticle'),{s,topic,chapter}=current();if(!article||!topic||!chapter)return;
    const lesson=bestLesson(s.topicId,chapter),stats=statsFor(lesson?.id),status=statusFor(stats),questions=retestQuestions(chapter,status);
    activeRetest={questions,index:0,correct:0,earned:0,total:questions.reduce((n,q)=>n+q.marks,0),lesson,chapter,topic,basicsOnly};
    renderRetest();article.querySelector('.tbp5-retest')?.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function renderRetest(){
    const article=document.getElementById('textbookArticle');if(!article||!activeRetest)return;let box=article.querySelector('.tbp5-retest');if(!box){box=document.createElement('section');box.className='tbp5-retest';const anchor=article.querySelector('.textbook-check')||article.querySelector('.textbook-chapter-actions');anchor?.insertAdjacentElement('beforebegin',box);}
    const r=activeRetest;
    if(r.index>=r.questions.length){const percent=r.total?r.earned/r.total:0;const outcome=percent>=.8?'Secure enough to move on':percent>=.6?'Practise once more':'Relearn the highlighted section';box.innerHTML=`<div class="tbp5-retest-finish"><span>Adaptive re-test complete</span><strong>${r.earned}/${r.total} · ${Math.round(percent*100)}%</strong><h3>${outcome}</h3><p>Your textbook status has been recalculated using this evidence.</p><div><button type="button" data-tbp5-retest-close>Return to chapter</button><button type="button" data-tbp5-retest-tutor>✦ Review mistakes with Tutor</button></div></div>`;box.querySelector('[data-tbp5-retest-close]').addEventListener('click',()=>{box.remove();activeRetest=null;renderAdaptive();});box.querySelector('[data-tbp5-retest-tutor]').addEventListener('click',()=>window.ALEVEL_TEXTBOOK_PHASE3?.send?.('diagnostic',article,{wholeChapter:true}));renderAdaptive();return;}
    const q=r.questions[r.index];box.innerHTML=`<div class="tbp5-retest-head"><div><span>Adaptive re-test</span><h3>Question ${r.index+1} of ${r.questions.length}</h3></div><b>${q.marks} marks</b></div><p class="tbp5-retest-q">${esc(q.q)}</p><textarea rows="4" placeholder="Write your answer before marking…"></textarea><div class="tbp5-retest-actions"><button type="button" data-tbp5-retest-mark>Mark answer</button><button type="button" data-tbp5-retest-hint>✦ Hint</button></div><div class="tbp5-retest-feedback" hidden></div>`;
    box.querySelector('[data-tbp5-retest-hint]').addEventListener('click',()=>window.ALEVEL_TEXTBOOK_PHASE3?.send?.('hint',box));
    box.querySelector('[data-tbp5-retest-mark]').addEventListener('click',()=>{const answer=box.querySelector('textarea').value.trim(),out=box.querySelector('.tbp5-retest-feedback');if(!answer){out.hidden=false;out.innerHTML='<strong>Write an answer first.</strong>';return;}const synthetic=buildSyntheticLesson(r.lesson,r.chapter,r.topic);const result=window.ALEVEL_AUTOMARK?.mark?.(q.q,answer,q.marks,synthetic)||{score:0,max:q.marks,matched:[],missing:['Use the chapter physics explicitly.'],quality:'Needs review'};r.earned+=result.score;if(result.score/result.max>=.7)r.correct++;saveRetestAttempt(r.lesson?.id||synthetic.id,q,answer,result,r.index);out.hidden=false;out.innerHTML=`<div><strong>${result.score}/${result.max} · ${esc(result.quality||'Indicative mark')}</strong><p>${result.missing?.[0]?`Next improvement: ${esc(result.missing[0])}`:'Main physics points detected.'}</p></div><button type="button" data-tbp5-retest-next>${r.index===r.questions.length-1?'See result':'Next question'} →</button>`;box.querySelector('[data-tbp5-retest-mark]').disabled=true;box.querySelector('[data-tbp5-retest-next]').addEventListener('click',()=>{r.index++;renderRetest();});});
  }

  function ensureAdaptive(article){
    let panel=article.querySelector('.tbp5-adaptive');if(panel)return panel;
    panel=document.createElement('section');panel.className='tbp5-adaptive';
    const anchor=article.querySelector('.tbp1-overview')||article.querySelector('.textbook-summary');anchor?.insertAdjacentElement('afterend',panel);
    panel.addEventListener('click',e=>{const depth=e.target.closest('[data-tbp5-depth]')?.dataset.tbp5Depth;if(depth){setDepth(depth);return;}if(e.target.closest('[data-tbp5-route]')){const target=document.querySelector(e.target.closest('[data-tbp5-route]').dataset.tbp5Route);target?.scrollIntoView({behavior:'smooth',block:'start'});return;}if(e.target.closest('[data-tbp5-retest]'))startRetest(false);if(e.target.closest('[data-tbp5-tutor]'))window.ALEVEL_TEXTBOOK_PHASE3?.send?.('diagnostic',article,{wholeChapter:true});});
    return panel;
  }

  function renderAdaptive(){
    if(applying)return;const article=document.getElementById('textbookArticle'),{s,topic,chapter}=current();if(!article||!topic||!chapter)return;
    const lesson=bestLesson(s.topicId,chapter),stats=statsFor(lesson?.id),status=statusFor(stats),weak=weakSection(chapter,stats.records),suggested=suggestedDepth(stats),depth=chosenDepth(stats);const panel=ensureAdaptive(article);
    const trend=stats.trend>.08?'Improving ↑':stats.trend<-.08?'Needs attention ↓':'Stable →';
    panel.dataset.status=status.key;panel.innerHTML=`<div class="tbp5-adaptive-main"><div class="tbp5-adaptive-copy"><span>Adaptive textbook</span><div class="tbp5-status-line"><strong>${esc(status.label)}</strong><b>${esc(pct(stats.percent))}</b><small>${stats.attempts?`${stats.attempts} marked attempt${stats.attempts===1?'':'s'} · ${trend}`:'No marking evidence yet'}</small></div><p>${esc(status.message)}</p></div><div class="tbp5-depth"><span>Reading depth <em>Suggested: ${suggested==='foundation'?'Foundation':suggested==='astar'?'A*':'A-Level'}</em></span><div role="group" aria-label="Textbook explanation depth"><button type="button" data-tbp5-depth="foundation">Foundation</button><button type="button" data-tbp5-depth="alevel">A-Level</button><button type="button" data-tbp5-depth="astar">A*</button></div><small>Current: <b data-tbp5-depth-label></b></small></div></div><div class="tbp5-route"><div><span>Recommended focus</span><strong>${esc(weak?.title||chapter.title)}</strong><p>${esc(weak?.reason||'Work through the chapter in order.')}</p></div><div class="tbp5-route-actions"><button type="button" data-tbp5-route=".textbook-section:nth-of-type(${(weak?.index||0)+1})">Go to weak section</button><button type="button" data-tbp5-retest>Adaptive re-test</button><button type="button" data-tbp5-tutor>✦ Tutor diagnosis</button></div></div>`;
    panel.querySelectorAll('[data-tbp5-depth]').forEach(b=>b.addEventListener('click',()=>setDepth(b.dataset.tbp5Depth)));
    panel.querySelector('[data-tbp5-retest]')?.addEventListener('click',()=>startRetest(false));panel.querySelector('[data-tbp5-tutor]')?.addEventListener('click',()=>window.ALEVEL_TEXTBOOK_PHASE3?.send?.('diagnostic',article,{wholeChapter:true}));
    panel.querySelector('[data-tbp5-route]')?.addEventListener('click',()=>{const sections=[...article.querySelectorAll('.textbook-section')];sections[weak?.index||0]?.scrollIntoView({behavior:'smooth',block:'start'});});
    ensureFoundation(article,chapter);ensureAstar(article,chapter,topic);applyDepth(depth);
  }

  function annotateSections(article,chapter,stats){
    const weak=weakSection(chapter,stats.records);article.querySelectorAll('.textbook-section').forEach((section,i)=>{section.classList.toggle('tbp5-recommended',i===(weak?.index||-1));let badge=section.querySelector('.tbp5-section-badge');if(i===(weak?.index||-1)){if(!badge){badge=document.createElement('span');badge.className='tbp5-section-badge';badge.textContent='Recommended review';section.prepend(badge);}}else badge?.remove();});
  }

  function apply(){
    if(applying)return;const article=document.getElementById('textbookArticle'),{s,topic,chapter}=current();if(!article||!topic||!chapter)return;applying=true;try{const lesson=bestLesson(s.topicId,chapter),stats=statsFor(lesson?.id);renderAdaptive();annotateSections(article,chapter,stats);}finally{applying=false;}
  }
  function observe(){const article=document.getElementById('textbookArticle');if(!article)return;observer?.disconnect();observer=new MutationObserver(()=>requestAnimationFrame(apply));observer.observe(article,{childList:true,subtree:true});apply();}

  window.addEventListener('textbookchange',e=>{if(e.detail?.open)setTimeout(()=>{observe();apply();},70);});
  window.addEventListener('alevel:automark-updated',()=>setTimeout(apply,60));
  document.addEventListener('click',e=>{if(e.target.closest('.automark-button'))setTimeout(apply,120);});
  window.addEventListener('storage',e=>{if([STORE,DEPTH_STORE].includes(e.key))apply();});
  const start=()=>{if(document.getElementById('textbookArticle'))observe();else setTimeout(start,180);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.ALEVEL_TEXTBOOK_PHASE5={refresh:apply,startRetest,setDepth,getStatus(){const {s,chapter}=current(),lesson=bestLesson(s.topicId,chapter),stats=statsFor(lesson?.id);return{lesson,stats,status:statusFor(stats),depth:chosenDepth(stats)};}};
})();