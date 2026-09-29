(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const list = value => Array.isArray(value) ? value.filter(Boolean) : [];

  let activeLessonId = window.ALEVEL_ACTIVE_LESSON?.id || null;
  let shell = null;
  let deck = null;
  let slideIndex = 0;

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
    const p = profileFor(id);
    if(!p) return null;

    const chunks = list(p.chunks);
    const chunk1 = chunks[0] || {title:'Build the core idea',text:[p.topicIntro,p.focus]};
    const chunk2 = chunks[1] || chunks[0] || {title:'Connect and apply',text:[p.concept?.method,p.focus]};
    const eq = p.primaryEquation || p.equations?.[0] || [p.concept?.model,p.concept?.model,p.concept?.method];
    const keywords = list(p.keywords).slice(0,10);
    const objectives = list(p.objectives).length ? p.objectives : [`Explain ${p.title}.`,'Apply the relevant model or equation.','Answer an AQA-style question using precise physics.'];
    const checks = list(p.checks).length ? p.checks : list(p.checkpoints);
    const misconceptions = list(p.misconceptions).length ? p.misconceptions : [p.concept?.pitfall];
    const examQuestions = list(p.exam);
    const exam = examQuestions.find(q=>Number(q.marks)>=4) || examQuestions[0] || {marks:4,q:`Explain the physics of ${p.title}.`};
    const deep = deepeningFor(p);
    const model = clean(eq?.[1] || p.concept?.model || 'Use the governing model for this lesson.');
    const use = clean(eq?.[2] || p.concept?.method || p.focus);
    const central = clean(p.concept?.key || p.title);
    const pitfall = clean(p.concept?.pitfall || misconceptions[0] || 'State the physics explicitly rather than relying on an unsupported assertion.');

    const starterAnswers = [
      `Central idea to retrieve: ${central}.`,
      `Useful model or relationship: ${model}.`,
      `A strong explanation should include: ${use}`,
      `Common trap to avoid: ${pitfall}`
    ];

    const taskPrompts = checks.slice(0,3);
    while(taskPrompts.length<3) taskPrompts.push([
      `State the principle that controls ${p.title.toLowerCase()}.`,
      `Use ${model} to explain what changes and what stays constant.`,
      `Identify one assumption or limitation in the model.`
    ][taskPrompts.length]);

    const taskAnswers = [
      `Principle: ${central}.`,
      `Model/equation: ${model}.`,
      `Method or reasoning: ${use}`,
      `Evidence should be linked back to the lesson focus: ${clean(p.focus)}.`,
      `Do not make this mistake: ${pitfall}`
    ];

    const markPoints = [
      `State the relevant principle: ${central}.`,
      `Select and correctly use ${model}.`,
      `Identify the relevant measurable quantities or evidence from ${clean(p.focus)}.`,
      `Explain the reasoning chain rather than only quoting a formula.`,
      'Use correct units, signs, directions and significant figures where relevant.',
      `Address a limitation, assumption or misconception such as: ${pitfall}`
    ].slice(0,Math.max(4,Math.min(6,Number(exam.marks)||6)));

    const summary = [
      `Core idea: ${central}.`,
      `Model to remember: ${model}.`,
      `How to use it: ${use}`,
      `Evidence/application: ${clean(p.focus)}.`,
      `Exam warning: ${pitfall}`
    ];

    return {
      id:p.id,
      title:p.title,
      subtitle:`${p.topicCode} · ${p.ref} · ${p.year}`,
      phase:'Phase 2',
      slides:[
        slide('title',`${p.topicCode} · ${p.ref}`,p.title,[p.hook,`Lesson focus: ${p.focus}`],'Begin with the question or image on screen. Do not explain the model immediately.'),
        slide('retrieval','Retrieval starter','Do now',[...list(p.starter).slice(0,4)],'Give students 3–5 minutes of silent retrieval before revealing answers.'),
        slide('answer','Starter answers','Check and improve',starterAnswers,'Reveal after students have committed to an answer. Ask them to correct in a different colour.'),
        slide('objectives','Learning objectives','By the end of the lesson',objectives,'Keep these visible briefly, then return to them in the plenary.'),
        slide('vocabulary','Key vocabulary','Language of the lesson',keywords.length?keywords.map((k,i)=>`${i+1}. ${k}`):[central,model],'Ask students to identify any terms they cannot yet define precisely.'),
        slide('teach','Teach 1',clean(chunk1.title || 'Build the core idea'),list(chunk1.text).slice(0,4),'Explain one idea at a time. Use questioning before adding extra detail.'),
        slide('worked','Worked example',p.worked?.question || `Apply ${model}.`,list(p.worked?.steps).slice(0,6),p.worked?.answer || 'Model the setup, substitution, units and final check.'),
        slide('check','Check for understanding','Pause and check',list(p.checkpoints).length?p.checkpoints:taskPrompts,'Use mini-whiteboards or cold call. Do not move on until the key misconception is exposed.'),
        slide('activity','Student task','Apply the new idea',taskPrompts,'Suggested time: 6–8 minutes. Students should show working and justify each choice.'),
        slide('answer','Task answers','Self-check',taskAnswers,'Students should amend their own work rather than simply copy the model.'),
        slide('teach','Teach 2',clean(chunk2.title || 'Connect the physics'),list(chunk2.text).slice(0,4),'Build from the first teaching chunk and explicitly connect the two ideas.'),
        slide('application','Application','Use the physics in a new context',[clean(p.hook),`Predict what would happen if one relevant quantity changed.`,`Explain the prediction using ${model}.`,`State one assumption behind your answer.`],'Pair discussion first, then take a fully reasoned response.'),
        slide('exam','AQA exam question',`${exam.marks || 4}-mark practice`,[clean(exam.q)],'Students answer independently under timed conditions before the mark scheme is shown.'),
        slide('markscheme','Mark scheme / model answer','What earns the marks',markPoints,deep?.teacherAnswer || 'Award credit for correct physics, linked reasoning and appropriate evidence.'),
        slide('misconception','Common misconceptions','Spot and repair the mistake',misconceptions.slice(0,4).concat([`Key lesson trap: ${pitfall}`]).filter((x,i,a)=>a.indexOf(x)===i),'Ask students to rewrite one incorrect statement as precise physics.'),
        slide('stretch','A* stretch','Push the reasoning',deep?.representation || [`Explain ${central} in words.`,`Represent it with ${model}.`,'Connect it to a graph, diagram or experimental observation.','State where the model may stop being valid.'],'Require a justified answer, not just a more difficult calculation.'),
        slide('plenary','Plenary','Exit ticket',[`Explain ${p.title} in one precise sentence.`,`Write ${model} and state when it applies.`,`Name one misconception you will now avoid.`,`Confidence check: what still needs clarification?`],'Collect one response or use mini-whiteboards before students leave.'),
        slide('summary','Lesson summary','Five things to remember',summary,'Return to the objectives and identify which have been secured.')
      ]
    };
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
          <div class="phase3-slide-list" data-deep-list></div>
          <div class="phase3-deck-tools">
            <button type="button" class="primary" data-deep-print>Print / PDF</button>
            <button type="button" data-deep-copy>Copy outline</button>
            <button type="button" data-deep-close>Close</button>
          </div>
        </aside>
        <main class="phase3-main">
          <div class="phase3-top"><strong data-deep-count></strong><span>← / → change slide</span></div>
          <article class="phase3-slide deep-slide" tabindex="0"></article>
          <footer class="phase3-bottom">
            <div class="phase3-progress"><span data-deep-progress></span></div>
            <nav class="phase3-nav"><button type="button" data-deep-prev>←</button><button type="button" data-deep-next>→</button></nav>
          </footer>
        </main>
      </section>`;
    document.body.appendChild(shell);
    shell.addEventListener('click', event => {
      if(event.target.closest('[data-deep-close]')) close();
      if(event.target.closest('[data-deep-prev]')) move(-1);
      if(event.target.closest('[data-deep-next]')) move(1);
      if(event.target.closest('[data-deep-print]')) window.print();
      if(event.target.closest('[data-deep-copy]')) copyOutline();
      const button = event.target.closest('[data-deep-index]');
      if(button){ slideIndex = Number(button.dataset.deepIndex); render(); }
    });
    return shell;
  }

  function slideHtml(s){
    const bullets = list(s?.bullets).map(item => `<li>${esc(item)}</li>`).join('');
    const note = s?.note ? `<div class="phase3-note deep-teacher-note"><strong>Teacher note</strong><span>${esc(s.note)}</span></div>` : '';
    if(s?.type === 'title') return `<div class="phase3-kicker">${esc(s.kicker)}</div><h1>${esc(s.title)}</h1><ul>${bullets}</ul>${note}`;
    if(s?.type === 'equation') return `<div class="phase3-kicker">${esc(s.kicker)}</div><h2>${esc(s.title)}</h2><div class="phase3-equation">${esc(s.equation)}</div><ul>${bullets}</ul>${note}`;
    return `<div class="phase3-kicker">${esc(s?.kicker)}</div><h2>${esc(s?.title)}</h2><ul>${bullets}</ul>${note}`;
  }

  function render(){
    if(!deck) return;
    const host = ensureShell();
    slideIndex = Math.max(0,Math.min(deck.slides.length-1,slideIndex));
    const s = deck.slides[slideIndex] || deck.slides[0];
    host.querySelector('[data-deep-title]').textContent = deck.title || 'Lesson presentation';
    host.querySelector('[data-deep-subtitle]').textContent = `${deck.subtitle || ''} · 18-slide lesson sequence`;
    host.querySelector('[data-deep-count]').textContent = `Slide ${slideIndex + 1} / ${deck.slides.length}`;
    const slideNode = host.querySelector('.deep-slide');
    slideNode.dataset.layout = s.layout || 'content';
    slideNode.innerHTML = slideHtml(s);
    host.querySelector('[data-deep-progress]').style.width = `${((slideIndex + 1) / deck.slides.length) * 100}%`;
    host.querySelector('[data-deep-list]').innerHTML = deck.slides.map((item,index) => `<button type="button" data-deep-index="${index}" class="${index === slideIndex ? 'active' : ''}">${index + 1}. ${esc(item.title)}</button>`).join('');
    host.querySelector('[data-deep-prev]').disabled = slideIndex === 0;
    host.querySelector('[data-deep-next]').disabled = slideIndex === deck.slides.length - 1;
    slideNode.focus({preventScroll:true});
  }

  function open(id){
    const next = buildPhase2Deck(id);
    if(!next) return false;
    activeLessonId = id;
    deck = next;
    slideIndex = 0;
    ensureShell().hidden = false;
    document.body.classList.add('lesson-reader-open','deep-deck-open');
    render();
    return true;
  }

  function close(){
    if(shell) shell.hidden = true;
    document.body.classList.remove('deep-deck-open');
    if(!document.querySelector('.lesson-reader-shell:not([hidden])')) document.body.classList.remove('lesson-reader-open');
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
      <div class="deep-panel-heading"><div><span>PowerPoint-style lesson</span><h3>${esc(profile.title)}</h3></div><button type="button" data-open-deep-presentation="${esc(profile.id)}">Open 18-slide presentation</button></div>
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