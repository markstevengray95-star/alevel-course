(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = value => String(value ?? '').replace(/\s+/g,' ').trim();
  let observer=null, lastKey='';

  function shell(){ return document.querySelector('.lesson-presentation-shell'); }
  function slide(){ return shell()?.querySelector('.deep-slide'); }
  function activeId(){ return window.ALEVEL_DEEPENING?.activeLessonId || window.ALEVEL_PRIMARY_PRESENTATION?.activeLessonId || window.ALEVEL_ACTIVE_LESSON?.id || null; }
  function profile(){ const id=activeId(); return id ? window.ALEVEL_PHASE3?.profile?.(id) : null; }
  function slideNumber(){ const m=(shell()?.querySelector('[data-deep-count]')?.textContent || '').match(/(\d+)\s*\/\s*(\d+)/); return m ? Number(m[1]) : 0; }

  function visualType(p){
    if(!p) return 'graph';
    if(p.type==='practical') return 'apparatus';
    const text=`${p.title} ${p.focus} ${p.topicTitle} ${p.concept?.key}`.toLowerCase();
    if(/refraction|critical angle|optical|snell|ray/.test(text)) return 'ray';
    if(/projectile/.test(text)) return 'projectile';
    if(/newton|force|momentum|impulse|moment|equilibrium|vector/.test(text)) return 'force';
    if(/circuit|current|resistance|resistivity|emf|potential divider|ohm/.test(text)) return 'circuit';
    if(/wave|diffraction|interference|stationary|harmonic|phase|polarisation/.test(text)) return 'wave';
    if(/field|coulomb|gravitational|electric potential|magnetic|induction|capacitor/.test(text)) return 'field';
    if(/radioactive|decay|nuclear|binding|fission|fusion|rutherford|alpha|beta|gamma/.test(text)) return 'nuclear';
    if(/particle|quark|lepton|hadron|photoelectric|photon|antiparticle|de broglie|energy level/.test(text)) return 'particle';
    if(/gas|thermal|temperature|shm|oscillat|kinetic theory/.test(text)) return 'thermal';
    return 'graph';
  }

  const svgStart = label => `<svg class="p6-svg" viewBox="0 0 560 320" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="p6-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" class="p6-arrowhead"/></marker><filter id="p6-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  const svgEnd='</svg>';

  function graphSvg(label){return `${svgStart(label)}
    <path class="p6-axis" d="M78 252H498M78 252V54" marker-end="url(#p6-arrow)"/>
    <path class="p6-grid" d="M78 202H498M78 152H498M78 102H498M178 252V54M278 252V54M378 252V54"/>
    <path class="p6-curve" d="M94 229 C160 216 190 203 240 178 S332 124 400 92 S455 72 486 68"/>
    <g class="p6-points"><circle cx="118" cy="222" r="6"/><circle cx="185" cy="200" r="6"/><circle cx="250" cy="172" r="6"/><circle cx="318" cy="139" r="6"/><circle cx="390" cy="102" r="6"/><circle cx="457" cy="76" r="6"/></g>
    <path class="p6-error" d="M185 182V218M175 182H195M175 218H195M390 84V120M380 84H400M380 120H400"/>
    <text class="p6-label" x="468" y="282">x</text><text class="p6-label" x="50" y="68">y</text><text class="p6-small" x="306" y="113">trend / model</text>${svgEnd}`;}

  function forceSvg(label){return `${svgStart(label)}
    <path class="p6-ground" d="M48 242H514"/><rect class="p6-object" x="214" y="154" width="132" height="82" rx="14"/><circle class="p6-wheel" cx="242" cy="244" r="15"/><circle class="p6-wheel" cx="320" cy="244" r="15"/>
    <path class="p6-force p6-force-main" d="M346 190H476" marker-end="url(#p6-arrow)"/><text class="p6-label" x="382" y="173">driving force</text>
    <path class="p6-force" d="M214 210H95" marker-end="url(#p6-arrow)"/><text class="p6-label" x="98" y="194">resistance</text>
    <path class="p6-force" d="M280 154V72" marker-end="url(#p6-arrow)"/><text class="p6-label" x="296" y="88">normal</text>
    <path class="p6-force" d="M280 236V294" marker-end="url(#p6-arrow)"/><text class="p6-label" x="296" y="286">weight</text><text class="p6-small" x="224" y="203">ΣF = ma</text>${svgEnd}`;}

  function projectileSvg(label){return `${svgStart(label)}
    <path class="p6-axis" d="M62 252H510M62 252V58"/><path class="p6-trajectory" d="M92 236 Q274 28 482 236"/>
    <circle class="p6-projectile" cx="92" cy="236" r="11"/><path class="p6-force" d="M92 236L172 178" marker-end="url(#p6-arrow)"/><text class="p6-label" x="154" y="162">u</text>
    <path class="p6-force" d="M306 104V190" marker-end="url(#p6-arrow)"/><text class="p6-label" x="318" y="154">g</text>
    <path class="p6-dashed" d="M92 236H482"/><text class="p6-small" x="192" y="276">horizontal velocity constant</text><text class="p6-small" x="318" y="82">vertical acceleration = g</text>${svgEnd}`;}

  function circuitSvg(label){return `${svgStart(label)}
    <path class="p6-wire" d="M90 84H466V236H90Z"/><path class="p6-battery" d="M90 142H66M90 177H52"/><text class="p6-label" x="42" y="122">cell</text>
    <rect class="p6-component" x="230" y="65" width="102" height="38" rx="8"/><text class="p6-label" x="252" y="91">resistor</text>
    <circle class="p6-meter" cx="466" cy="160" r="29"/><text class="p6-label" x="457" y="167">A</text>
    <g class="p6-charge"><circle cx="130" cy="84" r="6"/><circle cx="190" cy="84" r="6"/><circle cx="365" cy="84" r="6"/><circle cx="466" cy="112" r="6"/><circle cx="410" cy="236" r="6"/><circle cx="300" cy="236" r="6"/></g>
    <path class="p6-force" d="M150 122H214" marker-end="url(#p6-arrow)"/><text class="p6-small" x="154" y="142">conventional current</text><text class="p6-small" x="194" y="286">Q = It   ·   V = W/Q   ·   R = V/I</text>${svgEnd}`;}

  function waveSvg(label){return `${svgStart(label)}
    <path class="p6-midline" d="M48 166H512"/><path class="p6-wave" d="M48 166 C86 86 124 86 162 166 S238 246 276 166 S352 86 390 166 S466 246 504 166"/>
    <path class="p6-dashed" d="M86 90V242M238 90V242"/><path class="p6-force" d="M86 270H238" marker-start="url(#p6-arrow)" marker-end="url(#p6-arrow)"/><text class="p6-label" x="152" y="297">λ</text>
    <path class="p6-force" d="M390 166V92" marker-end="url(#p6-arrow)"/><text class="p6-label" x="405" y="118">A</text><circle class="p6-wave-dot" cx="276" cy="166" r="10"/><text class="p6-small" x="340" y="286">v = fλ</text>${svgEnd}`;}

  function raySvg(label){return `${svgStart(label)}
    <rect class="p6-medium" x="50" y="166" width="460" height="112" rx="8"/><path class="p6-normal" d="M280 44V286"/><path class="p6-ray" d="M96 62L280 166" marker-end="url(#p6-arrow)"/><path class="p6-ray p6-ray-two" d="M280 166L378 266" marker-end="url(#p6-arrow)"/>
    <path class="p6-angle" d="M250 149 A36 36 0 0 1 260 126"/><path class="p6-angle" d="M296 188 A38 38 0 0 1 306 176"/>
    <text class="p6-label" x="205" y="110">θ₁</text><text class="p6-label" x="318" y="214">θ₂</text><text class="p6-small" x="74" y="194">higher refractive index</text><text class="p6-small" x="338" y="82">angles measured from normal</text>${svgEnd}`;}

  function fieldSvg(label){return `${svgStart(label)}
    <circle class="p6-source" cx="280" cy="160" r="35"/><text class="p6-source-label" x="269" y="169">+</text>
    <g class="p6-field-lines"><path d="M280 118V48" marker-end="url(#p6-arrow)"/><path d="M280 202V274" marker-end="url(#p6-arrow)"/><path d="M238 160H76" marker-end="url(#p6-arrow)"/><path d="M322 160H486" marker-end="url(#p6-arrow)"/><path d="M250 130L142 42" marker-end="url(#p6-arrow)"/><path d="M310 130L418 42" marker-end="url(#p6-arrow)"/><path d="M250 190L142 278" marker-end="url(#p6-arrow)"/><path d="M310 190L418 278" marker-end="url(#p6-arrow)"/></g>
    <circle class="p6-equipotential" cx="280" cy="160" r="82"/><circle class="p6-equipotential" cx="280" cy="160" r="126"/><text class="p6-small" x="358" y="150">field direction</text><text class="p6-small" x="350" y="234">equipotential</text>${svgEnd}`;}

  function nuclearSvg(label){return `${svgStart(label)}
    <g class="p6-nucleus"><circle cx="246" cy="152" r="31"/><circle cx="282" cy="138" r="31"/><circle cx="302" cy="171" r="31"/><circle cx="262" cy="187" r="31"/><circle cx="224" cy="185" r="31"/></g>
    <path class="p6-radiation p6-alpha" d="M330 154C380 126 420 110 486 98" marker-end="url(#p6-arrow)"/><text class="p6-label" x="421" y="86">α</text>
    <path class="p6-radiation p6-beta" d="M324 180C387 190 427 210 486 238" marker-end="url(#p6-arrow)"/><text class="p6-label" x="430" y="252">β</text>
    <path class="p6-gamma" d="M314 132 q18 -22 36 0t36 0t36 0t36 0"/><text class="p6-label" x="454" y="130">γ</text><text class="p6-small" x="70" y="284">conserve nucleon number, proton number and charge</text>${svgEnd}`;}

  function particleSvg(label){return `${svgStart(label)}
    <path class="p6-particle-line" d="M78 250L234 166L78 82"/><path class="p6-particle-line" d="M482 250L326 166L482 82"/><path class="p6-boson" d="M234 166 q12 -20 24 0t24 0t24 0t20 0"/>
    <circle class="p6-particle" cx="78" cy="82" r="10"/><circle class="p6-particle" cx="78" cy="250" r="10"/><circle class="p6-particle" cx="482" cy="82" r="10"/><circle class="p6-particle" cx="482" cy="250" r="10"/>
    <text class="p6-small" x="56" y="54">incoming</text><text class="p6-small" x="438" y="54">outgoing</text><text class="p6-label" x="246" y="137">interaction</text><text class="p6-small" x="174" y="292">check charge · baryon · lepton · energy · momentum</text>${svgEnd}`;}

  function thermalSvg(label){return `${svgStart(label)}
    <rect class="p6-container" x="92" y="64" width="376" height="198" rx="20"/>
    <g class="p6-gas"><circle cx="146" cy="108" r="8"/><circle cx="214" cy="212" r="8"/><circle cx="272" cy="126" r="8"/><circle cx="346" cy="214" r="8"/><circle cx="414" cy="116" r="8"/><circle cx="390" cy="168" r="8"/><circle cx="186" cy="158" r="8"/></g>
    <g class="p6-velocity"><path d="M146 108l36 -20" marker-end="url(#p6-arrow)"/><path d="M272 126l-30 -30" marker-end="url(#p6-arrow)"/><path d="M390 168l42 15" marker-end="url(#p6-arrow)"/></g>
    <text class="p6-label" x="182" y="45">random molecular motion</text><text class="p6-small" x="155" y="294">collisions with walls produce pressure</text>${svgEnd}`;}

  function apparatusSvg(label){return `${svgStart(label)}
    <path class="p6-stand" d="M90 270H260M174 270V56M174 92H332"/><rect class="p6-sensor" x="322" y="72" width="82" height="42" rx="8"/><text class="p6-small" x="340" y="98">sensor</text>
    <rect class="p6-block" x="254" y="198" width="136" height="60" rx="10"/><path class="p6-measure" d="M242 180H410"/><path class="p6-ticks" d="M252 172v16M272 176v8M292 172v16M312 176v8M332 172v16M352 176v8M372 172v16M392 176v8"/>
    <path class="p6-cable" d="M404 94C470 108 482 162 442 206"/><rect class="p6-display" x="404" y="202" width="102" height="58" rx="8"/><text class="p6-label" x="424" y="237">data</text><text class="p6-small" x="88" y="304">measure → repeat → graph → uncertainty → evaluate</text>${svgEnd}`;}

  function visualSvg(type,label){
    return ({circuit:circuitSvg,wave:waveSvg,ray:raySvg,projectile:projectileSvg,force:forceSvg,field:fieldSvg,nuclear:nuclearSvg,particle:particleSvg,thermal:thermalSvg,apparatus:apparatusSvg,graph:graphSvg}[type] || graphSvg)(label);
  }

  function visualMeta(type){
    return ({
      circuit:['Circuit model','Track charge flow, potential difference and energy transfer.'],
      wave:['Wave model','Connect the shape to amplitude, wavelength, phase and wave speed.'],
      ray:['Ray model','Use the normal, angles and refractive-index change to predict the path.'],
      projectile:['Motion model','Separate horizontal and vertical motion before calculating.'],
      force:['Force model','Identify real forces first, then use the resultant.'],
      field:['Field model','Use direction, spacing and potential before substituting values.'],
      nuclear:['Nuclear model','Track what changes and what must be conserved.'],
      particle:['Interaction model','Follow particles through the interaction and audit conservation laws.'],
      thermal:['Particle model','Link microscopic motion and collisions to macroscopic measurements.'],
      apparatus:['Practical setup','Use the apparatus to identify variables, measurements and uncertainty.'],
      graph:['Evidence model','Read axes, trend, gradient/intercept and uncertainty before concluding.']
    })[type] || ['Physics model','Use the visual representation alongside the governing equation.'];
  }

  function simulationAvailable(p){
    try{return !!window.ALEVEL_SIMULATIONS?.modelFor?.(p);}catch{return false;}
  }

  function openSimulation(p){
    if(!p) return;
    window.ALEVEL_PRIMARY_PRESENTATION?.notes?.();
    window.setTimeout(()=>{
      try{ window.ALEVEL_SIMULATIONS?.render?.(p); }catch{}
      document.querySelector('.simulation-lab, .lesson-simulation, [data-simulation]')?.scrollIntoView?.({behavior:'smooth',block:'center'});
    },120);
  }

  function decorate(){
    const node=slide(), p=profile();
    if(!node || !p) return;
    const layout=node.dataset.layout || '';
    const allowed=new Set(['teach','worked','application','stretch']);
    node.querySelector('.p6-visual-card')?.remove();
    node.classList.remove('p6-visualised');
    if(!allowed.has(layout)) return;

    const key=`${activeId()}|${slideNumber()}|${layout}|${node.querySelector('h1,h2')?.textContent||''}`;
    if(key===lastKey && node.querySelector('.p6-visual-card')) return;
    lastKey=key;

    const type=visualType(p), [title,caption]=visualMeta(type);
    const eq=clean(p.primaryEquation?.[1] || p.equations?.[0]?.[1] || p.concept?.model || '');
    const figure=document.createElement('figure');
    figure.className=`presentation-visual p6-visual-card p6-${type}`;
    figure.dataset.p5Reveal='model';
    figure.innerHTML=`<div class="p6-visual-stage">${visualSvg(type,`${title} for ${p.title}`)}</div><figcaption><span><strong>${esc(title)}</strong><small>${esc(caption)}</small></span>${eq?`<code>${esc(eq)}</code>`:''}</figcaption>${simulationAvailable(p)?'<button type="button" class="p6-sim-launch" data-p6-sim>Open interactive model</button>':''}`;

    const list=node.querySelector('ul,ol');
    if(list) node.insertBefore(figure,list); else node.appendChild(figure);
    node.classList.add('p6-visualised');
    window.ALEVEL_PROGRESSIVE_REVEAL?.refresh?.();
  }

  function observe(){
    observer?.disconnect();
    const s=shell(); if(!s) return;
    observer=new MutationObserver(mutations=>{
      const meaningful=mutations.some(m=>m.type==='childList' || (m.type==='attributes' && m.attributeName==='data-layout'));
      if(meaningful) window.setTimeout(decorate,0);
    });
    observer.observe(s,{subtree:true,childList:true,attributes:true,attributeFilter:['data-layout']});
    decorate();
  }

  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('[data-p6-sim]');
    if(!btn) return;
    event.preventDefault();event.stopPropagation();
    openSimulation(profile());
  },true);

  window.addEventListener('alevel:lesson-selected',()=>window.setTimeout(()=>{lastKey='';observe();},180));

  function start(){
    if(!shell()){window.setTimeout(start,80);return;}
    observe();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();

  window.ALEVEL_PRESENTATION_VISUALS={refresh:decorate,typeFor:visualType};
})();