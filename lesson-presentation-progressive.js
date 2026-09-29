(() => {
  'use strict';

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));

  const progressiveLayouts = new Set([
    'retrieval','objectives','vocabulary','teach','worked','check','activity',
    'answer','application','markscheme','misconception','stretch','plenary','summary','equation'
  ]);

  let currentKey='';
  let fragments=[];
  let revealLevel=0;
  let observer=null;
  let status=null;
  let settleTimer=null;

  function shell(){ return $('.lesson-presentation-shell'); }
  function slide(){ return shell()?.querySelector('.deep-slide'); }
  function active(){
    const s=shell();
    return !!s && !s.hidden && document.body.classList.contains('lesson-presentation-primary');
  }

  function slideKey(){
    const s=shell(), node=slide();
    return `${s?.querySelector('[data-deep-count]')?.textContent || ''}|${node?.dataset.layout || ''}|${node?.querySelector('h1,h2')?.textContent || ''}`;
  }

  function candidateNodes(node){
    if(!node) return [];
    const layout=node.dataset.layout || '';
    if(!progressiveLayouts.has(layout)) return [];

    const found=[];
    const add = el => {
      if(!el || found.includes(el)) return;
      if(el.closest('.deep-teacher-note,.phase3-note')) return;
      found.push(el);
    };

    // Equations/visual models appear before supporting bullet points.
    $$('.phase3-equation,[data-p5-reveal="model"],.presentation-visual,figure',node).forEach(add);
    $$('ul > li,ol > li,[data-p5-reveal="step"]',node).forEach(add);

    // A single bullet is normally a whole question, not a build sequence.
    if(found.length<2 && layout!=='worked' && layout!=='markscheme' && layout!=='answer') return [];
    return found;
  }

  function ensureStatus(){
    const top=shell()?.querySelector('.phase3-top');
    if(!top) return null;
    status=top.querySelector('[data-p5-status]');
    if(status) return status;
    status=document.createElement('span');
    status.className='p5-build-status';
    status.dataset.p5Status='';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    top.appendChild(status);
    return status;
  }

  function revealButton(){ return shell()?.querySelector('[data-p4-reveal]'); }

  function normaliseAnswerSlide(){
    const node=slide();
    if(!node) return;
    // Phase 4 hides answer slides as a block. Phase 5 replaces that with stepwise reveal.
    node.classList.remove('p4-answer-hidden');
  }

  function applyState({animateIndex=-1}={}){
    const node=slide();
    if(!node) return;

    fragments.forEach((fragment,index)=>{
      const shown=index<revealLevel;
      fragment.classList.toggle('p5-fragment-hidden',!shown);
      fragment.classList.toggle('p5-fragment-shown',shown);
      fragment.dataset.p5Index=String(index+1);
      fragment.setAttribute('aria-hidden',String(!shown));
      if(index===animateIndex && shown && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
        fragment.classList.remove('p5-fragment-pop');
        void fragment.offsetWidth;
        fragment.classList.add('p5-fragment-pop');
      }
    });

    const hasBuild=fragments.length>0;
    node.classList.toggle('p5-progressive-slide',hasBuild);
    node.classList.toggle('p5-build-complete',hasBuild && revealLevel>=fragments.length);
    node.dataset.p5Reveal=`${revealLevel}/${fragments.length}`;

    const badge=ensureStatus();
    if(badge){
      badge.hidden=!hasBuild;
      badge.textContent=hasBuild ? `Build ${revealLevel} / ${fragments.length}` : '';
      badge.classList.toggle('complete',hasBuild && revealLevel>=fragments.length);
    }

    const button=revealButton();
    if(button){
      if(hasBuild){
        button.disabled=false;
        button.setAttribute('aria-disabled','false');
        button.textContent=revealLevel>=fragments.length ? 'All shown' : `Reveal ${revealLevel}/${fragments.length}`;
        button.title=revealLevel>=fragments.length ? 'All points shown — next advances the slide' : 'Reveal next point (R)';
        button.classList.toggle('active',revealLevel>0);
        button.classList.toggle('p5-complete',revealLevel>=fragments.length);
      }
    }
  }

  function prepare(force=false){
    if(!active()) return false;
    const node=slide();
    if(!node) return false;
    const key=slideKey();
    if(!force && key===currentKey) return fragments.length>0;

    currentKey=key;
    revealLevel=0;
    fragments=candidateNodes(node);
    normaliseAnswerSlide();
    applyState();
    return fragments.length>0;
  }

  function advance(){
    if(!active()) return false;
    prepare(false);
    if(!fragments.length || revealLevel>=fragments.length) return false;
    const index=revealLevel;
    revealLevel++;
    normaliseAnswerSlide();
    applyState({animateIndex:index});
    return true;
  }

  function back(){
    if(!active()) return false;
    prepare(false);
    if(!fragments.length || revealLevel<=0) return false;
    revealLevel--;
    applyState();
    return true;
  }

  function revealAll(){
    if(!active()) return false;
    prepare(false);
    if(!fragments.length || revealLevel>=fragments.length) return false;
    revealLevel=fragments.length;
    normaliseAnswerSlide();
    applyState({animateIndex:fragments.length-1});
    return true;
  }

  function reset(){
    if(!active()) return false;
    prepare(false);
    if(!fragments.length || revealLevel===0) return false;
    revealLevel=0;
    applyState();
    return true;
  }

  function settlePrepare(force=false){
    window.clearTimeout(settleTimer);
    settleTimer=window.setTimeout(()=>prepare(force),0);
  }

  function observe(){
    observer?.disconnect();
    const node=slide();
    if(!node) return;
    observer=new MutationObserver(mutations=>{
      // Ignore our own class/aria state changes; react to a rendered slide replacing its content/layout.
      const meaningful=mutations.some(m=>m.type==='childList' || (m.type==='attributes' && m.attributeName==='data-layout'));
      if(meaningful) settlePrepare(true);
    });
    observer.observe(node,{subtree:true,childList:true,attributes:true,attributeFilter:['data-layout']});
    settlePrepare(true);
  }

  function consumeClick(event){
    if(!active()) return;

    const next=event.target.closest?.('[data-deep-next]');
    if(next && advance()){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const prev=event.target.closest?.('[data-deep-prev]');
    if(prev && back()){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    const reveal=event.target.closest?.('[data-p4-reveal]');
    if(reveal && prepare(false)){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(event.shiftKey) revealAll();
      else if(!advance()) revealAll();
    }
  }

  function consumeKeyboard(event){
    if(!active() || event.target?.closest?.('input,textarea,select,[contenteditable="true"]')) return;

    // Window-capture runs before the Phase 1/4 document handlers, giving fragment builds PowerPoint-like priority.
    if(event.key==='Enter'){
      if(advance()){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    if(event.key==='r' || event.key==='R'){
      if(prepare(false)){
        event.preventDefault();
        event.stopImmediatePropagation();
        if(event.shiftKey) revealAll();
        else advance();
      }
      return;
    }

    if(event.key==='ArrowRight' || event.key==='PageDown' || event.key===' '){
      if(advance()){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }

    if(event.key==='ArrowLeft' || event.key==='PageUp'){
      if(back()){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  }

  function start(){
    if(!shell()){
      window.setTimeout(start,80);
      return;
    }
    observe();
  }

  window.addEventListener('click',consumeClick,true);
  window.addEventListener('keydown',consumeKeyboard,true);
  window.addEventListener('alevel:lesson-selected',()=>window.setTimeout(()=>{observe();prepare(true);},140));

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.ALEVEL_PROGRESSIVE_REVEAL={
    advance,
    back,
    revealAll,
    reset,
    refresh:()=>prepare(true),
    get progress(){ return {shown:revealLevel,total:fragments.length}; }
  };
})();