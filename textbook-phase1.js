(()=>{
  'use strict';

  const SYMBOLS={
    'I':['current','A'],'Q':['charge','C'],'t':['time','s'],'V':['potential difference / voltage','V'],'W':['work or energy transferred','J'],'R':['resistance','Ω'],'P':['power','W'],'E':['energy / field quantity','context dependent'],'F':['force','N'],'m':['mass','kg'],'a':['acceleration','m s⁻²'],'v':['velocity / speed','m s⁻¹'],'u':['initial velocity','m s⁻¹'],'s':['displacement','m'],'p':['momentum / pressure','context dependent'],'h':['Planck constant','J s'],'f':['frequency','Hz'],'λ':['wavelength','m'],'c':['speed of light','m s⁻¹'],'ρ':['resistivity / density','context dependent'],'L':['length','m'],'A':['area / activity','context dependent'],'ε':['emf / strain','context dependent'],'σ':['stress','Pa'],'r':['radius / internal resistance','context dependent'],'C':['capacitance','F'],'B':['magnetic flux density','T'],'Φ':['magnetic flux','Wb'],'N':['number / turns','dimensionless'],'G':['gravitational constant','N m² kg⁻²'],'g':['gravitational field strength','N kg⁻¹'],'k':['constant','context dependent'],'T':['period / temperature','s or K'],'ω':['angular frequency','rad s⁻¹'],'x':['displacement','m'],'n':['amount / refractive index','context dependent'],'φ':['phase / work function','context dependent'],'θ':['angle','rad or °'],'Δ':['change in','—']
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let observer=null;
  let applying=false;

  function state(){return window.CourseTextbook?.getState?.()||{};}
  function current(){const s=state(),data=window.CourseTextbook?.data||{};const topic=data[s.topicId];return{state:s,topic,chapter:topic?.chapters?.[s.chapterIndex],index:Number(s.chapterIndex)||0};}
  function chapterTerms(chapter){
    const source=[chapter?.title,chapter?.summary,...(chapter?.sections||[]).flat(),...(chapter?.equations||[]).flat()].filter(Boolean).join(' ').toLowerCase();
    const library=window.CourseTextbook?.terms||{};
    return Object.keys(library).filter(key=>source.includes(key.toLowerCase())).slice(0,6);
  }
  function symbolsFor(eq){
    const expression=String(eq?.[1]||'');
    const found=[];
    Object.keys(SYMBOLS).forEach(symbol=>{const safe=symbol.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(new RegExp(`(^|[^A-Za-z])${safe}(?=[^A-Za-z]|$)`).test(expression))found.push(symbol);});
    return [...new Set(found)].slice(0,7);
  }
  function previousKnowledge(topic,index){
    if(index>0){const prev=topic.chapters[index-1];return{title:`From the previous chapter: ${prev.title.replace(/^\d+\.\s*/, '')}`,text:prev.summary||'Recall the core ideas from the previous chapter before moving on.'};}
    return{title:'Before you start',text:`Recall the key definitions, units and mathematical relationships you already know that connect to ${topic.title.toLowerCase()}.`};
  }
  function goalItems(chapter){return (chapter.sections||[]).slice(0,4).map(([heading])=>`Explain and apply ${String(heading).replace(/[.:]+$/,'').toLowerCase()}.`);}
  function misconceptionItems(chapter){
    const terms=chapterTerms(chapter),library=window.CourseTextbook?.terms||{};
    const items=terms.map(k=>library[k]?.exam).filter(Boolean).slice(0,3);
    if(chapter.examTip&&!items.includes(chapter.examTip))items.push(chapter.examTip);
    return items.slice(0,3);
  }
  function addOverview(article,topic,chapter,index){
    if(article.querySelector('.tbp1-overview'))return;
    const knowledge=previousKnowledge(topic,index);const goals=goalItems(chapter);
    const box=document.createElement('section');box.className='tbp1-overview';
    box.innerHTML=`<div class="tbp1-overview-grid"><article class="tbp1-prior"><span>Prior knowledge</span><strong>${esc(knowledge.title)}</strong><p>${esc(knowledge.text)}</p></article><article class="tbp1-goals"><span>By the end of this chapter</span><ul>${goals.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></article></div><nav class="tbp1-route" aria-label="Chapter learning route"><button type="button" data-tbp1-jump="learn"><b>1</b><span>Learn</span></button><button type="button" data-tbp1-jump="equations"><b>2</b><span>Equations</span></button><button type="button" data-tbp1-jump="worked"><b>3</b><span>Worked example</span></button><button type="button" data-tbp1-jump="check"><b>4</b><span>Check</span></button></nav>`;
    const summary=article.querySelector('.textbook-summary');(summary||article.querySelector('h1'))?.insertAdjacentElement('afterend',box);
  }
  function numberSections(article){
    const sections=[...article.querySelectorAll('.textbook-section')];
    sections.forEach((section,i)=>{
      if(section.dataset.tbp1Ready)return;section.dataset.tbp1Ready='1';section.id=section.id||`tbp1-learn-${i+1}`;
      section.classList.add('tbp1-teach-section');
      const h=section.querySelector('h2');if(h){const badge=document.createElement('span');badge.className='tbp1-section-number';badge.textContent=`Concept ${i+1}`;h.before(badge);}
      const pause=document.createElement('div');pause.className='tbp1-pause';pause.innerHTML='<strong>Pause and recall</strong><span>Can you explain this idea without looking back at the paragraph?</span>';
      section.appendChild(pause);
    });
  }
  function enhanceEquations(article,chapter){
    const cards=[...article.querySelectorAll('.textbook-equation')];
    cards.forEach((card,i)=>{
      if(card.dataset.tbp1Ready)return;card.dataset.tbp1Ready='1';card.classList.add('tbp1-equation-card');
      const eq=(chapter.equations||[])[i];if(!eq)return;
      const syms=symbolsFor(eq);
      const details=document.createElement('div');details.className='tbp1-equation-details';
      details.innerHTML=`<div class="tbp1-eq-block"><span>Use it when</span><p>${esc(eq[2]||'Use this relationship when the listed quantities describe the physical situation.')}</p></div><div class="tbp1-eq-block"><span>Method</span><ol><li>List known quantities with units.</li><li>Convert to SI units.</li><li>Rearrange before substituting.</li><li>Substitute, calculate and check the final unit.</li></ol></div>${syms.length?`<div class="tbp1-symbols"><span>Symbols & units</span><div>${syms.map(s=>`<p><code>${esc(s)}</code><b>${esc(SYMBOLS[s][0])}</b><em>${esc(SYMBOLS[s][1])}</em></p>`).join('')}</div></div>`:''}`;
      card.appendChild(details);
    });
    const wrap=article.querySelector('.textbook-equations');if(wrap)wrap.id='tbp1-equations';
  }
  function progressiveExample(article){
    const ex=article.querySelector('.textbook-example');if(!ex||ex.dataset.tbp1Ready)return;ex.dataset.tbp1Ready='1';ex.id='tbp1-worked';ex.classList.add('tbp1-worked');
    const steps=[...ex.querySelectorAll('ol>li')],answer=ex.querySelector('.textbook-answer');if(!steps.length)return;
    steps.forEach((step,i)=>{step.classList.add('tbp1-worked-step');step.dataset.step=String(i+1);if(i>0)step.hidden=true;});if(answer)answer.hidden=true;
    const controls=document.createElement('div');controls.className='tbp1-worked-controls';controls.innerHTML='<button type="button" data-tbp1-reveal>Reveal next step</button><button type="button" data-tbp1-reset>Reset solution</button><span aria-live="polite">Step 1 shown</span>';ex.appendChild(controls);
    const setCount=n=>{steps.forEach((s,i)=>s.hidden=i>=n);if(answer)answer.hidden=n<=steps.length;controls.querySelector('span').textContent=n>steps.length?'Full solution shown':`Step ${Math.min(n,steps.length)} of ${steps.length} shown`;controls.querySelector('[data-tbp1-reveal]').disabled=n>steps.length;};
    let shown=1;controls.querySelector('[data-tbp1-reveal]').addEventListener('click',()=>{shown=Math.min(steps.length+1,shown+1);setCount(shown);});controls.querySelector('[data-tbp1-reset]').addEventListener('click',()=>{shown=1;setCount(shown);});
  }
  function addMisconceptions(article,chapter){
    if(article.querySelector('.tbp1-misconceptions'))return;const items=misconceptionItems(chapter);if(!items.length)return;
    const box=document.createElement('aside');box.className='tbp1-misconceptions';box.innerHTML=`<div><span>Common traps</span><h3>Do not lose marks here</h3></div><ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
    const tip=article.querySelector('.textbook-tip');(tip||article.querySelector('.textbook-check')||article.querySelector('.textbook-chapter-actions'))?.insertAdjacentElement('beforebegin',box);
  }
  function checkPrompt(question,chapter){
    const synthetic={title:chapter.title,focus:chapter.summary,objectives:goalItems(chapter),keywords:chapterTerms(chapter),equations:chapter.equations||[],misconceptions:misconceptionItems(chapter),chunks:(chapter.sections||[]).map(s=>({title:s[0],text:[s[1]]}))};
    return synthetic;
  }
  function enhanceChecks(article,chapter){
    const check=article.querySelector('.textbook-check');if(!check||check.dataset.tbp1Ready)return;check.dataset.tbp1Ready='1';check.id='tbp1-check';
    const items=[...check.querySelectorAll('ol>li')];items.forEach((li,i)=>{
      const q=(chapter.checks||[])[i]||li.textContent.trim();const area=document.createElement('div');area.className='tbp1-check-answer';area.innerHTML='<textarea rows="2" placeholder="Write your answer before checking…"></textarea><button type="button">Check response</button><div class="tbp1-check-feedback" hidden aria-live="polite"></div>';li.appendChild(area);
      area.querySelector('button').addEventListener('click',()=>{const answer=area.querySelector('textarea').value.trim(),out=area.querySelector('.tbp1-check-feedback');if(!answer){out.hidden=false;out.innerHTML='<strong>Not attempted yet.</strong><span>Write an answer first, even if you are unsure.</span>';return;}let result=null;try{result=window.ALEVEL_AUTOMARK?.mark?.(q,answer,2,checkPrompt(q,chapter));}catch{}if(result){out.innerHTML=`<strong>${result.score}/${result.max} · ${esc(result.quality||'Indicative check')}</strong><span>${result.missing?.[0]?`Next improvement: ${esc(result.missing[0])}`:'Main physics points detected. Explain your reasoning precisely.'}</span>`;}else{const key=chapterTerms(chapter).find(k=>answer.toLowerCase().includes(k.toLowerCase()));out.innerHTML=`<strong>${key?'Good start':'Develop this answer'}</strong><span>${key?'You used relevant chapter vocabulary. Add a clear cause-and-effect explanation where appropriate.':'Use the key terminology and physical relationship from this section.'}</span>`;}out.hidden=false;});
    });
  }
  function wireRoute(article){
    article.querySelectorAll('[data-tbp1-jump]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.tbp1Jump;const target=key==='learn'?article.querySelector('.textbook-section'):key==='equations'?article.querySelector('#tbp1-equations'):key==='worked'?article.querySelector('#tbp1-worked'):article.querySelector('#tbp1-check');target?.scrollIntoView({behavior:'smooth',block:'start'});}));
  }
  function apply(){
    if(applying)return;const article=document.getElementById('textbookArticle');if(!article||!window.CourseTextbook)return;const {topic,chapter,index}=current();if(!topic||!chapter)return;
    const key=`${state().topicId}:${index}`;if(article.dataset.tbp1Key===key&&article.querySelector('.tbp1-overview'))return;
    applying=true;try{article.dataset.tbp1Key=key;article.classList.add('tbp1-article');addOverview(article,topic,chapter,index);numberSections(article);enhanceEquations(article,chapter);progressiveExample(article);addMisconceptions(article,chapter);enhanceChecks(article,chapter);wireRoute(article);}finally{applying=false;}
  }
  function observe(){const article=document.getElementById('textbookArticle');if(!article)return;observer?.disconnect();observer=new MutationObserver(()=>requestAnimationFrame(apply));observer.observe(article,{childList:true,subtree:true});apply();}
  window.addEventListener('textbookchange',event=>{if(event.detail?.open)setTimeout(()=>{observe();apply();},30);});
  document.addEventListener('click',event=>{if(event.target.closest('#textbookNext,#textbookPrevious,.textbook-chapter-button,#textbookMobileChapter,#textbookTopicSelect'))setTimeout(apply,40);});
  const start=()=>{if(document.getElementById('textbookArticle'))observe();else setTimeout(start,150);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.ALEVEL_TEXTBOOK_PHASE1={refresh:apply};
})();