(()=>{
  'use strict';

  let observer=null;
  let applying=false;
  let previousActiveLesson;
  let contextCard=null;
  let selectionBubble=null;
  let activeContext=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const state=()=>window.CourseTextbook?.getState?.()||{};
  const current=()=>{const s=state(),data=window.CourseTextbook?.data||{};const topic=data[s.topicId];return{s,topic,chapter:topic?.chapters?.[Number(s.chapterIndex)||0],index:Number(s.chapterIndex)||0};};
  const topicTerms=(chapter)=>{
    const source=clean([chapter?.title,chapter?.summary,...(chapter?.sections||[]).flat()].join(' ')).toLowerCase();
    const terms=window.CourseTextbook?.terms||{};
    return Object.keys(terms).filter(k=>source.includes(k.toLowerCase())).slice(0,8);
  };
  const words=s=>clean(s).toLowerCase().replace(/[^a-z0-9α-ωλφρσεμνπτθ]+/g,' ').split(/\s+/).filter(w=>w.length>3);

  function elementText(element){
    if(!element)return'';
    const clone=element.cloneNode(true);
    clone.querySelectorAll('button,input,textarea,select,.tbp1-pause,.tbp3-tools,.tbp3-context-chip,.tbp2-controls').forEach(n=>n.remove());
    return clean(clone.textContent).slice(0,2600);
  }
  function sectionTitle(element){
    if(!element)return'Chapter overview';
    return clean(element.querySelector('h1,h2,h3,strong')?.textContent)||'Textbook section';
  }
  function rankedChecks(chapter,text){
    const qs=chapter?.checks||[];if(!qs.length)return[];
    const query=new Set(words(text));
    return qs.map(q=>({q,score:words(q).reduce((n,w)=>n+(query.has(w)?1:0),0)})).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.q);
  }
  function misconceptions(chapter,text){
    const terms=window.CourseTextbook?.terms||{};
    const found=topicTerms(chapter).filter(k=>text.toLowerCase().includes(k.toLowerCase())).map(k=>terms[k]?.exam).filter(Boolean);
    if(chapter?.examTip)found.push(chapter.examTip);
    return [...new Set(found)].slice(0,4);
  }
  function syntheticWorked(chapter,title){
    if(chapter?.example)return chapter.example;
    return{question:`Apply ${title.toLowerCase()} to an unfamiliar A-level Physics situation.`,steps:['Identify the governing physics principle.','List relevant quantities and units.','Choose the correct relationship or model.','Apply it carefully and interpret the result.'],answer:'Check the physical meaning, unit, sign and significant figures.'};
  }
  function buildContext(element,{selection='',wholeChapter=false}={}){
    const {s,topic,chapter,index}=current();if(!topic||!chapter)return null;
    const title=wholeChapter?chapter.title:sectionTitle(element);
    const text=clean(selection)||(wholeChapter?clean((chapter.sections||[]).map(([h,b])=>`${h}: ${b}`).join(' ')).slice(0,5200):elementText(element));
    const termKeys=topicTerms(chapter).filter(k=>text.toLowerCase().includes(k.toLowerCase()));
    const checks=rankedChecks(chapter,text);
    const miss=misconceptions(chapter,text);
    const eqs=(chapter.equations||[]).filter(eq=>wholeChapter||words(eq.join(' ')).some(w=>text.toLowerCase().includes(w))).slice(0,5);
    const bundle={
      id:`textbook-${s.topicId}-${index}`,
      title:wholeChapter?chapter.title:`${chapter.title} · ${title}`,
      ref:String(topic.code||'AQA Physics').replace(/^AQA\s*/i,''),
      topicId:s.topicId,
      topicCode:topic.code||'AQA Physics',
      topicTitle:topic.title||'',
      year:topic.year||'',
      focus:text||chapter.summary||chapter.title,
      objectives:(chapter.sections||[]).slice(0,4).map(([h])=>`Explain and apply ${clean(h).replace(/[.:]+$/,'').toLowerCase()}.`),
      keywords:termKeys.length?termKeys:topicTerms(chapter).slice(0,6),
      equations:eqs.length?eqs:(chapter.equations||[]).slice(0,4),
      chunks:wholeChapter?(chapter.sections||[]).map(([h,b])=>({title:h,text:[b]})).slice(0,8):[{title,text:[text||chapter.summary||'']}],
      worked:syntheticWorked(chapter,title),
      checks:checks.length?checks:[`Explain ${title.toLowerCase()} using precise A-level Physics terminology.`,`State one physical relationship or principle that is important in ${title.toLowerCase()}.`],
      exam:[{marks:3,q:`Explain the physics of ${title.toLowerCase()} in a clear cause-and-effect sequence.`},{marks:4,q:`Apply ${title.toLowerCase()} to an unfamiliar A-level Physics context and justify the model or relationship you use.`}],
      misconceptions:miss,
      concept:{source:'textbook',chapter:chapter.title,section:title,selection:clean(selection)}
    };
    return{bundle,topic,chapter,index,title,text,selection:clean(selection),wholeChapter};
  }

  function activate(ctx){
    if(!ctx)return;
    if(!window.ALEVEL_ACTIVE_LESSON?.id?.startsWith?.('textbook-'))previousActiveLesson=window.ALEVEL_ACTIVE_LESSON;
    activeContext=ctx;
    window.ALEVEL_TEXTBOOK_TUTOR_CONTEXT=ctx;
    window.ALEVEL_ACTIVE_LESSON=ctx.bundle;
    renderCoachContext();
  }
  function restoreActive(){
    if(window.ALEVEL_ACTIVE_LESSON?.id?.startsWith?.('textbook-'))window.ALEVEL_ACTIVE_LESSON=previousActiveLesson||null;
    previousActiveLesson=undefined;activeContext=null;window.ALEVEL_TEXTBOOK_TUTOR_CONTEXT=null;
    contextCard?.remove();contextCard=null;hideSelectionBubble();
  }

  const ACTIONS={
    explain:{label:'Explain this',mode:'explain',instruction:'Explain this textbook section from first principles. Break the physics into short linked steps, define important terms, and connect any equation to its physical meaning.'},
    simpler:{label:'Simplify',mode:'explain',instruction:'Explain this more simply without losing A-level accuracy. Use plain language first, then restate the precise A-level Physics version.'},
    why:{label:'Why?',mode:'explain',instruction:'Explain why this physics happens. Focus on the causal mechanism rather than merely restating the definition or equation.'},
    analogy:{label:'Analogy',mode:'explain',instruction:'Give one useful analogy for this idea, then state clearly where the analogy stops being physically accurate.'},
    example:{label:'Another example',mode:'worked',instruction:'Give a new worked example based specifically on this section. Show the principle, equation if relevant, substitution, unit, and physical interpretation.'},
    hint:{label:'Hint',mode:'hint',instruction:'Use hint-first tutoring on this section. Ask me to make the next step and do not reveal the complete answer immediately.'},
    quiz:{label:'Quiz me',mode:'quiz',instruction:'Ask one short diagnostic question based only on this section. Wait for my answer before explaining or marking it.'},
    exam:{label:'Exam question',mode:'exam',instruction:'Give one AQA-style exam question based on this section and state the mark value. Wait for my answer, then give an indicative mark and improvement feedback.'},
    visual:{label:'Explain visual',mode:'explain',instruction:'Explain what this visual or graph is showing, how each feature maps to the physics, and what changes when the displayed variables change.'},
    equation:{label:'Explain equation',mode:'explain',instruction:'Explain this equation physically: what every symbol means, the units, when it applies, assumptions, and how changing each variable affects the result.'},
    teach:{label:'Teach chapter',mode:'explain',instruction:'Teach this entire chapter as a guided tutorial. Start with the first core idea only, explain it clearly, then ask me one check question. Do not move to the next idea until I respond.'},
    diagnostic:{label:'Diagnostic',mode:'quiz',instruction:'Start a chapter diagnostic. Ask one question at a time, beginning with core knowledge and becoming more demanding. Use my answers to decide what needs reteaching.'}
  };

  function promptFor(action,ctx){
    const spec=ACTIONS[action]||ACTIONS.explain;
    const source=ctx.selection||ctx.text||ctx.chapter.summary||'';
    return `${spec.instruction}\n\nTEXTBOOK CONTEXT\nTopic: ${ctx.topic.code} ${ctx.topic.title}\nChapter: ${ctx.chapter.title}\nSection: ${ctx.title}\n\nExact textbook material:\n${source.slice(0,3200)}\n\nUse the supplied textbook material as the starting point, correct or extend it where necessary, and stay within AQA A-level Physics.`;
  }
  function setMode(mode){const select=document.getElementById('coachMode');if(select&&[...select.options].some(o=>o.value===mode))select.value=mode;}
  function sendAction(action,element,options={}){
    const ctx=buildContext(element,options);if(!ctx)return;
    activate(ctx);const spec=ACTIONS[action]||ACTIONS.explain;setMode(spec.mode);
    window.ALEVEL_AI_TUTOR?.open?.();
    setTimeout(()=>window.ALEVEL_AI_TUTOR?.send?.(promptFor(action,ctx),{mode:spec.mode,silentUser:true}),30);
  }

  function toolbar(actions,type='section'){
    const bar=document.createElement('div');bar.className=`tbp3-tools tbp3-tools-${type}`;
    bar.innerHTML=`<span class="tbp3-tools-label">✦ Tutor</span>${actions.map(a=>`<button type="button" data-tbp3-action="${a}">${esc(ACTIONS[a]?.label||a)}</button>`).join('')}`;
    return bar;
  }
  function wireToolbar(bar,target){bar.addEventListener('click',e=>{const b=e.target.closest('[data-tbp3-action]');if(b)sendAction(b.dataset.tbp3Action,target);});}
  function enhanceSections(article){
    article.querySelectorAll('.textbook-section').forEach(section=>{
      if(section.querySelector(':scope > .tbp3-tools'))return;const bar=toolbar(['explain','simpler','why','analogy','example','quiz'],'section');
      const heading=section.querySelector('h2,h3');heading?.insertAdjacentElement('afterend',bar);wireToolbar(bar,section);
    });
  }
  function enhanceEquations(article){
    article.querySelectorAll('.textbook-equation').forEach(card=>{
      if(card.querySelector('.tbp3-tools'))return;const bar=toolbar(['equation','example','quiz'],'equation');card.appendChild(bar);wireToolbar(bar,card);
    });
  }
  function enhanceWorked(article){
    const ex=article.querySelector('.textbook-example');if(ex&&!ex.querySelector('.tbp3-tools')){const bar=toolbar(['explain','hint','example'],'worked');ex.insertBefore(bar,ex.querySelector('.tbp1-worked-controls')||null);wireToolbar(bar,ex);}
  }
  function enhanceVisuals(article){
    article.querySelectorAll('.textbook-diagram,.tbp2-interactive,.tbp2-process').forEach(visual=>{
      if(visual.querySelector(':scope > .tbp3-tools'))return;const bar=toolbar(['visual','why','quiz'],'visual');visual.appendChild(bar);wireToolbar(bar,visual);
    });
  }
  function enhanceChecks(article){
    const check=article.querySelector('.textbook-check');if(check&&!check.querySelector(':scope > .tbp3-tools')){const bar=toolbar(['hint','quiz','exam'],'check');const head=check.querySelector('h3');head?.insertAdjacentElement('afterend',bar);wireToolbar(bar,check);}
  }
  function addChapterTutor(article){
    if(article.querySelector('.tbp3-chapter-tutor'))return;
    const target=article.querySelector('.tbp1-overview')||article.querySelector('.textbook-summary');if(!target)return;
    const box=document.createElement('section');box.className='tbp3-chapter-tutor';box.innerHTML=`<div><span>Guided textbook tutor</span><strong>Study this chapter with your Physics Tutor</strong><p>The tutor follows this exact chapter online or offline and checks your understanding as you go.</p></div><div><button type="button" data-tbp3-teach>✦ Teach me this chapter</button><button type="button" data-tbp3-diagnostic>Start diagnostic</button></div>`;
    target.insertAdjacentElement('afterend',box);
    box.querySelector('[data-tbp3-teach]').addEventListener('click',()=>sendAction('teach',article,{wholeChapter:true}));
    box.querySelector('[data-tbp3-diagnostic]').addEventListener('click',()=>sendAction('diagnostic',article,{wholeChapter:true}));
  }

  function ensureCoachContext(){
    const panel=document.getElementById('coachPanel');if(!panel)return null;if(contextCard?.isConnected)return contextCard;
    contextCard=document.createElement('section');contextCard.className='tbp3-coach-context';contextCard.innerHTML=`<div><span>Textbook context</span><strong data-tbp3-ctx-title>Current section</strong><small data-tbp3-ctx-meta></small></div><div class="tbp3-coach-chips"><button type="button" data-tbp3-follow="simpler">Simpler</button><button type="button" data-tbp3-follow="why">Why?</button><button type="button" data-tbp3-follow="example">Example</button><button type="button" data-tbp3-follow="quiz">Quiz me</button></div>`;
    const guided=panel.querySelector('.guided-tutor-mode');const controls=panel.querySelector('.coach-controls');(guided||controls)?.insertAdjacentElement('afterend',contextCard);
    contextCard.addEventListener('click',e=>{const action=e.target.closest('[data-tbp3-follow]')?.dataset.tbp3Follow;if(action&&activeContext){const spec=ACTIONS[action];setMode(spec.mode);window.ALEVEL_AI_TUTOR?.send?.(promptFor(action,activeContext),{mode:spec.mode,silentUser:true});}});
    return contextCard;
  }
  function renderCoachContext(){
    if(!activeContext)return;const card=ensureCoachContext();if(!card)return;
    card.querySelector('[data-tbp3-ctx-title]').textContent=activeContext.title;
    card.querySelector('[data-tbp3-ctx-meta]').textContent=`${activeContext.topic.code} · ${activeContext.chapter.title}`;
  }

  function ensureSelectionBubble(){
    if(selectionBubble)return selectionBubble;selectionBubble=document.createElement('div');selectionBubble.className='tbp3-selection-bubble';selectionBubble.hidden=true;selectionBubble.innerHTML='<span>Selected text</span><button type="button" data-tbp3-select="explain">✦ Ask tutor</button><button type="button" data-tbp3-select="simpler">Simplify</button>';
    document.body.appendChild(selectionBubble);selectionBubble.addEventListener('mousedown',e=>e.preventDefault());selectionBubble.addEventListener('click',e=>{const action=e.target.closest('[data-tbp3-select]')?.dataset.tbp3Select;if(!action)return;const selection=window.getSelection();const text=clean(selection?.toString());const article=document.getElementById('textbookArticle');let target=selection?.anchorNode?.parentElement?.closest('.textbook-section,.textbook-equation,.textbook-example,.tbp2-interactive,.tbp2-process')||article;if(text&&target)sendAction(action,target,{selection:text});hideSelectionBubble();});return selectionBubble;
  }
  function hideSelectionBubble(){if(selectionBubble)selectionBubble.hidden=true;}
  function showSelectionBubble(){
    const workspace=document.getElementById('textbookWorkspace');if(!workspace||workspace.hidden)return hideSelectionBubble();const sel=window.getSelection();const text=clean(sel?.toString());if(text.length<8||text.length>1400)return hideSelectionBubble();const article=document.getElementById('textbookArticle');const node=sel?.anchorNode?.nodeType===1?sel.anchorNode:sel?.anchorNode?.parentElement;if(!article||!node||!article.contains(node))return hideSelectionBubble();
    const rect=sel.getRangeAt(0).getBoundingClientRect();const bubble=ensureSelectionBubble();bubble.hidden=false;bubble.style.left=`${Math.max(12,Math.min(window.innerWidth-250,rect.left))}px`;bubble.style.top=`${Math.max(12,rect.bottom+8)}px`;
  }

  function apply(){
    if(applying)return;const article=document.getElementById('textbookArticle');if(!article||!window.CourseTextbook)return;const {topic,chapter}=current();if(!topic||!chapter)return;
    applying=true;try{article.classList.add('tbp3-article');addChapterTutor(article);enhanceSections(article);enhanceEquations(article);enhanceWorked(article);enhanceVisuals(article);enhanceChecks(article);}finally{applying=false;}
  }
  function observe(){const article=document.getElementById('textbookArticle');if(!article)return;observer?.disconnect();observer=new MutationObserver(()=>requestAnimationFrame(apply));observer.observe(article,{childList:true,subtree:true});apply();}

  document.addEventListener('mouseup',()=>setTimeout(showSelectionBubble,0));
  document.addEventListener('touchend',()=>setTimeout(showSelectionBubble,80));
  document.addEventListener('scroll',hideSelectionBubble,true);
  window.addEventListener('resize',hideSelectionBubble);
  window.addEventListener('textbookchange',event=>{if(event.detail?.open)setTimeout(()=>{observe();apply();},40);else restoreActive();});
  window.addEventListener('alevel:lesson-selected',event=>{if(!event.detail?.id?.startsWith?.('textbook-')&&document.getElementById('textbookWorkspace')?.hidden)restoreActive();});
  const start=()=>{if(document.getElementById('textbookArticle'))observe();else setTimeout(start,150);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.ALEVEL_TEXTBOOK_PHASE3={refresh:apply,send:sendAction,get context(){return activeContext;}};
})();