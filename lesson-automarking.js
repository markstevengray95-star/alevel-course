(()=>{
  'use strict';

  const STOP=new Set('the a an and or of to in on at for from with by is are was were be been being this that these those it its as into than then if when where which who what why how do does did can could should would may might will your you use using calculate explain describe state give determine find show compare discuss evaluate identify suggest outline physics lesson question answer'.split(' '));
  const SYN={
    'pd':['potential difference','voltage'], 'voltage':['potential difference','pd'], 'current':['charge flow','rate of flow of charge'],
    'force':['resultant force','newton'], 'acceleration':['rate of change of velocity'], 'momentum':['mass velocity','mv'],
    'energy':['work done','joule'], 'frequency':['hz','hertz'], 'wavelength':['lambda','λ'], 'uncertainty':['error','precision'],
    'emf':['electromotive force','energy per coulomb'], 'resistance':['ohm','Ω'], 'resistivity':['rho','ρ'],
    'field':['field strength'], 'potential':['energy per unit charge','energy per unit mass'], 'half-life':['half life','t1/2','t½'],
    'decay':['radioactive decay','exponential'], 'shm':['simple harmonic motion'], 'centripetal':['towards the centre','inward'],
    'stress':['force per area'], 'strain':['extension/original length','fractional extension']
  };
  const STORE='alevel-lesson-automarking-v1';
  let observer=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const norm=s=>String(s??'').toLowerCase().replace(/[×·]/g,'*').replace(/[²]/g,'^2').replace(/[³]/g,'^3').replace(/[−–—]/g,'-').replace(/[^a-z0-9λρΩμ^+\-*/=. ]+/gi,' ').replace(/\s+/g,' ').trim();
  const words=s=>norm(s).split(' ').filter(w=>w.length>2&&!STOP.has(w));
  const unique=a=>[...new Set(a.filter(Boolean))];
  const active=()=>window.ALEVEL_ACTIVE_LESSON||null;

  function phrasePresent(answer,term){
    const a=norm(answer), t=norm(term); if(!t)return false;
    if(a.includes(t))return true;
    const syn=SYN[t]||[]; return syn.some(x=>a.includes(norm(x)));
  }
  function tokensFrom(text,limit=8){
    const counts=new Map(); words(text).forEach(w=>counts.set(w,(counts.get(w)||0)+1));
    return [...counts].sort((a,b)=>b[1]-a[1]).map(x=>x[0]).slice(0,limit);
  }
  function contextText(lesson){
    if(!lesson)return '';
    return [lesson.focus,...(lesson.objectives||[]),...(lesson.keywords||[]),...(lesson.misconceptions||[]),...(lesson.chunks||[]).flatMap(c=>[c.title,...(c.text||[])]),...(lesson.equations||[]).flat(),lesson.worked?.answer,...(lesson.worked?.steps||[])].filter(Boolean).join(' ');
  }
  function rubricFor(question,marks,lesson){
    const q=String(question||''); const ctx=contextText(lesson);
    const qTokens=tokensFrom(q,10); const lessonTokens=tokensFrom(ctx,20);
    const keywords=unique([...(lesson?.keywords||[]).filter(k=>qTokens.some(t=>norm(k).includes(t)||t.includes(norm(k)))),...qTokens.filter(t=>lessonTokens.includes(t))]);
    const equation=(lesson?.equations||[]).find(eq=>qTokens.some(t=>norm(eq.join(' ')).includes(t)))||lesson?.primaryEquation||lesson?.equations?.[0];
    const concept=lesson?.concept?.key||lesson?.title||'relevant physics principle';
    const points=[];
    if(keywords.length) points.push({label:`Use the relevant physics vocabulary (${keywords.slice(0,4).join(', ')})`,terms:keywords.slice(0,6),weight:1});
    points.push({label:`State the relevant principle: ${concept}`,terms:unique([concept,...tokensFrom(concept,5)]),weight:1});
    if(equation?.[1]) points.push({label:`Use the relationship ${equation[1]}`,terms:[equation[1],equation[0]],weight:1});
    if(/explain|why|discuss|justify|evaluate/i.test(q)) points.push({label:'Link cause to effect with a clear reasoning chain',reasoning:true,weight:1});
    if(/calculate|determine|find|show/i.test(q)) points.push({label:'Show a valid calculation route and include a unit',calculation:true,weight:1});
    if(/graph|gradient|intercept|trend/i.test(q)) points.push({label:'Refer to the relevant graph feature or trend',terms:['gradient','intercept','trend','graph','proportional'],weight:1});
    if(/uncertainty|error|practical|method|improve|evaluate/i.test(q)) points.push({label:'Include a relevant limitation, uncertainty or improvement',terms:['uncertainty','random','systematic','repeat','mean','resolution','percentage','improve','limitation'],weight:1});
    const target=Math.max(1,Number(marks)||Math.min(4,points.length));
    while(points.length<target){
      const extra=(lesson?.objectives||[])[points.length%Math.max(1,(lesson?.objectives||[]).length)]||lesson?.focus||'Apply the lesson focus accurately';
      points.push({label:extra,terms:tokensFrom(extra,6),weight:1});
    }
    return points.slice(0,Math.max(target,Math.min(points.length,6)));
  }
  function hasReasoning(a){return /because|therefore|so that|hence|which means|causes|results in|leads to|as a result|since|due to/.test(norm(a));}
  function hasCalculation(a){return /[=]/.test(a)&&/\d/.test(a);}
  function hasUnit(a){return /\b(n|j|w|v|a|c|pa|hz|m|s|kg|n\/c|n\/kg|j\/c|ohm|Ω|t|wb|f|bq|gy|ev|mev|m\/s|m s|m\/s\^2)\b/i.test(a);}
  function pointHit(point,answer){
    if(point.reasoning)return hasReasoning(answer);
    if(point.calculation)return hasCalculation(answer)&&hasUnit(answer);
    const terms=(point.terms||[]).filter(Boolean); if(!terms.length)return false;
    const hits=terms.filter(t=>phrasePresent(answer,t)).length;
    return hits>=Math.max(1,Math.ceil(Math.min(terms.length,4)*0.34));
  }
  function mark(question,answer,marks,lesson=active()){
    const max=Math.max(1,Number(marks)||2); const text=String(answer||'').trim();
    if(!text)return {score:0,max,matched:[],missing:['Write an answer before marking.'],quality:'Not attempted',rubric:[]};
    const rubric=rubricFor(question,max,lesson); const evaluated=rubric.map(p=>({...p,hit:pointHit(p,text)}));
    const raw=evaluated.filter(p=>p.hit).length; let score=Math.round(raw/Math.max(1,evaluated.length)*max);
    if(text.length<18&&max>1)score=Math.min(score,1);
    score=Math.max(0,Math.min(max,score));
    const matched=evaluated.filter(p=>p.hit).map(p=>p.label); const missing=evaluated.filter(p=>!p.hit).map(p=>p.label);
    const quality=score===max?'Strong answer':score>=Math.ceil(max*.65)?'Mostly secure':score>0?'Developing':'Needs more physics';
    return {score,max,matched,missing,quality,rubric:evaluated,indicator:true};
  }

  function saveAttempt(record){
    try{const all=JSON.parse(localStorage.getItem(STORE)||'[]');all.push({...record,at:Date.now()});localStorage.setItem(STORE,JSON.stringify(all.slice(-300)));}catch{}
  }
  function feedbackHtml(result){
    const matched=result.matched.slice(0,4).map(x=>`<li>✓ ${esc(x)}</li>`).join('');
    const missing=result.missing.slice(0,4).map(x=>`<li>→ ${esc(x)}</li>`).join('');
    return `<div class="automark-score"><strong>${result.score}/${result.max}</strong><span>${esc(result.quality)}</span><em>Indicative offline mark</em></div><div class="automark-columns"><div><b>Credited</b><ul>${matched||'<li>Nothing credited yet.</li>'}</ul></div><div><b>Improve next</b><ul>${missing||'<li>All main rubric points detected.</li>'}</ul></div></div><p class="automark-note">This local marker checks physics content, equations, units and reasoning patterns. Extended responses should still be reviewed against an official mark scheme.</p>`;
  }
  function wireItem(host,question,marks,index,type){
    if(host.dataset.automarkReady==='1')return; host.dataset.automarkReady='1';
    const ta=host.querySelector('textarea'); if(!ta)return;
    const actions=document.createElement('div'); actions.className='automark-actions';
    const btn=document.createElement('button');btn.type='button';btn.className='automark-button';btn.textContent=`Mark answer${marks?` / ${marks}`:''}`;
    const tutor=document.createElement('button');tutor.type='button';tutor.className='automark-tutor';tutor.textContent='Ask tutor about feedback';
    const out=document.createElement('div');out.className='automark-feedback';out.hidden=true;out.setAttribute('aria-live','polite');
    actions.append(btn,tutor);host.append(actions,out);
    btn.addEventListener('click',()=>{const result=mark(question,ta.value,marks||2,active());out.innerHTML=feedbackHtml(result);out.hidden=false;saveAttempt({lessonId:active()?.id,question,type,index,answer:ta.value,score:result.score,max:result.max});});
    tutor.addEventListener('click',()=>{const result=mark(question,ta.value,marks||2,active());window.dispatchEvent(new CustomEvent('alevel:tutor-feedback',{detail:{question,answer:ta.value,result,lesson:active()}}));});
  }
  function enhance(){
    const lesson=active(); if(!lesson)return;
    document.querySelectorAll('#lr-checks .question-list>li').forEach((el,i)=>wireItem(el,lesson.checks?.[i]||el.childNodes[0]?.textContent||'',2,i,'check'));
    document.querySelectorAll('#lr-exam .exam-list>article').forEach((el,i)=>wireItem(el,lesson.exam?.[i]?.q||el.querySelector('p')?.textContent||'',lesson.exam?.[i]?.marks||4,i,'exam'));
    const body=document.querySelector('.lesson-reader-body');
    if(body&&!body.querySelector('.automark-banner')){
      const banner=document.createElement('div');banner.className='automark-banner';banner.innerHTML='<strong>Auto-marking enabled</strong><span>Instant indicative marking works offline for lesson checks and AQA-style questions.</span>';
      body.prepend(banner);
    }
  }
  function observe(){observer?.disconnect();const reader=document.querySelector('.lesson-reader-shell');if(!reader)return;observer=new MutationObserver(()=>requestAnimationFrame(enhance));observer.observe(reader,{subtree:true,childList:true});}
  window.addEventListener('alevel:lesson-selected',()=>setTimeout(enhance,40));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{observe();enhance();},{once:true});else{observe();enhance();}
  window.ALEVEL_AUTOMARK={mark,history:()=>{try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch{return[]}},clearHistory:()=>localStorage.removeItem(STORE)};
})();
