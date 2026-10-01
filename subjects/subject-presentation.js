(()=>{
  'use strict';

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
  const list=value=>Array.isArray(value)?value.filter(Boolean):[];
  const POSITION_KEY='alevel-subject-presentation-position-v1';
  let shell=null;
  let deck=null;
  let slideIndex=0;
  let teacherNotes=false;
  let returnFocus=null;

  function positions(){try{return JSON.parse(localStorage.getItem(POSITION_KEY)||'{}')||{};}catch{return {};}}
  function savePosition(){
    if(!deck)return;
    try{const saved=positions();saved[deck.id]=slideIndex;localStorage.setItem(POSITION_KEY,JSON.stringify(saved));}catch{}
  }

  function subjectPrompts(subject,title){
    if(subject==='Biology')return{
      retrieval:[
        `Define one key biological term that is likely to be needed for ${title}.`,
        'Recall one linked structure, molecule or process from the previous specification section.',
        'Predict one structure–function relationship that could be examined.'
      ],
      model:[
        `Describe the key structure or process involved in ${title}.`,
        'Explain the sequence using precise biological vocabulary.',
        'Link each structural feature or stage to its biological function.',
        'Finish with the measurable outcome or biological consequence.'
      ],
      practical:[
        `Identify a variable or measurement that could be used to investigate ${title}.`,
        'State an independent variable, dependent variable and important control variable where appropriate.',
        'Choose a suitable graph, statistical treatment or data-comparison method.',
        'Evaluate one limitation and one realistic improvement.'
      ],
      extension:`Connect ${title} to a second biological topic and explain the link as a causal chain rather than as two separate facts.`
    };
    return{
      retrieval:[
        `State one definition, equation or particle-level idea likely to be needed for ${title}.`,
        'Recall one linked reaction, bonding idea or quantitative relationship from an earlier section.',
        'Predict one common sign, unit, condition or mechanism error that an examiner could test.'
      ],
      model:[
        `Represent ${title} at the particle, equation or mechanism level.`,
        'State the conditions or assumptions before using the model.',
        'Link symbolic chemistry to the observable or measurable evidence.',
        'Check charges, state symbols, units and significant figures where relevant.'
      ],
      practical:[
        `Identify an experimental measurement that could provide evidence for ${title}.`,
        'State the key apparatus, quantities or observations that would be required.',
        'Explain how uncertainty, calibration or control variables affect the conclusion.',
        'Evaluate one safety, validity or reliability improvement.'
      ],
      extension:`Connect ${title} to another area of Physical, Inorganic or Organic Chemistry and explain why the same chemical principle applies.`
    };
  }

  function makeSlide(section,kicker,title,bullets,{layout='content',note='',solution=[],equation=''}={}){
    return{section,kicker,title,bullets:list(bullets).map(clean).filter(Boolean),layout,note:clean(note),solution:list(solution).map(clean).filter(Boolean),equation:clean(equation)};
  }

  function buildDeck(context){
    const {config,topic,section}=context||{};
    if(!config||!topic||!section)return null;
    const subject=config.subject;
    const focus=list(section.focus);
    const prompts=subjectPrompts(subject,section.title);
    const summary=clean(section.summary||`${section.title} within ${topic.title}.`);
    const id=`${config.id}:${topic.id}:${section.ref}`;
    const objectives=focus.length?focus:[
      `Explain the core knowledge required by ${section.ref}.`,
      `Apply ${section.title.toLowerCase()} to unfamiliar data or exam contexts.`,
      `Connect this section to the wider A-Level ${subject} course.`
    ];
    const examStem=subject==='Biology'
      ? `A student investigates a biological process linked to ${section.title.toLowerCase()}. Explain the expected result and justify it using biological principles.`
      : `A student investigates a chemical system linked to ${section.title.toLowerCase()}. Explain the expected result and justify it using chemical principles.`;
    return{
      id,
      title:section.title,
      subtitle:`${config.board} ${config.subject} ${config.specCode} · ${section.ref} · ${section.year||topic.year||''}`,
      slides:[
        makeSlide('Start',section.ref,section.title,[summary,`Topic: ${topic.title}`],{layout:'title',note:'Start with the lesson question. Ask students what they already know before revealing the objectives.'}),
        makeSlide('Start','Retrieval starter',`Before ${section.title}`,prompts.retrieval,{note:'Give students quiet thinking time first. Reveal answers only after they have committed to a response.',solution:['Use precise specification vocabulary.','Accept linked prior knowledge when the connection is scientifically justified.','Use the final prompt to surface a misconception that can be revisited later.']}),
        makeSlide('Start','Learning objectives','By the end of this lesson',objectives,{note:'Keep the objectives visible long enough for students to identify the key command words.'}),
        makeSlide('Teach','Big picture',`Where ${section.title} fits`,[summary,`This lesson sits within ${topic.code}: ${topic.title}.`,`Specification reference: ${section.ref}.`,`The aim is to move from recall to explanation, application and evaluation.`],{note:'Use this slide to connect the lesson to prior and future learning.'}),
        makeSlide('Teach','Core knowledge','Build the idea',objectives,{note:'Phase 5/6 will replace this scaffold with full subject-specific teaching chunks while keeping the same presentation shell.'}),
        makeSlide('Teach',subject==='Biology'?'Process / structure model':'Model / representation',subject==='Biology'?'Explain the biology':'Represent the chemistry',prompts.model,{layout:'equation',equation:subject==='Biology'?'structure → process → outcome':'particles → representation → evidence',note:'Move deliberately between words, diagrams/models and measurable evidence.'}),
        makeSlide('Apply','Guided reasoning','Worked-example method',[`1. Identify exactly what the question is asking about ${section.title}.`,`2. Select the relevant principle from ${section.ref}.`,`3. Use a diagram, model, equation, data pattern or process sequence.`,`4. Link every step to evidence or a scientific reason.`,`5. Check terminology, units and the final conclusion.`],{note:'Model the reasoning process rather than just revealing a final answer.',solution:[`Name the relevant ${subject.toLowerCase()} principle first.`,`Use evidence from the question rather than repeating memorised notes.`,`Make each because/therefore link explicit.`,`End by answering the exact command word.']}),
        makeSlide('Apply','Student checkpoint','Pause and check',[`Explain ${section.title} in no more than three sentences.`,`Draw or describe one representation that would help explain it.`,`State one piece of evidence, observation or data pattern that would support the explanation.`],{solution:['A strong answer is concise, uses specification terminology and links evidence to the scientific model.','The representation should add information rather than simply decorate the answer.','Evidence must be linked explicitly to the conclusion.']}),
        makeSlide('Apply','Practical / data thinking','How could this be investigated?',prompts.practical,{note:'Where the specification section is not directly practical, frame this as data handling or evaluation.',solution:['Identify what would actually be measured.','Control variables should remove plausible alternative explanations.','Choose analysis that matches the type of data.','Improvements should be specific and practical.']}),
        makeSlide('Assess','AQA-style practice','Exam practice',[`3 marks: Explain one key principle involved in ${section.title}.`,`4 marks: Apply ${section.title} to an unfamiliar context or data set.`,`6 marks: ${examStem}`],{note:'Students should plan before writing. Insist on linked reasoning rather than isolated statements.',solution:[`Use the command word to decide the structure of the answer.`,`Include accurate subject vocabulary from ${section.ref}.`,`For longer answers, connect evidence → principle → conclusion.`,`Evaluate with a specific limitation and consequence where relevant.']}),
        makeSlide('Assess','A* extension','Make the synoptic connection',[prompts.extension,`Identify one assumption behind the model used in ${section.title}.`,`Explain what evidence would make you revise the conclusion.`],{note:'Push beyond recall: students should compare models, justify assumptions and connect topics.'}),
        makeSlide('Finish','Exit ticket','Show mastery',[`One-sentence definition or explanation of ${section.title}.`,`One representation, equation, process or data pattern you would use in an exam.`,`One common mistake you will avoid.`,`One question you still need answered.`],{note:'Use responses to decide the retrieval starter for the next lesson.'})
      ]
    };
  }

  function slideHtml(slide){
    const bullets=list(slide.bullets).map(item=>`<li>${esc(item)}</li>`).join('');
    const kicker=`<div class="phase3-kicker">${esc(slide.kicker)}</div>`;
    const note=slide.note?`<div class="phase3-note">${esc(slide.note)}</div>`:'';
    if(slide.layout==='title')return `${kicker}<h1>${esc(slide.title)}</h1><ul>${bullets}</ul>${note}`;
    if(slide.layout==='equation')return `${kicker}<h2>${esc(slide.title)}</h2><div class="phase3-equation">${esc(slide.equation)}</div><ul>${bullets}</ul>${note}`;
    return `${kicker}<h2>${esc(slide.title)}</h2><ul>${bullets}</ul>${note}`;
  }

  function ensureShell(){
    if(shell)return shell;
    shell=document.createElement('div');
    shell.className='deep-deck-shell lesson-presentation-shell subject-presentation-shell';
    shell.hidden=true;
    shell.innerHTML=`
      <div class="deep-deck-backdrop" data-subject-close></div>
      <section class="phase3-deck deep-deck" role="dialog" aria-modal="true" aria-label="Lesson presentation" aria-describedby="subject-presentation-shortcuts">
        <aside class="phase3-deck-side">
          <div><span class="phase3-kicker">Lesson presentation</span><h2 data-subject-title></h2><p data-subject-subtitle></p></div>
          <button type="button" data-outline-toggle aria-expanded="false">☰ Slide outline</button>
          <div class="phase3-slide-list" data-subject-list aria-label="Slide outline"></div>
          <div class="phase3-deck-tools">
            <button type="button" data-subject-fullscreen>Full screen</button>
            <button type="button" data-subject-restart>Restart</button>
            <button type="button" class="primary" data-subject-print>Print / PDF</button>
            <button type="button" data-subject-copy>Copy slides</button>
            <button type="button" data-subject-close>Lesson notes</button>
          </div>
        </aside>
        <main class="phase3-main">
          <div class="phase3-top"><strong data-subject-count role="status" aria-live="polite"></strong><label class="ls-jump-label">Jump to <select data-subject-jump aria-label="Jump to slide"></select></label><span id="subject-presentation-shortcuts">← / → change slide · Esc exits presentation</span></div>
          <article class="phase3-slide deep-slide" tabindex="0"></article>
          <div class="ls-support"><button type="button" data-subject-answer aria-expanded="false">Show solution</button><button type="button" data-subject-notes aria-expanded="false">Teacher notes</button><div class="ls-solution" data-subject-solution hidden></div><div class="ls-teacher-note" data-subject-teacher-note hidden></div></div>
          <footer class="phase3-bottom"><div class="phase3-progress"><span data-subject-progress></span></div><nav class="phase3-nav"><button type="button" data-subject-prev><span aria-hidden="true">←</span><span>Previous</span></button><button type="button" data-subject-next><span>Next</span><span aria-hidden="true">→</span></button></nav></footer>
        </main>
      </section>`;
    document.body.appendChild(shell);
    shell.addEventListener('click',event=>{
      if(event.target.closest('[data-outline-toggle]')){
        const expanded=shell.classList.toggle('ls-outline-open');
        shell.querySelector('[data-outline-toggle]')?.setAttribute('aria-expanded',String(expanded));
        return;
      }
      if(event.target.closest('[data-subject-close]')){event.preventDefault();close();return;}
      if(event.target.closest('[data-subject-prev]')){move(-1);return;}
      if(event.target.closest('[data-subject-next]')){move(1);return;}
      if(event.target.closest('[data-subject-restart]')){slideIndex=0;render();return;}
      if(event.target.closest('[data-subject-print]')){window.print();return;}
      if(event.target.closest('[data-subject-copy]')){copySlides();return;}
      if(event.target.closest('[data-subject-fullscreen]')){toggleFullscreen();return;}
      if(event.target.closest('[data-subject-answer]')){toggleSolution();return;}
      if(event.target.closest('[data-subject-notes]')){teacherNotes=!teacherNotes;renderSupport(false);return;}
      const button=event.target.closest('[data-subject-index]');
      if(button){slideIndex=Number(button.dataset.subjectIndex);render();}
    });
    shell.querySelector('[data-subject-jump]')?.addEventListener('change',event=>{slideIndex=Number(event.target.value);render();});
    document.addEventListener('fullscreenchange',updateFullscreenButton);
    return shell;
  }

  function renderSupport(resetSolution=true){
    if(!deck||!shell)return;
    const slide=deck.slides[slideIndex];
    const solution=shell.querySelector('[data-subject-solution]');
    const answerButton=shell.querySelector('[data-subject-answer]');
    if(resetSolution&&solution)solution.hidden=true;
    if(solution)solution.innerHTML=`<strong>Solution / key reasoning</strong><ol>${list(slide.solution).map(item=>`<li>${esc(item)}</li>`).join('')}</ol>`;
    if(answerButton){answerButton.hidden=!slide.solution?.length;answerButton.textContent=solution?.hidden?'Show solution':'Hide solution';answerButton.setAttribute('aria-expanded',String(!solution?.hidden));}
    const note=shell.querySelector('[data-subject-teacher-note]');
    if(note){note.textContent=slide.note||'Ask for a precise explanation and connect it back to the lesson objective.';note.hidden=!teacherNotes;}
    shell.querySelector('[data-subject-notes]')?.setAttribute('aria-expanded',String(teacherNotes));
  }

  function render(){
    if(!deck)return;
    const host=ensureShell();
    slideIndex=Math.max(0,Math.min(deck.slides.length-1,slideIndex));
    const slide=deck.slides[slideIndex];
    host.querySelector('[data-subject-title]').textContent=deck.title;
    host.querySelector('[data-subject-subtitle]').textContent=`${deck.subtitle} · ${deck.slides.length} slides`;
    host.querySelector('[data-subject-count]').textContent=`Slide ${slideIndex+1} / ${deck.slides.length}`;
    const node=host.querySelector('.deep-slide');
    node.dataset.layout=slide.layout||'content';
    node.innerHTML=slideHtml(slide);
    host.querySelector('[data-subject-progress]').style.width=`${((slideIndex+1)/deck.slides.length)*100}%`;
    host.querySelector('[data-subject-list]').innerHTML=deck.slides.map((item,index)=>`${index===0||item.section!==deck.slides[index-1].section?`<strong class="ls-outline-section">${esc(item.section)}</strong>`:''}<button type="button" data-subject-index="${index}" aria-current="${index===slideIndex?'step':'false'}" class="${index===slideIndex?'active':''}"><small>${esc(item.kicker)}</small><span>${index+1}. ${esc(item.title)}</span></button>`).join('');
    const picker=host.querySelector('[data-subject-jump]');
    picker.innerHTML=deck.slides.map((item,index)=>`<option value="${index}">${index+1}. ${esc(item.kicker)}</option>`).join('');
    picker.value=String(slideIndex);
    const prev=host.querySelector('[data-subject-prev]');
    const next=host.querySelector('[data-subject-next]');
    prev.disabled=slideIndex===0;next.disabled=slideIndex===deck.slides.length-1;
    renderSupport(true);
    savePosition();
    node.scrollTop=0;
    node.focus({preventScroll:true});
  }

  function open(context,{restart=false}={}){
    const next=buildDeck(context);
    if(!next)return false;
    deck=next;
    returnFocus=document.activeElement;
    const saved=Number(positions()[deck.id]);
    slideIndex=restart||!Number.isFinite(saved)?0:Math.min(Math.max(0,saved),deck.slides.length-1);
    teacherNotes=false;
    ensureShell().hidden=false;
    document.body.classList.add('lesson-reader-open','deep-deck-open','lesson-presentation-primary');
    document.documentElement.classList.add('lesson-presentation-active');
    render();
    window.scrollTo?.(0,0);
    return true;
  }

  function close(){
    if(shell)shell.hidden=true;
    document.body.classList.remove('lesson-reader-open','deep-deck-open','lesson-presentation-primary');
    document.documentElement.classList.remove('lesson-presentation-active');
    if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
    returnFocus?.focus?.({preventScroll:true});
  }

  function move(delta){
    if(!deck)return;
    const next=Math.max(0,Math.min(deck.slides.length-1,slideIndex+delta));
    if(next===slideIndex)return;
    slideIndex=next;render();
  }

  function toggleSolution(){
    const panel=shell?.querySelector('[data-subject-solution]');
    if(!panel)return;
    panel.hidden=!panel.hidden;
    const button=shell.querySelector('[data-subject-answer]');
    button.textContent=panel.hidden?'Show solution':'Hide solution';
    button.setAttribute('aria-expanded',String(!panel.hidden));
  }

  function copySlides(){
    if(!deck)return;
    const text=deck.slides.map((slide,index)=>`${index+1}. ${slide.title}\n${list(slide.bullets).map(item=>`- ${item}`).join('\n')}`).join('\n\n');
    navigator.clipboard?.writeText(text);
  }

  function updateFullscreenButton(){
    const button=shell?.querySelector('[data-subject-fullscreen]');
    if(!button)return;
    const active=!!document.fullscreenElement;
    button.textContent=active?'Exit full screen':'Full screen';
    button.setAttribute('aria-pressed',String(active));
  }

  function toggleFullscreen(){
    const target=shell?.querySelector('.deep-deck')||shell;
    if(!document.fullscreenElement)target?.requestFullscreen?.().catch(()=>{});
    else document.exitFullscreen?.().catch(()=>{});
  }

  function isTyping(target){return !!target?.closest?.('input,textarea,select,[contenteditable="true"]');}
  document.addEventListener('keydown',event=>{
    if(!shell||shell.hidden||isTyping(event.target))return;
    if(event.key==='Escape'){
      if(document.fullscreenElement)return;
      event.preventDefault();close();return;
    }
    if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();move(-1);return;}
    if(event.key==='ArrowRight'||event.key==='PageDown'||event.key===' '){
      if(event.key===' '&&event.target?.closest?.('button'))return;
      event.preventDefault();move(1);
    }
  });

  window.ALEVEL_SUBJECT_PRESENTATION={buildDeck,open,close,getDeck:()=>deck,getSlideIndex:()=>slideIndex};
})();
