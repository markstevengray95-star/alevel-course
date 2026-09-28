(()=>{
  if(window.self===window.top)return;
  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
  const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let latest=null;
  let renderTimer=0;
  let requestVersion=0;

  const TOPIC_SUPPORT={
    measurements:{
      notice:['Separate scatter from a consistent offset.','Check axis labels, units and powers of ten before reading a graph.','Use a large triangle on the best-fit line when finding a gradient.'],
      misconceptions:[['Precise measurements must also be accurate.','Precision is repeatability. A systematic error can make repeated values precise but inaccurate.'],['Repeating a measurement removes every error.','Repeats reduce the effect of random variation; they do not remove a systematic offset or calibration error.']],
      application:['Practical data','Use repeated readings, uncertainty estimates and a best-fit graph to decide whether the evidence supports the proposed relationship.','Which change to the method would reduce the dominant uncertainty most?'],
      connections:['measurement','uncertainty','evidence','conclusion'],
      simulation:['Predict how greater random scatter changes confidence in a gradient.','Observe the spread, best-fit line and uncertainty range rather than a single point.','Explain whether the evidence still supports the proposed relationship.']
    },
    particles:{
      notice:['Track charge, baryon number and lepton number separately.','For photoelectric questions, distinguish photon energy from light intensity.','At quark level, check the fractional charges sum to the observed particle charge.'],
      misconceptions:[['Greater light intensity gives each photoelectron more kinetic energy.','At fixed frequency, intensity changes the photon arrival rate. Maximum electron kinetic energy depends on photon frequency.'],['An antiparticle has a different mass from its particle.','A particle and its antiparticle have the same rest mass but opposite relevant quantum numbers such as charge.']],
      application:['Particle evidence','Use conservation laws and energy thresholds to test whether a proposed interaction can occur before doing detailed calculations.','Which conserved quantity gives the quickest way to reject an impossible reaction?'],
      connections:['particle model','conservation laws','interaction','observable evidence'],
      simulation:['Predict which quantities must remain conserved during the interaction.','Observe the before-and-after particles, energies or tracks.','Explain the event using conservation laws and the relevant interaction.']
    },
    waves:{
      notice:['Measure amplitude from the equilibrium line, not peak-to-trough.','Adjacent nodes in a stationary wave are separated by λ/2.','At a boundary, frequency stays constant while speed and wavelength may change.'],
      misconceptions:[['A stationary wave travels slowly along the medium.','A stationary pattern is formed by superposition of opposite travelling waves; the nodes remain fixed.'],['Refraction changes the frequency of a wave.','Frequency is set by the source and remains constant across a boundary; speed and wavelength change.']],
      application:['Wave evidence','Connect the pattern you observe to path difference, phase and boundary conditions rather than relying on the diagram alone.','What measurement would let you calculate the wavelength most directly?'],
      connections:['oscillation','phase relationship','superposition','observed pattern'],
      simulation:['Predict how changing frequency, wavelength or path difference should alter the pattern.','Observe nodes, fringes, ray direction or wavelength carefully.','Explain the new pattern using phase, superposition or boundary conditions.']
    },
    'mechanics-materials':{
      notice:['Draw the forces first, then find the vector resultant.','A force is needed for acceleration, not for constant velocity.','On a stress–strain graph, distinguish elastic behaviour from permanent deformation.'],
      misconceptions:[['An object moving forward must have a forward resultant force.','A non-zero resultant force changes velocity. Constant velocity requires zero resultant force.'],['Mass and weight are interchangeable.','Mass is measured in kilograms; weight is the gravitational force W = mg measured in newtons.']],
      application:['Model the system','Choose a system boundary, identify external forces and state a positive direction before writing equations.','If the same force acts for longer, which momentum quantity changes and how?'],
      connections:['system','forces / loading','response','motion or deformation'],
      simulation:['Predict the motion or deformation before changing the control.','Observe which variable changes and which stays constant.','Explain the response from the resultant force, energy transfer or material model.']
    },
    electricity:{
      notice:['Current is charge flow per second; it is not used up by a component.','Potential difference is energy transferred per coulomb.','For an emf–internal resistance graph, the intercept gives ε and the gradient magnitude gives r.'],
      misconceptions:[['Current is used up as it passes through a resistor.','Charge is conserved. In a steady series circuit the same current passes through each component.'],['EMF is a force that pushes electrons.','EMF is energy supplied by a source per unit charge, measured in volts.']],
      application:['Circuit diagnosis','Use conservation of charge and energy to decide what should stay constant and what should divide across the circuit.','How would you obtain ε and r experimentally from several terminal-p.d. and current readings?'],
      connections:['charge flow','current','energy per charge','circuit behaviour'],
      simulation:['Predict what happens to current and p.d. before changing resistance or source conditions.','Observe meter readings and how energy is shared around the circuit.','Explain the result using charge conservation and energy transfer per coulomb.']
    },
    'further-mechanics':{
      notice:['In circular motion, velocity is tangential but acceleration is toward the centre.','In SHM, acceleration is opposite to displacement and proportional to it.','Temperature and internal energy are related but are not the same quantity.'],
      misconceptions:[['Centripetal force is an extra force added to the free-body diagram.','Centripetal force is the name for the resultant inward force supplied by real forces such as tension, gravity or friction.'],['In SHM the acceleration is greatest at equilibrium.','At equilibrium displacement is zero, so acceleration is zero; its magnitude is greatest at maximum displacement.']],
      application:['Connect the model','Translate the physical setup into the correct model first: circular motion, SHM, thermal transfer or ideal-gas behaviour.','Which assumption would fail first if the real system moved away from the ideal model?'],
      connections:['physical system','ideal model','mathematical relationship','predicted behaviour'],
      simulation:['Predict the direction and relative size of acceleration, force or energy change.','Observe the motion over a full cycle or as conditions change.','Explain the pattern using the defining equation of the model.']
    },
    fields:{
      notice:['Field strength is a vector; potential is a scalar.','Inverse-square behaviour means doubling distance reduces strength to one quarter.','Induction requires a change in magnetic flux linkage, not simply the presence of a field.'],
      misconceptions:[['Zero potential always means zero field strength.','Potential is a scalar reference-dependent quantity; field strength depends on the potential gradient.'],['A magnetic field always changes a charged particle’s speed.','A magnetic force perpendicular to velocity changes direction without doing work, so speed can remain constant.']],
      application:['Field reasoning','Sketch field direction and decide whether the question concerns force, energy, potential or flux before selecting an equation.','What would the graph look like if the distance from a point source doubled repeatedly?'],
      connections:['source','field / potential','force or energy','motion / induction'],
      simulation:['Predict the direction of force, acceleration or induced emf before running the model.','Observe direction as well as magnitude when position or flux changes.','Explain the result using field direction, potential gradient or changing flux linkage.']
    },
    nuclear:{
      notice:['Individual nuclear decays are random, but a large population follows a predictable exponential law.','Half-life is constant for a given isotope under ordinary conditions.','Energy release is linked to an increase in binding energy per nucleon of the products.'],
      misconceptions:[['After two half-lives all radioactive nuclei have decayed.','Each half-life halves the expected number remaining: after two half-lives about one quarter remains.'],['Gamma emission changes the proton or neutron number.','Gamma emission removes excess nuclear energy without changing proton number or nucleon number.']],
      application:['Nuclear evidence','Use decay data, conservation laws and mass–energy changes to connect microscopic nuclear events with measurable quantities.','Which graph transformation would help test whether measured activity follows exponential decay?'],
      connections:['nuclear change','mass / stability','energy or radiation','measured signal'],
      simulation:['Predict the statistical trend or energy change before the run.','Observe population behaviour or product nuclei across many events, not one decay alone.','Explain the macroscopic pattern from random nuclear events and conservation laws.']
    }
  };

  document.documentElement.classList.add('uc-presentation-script-loaded');
  const removeOld=()=>document.querySelectorAll('.uc-slide-enrichment').forEach(el=>el.remove());
  const supportFor=data=>TOPIC_SUPPORT[data?.topicId]||TOPIC_SUPPORT.measurements;

  function termsMarkup(terms=[]){
    if(!terms.length)return '';
    return `<section class="uc-slide-enrichment uc-terms-card"><div class="uc-slide-card-head"><span>Key terminology</span><strong>Know the language</strong></div><div class="uc-term-grid">${terms.map(term=>`<details class="uc-term-item"><summary>${esc(term.label||term.key)}</summary><p>${esc(term.d||'Key term for this lesson.')}</p>${term.equation?`<code>${esc(term.equation)}</code>`:''}${term.unit?`<small>SI unit: ${esc(term.unit)}</small>`:''}${term.exam?`<em>Exam use: ${esc(term.exam)}</em>`:''}</details>`).join('')}</div></section>`;
  }

  function visualMarkup(data){
    if(!data.visual)return '';
    const notice=supportFor(data).notice||[];
    return `<section class="uc-slide-enrichment uc-visual-card">${data.visual}${notice.length?`<div class="uc-visual-guide"><span>What to notice</span><div>${notice.slice(0,3).map(item=>`<b>${esc(item)}</b>`).join('')}</div></div>`:''}</section>`;
  }

  function connectionMarkup(data){
    const nodes=supportFor(data).connections||[];
    if(nodes.length<3)return '';
    return `<section class="uc-slide-enrichment uc-concept-bridge"><div class="uc-slide-card-head"><span>Concept connection</span><strong>See the physics as a chain</strong></div><div class="uc-concept-flow">${nodes.map((node,index)=>`<div class="uc-concept-node"><b>${index+1}</b><span>${esc(node)}</span></div>${index<nodes.length-1?'<i aria-hidden="true">→</i>':''}`).join('')}</div><p>Use the arrows to explain the causal link between each idea, not just to name the quantities.</p></section>`;
  }

  function misconceptionMarkup(data){
    const items=supportFor(data).misconceptions||[];
    if(!items.length)return '';
    return `<section class="uc-slide-enrichment uc-misconception-card"><div class="uc-slide-card-head"><span>Common misconceptions</span><strong>Spot the trap before the exam</strong></div><div class="uc-misconception-grid">${items.slice(0,2).map(([claim,fix])=>`<div class="uc-misconception"><span>Not quite</span><strong>${esc(claim)}</strong><p>${esc(fix)}</p></div>`).join('')}</div></section>`;
  }

  function hingeMarkup(data){
    const first=(supportFor(data).misconceptions||[])[0];
    if(!first)return '';
    return `<section class="uc-slide-enrichment uc-hinge-card"><div class="uc-slide-card-head"><span>Diagnostic hinge question</span><strong>Commit before you reveal</strong></div><div class="uc-hinge-body"><p>Agree or disagree: <strong>${esc(first[0])}</strong></p><div class="uc-hinge-options"><span>Agree</span><span>Disagree</span><span>Explain why</span></div><details><summary>Reveal the physics</summary><p>${esc(first[1])}</p></details></div></section>`;
  }

  function workedMarkup(example){
    if(!example||!(example.steps||[]).length)return '';
    const steps=(example.steps||[]).slice(0,4);
    return `<section class="uc-slide-enrichment uc-worked-flow"><div class="uc-slide-card-head"><span>Worked method</span><strong>Follow the reasoning</strong></div><p class="uc-worked-question">${esc(example.question||'')}</p><div class="uc-worked-steps">${steps.map((step,index)=>`<div class="uc-worked-step"><b>${index+1}</b><span>${esc(step)}</span></div>`).join('')}</div>${example.answer?`<div class="uc-worked-answer"><span>Answer</span><strong>${esc(example.answer)}</strong></div>`:''}<div class="uc-sense-check"><b>Sense check</b><span>Check the unit, sign, order of magnitude and whether the answer matches the physical situation.</span></div></section>`;
  }

  function equationHint(item,data){
    const text=clean(`${item?.name||''} ${item?.formula||''}`).toLowerCase();
    if(/current|i = q|q\/t/.test(text))return ['Use when charge flow and time are linked.','Check charge is in coulombs and time in seconds.'];
    if(/internal resistance|emf|ε|lost/.test(text))return ['Separate energy supplied by the source from terminal p.d.','Keep the sign of Ir consistent with the circuit situation.'];
    if(/wave speed|v = f|fλ/.test(text))return ['Use when frequency, wavelength and propagation speed are linked.','Frequency stays fixed when a wave crosses a boundary.'];
    if(/momentum|impulse/.test(text))return ['Choose the system and a positive direction before substituting.','Momentum and impulse are vector quantities.'];
    if(/stress|strain|young/.test(text))return ['Use original dimensions when calculating stress and strain.','Young modulus applies to the linear elastic region.'];
    if(/centripetal|angular/.test(text))return ['Use for motion with a centre-directed resultant force.','Velocity is tangential even though acceleration is radial.'];
    if(/harmonic|ω|period/.test(text))return ['Use only when the restoring acceleration is proportional to −x.','Keep angular frequency in rad s⁻¹ distinct from frequency in Hz.'];
    if(/field|potential|gravitation|coulomb/.test(text))return ['Decide first whether the quantity is force, field strength, potential or energy.','Check whether the relationship is vector or scalar and whether distance is squared.'];
    if(/decay|activity|half/.test(text))return ['Use exponential decay for a large population of unstable nuclei.','Use consistent time units for λ and t.'];
    if(/photon|de broglie|work function/.test(text))return ['Use quantum energy or momentum relationships at particle scale.','Convert eV to joules only when the equation requires SI energy.'];
    if(/uncertainty|percentage/.test(text))return ['Match the uncertainty rule to the mathematical operation.','Do not round intermediate uncertainty calculations too early.'];
    return ['Use this relationship when the quantities in the question match its physical model.','Rearrange symbolically first, convert to SI units, then substitute.'];
  }

  function equationMarkup(equations=[],data={}){
    if(!equations.length)return '';
    return `<section class="uc-slide-enrichment uc-equation-meaning"><div class="uc-slide-card-head"><span>Equation meaning</span><strong>Connect symbols to physics</strong></div><div class="uc-equation-grid">${equations.slice(0,4).map(item=>{const [use,check]=equationHint(item,data);return `<div class="uc-equation-card"><span>${esc(item.name)}</span><code>${esc(item.formula)}</code>${item.unit?`<small>${esc(item.unit)}</small>`:''}<p>${esc(use)}</p><em>${esc(check)}</em></div>`;}).join('')}</div></section>`;
  }

  function applicationMarkup(data){
    const info=supportFor(data).application||[];
    if(!info.length)return '';
    return `<section class="uc-slide-enrichment uc-application-card"><div class="uc-slide-card-head"><span>Apply the physics</span><strong>${esc(info[0])}</strong></div><div class="uc-application-body"><p>${esc(info[1])}</p><div><span>Stretch</span><strong>${esc(info[2])}</strong></div></div></section>`;
  }

  function simulationMarkup(data){
    const prompts=supportFor(data).simulation||[];
    if(prompts.length<3)return '';
    const labels=['Predict','Observe','Explain'];
    return `<section class="uc-slide-enrichment uc-simulation-cycle"><div class="uc-slide-card-head"><span>Simulation thinking</span><strong>Predict → Observe → Explain</strong></div><div class="uc-poe-grid">${prompts.slice(0,3).map((prompt,index)=>`<div><b>${labels[index]}</b><span>${esc(prompt)}</span></div>`).join('')}</div></section>`;
  }

  function commandWordGuides(checks=[]){
    const guides=[];
    const add=(label,text)=>{if(!guides.some(item=>item[0]===label))guides.push([label,text]);};
    checks.forEach(question=>{
      const q=clean(question).toLowerCase();
      if(/^(calculate|find|determine|estimate)/.test(q))add('Calculate','Write the equation, substitute clearly and finish with a sensible unit and significant figures.');
      else if(/^(explain|why|how)/.test(q))add('Explain','Link a physics cause to its consequence; do not just restate the observation.');
      else if(/^(state|name|give|define)/.test(q))add('State','Give a precise physics statement with no unnecessary extra claims.');
      else if(/^(show|derive|prove)/.test(q))add('Show that','Make every algebraic step visible and reach the value or form given in the question.');
      else if(/^(compare|distinguish)/.test(q))add('Compare','Refer to both quantities or situations and make the comparison explicit.');
    });
    if(!guides.length)add('Exam method','Identify the command word, select the relevant physics and show enough working for each mark.');
    return guides.slice(0,3);
  }

  function examMarkup(data){
    if(!data.examTip&&!(data.checks||[]).length)return '';
    const guides=commandWordGuides(data.checks||[]);
    return `<section class="uc-slide-enrichment uc-exam-focus"><div class="uc-slide-card-head"><span>AQA focus</span><strong>What examiners are looking for</strong></div>${data.examTip?`<div class="uc-exam-tip"><b>Exam tip</b><p>${esc(data.examTip)}</p></div>`:''}${guides.length?`<div class="uc-command-guide">${guides.map(([label,text])=>`<div><b>${esc(label)}</b><span>${esc(text)}</span></div>`).join('')}</div>`:''}${(data.checks||[]).length?`<div class="uc-quick-check"><b>Quick check</b><ol>${data.checks.slice(0,3).map(q=>`<li>${esc(q)}</li>`).join('')}</ol></div>`:''}</section>`;
  }

  function insertHtml(target,html){
    if(!target||!html)return false;
    const wrap=document.createElement('div');wrap.innerHTML=html.trim();
    const node=wrap.firstElementChild;if(!node)return false;
    target.appendChild(node);return true;
  }

  function decorate(data){
    if(!data)return;
    latest=data;removeOld();
    const retrieval=document.querySelector('.lesson-stage[data-stage="retrieval"],.lesson-stage[data-stage="starter"]');
    const learn=document.querySelector('.lesson-stage[data-stage="learn"]');
    const equations=document.querySelector('.lesson-stage[data-stage="equations"]');
    const worked=document.querySelector('.lesson-stage[data-stage="worked"]');
    const apply=document.querySelector('.lesson-stage[data-stage="apply"]');
    const simulation=document.querySelector('.lesson-stage[data-stage="simulation"],.lesson-stage[data-stage="sim"]');
    const exam=document.querySelector('.lesson-stage[data-stage="exam"]');
    const fallback=document.querySelector('.uc-lesson-essentials .uc-essential-body');
    let used=false;
    if(retrieval)used=insertHtml(retrieval,connectionMarkup(data))||used;
    else if(learn)used=insertHtml(learn,connectionMarkup(data))||used;
    if(learn&&data.visual)used=insertHtml(learn,visualMarkup(data))||used;
    if(learn)used=insertHtml(learn,termsMarkup(data.terms))||used;
    if(learn)used=insertHtml(learn,misconceptionMarkup(data))||used;
    if(equations)used=insertHtml(equations,equationMarkup(data.equations,data))||used;
    if(worked)used=insertHtml(worked,workedMarkup(data.example))||used;
    if(apply){used=insertHtml(apply,applicationMarkup(data))||used;used=insertHtml(apply,hingeMarkup(data))||used;}
    else if(learn){used=insertHtml(learn,applicationMarkup(data))||used;used=insertHtml(learn,hingeMarkup(data))||used;}
    if(simulation)used=insertHtml(simulation,simulationMarkup(data))||used;
    if(exam)used=insertHtml(exam,examMarkup(data))||used;
    if(!used&&fallback){[connectionMarkup(data),visualMarkup(data),termsMarkup(data.terms),misconceptionMarkup(data),equationMarkup(data.equations,data),workedMarkup(data.example),applicationMarkup(data),hingeMarkup(data),simulationMarkup(data),examMarkup(data)].forEach(html=>insertHtml(fallback,html));}
    document.documentElement.classList.add('uc-lesson-visuals-ready');
  }

  window.CourseLessonPresentationEnhancer={decorate};
  const schedule=(data=latest,delay=40)=>{if(data)latest=data;window.clearTimeout(renderTimer);renderTimer=window.setTimeout(()=>latest&&decorate(latest),delay);};

  function requestEnrichment(){
    const sectionSelect=document.querySelector('.uc-view-picker select');
    const lessonSelect=[...document.querySelectorAll('.uc-simple-lesson-nav select')].find(select=>{const style=getComputedStyle(select);return style.display!=='none'&&style.visibility!=='hidden';});
    const sectionLabel=sectionSelect?.selectedOptions?.[0]?.textContent||'';
    const lessonLabel=lessonSelect?.selectedOptions?.[0]?.textContent||'';
    const label=clean(`${sectionLabel} ${lessonLabel}`)||document.title;
    const version=++requestVersion;
    const send=()=>window.parent.postMessage({type:'alevel-lesson-enrichment-request',index:Number(sectionSelect?.value)||0,label,pageTitle:document.title},'*');
    send();
    [250,700,1500].forEach(delay=>window.setTimeout(()=>{if(version!==requestVersion||latest)return;send();},delay));
  }

  window.addEventListener('message',event=>{if(event.data?.type==='alevel-lesson-enrichment')schedule(event.data,0);});
  const observer=new MutationObserver(mutations=>{
    if(!latest)return;
    const meaningful=mutations.some(mutation=>{if(mutation.target?.closest?.('.uc-slide-enrichment'))return false;const nodes=[...mutation.addedNodes,...mutation.removedNodes];return nodes.some(node=>!(node.nodeType===1&&node.classList?.contains('uc-slide-enrichment')));});
    if(meaningful)schedule(latest,90);
  });
  const start=()=>{
    observer.observe(document.body,{childList:true,subtree:true});
    if(window.__courseLessonEnrichment)schedule(window.__courseLessonEnrichment,0);else window.setTimeout(requestEnrichment,0);
    document.addEventListener('change',event=>{if(event.target?.matches?.('.uc-view-picker select,.uc-simple-lesson-nav select')){latest=null;window.setTimeout(requestEnrichment,80);}},true);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();