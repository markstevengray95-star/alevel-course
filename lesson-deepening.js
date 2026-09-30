(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const list = value => Array.isArray(value) ? value.filter(Boolean) : [];

  let activeLessonId = window.ALEVEL_ACTIVE_LESSON?.id || null;
  let shell = null;
  let deck = null;
  let slideIndex = 0;
  let returnFocus=null;
  let teacherNotes=false;
  const POSITION_KEY='alevel-slide-position-v2';
  function positions(){try{return JSON.parse(localStorage.getItem(POSITION_KEY)||'{}')||{};}catch{return {};}}

  function profileFor(id){
    return window.ALEVEL_PHASE3?.profile?.(id) || null;
  }

  function firstUsefulChunk(profile){
    const chunks = list(profile?.chunks);
    for(const chunk of chunks){
      const text = Array.isArray(chunk?.text) ? chunk.text : [chunk?.text];
      const sentence = clean(text.find(Boolean));
      if(sentence) return {title: clean(chunk.title || 'Lesson evidence'), text: sentence};
    }
    return {title:'Lesson evidence', text:clean(profile?.focus || profile?.hook || '')};
  }

  function representationPrompt(profile){
    const key = clean(profile?.concept?.key).toLowerCase();
    if(/graph|uncertainty|gradient|decay|resistivity|internal resistance/.test(key)) return 'Sketch the expected graph, label both axes with units, and identify the feature that provides the physics evidence.';
    if(/force|momentum|projectile|circular|mechanic|moment/.test(key)) return 'Draw a labelled force or vector diagram, choose a positive direction, and connect it to the governing equation.';
    if(/wave|interference|stationary|refraction|diffraction|phase/.test(key)) return 'Sketch the wave or ray model and annotate wavelength, phase/path difference, nodes, angles or boundaries as appropriate.';
    if(/particle|quark|interaction|conservation|nuclear notation/.test(key)) return 'Build a before/after particle table and check every relevant conservation law explicitly.';
    if(/circuit|current|potential|emf|divider|capacitor/.test(key)) return 'Draw the circuit first, mark current directions and potential differences, then connect the diagram to the equation.';
    if(/field|induction|magnetic|electric|gravitational/.test(key)) return 'Draw the field geometry and use direction/sign information before substituting values.';
    if(/thermal|gas|shm/.test(key)) return 'Represent the process with a graph or particle/energy model, then link the representation to the governing equation.';
    if(/binding|radiation|radioactive|nuclear/.test(key)) return 'Use a decay, energy or nuclear-scale representation and annotate what changes and what is conserved.';
    return 'Translate the idea into a second representation: words → diagram/graph → equation, then explain what each representation adds.';
  }

  function deepeningFor(profile){
    if(!profile) return null;
    const concept = profile.concept || {};
    const equation = profile.primaryEquation || profile.equations?.[0] || [concept.model, concept.model, concept.method];
    const evidence = firstUsefulChunk(profile);
    const model = clean(equation?.[1] || concept.model || 'the governing physics model');
    const method = clean(equation?.[2] || concept.method || profile.focus);
    const pitfall = clean(concept.pitfall || 'giving an answer without linking the evidence to the physics');
    const focus = clean(profile.focus || profile.title);
    const key = clean(concept.key || profile.title);
    return {
      reasoning:[
        `State the central physics idea: ${key}.`,
        `Choose the relationship or representation that expresses it: ${model}.`,
        `Use measurable evidence from the lesson: ${evidence.text}`,
        `Connect the evidence to the model: ${method}`,
        `Return to the question and state what the evidence shows about ${focus}.`
      ],
      representation:[
        `Explain ${key} in words without using the equation first.`,
        `Then use the model ${model} and state what each symbol or feature means.`,
        representationPrompt(profile),
        'Finish with one sentence explaining how the visual feature is represented mathematically.'
      ],
      misconception:[
        `Tempting but weak approach: ${pitfall}`,
        `Test it: what prediction would that idea make for ${profile.title.toLowerCase()}?`,
        `Repair it using ${model} and evidence from the lesson.`,
        'Exam language: state the corrected physics first, then explain why the original idea fails.'
      ],
      teacherAnswer:`A strong response should state ${key}, use ${model}, connect it to evidence from ${focus}, and make a justified conclusion with units, signs and assumptions where relevant.`
    };
  }

  function slide(layout,kicker,title,bullets,note='',equation=''){
    return {type:layout==='title'?'title':layout==='equation'?'equation':'bullets',layout,kicker,title,bullets:list(bullets).map(clean).filter(Boolean),note:clean(note),equation:clean(equation)};
  }

  function buildPhase2Deck(id){
    const profile=profileFor(id);
    return profile ? window.ALEVEL_SLIDE_DESIGN.build(profile) : null;
  }

  function ensureShell(){
    if(shell) return shell;
    shell = document.createElement('div');
    shell.className = 'deep-deck-shell';
    shell.hidden = true;
    shell.innerHTML = `
      <div class="deep-deck-backdrop" data-deep-close></div>
      <section class="phase3-deck deep-deck" role="dialog" aria-modal="true" aria-label="Lesson presentation">
        <aside class="phase3-deck-side">
          <div><span class="phase3-kicker">Lesson presentation</span><h2 data-deep-title></h2><p data-deep-subtitle></p></div>
          <button type="button" data-outline-toggle aria-expanded="false">☰ Slide outline</button>
          <div class="phase3-slide-list" data-deep-list aria-label="Slide outline"></div>
          <div class="phase3-deck-tools">
            <button type="button" class="primary" data-deep-print>Print / PDF</button>
            <button type="button" data-deep-copy>Copy outline</button>
            <button type="button" data-deep-close>Close</button>
          </div>
        </aside>
        <main class="phase3-main">
          <div class="phase3-top"><strong data-deep-count role="status" aria-live="polite"></strong><label class="ls-jump-label">Jump to <select data-slide-jump aria-label="Jump to slide"></select></label><span>← / → change slide</span></div>
          <article class="phase3-slide deep-slide" tabindex="0"></article>
          <div class="ls-support"><button type="button" data-slide-answer aria-expanded="false" aria-controls="ls-solution">Show solution</button><button type="button" data-teacher-notes aria-expanded="false" aria-controls="ls-teacher-note">Teacher notes</button><div id="ls-solution" class="ls-solution" hidden></div><div id="ls-teacher-note" class="ls-teacher-note" hidden></div></div>
          <footer class="phase3-bottom">
            <div class="phase3-progress"><span data-deep-progress></span></div>
            <nav class="phase3-nav"><button type="button" data-deep-prev>←</button><button type="button" data-deep-next>→</button></nav>
          </footer>
        </main>
      </section>`;
    document.body.appendChild(shell);
    shell.addEventListener('click', event => {
      if(event.target.closest('[data-outline-toggle]')){
        const expanded=shell.classList.toggle('ls-outline-open');
        shell.querySelector('[data-outline-toggle]').setAttribute('aria-expanded',String(expanded));
      }
      if(event.target.closest('[data-slide-answer]')){
        const answer=shell.querySelector('#ls-solution');answer.hidden=!answer.hidden;
        const button=shell.querySelector('[data-slide-answer]');button.setAttribute('aria-expanded',String(!answer.hidden));button.textContent=answer.hidden?'Show solution':'Hide solution';
      }
      if(event.target.closest('[data-teacher-notes]')){
        teacherNotes=!teacherNotes;updateSupport();
      }
      if(event.target.closest('[data-deep-close]')) close();
      if(event.target.closest('[data-deep-prev]')) move(-1);
      if(event.target.closest('[data-deep-next]')) move(1);
      if(event.target.closest('[data-deep-print]')) window.print();
      if(event.target.closest('[data-deep-copy]')) copyOutline();
      const button = event.target.closest('[data-deep-index]');
      if(button){ slideIndex = Number(button.dataset.deepIndex); render(); }
    });
    shell.querySelector('[data-slide-jump]').addEventListener('change',event=>{slideIndex=Number(event.target.value);render();});
    return shell;
  }

  function slideHtml(s){
    return window.ALEVEL_SLIDE_DESIGN.html(s);
  }
  function updateSupport(resetAnswer=false){
    const s=deck.slides[slideIndex];
    const answer=shell.querySelector('#ls-solution');if(resetAnswer)answer.hidden=true;
    answer.innerHTML=`<strong>Solution / key reasoning</strong><ol>${list(s.solution).map(item=>`<li>${esc(item)}</li>`).join('')}</ol>`;
    const answerButton=shell.querySelector('[data-slide-answer]');answerButton.hidden=!s.solution?.length;answerButton.textContent=answer.hidden?'Show solution':'Hide solution';answerButton.setAttribute('aria-expanded',String(!answer.hidden));
    const note=shell.querySelector('#ls-teacher-note');note.textContent=s.note||'Invite a precise explanation, then connect it to the lesson objective.';note.hidden=!teacherNotes;
    shell.querySelector('[data-teacher-notes]').setAttribute('aria-expanded',String(teacherNotes));
  }

  function render(){
    if(!deck) return;
    const host = ensureShell();
    slideIndex = Math.max(0,Math.min(deck.slides.length-1,slideIndex));
    const s = deck.slides[slideIndex] || deck.slides[0];
    host.querySelector('[data-deep-title]').textContent = deck.title || 'Lesson presentation';
    host.querySelector('[data-deep-subtitle]').textContent = `${deck.subtitle || ''} · ${deck.slides.length} slides`;
    host.querySelector('[data-deep-count]').textContent = `Slide ${slideIndex + 1} / ${deck.slides.length}`;
    const slideNode = host.querySelector('.deep-slide');
    slideNode.dataset.layout = s.layout || 'content';
    slideNode.innerHTML = slideHtml(s);
    host.querySelector('[data-deep-progress]').style.width = `${((slideIndex + 1) / deck.slides.length) * 100}%`;
    host.querySelector('[data-deep-list]').innerHTML = deck.slides.map((item,index) => `${index===0||item.section!==deck.slides[index-1].section?`<strong class="ls-outline-section">${esc(item.section)}</strong>`:''}<button type="button" data-deep-index="${index}" aria-current="${index===slideIndex?'step':'false'}" class="${index === slideIndex ? 'active' : ''}"><small>${esc(item.kicker)}</small><span>${index + 1}. ${esc(item.title)}</span></button>`).join('');
    const picker=host.querySelector('[data-slide-jump]');picker.innerHTML=deck.slides.map((item,index)=>`<option value="${index}">${index+1}. ${esc(item.kicker)}</option>`).join('');picker.value=String(slideIndex);
    host.querySelector('[data-deep-prev]').disabled = slideIndex === 0;
    host.querySelector('[data-deep-next]').disabled = slideIndex === deck.slides.length - 1;
    updateSupport(true);
    try{const saved=positions();saved[deck.id]=slideIndex;localStorage.setItem(POSITION_KEY,JSON.stringify(saved));}catch{}
    slideNode.scrollTop=0;
    slideNode.focus({preventScroll:true});
    window.dispatchEvent(new CustomEvent('alevel:slide-changed',{detail:{id:deck.id,index:slideIndex,total:deck.slides.length}}));
  }

  function open(id,{restart=false}={}){
    const next = buildPhase2Deck(id);
    if(!next) return false;
    activeLessonId = id;
    deck = next;
    if(!shell||shell.hidden)returnFocus=document.activeElement;
    const saved=Number(positions()[id]);slideIndex=restart||!Number.isFinite(saved)?0:Math.min(Math.max(0,saved),deck.slides.length-1);
    ensureShell().hidden = false;
    document.body.classList.add('lesson-reader-open','deep-deck-open');
    render();
    return true;
  }

  function close(){
    if(shell) shell.hidden = true;
    document.body.classList.remove('deep-deck-open');
    if(!document.querySelector('.lesson-reader-shell:not([hidden])')) document.body.classList.remove('lesson-reader-open');
    returnFocus?.focus?.({preventScroll:true});
  }

  function move(delta){
    if(!deck) return;
    const next = Math.max(0,Math.min(deck.slides.length-1,slideIndex + delta));
    if(next === slideIndex) return;
    slideIndex = next;
    render();
  }

  function copyOutline(){
    if(!deck) return;
    const text = deck.slides.map((s,index) => `${index + 1}. ${s.title}\n${list(s.bullets).map(item => `- ${item}`).join('\n')}`).join('\n\n');
    navigator.clipboard?.writeText(text);
  }

  function renderReaderDeepening(id){
    const profile = profileFor(id);
    const deep = deepeningFor(profile);
    const reader = document.querySelector('.lesson-reader-shell:not([hidden])');
    if(!profile || !deep || !reader) return;
    const overview = reader.querySelector('#lr-overview') || reader.querySelector('.lesson-reader-content') || reader;
    overview.querySelector('.deep-understanding-panel')?.remove();
    const panel = document.createElement('section');
    panel.className = 'deep-understanding-panel';
    panel.innerHTML = `
      <div class="deep-panel-heading"><div><span>PowerPoint-style lesson</span><h3>${esc(profile.title)}</h3></div><button type="button" data-open-deep-presentation="${esc(profile.id)}">Open lesson slides</button></div>
      <div class="deep-reasoning-grid">
        ${deep.reasoning.slice(0,4).map((item,index) => `<article><b>${index + 1}</b><p>${esc(item)}</p></article>`).join('')}
      </div>
      <div class="deep-reader-columns">
        <article><span>Misconception repair</span><p>${esc(deep.misconception[0])}</p><p>${esc(deep.misconception[2])}</p></article>
        <article><span>A* reasoning</span><p>${esc(deep.representation[0])}</p><p>${esc(deep.representation[2])}</p></article>
      </div>`;
    overview.appendChild(panel);
  }

  document.addEventListener('click', event => {
    const mapButton = event.target.closest?.('[data-present-lesson]');
    if(mapButton){
      const id = mapButton.dataset.presentLesson;
      if(open(id)){
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    }
    const readerButton = event.target.closest?.('[data-teacher-presentation]');
    if(readerButton && activeLessonId && open(activeLessonId)){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
  }, true);

  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-open-deep-presentation]');
    if(button) open(button.dataset.openDeepPresentation);
  });

  document.addEventListener('keydown', event => {
    if(!shell || shell.hidden) return;
    if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    if(event.key==='Tab'){
      const elements=Array.from(shell.querySelectorAll('button:not(:disabled),select,.deep-slide')).filter(el=>el.getClientRects().length);
      const first=elements[0],last=elements.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
    if(event.key === 'Escape') close();
    if(event.key === 'ArrowLeft' || event.key === 'PageUp') move(-1);
    if(event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      if(event.target?.matches?.('input,textarea,select,button')) return;
      event.preventDefault();
      move(1);
    }
    if(event.key === 'Home'){ slideIndex = 0; render(); }
    if(event.key === 'End'){ slideIndex = deck.slides.length - 1; render(); }
  });

  window.addEventListener('alevel:lesson-selected', event => {
    activeLessonId = event.detail?.id || activeLessonId;
    window.setTimeout(() => renderReaderDeepening(activeLessonId), 0);
  });

  if(activeLessonId) window.setTimeout(() => renderReaderDeepening(activeLessonId), 0);

  window.ALEVEL_DEEPENING = {
    profile:id => deepeningFor(profileFor(id)),
    deck:buildPhase2Deck,
    open,
    get activeLessonId(){ return activeLessonId; }
  };
})();
