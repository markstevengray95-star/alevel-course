(() => {
  'use strict';

  const $ = (selector, root=document) => root.querySelector(selector);
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

  let dock=null, ink=null, ctx=null, laser=null, blank=null, timerPanel=null, shortcutsPanel=null;
  let tool='none', drawing=false, lastPoint=null, zoom=1, blanked=false, answerHidden=false;
  let timerPreset=300, timerRemaining=300, timerRunning=false, timerInterval=null, timerEndsAt=0;
  let lastSlideKey='', idleTimer=null, observer=null;

  function shell(){ return $('.lesson-presentation-shell'); }
  function deck(){ return shell()?.querySelector('.deep-deck'); }
  function slide(){ return shell()?.querySelector('.deep-slide'); }
  function active(){ return !!shell() && !shell().hidden && document.body.classList.contains('lesson-presentation-primary'); }
  function isTyping(target){ return !!target?.closest?.('input,textarea,select,[contenteditable="true"]'); }
  function isAnswerSlide(){ return ['answer','markscheme'].includes(slide()?.dataset.layout || ''); }

  function button(label,attr,title=''){
    return `<button type="button" ${attr} title="${title || label}">${label}</button>`;
  }

  function ensureUI(){
    const d=deck();
    if(!d || dock?.isConnected) return;

    dock=document.createElement('div');
    dock.className='presentation-control-dock';
    dock.setAttribute('role','toolbar');
    dock.setAttribute('aria-label','Teacher presentation controls');
    dock.innerHTML=`
      ${button('Reveal','data-p4-reveal','Reveal or hide answer / mark scheme (R)')}
      ${button('05:00','data-p4-timer','Classroom timer (T)')}
      <span class="p4-separator" aria-hidden="true"></span>
      ${button('Pointer','data-p4-pointer','Laser pointer (P)')}
      ${button('Pen','data-p4-pen','Draw on slide (D)')}
      ${button('Highlight','data-p4-highlight','Highlight on slide (H)')}
      ${button('Clear','data-p4-clear','Clear annotations (C)')}
      <span class="p4-separator" aria-hidden="true"></span>
      ${button('−','data-p4-zoom-out','Zoom out (-)')}
      <button type="button" data-p4-zoom-reset title="Reset zoom (0)"><span data-p4-zoom-label>100%</span></button>
      ${button('+','data-p4-zoom-in','Zoom in (+)')}
      <span class="p4-separator" aria-hidden="true"></span>
      ${button('Blank','data-p4-blank','Blank screen (B)')}
      ${button('Notes','data-p4-notes','Open lesson notes (N)')}
      ${button('Full screen','data-p4-fullscreen','Full screen (F)')}
      ${button('?','data-p4-shortcuts','Keyboard shortcuts')}
      <div class="p4-timer-panel" data-p4-timer-panel hidden>
        <strong>Classroom timer</strong>
        <div class="p4-timer-readout" data-p4-timer-readout>05:00</div>
        <div class="p4-timer-presets" role="group" aria-label="Timer presets">
          <button type="button" data-p4-minutes="1">1 min</button>
          <button type="button" data-p4-minutes="3">3 min</button>
          <button type="button" data-p4-minutes="5">5 min</button>
          <button type="button" data-p4-minutes="10">10 min</button>
        </div>
        <div class="p4-timer-actions">
          <button type="button" class="primary" data-p4-timer-start>Start</button>
          <button type="button" data-p4-timer-reset>Reset</button>
        </div>
      </div>
      <div class="p4-shortcuts-panel" data-p4-shortcuts-panel hidden>
        <strong>Presenter shortcuts</strong>
        <span><kbd>←</kbd><kbd>→</kbd> slides</span>
        <span><kbd>R</kbd> reveal answer</span>
        <span><kbd>T</kbd> timer</span>
        <span><kbd>P</kbd> pointer</span>
        <span><kbd>D</kbd> pen</span>
        <span><kbd>H</kbd> highlighter</span>
        <span><kbd>C</kbd> clear ink</span>
        <span><kbd>B</kbd> blank screen</span>
        <span><kbd>N</kbd> lesson notes</span>
        <span><kbd>F</kbd> full screen</span>
        <span><kbd>+</kbd><kbd>−</kbd> zoom</span>
      </div>`;
    d.appendChild(dock);
    timerPanel=$('[data-p4-timer-panel]',dock);
    shortcutsPanel=$('[data-p4-shortcuts-panel]',dock);

    ink=document.createElement('canvas');
    ink.className='presentation-ink-layer';
    ink.setAttribute('aria-hidden','true');
    d.appendChild(ink);
    ctx=ink.getContext('2d');

    laser=document.createElement('div');
    laser.className='presentation-laser';
    laser.setAttribute('aria-hidden','true');
    d.appendChild(laser);

    blank=document.createElement('div');
    blank.className='presentation-blank-screen';
    blank.hidden=true;
    blank.innerHTML='<div><strong>Screen blank</strong><span>Press B or Blank to return to the slide</span></div>';
    d.appendChild(blank);

    wireDock();
    wireInk();
    wirePointer();
    observeSlides();
    refreshForSlide(true);
    repositionLayers();
    scheduleDockHide();
  }

  function wireDock(){
    dock.addEventListener('click',event=>{
      const target=event.target.closest('button');
      if(!target) return;
      wakeDock();

      if(target.matches('[data-p4-reveal]')) toggleAnswer();
      else if(target.matches('[data-p4-timer]')) toggleTimerPanel();
      else if(target.matches('[data-p4-pointer]')) setTool(tool==='pointer'?'none':'pointer');
      else if(target.matches('[data-p4-pen]')) setTool(tool==='pen'?'none':'pen');
      else if(target.matches('[data-p4-highlight]')) setTool(tool==='highlight'?'none':'highlight');
      else if(target.matches('[data-p4-clear]')) clearInk();
      else if(target.matches('[data-p4-zoom-out]')) setZoom(zoom-.125);
      else if(target.matches('[data-p4-zoom-reset]')) setZoom(1);
      else if(target.matches('[data-p4-zoom-in]')) setZoom(zoom+.125);
      else if(target.matches('[data-p4-blank]')) toggleBlank();
      else if(target.matches('[data-p4-notes]')) window.ALEVEL_PRIMARY_PRESENTATION?.notes?.();
      else if(target.matches('[data-p4-fullscreen]')) shell()?.querySelector('[data-presentation-fullscreen]')?.click();
      else if(target.matches('[data-p4-shortcuts]')) toggleShortcuts();
      else if(target.matches('[data-p4-minutes]')) setTimerPreset(Number(target.dataset.p4Minutes)*60);
      else if(target.matches('[data-p4-timer-start]')) toggleTimer();
      else if(target.matches('[data-p4-timer-reset]')) resetTimer();
    });

    dock.addEventListener('pointerenter',()=>{
      window.clearTimeout(idleTimer);
      dock.classList.remove('p4-idle');
    });
    dock.addEventListener('pointerleave',scheduleDockHide);
  }

  function observeSlides(){
    observer?.disconnect();
    const s=shell();
    if(!s) return;
    observer=new MutationObserver(()=>window.requestAnimationFrame(()=>refreshForSlide(false)));
    observer.observe(s,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-layout']});
  }

  function slideKey(){
    const s=shell();
    const count=s?.querySelector('[data-deep-count]')?.textContent || '';
    const current=slide();
    return `${count}|${current?.dataset.layout || ''}|${current?.querySelector('h1,h2')?.textContent || ''}`;
  }

  function refreshForSlide(force=false){
    if(!dock?.isConnected) return;
    const key=slideKey();
    if(!force && key===lastSlideKey){
      repositionLayers();
      return;
    }
    lastSlideKey=key;
    setTool('none');
    clearInk();
    setZoom(1);
    if(blanked) toggleBlank(false);
    answerHidden=isAnswerSlide();
    applyAnswerState();
    repositionLayers();
    wakeDock();
  }

  function applyAnswerState(){
    const s=slide(), reveal=$('[data-p4-reveal]',dock);
    if(!s || !reveal) return;
    const eligible=isAnswerSlide();
    reveal.disabled=!eligible;
    reveal.setAttribute('aria-disabled',String(!eligible));
    if(!eligible){
      s.classList.remove('p4-answer-hidden');
      reveal.textContent='Reveal';
      reveal.classList.remove('active');
      return;
    }
    s.classList.toggle('p4-answer-hidden',answerHidden);
    reveal.textContent=answerHidden?'Reveal answer':'Hide answer';
    reveal.classList.toggle('active',!answerHidden);
  }

  function toggleAnswer(){
    if(!isAnswerSlide()) return;
    answerHidden=!answerHidden;
    applyAnswerState();
  }

  function setTool(next){
    tool=next;
    if(!dock) return;
    ['pointer','pen','highlight'].forEach(name=>{
      $('[data-p4-'+name+']',dock)?.classList.toggle('active',tool===name);
    });
    if(ink) ink.style.pointerEvents=(tool==='pen'||tool==='highlight')?'auto':'none';
    if(laser && tool!=='pointer') laser.classList.remove('visible');
    slide()?.classList.toggle('p4-drawing',tool==='pen'||tool==='highlight');
    slide()?.classList.toggle('p4-pointing',tool==='pointer');
  }

  function resizeCanvas(){
    if(!ink || !ctx) return;
    const rect=ink.getBoundingClientRect();
    if(rect.width<2 || rect.height<2) return;
    const dpr=Math.min(window.devicePixelRatio || 1,2);
    const width=Math.round(rect.width*dpr), height=Math.round(rect.height*dpr);
    if(ink.width===width && ink.height===height) return;
    ink.width=width; ink.height=height;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.lineCap='round'; ctx.lineJoin='round';
  }

  function wireInk(){
    ink.addEventListener('pointerdown',event=>{
      if(tool!=='pen' && tool!=='highlight') return;
      drawing=true;
      ink.setPointerCapture?.(event.pointerId);
      lastPoint=inkPoint(event);
      drawDot(lastPoint);
      event.preventDefault();
    });
    ink.addEventListener('pointermove',event=>{
      if(!drawing || !lastPoint) return;
      const point=inkPoint(event);
      drawLine(lastPoint,point);
      lastPoint=point;
      event.preventDefault();
    });
    const end=()=>{drawing=false;lastPoint=null;};
    ink.addEventListener('pointerup',end);
    ink.addEventListener('pointercancel',end);
    ink.addEventListener('pointerleave',event=>{if(event.buttons===0) end();});
  }

  function inkPoint(event){
    const rect=ink.getBoundingClientRect();
    return {x:event.clientX-rect.left,y:event.clientY-rect.top};
  }

  function configureInk(){
    if(!ctx) return;
    if(tool==='highlight'){
      ctx.strokeStyle='rgba(250, 204, 21, .38)';
      ctx.fillStyle='rgba(250, 204, 21, .38)';
      ctx.lineWidth=20;
    }else{
      ctx.strokeStyle='rgba(220, 38, 38, .94)';
      ctx.fillStyle='rgba(220, 38, 38, .94)';
      ctx.lineWidth=4;
    }
    ctx.lineCap='round'; ctx.lineJoin='round';
  }

  function drawLine(a,b){
    configureInk();
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  function drawDot(point){
    configureInk();
    ctx.beginPath();ctx.arc(point.x,point.y,Math.max(2,ctx.lineWidth/2),0,Math.PI*2);ctx.fill();
  }
  function clearInk(){
    if(!ctx || !ink) return;
    ctx.clearRect(0,0,ink.width,ink.height);
  }

  function wirePointer(){
    const d=deck();
    if(!d) return;
    d.addEventListener('pointermove',event=>{
      if(!active()) return;
      wakeDock();
      if(tool!=='pointer' || !laser) return;
      const s=slide(); if(!s) return;
      const r=s.getBoundingClientRect();
      const inside=event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;
      if(!inside){laser.classList.remove('visible');return;}
      const dr=d.getBoundingClientRect();
      laser.style.left=`${event.clientX-dr.left}px`;
      laser.style.top=`${event.clientY-dr.top}px`;
      laser.classList.add('visible');
    },{passive:true});
    d.addEventListener('pointerleave',()=>laser?.classList.remove('visible'));
  }

  function repositionLayers(){
    const d=deck(), s=slide();
    if(!d || !s || !ink || !blank) return;
    const dr=d.getBoundingClientRect(), sr=s.getBoundingClientRect();
    const style={left:sr.left-dr.left,top:sr.top-dr.top,width:sr.width,height:sr.height};
    [ink,blank].forEach(layer=>{
      layer.style.left=`${style.left}px`;
      layer.style.top=`${style.top}px`;
      layer.style.width=`${style.width}px`;
      layer.style.height=`${style.height}px`;
    });
    resizeCanvas();
  }

  function setZoom(value){
    zoom=clamp(Math.round(value*8)/8,1,1.5);
    const s=slide();
    if(s) s.style.setProperty('--p4-zoom',String(zoom));
    const label=$('[data-p4-zoom-label]',dock);
    if(label) label.textContent=`${Math.round(zoom*100)}%`;
    window.requestAnimationFrame(repositionLayers);
  }

  function toggleBlank(force){
    blanked=typeof force==='boolean'?force:!blanked;
    if(blank){blank.hidden=!blanked; blank.classList.toggle('active',blanked);}
    $('[data-p4-blank]',dock)?.classList.toggle('active',blanked);
    if(blanked) setTool('none');
  }

  function formatTime(seconds){
    const s=Math.max(0,Math.ceil(seconds));
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  }

  function updateTimerUI(){
    const text=formatTime(timerRemaining);
    const btn=$('[data-p4-timer]',dock), readout=$('[data-p4-timer-readout]',dock), start=$('[data-p4-timer-start]',dock);
    if(btn) btn.textContent=text;
    if(readout) readout.textContent=text;
    if(start) start.textContent=timerRunning?'Pause':(timerRemaining<=0?'Restart':'Start');
    dock?.classList.toggle('p4-timer-running',timerRunning);
    dock?.classList.toggle('p4-timer-finished',timerRemaining<=0);
  }

  function setTimerPreset(seconds){
    pauseTimer();
    timerPreset=seconds;
    timerRemaining=seconds;
    updateTimerUI();
  }

  function toggleTimer(){
    if(timerRunning){ pauseTimer(); return; }
    if(timerRemaining<=0) timerRemaining=timerPreset;
    timerRunning=true;
    timerEndsAt=Date.now()+timerRemaining*1000;
    timerInterval=window.setInterval(tickTimer,200);
    updateTimerUI();
  }

  function tickTimer(){
    timerRemaining=Math.max(0,(timerEndsAt-Date.now())/1000);
    if(timerRemaining<=0){
      timerRemaining=0;
      pauseTimer(false);
      timerChime();
    }
    updateTimerUI();
  }

  function pauseTimer(update=true){
    if(timerRunning) timerRemaining=Math.max(0,(timerEndsAt-Date.now())/1000);
    timerRunning=false;
    window.clearInterval(timerInterval);
    timerInterval=null;
    if(update) updateTimerUI();
  }

  function resetTimer(){
    pauseTimer(false);
    timerRemaining=timerPreset;
    updateTimerUI();
  }

  function timerChime(){
    try{
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext) return;
      const audio=new AudioContext();
      const now=audio.currentTime;
      [660,880].forEach((freq,index)=>{
        const osc=audio.createOscillator(), gain=audio.createGain();
        osc.frequency.value=freq; gain.gain.setValueAtTime(.0001,now+index*.16);
        gain.gain.exponentialRampToValueAtTime(.08,now+index*.16+.02);
        gain.gain.exponentialRampToValueAtTime(.0001,now+index*.16+.14);
        osc.connect(gain);gain.connect(audio.destination);osc.start(now+index*.16);osc.stop(now+index*.16+.16);
      });
      window.setTimeout(()=>audio.close?.(),700);
    }catch{}
  }

  function toggleTimerPanel(force){
    if(!timerPanel) return;
    const show=typeof force==='boolean'?force:timerPanel.hidden;
    timerPanel.hidden=!show;
    if(show && shortcutsPanel) shortcutsPanel.hidden=true;
  }

  function toggleShortcuts(force){
    if(!shortcutsPanel) return;
    const show=typeof force==='boolean'?force:shortcutsPanel.hidden;
    shortcutsPanel.hidden=!show;
    if(show && timerPanel) timerPanel.hidden=true;
  }

  function wakeDock(){
    if(!dock) return;
    dock.classList.remove('p4-idle');
    scheduleDockHide();
  }

  function scheduleDockHide(){
    window.clearTimeout(idleTimer);
    idleTimer=window.setTimeout(()=>{
      if(!dock?.matches(':hover') && timerPanel?.hidden!==false && shortcutsPanel?.hidden!==false && tool==='none') dock?.classList.add('p4-idle');
    },3200);
  }

  function keyboard(event){
    if(!active() || isTyping(event.target)) return;
    const key=event.key;
    let handled=true;
    if(key==='r'||key==='R') toggleAnswer();
    else if(key==='t'||key==='T') toggleTimerPanel();
    else if(key==='p'||key==='P') setTool(tool==='pointer'?'none':'pointer');
    else if(key==='d'||key==='D') setTool(tool==='pen'?'none':'pen');
    else if(key==='h'||key==='H') setTool(tool==='highlight'?'none':'highlight');
    else if(key==='c'||key==='C') clearInk();
    else if(key==='b'||key==='B') toggleBlank();
    else if(key==='n'||key==='N') window.ALEVEL_PRIMARY_PRESENTATION?.notes?.();
    else if(key==='f'||key==='F') shell()?.querySelector('[data-presentation-fullscreen]')?.click();
    else if(key==='+'||key==='=') setZoom(zoom+.125);
    else if(key==='-'||key==='_') setZoom(zoom-.125);
    else if(key==='0') setZoom(1);
    else if(key==='?') toggleShortcuts();
    else handled=false;
    if(handled){event.preventDefault();event.stopImmediatePropagation();wakeDock();}
  }

  function syncFullscreen(){
    const btn=$('[data-p4-fullscreen]',dock);
    if(btn) btn.textContent=document.fullscreenElement?'Exit full screen':'Full screen';
    window.requestAnimationFrame(repositionLayers);
  }

  function start(){
    if(!shell()){
      window.setTimeout(start,80);
      return;
    }
    ensureUI();
  }

  document.addEventListener('keydown',keyboard,true);
  document.addEventListener('fullscreenchange',syncFullscreen);
  window.addEventListener('resize',()=>window.requestAnimationFrame(repositionLayers),{passive:true});
  window.addEventListener('alevel:lesson-selected',()=>window.setTimeout(()=>{ensureUI();refreshForSlide(true);},120));

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.ALEVEL_PRESENTATION_CONTROLS={
    clear:clearInk,
    timer:{start:toggleTimer,reset:resetTimer},
    blank:toggleBlank,
    setTool,
    setZoom
  };
})();