(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  let activeLessonId = window.ALEVEL_ACTIVE_LESSON?.id || null;
  let shell = null;
  let deck = null;
  let slideIndex = 0;

  function profileFor(id){
    return window.ALEVEL_PHASE3?.profile?.(id) || null;
  }

  function firstUsefulChunk(profile){
    const chunks = profile?.chunks || [];
    for(const chunk of chunks){
      const text = Array.isArray(chunk?.text) ? chunk.text : [chunk?.text];
      const sentence = clean(text.find(Boolean));
      if(sentence) return {title: clean(chunk.title || 'Lesson evidence'), text: sentence};
    }
    return {title: 'Lesson evidence', text: clean(profile?.focus || profile?.hook || '')};
  }

  function representationPrompt(profile){
    const key = clean(profile?.concept?.key).toLowerCase();
    if(/graph|uncertainty|gradient|decay|resistivity|internal resistance/.test(key)) return 'Sketch the expected graph, label both axes with units, then identify the feature that provides the physics evidence.';
    if(/force|momentum|projectile|circular|mechanic|moment/.test(key)) return 'Draw a labelled force/vector diagram before writing equations. Make the chosen positive direction explicit.';
    if(/wave|interference|stationary|refraction|diffraction|phase/.test(key)) return 'Sketch the wave or ray model and annotate wavelength, phase/path difference, nodes, angles or boundaries as appropriate.';
    if(/particle|quark|interaction|conservation|nuclear notation/.test(key)) return 'Build a before/after particle table and check every relevant conservation law explicitly.';
    if(/circuit|current|potential|emf|divider|capacitor/.test(key)) return 'Draw the circuit/model first, mark current directions and p.d.s, then connect the diagram to the equation.';
    if(/field|induction|magnetic|electric|gravitational/.test(key)) return 'Draw field lines or the field geometry and use direction/sign information before substituting values.';
    if(/thermal|gas|shm/.test(key)) return 'Represent the process with a graph or particle/energy model, then link the representation to the governing equation.';
    if(/binding|radiation|radioactive|nuclear/.test(key)) return 'Use a decay, energy or nuclear-scale representation and annotate the quantity that changes and the quantity that is conserved.';
    return 'Translate the idea into a second representation: words → diagram/graph → equation. Explain what each representation adds.';
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
      reasoning: [
        `1. Principle — state the central idea for ${profile.title}: ${key}.`,
        `2. Model — choose the relationship or representation that expresses it: ${model}.`,
        `3. Evidence — use a measurable feature from the lesson: ${evidence.text}`,
        `4. Reasoning — connect the evidence to the model rather than simply quoting it: ${method}`,
        `5. Conclusion — return to the exact question and state what the evidence shows about ${focus}.`
      ],
      representation: [
        `Words: explain ${key} without using the equation first.`,
        `Equation/model: ${model}. State what every symbol or feature means in this lesson.`,
        `Visual: ${representationPrompt(profile)}`,
        'Connection: write one sentence explaining how the visual feature is represented mathematically.'
      ],
      misconception: [
        `Tempting but weak approach: ${pitfall}`,
        `Diagnostic check: ask what prediction this approach would make for ${profile.title.toLowerCase()}.`,
        `Repair: replace it with the explicit model ${model} and use the lesson evidence to test the prediction.`,
        'Exam language: state the corrected physics first, then explain why the original idea fails.'
      ],
      cer: [
        `Claim — make one precise statement about ${profile.title}.`,
        `Evidence — quote a value, graph feature, observation or relationship from: ${evidence.title}.`,
        `Reasoning — explain why that evidence supports the claim using ${model}.`,
        'Challenge — identify one assumption, limitation or alternative explanation and decide whether it changes the conclusion.'
      ],
      justify: [
        `A student uses this approach: “${pitfall}”`,
        `Justify why this is not sufficient for ${profile.title}.`,
        `Use ${model} and at least one measurable quantity or observable pattern in your answer.`,
        'Finish with a judgement that follows from the evidence, not from assertion alone.'
      ],
      teacherAnswer: `A strong answer should reject the weak approach, state ${key}, use ${model}, connect it to evidence from ${focus}, and make a justified conclusion with units/signs/assumptions where relevant.`
    };
  }

  function makeSlide(kicker, title, bullets, note = ''){
    return {type:'bullets', kicker, title, bullets, note};
  }

  function enhancedDeckFor(id){
    const base = window.ALEVEL_PHASE3?.deck?.(id);
    const profile = profileFor(id);
    const deep = deepeningFor(profile);
    if(!base || !profile || !deep) return base || null;
    const extra = [
      makeSlide('Deepen understanding','Reasoning chain',deep.reasoning,'Teacher move: insist that students say why each step follows from the previous one.'),
      makeSlide('Deepen understanding','Second representation',deep.representation,'Teacher move: do not accept an equation-only answer; require words plus a diagram/graph/model.'),
      makeSlide('Misconception repair','Find it, test it, fix it',deep.misconception,'Use mini-whiteboards: students first diagnose the error, then rewrite the explanation.'),
      makeSlide('Exam reasoning','Claim → Evidence → Reasoning',deep.cer,'This structure is especially useful for explain, discuss and evaluate questions.'),
      makeSlide('Justify','Defend the physics',deep.justify,deep.teacherAnswer)
    ];
    const slides = [...(base.slides || [])];
    const insertAt = Math.min(6, slides.length);
    slides.splice(insertAt, 0, ...extra);
    return {...base, slides, deepening: deep};
  }

  function ensureShell(){
    if(shell) return shell;
    shell = document.createElement('div');
    shell.className = 'deep-deck-shell';
    shell.hidden = true;
    shell.innerHTML = `
      <div class="deep-deck-backdrop" data-deep-close></div>
      <section class="phase3-deck deep-deck" role="dialog" aria-modal="true" aria-label="Enhanced teacher presentation">
        <aside class="phase3-deck-side">
          <div><span class="phase3-kicker">Enhanced teacher deck</span><h2 data-deep-title></h2><p data-deep-subtitle></p></div>
          <div class="phase3-slide-list" data-deep-list></div>
          <div class="phase3-deck-tools">
            <button type="button" class="primary" data-deep-print>Print / PDF</button>
            <button type="button" data-deep-copy>Copy outline</button>
            <button type="button" data-deep-close>Close</button>
          </div>
        </aside>
        <main class="phase3-main">
          <div class="phase3-top"><strong data-deep-count></strong><span>← / → keys work</span></div>
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

  function slideHtml(slide){
    const bullets = (slide?.bullets || []).map(item => `<li>${esc(item)}</li>`).join('');
    if(slide?.type === 'title') return `<div class="phase3-kicker">${esc(slide.kicker)}</div><h1>${esc(slide.title)}</h1><ul>${bullets}</ul>${slide.note ? `<div class="phase3-note">${esc(slide.note)}</div>` : ''}`;
    if(slide?.type === 'equation') return `<div class="phase3-kicker">${esc(slide.kicker)}</div><h2>${esc(slide.title)}</h2><div class="phase3-equation">${esc(slide.equation)}</div><ul>${bullets}</ul>${slide.note ? `<div class="phase3-note">${esc(slide.note)}</div>` : ''}`;
    return `<div class="phase3-kicker">${esc(slide?.kicker)}</div><h2>${esc(slide?.title)}</h2><ul>${bullets}</ul>${slide?.note ? `<div class="phase3-note deep-teacher-note"><strong>Teacher note</strong><span>${esc(slide.note)}</span></div>` : ''}`;
  }

  function render(){
    if(!deck) return;
    const host = ensureShell();
    const slide = deck.slides[slideIndex] || deck.slides[0];
    host.querySelector('[data-deep-title]').textContent = deck.title || 'Lesson presentation';
    host.querySelector('[data-deep-subtitle]').textContent = deck.subtitle || '';
    host.querySelector('[data-deep-count]').textContent = `Slide ${slideIndex + 1} / ${deck.slides.length}`;
    host.querySelector('.deep-slide').innerHTML = slideHtml(slide);
    host.querySelector('[data-deep-progress]').style.width = `${((slideIndex + 1) / deck.slides.length) * 100}%`;
    host.querySelector('[data-deep-list]').innerHTML = deck.slides.map((item, index) => `<button type="button" data-deep-index="${index}" class="${index === slideIndex ? 'active' : ''}">${index + 1}. ${esc(item.title)}</button>`).join('');
  }

  function open(id){
    const next = enhancedDeckFor(id);
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
    slideIndex = Math.max(0, Math.min(deck.slides.length - 1, slideIndex + delta));
    render();
  }

  function copyOutline(){
    if(!deck) return;
    const text = deck.slides.map((slide, index) => `${index + 1}. ${slide.title}\n${(slide.bullets || []).map(item => `- ${item}`).join('\n')}`).join('\n\n');
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
      <div class="deep-panel-heading"><div><span>Deepen understanding</span><h3>${esc(profile.title)}</h3></div><button type="button" data-open-deep-presentation="${esc(profile.id)}">Open 15-slide presentation</button></div>
      <div class="deep-reasoning-grid">
        ${deep.reasoning.slice(0,4).map((item,index) => `<article><b>${index + 1}</b><p>${esc(item.replace(/^\d+\.\s*/,''))}</p></article>`).join('')}
      </div>
      <div class="deep-reader-columns">
        <article><span>Misconception repair</span><p>${esc(deep.misconception[0])}</p><p>${esc(deep.misconception[2])}</p></article>
        <article><span>Justify</span><p>${esc(deep.justify[1])}</p><p>${esc(deep.justify[2])}</p></article>
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
    if(event.key === 'ArrowLeft') move(-1);
    if(event.key === 'ArrowRight') move(1);
  });

  window.addEventListener('alevel:lesson-selected', event => {
    activeLessonId = event.detail?.id || activeLessonId;
    window.setTimeout(() => renderReaderDeepening(activeLessonId), 0);
  });

  if(activeLessonId) window.setTimeout(() => renderReaderDeepening(activeLessonId), 0);

  window.ALEVEL_DEEPENING = {
    profile: id => deepeningFor(profileFor(id)),
    deck: enhancedDeckFor,
    open,
    get activeLessonId(){ return activeLessonId; }
  };
})();