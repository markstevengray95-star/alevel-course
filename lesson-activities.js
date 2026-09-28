(() => {
  const STORAGE_KEY = 'alevel-activity-progress-v1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const readState = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { return {}; } };
  const saveState = state => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const allLessons = () => window.ALEVEL_LESSONS || [];
  const build = lesson => window.ALEVEL_LESSON_CONTENT?.build?.(lesson) || lesson;
  const profile = lesson => window.ALEVEL_PHASE3?.profile?.(lesson.id) || null;

  function seededShuffle(items, seedText){
    const out = [...items]; let seed = [...String(seedText)].reduce((a,c)=>((a*31)+c.charCodeAt(0))>>>0,2166136261);
    for(let i=out.length-1;i>0;i--){ seed = (seed * 1664525 + 1013904223) >>> 0; const j = seed % (i+1); [out[i],out[j]]=[out[j],out[i]]; }
    return out;
  }

  function unique(values){ return [...new Set(values.filter(Boolean))]; }
  function topicPeers(lesson){ return allLessons().filter(l => l.topicId === lesson.topicId && l.id !== lesson.id); }
  function activityData(base){
    const lesson = build(base); const p = profile(base) || {};
    const peers = topicPeers(base);
    const focusOptions = seededShuffle(unique([lesson.focus, ...peers.slice(0,5).map(x=>x.focus)]).slice(0,4), `${base.id}-focus`);
    const correctFocus = focusOptions.indexOf(lesson.focus);
    const equation = lesson.equations?.[0];
    const peerEquations = unique(peers.slice(0,7).flatMap(l => (build(l).equations || []).map(e=>e[1])));
    let equationOptions = equation ? unique([equation[1], ...peerEquations.filter(x=>x!==equation[1])]).slice(0,4) : [];
    if(equation && equationOptions.length < 3) equationOptions = unique([equation[1], 'F = ma', 'v = fλ', 'E = hf']).slice(0,4);
    equationOptions = seededShuffle(equationOptions, `${base.id}-eq`);
    const correctEquation = equation ? equationOptions.indexOf(equation[1]) : -1;
    const steps = lesson.worked?.steps || ['Identify the governing principle.','List known quantities with units.','Select a suitable relationship.','Substitute carefully.','Check units and physical reasonableness.'];
    const shuffledSteps = steps.length > 1 ? [...steps.slice(1), steps[0]] : [...steps];
    const misconception = p.pitfall || lesson.misconceptions?.[0] || `A common error is to apply ${base.title.toLowerCase()} without checking the assumptions of the model.`;
    const checklist = unique([
      `Use the key physics idea for ${base.title.toLowerCase()}.`,
      equation ? `State and interpret ${equation[1]}.` : 'State the governing model or definition precisely.',
      'Use correct units and justify each step.',
      `Avoid this common pitfall: ${misconception}`
    ]);
    return {lesson,p,focusOptions,correctFocus,equation,equationOptions,correctEquation,steps,shuffledSteps,misconception,checklist};
  }

  function progressFor(id){ return readState()[id] || {}; }
  function setComplete(id,key,value=true){ const state=readState(); state[id] = {...(state[id]||{}),[key]:value}; saveState(state); updateProgress(id); }
  function updateProgress(id){
    const section=document.querySelector(`#lr-activities[data-lesson-id="${CSS.escape(id)}"]`); if(!section) return;
    const p=progressFor(id); const keys=['foundation','secure','stretch','astar']; const done=keys.filter(k=>p[k]).length;
    section.querySelector('[data-activity-progress]').textContent=`${done} / 4 complete`;
    section.querySelector('[data-activity-fill]').style.width=`${done/4*100}%`;
    keys.forEach(k=>section.querySelector(`[data-stage="${k}"]`)?.classList.toggle('complete',!!p[k]));
  }

  function card(stage,label,title,body){ return `<article class="activity-card" data-stage="${stage}"><div class="activity-card-head"><span>${label}</span><strong>${esc(title)}</strong><i aria-hidden="true">✓</i></div>${body}</article>`; }

  function renderActivities(base){
    const body=document.querySelector('.lesson-reader-body'); if(!body || !base?.id) return;
    body.querySelector('#lr-activities')?.remove();
    const data=activityData(base);
    const foundation = card('foundation','Foundation','Identify the lesson focus',`<p>Which statement best captures what this lesson is asking you to understand or do?</p><div class="activity-options">${data.focusOptions.map((x,i)=>`<label><input type="radio" name="focus-${esc(base.id)}" value="${i}"><span>${esc(x)}</span></label>`).join('')}</div><div class="activity-actions"><button type="button" data-check-focus data-answer="${data.correctFocus}">Check answer</button><span data-feedback-focus></span></div>`);
    const secure = data.equation ? card('secure','Secure','Choose the correct relationship',`<p>Which relationship is most directly useful for this lesson?</p><div class="activity-options equation-options">${data.equationOptions.map((x,i)=>`<label><input type="radio" name="eq-${esc(base.id)}" value="${i}"><code>${esc(x)}</code></label>`).join('')}</div><div class="activity-actions"><button type="button" data-check-equation data-answer="${data.correctEquation}">Check equation</button><span data-feedback-equation></span></div>`) : card('secure','Secure','Spot the misconception',`<p>Decide whether this statement is reliable physics or a misconception:</p><blockquote>${esc(data.misconception)}</blockquote><div class="activity-actions"><button type="button" data-misconception="yes">Reliable</button><button type="button" data-misconception="no">Misconception</button><span data-feedback-misconception></span></div>`);
    const stretch = card('stretch','Stretch','Put the solution method in order',`<p>Reorder the steps into a sensible A-level solution sequence.</p><ol class="order-activity" data-order-list>${data.shuffledSteps.map(step=>`<li data-step="${esc(String(data.steps.indexOf(step)))}"><span>${esc(step)}</span><div><button type="button" data-order-up aria-label="Move step up">↑</button><button type="button" data-order-down aria-label="Move step down">↓</button></div></li>`).join('')}</ol><div class="activity-actions"><button type="button" data-check-order>Check order</button><span data-feedback-order></span></div>`);
    const astar = card('astar','A*','Explain and evaluate',`<p>Explain <strong>${esc(base.title)}</strong> as if the question were unfamiliar. Include the model, any relevant relationship, assumptions and one common mistake.</p><textarea rows="5" data-astar-response placeholder="Write a concise exam-quality explanation…"></textarea><div class="activity-actions"><button type="button" data-reveal-checklist>Check against model points</button><span data-feedback-astar></span></div><div class="astar-checklist" data-astar-checklist hidden>${data.checklist.map(x=>`<p>□ ${esc(x)}</p>`).join('')}</div>`);
    const section=document.createElement('section'); section.className='lesson-reader-section activity-pathway'; section.id='lr-activities'; section.dataset.lessonId=base.id;
    section.innerHTML=`<div class="activity-path-head"><div><span class="phase-chip">Phase 4</span><h3>Interactive activity pathway</h3><p>Progress from recall to unfamiliar A* reasoning. Your completion is saved on this device.</p></div><div class="activity-progress"><strong data-activity-progress>0 / 4 complete</strong><div><span data-activity-fill></span></div></div></div><div class="activity-grid">${foundation}${secure}${stretch}${astar}</div>`;
    const anchor=body.querySelector('#lr-checks') || body.querySelector('#lr-exam'); body.insertBefore(section,anchor || null);
    bind(section,base,data); updateProgress(base.id);
    const nav=document.querySelector('.lesson-reader-nav'); if(nav && !nav.querySelector('[data-scroll-section="lr-activities"]')) nav.insertAdjacentHTML('beforeend','<button type="button" data-scroll-section="lr-activities">Activities</button>');
  }

  function feedback(el,msg,ok){ el.textContent=msg; el.className=ok?'activity-feedback correct':'activity-feedback incorrect'; }
  function bind(section,base,data){
    section.querySelector('[data-check-focus]')?.addEventListener('click',e=>{ const chosen=section.querySelector(`input[name="focus-${CSS.escape(base.id)}"]:checked`); const fb=section.querySelector('[data-feedback-focus]'); if(!chosen)return feedback(fb,'Choose an answer first.',false); const ok=Number(chosen.value)===Number(e.currentTarget.dataset.answer); feedback(fb,ok?'Correct — that is the lesson focus.':'Not yet — compare each option with the AQA focus above.',ok); if(ok)setComplete(base.id,'foundation'); });
    section.querySelector('[data-check-equation]')?.addEventListener('click',e=>{ const chosen=section.querySelector(`input[name="eq-${CSS.escape(base.id)}"]:checked`); const fb=section.querySelector('[data-feedback-equation]'); if(!chosen)return feedback(fb,'Choose an equation first.',false); const ok=Number(chosen.value)===Number(e.currentTarget.dataset.answer); feedback(fb,ok?`Correct. ${data.equation?.[2]||''}`:'Try again: choose the relationship most directly linked to this lesson.',ok); if(ok)setComplete(base.id,'secure'); });
    section.querySelectorAll('[data-misconception]').forEach(btn=>btn.addEventListener('click',()=>{const ok=btn.dataset.misconception==='no'; const fb=section.querySelector('[data-feedback-misconception]'); feedback(fb,ok?'Correct — identify what is wrong, then replace it with the correct physics.':'This is deliberately a misconception. Look for the hidden assumption or incorrect claim.',ok); if(ok)setComplete(base.id,'secure');}));
    section.addEventListener('click',e=>{ const up=e.target.closest('[data-order-up]'),down=e.target.closest('[data-order-down]'); if(!up&&!down)return; const li=e.target.closest('li'), list=li?.parentElement; if(!li||!list)return; if(up&&li.previousElementSibling)list.insertBefore(li,li.previousElementSibling); if(down&&li.nextElementSibling)list.insertBefore(li.nextElementSibling,li); });
    section.querySelector('[data-check-order]')?.addEventListener('click',()=>{ const order=[...section.querySelectorAll('[data-order-list] li')].map(li=>Number(li.dataset.step)); const ok=order.every((v,i)=>v===i); const fb=section.querySelector('[data-feedback-order]'); feedback(fb,ok?'Correct — the solution now follows a clear physics → maths → interpretation sequence.':'Not quite. Start with the governing idea and known quantities; interpretation and checking belong at the end.',ok); if(ok)setComplete(base.id,'stretch'); });
    section.querySelector('[data-reveal-checklist]')?.addEventListener('click',()=>{ const text=section.querySelector('[data-astar-response]').value.trim(); const box=section.querySelector('[data-astar-checklist]'); const fb=section.querySelector('[data-feedback-astar]'); box.hidden=false; const ok=text.length>=80; feedback(fb,ok?'Use the checklist to refine your answer. Stage marked complete.':'Add more physics reasoning before comparing with the checklist.',ok); if(ok)setComplete(base.id,'astar'); });
  }

  function enhanceMap(){
    document.querySelectorAll('.curriculum-lesson[data-lesson-id]').forEach(card=>{ const meta=card.querySelector('.lesson-map-meta'); if(meta && !meta.querySelector('.activity-ready')) meta.insertAdjacentHTML('beforeend','<span class="activity-ready">4 activities</span>'); });
  }
  window.addEventListener('alevel:lesson-selected',e=>renderActivities(e.detail));
  const start=()=>{ enhanceMap(); if(window.ALEVEL_ACTIVE_LESSON)renderActivities(window.ALEVEL_ACTIVE_LESSON); const root=document.getElementById('courseHome'); if(root)new MutationObserver(enhanceMap).observe(root,{childList:true,subtree:true}); };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.ALEVEL_ACTIVITIES={render:renderActivities,progress:progressFor};
})();