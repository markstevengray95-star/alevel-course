(()=>{
  if(window.self===window.top)return;
  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
  const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let latest=null;
  let renderTimer=0;

  const removeOld=()=>document.querySelectorAll('.uc-slide-enrichment').forEach(el=>el.remove());

  function termsMarkup(terms=[]){
    if(!terms.length)return '';
    return `<section class="uc-slide-enrichment uc-terms-card"><div class="uc-slide-card-head"><span>Key terminology</span><strong>Know the language</strong></div><div class="uc-term-grid">${terms.map(term=>`<details class="uc-term-item"><summary>${esc(term.label||term.key)}</summary><p>${esc(term.d||'Key term for this lesson.')}</p>${term.equation?`<code>${esc(term.equation)}</code>`:''}${term.unit?`<small>SI unit: ${esc(term.unit)}</small>`:''}${term.exam?`<em>Exam use: ${esc(term.exam)}</em>`:''}</details>`).join('')}</div></section>`;
  }

  function workedMarkup(example){
    if(!example||!(example.steps||[]).length)return '';
    const steps=(example.steps||[]).slice(0,4);
    return `<section class="uc-slide-enrichment uc-worked-flow"><div class="uc-slide-card-head"><span>Worked method</span><strong>Follow the reasoning</strong></div><p class="uc-worked-question">${esc(example.question||'')}</p><div class="uc-worked-steps">${steps.map((step,index)=>`<div class="uc-worked-step"><b>${index+1}</b><span>${esc(step)}</span></div>`).join('')}</div>${example.answer?`<div class="uc-worked-answer"><span>Answer</span><strong>${esc(example.answer)}</strong></div>`:''}</section>`;
  }

  function equationMarkup(equations=[]){
    if(!equations.length)return '';
    return `<section class="uc-slide-enrichment uc-equation-meaning"><div class="uc-slide-card-head"><span>Equation meaning</span><strong>Connect symbols to physics</strong></div><div class="uc-equation-grid">${equations.slice(0,4).map(item=>`<div class="uc-equation-card"><span>${esc(item.name)}</span><code>${esc(item.formula)}</code>${item.unit?`<small>${esc(item.unit)}</small>`:''}</div>`).join('')}</div></section>`;
  }

  function examMarkup(data){
    if(!data.examTip&&!(data.checks||[]).length)return '';
    return `<section class="uc-slide-enrichment uc-exam-focus"><div class="uc-slide-card-head"><span>AQA focus</span><strong>What examiners are looking for</strong></div>${data.examTip?`<div class="uc-exam-tip"><b>Exam tip</b><p>${esc(data.examTip)}</p></div>`:''}${(data.checks||[]).length?`<div class="uc-quick-check"><b>Quick check</b><ol>${data.checks.slice(0,3).map(q=>`<li>${esc(q)}</li>`).join('')}</ol></div>`:''}</section>`;
  }

  function insertHtml(target,html){
    if(!target||!html)return false;
    const wrap=document.createElement('div');
    wrap.innerHTML=html.trim();
    const node=wrap.firstElementChild;
    if(!node)return false;
    target.appendChild(node);
    return true;
  }

  function decorate(data){
    latest=data;
    removeOld();

    const learn=document.querySelector('.lesson-stage[data-stage="learn"]');
    const equations=document.querySelector('.lesson-stage[data-stage="equations"]');
    const worked=document.querySelector('.lesson-stage[data-stage="worked"]');
    const exam=document.querySelector('.lesson-stage[data-stage="exam"]');
    const fallback=document.querySelector('.uc-lesson-essentials .uc-essential-body');

    let used=false;
    if(learn&&data.visual){used=insertHtml(learn,`<section class="uc-slide-enrichment uc-visual-card">${data.visual}</section>`)||used;}
    if(learn){used=insertHtml(learn,termsMarkup(data.terms))||used;}
    if(equations){used=insertHtml(equations,equationMarkup(data.equations))||used;}
    if(worked){used=insertHtml(worked,workedMarkup(data.example))||used;}
    if(exam){used=insertHtml(exam,examMarkup(data))||used;}

    if(!used&&fallback){
      const visual=data.visual?`<section class="uc-slide-enrichment uc-visual-card">${data.visual}</section>`:'';
      [visual,termsMarkup(data.terms),equationMarkup(data.equations),workedMarkup(data.example),examMarkup(data)].forEach(html=>insertHtml(fallback,html));
    }
    document.documentElement.classList.add('uc-lesson-visuals-ready');
  }

  const schedule=(data=latest,delay=40)=>{
    if(data)latest=data;
    window.clearTimeout(renderTimer);
    renderTimer=window.setTimeout(()=>latest&&decorate(latest),delay);
  };

  window.addEventListener('message',event=>{
    if(event.data?.type==='alevel-lesson-enrichment')schedule(event.data,0);
  });

  const observer=new MutationObserver(mutations=>{
    if(!latest)return;
    const meaningful=mutations.some(mutation=>{
      if(mutation.target?.closest?.('.uc-slide-enrichment'))return false;
      const nodes=[...mutation.addedNodes,...mutation.removedNodes];
      return nodes.some(node=>!(node.nodeType===1&&node.classList?.contains('uc-slide-enrichment')));
    });
    if(meaningful)schedule(latest,90);
  });
  const start=()=>observer.observe(document.body,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();