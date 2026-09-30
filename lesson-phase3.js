(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const allLessons = () => window.ALEVEL_LESSONS || [];
  const getLesson = id => allLessons().find(l => l.id === id);
  const baseBuild = lesson => window.ALEVEL_LESSON_CONTENT?.build?.(lesson) || lesson;

  const CONCEPTS = [
    C(/SI base|derived units|prefixes/i,'units and prefixes','A technician records a measurement in mm, a data logger gives SI units, and a mark scheme expects standard form.','Write the quantity in base SI units, convert prefixes first, then state the final unit clearly.','unit conversion ladder','Start from the prefix, replace it by its power of ten, then simplify the units before calculating.','Forgetting that milli is 10^-3 and micro is 10^-6.'),
    C(/Orders of magnitude|estimation/i,'estimation','Before using a calculator, students estimate whether the answer should be closer to 10^-3, 10^0 or 10^3.','Round each quantity to one significant figure and calculate the power of ten.','order-of-magnitude estimate','Estimate first, calculate second, then compare the two answers.','Treating an estimate as a guess rather than a reasoned calculation.'),
    C(/Accuracy|precision|resolution/i,'data quality','Two instruments give similar mean values but one has a finer scale and less scatter.','Separate accuracy, precision and resolution in the explanation.','data-quality judgement','Compare closeness to accepted value, scatter in repeats and smallest scale division separately.','Using accurate and precise as if they mean the same thing.'),
    C(/Random|systematic errors/i,'error analysis','A balance is zeroed incorrectly but repeated readings look consistent.','Identify whether the effect changes randomly or shifts every reading in the same direction.','error diagnosis','Classify the error, then state a practical improvement.','Thinking repeats remove systematic error.'),
    C(/uncertainty/i,'uncertainty','A student measures length with a ruler and diameter with a micrometer, then combines the data.','Quote absolute uncertainty with units and percentage uncertainty for comparison.','uncertainty chain','Find percentage uncertainties before combining products, quotients or powers.','Rounding intermediate uncertainty values too early.'),
    C(/graph|error bars|gradient|intercepts/i,'graph analysis','A graph has error bars and a best-fit line but the answer depends on the gradient.','Use large triangles, line of best fit and worst acceptable line where appropriate.','gradient evidence','Calculate gradient, intercept and uncertainty range from the graph.','Using two plotted points instead of the best-fit line.'),
    C(/Atomic structure|nuclides|isotopes/i,'nuclear notation','A nuclide is written with proton number and nucleon number but the charge is not shown.','Extract proton number, neutron number and nucleon number from the notation.','nuclide notation','Use A = Z + N and specific charge = charge ÷ mass.','Confusing nucleon number with neutron number.'),
    C(/Stable and unstable nuclei|alpha decay|beta decay/i,'nuclear stability','An unstable nucleus emits radiation to become more stable.','Balance nucleon number, proton number and charge in nuclear equations.','decay equation','Write the parent, identify emitted particle, then conserve A and Z.','Changing both A and Z incorrectly during beta decay.'),
    C(/antiparticles|photons/i,'particles and photons','A particle meets its antiparticle and two gamma photons are produced.','Use conservation laws and energy transfer in particle-antiparticle interactions.','annihilation energy','Calculate total rest energy before considering photon energy.','Forgetting that both particles contribute rest energy.'),
    C(/Annihilation|pair production/i,'annihilation and pair production','A photon near a nucleus produces a particle and antiparticle pair.','Compare photon energy with the minimum rest energy required.','pair-production threshold','Use E = hf and E = mc² to test whether the process is possible.','Ignoring the need to conserve momentum.'),
    C(/fundamental interactions|Exchange particles/i,'fundamental interactions','A Feynman-style diagram represents a force through exchange of a virtual particle.','Name the interaction, exchange particle and conserved quantities.','interaction diagram','Identify incoming and outgoing particles, then check charge and lepton/baryon number.','Thinking exchange particles are ordinary particles fired from one object to another.'),
    C(/Hadrons|baryons|mesons|leptons|quarks/i,'particle classification','A reaction contains baryons, mesons and leptons, each with different conservation rules.','Classify each particle before applying conservation laws.','classification table','Sort into hadron/lepton, then baryon/meson and quark composition.','Calling every subatomic particle a hadron.'),
    C(/Conservation laws in particle reactions/i,'particle conservation','A proposed particle reaction looks balanced for charge but not for lepton number.','Check charge, baryon number, lepton number and strangeness systematically.','conservation audit','Create a before/after table for each conserved quantity.','Stopping after checking charge only.'),
    C(/photoelectric/i,'photoelectric effect','Increasing light intensity changes current but does not change maximum kinetic energy.','Use photon energy and work function to explain threshold frequency.','photoelectric equation','Use hf = φ + Ek(max), then explain the observation using one photon-one electron interactions.','Explaining threshold frequency with wave energy spreading over time.'),
    C(/Electron collisions|excitation|ionisation/i,'electron excitation','An electron loses a precise amount of kinetic energy in a collision with an atom.','Compare kinetic energy with excitation and ionisation energies.','energy-level transition','Use energy conservation and convert eV to joules only when necessary.','Treating excitation and ionisation as the same process.'),
    C(/Energy levels|line spectra/i,'energy levels','A spectrum has discrete lines because electron energy changes are quantised.','Link line wavelength to the difference between two energy levels.','line-spectrum calculation','Use ΔE = hf = hc/λ and keep sign conventions clear.','Using the energy of one level instead of the energy difference.'),
    C(/de Broglie|Electron diffraction/i,'wave-particle duality','Electrons produce a diffraction pattern after passing through graphite.','Use de Broglie wavelength as evidence for matter waves.','matter-wave calculation','Find momentum then use λ = h/p.','Using wavelength of the accelerating voltage rather than the electron momentum.'),
    C(/Progressive waves|wave quantities/i,'wave quantities','A wave trace shows distance between crests and oscillation period.','Identify amplitude, wavelength, frequency, period and speed from the correct graph.','wave speed','Use v = fλ with frequency in Hz and wavelength in metres.','Mixing up displacement-time and displacement-distance graphs.'),
    C(/Longitudinal|transverse|Polarisation/i,'wave type','A wave passes through a polarising filter and intensity changes.','Use oscillation direction to distinguish wave type.','polarisation evidence','Explain why only transverse waves can be polarised.','Thinking polarisation changes wavelength.'),
    C(/Phase difference/i,'phase','Two points on a wave are separated by a fraction of a wavelength.','Convert path difference into phase difference.','phase relation','Use fraction of wavelength × 360° or 2π radians.','Using degrees when the answer requires radians without converting.'),
    C(/Superposition|interference/i,'interference','Two coherent waves overlap and produce maxima and minima.','Apply superposition to explain constructive and destructive interference.','path difference test','Compare path difference with nλ or (n + 1/2)λ.','Saying waves cancel permanently rather than superpose at that position.'),
    C(/Stationary waves|Harmonics/i,'stationary waves','A stretched string forms nodes and antinodes at fixed positions.','Connect boundary conditions with harmonic wavelengths and frequencies.','harmonic pattern','Sketch nodes and antinodes before calculating wavelength.','Confusing wave speed with particle speed on the string.'),
    C(/Refraction|refractive index|critical angle|optical fibres/i,'refraction','Light enters a denser medium and changes direction at the boundary.','Use refractive index, Snell’s law and critical angle.','refraction calculation','Use n1 sinθ1 = n2 sinθ2 or sin C = 1/n for air boundary.','Measuring angles from the surface instead of the normal.'),
    C(/Young double-slit|fringe spacing/i,'double-slit interference','A laser produces evenly spaced bright fringes on a distant screen.','Relate fringe spacing to wavelength, screen distance and slit separation.','double-slit equation','Use w = λD/s and keep all lengths in metres.','Using slit width instead of slit separation.'),
    C(/Diffraction grating|Diffraction/i,'diffraction','A grating creates multiple bright orders at different angles.','Use path difference and grating spacing to calculate wavelength or angle.','grating equation','Use d sinθ = nλ and identify the order number correctly.','Confusing diffraction order n with refractive index.'),
    C(/Scalars|vectors|Resolving vectors|equilibrium/i,'vector reasoning','A force acts at an angle and only one component affects motion.','Resolve vectors perpendicular to each other and apply equilibrium.','component method','Draw the triangle, choose sin/cos from the angle, then sum components.','Using the full angled force where only a component acts.'),
    C(/Displacement|velocity|acceleration|Motion graphs|SUVAT|Constant acceleration/i,'kinematics','A vehicle accelerates uniformly and the graph area gives displacement.','Choose definitions, graph relationships or SUVAT depending on the data.','constant acceleration model','List known SUVAT quantities and select an equation missing only one unknown.','Using SUVAT when acceleration is not constant.'),
    C(/Projectile motion/i,'projectiles','A ball is launched horizontally from a height while gravity acts vertically.','Split motion into horizontal constant velocity and vertical acceleration.','projectile method','Solve vertical motion for time, then use horizontal motion for range.','Putting gravity into the horizontal equation.'),
    C(/Newton|Free-body|drag|terminal/i,'forces and motion','An object accelerates at first, then reaches terminal speed as drag increases.','Draw forces, find resultant force, then connect to acceleration.','force model','Use F = ma with the resultant force, not one individual force.','Saying terminal velocity means no forces act.'),
    C(/Momentum|impulse|Conservation of momentum/i,'momentum','Two trolleys collide and stick together after impact.','Use momentum conservation for a closed system and impulse for force-time change.','momentum table','Write momentum before = momentum after, including signs.','Ignoring direction when momentum is a vector.'),
    C(/Work|energy|power|efficiency/i,'energy mechanics','A motor lifts a load and transfers energy over time.','Track work done, energy stores, power and efficiency.','energy chain','Use work done = force × distance in the direction of the force, then calculate power or efficiency.','Using total distance when the force is not along the motion.'),
    C(/Moments|couples/i,'moments','A beam balances because clockwise and anticlockwise moments are equal.','Use perpendicular distance from pivot to line of action.','moment balance','Take moments about a convenient pivot and include all relevant forces.','Using the length of the beam instead of perpendicular distance.'),
    C(/Hooke|Young modulus|stress|strain|materials|Density/i,'materials','A wire stretches elastically under load before reaching its limit of proportionality.','Connect microscopic material behaviour to stress, strain and stored energy.','Young modulus method','Use stress = F/A, strain = ΔL/L, then E = stress/strain.','Using extension instead of strain when comparing different wires.'),
    C(/Charge|current|potential difference|resistance|Ohm|I–V|IV/i,'circuit basics','A component transfers energy to charges as current flows.','Link charge flow, energy transfer and resistance.','circuit relation','Use Q = It, V = E/Q and R = V/I with clear units.','Thinking current is used up by components.'),
    C(/Resistivity/i,'resistivity','A long thin wire has higher resistance than a short thick wire of the same material.','Use material, length and area to explain resistance.','resistivity method','Use R = ρL/A and calculate cross-sectional area from diameter.','Using diameter instead of cross-sectional area.'),
    C(/Series circuits|Parallel circuits|Circuit problem/i,'circuit networks','A mixed circuit needs simplification before current and pd can be found.','Apply conservation of charge and energy to series and parallel sections.','network reduction','Replace sections step by step, then work backwards for current and p.d.','Applying the series rule to a parallel branch.'),
    C(/Potential dividers|Sensors/i,'potential dividers','A sensor circuit changes output voltage when resistance changes.','Use the ratio of resistances to find output voltage.','divider logic','Use Vout = Vin × Rpart/Rtotal for the chosen output resistor.','Taking output across the wrong resistor.'),
    C(/EMF|internal resistance/i,'emf and internal resistance','Terminal p.d. falls as current increases because energy is wasted inside the cell.','Separate emf, terminal p.d. and lost volts.','internal resistance graph','Use V = ε − Ir; gradient is −r and intercept is ε.','Calling emf the same as terminal voltage under load.'),
    C(/Radians|angular speed|Centripetal/i,'circular motion','A satellite changes direction continuously even if its speed is constant.','Link centripetal acceleration to change in velocity direction.','circular motion model','Use a = v²/r = ω²r and resultant force toward the centre.','Adding a fictional outward centripetal force.'),
    C(/simple harmonic|SHM|spring|pendulum|damping|resonance/i,'SHM','An oscillator accelerates toward equilibrium and reaches maximum speed at equilibrium.','Use a = -ω²x and energy changes during oscillation.','SHM test','Show acceleration is proportional to displacement and opposite in direction.','Thinking acceleration is zero at maximum displacement.'),
    C(/Internal energy|Specific heat|latent heat|Gas laws|Ideal gas|kinetic theory/i,'thermal physics','A gas is heated or compressed and its pressure changes because particles collide differently.','Connect macroscopic variables to particle motion and energy transfer.','thermal model','Choose E = mcΔθ, E = ml or pV = nRT/NkT according to the process.','Using Celsius in gas-law equations.'),
    C(/field concept|Gravitational field|potential|orbits|Kepler/i,'gravitational fields','A planet remains in orbit because gravitational force supplies centripetal force.','Use inverse-square field ideas and potential energy with signs.','orbital field model','Combine GMm/r² with mv²/r or use g = GM/r².','Forgetting gravitational potential is negative when zero is at infinity.'),
    C(/Electric fields|Coulomb|Electric potential|Uniform electric fields/i,'electric fields','A charged particle accelerates between plates due to a uniform electric field.','Link force, field strength, potential and energy.','electric field model','Use F = EQ and E = V/d for uniform fields.','Confusing electric field strength with electric potential.'),
    C(/Capacitance|Capacitor/i,'capacitors','A capacitor charges rapidly at first and then more slowly as p.d. rises.','Use exponential behaviour and time constant to explain charge/discharge.','capacitor method','Use τ = RC and exponential equations for Q, V or I.','Treating capacitor discharge as linear.'),
    C(/Magnetic flux density|force on currents|charged particles|Cyclotron|velocity selector/i,'magnetic fields','A current-carrying wire experiences a force in a magnetic field.','Use Fleming’s left-hand rule and the correct magnetic force equation.','magnetic force','Use F = BIL or F = BQv when motion is perpendicular to the field.','Forgetting the perpendicular condition.'),
    C(/Magnetic flux|Faraday|Lenz|induction/i,'electromagnetic induction','A changing magnetic flux linkage induces an emf opposing the change.','Use Faraday’s law and Lenz’s law together.','induction reasoning','Find change in flux linkage per second and use the sign for direction.','Using flux instead of flux linkage when there are multiple turns.'),
    C(/Rutherford|alpha|beta|gamma|inverse-square|background/i,'nuclear radiation','Radiation count rate changes with absorber, distance and background correction.','Identify radiation type and process data carefully.','radiation data method','Subtract background first, then apply absorption or inverse-square reasoning.','Using raw count rate without background correction.'),
    C(/Radioactive decay|half-life|decay constant/i,'radioactive decay','A sample decays by the same fraction in equal time intervals.','Use exponential decay and half-life relationships.','decay model','Use A = A0e^-λt and T1/2 = ln2/λ.','Thinking half-life means a constant number decays each second.'),
    C(/Nuclear radius|density/i,'nuclear scale','Electron diffraction gives evidence that nuclear radius scales with nucleon number.','Use R = r0A^(1/3) and density assumptions.','nuclear radius model','Calculate radius, volume and density using consistent SI units.','Using atomic radius instead of nuclear radius.'),
    C(/Binding energy|mass defect|fission|fusion|reactor|safety/i,'nuclear energy','Energy is released when products have greater binding energy per nucleon.','Link mass defect, binding energy and nuclear stability.','binding-energy method','Convert mass difference to energy using E = Δmc² or 1 u = 931.5 MeV.','Forgetting that fission and fusion release energy in different mass regions.')
  ];
  function C(match,key,hook,starter,model,method,pitfall){return {match,key,hook,starter,model,method,pitfall};}
  const defaultConcept = C(/.*/,'AQA physics','This lesson connects a specification statement to the way AQA asks students to reason, calculate and evaluate evidence.','Start by asking students to define the central idea, identify a quantity that can be measured and predict one common trap.','principle → quantities → evidence','State the principle, choose the quantities, apply the equation if needed, then interpret the answer.','Giving a formula answer without explaining the physics.');
  function conceptFor(lesson){
    // Match the lesson itself first: broad topic names (e.g. "fields") must
    // never select a different concept for every lesson in that topic.
    const eligible=CONCEPTS.filter(c=>{
      const scope={
        'wave quantities':'waves','wave type':'waves','phase':'waves','interference':'waves','stationary waves':'waves','refraction':'waves','double-slit interference':'waves','diffraction':'waves',
        'vector reasoning':'mechanics-materials','kinematics':'mechanics-materials','projectiles':'mechanics-materials','forces and motion':'mechanics-materials','momentum':'mechanics-materials','energy mechanics':'mechanics-materials','moments':'mechanics-materials','materials':'mechanics-materials',
        'circuit basics':'electricity','resistivity':'electricity','circuit networks':'electricity','potential dividers':'electricity','emf and internal resistance':'electricity',
        'SHM':'further-mechanics','thermal physics':'further-mechanics','particle classification':'particles','particles and photons':'particles','wave-particle duality':'particles'
      };
      if(scope[c.key]&&scope[c.key]!==lesson.topicId)return false;
      if(['data quality','error analysis','units and prefixes','estimation'].includes(c.key)&&lesson.topicId!=='measurements')return false;
      if(c.key==='gravitational fields')return lesson.topicId==='fields'&&/gravit|orbit|Kepler|field concept/i.test(lesson.title);
      return true;
    });
    const specific=[[/EMF|internal resistance/i,'emf and internal resistance'],[/Young double-slit/i,'double-slit interference'],[/nuclear radius|Closest approach/i,'nuclear scale']].find(([match,key])=>match.test(lesson.title)&&eligible.some(c=>c.key===key));
    if(specific)return eligible.find(c=>c.key===specific[1]);
    return eligible.find(c=>c.match.test(lesson.title)) || eligible.find(c=>c.match.test(lesson.focus)) || defaultConcept;
  }
  function profileFor(id){
    const raw = typeof id === 'string' ? getLesson(id) : id;
    if(!raw) return null;
    const base = baseBuild(raw), c = conceptFor(raw);
    const firstEquation = base.equations?.[0] || [c.model, c.model, c.method];
    const title = raw.title;
    const worked = {
      question:`A student is given an unfamiliar AQA question on ${title.toLowerCase()}. How should they set up the answer?`,
      steps:[`Identify the topic: ${raw.topicCode} ${raw.topicTitle}.`,`State the central model: ${c.model}.`,c.method,`Use the lesson focus: ${raw.focus}`,`Finish by checking units, significant figures and whether the answer is physically sensible.`],
      answer:`Key examiner point: ${c.pitfall}`
    };
    const exam = [
      {marks:2,q:`Define the key idea behind ${title} and give one relevant unit, quantity or conservation rule.`},
      {marks:3,q:`Explain how ${c.key} applies in a practical or unfamiliar context. Your answer should refer to evidence or measurable quantities.`},
      {marks:4,q:`Use ${firstEquation[1] || c.model} to solve a calculation linked to ${title}. Show substitutions, units and a final reasonableness check.`},
      {marks:6,q:`A student investigates ${title.toLowerCase()}. Evaluate the method, the quality of evidence and one improvement that would make the conclusion more reliable.`}
    ];
    const starter = [`Retrieval: ${c.starter}`,`Recall one equation or definition from the previous linked lesson.`,`Predict the most likely mistake: ${c.pitfall}`];
    const checkpoints = [`What quantity is being measured or conserved in this lesson?`,`Which equation, graph or model gives the strongest evidence?`,`What assumption is being made, and when might it fail?`];
    return {...base, phase3:true, concept:c, hook:c.hook, starter, worked, exam, checkpoints, primaryEquation:firstEquation};
  }
  function renderProfileIntoReader(profile){
    const shell = document.querySelector('.lesson-reader-shell:not([hidden])');
    if(!shell || !profile) return;
    const actions = shell.querySelector('.lesson-reader-actions');
    if(actions && !actions.querySelector('[data-teacher-presentation]')) actions.insertAdjacentHTML('afterbegin','<button type="button" data-teacher-presentation>Teacher presentation</button>');
    const overview = shell.querySelector('#lr-overview');
    if(overview && !overview.querySelector('.phase3-profile-note')) overview.insertAdjacentHTML('beforeend',`<div class="phase3-profile-note"><strong>Phase 3 lesson hook</strong><p>${esc(profile.hook)}</p></div>`);
    const worked = shell.querySelector('.worked-example');
    if(worked) worked.innerHTML = `<strong>${esc(profile.worked.question)}</strong><ol>${profile.worked.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p><b>Examiner check:</b> ${esc(profile.worked.answer)}</p>`;
    const exam = shell.querySelector('.exam-list');
    if(exam) exam.innerHTML = profile.exam.map(x=>`<article><span>${x.marks} marks</span><p>${esc(x.q)}</p><textarea rows="3" placeholder="Write your answer…"></textarea></article>`).join('');
    actions?.querySelector('[data-teacher-presentation]')?.addEventListener('click', () => openDeck(profile.id));
  }
  function buildDeck(id){
    const p = profileFor(id); if(!p) return null;
    const chunks = p.chunks || [];
    const eq = p.primaryEquation || p.equations?.[0] || [p.concept.model,p.concept.model,p.concept.method];
    return {id:p.id,title:p.title,subtitle:`${p.topicCode} · ${p.ref} · ${p.year}`,slides:[
      S('title',p.topicCode,p.title,[p.hook,`Lesson focus: ${p.focus}`],'Teacher cue: ask students what they already know before revealing the model.'),
      S('bullets','Retrieval starter',`Before ${p.title}`,[...p.starter],'Keep answers hidden until students have committed to an idea.'),
      S('bullets','Learning objectives','By the end of the lesson',p.objectives || [`Explain ${p.title}.`,`Apply the relevant model.`,`Answer an AQA-style question.`]),
      S('bullets',chunks[0]?.title || 'Build the idea','Textbook teaching chunk',(chunks[0]?.text || [p.topicIntro,p.focus]).slice(0,4)),
      S('equation','Equation / model focus',eq[0],[eq[2] || p.concept.method,`Common mistake: ${p.concept.pitfall}`],null,eq[1] || p.concept.model),
      S('bullets',chunks[1]?.title || 'Connect the physics','Guided explanation',(chunks[1]?.text || [p.concept.method]).slice(0,4)),
      S('bullets','Worked example method',p.worked.question,p.worked.steps),
      S('bullets','Student checkpoint','Pause and check',p.checkpoints),
      S('bullets','AQA-style practice','Use these as board questions',p.exam.map(q=>`${q.marks} marks: ${q.q}`)),
      S('bullets','Plenary and mastery','Exit ticket',[`One-sentence explanation of ${p.title}.`,`One equation/model and when it applies.`,`One misconception to avoid: ${p.concept.pitfall}`])
    ]};
  }
  function S(type,kicker,title,bullets,note,equation){return {type,kicker,title,bullets,note,equation};}
  let deckShell=null, currentDeck=null, slideIndex=0;
  function ensureDeckShell(){
    if(deckShell) return deckShell;
    deckShell=document.createElement('div'); deckShell.className='phase3-deck-shell'; deckShell.hidden=true;
    deckShell.innerHTML=`<div class="phase3-deck-backdrop" data-close-deck></div><section class="phase3-deck" role="dialog" aria-modal="true" aria-label="Teacher presentation"><aside class="phase3-deck-side"><div><span class="phase3-kicker">Teacher deck</span><h2 data-deck-title></h2><p data-deck-subtitle></p></div><div class="phase3-slide-list" data-slide-list></div><div class="phase3-deck-tools"><button type="button" class="primary" data-print-deck>Print / PDF</button><button type="button" data-copy-deck>Copy outline</button><button type="button" data-close-deck>Close</button></div></aside><main class="phase3-main"><div class="phase3-top"><strong data-slide-count></strong><span>← / → keys work</span></div><article class="phase3-slide" tabindex="0"></article><footer class="phase3-bottom"><div class="phase3-progress"><span></span></div><nav class="phase3-nav"><button type="button" data-prev-slide>←</button><button type="button" data-next-slide>→</button></nav></footer></main></section>`;
    document.body.appendChild(deckShell);
    deckShell.addEventListener('click',e=>{if(e.target.closest('[data-close-deck]')) closeDeck(); if(e.target.closest('[data-prev-slide]')) moveSlide(-1); if(e.target.closest('[data-next-slide]')) moveSlide(1); if(e.target.closest('[data-print-deck]')) window.print(); if(e.target.closest('[data-copy-deck]')) copyDeck(); const b=e.target.closest('[data-slide-index]'); if(b){slideIndex=Number(b.dataset.slideIndex); renderDeck();}});
    document.addEventListener('keydown',e=>{if(deckShell.hidden) return; if(e.key==='Escape') closeDeck(); if(e.key==='ArrowLeft') moveSlide(-1); if(e.key==='ArrowRight') moveSlide(1);});
    return deckShell;
  }
  function slideHtml(slide){
    const bullets=(slide.bullets||[]).map(x=>`<li>${esc(x)}</li>`).join('');
    if(slide.type==='title') return `<div class="phase3-kicker">${esc(slide.kicker)}</div><h1>${esc(slide.title)}</h1><ul>${bullets}</ul>${slide.note?`<div class="phase3-note">${esc(slide.note)}</div>`:''}`;
    if(slide.type==='equation') return `<div class="phase3-kicker">${esc(slide.kicker)}</div><h2>${esc(slide.title)}</h2><div class="phase3-equation">${esc(slide.equation)}</div><ul>${bullets}</ul>`;
    return `<div class="phase3-kicker">${esc(slide.kicker)}</div><h2>${esc(slide.title)}</h2><ul>${bullets}</ul>${slide.note?`<div class="phase3-note">${esc(slide.note)}</div>`:''}`;
  }
  function renderDeck(){
    if(!currentDeck) return;
    const shell=ensureDeckShell(), slide=currentDeck.slides[slideIndex] || currentDeck.slides[0];
    shell.querySelector('[data-deck-title]').textContent=currentDeck.title;
    shell.querySelector('[data-deck-subtitle]').textContent=currentDeck.subtitle;
    shell.querySelector('[data-slide-count]').textContent=`Slide ${slideIndex+1} / ${currentDeck.slides.length}`;
    shell.querySelector('.phase3-slide').innerHTML=slideHtml(slide);
    shell.querySelector('.phase3-progress span').style.width=`${((slideIndex+1)/currentDeck.slides.length)*100}%`;
    shell.querySelector('[data-slide-list]').innerHTML=currentDeck.slides.map((s,i)=>`<button type="button" data-slide-index="${i}" class="${i===slideIndex?'active':''}">${i+1}. ${esc(s.title)}</button>`).join('');
  }
  function openDeck(id){ currentDeck=buildDeck(id); if(!currentDeck) return; slideIndex=0; ensureDeckShell().hidden=false; document.body.classList.add('lesson-reader-open'); renderDeck(); }
  function closeDeck(){ if(deckShell) deckShell.hidden=true; document.body.classList.remove('lesson-reader-open'); }
  function moveSlide(delta){ if(!currentDeck) return; slideIndex=Math.max(0,Math.min(currentDeck.slides.length-1,slideIndex+delta)); renderDeck(); }
  function copyDeck(){ if(!currentDeck) return; const text=currentDeck.slides.map((s,i)=>`${i+1}. ${s.title}\n${(s.bullets||[]).map(b=>`- ${b}`).join('\n')}`).join('\n\n'); navigator.clipboard?.writeText(text); }
  function enhanceMap(){
    document.querySelectorAll('.curriculum-lesson[data-lesson-id]').forEach(card=>{
      if(card.dataset.phase3Ready) return; card.dataset.phase3Ready='1';
      const copy=card.querySelector('.lesson-map-copy'); if(copy) copy.insertAdjacentHTML('beforeend',`<button type="button" class="phase3-map-present" data-present-lesson="${esc(card.dataset.lessonId)}">Open teacher presentation</button>`);
    });
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-present-lesson]'); if(b){e.preventDefault(); e.stopPropagation(); openDeck(b.dataset.presentLesson);}});
  window.addEventListener('alevel:lesson-selected',e=>{const profile=profileFor(e.detail?.id); renderProfileIntoReader(profile);});
  const start=()=>{enhanceMap(); const root=document.getElementById('courseHome'); if(root)new MutationObserver(enhanceMap).observe(root,{childList:true,subtree:true});};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  window.ALEVEL_PHASE3={profile:profileFor,deck:buildDeck,openPresentation:openDeck};
})();
