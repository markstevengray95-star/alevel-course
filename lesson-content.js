(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const lessons = () => window.ALEVEL_LESSONS || [];

  const TOPICS = {
    measurements: {
      intro: 'Measurements are only useful when the units, precision and uncertainty are communicated correctly. In A-level Physics you are expected to judge data as well as calculate with it.',
      vocabulary: ['SI unit','base quantity','derived unit','resolution','precision','accuracy','random error','systematic error','uncertainty','percentage uncertainty','significant figures'],
      equations: [
        ['percentage uncertainty','(absolute uncertainty ÷ measured value) × 100%','Use consistent units before forming the ratio.'],
        ['percentage difference','(|experimental − accepted| ÷ accepted) × 100%','Use when comparing a measured result with an accepted value.']
      ],
      misconceptions: ['More decimal places do not automatically make a measurement more accurate.','Repeating a measurement reduces the effect of random variation, but does not remove a systematic offset.','Uncertainty belongs with the measured quantity and should normally be quoted to sensible significant figures.']
    },
    particles: {
      intro: 'Particle physics uses conservation laws and experimental evidence to describe matter, radiation and interactions at the smallest scales.',
      vocabulary: ['nuclide','isotope','antiparticle','photon','hadron','baryon','meson','lepton','quark','strangeness','work function','threshold frequency','de Broglie wavelength'],
      equations: [
        ['photon energy','E = hf = hc/λ','Use frequency in hertz or wavelength in metres.'],
        ['mass–energy','E = mc²','A change in rest mass corresponds to an energy change.'],
        ['de Broglie wavelength','λ = h/p','For a non-relativistic particle p = mv.']
      ],
      misconceptions: ['Antiparticles have the same mass as their particles but opposite values of charge-like quantum properties.','A photon is not gradually absorbed: one photon transfers its energy in a single interaction.','Conservation laws must be checked across the whole interaction, not particle by particle.']
    },
    waves: {
      intro: 'Wave behaviour is described using measurable quantities such as frequency, wavelength, phase and amplitude, then applied to interference, diffraction and refraction.',
      vocabulary: ['amplitude','frequency','period','wavelength','phase difference','coherence','superposition','node','antinode','refractive index','critical angle','diffraction'],
      equations: [
        ['wave speed','v = fλ','Use frequency in hertz and wavelength in metres.'],
        ['refractive index','n = c/v','n is dimensionless.'],
        ['double-slit fringe spacing','w = λD/s','Use the small-angle arrangement expected at A-level.'],
        ['diffraction grating','d sinθ = nλ','n here is diffraction order, not refractive index.']
      ],
      misconceptions: ['Particles of the medium oscillate; they do not travel with the wave over long distances.','Interference redistributes energy rather than creating or destroying it.','Stationary waves have no net energy transfer along the pattern.']
    },
    'mechanics-materials': {
      intro: 'Mechanics links motion to forces, momentum and energy. Materials then applies force ideas to deformation, stress, strain and elastic behaviour.',
      vocabulary: ['displacement','velocity','acceleration','resultant force','momentum','impulse','work','power','moment','stress','strain','Young modulus'],
      equations: [
        ['Newton II','F = ma','Use the resultant force in the direction considered.'],
        ['momentum','p = mv','Momentum is a vector.'],
        ['work done','W = Fs cosθ','θ is the angle between force and displacement.'],
        ['kinetic energy','Ek = ½mv²','Speed is squared, so doubling speed quadruples kinetic energy.'],
        ['stress','σ = F/A','Use cross-sectional area perpendicular to the force.'],
        ['strain','ε = ΔL/L','Strain is dimensionless.'],
        ['Young modulus','E = stress/strain','Use only in the linear elastic region.']
      ],
      misconceptions: ['A moving object does not require a resultant force if its velocity is constant.','Mass and weight are different quantities.','The area under a velocity–time graph gives displacement, not distance unless direction is handled correctly.','Young modulus is a material property; it is not the same as stiffness of a particular sample.']
    },
    electricity: {
      intro: 'Current electricity is built from charge flow, energy transfer and circuit conservation. The key is to distinguish current, potential difference, resistance and emf clearly.',
      vocabulary: ['charge','current','potential difference','resistance','resistivity','emf','internal resistance','terminal pd','potential divider','thermistor','LDR'],
      equations: [
        ['current','I = Q/t','Current is the rate of flow of charge.'],
        ['potential difference','V = W/Q','One volt is one joule per coulomb.'],
        ['resistance','R = V/I','Ohm’s law applies only when physical conditions remain constant.'],
        ['resistivity','R = ρL/A','ρ is a property of the material at a stated temperature.'],
        ['power','P = IV = I²R = V²/R','Choose the form that matches the known quantities.'],
        ['terminal pd','V = ε − Ir','Lost volts = Ir.']
      ],
      misconceptions: ['Current is not used up by a component.','Potential difference is energy transferred per unit charge, not the amount of charge.','An emf is measured in volts but represents energy supplied per coulomb by a source.']
    },
    'further-mechanics': {
      intro: 'Further mechanics extends force and motion into circular and oscillatory systems, then thermal physics connects macroscopic measurements with microscopic particle motion.',
      vocabulary: ['radian','angular speed','centripetal acceleration','SHM','amplitude','phase','resonance','internal energy','specific heat capacity','latent heat','absolute temperature','ideal gas'],
      equations: [
        ['angular speed','ω = 2πf = 2π/T','Radians are required in angular relationships.'],
        ['centripetal acceleration','a = v²/r = ω²r','The acceleration points toward the centre.'],
        ['SHM condition','a = −ω²x','The minus sign shows acceleration is directed toward equilibrium.'],
        ['spring period','T = 2π√(m/k)','Valid for an ideal mass–spring oscillator.'],
        ['ideal gas','pV = nRT = NkT','Use kelvin temperature and SI units.']
      ],
      misconceptions: ['Centripetal force is not an extra force; it is the name for the resultant inward force.','At the centre of SHM displacement is zero but speed is maximum.','Temperature is related to average random kinetic energy, not the total internal energy of a sample.']
    },
    fields: {
      intro: 'Fields describe how objects can interact without direct contact. Gravitational, electric and magnetic models share common ideas but differ in important ways.',
      vocabulary: ['field strength','potential','equipotential','inverse square','capacitance','time constant','magnetic flux density','magnetic flux','flux linkage','emf','induction'],
      equations: [
        ['gravitational force','F = GMm/r²','r is centre-to-centre separation.'],
        ['gravitational field strength','g = GM/r²','Direction is toward the attracting mass.'],
        ['electric force','F = Qq/(4πε₀r²)','Like charges repel and unlike charges attract.'],
        ['capacitance','C = Q/V','Capacitance is charge stored per volt.'],
        ['capacitor energy','E = ½QV = ½CV² = Q²/(2C)','Equivalent forms are useful for different data.'],
        ['magnetic force','F = BIL sinθ','θ is between the conductor/current direction and the field.'],
        ['induced emf','ε = −N dΦ/dt','The sign represents Lenz’s law.']
      ],
      misconceptions: ['Potential is a scalar; field strength is a vector.','A negative gravitational potential does not mean negative energy is impossible; it reflects the zero chosen at infinity.','A magnetic field does no work on a moving point charge because the magnetic force is perpendicular to velocity.']
    },
    nuclear: {
      intro: 'Nuclear physics connects evidence about nuclear structure to radioactivity, binding energy, fission and fusion.',
      vocabulary: ['Rutherford scattering','activity','decay constant','half-life','binding energy','mass defect','nuclear radius','background radiation','fission','fusion','chain reaction'],
      equations: [
        ['activity','A = λN','Activity is measured in becquerels.'],
        ['radioactive decay','N = N₀e^(−λt)','Activity follows the same exponential form.'],
        ['half-life','T½ = ln2/λ','Half-life is independent of the initial number of nuclei.'],
        ['nuclear radius','R = r₀A^(1/3)','This supports approximately constant nuclear density.'],
        ['mass–energy','ΔE = Δmc²','Use the mass defect in kilograms unless using MeV/c² consistently.']
      ],
      misconceptions: ['Radioactive decay is random for an individual nucleus but predictable statistically for a large sample.','Half-life does not mean every nucleus survives exactly that long.','Gamma emission usually changes nuclear energy state but not proton or nucleon number.']
    }
  };

  const SPECIFIC = [
    {match:/SI base units|prefix/i, knowledge:['The seven SI base units provide a consistent foundation for physical measurement.','Derived units are combinations of base units; for example N = kg m s⁻².','Prefixes are powers of ten, so convert them before substituting into equations.'], equation:['prefix conversion','value in base units = stated value × prefix factor','Example: 4.2 mm = 4.2 × 10⁻³ m.']},
    {match:/uncertainty|error bars/i, knowledge:['Absolute uncertainty has the same unit as the measurement.','Fractional uncertainty is absolute uncertainty divided by the measured value.','For products and quotients, percentage uncertainties are added; for powers, multiply percentage uncertainty by the magnitude of the power.'], equation:['fractional uncertainty','Δx/x','Multiply by 100 for percentage uncertainty.']},
    {match:/photoelectric/i, knowledge:['Electrons are emitted only when photon energy exceeds the work function.','Increasing intensity increases photon arrival rate, not photon energy.','The maximum kinetic energy is set by frequency: Ek,max = hf − φ.'], equation:['photoelectric equation','hf = φ + Ek,max','At threshold frequency, Ek,max = 0.']},
    {match:/de Broglie|duality/i, knowledge:['Matter can display wave behaviour when its de Broglie wavelength is comparable with structural spacing.','Electron diffraction provides direct evidence for matter waves.','Greater momentum means a shorter de Broglie wavelength.'], equation:['de Broglie','λ = h/p','For non-relativistic particles p = mv.']},
    {match:/stationary|harmonics/i, knowledge:['A stationary wave forms from two coherent waves of equal frequency travelling in opposite directions.','Nodes always have zero displacement; antinodes have maximum amplitude.','Adjacent nodes are separated by λ/2.'], equation:['string fundamental','f = v/(2L)','For the fundamental mode, L = λ/2.']},
    {match:/double-slit/i, knowledge:['The sources must be coherent so their phase relationship remains fixed.','Bright fringes occur when path difference is an integer number of wavelengths.','Increasing screen distance increases fringe spacing.'], equation:['fringe spacing','w = λD/s','Keep all lengths in consistent units.']},
    {match:/projectile/i, knowledge:['Horizontal and vertical motion are analysed independently.','Ignoring air resistance, horizontal velocity stays constant while vertical acceleration is g downward.','Time links the horizontal and vertical calculations.'], equation:['vertical motion','s = ut + ½at²','Use a consistent sign convention.']},
    {match:/Newton/i, knowledge:['Newton’s first law describes motion when resultant force is zero.','Newton’s second law links resultant force to rate of change of momentum; for constant mass F = ma.','Newton’s third-law forces act on different objects and are equal and opposite.'], equation:['Newton II','ΣF = ma','Use the resultant force, not a single force unless it is the only one.']},
    {match:/momentum|impulse/i, knowledge:['Momentum is conserved in an isolated system.','Impulse equals change in momentum and equals area under a force–time graph.','In collisions, kinetic energy may change even when total momentum is conserved.'], equation:['impulse','FΔt = Δp','For varying force, use the area under the F–t graph.']},
    {match:/Young modulus|stress|strain/i, knowledge:['Stress measures force per unit cross-sectional area.','Strain measures fractional extension and has no unit.','Young modulus is the gradient of a stress–strain graph in the linear elastic region.'], equation:['Young modulus','E = (F/A)/(ΔL/L)','Use SI units so E is in pascals.']},
    {match:/resistivity/i, knowledge:['Resistance depends on both material and geometry.','Resistivity is a material property at a stated temperature.','A micrometer measurement of diameter is important because area depends on diameter squared.'], equation:['resistivity','ρ = RA/L','For a circular wire A = πd²/4.']},
    {match:/potential divider/i, knowledge:['A potential divider shares the supply voltage in proportion to resistance.','The output voltage depends on which resistor the output is taken across.','Sensors work because their resistance changes with an environmental variable.'], equation:['potential divider','Vout = Vin × R₂/(R₁ + R₂)','R₂ is the resistance across which Vout is measured.']},
    {match:/internal resistance|EMF/i, knowledge:['Emf is energy supplied per coulomb by the source.','Terminal pd is less than emf when current flows because energy is dissipated inside the source.','A V–I graph has intercept ε and gradient −r.'], equation:['source equation','V = ε − Ir','The magnitude of the V–I gradient gives internal resistance.']},
    {match:/centripetal/i, knowledge:['Circular motion requires an inward acceleration even at constant speed.','The inward resultant force changes velocity direction rather than necessarily changing speed.','Doubling speed at fixed radius quadruples centripetal acceleration.'], equation:['centripetal force','F = mv²/r = mω²r','Identify which real force or combination supplies this resultant.']},
    {match:/simple harmonic|SHM/i, knowledge:['In SHM acceleration is proportional to displacement and directed toward equilibrium.','Speed is maximum at equilibrium and zero at the turning points.','Energy transfers continuously between kinetic and potential forms.'], equation:['SHM acceleration','a = −ω²x','The minus sign shows the restoring direction.']},
    {match:/ideal gas|gas law/i, knowledge:['Absolute temperature must be used in gas equations.','The ideal model treats molecular volume and intermolecular forces as negligible except during collisions.','Pressure results from molecular collisions with container walls.'], equation:['ideal gas','pV = nRT = NkT','Use pascals, cubic metres and kelvin.']},
    {match:/gravitational field strength/i, knowledge:['Field strength is force per unit mass.','Outside a spherical mass, the field behaves as if all mass were concentrated at the centre.','The inverse-square relation follows from spreading through spherical area.'], equation:['gravitational field','g = GM/r²','Direction is toward the mass.']},
    {match:/capacitor charge|discharge|time constant/i, knowledge:['Capacitor discharge is exponential, not linear.','The time constant τ = RC sets the timescale of charge and voltage change.','After one time constant during discharge, charge falls to about 37% of its initial value.'], equation:['capacitor discharge','Q = Q₀e^(−t/RC)','V and I follow equivalent exponential forms.']},
    {match:/magnetic flux|induction|Faraday/i, knowledge:['Magnetic flux measures field through an area.','Faraday’s law links induced emf to the rate of change of flux linkage.','Lenz’s law sets the direction so the induced effect opposes the change that produced it.'], equation:['Faraday–Lenz','ε = −NΔΦ/Δt','Use the rate of change of flux linkage.']},
    {match:/half-life|decay constant|radioactive decay/i, knowledge:['Activity is proportional to the number of undecayed nuclei.','Exponential decay means equal fractions decay in equal time intervals.','Half-life and decay constant are inversely related.'], equation:['half-life','T½ = ln2/λ','λ has units s⁻¹ when time is in seconds.']},
    {match:/binding energy|mass defect/i, knowledge:['A bound nucleus has less mass than its separated nucleons.','The mass defect corresponds to binding energy.','Binding energy per nucleon helps compare nuclear stability and explains energy release in fission and fusion.'], equation:['binding energy','E = Δmc²','Convert atomic mass units consistently if data are given in u.']}
  ];

  function getTopic(lesson){ return TOPICS[lesson.topicId] || TOPICS.measurements; }
  function specificFor(lesson){ return SPECIFIC.find(item => item.match.test(`${lesson.title} ${lesson.focus}`)); }
  function objectiveList(lesson){
    const clean = lesson.focus.replace(/\.$/, '');
    const parts = clean.split(/;| and (?=[a-z])/i).map(x => x.trim()).filter(Boolean);
    return [...parts.slice(0,2).map(x => x.charAt(0).toUpperCase()+x.slice(1)),`Explain the physics of ${lesson.title.toLowerCase()} using precise AQA terminology.`,lesson.type === 'practical' ? 'Evaluate data quality, uncertainty and improvements to the method.' : 'Apply the ideas to an unfamiliar AQA-style context.'].slice(0,4);
  }
  function keywordList(lesson, topic){
    const words = lesson.title.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 4);
    return topic.vocabulary.filter(v => words.some(w => v.toLowerCase().includes(w) || w.includes(v.toLowerCase().split(' ')[0]))).concat(topic.vocabulary.slice(0,5)).filter((v,i,a)=>a.indexOf(v)===i).slice(0,8);
  }
  function equationsFor(lesson, topic, specific){
    const title = `${lesson.title} ${lesson.focus}`.toLowerCase();
    const selected = topic.equations.filter(eq => title.split(/[^a-z0-9]+/).some(token => token.length>3 && eq.join(' ').toLowerCase().includes(token)));
    if(specific?.equation) selected.unshift(specific.equation);
    const unique = selected.filter((eq,i,a)=>a.findIndex(x=>x[0]===eq[0])===i).slice(0,4);
    return unique.length ? unique : topic.equations.slice(0,3);
  }
  function teachingChunks(lesson, topic, specific){
    const core = [`${lesson.title} sits within ${lesson.topicCode} ${lesson.topicTitle}. ${lesson.focus} This means students need to connect the definition or model to measurable quantities rather than memorising a phrase in isolation.`,...(specific?.knowledge || []),`A strong A-level answer should state the relevant physical principle, identify the quantities involved, apply an equation or model where appropriate, and then interpret the result in the context of the question.`,`When calculations are involved, convert to SI units first, keep extra digits during working, and round only the final answer to a sensible number of significant figures.`];
    if(lesson.type === 'practical') core.push('For the practical, identify independent, dependent and control variables before taking data. Repeat measurements where useful, plot a graph when it tests a relationship more reliably than a single calculation, and discuss uncertainty using evidence from the measurements.');
    if(lesson.type === 'review') core.push('This mastery lesson should mix recall, explanation, calculation and data interpretation so students have to choose the physics rather than follow a rehearsed procedure.');
    return [{title:'Build the idea',text:core.slice(0,2)},{title:'Connect the physics',text:core.slice(2,4)},{title:lesson.type==='practical'?'Practical reasoning':'Exam reasoning',text:core.slice(4).length?core.slice(4):[topic.intro]}];
  }
  function workedExample(lesson, equations){
    const eq = equations[0];
    if(!eq) return {question:`Explain how you would apply ${lesson.title.toLowerCase()} to an unfamiliar situation.`,steps:['Identify the governing physical principle.','List the known quantities with units.','Select a suitable model or relationship.','Apply it and interpret the result.'],answer:'A complete solution links the calculation or evidence back to the physical meaning.'};
    return {question:`A question on ${lesson.title.toLowerCase()} requires the relationship ${eq[1]}. How should a student structure the solution?`,steps:[`Write the relationship: ${eq[1]}.`,'Convert every numerical quantity to SI units.','Substitute values with units shown clearly.','Calculate without rounding too early.','State the final answer with a unit and check that its size is physically reasonable.'],answer:eq[2]};
  }
  function checkQuestions(lesson){ return [`State one definition or principle that is essential for ${lesson.title}.`,`Explain the meaning of the key relationship or model used in this lesson.`,`Describe one mistake that could lead to an incorrect answer in this topic.`,lesson.type === 'practical' ? 'Identify one important source of uncertainty and explain how its effect could be reduced.' : `Apply ${lesson.title.toLowerCase()} to a new situation and justify each step.`]; }
  function examQuestions(lesson){ return [{marks:2,q:`Define or describe the central idea in ${lesson.title}. Use precise physics terminology.`},{marks:3,q:`A student applies ${lesson.title.toLowerCase()} in an unfamiliar context. Explain the reasoning they should use and identify the most relevant physical quantities.`},{marks:4,q:'Use an appropriate relationship from this lesson to solve a quantitative problem. Show your working, units and final check.'},{marks:6,q:lesson.type==='practical' ? 'Evaluate a method for investigating this relationship, including control variables, uncertainty, data analysis and improvements.' : `Explain how the model in ${lesson.title.toLowerCase()} is supported by evidence or connects to another area of A-level Physics.`}]; }
  function buildLesson(lesson){
    const topic=getTopic(lesson), specific=specificFor(lesson), equations=equationsFor(lesson,topic,specific);
    return {...lesson,topicIntro:topic.intro,objectives:objectiveList(lesson),keywords:keywordList(lesson,topic),chunks:teachingChunks(lesson,topic,specific),equations,misconceptions:topic.misconceptions.slice(0,3),worked:workedExample(lesson,equations),checks:checkQuestions(lesson),exam:examQuestions(lesson)};
  }

  let activeId=null, dialog=null;
  function ensureDialog(){
    if(dialog) return dialog;
    dialog=document.createElement('div'); dialog.className='lesson-reader-shell'; dialog.hidden=true;
    dialog.innerHTML='<div class="lesson-reader-backdrop" data-close-lesson></div><section class="lesson-reader" role="dialog" aria-modal="true" aria-label="Lesson reader"><header class="lesson-reader-top"><div><span class="lesson-reader-eyebrow" data-lr-code></span><h2 data-lr-title></h2><p data-lr-subtitle></p></div><div class="lesson-reader-actions"><button type="button" data-open-topic>Open specialist topic</button><button type="button" data-close-lesson aria-label="Close lesson">×</button></div></header><nav class="lesson-reader-nav" data-lr-nav></nav><main class="lesson-reader-body" data-lr-body></main><footer class="lesson-reader-footer"><button type="button" data-prev-lesson>← Previous lesson</button><span data-lr-position></span><button type="button" data-next-lesson>Next lesson →</button></footer></section>';
    document.body.appendChild(dialog);
    dialog.addEventListener('click',event=>{
      if(event.target.closest('[data-close-lesson]')) closeLesson();
      const topicBtn=event.target.closest('[data-open-topic]'); if(topicBtn&&activeId){const lesson=lessons().find(l=>l.id===activeId);closeLesson();window.CourseApp?.openTopic?.(lesson.topicId,true,0);}
      if(event.target.closest('[data-prev-lesson]')) moveLesson(-1); if(event.target.closest('[data-next-lesson]')) moveLesson(1);
      const nav=event.target.closest('[data-scroll-section]'); if(nav) dialog.querySelector(`#${nav.dataset.scrollSection}`)?.scrollIntoView({behavior:'smooth',block:'start'});
    });
    return dialog;
  }
  function section(id,title,html){return `<section class="lesson-reader-section" id="${id}"><h3>${esc(title)}</h3>${html}</section>`;}
  function renderLesson(id){
    const base=lessons().find(l=>l.id===id); if(!base) return; const lesson=buildLesson(base); activeId=id; window.ALEVEL_ACTIVE_LESSON=lesson; const d=ensureDialog();
    d.querySelector('[data-lr-code]').textContent=`${lesson.topicCode} · ${lesson.ref} · ${lesson.year}`; d.querySelector('[data-lr-title]').textContent=lesson.title; d.querySelector('[data-lr-subtitle]').textContent=`${lesson.minutes} min · ${lesson.type==='practical'?'Practical lesson':lesson.type==='review'?'Mastery lesson':lesson.type==='skills'?'Skills lesson':'Core lesson'}`;
    const eqRows=lesson.equations.map(eq=>`<tr><th>${esc(eq[0])}</th><td><code>${esc(eq[1])}</code></td><td>${esc(eq[2])}</td></tr>`).join('');
    const chunkHtml=lesson.chunks.map((chunk,i)=>`<article class="teaching-chunk"><span>Teaching chunk ${i+1}</span><h4>${esc(chunk.title)}</h4>${chunk.text.map(p=>`<p>${esc(p)}</p>`).join('')}</article>`).join('');
    d.querySelector('[data-lr-body]').innerHTML=[section('lr-overview','Lesson overview',`<p class="lesson-lead">${esc(lesson.topicIntro)}</p><div class="lesson-focus-box"><strong>AQA focus</strong><p>${esc(lesson.focus)}</p></div><h4>Learning objectives</h4><ul>${lesson.objectives.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`),section('lr-keywords','Key vocabulary',`<div class="keyword-grid">${lesson.keywords.map(k=>`<span>${esc(k)}</span>`).join('')}</div>`),section('lr-textbook','Textbook teaching',chunkHtml),section('lr-equations','Equations and models',`<div class="equation-table-wrap"><table class="equation-table"><thead><tr><th>Relationship</th><th>Equation</th><th>How to use it</th></tr></thead><tbody>${eqRows}</tbody></table></div>`),section('lr-worked','Worked-example method',`<div class="worked-example"><strong>${esc(lesson.worked.question)}</strong><ol>${lesson.worked.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p><b>Key check:</b> ${esc(lesson.worked.answer)}</p></div>`),section('lr-misconceptions','Common misconceptions',`<div class="misconception-list">${lesson.misconceptions.map(x=>`<p>⚠ ${esc(x)}</p>`).join('')}</div>`),section('lr-checks','Check your understanding',`<ol class="question-list">${lesson.checks.map(x=>`<li>${esc(x)}<textarea rows="2" placeholder="Write your answer…"></textarea></li>`).join('')}</ol>`),section('lr-exam','AQA-style exam practice',`<div class="exam-list">${lesson.exam.map(x=>`<article><span>${x.marks} marks</span><p>${esc(x.q)}</p><textarea rows="3" placeholder="Write your answer…"></textarea></article>`).join('')}</div>`)].join('');
    d.querySelector('[data-lr-nav]').innerHTML=[['lr-overview','Overview'],['lr-textbook','Teach'],['lr-equations','Equations'],['lr-worked','Worked'],['lr-checks','Check'],['lr-exam','Exam']].map(x=>`<button type="button" data-scroll-section="${x[0]}">${x[1]}</button>`).join('');
    const all=lessons(), index=all.findIndex(l=>l.id===id); d.querySelector('[data-lr-position]').textContent=`${index+1} / ${all.length}`; d.querySelector('[data-prev-lesson]').disabled=index<=0; d.querySelector('[data-next-lesson]').disabled=index>=all.length-1; d.hidden=false; document.body.classList.add('lesson-reader-open'); d.querySelector('.lesson-reader-body').scrollTop=0; history.replaceState(history.state,'',`${location.pathname}${location.search}#lesson=${encodeURIComponent(id)}`); window.dispatchEvent(new CustomEvent('alevel:lesson-selected',{detail:lesson}));
  }
  function closeLesson(){if(!dialog)return;dialog.hidden=true;document.body.classList.remove('lesson-reader-open');activeId=null;window.ALEVEL_ACTIVE_LESSON=null;if(location.hash.startsWith('#lesson='))history.replaceState(history.state,'',`${location.pathname}${location.search}`);}
  function moveLesson(direction){const all=lessons(),i=all.findIndex(l=>l.id===activeId),next=all[i+direction];if(next)renderLesson(next.id);}
  function enhanceMap(){document.querySelectorAll('.curriculum-lesson[data-lesson-id]').forEach(card=>{if(card.dataset.contentReady)return;card.dataset.contentReady='1';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`Open lesson ${card.querySelector('.lesson-map-title strong')?.textContent||''}`);const meta=card.querySelector('.lesson-map-meta');if(meta&&!meta.querySelector('.lesson-content-ready'))meta.insertAdjacentHTML('beforeend','<span class="lesson-content-ready">Full lesson ready →</span>');card.addEventListener('click',e=>{if(e.target.closest('button,a'))return;renderLesson(card.dataset.lessonId);});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();renderLesson(card.dataset.lessonId);}});});}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog&&!dialog.hidden){e.preventDefault();closeLesson();}});
  const start=()=>{enhanceMap();const hash=location.hash.match(/^#lesson=(.+)$/);if(hash)renderLesson(decodeURIComponent(hash[1]));const root=document.getElementById('courseHome');if(root)new MutationObserver(enhanceMap).observe(root,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.ALEVEL_LESSON_CONTENT={open:renderLesson,close:closeLesson,build:buildLesson,get active(){return activeId;}};
})();