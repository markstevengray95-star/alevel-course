(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = value => String(value ?? '').replace(/\s+/g,' ').trim();
  const phase3 = window.ALEVEL_PHASE3;
  if(!phase3?.profile || !phase3?.deck) return;

  const originalProfile = phase3.profile.bind(phase3);
  const originalDeck = phase3.deck.bind(phase3);

  const SECTION_DEPTH = [
    ['3.1',{strand:'Measurement and data',evidence:'measured values, repeat readings, graph features and uncertainty',representation:'table → graph → uncertainty statement',precision:'Use SI units, sensible significant figures and distinguish random from systematic effects.'}],
    ['3.2',{strand:'Particles and quantum physics',evidence:'conservation quantities, energy changes, interaction evidence and discrete observations',representation:'particle/energy diagram → conservation table → equation',precision:'Name conserved quantities explicitly and connect quantum evidence to the model rather than using classical intuition.'}],
    ['3.3',{strand:'Waves and optics',evidence:'wave graphs, path/phase difference, fringe or diffraction patterns and ray geometry',representation:'wave/ray sketch → labelled quantities → relationship',precision:'Keep phase, path difference, wavelength and angles distinct; measure angles from the normal where required.'}],
    ['3.4',{strand:'Mechanics and materials',evidence:'motion graphs, force/vector diagrams, momentum/energy changes and material-response data',representation:'diagram/graph → component or conservation model → calculation',precision:'Define a sign convention, use the resultant force, and state assumptions such as constant acceleration or elastic behaviour.'}],
    ['3.5',{strand:'Electricity',evidence:'circuit measurements, I–V behaviour, gradients/intercepts and conservation at junctions/loops',representation:'circuit diagram → measured quantities → circuit equation',precision:'Separate charge, current, potential difference, emf and resistance; include units and identify where voltage is measured.'}],
    ['3.6',{strand:'Further mechanics and thermal physics',evidence:'oscillation/circular-motion graphs, energy changes and macroscopic gas/thermal measurements',representation:'motion/energy graph → governing model → prediction',precision:'Use radians and kelvin where required, and distinguish centre-directed acceleration from a new force.'}],
    ['3.7',{strand:'Fields',evidence:'field geometry, potential/field graphs, capacitor transients and flux-linkage changes',representation:'field/geometry sketch → sign/direction reasoning → equation',precision:'Keep scalar potential separate from vector field strength and make direction/sign conventions explicit.'}],
    ['3.8',{strand:'Nuclear physics',evidence:'count-rate data, exponential decay, scattering evidence, nuclear-scale data and binding-energy changes',representation:'nuclear/decay/energy model → data pattern → quantitative conclusion',precision:'Correct for background where needed, conserve nucleon/proton number, and distinguish random individual decay from statistical predictability.'}]
  ];

  const TOPIC_RULES = [
    [/uncertainty|error bars|random|systematic/i,'Quantify the quality of the evidence, then explain whether the limitation changes precision, accuracy or confidence in the conclusion.'],
    [/photoelectric|photon|work function|threshold/i,'Use one-photon–one-electron reasoning and link frequency to photon energy; intensity changes photon arrival rate.'],
    [/conservation|quark|hadron|lepton|interaction/i,'Build a before/after conservation table and check charge plus every relevant quantum number.'],
    [/stationary|harmonic|interference|double-slit|diffraction|phase/i,'Identify the condition for constructive/destructive behaviour and tie the observed pattern to path or phase difference.'],
    [/projectile|SUVAT|constant acceleration/i,'Separate perpendicular components, state the acceleration model, and use the common time variable to reconnect the motions.'],
    [/momentum|impulse/i,'Choose a closed system, assign directions, and distinguish momentum conservation from kinetic-energy conservation.'],
    [/Young modulus|stress|strain|elastic/i,'Link force and geometry to stress/strain, then use the linear-region gradient as a material property.'],
    [/resistivity/i,'Separate material property from sample geometry and use cross-sectional area rather than diameter directly.'],
    [/potential divider/i,'Mark exactly which resistor the output is measured across before applying the voltage ratio.'],
    [/internal resistance|emf|terminal/i,'Separate energy supplied per coulomb from terminal p.d.; use the V–I intercept and gradient as evidence.'],
    [/centripetal|circular/i,'Identify the real inward resultant force and explain why constant speed can still mean changing velocity.'],
    [/simple harmonic|SHM|resonance/i,'Test the defining SHM condition and connect displacement, acceleration, speed and energy at key positions.'],
    [/ideal gas|kinetic theory|specific heat|latent/i,'Connect the macroscopic measurement to the microscopic energy/particle model and use absolute temperature where required.'],
    [/gravitational|electric field|potential/i,'Use field geometry and sign/direction before calculation; distinguish work/energy ideas from force ideas.'],
    [/capacitor|time constant/i,'Treat charging/discharging as exponential and connect the time constant to a measurable fraction of the change.'],
    [/magnetic flux|Faraday|Lenz|induction/i,'Identify what changes the flux linkage, calculate its rate of change, then use Lenz’s law for direction.'],
    [/half-life|decay constant|radioactive decay/i,'Use equal-fraction reasoning, not equal-number reasoning, and connect the exponential model to half-life.'],
    [/binding energy|mass defect|fission|fusion/i,'Compare initial and final binding/mass states and explain why the mass difference appears as released energy.']
  ];

  function sectionFor(ref){
    const value = clean(ref);
    return SECTION_DEPTH.find(([prefix]) => value.startsWith(prefix))?.[1] || {
      strand:'AQA Physics', evidence:'measurable quantities and model predictions', representation:'words → model → evidence', precision:'Use precise physics vocabulary, units and a conclusion tied to the evidence.'
    };
  }

  function topicRule(profile){
    const text = `${profile?.title || ''} ${profile?.focus || ''} ${profile?.concept?.key || ''}`;
    return TOPIC_RULES.find(([pattern]) => pattern.test(text))?.[1] || `Use the lesson focus as the success criterion: ${clean(profile?.focus)} Then show how the evidence supports it.`;
  }

  function contentLength(profile){
    return (profile?.chunks || []).reduce((sum,chunk) => sum + (chunk?.text || []).join(' ').length, 0);
  }

  function forProfile(profile){
    if(!profile) return null;
    const section = sectionFor(profile.ref);
    const equation = profile.primaryEquation || profile.equations?.[0] || [profile.concept?.model,profile.concept?.model,profile.concept?.method];
    const shortLesson = (profile.chunks || []).length < 3 || contentLength(profile) < 900;
    const exactFocus = clean(profile.focus || profile.title);
    const model = clean(equation?.[1] || profile.concept?.model || 'the relevant physics relationship');
    const concept = clean(profile.concept?.key || profile.title);
    const misconception = clean(profile.concept?.pitfall || profile.misconceptions?.[0] || 'a statement that is not supported by the evidence');

    return {
      ref:clean(profile.ref),
      strand:section.strand,
      exactFocus,
      shortLesson,
      depthLabel:shortLesson?'Depth boost applied':'Specification depth',
      teach:[
        `Know — define ${concept} precisely and identify the quantities, units or conserved properties involved.`,
        `Model — represent the idea using ${model}; state when the model is valid and any assumption it makes.`,
        `Evidence — use ${section.evidence} to decide whether the model is supported.`,
        `Apply — ${topicRule(profile)}`,
        `Conclude — answer the exact mapped AQA focus: ${exactFocus}`
      ],
      precision:section.precision,
      representation:section.representation,
      misconception,
      commands:[
        `Identify: name the quantity, feature or rule central to ${profile.title}.`,
        `Describe: state the observable pattern without explaining it yet.`,
        `Explain: link the pattern to ${concept} using ${model}.`,
        `Apply: use the model in an unfamiliar context and show working/units where relevant.`,
        `Justify: select evidence from ${section.evidence} and show why it supports the conclusion.`,
        `Evaluate: identify a limitation or assumption, judge its effect, then propose a targeted improvement.`
      ]
    };
  }

  phase3.profile = id => {
    const profile = originalProfile(id);
    return profile ? {...profile, specDepth:forProfile(profile)} : profile;
  };

  phase3.deck = id => {
    const base = originalDeck(id);
    const profile = phase3.profile(id);
    const depth = profile?.specDepth;
    if(!base || !depth) return base;
    const slides = [...(base.slides || [])];
    slides.splice(Math.min(3,slides.length),0,{
      type:'bullets',
      kicker:`AQA ${depth.ref}`,
      title:`Specification precision · ${depth.strand}`,
      bullets:[depth.exactFocus,...depth.teach.slice(0,4),`Representation: ${depth.representation}`],
      note:`${depth.depthLabel}. ${depth.precision}`
    });
    return {...base,slides,specDepth:depth};
  };

  function renderReader(id){
    const profile = phase3.profile(id);
    const depth = profile?.specDepth;
    const reader = document.querySelector('.lesson-reader-shell:not([hidden])');
    if(!reader || !profile || !depth) return;
    const overview = reader.querySelector('#lr-overview') || reader.querySelector('.lesson-reader-content') || reader;
    overview.querySelector('.spec-depth-panel')?.remove();
    const section = document.createElement('section');
    section.className = `spec-depth-panel${depth.shortLesson?' is-boosted':''}`;
    section.innerHTML = `
      <div class="spec-depth-head"><div><span>${esc(depth.depthLabel)}</span><h3>AQA ${esc(depth.ref)} · ${esc(depth.strand)}</h3></div><b>${depth.shortLesson?'Expanded from mapped focus':'Mapped focus secured'}</b></div>
      <p class="spec-depth-focus"><strong>Exact lesson focus:</strong> ${esc(depth.exactFocus)}</p>
      <div class="spec-depth-teach">${depth.teach.map((item,index)=>`<article><span>${index+1}</span><p>${esc(item)}</p></article>`).join('')}</div>
      <div class="spec-depth-grid"><article><strong>Representation</strong><p>${esc(depth.representation)}</p></article><article><strong>Precision check</strong><p>${esc(depth.precision)}</p></article></div>
      <details class="spec-depth-commands"><summary>Command-word ladder</summary><ol>${depth.commands.map(item=>`<li>${esc(item)}</li>`).join('')}</ol></details>`;
    overview.appendChild(section);
  }

  window.addEventListener('alevel:lesson-selected',event => {
    const id = event.detail?.id;
    if(id) window.setTimeout(()=>renderReader(id),0);
  });

  const active = window.ALEVEL_ACTIVE_LESSON?.id;
  if(active) window.setTimeout(()=>renderReader(active),0);

  window.ALEVEL_SPEC_DEPTH = {forProfile, originalProfile, originalDeck};
})();