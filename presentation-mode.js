(() => {
  const css = `
    .presentation-button, .mobile-presentation-button { background: linear-gradient(135deg,#7c3aed,#2563eb)!important; color:#fff!important; border:0!important; box-shadow:0 10px 24px rgba(37,99,235,.26); }
    .presentation-button:hover, .mobile-presentation-button:hover { transform: translateY(-1px); }
    .module-tabs { display:flex; flex-wrap:wrap; gap:.65rem; align-items:center; padding:.75rem; border-radius:20px; background:rgba(15,23,42,.72); border:1px solid rgba(148,163,184,.18); box-shadow:0 18px 40px rgba(2,6,23,.18); }
    .module-tabs::before { content:'Module tabs'; color:#93c5fd; font-size:.78rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; margin-right:.15rem; }
    .module-tabs button { border-radius:999px!important; padding:.72rem 1rem!important; min-height:44px; font-weight:800; }
    .module-tabs button.active { background:linear-gradient(135deg,#38bdf8,#2563eb)!important; color:#fff!important; }
    .lesson-presenter-backdrop { position:fixed; inset:0; z-index:9998; background:rgba(2,6,23,.76); backdrop-filter:blur(14px); }
    .lesson-presenter { position:fixed; inset:2.5vh 2vw; z-index:9999; display:grid; grid-template-columns:minmax(230px,310px) 1fr; gap:1rem; padding:1rem; background:linear-gradient(135deg,#07111f,#111827 58%,#172554); color:#e5f0ff; border:1px solid rgba(147,197,253,.28); border-radius:28px; box-shadow:0 40px 100px rgba(0,0,0,.55); }
    .presenter-sidebar { display:flex; flex-direction:column; gap:.85rem; padding:.85rem; border-radius:22px; background:rgba(15,23,42,.62); border:1px solid rgba(148,163,184,.18); overflow:auto; }
    .presenter-sidebar h2 { margin:.1rem 0 0; font-size:1.15rem; line-height:1.15; }
    .presenter-sidebar p { margin:0; color:#b6c7e6; font-size:.9rem; line-height:1.4; }
    .presenter-deck-list { display:flex; flex-direction:column; gap:.45rem; }
    .presenter-deck-list button { text-align:left; border:1px solid rgba(148,163,184,.18); color:#e5f0ff; background:rgba(30,41,59,.8); padding:.7rem .78rem; border-radius:14px; cursor:pointer; font-weight:750; }
    .presenter-deck-list button.active { background:linear-gradient(135deg,#2563eb,#7c3aed); border-color:rgba(255,255,255,.32); }
    .presenter-main { display:grid; grid-template-rows:auto 1fr auto; gap:.85rem; min-width:0; }
    .presenter-top { display:flex; align-items:center; justify-content:space-between; gap:.75rem; }
    .presenter-top strong { font-size:.92rem; color:#bfdbfe; }
    .presenter-actions { display:flex; flex-wrap:wrap; gap:.45rem; justify-content:flex-end; }
    .presenter-actions button { border:1px solid rgba(191,219,254,.22); background:rgba(15,23,42,.74); color:#e0ecff; border-radius:999px; padding:.55rem .82rem; cursor:pointer; font-weight:800; }
    .presenter-actions button.primary { background:#fff; color:#0f172a; border-color:#fff; }
    .presenter-slide { overflow:auto; border-radius:28px; padding:clamp(1.25rem,3vw,3rem); background:radial-gradient(circle at 12% 18%,rgba(59,130,246,.28),transparent 30%),linear-gradient(135deg,#f8fbff,#dbeafe); color:#0f172a; box-shadow:inset 0 0 0 1px rgba(15,23,42,.08); }
    .presenter-slide .slide-kicker { color:#2563eb; font-weight:900; letter-spacing:.08em; text-transform:uppercase; font-size:.82rem; }
    .presenter-slide h1 { margin:.45rem 0 1rem; font-size:clamp(2rem,5vw,4.5rem); line-height:.95; }
    .presenter-slide h2 { margin:.2rem 0 1rem; font-size:clamp(1.65rem,3vw,3rem); line-height:1; }
    .presenter-slide ul { display:grid; gap:.75rem; margin:1.1rem 0 0; padding-left:1.3rem; font-size:clamp(1.05rem,1.65vw,1.55rem); line-height:1.35; }
    .presenter-slide li::marker { color:#2563eb; }
    .presenter-slide .big-equation { display:inline-block; margin:1rem 0; padding:1rem 1.25rem; border-radius:18px; background:#0f172a; color:#dbeafe; font-size:clamp(1.3rem,2.3vw,2rem); font-weight:900; }
    .presenter-slide .teacher-note { margin-top:1.25rem; padding:1rem; border-left:5px solid #2563eb; background:rgba(37,99,235,.1); border-radius:12px; color:#1e3a8a; font-weight:700; }
    .presenter-bottom { display:flex; align-items:center; gap:.75rem; justify-content:space-between; }
    .presenter-progress { flex:1; height:10px; background:rgba(255,255,255,.14); border-radius:999px; overflow:hidden; }
    .presenter-progress span { display:block; height:100%; width:0; background:linear-gradient(90deg,#38bdf8,#a78bfa); }
    .presenter-nav { display:flex; gap:.5rem; }
    .presenter-nav button { min-width:48px; min-height:44px; border-radius:14px; border:0; background:#fff; color:#0f172a; font-weight:950; cursor:pointer; }
    .presenter-empty { padding:1rem; border-radius:16px; background:rgba(251,191,36,.14); color:#fde68a; border:1px solid rgba(251,191,36,.28); }
    @media (max-width: 820px){ .lesson-presenter{ inset:0; border-radius:0; grid-template-columns:1fr; grid-template-rows:auto 1fr; } .presenter-sidebar{ max-height:34vh; } .presenter-slide{ border-radius:20px; } }
    @media print { body>*:not(.lesson-presenter){ display:none!important; } .lesson-presenter-backdrop,.presenter-sidebar,.presenter-top,.presenter-bottom{ display:none!important; } .lesson-presenter{ position:static; display:block; inset:auto; padding:0; background:#fff; color:#000; box-shadow:none; border:0; } .presenter-slide{ min-height:95vh; box-shadow:none; border-radius:0; page-break-after:always; } }
  `;
  const style = document.createElement('style');
  style.id = 'lesson-presentation-style';
  style.textContent = css;
  document.head.appendChild(style);

  const clean = value => (value || '').replace(/\s+/g, ' ').trim();
  const sentenceChunks = text => clean(text).split(/(?<=[.!?])\s+/).map(clean).filter(Boolean);
  const take = (arr, n) => arr.filter(Boolean).slice(0, n);

  function activeState(){
    return window.CourseApp?.getState?.() || { code:'AQA', title:'Current lesson', moduleLabel:'Lesson', description:'' };
  }

  function frameDoc(){
    const frame = document.getElementById('topicFrame');
    try { return frame?.contentDocument || null; } catch { return null; }
  }

  function findLessonNodes(doc){
    if(!doc) return [];
    const selectors = [
      '[data-lesson]', '[data-lesson-id]', '.lesson', '.lesson-card', '.lesson-section', '.lesson-panel',
      'section[id*="lesson" i]', 'article[id*="lesson" i]', 'section[class*="lesson" i]', 'article[class*="lesson" i]'
    ];
    const found = [...doc.querySelectorAll(selectors.join(','))]
      .filter(el => clean(el.innerText).length > 160);
    if(found.length) return found.slice(0, 30);

    const headings = [...doc.querySelectorAll('h2,h3')].filter(h => /lesson|starter|objective|retrieval|chapter|topic|section/i.test(h.textContent || ''));
    const groups = headings.map((h, i) => {
      const wrapper = doc.createElement('div');
      wrapper.appendChild(h.cloneNode(true));
      let node = h.nextElementSibling;
      let count = 0;
      while(node && !/^H[23]$/.test(node.tagName) && count < 10){
        wrapper.appendChild(node.cloneNode(true));
        node = node.nextElementSibling;
        count++;
      }
      return wrapper;
    }).filter(el => clean(el.innerText).length > 120);
    if(groups.length) return groups.slice(0, 30);

    const main = doc.querySelector('main') || doc.body;
    return main ? [main] : [];
  }

  function collectEquations(text){
    const matches = text.match(/(?:[A-Za-z][A-Za-z0-9θΔ]*\s*=\s*[^.,;\n]{2,40}|\b(?:F=ma|V=IR|E=hf|p=mv|s=ut|v²=u²\+2as|Q=It|P=IV|ρ=m\/V|E=mc²)\b)/g);
    return [...new Set(matches || [])].slice(0, 4);
  }

  function deckFromNode(node, index){
    const state = activeState();
    const title = clean(node.querySelector('h1,h2,h3')?.textContent) || `${state.moduleLabel || state.title} lesson ${index + 1}`;
    const text = clean(node.innerText || state.description || state.title);
    const sentences = sentenceChunks(text).filter(s => s.length > 24 && !/^lesson\s*\d+$/i.test(s));
    const bulletSource = take(sentences, 16);
    const equations = collectEquations(text);
    const objectives = bulletSource.slice(0, 3);
    const core = bulletSource.slice(3, 7).length ? bulletSource.slice(3, 7) : bulletSource.slice(0, 4);
    const application = bulletSource.slice(7, 11).length ? bulletSource.slice(7, 11) : core;
    const checks = [
      `Explain the main idea of ${title} in two clear sentences.`,
      `State one equation, definition or rule used in this lesson and identify each variable.`,
      `Describe one common mistake a student might make and how to avoid it.`
    ];
    const exam = [
      `AQA-style calculation: choose suitable data from the lesson and show each step clearly.`,
      `Extended response: explain how the physics in ${title} links to evidence, practical work or real equipment.`,
      `Finish with a concise final answer using correct units and significant figures where needed.`
    ];
    return {
      id: `deck-${index}`,
      title,
      subtitle: `${state.code || 'AQA'} · ${state.title || 'A-level Physics'} · ${state.moduleLabel || 'Lesson'}`,
      slides: [
        {type:'title', kicker:state.code || 'AQA A-level Physics', title, bullets:[state.description || 'Teacher-ready lesson presentation', 'Use arrows to teach through the deck.']},
        {type:'bullets', title:'Learning goals', bullets:objectives.length ? objectives : ['Recall the key definitions.', 'Apply the main equation or model.', 'Answer an AQA-style question using precise physics.']},
        {type:'bullets', title:'Starter / retrieval', bullets:[`Before teaching: what do students already know that links to ${title}?`, 'Ask for one definition, one equation and one unit from the previous lesson.', 'Cold-call for reasoning, not just a final answer.']},
        {type:'bullets', title:'Core teaching points', bullets:core},
        {type:'equation', title:'Equation / model focus', equation:equations[0] || 'Identify → Substitute → Calculate → Unit → Check', bullets:equations.length ? equations.map(e => `Use ${e} carefully: define symbols, units and assumptions.`) : ['Write the relationship clearly.', 'Define each symbol and unit.', 'Explain when the model is valid.']},
        {type:'bullets', title:'Worked example flow', bullets:application},
        {type:'bullets', title:'Check for understanding', bullets:checks},
        {type:'bullets', title:'Exam practice / plenary', bullets:exam}
      ]
    };
  }

  function buildDecks(){
    const doc = frameDoc();
    const nodes = findLessonNodes(doc);
    const state = activeState();
    if(!nodes.length){
      return [{ title: state.title || 'Current lesson', subtitle: state.code || 'AQA Physics', slides:[{type:'title', kicker:state.code || 'AQA', title:state.title || 'Current lesson', bullets:[state.description || 'Open a topic first.']}]}];
    }
    const decks = nodes.map(deckFromNode);
    return decks.length ? decks : [deckFromNode(doc.body, 0)];
  }

  let presenter = null;
  let decks = [];
  let deckIndex = 0;
  let slideIndex = 0;

  function slideHtml(slide, deck){
    const bullets = (slide.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
    const title = escapeHtml(slide.title || deck.title);
    const kicker = escapeHtml(slide.kicker || deck.subtitle || 'Lesson presentation');
    if(slide.type === 'title'){
      return `<div class="slide-kicker">${kicker}</div><h1>${escapeHtml(slide.title || deck.title)}</h1><ul>${bullets}</ul><div class="teacher-note">Teacher cue: pause after each slide for students to explain the reasoning aloud.</div>`;
    }
    if(slide.type === 'equation'){
      return `<div class="slide-kicker">${escapeHtml(deck.subtitle || '')}</div><h2>${title}</h2><div class="big-equation">${escapeHtml(slide.equation || '')}</div><ul>${bullets}</ul>`;
    }
    return `<div class="slide-kicker">${escapeHtml(deck.subtitle || '')}</div><h2>${title}</h2><ul>${bullets}</ul>`;
  }

  function escapeHtml(value){
    return String(value || '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  }

  function renderPresenter(){
    if(!presenter) return;
    const deck = decks[deckIndex] || decks[0];
    const slide = deck?.slides?.[slideIndex] || deck?.slides?.[0];
    const list = presenter.querySelector('.presenter-deck-list');
    list.innerHTML = decks.map((d,i)=>`<button type="button" class="${i===deckIndex?'active':''}" data-deck="${i}">${i+1}. ${escapeHtml(d.title)}</button>`).join('');
    list.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { deckIndex = Number(button.dataset.deck); slideIndex = 0; renderPresenter(); }));
    presenter.querySelector('.presenter-slide').innerHTML = slide ? slideHtml(slide, deck) : '<div class="presenter-empty">No lesson content was found yet. Open a topic lesson first, then try again.</div>';
    presenter.querySelector('[data-presenter-title]').textContent = deck?.title || 'Lesson presentation';
    presenter.querySelector('[data-presenter-count]').textContent = `${slideIndex + 1} / ${deck?.slides?.length || 1}`;
    presenter.querySelector('.presenter-progress span').style.width = `${((slideIndex + 1) / (deck?.slides?.length || 1)) * 100}%`;
    presenter.querySelector('[data-prev-slide]').disabled = slideIndex <= 0;
    presenter.querySelector('[data-next-slide]').disabled = slideIndex >= (deck?.slides?.length || 1) - 1;
  }

  function openPresenter(){
    decks = buildDecks();
    deckIndex = 0;
    slideIndex = 0;
    const backdrop = document.createElement('div');
    backdrop.className = 'lesson-presenter-backdrop';
    backdrop.addEventListener('click', closePresenter);
    presenter = document.createElement('section');
    presenter.className = 'lesson-presenter';
    presenter.setAttribute('role','dialog');
    presenter.setAttribute('aria-modal','true');
    presenter.innerHTML = `
      <aside class="presenter-sidebar">
        <div><span class="slide-kicker">Lesson decks</span><h2>One presentation per lesson</h2><p>Generated from the open topic page, so each lesson has its own teacher-ready slide sequence.</p></div>
        <div class="presenter-deck-list"></div>
      </aside>
      <div class="presenter-main">
        <div class="presenter-top"><strong data-presenter-title></strong><div class="presenter-actions"><button type="button" data-copy-outline>Copy outline</button><button type="button" data-print>Print / save PDF</button><button type="button" class="primary" data-close>Close</button></div></div>
        <article class="presenter-slide" tabindex="0"></article>
        <footer class="presenter-bottom"><span data-presenter-count></span><div class="presenter-progress"><span></span></div><div class="presenter-nav"><button type="button" data-prev-slide>←</button><button type="button" data-next-slide>→</button></div></footer>
      </div>`;
    document.body.append(backdrop, presenter);
    presenter.querySelector('[data-close]').addEventListener('click', closePresenter);
    presenter.querySelector('[data-print]').addEventListener('click', () => window.print());
    presenter.querySelector('[data-copy-outline]').addEventListener('click', copyOutline);
    presenter.querySelector('[data-prev-slide]').addEventListener('click', previousSlide);
    presenter.querySelector('[data-next-slide]').addEventListener('click', nextSlide);
    document.addEventListener('keydown', presenterKeys);
    renderPresenter();
    presenter.querySelector('.presenter-slide')?.focus({preventScroll:true});
  }

  function closePresenter(){
    document.querySelector('.lesson-presenter-backdrop')?.remove();
    presenter?.remove();
    presenter = null;
    document.removeEventListener('keydown', presenterKeys);
  }

  function previousSlide(){ if(slideIndex > 0){ slideIndex--; renderPresenter(); } }
  function nextSlide(){ const deck = decks[deckIndex]; if(slideIndex < (deck?.slides?.length || 1) - 1){ slideIndex++; renderPresenter(); } }
  function presenterKeys(event){
    if(!presenter) return;
    if(event.key === 'Escape') closePresenter();
    if(event.key === 'ArrowLeft') previousSlide();
    if(event.key === 'ArrowRight' || event.key === ' ') { event.preventDefault(); nextSlide(); }
  }

  async function copyOutline(){
    const deck = decks[deckIndex];
    const text = (deck?.slides || []).map((s,i)=>`${i+1}. ${s.title || deck.title}\n${(s.bullets || []).map(b => `- ${b}`).join('\n')}`).join('\n\n');
    try { await navigator.clipboard.writeText(`# ${deck.title}\n\n${text}`); } catch {}
  }

  function addButtons(){
    if(document.getElementById('openPresentationMode')) return;
    const jumpbar = document.querySelector('.course-jump-inner');
    const ai = document.getElementById('coachToggle');
    const button = document.createElement('button');
    button.id = 'openPresentationMode';
    button.type = 'button';
    button.className = 'button presentation-button';
    button.innerHTML = '<span>▣</span> Present';
    button.title = 'Open teacher presentation for the current lesson';
    button.addEventListener('click', openPresenter);
    if(jumpbar && ai) jumpbar.insertBefore(button, ai);

    const mobileDock = document.getElementById('mobileStudyDock');
    const mobileButton = document.createElement('button');
    mobileButton.id = 'mobileDockPresent';
    mobileButton.type = 'button';
    mobileButton.className = 'mobile-dock-button mobile-presentation-button';
    mobileButton.setAttribute('aria-label','Open lesson presentation');
    mobileButton.innerHTML = '<span>▣</span><b>Slides</b>';
    mobileButton.addEventListener('click', openPresenter);
    mobileDock?.insertBefore(mobileButton, document.getElementById('mobileDockNotebook'));
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButtons);
  else addButtons();
})();
