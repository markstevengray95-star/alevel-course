(()=>{
  'use strict';
  let box=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const lessons=()=>window.ALEVEL_LESSONS||[];
  const current=()=>window.ALEVEL_ACTIVE_LESSON||null;
  function models(){try{return window.ALEVEL_GUIDED_TUTOR?.models?.()||[];}catch{return[];}}
  function modelFor(id){return models().find(m=>m.base.id===id)||null;}
  function priorityNext(){const active=current()?.id;const p=(window.ALEVEL_GUIDED_TUTOR?.priorities?.()||[]);return p.find(m=>m.base.id!==active)||p[0]||models().find(m=>m.base.id!==active)||null;}
  function percent(m){return m?.stats?.percent===null||m?.stats?.percent===undefined?'Not assessed':`${Math.round(m.stats.percent*100)}%`}
  function ensure(){
    const panel=document.getElementById('coachPanel');if(!panel)return null;if(box?.isConnected)return box;
    box=document.createElement('section');box.className='guided-tutor-mode';box.innerHTML=`<div class="gtm-top"><div><span>Guided Tutor Mode</span><strong data-gtm-title>Choose a lesson</strong><small data-gtm-meta>Lesson-aware study route</small></div><button type="button" data-gtm-browser>Lessons</button></div><div class="gtm-route" role="group" aria-label="Guided tutor stages"><button type="button" data-gtm-action="learn"><b>1</b><span>Learn</span></button><button type="button" data-gtm-action="hint"><b>2</b><span>Hint</span></button><button type="button" data-gtm-action="practice"><b>3</b><span>Practise</span></button><button type="button" data-gtm-action="exam"><b>4</b><span>Exam</span></button><button type="button" data-gtm-action="review"><b>5</b><span>Review</span></button></div><div class="gtm-focus"><div><span>Your focus</span><strong data-gtm-focus>Complete a marked lesson question to personalise this.</strong></div><button type="button" data-gtm-next>Next recommended →</button></div>`;
    const controls=panel.querySelector('.coach-controls');controls?.insertAdjacentElement('afterend',box);
    box.addEventListener('click',e=>{const action=e.target.closest('[data-gtm-action]')?.dataset.gtmAction;if(action)run(action);if(e.target.closest('[data-gtm-browser]'))window.ALEVEL_LESSON_NAVIGATOR?.open?.();if(e.target.closest('[data-gtm-next]'))openNext();});render();return box;
  }
  function promptFor(action,l,m){
    const weak=m?.improvement?.title||'the most important skill in this lesson';
    const focus=l?.focus||m?.base?.focus||'the current lesson focus';
    if(action==='learn')return `Teach me ${l?.title||'this lesson'} in a clear sequence. Start with the core idea, then the key equation or model, then one example. Pause after each part and ask me a short check question. Focus especially on ${weak}.`;
    if(action==='hint')return `I am working on ${l?.title||'this lesson'}. Give me hint-first support on ${focus}. Do not give the final answer immediately. Ask me for my next step and correct misconceptions as they appear.`;
    if(action==='practice')return `Give me one question from ${l?.title||'this lesson'} targeting ${weak}. Let me answer before marking it. If I struggle, give progressively stronger hints rather than the full answer.`;
    if(action==='exam')return `Give me an AQA-style exam question on ${l?.title||'this lesson'}, chosen to practise ${weak}. State the marks. Wait for my answer, then give an indicative mark, credited points, missing points and a concise model improvement.`;
    return `Review my progress in ${l?.title||'this lesson'}. Focus on ${weak}. Ask me three short diagnostic questions one at a time, then tell me whether I should relearn, practise, or move on.`;
  }
  function run(action){const l=current();if(!l){window.ALEVEL_LESSON_NAVIGATOR?.open?.();return;}const m=modelFor(l.id);const select=document.getElementById('coachMode');if(select){select.value=action==='hint'?'hint':action==='practice'?'quiz':action==='exam'||action==='review'?'exam':'explain';}window.ALEVEL_AI_TUTOR?.send?.(promptFor(action,l,m),{mode:select?.value||'explain'});}
  function openNext(){const next=priorityNext();if(!next)return;window.ALEVEL_LESSON_CONTENT?.open?.(next.base.id);setTimeout(()=>{render();window.ALEVEL_AI_TUTOR?.open?.();window.ALEVEL_AI_TUTOR?.send?.(`Start a guided study session for ${next.base.title}. My current priority is ${next.improvement?.title||'building secure understanding'}. Begin with a short diagnostic question before teaching.`,{mode:'explain'});},100);}
  function render(){if(!ensure())return;const l=current(),m=l?modelFor(l.id):null,next=priorityNext();box.querySelector('[data-gtm-title]').textContent=l?.title||'Choose a lesson';box.querySelector('[data-gtm-meta]').textContent=l?`${l.topicCode||''} · ${l.ref||''} · ${percent(m)} ${m?.status?.label?`· ${m.status.label}`:''}`:'Open a lesson to start a guided session';box.querySelector('[data-gtm-focus]').textContent=m?.improvement?.title||l?.focus||'Complete a marked lesson question to personalise this.';const nextBtn=box.querySelector('[data-gtm-next]');nextBtn.textContent=next?`Next: ${next.base.title} →`:'Browse lessons →';nextBtn.dataset.empty=next?'0':'1';}
  window.addEventListener('alevel:lesson-selected',()=>setTimeout(render,30));window.addEventListener('coursecontextchange',render);window.addEventListener('focus',render);document.addEventListener('click',e=>{if(e.target.closest('.automark-button'))setTimeout(render,100);});
  const start=()=>{if(!ensure())setTimeout(start,100);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.ALEVEL_GUIDED_TUTOR_MODE={refresh:render,start:(action='learn')=>run(action),next:openNext};
})();