(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const list = value => Array.isArray(value) ? value.filter(Boolean) : [];

  const CRITERIA = [
    ['aqa','AQA coverage','Mapped specification reference and a precise lesson focus are present.'],
    ['prereq','Prerequisite bridge','The lesson starts from prior knowledge or a retrieval bridge.'],
    ['chunking','Chunked teaching','New knowledge is broken into manageable teaching chunks.'],
    ['modelling','Worked modelling','Students see a worked model, method or equation used explicitly.'],
    ['checks','Checks for understanding','There are several opportunities to check understanding before independent work.'],
    ['misconceptions','Misconceptions','Likely errors are anticipated and corrected explicitly.'],
    ['practice','Independent practice','Students have a clear task requiring them to apply the new idea.'],
    ['exam','Exam application','The lesson includes AQA-style exam application with marks.'],
    ['stretch','A/A* extension','The presentation includes a higher-order reasoning/stretch stage.'],
    ['plenary','Plenary','The sequence finishes with retrieval, reflection or an exit ticket.']
  ];

  const RECOMMEND = {
    aqa:'Add an exact AQA specification reference and write the lesson focus as a measurable outcome.',
    prereq:'Add 3–5 retrieval questions that activate the knowledge needed for the new idea.',
    chunking:'Break the explanation into at least two short teaching chunks with one core idea per chunk.',
    modelling:'Add a worked example or explicit model with setup, reasoning, substitution/representation and final check.',
    checks:'Add at least three checks for understanding before the independent task.',
    misconceptions:'Add at least two likely misconceptions and a precise correction for each.',
    practice:'Add an independent task with enough structure for students to show working and justify choices.',
    exam:'Add at least one AQA-style question, preferably including a 4+ mark item.',
    stretch:'Add an A/A* prompt that asks students to connect representations, justify assumptions or evaluate a model.',
    plenary:'Finish with an exit ticket or five-point summary that returns to the lesson objectives.'
  };

  function rawLesson(id){ return (window.ALEVEL_LESSONS || []).find(item => item.id === id) || null; }
  function builtLesson(id){
    const raw=rawLesson(id);
    if(!raw) return null;
    try { return window.ALEVEL_LESSON_CONTENT?.build?.(raw) || raw; }
    catch { return raw; }
  }
  function profileFor(id){
    try { return window.ALEVEL_PHASE3?.profile?.(id) || builtLesson(id); }
    catch { return builtLesson(id); }
  }
  function deckFor(id){
    try { return window.ALEVEL_DEEPENING?.deck?.(id) || null; }
    catch { return null; }
  }
  function hasLayout(deck,name){ return list(deck?.slides).some(slide => slide?.layout === name); }

  function audit(id){
    const lesson=profileFor(id);
    const raw=rawLesson(id);
    if(!lesson || !raw) return null;
    const deck=deckFor(id);
    const checks=list(lesson.checks).length ? list(lesson.checks) : list(lesson.checkpoints);
    const chunks=list(lesson.chunks);
    const exam=list(lesson.exam);
    const workedSteps=list(lesson.worked?.steps);
    const equations=list(lesson.equations);
    const misconceptions=list(lesson.misconceptions).length ? list(lesson.misconceptions) : [lesson.concept?.pitfall].filter(Boolean);
    const starter=list(lesson.starter);
    const objectives=list(lesson.objectives);

    const tests={
      aqa:!!String(lesson.ref || raw.ref || '').trim() && !!String(lesson.focus || raw.focus || '').trim(),
      prereq:raw.lessonNumber===1 || starter.length>=3 || objectives.length>=2,
      chunking:chunks.length>=2 && chunks.filter(chunk => list(chunk?.text).join(' ').trim().length>50).length>=2,
      modelling:workedSteps.length>=3 || equations.length>=1 || !!lesson.primaryEquation || !!lesson.concept?.model,
      checks:checks.length>=3,
      misconceptions:misconceptions.length>=2,
      practice:checks.length>=3 || hasLayout(deck,'activity'),
      exam:exam.length>=1 && exam.some(q => Number(q?.marks || 0)>=2),
      stretch:deck ? hasLayout(deck,'stretch') : true,
      plenary:deck ? (hasLayout(deck,'plenary') || hasLayout(deck,'summary')) : true
    };

    const criteria=CRITERIA.map(([key,label,description])=>({
      key,label,description,pass:!!tests[key],recommendation:tests[key]?'':RECOMMEND[key]
    }));
    const passed=criteria.filter(item=>item.pass).length;
    const score=Math.round((passed/criteria.length)*100);
    const level=score===100?'ready':score>=80?'nearly':score>=60?'review':'attention';
    return {
      id,
      title:lesson.title || raw.title,
      ref:lesson.ref || raw.ref,
      topicId:raw.topicId,
      topicTitle:raw.topicTitle,
      type:raw.type,
      minutes:raw.minutes,
      passed,
      total:criteria.length,
      score,
      level,
      criteria,
      missing:criteria.filter(item=>!item.pass),
      checkedAt:Date.now()
    };
  }

  function all(){ return (window.ALEVEL_LESSONS || []).map(item=>audit(item.id)).filter(Boolean); }

  function badgeText(result){
    if(!result) return 'Audit unavailable';
    if(result.score===100) return 'Teaching ready';
    if(result.score>=80) return `${result.passed}/${result.total} ready`;
    return `${result.passed}/${result.total} needs review`;
  }

  function renderReader(id){
    const result=audit(id);
    const reader=document.querySelector('.lesson-reader-shell:not([hidden])');
    if(!result || !reader) return;
    const overview=reader.querySelector('#lr-overview') || reader.querySelector('.lesson-reader-content') || reader;
    overview.querySelector('.lesson-quality-audit')?.remove();
    const panel=document.createElement('section');
    panel.className=`lesson-quality-audit qa-${result.level}`;
    panel.innerHTML=`
      <div class="qa-head">
        <div><span>Phase 9 · teaching content audit</span><h3>Lesson readiness</h3><p>AQA ${esc(result.ref)} · ${esc(result.topicTitle || '')}</p></div>
        <div class="qa-score" aria-label="${result.passed} of ${result.total} teaching checks passed"><strong>${result.passed}/${result.total}</strong><span>${result.score}%</span></div>
      </div>
      <div class="qa-grid">
        ${result.criteria.map(item=>`<article class="${item.pass?'pass':'warn'}"><span class="qa-icon" aria-hidden="true">${item.pass?'✓':'!'}</span><div><strong>${esc(item.label)}</strong><p>${esc(item.description)}</p>${item.pass?'':`<small>${esc(item.recommendation)}</small>`}</div></article>`).join('')}
      </div>
      <div class="qa-summary ${result.missing.length?'has-gaps':'complete'}">
        <strong>${result.missing.length ? `${result.missing.length} teaching check${result.missing.length===1?'':'s'} to strengthen` : 'All teaching-readiness checks are secured'}</strong>
        <span>${result.missing.length ? 'Use the highlighted recommendations before teaching or presenting the lesson.' : 'The lesson contains the mapped content, modelling, checks, application, stretch and plenary expected by the presentation system.'}</span>
      </div>`;
    const focus=overview.querySelector('.lesson-focus-box');
    if(focus) focus.insertAdjacentElement('afterend',panel); else overview.appendChild(panel);
  }

  function enhanceMap(){
    document.querySelectorAll('.curriculum-lesson[data-lesson-id]').forEach(card=>{
      const result=audit(card.dataset.lessonId);
      if(!result) return;
      let badge=card.querySelector('[data-quality-badge]');
      if(!badge){
        badge=document.createElement('span');
        badge.dataset.qualityBadge='';
        badge.className='lesson-quality-badge';
        const meta=card.querySelector('.lesson-map-meta') || card;
        meta.appendChild(badge);
      }
      badge.className=`lesson-quality-badge qa-${result.level}`;
      badge.textContent=badgeText(result);
      badge.title=`Phase 9 audit: ${result.passed}/${result.total} checks passed`;
    });
  }

  function refresh(){ enhanceMap(); const id=window.ALEVEL_ACTIVE_LESSON?.id; if(id) renderReader(id); }

  window.addEventListener('alevel:lesson-selected',event=>{
    const id=event.detail?.id;
    if(id) window.setTimeout(()=>renderReader(id),40);
  });
  window.addEventListener('alevel:presentation-engine-ready',refresh);

  const start=()=>{
    enhanceMap();
    const root=document.getElementById('courseHome');
    if(root) new MutationObserver(()=>enhanceMap()).observe(root,{childList:true,subtree:true});
    const id=window.ALEVEL_ACTIVE_LESSON?.id;
    if(id) renderReader(id);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();

  window.ALEVEL_QUALITY_AUDIT={audit,all,refresh,criteria:CRITERIA.map(([key,label])=>({key,label}))};
})();