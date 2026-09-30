(()=>{
  'use strict';

  let observer=null;
  let applying=false;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const state=()=>window.CourseTextbook?.getState?.()||{};
  const current=()=>{const s=state(),data=window.CourseTextbook?.data||{};const topic=data[s.topicId];return{s,topic,chapter:topic?.chapters?.[s.chapterIndex],index:Number(s.chapterIndex)||0};};
  const sourceFor=chapter=>[chapter?.title,chapter?.summary,...(chapter?.sections||[]).flat(),...(chapter?.equations||[]).flat(),chapter?.examTip].filter(Boolean).join(' ').toLowerCase();
  const words=value=>String(value||'').toLowerCase().replace(/[^a-z0-9α-ωλφρσεμνπτθ]+/g,' ').split(/\s+/).filter(x=>x.length>3);

  const SYMBOL_LABELS={I:'current',Q:'charge',t:'time',V:'potential difference',W:'energy',R:'resistance',P:'power',E:'energy / field quantity',F:'force',m:'mass',a:'acceleration',v:'velocity / speed',u:'initial velocity',s:'displacement',p:'momentum / pressure',h:'Planck constant',f:'frequency','λ':'wavelength',c:'speed of light','ρ':'resistivity / density',L:'length',A:'area / activity','ε':'emf / strain','σ':'stress',r:'radius / resistance',C:'capacitance',B:'magnetic flux density','Φ':'magnetic flux',N:'number / turns',G:'gravitational constant',g:'field strength',T:'period / temperature','ω':'angular frequency',x:'displacement',n:'amount / refractive index','φ':'phase / work function','θ':'angle'};

  function symbols(expression){
    const found=[];Object.keys(SYMBOL_LABELS).forEach(symbol=>{const safe=symbol.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(new RegExp(`(^|[^A-Za-z])${safe}(?=[^A-Za-z]|$)`).test(String(expression||'')))found.push(symbol);});return [...new Set(found)].slice(0,6);
  }

  function graphModel(topicId,chapter){
    const src=sourceFor(chapter);
    if(topicId==='measurements')return{key:'scatter',title:'Measurement scatter explorer',caption:'See how random scatter and systematic offset affect repeated readings.',controls:[['scatter','Random scatter',0,1,.05,.35],['offset','Systematic offset',-1,1,.05,.2]],defaults:{scatter:.35,offset:.2}};
    if(topicId==='particles')return{key:'photoelectric',title:'Photoelectric threshold graph',caption:'Change work function and see how the threshold frequency moves.',controls:[['work','Work function / eV',1,5,.1,2.3]],defaults:{work:2.3}};
    if(topicId==='waves')return{key:'wave',title:'Interactive wave model',caption:'Change amplitude and wavelength and connect the picture to the wave quantities.',controls:[['amp','Amplitude',.2,1,.05,.65],['lambda','Wavelength',.6,3,.1,1.5]],defaults:{amp:.65,lambda:1.5}};
    if(topicId==='mechanics-materials'){
      if(/stress|strain|young|elastic|hooke/.test(src))return{key:'stress',title:'Stress–strain model',caption:'Change stiffness and watch the elastic gradient change.',controls:[['stiffness','Relative stiffness',.5,2,.05,1]],defaults:{stiffness:1}};
      return{key:'projectile',title:'Projectile trajectory explorer',caption:'Change launch speed and angle; horizontal and vertical motion combine to give the trajectory.',controls:[['speed','Launch speed / m s⁻¹',5,35,1,20],['angle','Launch angle / °',10,75,1,35]],defaults:{speed:20,angle:35}};
    }
    if(topicId==='electricity'){
      if(/internal resistance|emf|terminal/.test(src))return{key:'internal',title:'Terminal p.d. graph',caption:'Change emf and internal resistance; the intercept is emf and the magnitude of gradient is internal resistance.',controls:[['emf','EMF / V',2,15,.5,9],['r','Internal resistance / Ω',.2,5,.1,1.2]],defaults:{emf:9,r:1.2}};
      return{key:'ohm',title:'I–V relationship explorer',caption:'Change resistance and watch the gradient of the I–V graph change.',controls:[['R','Resistance / Ω',2,40,1,12]],defaults:{R:12}};
    }
    if(topicId==='further-mechanics'){
      if(/gas|thermal|temperature|boyle|ideal/.test(src))return{key:'gas',title:'Ideal-gas relationship',caption:'At fixed temperature, increasing volume reduces pressure.',controls:[['temp','Temperature / K',200,600,10,300]],defaults:{temp:300}};
      return{key:'shm',title:'SHM displacement graph',caption:'Change amplitude and frequency and see how the oscillation changes.',controls:[['amp','Amplitude',.2,1,.05,.65],['freq','Frequency / Hz',.5,3,.1,1]],defaults:{amp:.65,freq:1}};
    }
    if(topicId==='fields'){
      if(/capacitor|capacitance|discharge|time constant/.test(src))return{key:'capacitor',title:'Capacitor discharge curve',caption:'Change the time constant and see how quickly voltage falls.',controls:[['tau','Time constant / s',.5,8,.25,3]],defaults:{tau:3}};
      if(/magnetic|flux|induction/.test(src))return{key:'magnetic',title:'Magnetic force and angle',caption:'Force is greatest at 90° and falls to zero when conductor and field are parallel.',controls:[['scale','BIL scale',.3,2,.1,1]],defaults:{scale:1}};
      return{key:'inverse',title:'Inverse-square field graph',caption:'Field strength falls rapidly with distance from a point or spherical source.',controls:[['scale','Source strength',.5,2,.1,1]],defaults:{scale:1}};
    }
    if(topicId==='nuclear')return{key:'decay',title:'Radioactive decay curve',caption:'Change half-life and see how equal time intervals remove equal fractions, not equal numbers.',controls:[['half','Half-life',1,8,.25,3]],defaults:{half:3}};
    return null;
  }

  function linePath(points,w=600,h=250,pad=34){
    if(!points.length)return'';const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);const xr=xmax-xmin||1,yr=ymax-ymin||1;
    return points.map((p,i)=>{const x=pad+(p[0]-xmin)/xr*(w-pad*2),y=h-pad-(p[1]-ymin)/yr*(h-pad*2);return`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`;}).join(' ');
  }
  function pointXY(points,w=600,h=250,pad=34){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),xr=xmax-xmin||1,yr=ymax-ymin||1;return points.map(p=>[pad+(p[0]-xmin)/xr*(w-pad*2),h-pad-(p[1]-ymin)/yr*(h-pad*2)]);}

  function graphData(key,v){
    if(key==='scatter'){
      const pts=Array.from({length:10},(_,i)=>[i,10+v.offset+v.scatter*Math.sin((i+1)*2.18)]);return{points:pts,scatter:true,x:'reading',y:'measured value',summary:`Mean shifted by about ${v.offset>=0?'+':''}${v.offset.toFixed(2)}; random spread ${v.scatter.toFixed(2)}.`};
    }
    if(key==='photoelectric'){
      const h=4.135667696e-15,pts=Array.from({length:80},(_,i)=>{const f=250+i*12;return[f,Math.max(0,h*f*1e12-v.work)]});const threshold=v.work/h/1e12;return{points:pts,x:'frequency / THz',y:'Ek,max / eV',summary:`Threshold frequency ≈ ${threshold.toFixed(0)} THz. Above threshold, maximum kinetic energy rises linearly.`};
    }
    if(key==='wave'){
      const pts=Array.from({length:121},(_,i)=>{const x=i/20;return[x,v.amp*Math.sin(2*Math.PI*x/v.lambda)]});return{points:pts,x:'distance',y:'displacement',summary:`Amplitude ${v.amp.toFixed(2)}; wavelength ${v.lambda.toFixed(2)}. Amplitude changes height, wavelength changes spacing.`};
    }
    if(key==='stress'){
      const pts=Array.from({length:60},(_,i)=>{const x=i/59;let y=v.stiffness*x;if(x>.62)y=v.stiffness*.62+(.35*v.stiffness)*(1-Math.exp(-(x-.62)*5));return[x,y]});return{points:pts,x:'strain',y:'stress',summary:`Initial elastic gradient scales with stiffness. The curved section represents non-linear behaviour beyond proportionality.`};
    }
    if(key==='projectile'){
      const g=9.81,rad=v.angle*Math.PI/180,ux=v.speed*Math.cos(rad),uy=v.speed*Math.sin(rad),flight=Math.max(.2,2*uy/g);const pts=Array.from({length:70},(_,i)=>{const t=flight*i/69;return[ux*t,Math.max(0,uy*t-.5*g*t*t)]});return{points:pts,x:'horizontal distance / m',y:'height / m',summary:`Range ≈ ${(ux*flight).toFixed(1)} m. Increasing angle trades horizontal speed for vertical speed.`};
    }
    if(key==='internal'){
      const pts=Array.from({length:50},(_,i)=>{const I=i/49*v.emf/v.r*.95;return[I,Math.max(0,v.emf-I*v.r)]});return{points:pts,x:'current / A',y:'terminal p.d. / V',summary:`Intercept = ${v.emf.toFixed(1)} V; gradient = −${v.r.toFixed(1)} V A⁻¹, so r = ${v.r.toFixed(1)} Ω.`};
    }
    if(key==='ohm'){
      const pts=Array.from({length:51},(_,i)=>{const V=i/50*12;return[V,V/v.R]});return{points:pts,x:'potential difference / V',y:'current / A',summary:`For an ohmic conductor, gradient I/V = 1/R. Here R = ${v.R.toFixed(0)} Ω.`};
    }
    if(key==='gas'){
      const pts=Array.from({length:80},(_,i)=>{const V=.5+i/79*5.5;return[V,v.temp/V]});return{points:pts,x:'volume',y:'pressure (relative)',summary:`At fixed amount of gas, p ∝ T/V. Raising temperature lifts the whole curve.`};
    }
    if(key==='shm'){
      const pts=Array.from({length:140},(_,i)=>{const t=i/139*4;return[t,v.amp*Math.cos(2*Math.PI*v.freq*t)]});return{points:pts,x:'time / s',y:'displacement',summary:`Period = ${(1/v.freq).toFixed(2)} s. Amplitude changes the extremes; frequency changes the number of cycles per second.`};
    }
    if(key==='capacitor'){
      const pts=Array.from({length:100},(_,i)=>{const t=i/99*15;return[t,Math.exp(-t/v.tau)]});return{points:pts,x:'time / s',y:'V / V₀',summary:`After one time constant (${v.tau.toFixed(2)} s), V/V₀ ≈ 1/e ≈ 0.37.`};
    }
    if(key==='magnetic'){
      const pts=Array.from({length:91},(_,i)=>[i,v.scale*Math.sin(i*Math.PI/180)]);return{points:pts,x:'angle / °',y:'force (relative)',summary:'The sin θ factor makes force zero at 0° and maximum at 90°.'};
    }
    if(key==='inverse'){
      const pts=Array.from({length:100},(_,i)=>{const r=.5+i/99*5.5;return[r,v.scale/(r*r)]});return{points:pts,x:'distance',y:'field strength',summary:'Doubling distance reduces an inverse-square field to one quarter of its value.'};
    }
    if(key==='decay'){
      const pts=Array.from({length:100},(_,i)=>{const t=i/99*18;return[t,Math.pow(.5,t/v.half)]});return{points:pts,x:'time',y:'N / N₀',summary:`Half-life = ${v.half.toFixed(2)} time units. After two half-lives, one quarter remains.`};
    }
    return{points:[[0,0],[1,1]],x:'x',y:'y',summary:''};
  }

  function renderGraph(block,model){
    const values={...model.defaults};
    const controls=block.querySelector('[data-tbp2-controls]'),svg=block.querySelector('svg'),summary=block.querySelector('[data-tbp2-summary]');
    controls.innerHTML=model.controls.map(([key,label,min,max,step,value])=>`<label><span>${esc(label)}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-key="${esc(key)}"><b data-value="${esc(key)}">${value}</b></label>`).join('');
    const draw=()=>{
      controls.querySelectorAll('input').forEach(input=>{values[input.dataset.key]=Number(input.value);controls.querySelector(`[data-value="${input.dataset.key}"]`).textContent=Number(input.value).toFixed(Number(input.step)<1?2:0);});
      const data=graphData(model.key,values),pts=pointXY(data.points),path=linePath(data.points);
      svg.innerHTML=`<defs><linearGradient id="tbp2Grad" x1="0" x2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".9"/><stop offset="1" stop-color="currentColor" stop-opacity=".45"/></linearGradient></defs><line class="tbp2-axis" x1="34" y1="216" x2="575" y2="216"/><line class="tbp2-axis" x1="34" y1="216" x2="34" y2="30"/><text class="tbp2-label" x="300" y="244" text-anchor="middle">${esc(data.x)}</text><text class="tbp2-label" x="13" y="125" transform="rotate(-90 13 125)" text-anchor="middle">${esc(data.y)}</text>${data.scatter?pts.map(([x,y])=>`<circle class="tbp2-point" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`).join(''):`<path class="tbp2-curve" d="${path}"/>`}<line class="tbp2-grid" x1="34" y1="70" x2="575" y2="70"/><line class="tbp2-grid" x1="34" y1="143" x2="575" y2="143"/>`;
      summary.textContent=data.summary;
    };
    controls.addEventListener('input',draw);draw();
  }

  function processSvg(topicId,chapter){
    const src=sourceFor(chapter);
    const frame=(title,caption,body)=>`<figure class="tbp2-process"><div class="tbp2-visual-kicker">Physics visual</div><svg viewBox="0 0 720 260" role="img" aria-label="${esc(title)}"><defs><marker id="tbp2Arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" class="tbp2-arrowhead"/></marker></defs>${body}</svg><figcaption><strong>${esc(title)}</strong><span>${esc(caption)}</span></figcaption></figure>`;
    const node=(x,y,t,c='')=>`<g class="tbp2-node ${c}"><rect x="${x-72}" y="${y-28}" width="144" height="56" rx="14"/><text x="${x}" y="${y+5}" text-anchor="middle">${esc(t)}</text></g>`;
    const arrow=(x1,y1,x2,y2)=>`<line class="tbp2-arrow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#tbp2Arrow)"/>`;
    if(topicId==='measurements')return frame('Measurement reasoning workflow','A reliable conclusion comes from the full chain: measure, repeat, process, quantify uncertainty, then evaluate.',`${node(100,130,'Measure')}${arrow(174,130,246,130)}${node(320,130,'Repeat')}${arrow(394,130,466,130)}${node(540,130,'Process data')}${arrow(540,160,540,205)}${node(540,225,'Uncertainty','warn')}${arrow(466,225,394,225)}${node(320,225,'Evaluate')}`);
    if(topicId==='particles')return frame('Conservation check for particle interactions','Before accepting an interaction, check conserved quantities rather than judging only by particle names.',`${node(105,90,'Initial particles')}${arrow(179,90,266,90)}${node(340,90,'Conservation')}${arrow(414,90,501,90)}${node(575,90,'Final particles')}${node(235,205,'Charge')}${node(360,205,'Baryon / lepton')}${node(505,205,'Energy + momentum')}`);
    if(topicId==='waves')return frame('From source to observed wave behaviour','Wave behaviour follows from source frequency, wavelength, boundary conditions and superposition.',`${node(100,130,'Source')}${arrow(174,130,246,130)}${node(320,130,'Wave travels')}${arrow(394,130,466,130)}${node(540,130,/stationary|harmonic/.test(src)?'Superposition':'Boundary / gap')}${arrow(540,160,540,205)}${node(540,225,/stationary|harmonic/.test(src)?'Nodes + antinodes':'Observed pattern','accent')}`);
    if(topicId==='mechanics-materials')return frame(/stress|strain|young|elastic/.test(src)?'From load to material response':'Mechanics problem-solving map',/stress|strain|young|elastic/.test(src)?'Link force and geometry to stress, extension to strain, then compare using Young modulus.':'Resolve the situation into forces and components before applying the correct motion or energy model.',`${node(100,130,/stress|strain|young|elastic/.test(src)?'Force + area':'Situation')}${arrow(174,130,246,130)}${node(320,130,/stress|strain|young|elastic/.test(src)?'Stress':'Free-body diagram')}${arrow(394,130,466,130)}${node(540,130,/stress|strain|young|elastic/.test(src)?'Strain':'Resultant force')}${arrow(540,160,540,205)}${node(540,225,/stress|strain|young|elastic/.test(src)?'Young modulus':'Motion / energy','accent')}`);
    if(topicId==='electricity')return frame('Energy and charge through a circuit','Current tracks charge flow while potential difference tracks energy transferred per unit charge.',`${node(105,130,'Source')}${arrow(179,130,266,130)}${node(340,130,'Charge flow')}${arrow(414,130,501,130)}${node(575,130,'Component')}${node(235,215,'I = Q/t')}${node(360,215,'V = W/Q')}${node(505,215,'P = IV','accent')}`);
    if(topicId==='further-mechanics')return frame(/gas|thermal|temperature/.test(src)?'Microscopic to macroscopic thermal physics':'Oscillation cause-and-effect',/gas|thermal|temperature/.test(src)?'Particle motion and collisions explain pressure, temperature and internal energy.':'A restoring effect produces acceleration toward equilibrium; this controls velocity and energy through the cycle.',`${node(100,130,/gas|thermal|temperature/.test(src)?'Particle motion':'Displacement')}${arrow(174,130,246,130)}${node(320,130,/gas|thermal|temperature/.test(src)?'Collisions':'Restoring acceleration')}${arrow(394,130,466,130)}${node(540,130,/gas|thermal|temperature/.test(src)?'Pressure':'Oscillation')}${node(540,215,/gas|thermal|temperature/.test(src)?'pV = nRT':'Energy exchange','accent')}`);
    if(topicId==='fields')return frame(/capacitor|capacitance/.test(src)?'Capacitor energy pathway':'Fields link source, space and force',/capacitor|capacitance/.test(src)?'Charge separation creates potential difference and stores energy in the electric field.':'A source creates a field; a test mass or charge placed in that field experiences force.',`${node(100,130,/capacitor|capacitance/.test(src)?'Charge separates':'Source')}${arrow(174,130,246,130)}${node(320,130,/capacitor|capacitance/.test(src)?'Electric field':'Field in space')}${arrow(394,130,466,130)}${node(540,130,/capacitor|capacitance/.test(src)?'Stored energy':'Test object')}${node(540,215,/capacitor|capacitance/.test(src)?'Discharge':'Force / potential','accent')}`);
    if(topicId==='nuclear')return frame('From unstable nucleus to measured evidence','Nuclear changes connect microscopic probability to measurable activity, energy and detector data.',`${node(100,130,'Unstable nucleus')}${arrow(174,130,246,130)}${node(320,130,'Random decay')}${arrow(394,130,466,130)}${node(540,130,'Radiation / products')}${arrow(540,160,540,205)}${node(540,225,'Detector data','accent')}`);
    return'';
  }

  function addInteractiveGraph(article,topicId,chapter){
    if(article.querySelector('.tbp2-interactive'))return;const model=graphModel(topicId,chapter);if(!model)return;
    const block=document.createElement('section');block.className='tbp2-interactive';block.innerHTML=`<div class="tbp2-interactive-head"><div><span>Interactive relationship</span><h2>${esc(model.title)}</h2><p>${esc(model.caption)}</p></div><span class="tbp2-live">LIVE</span></div><div class="tbp2-graph-grid"><div class="tbp2-graph"><svg viewBox="0 0 600 250" role="img" aria-label="${esc(model.title)}"></svg><p data-tbp2-summary></p></div><div class="tbp2-controls" data-tbp2-controls></div></div>`;
    const sections=article.querySelectorAll('.textbook-section');const anchor=sections[Math.min(1,Math.max(0,sections.length-1))]||article.querySelector('.textbook-terminology')||article.querySelector('.textbook-equations');anchor?.insertAdjacentElement('afterend',block);renderGraph(block,model);
  }

  function addProcessVisual(article,topicId,chapter){
    if(article.querySelector('.tbp2-process'))return;const html=processSvg(topicId,chapter);if(!html)return;const holder=document.createElement('div');holder.innerHTML=html;const visual=holder.firstElementChild;const sections=article.querySelectorAll('.textbook-section');const anchor=sections[Math.min(2,Math.max(0,sections.length-1))]||article.querySelector('.tbp2-interactive');anchor?.insertAdjacentElement('afterend',visual);
  }

  function enhanceEquationMaps(article,chapter){
    [...article.querySelectorAll('.textbook-equation')].forEach((card,i)=>{if(card.querySelector('.tbp2-equation-map'))return;const eq=(chapter.equations||[])[i];if(!eq)return;const syms=symbols(eq[1]);const map=document.createElement('div');map.className='tbp2-equation-map';map.innerHTML=`<span class="tbp2-map-label">Equation map</span><div class="tbp2-map-flow">${syms.slice(0,3).map(s=>`<span><code>${esc(s)}</code><small>${esc(SYMBOL_LABELS[s])}</small></span>`).join('<b>→</b>')}<b>→</b><strong>${esc(eq[1])}</strong>${syms.slice(3).map(s=>`<b>←</b><span><code>${esc(s)}</code><small>${esc(SYMBOL_LABELS[s])}</small></span>`).join('')}</div>`;card.appendChild(map);});
  }

  function bestLesson(topicId,chapter){
    const candidates=(window.ALEVEL_LESSONS||[]).filter(l=>l.topicId===topicId);if(!candidates.length)return null;const query=new Set(words(`${chapter.title} ${chapter.summary}`));let best=null,bestScore=-1;candidates.forEach(l=>{const hay=words(`${l.title} ${l.focus}`);let score=hay.reduce((n,w)=>n+(query.has(w)?2:0),0);if(String(chapter.title).toLowerCase().includes(String(l.title).toLowerCase().split(/[:–-]/)[0].trim()))score+=8;if(score>bestScore){bestScore=score;best=l;}});return best;
  }

  function addSimulationBridge(article,topicId,chapter){
    if(article.querySelector('.tbp2-sim-bridge'))return;const lesson=bestLesson(topicId,chapter);if(!lesson)return;
    const box=document.createElement('section');box.className='tbp2-sim-bridge';box.innerHTML=`<div><span>Explore the physics</span><h3>Turn this chapter into an interactive model</h3><p>Open <strong>${esc(lesson.title)}</strong> and use the matching lesson simulation to test the relationship yourself.</p></div><div><button type="button" data-tbp2-sim>Open interactive simulation →</button><button type="button" data-tbp2-topic>Open full topic</button></div>`;
    const anchor=article.querySelector('.textbook-example')||article.querySelector('.textbook-check')||article.querySelector('.textbook-chapter-actions');anchor?.insertAdjacentElement('beforebegin',box);
    box.querySelector('[data-tbp2-sim]').addEventListener('click',()=>{window.CourseTextbook?.close?.();window.ALEVEL_LESSON_CONTENT?.open?.(lesson.id);setTimeout(()=>{try{window.ALEVEL_SIMULATIONS?.render?.(window.ALEVEL_ACTIVE_LESSON);}catch{}},350);});
    box.querySelector('[data-tbp2-topic]').addEventListener('click',()=>{window.CourseTextbook?.close?.();window.CourseApp?.openTopic?.(topicId,true,0);});
  }

  function apply(){
    if(applying)return;const article=document.getElementById('textbookArticle');if(!article||!window.CourseTextbook)return;const {s,topic,chapter,index}=current();if(!topic||!chapter)return;const key=`${s.topicId}:${index}`;if(article.dataset.tbp2Key===key&&article.querySelector('.tbp2-interactive'))return;
    applying=true;try{article.dataset.tbp2Key=key;article.classList.add('tbp2-article');addInteractiveGraph(article,s.topicId,chapter);addProcessVisual(article,s.topicId,chapter);enhanceEquationMaps(article,chapter);addSimulationBridge(article,s.topicId,chapter);}finally{applying=false;}
  }
  function observe(){const article=document.getElementById('textbookArticle');if(!article)return;observer?.disconnect();observer=new MutationObserver(()=>requestAnimationFrame(apply));observer.observe(article,{childList:true,subtree:true});apply();}
  window.addEventListener('textbookchange',event=>{if(event.detail?.open)setTimeout(()=>{observe();apply();},60);});
  document.addEventListener('click',event=>{if(event.target.closest('#textbookNext,#textbookPrevious,.textbook-chapter-button,#textbookMobileChapter,#textbookTopicSelect'))setTimeout(apply,70);});
  const start=()=>{if(document.getElementById('textbookArticle'))observe();else setTimeout(start,160);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.ALEVEL_TEXTBOOK_PHASE2={refresh:apply,graphModel};
})();