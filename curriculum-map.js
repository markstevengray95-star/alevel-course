(() => {
  const L = (id, title, ref, focus, type = 'lesson', minutes = 60) => ({ id, title, ref, focus, type, minutes });

  const curriculum = [
    {
      id: 'measurements', code: 'AQA 3.1', title: 'Measurements and their errors', year: 'Year 12',
      lessons: [
        L('m01','SI base units, derived units and prefixes','3.1.1','Use SI base and derived units confidently; convert prefixes and standard form.'),
        L('m02','Orders of magnitude and estimation','3.1.3','Estimate physical quantities and judge whether calculated answers are physically reasonable.'),
        L('m03','Accuracy, precision and resolution','3.1.2','Distinguish accuracy, precision, repeatability, reproducibility and resolution.'),
        L('m04','Random and systematic errors','3.1.2','Identify sources of random/systematic error and improve experimental methods.'),
        L('m05','Absolute, fractional and percentage uncertainty','3.1.2','Calculate and interpret absolute, fractional and percentage uncertainties.'),
        L('m06','Combining uncertainties','3.1.2','Combine uncertainties for sums, differences, products, quotients and powers.'),
        L('m07','Graphs, error bars, gradients and intercepts','3.1.2','Use error bars and determine uncertainty in gradients and intercepts.', 'skills'),
        L('m08','Measurement mastery and practical data clinic','3.1.1–3.1.3','Apply measurement, uncertainty, graphing and estimation skills to unfamiliar data.', 'review')
      ]
    },
    {
      id: 'particles', code: 'AQA 3.2', title: 'Particles and radiation', year: 'Year 12',
      lessons: [
        L('p01','Atomic structure, nuclides and isotopes','3.2.1.1','Use proton number, nucleon number and nuclide notation; calculate specific charge.'),
        L('p02','Stable and unstable nuclei','3.2.1.2','Explain nuclear stability, strong nuclear force, alpha decay and beta decay.'),
        L('p03','Particles, antiparticles and photons','3.2.1.3','Compare particles with antiparticles and use photon energy and rest-energy ideas.'),
        L('p04','Annihilation and pair production','3.2.1.3','Apply conservation of energy and momentum to annihilation and pair production.'),
        L('p05','The four fundamental interactions','3.2.1.4','Compare gravitational, electromagnetic, weak and strong interactions.'),
        L('p06','Exchange particles and interaction diagrams','3.2.1.4','Use virtual photons and W bosons in simple interaction diagrams.'),
        L('p07','Hadrons, baryons and mesons','3.2.1.5','Classify hadrons and apply baryon number and strangeness.'),
        L('p08','Leptons and lepton number','3.2.1.5','Classify leptons and use separate electron/muon lepton numbers.'),
        L('p09','Quarks and antiquarks','3.2.1.6','Use up, down and strange quark properties to build specified hadrons.'),
        L('p10','Conservation laws in particle reactions','3.2.1.7','Test particle reactions using charge, baryon number, lepton number, strangeness, energy and momentum.'),
        L('p11','The photoelectric effect','3.2.2.1','Explain threshold frequency, work function and stopping potential using the photon model.'),
        L('p12','Electron collisions, excitation and ionisation','3.2.2.2','Use electron-volts and explain excitation/ionisation by electron collisions.'),
        L('p13','Energy levels and line spectra','3.2.2.3','Interpret energy-level diagrams and calculate photon frequencies/wavelengths.'),
        L('p14','Wave–particle duality and de Broglie wavelength','3.2.2.4','Apply the de Broglie relation and explain electron diffraction.'),
        L('p15','Particles and quantum phenomena mastery','3.2','Connect particle classifications, conservation laws and quantum evidence in exam-style problems.', 'review')
      ]
    },
    {
      id: 'waves', code: 'AQA 3.3', title: 'Waves', year: 'Year 12',
      lessons: [
        L('w01','Progressive waves and wave quantities','3.3.1.1','Use amplitude, frequency, period, wavelength and wave speed.'),
        L('w02','Longitudinal and transverse waves','3.3.1.2','Relate oscillation direction to energy transfer and distinguish wave types.'),
        L('w03','Polarisation','3.3.1.2','Explain polarisation as evidence of transverse waves and apply it to aerials/polarisers.'),
        L('w04','Phase difference and wave graphs','3.3.1.1','Interpret displacement–distance and displacement–time graphs and calculate phase difference.'),
        L('w05','Superposition and interference','3.3.1.3 / 3.3.2.2','Apply superposition to constructive and destructive interference.'),
        L('w06','Stationary waves','3.3.1.3','Explain nodes, antinodes and formation of stationary waves.'),
        L('w07','Harmonics on strings','3.3.1.3','Relate string length, wave speed and frequency for harmonics.', 'practical'),
        L('w08','Refraction and refractive index','3.3.2.1','Use refractive index and Snell’s law to analyse refraction.'),
        L('w09','Total internal reflection and optical fibres','3.3.2.1','Calculate critical angle and explain optical-fibre transmission.'),
        L('w10','Young double-slit interference','3.3.2.2','Use fringe spacing and explain coherent sources in double-slit interference.', 'practical'),
        L('w11','Diffraction','3.3.2.3','Explain how diffraction depends on wavelength and aperture size.'),
        L('w12','Diffraction gratings','3.3.2.4','Use the grating equation and determine wavelength from diffraction patterns.', 'practical'),
        L('w13','Wave practical analysis and uncertainty','3.3','Process wave data, gradients and uncertainties from required-practical contexts.', 'skills'),
        L('w14','Waves mastery and synoptic problems','3.3','Solve multi-step problems combining wave speed, phase, interference, refraction and diffraction.', 'review')
      ]
    },
    {
      id: 'mechanics-materials', code: 'AQA 3.4', title: 'Mechanics and materials', year: 'Year 12',
      lessons: [
        L('mm01','Scalars and vectors','3.4.1.1','Distinguish scalar/vector quantities and add perpendicular vectors.'),
        L('mm02','Resolving vectors and equilibrium','3.4.1.1 / 3.4.1.4','Resolve forces into components and apply equilibrium conditions.'),
        L('mm03','Displacement, velocity and acceleration','3.4.1.2','Use definitions of displacement, velocity and acceleration.'),
        L('mm04','Motion graphs','3.4.1.2','Interpret gradients and areas on displacement, velocity and acceleration graphs.'),
        L('mm05','Constant acceleration equations','3.4.1.2','Select and use SUVAT equations under constant acceleration.'),
        L('mm06','Projectile motion','3.4.1.2','Resolve projectile motion into independent horizontal and vertical components.'),
        L('mm07','Determining g by free fall','3.4.1.2','Plan, collect and analyse free-fall data to determine gravitational acceleration.', 'practical'),
        L('mm08','Newton’s laws of motion','3.4.1.3','Apply Newton’s three laws to force and acceleration problems.'),
        L('mm09','Free-body diagrams, drag and terminal speed','3.4.1.3','Model changing resultant force, drag and terminal motion.'),
        L('mm10','Momentum and impulse','3.4.1.5','Use momentum, impulse and force–time relationships.'),
        L('mm11','Conservation of momentum','3.4.1.5','Apply momentum conservation to collisions and explosions.'),
        L('mm12','Work, energy and power','3.4.1.6','Calculate work, kinetic/gravitational energy and power.'),
        L('mm13','Efficiency and energy transfers','3.4.1.6','Analyse efficiency and energy-transfer chains quantitatively.'),
        L('mm14','Moments and couples','3.4.1.4','Calculate moments, couples and conditions for static equilibrium.'),
        L('mm15','Density and material behaviour','3.4.2','Use density and describe elastic/plastic deformation.'),
        L('mm16','Hooke’s law and force–extension graphs','3.4.2','Use Hooke’s law, identify elastic limit and calculate elastic strain energy.'),
        L('mm17','Stress, strain and Young modulus','3.4.2','Calculate tensile stress, tensile strain and Young modulus.'),
        L('mm18','Young modulus required practical','3.4.2','Determine Young modulus experimentally and evaluate uncertainty.', 'practical'),
        L('mm19','Mechanics and materials mastery','3.4','Solve synoptic mechanics/materials problems and analyse unfamiliar experimental data.', 'review')
      ]
    },
    {
      id: 'electricity', code: 'AQA 3.5', title: 'Electricity', year: 'Year 12',
      lessons: [
        L('e01','Charge, current and charge carriers','3.5.1.1','Use current as rate of charge flow and relate charge to carrier number.'),
        L('e02','Potential difference and electrical energy','3.5.1.1','Use potential difference as energy transferred per unit charge.'),
        L('e03','Resistance and Ohm’s law','3.5.1.1 / 3.5.1.2','Calculate resistance and distinguish ohmic from non-ohmic behaviour.'),
        L('e04','Current–voltage characteristics','3.5.1.2','Interpret I–V characteristics for resistor, filament lamp and diode.'),
        L('e05','Resistivity','3.5.1.3','Use resistivity and explain effects of dimensions and temperature.'),
        L('e06','Resistivity required practical','3.5.1.3','Determine resistivity of a wire using measured length, diameter, current and pd.', 'practical'),
        L('e07','Electrical power and energy','3.5.1.1','Use electrical power and energy equations in dc circuits.'),
        L('e08','Series circuits','3.5.1.4','Apply conservation of charge and energy to series circuits.'),
        L('e09','Parallel circuits','3.5.1.4','Analyse current, pd and resistance in parallel networks.'),
        L('e10','Circuit problem solving','3.5.1.4','Combine series/parallel relationships in multi-step circuit problems.'),
        L('e11','Potential dividers','3.5.1.5','Calculate and design potential-divider circuits.'),
        L('e12','Sensors in potential dividers','3.5.1.5','Use thermistors, LDRs and variable resistors in sensing circuits.'),
        L('e13','EMF and internal resistance','3.5.1.6','Distinguish emf and terminal pd and calculate lost volts/internal resistance.'),
        L('e14','EMF and internal resistance practical','3.5.1.6','Determine emf and internal resistance from terminal-pd/current data.', 'practical'),
        L('e15','Electricity mastery','3.5','Solve synoptic dc-circuit problems and evaluate practical circuit data.', 'review')
      ]
    },
    {
      id: 'further-mechanics', code: 'AQA 3.6', title: 'Further mechanics and thermal physics', year: 'Year 13',
      lessons: [
        L('fm01','Radians and angular speed','3.6.1.1','Use radian measure and angular speed for circular motion.'),
        L('fm02','Centripetal acceleration','3.6.1.1','Calculate centripetal acceleration and identify its direction.'),
        L('fm03','Centripetal force and circular systems','3.6.1.1','Apply resultant-force models to vehicles, orbits and rotating systems.'),
        L('fm04','Defining simple harmonic motion','3.6.1.2','Recognise and use a = −ω²x as the condition for SHM.'),
        L('fm05','SHM displacement, velocity and acceleration','3.6.1.2','Connect x–t, v–t and a–t graphs and calculate maxima.'),
        L('fm06','Mass–spring and pendulum systems','3.6.1.3','Use time-period equations for standard SHM systems.'),
        L('fm07','Energy in SHM','3.6.1.3','Analyse kinetic, potential and total energy through an oscillation.'),
        L('fm08','SHM required practical','3.6.1.3','Investigate mass–spring and pendulum SHM and evaluate data.', 'practical'),
        L('fm09','Damping, forced oscillations and resonance','3.6.1.3–3.6.1.4','Explain damping, resonance and response curves in real systems.'),
        L('fm10','Internal energy and the first-law idea','3.6.2.1','Relate internal energy to particle kinetic/potential energy and energy transfers.'),
        L('fm11','Specific heat capacity','3.6.2.1','Calculate heating and cooling using specific heat capacity.'),
        L('fm12','Specific latent heat and phase change','3.6.2.1','Calculate energy transfer during phase changes.'),
        L('fm13','Gas laws and absolute temperature','3.6.2.2','Use empirical gas laws and Kelvin temperature.'),
        L('fm14','Ideal gas equation and gas-law practical','3.6.2.2','Apply pV = nRT / NkT and analyse Boyle/Charles-law data.', 'practical'),
        L('fm15','Molecular kinetic theory and thermal mastery','3.6.2.3','Derive/use kinetic-theory relationships and connect microscopic motion to macroscopic gas behaviour.', 'review')
      ]
    },
    {
      id: 'fields', code: 'AQA 3.7', title: 'Fields and their consequences', year: 'Year 13',
      lessons: [
        L('f01','The field concept','3.7.1','Represent force fields and compare gravitational, electric and magnetic interactions.'),
        L('f02','Gravitational field strength','3.7.2.1','Use inverse-square gravitational force and field-strength equations.'),
        L('f03','Gravitational potential','3.7.2.2','Use gravitational potential and potential energy with correct signs.'),
        L('f04','Gravitational potential graphs','3.7.2.2','Interpret field/potential relationships and equipotential ideas.'),
        L('f05','Orbits and satellite motion','3.7.2.3','Combine gravity with circular motion for orbital systems.'),
        L('f06','Kepler-style orbital relationships','3.7.2.3','Relate orbital radius, speed and period quantitatively.'),
        L('f07','Electric fields and Coulomb’s law','3.7.3.1','Use inverse-square electrostatic force and electric field strength.'),
        L('f08','Electric potential','3.7.3.2','Use electric potential/potential energy and compare with gravitational fields.'),
        L('f09','Uniform electric fields','3.7.3','Analyse charged-particle motion between parallel plates.'),
        L('f10','Capacitance and charge storage','3.7.4.1','Use capacitance, charge and potential difference relationships.'),
        L('f11','Energy stored by capacitors','3.7.4.1','Calculate stored energy and interpret energy/charge graphs.'),
        L('f12','Capacitor charge and discharge','3.7.4.2','Use exponential charge/discharge equations and time constant.'),
        L('f13','Capacitor required practical','3.7.4.2','Investigate capacitor discharge and extract capacitance/time constant.', 'practical'),
        L('f14','Magnetic flux density and force on currents','3.7.5.1','Use F = BIl and determine force directions.'),
        L('f15','Charged particles in magnetic fields','3.7.5.2','Analyse circular paths of moving charged particles.'),
        L('f16','Magnetic flux and flux linkage','3.7.5.3','Calculate magnetic flux and flux linkage.'),
        L('f17','Electromagnetic induction','3.7.5.4','Apply Faraday’s and Lenz’s laws to induced emf.'),
        L('f18','Fields mastery','3.7','Solve synoptic gravitational, electric, capacitor and magnetic-field problems.', 'review')
      ]
    },
    {
      id: 'nuclear', code: 'AQA 3.8', title: 'Nuclear physics', year: 'Year 13',
      lessons: [
        L('n01','Rutherford scattering and the nuclear atom','3.8.1.1','Explain Rutherford scattering evidence and the development of the nuclear model.'),
        L('n02','Alpha, beta and gamma radiation','3.8.1.2','Compare properties, penetration, ionisation, hazards and detection.'),
        L('n03','Inverse-square law and background radiation','3.8.1.2','Apply inverse-square behaviour and correct count rates for background.', 'practical'),
        L('n04','Random decay, activity and decay constant','3.8.1.3','Use activity, decay probability and decay constant.'),
        L('n05','Exponential radioactive decay','3.8.1.3','Use N = N0e−λt and A = A0e−λt in calculations.'),
        L('n06','Half-life and logarithmic analysis','3.8.1.3','Determine half-life from decay curves and linearised/log data.'),
        L('n07','Nuclear instability and decay modes','3.8.1.4','Use N–Z ideas and write alpha, beta-plus, beta-minus and electron-capture equations.'),
        L('n08','Nuclear energy levels and gamma emission','3.8.1.4','Interpret nuclear energy-level diagrams and gamma transitions.'),
        L('n09','Closest approach and nuclear radius','3.8.1.5','Estimate nuclear size from alpha-particle closest approach.'),
        L('n10','Electron diffraction and nuclear radius','3.8.1.5','Use diffraction evidence for nuclear radius.'),
        L('n11','Nuclear radius relation and density','3.8.1.5','Apply R = r0A^(1/3) and show nuclear density is approximately constant.'),
        L('n12','Mass defect and binding energy','3.8.2.1','Use E = mc², atomic mass units and binding energy per nucleon.'),
        L('n13','Fission, fusion and nuclear power','3.8.2.2–3.8.2.3','Explain energy release, chain reactions, reactors and fusion conditions.'),
        L('n14','Nuclear physics mastery','3.8','Solve synoptic decay, radius, binding-energy and nuclear-energy problems.', 'review')
      ]
    }
  ];

  const flat = curriculum.flatMap(topic => topic.lessons.map((lesson, index) => ({ ...lesson, topicId: topic.id, topicCode: topic.code, topicTitle: topic.title, year: topic.year, lessonNumber: index + 1 })));
  window.ALEVEL_CURRICULUM_MAP = curriculum;
  window.ALEVEL_LESSONS = flat;

  const escapeHtml = value => String(value ?? '').replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]));
  const typeLabel = type => ({lesson:'Core lesson', practical:'Practical', skills:'Skills', review:'Mastery'}[type] || 'Lesson');

  function renderMap(){
    const courseMap = document.getElementById('courseMap');
    const courseTools = document.getElementById('courseTools');
    if(!courseMap || !courseTools || document.getElementById('lessonCurriculumMap')) return;

    const total = flat.length;
    const y12 = flat.filter(l => l.year === 'Year 12').length;
    const y13 = flat.filter(l => l.year === 'Year 13').length;
    const practicals = flat.filter(l => l.type === 'practical').length;

    const section = document.createElement('section');
    section.id = 'lessonCurriculumMap';
    section.className = 'lesson-curriculum-map';
    section.innerHTML = `
      <div class="curriculum-head">
        <div>
          <span class="eyebrow">Phase 1 · lesson architecture</span>
          <h2>Complete lesson-by-lesson course map</h2>
          <p>The AQA 7408 core is now broken into teachable lessons. This map becomes the source of truth for lesson pages, assessments, presentations and progress tracking.</p>
        </div>
        <div class="curriculum-stats" aria-label="Course map statistics">
          <div><strong>${total}</strong><span>lessons</span></div>
          <div><strong>${y12}</strong><span>Year 12</span></div>
          <div><strong>${y13}</strong><span>Year 13</span></div>
          <div><strong>${practicals}</strong><span>practical lessons</span></div>
        </div>
      </div>
      <div class="curriculum-controls">
        <div class="curriculum-filter" role="group" aria-label="Filter curriculum">
          <button class="active" type="button" data-year="all">All</button>
          <button type="button" data-year="Year 12">Year 12</button>
          <button type="button" data-year="Year 13">Year 13</button>
        </div>
        <label class="curriculum-search"><span class="sr-only">Search lessons</span><input id="curriculumSearch" type="search" placeholder="Search lessons, AQA refs or concepts…"></label>
      </div>
      <div class="curriculum-topic-list" id="curriculumTopicList"></div>`;
    courseTools.before(section);

    let yearFilter = 'all';
    let query = '';
    const list = section.querySelector('#curriculumTopicList');

    function draw(){
      const normalised = query.trim().toLowerCase();
      const topics = curriculum.filter(t => yearFilter === 'all' || t.year === yearFilter).map(topic => {
        const lessons = topic.lessons.filter(l => !normalised || `${l.title} ${l.ref} ${l.focus}`.toLowerCase().includes(normalised));
        return { ...topic, lessons };
      }).filter(t => t.lessons.length);

      list.innerHTML = topics.length ? topics.map((topic, topicIndex) => `
        <details class="curriculum-topic" ${normalised || topicIndex === 0 ? 'open' : ''} data-topic="${escapeHtml(topic.id)}">
          <summary>
            <span class="curriculum-topic-code">${escapeHtml(topic.code)}</span>
            <span class="curriculum-topic-title"><strong>${escapeHtml(topic.title)}</strong><small>${escapeHtml(topic.year)} · ${topic.lessons.length} lesson${topic.lessons.length === 1 ? '' : 's'}</small></span>
            <button type="button" class="curriculum-open-topic" data-open-topic="${escapeHtml(topic.id)}">Open topic →</button>
          </summary>
          <div class="curriculum-lessons">
            ${topic.lessons.map((lesson, index) => `
              <article class="curriculum-lesson" data-lesson-id="${escapeHtml(lesson.id)}">
                <span class="lesson-sequence">${String(index + 1).padStart(2,'0')}</span>
                <div class="lesson-map-copy">
                  <div class="lesson-map-title"><strong>${escapeHtml(lesson.title)}</strong><span class="lesson-type ${escapeHtml(lesson.type)}">${typeLabel(lesson.type)}</span></div>
                  <p>${escapeHtml(lesson.focus)}</p>
                  <div class="lesson-map-meta"><span>${escapeHtml(lesson.ref)}</span><span>~${lesson.minutes} min</span><span>Presentation planned</span></div>
                </div>
              </article>`).join('')}
          </div>
        </details>`).join('') : `<div class="curriculum-empty"><strong>No lessons match that search.</strong><span>Try a topic name, equation idea or AQA reference.</span></div>`;

      list.querySelectorAll('[data-open-topic]').forEach(button => button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        window.CourseApp?.openTopic?.(button.dataset.openTopic, true, 0);
      }));
    }

    section.querySelectorAll('[data-year]').forEach(button => button.addEventListener('click', () => {
      yearFilter = button.dataset.year;
      section.querySelectorAll('[data-year]').forEach(b => b.classList.toggle('active', b === button));
      draw();
    }));
    section.querySelector('#curriculumSearch')?.addEventListener('input', event => { query = event.target.value; draw(); });
    draw();

    document.querySelectorAll('#topicGrid .topic-card').forEach(card => {
      const topic = curriculum.find(t => t.id === card.dataset.id);
      if(!topic || card.querySelector('.topic-lesson-count')) return;
      const badge = document.createElement('span');
      badge.className = 'topic-lesson-count';
      badge.textContent = `${topic.lessons.length} lessons`;
      card.querySelector('.topic-footer')?.prepend(badge);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderMap, { once:true });
  else renderMap();
})();