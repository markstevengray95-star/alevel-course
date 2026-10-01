(()=>{
  'use strict';

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
  const list=value=>Array.isArray(value)?value.filter(Boolean):[];
  const POSITION_KEY='alevel-chemistry-presentation-position-v1';
  let shell=null,deck=null,slideIndex=0,teacherNotes=false,returnFocus=null;

  function content(ref){return window.ALEVEL_CHEMISTRY_CONTENT?.get?.(ref)||null;}
  function savedPositions(){try{return JSON.parse(localStorage.getItem(POSITION_KEY)||'{}')||{};}catch{return {};}}
  function savePosition(){if(!deck)return;try{const saved=savedPositions();saved[deck.id]=slideIndex;localStorage.setItem(POSITION_KEY,JSON.stringify(saved));}catch{}}
  function slide(group,kicker,title,bullets,options={}){return{group,kicker,title,bullets:list(bullets),layout:options.layout||'content',note:options.note||'',solution:list(options.solution),equation:options.equation||''};}

  function buildDeck(context){
    const {config,topic,section}=context||{};
    if(config?.subject!=='Chemistry'||!topic||!section)return null;
    const p=content(section.ref);if(!p)return null;
    const retrieval=[
      `Define ${p.terms[0]} precisely.`,
      `Explain one link between ${p.terms[1]} and ${section.title}.`,
      `Recall this chemical idea: ${p.core[0]}`
    ];
    const objectives=[
      `Explain the core chemistry of ${section.title} using precise AQA terminology.`,
      'Move confidently between particles, equations, structures, mechanisms and observable evidence.',
      `Apply calculation, practical or analytical reasoning linked to ${section.ref}.`
    ];
    const checkpoint=[
      `Explain this statement: ${p.core[1]}`,
      `Use the model to justify: ${p.model[0]}`,
      `Identify and correct this common error: ${p.mis}`
    ];
    return{
      id:`chemistry:${topic.id}:${section.ref}`,
      title:section.title,
      subtitle:`AQA Chemistry 7405 · ${section.ref} · ${section.year||topic.year||''}`,
      slides:[
        slide('Start',section.ref,section.title,[p.q,`Topic: ${topic.title}`],{layout:'title',note:'Open with the lesson question and ask students to commit to an initial chemical explanation.'}),
        slide('Start','Retrieval starter','Activate prior chemistry',retrieval,{note:'Students answer independently before discussion.',solution:[...p.terms.slice(0,2),p.core[0]]}),
        slide('Start','Learning objectives','By the end of the lesson',objectives,{note:'Return to these objectives at the end and identify the representation students found hardest.'}),
        slide('Teach','Big picture','Why this chemistry matters',[topic.description||'',...p.syn],{note:'Connect the lesson to earlier and later Chemistry content rather than teaching it as an isolated section.'}),
        slide('Teach','Core knowledge I','Build the chemistry',p.core.slice(0,2),{note:'Insist on particle-level or structural explanations where the question requires them.',solution:p.core.slice(0,2)}),
        slide('Teach','Core knowledge II','Deepen the explanation',p.core.slice(2),{note:'Move from what happens to why it happens using bonding, energetics, equilibrium or electron movement.',solution:p.core.slice(2)}),
        slide('Teach','Model / representation','Reason through the chemistry',p.model,{layout:'equation',equation:'particles / structure → chemical model → evidence',note:'Students should reproduce the reasoning sequence without prompts.',solution:p.model}),
        slide('Teach','Language precision','Key vocabulary and misconception',[`Key terms: ${p.terms.join(' · ')}`,`Common misconception: ${p.mis}`],{note:'Turn the misconception into a hinge question before moving on.',solution:[p.mis]}),
        slide('Apply','Worked application','How to build an AQA answer',[`Question focus: ${p.q}`,...p.model.map((item,index)=>`${index+1}. ${item}`),'Finish by checking equations, charges, units, conditions and the command word.'],{note:'Model the reasoning process rather than only displaying a final answer.',solution:[...p.model,p.core[0]]}),
        slide('Apply','Student checkpoint','Pause and check',checkpoint,{note:'Use mini-whiteboards, structures, equations or short calculations as appropriate.',solution:[p.core[1],p.model[0],p.mis]}),
        slide('Apply','Practical / evidence','How could chemical evidence be collected?',p.practical,{note:'Focus on apparatus, variables, observations, safety, uncertainty, validity and purification.',solution:p.practical}),
        slide('Apply','Maths / data skill','Use quantitative evidence',p.maths,{note:'Require working, units, significant figures and chemical interpretation of the result.',solution:p.maths}),
        slide('Assess','AQA-style practice','Exam practice',p.exam.map((q,index)=>`${[3,4,6][index]||4} marks: ${q}`),{note:'Plan first, then write linked chemical reasoning rather than disconnected facts.',solution:p.core}),
        slide('Assess','A* synoptic','Connect across Chemistry',[...p.syn,`Use at least two specification areas to answer: ${p.q}`],{note:'Push students to connect ideas such as structure, energetics, kinetics, equilibrium and mechanism.',solution:p.syn}),
        slide('Finish','Exit ticket','Show mastery',[`Answer the lesson question in two precise sentences: ${p.q}`,`Use one of these terms correctly: ${p.terms.join(', ')}.`,`State one practical, calculation or analytical skill from this lesson.`,`State the misconception you will avoid.`],{note:'Use responses to plan the next retrieval starter.',solution:[p.core[0],p.practical[0],p.mis]})
      ]
    };
  }

  function slideHtml(s){
    const bullets=list(s.bullets).map(x=>`<li>${esc(x)}</li>`).join('');
    const kicker=`<div class="phase3-kicker">${esc(s.kicker)}</div>`;
    const note=s.note?`<div class="phase3-note">${esc(s.note)}</div>`:'';
    if(s.layout==='title')return `${kicker}<h1>${esc(s.title)}</h1><ul>${bullets}</ul>${note}`;
    if(s.layout==='equation')return `${kicker}<h2>${esc(s.title)}</h2><div class="phase3-equation">${esc(s.equation)}</div><ul>${bullets}</ul>${note}`;
    return `${kicker}<h2>${esc(s.title)}</h2><ul>${bullets}</ul>${note}`;
  }

  function ensureShell(){
    if(shell)return shell;
    shell=document.createElement('div');shell.className='deep-deck-shell lesson-presentation-shell chemistry-presentation-shell';shell.hidden=true;
    shell.innerHTML=`
      <div class="deep-deck-backdrop" data-chem-close></div>
      <section class="phase3-deck deep-deck" role="dialog" aria-modal="true" aria-label="Chemistry lesson presentation">
        <aside class="phase3-deck-side">
          <div><span class="phase3-kicker">Chemistry lesson presentation</span><h2 data-chem-title></h2><p data-chem-subtitle></p></div>
          <button type="button" data-chem-outline aria-expanded="false">☰ Slide outline</button>
          <div class="phase3-slide-list" data-chem-list aria-label="Slide outline"></div>
          <div class="phase3-deck-tools">
            <button type="button" data-chem-fullscreen>Full screen</button>
            <button type="button" data-chem-restart>Restart</button>
            <button type="button" class="primary" data-chem-print>Print / PDF</button>
            <button type="button" data-chem-copy>Copy slides</button>
            <button type="button" data-chem-close>Lesson notes</button>
          </div>
        </aside>
        <main class="phase3-main">
          <div class="phase3-top"><strong data-chem-count role="status" aria-live="polite"></strong><label class="ls-jump-label">Jump to <select data-chem-jump aria-label="Jump to slide"></select></label><span>← / → change slide · Esc exits presentation</span></div>
          <article class="phase3-slide deep-slide" tabindex="0"></article>
          <div class="ls-support"><button type="button" data-chem-answer aria-expanded="false">Show solution</button><button type="button" data-chem-notes aria-expanded="false">Teacher notes</button><div class="ls-solution" data-chem-solution hidden></div><div class="ls-teacher-note" data-chem-teacher-note hidden></div></div>
          <footer class="phase3-bottom"><div class="phase3-progress"><span data-chem-progress></span></div><nav class="phase3-nav"><button type="button" data-chem-prev>← Previous</button><button type="button" data-chem-next>Next →</button></nav></footer>
        </main>
      </section>`;
    document.body.appendChild(shell);
    shell.addEventListener('click',event=>{
      if(event.target.closest('[data-chem-outline]')){const open=shell.classList.toggle('ls-outline-open');shell.querySelector('[data-chem-outline]')?.setAttribute('aria-expanded',String(open));return;}
      if(event.target.closest('[data-chem-close]')){event.preventDefault();close();return;}
      if(event.target.closest('[data-chem-prev]')){move(-1);return;}
      if(event.target.closest('[data-chem-next]')){move(1);return;}
      if(event.target.closest('[data-chem-restart]')){slideIndex=0;render();return;}
      if(event.target.closest('[data-chem-print]')){window.print();return;}
      if(event.target.closest('[data-chem-copy]')){copySlides();return;}
      if(event.target.closest('[data-chem-fullscreen]')){toggleFullscreen();return;}
      if(event.target.closest('[data-chem-answer]')){toggleSolution();return;}
      if(event.target.closest('[data-chem-notes]')){teacherNotes=!teacherNotes;renderSupport(false);return;}
      const button=event.target.closest('[data-chem-index]');if(button){slideIndex=Number(button.dataset.chemIndex);render();}
    });
    shell.querySelector('[data-chem-jump]')?.addEventListener('change',event=>{slideIndex=Number(event.target.value);render();});
    document.addEventListener('fullscreenchange',updateFullscreenButton);
    return shell;
  }

  function renderSupport(reset=true){
    if(!shell||!deck)return;
    const s=deck.slides[slideIndex];const solution=shell.querySelector('[data-chem-solution]');if(reset)solution.hidden=true;
    solution.innerHTML=`<strong>Solution / key reasoning</strong><ol>${list(s.solution).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`;
    const answer=shell.querySelector('[data-chem-answer]');answer.hidden=!s.solution?.length;answer.textContent=solution.hidden?'Show solution':'Hide solution';answer.setAttribute('aria-expanded',String(!solution.hidden));
    const note=shell.querySelector('[data-chem-teacher-note]');note.textContent=s.note||'Ask for precise AQA Chemistry reasoning.';note.hidden=!teacherNotes;
    shell.querySelector('[data-chem-notes]')?.setAttribute('aria-expanded',String(teacherNotes));
  }

  function render(){
    if(!deck)return;
    const host=ensureShell();const s=deck.slides[slideIndex];
    host.querySelector('[data-chem-title]').textContent=deck.title;host.querySelector('[data-chem-subtitle]').textContent=`${deck.subtitle} · ${deck.slides.length} slides`;host.querySelector('[data-chem-count]').textContent=`Slide ${slideIndex+1} / ${deck.slides.length}`;
    const node=host.querySelector('.deep-slide');node.dataset.layout=s.layout||'content';node.innerHTML=slideHtml(s);node.scrollTop=0;
    host.querySelector('[data-chem-progress]').style.width=`${((slideIndex+1)/deck.slides.length)*100}%`;
    host.querySelector('[data-chem-list]').innerHTML=deck.slides.map((item,index)=>{const group=index===0||item.group!==deck.slides[index-1].group?`<strong class="ls-outline-section">${esc(item.group)}</strong>`:'';return `${group}<button type="button" data-chem-index="${index}" class="${index===slideIndex?'active':''}" aria-current="${index===slideIndex?'step':'false'}"><small>${esc(item.kicker)}</small><span>${index+1}. ${esc(item.title)}</span></button>`;}).join('');
    const jump=host.querySelector('[data-chem-jump]');jump.innerHTML=deck.slides.map((item,index)=>`<option value="${index}">${index+1}. ${esc(item.kicker)}</option>`).join('');jump.value=String(slideIndex);
    host.querySelector('[data-chem-prev]').disabled=slideIndex===0;host.querySelector('[data-chem-next]').disabled=slideIndex===deck.slides.length-1;
    renderSupport(true);savePosition();node.focus({preventScroll:true});
  }

  function open(context,{restart=false}={}){
    const next=buildDeck(context);if(!next)return false;deck=next;returnFocus=document.activeElement;
    const saved=Number(savedPositions()[deck.id]);slideIndex=restart||!Number.isFinite(saved)?0:Math.min(Math.max(0,saved),deck.slides.length-1);
    teacherNotes=false;ensureShell().hidden=false;document.body.classList.add('lesson-reader-open','deep-deck-open','lesson-presentation-primary');document.documentElement.classList.add('lesson-presentation-active');render();window.scrollTo?.(0,0);return true;
  }
  function close(){if(shell)shell.hidden=true;document.body.classList.remove('lesson-reader-open','deep-deck-open','lesson-presentation-primary');document.documentElement.classList.remove('lesson-presentation-active');if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});returnFocus?.focus?.({preventScroll:true});}
  function move(delta){if(!deck)return;const next=Math.max(0,Math.min(deck.slides.length-1,slideIndex+delta));if(next!==slideIndex){slideIndex=next;render();}}
  function toggleSolution(){const panel=shell?.querySelector('[data-chem-solution]');if(!panel)return;panel.hidden=!panel.hidden;const button=shell.querySelector('[data-chem-answer]');button.textContent=panel.hidden?'Show solution':'Hide solution';button.setAttribute('aria-expanded',String(!panel.hidden));}
  function copySlides(){if(!deck)return;const text=deck.slides.map((s,i)=>`${i+1}. ${s.title}\n${list(s.bullets).map(x=>`- ${x}`).join('\n')}`).join('\n\n');navigator.clipboard?.writeText(text);}
  function updateFullscreenButton(){const button=shell?.querySelector('[data-chem-fullscreen]');if(!button)return;const active=!!document.fullscreenElement;button.textContent=active?'Exit full screen':'Full screen';button.setAttribute('aria-pressed',String(active));}
  async function toggleFullscreen(){try{if(document.fullscreenElement){await document.exitFullscreen?.();return;}await (shell?.querySelector('.deep-deck')||shell)?.requestFullscreen?.();}catch{}}

  function renderPage(context){
    const host=document.getElementById('chemistryLessonContent');if(!host)return;
    const {config,section}=context||{};if(config?.subject!=='Chemistry'){host.hidden=true;return;}
    const p=content(section?.ref);if(!p){host.hidden=true;return;}host.hidden=false;
    host.innerHTML=`
      <div class="bio-lesson-head"><div><span class="eyebrow">Detailed Chemistry lesson</span><h2>${esc(p.q)}</h2><p>Specification ${esc(section.ref)} · lesson notes, calculations, practical evidence and exam reasoning.</p></div><button type="button" class="bio-present-inline" data-chem-present-inline>Present 15-slide lesson</button></div>
      <div class="bio-knowledge-grid">${p.core.map((item,index)=>`<article><span>${index+1}</span><p>${esc(item)}</p></article>`).join('')}</div>
      <div class="bio-two-col">
        <article class="bio-card"><span>Model / reasoning sequence</span><ol>${p.model.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></article>
        <article class="bio-card"><span>Key vocabulary</span><div class="bio-term-list">${p.terms.map(x=>`<b>${esc(x)}</b>`).join('')}</div><p class="bio-mis"><strong>Misconception:</strong> ${esc(p.mis)}</p></article>
      </div>
      <div class="bio-two-col">
        <article class="bio-card"><span>Practical &amp; evidence</span><ul>${p.practical.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>
        <article class="bio-card"><span>Maths / data skill</span><ul>${p.maths.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>
      </div>
      <div class="bio-two-col">
        <article class="bio-card bio-exam"><span>AQA-style practice</span>${p.exam.map((x,index)=>`<div><b>${[3,4,6][index]} marks</b><p>${esc(x)}</p></div>`).join('')}</article>
        <article class="bio-card"><span>A* synoptic links</span><ul>${p.syn.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>
      </div>`;
    host.querySelector('[data-chem-present-inline]')?.addEventListener('click',()=>open(context,{restart:true}));
  }

  document.addEventListener('keydown',event=>{
    if(!shell||shell.hidden||event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
    if(event.key==='Escape'){if(document.fullscreenElement)return;event.preventDefault();close();}
    if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();move(-1);}
    if(event.key==='ArrowRight'||event.key==='PageDown'||event.key===' '){if(event.key===' '&&event.target?.closest?.('button'))return;event.preventDefault();move(1);}
  });

  window.ALEVEL_CHEMISTRY_LESSONS=Object.freeze({
    buildDeck,open,close,renderPage,
    has:ref=>!!content(ref),
    count:()=>window.ALEVEL_CHEMISTRY_CONTENT?.count||0
  });
})();