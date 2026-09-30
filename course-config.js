(()=>{
  'use strict';

  const createSubject=(config)=>Object.freeze({
    enabled:true,
    qualification:'A-level',
    board:'AQA',
    ...config,
    storage:Object.freeze(config.storage||{}),
    coach:Object.freeze(config.coach||{}),
    stages:Object.freeze(config.stages||[]),
    tools:Object.freeze(config.tools||{}),
    topics:Object.freeze(config.topics||[])
  });

  const physicsTopics=[
    {id:'measurements',code:'AQA 3.1',title:'Measurements and their errors',short:'Measurements',year:'Year 12',description:'SI units, prefixes, uncertainty, error, significant figures, gradients, logs and practical data handling.',modules:[{label:'Measurements & Errors',path:'topics/01-measurements/index.html',repo:'https://github.com/markstevengray95-star/Alevelmesurments-and-erros'}]},
    {id:'particles',code:'AQA 3.2',title:'Particles and radiation',short:'Particles',year:'Year 12',description:'Particles, antiparticles, photons, particle interactions, quarks, conservation laws and wave–particle duality.',modules:[{label:'Particles & Radiation',path:'topics/02-particles-radiation/index.html',repo:'https://github.com/markstevengray95-star/Practical-and-radiation'}]},
    {id:'waves',code:'AQA 3.3',title:'Waves',short:'Waves',year:'Year 12',description:'Progressive and stationary waves, interference, diffraction, refraction, optics and wave behaviour.',modules:[{label:'Waves',path:'topics/03-waves/index.html',repo:'https://github.com/markstevengray95-star/alevel-Wave'}]},
    {id:'mechanics-materials',code:'AQA 3.4',title:'Mechanics and materials',short:'Mechanics',year:'Year 12',description:'Vectors, motion, forces, momentum, work and energy, followed by materials, stress, strain and Young modulus.',modules:[{label:'Mechanics',path:'topics/04-mechanics-materials/mechanics/index.html',repo:'https://github.com/markstevengray95-star/mechanicsnew'},{label:'Materials',path:'topics/04-mechanics-materials/materials/index.html',repo:'https://github.com/markstevengray95-star/Alevelmaterials'}]},
    {id:'electricity',code:'AQA 3.5',title:'Electricity',short:'Electricity',year:'Year 12',description:'Current, charge, potential difference, resistance, resistivity, circuits, power, emf and internal resistance.',modules:[{label:'Electricity',path:'topics/05-electricity/index.html',repo:'https://github.com/markstevengray95-star/alevel-electricity'}]},
    {id:'further-mechanics',code:'AQA 3.6',title:'Further mechanics and thermal physics',short:'Further mechanics',year:'Year 13',description:'Circular motion, SHM, resonance, thermal physics, ideal gases and kinetic theory.',modules:[{label:'Further Mechanics & Thermal',path:'topics/06-further-mechanics-thermal/index.html',repo:'https://github.com/markstevengray95-star/furthermechanics'}]},
    {id:'fields',code:'AQA 3.7',title:'Fields and their consequences',short:'Fields',year:'Year 13',description:'Gravitational, electric and magnetic fields, orbits, capacitance and electromagnetic induction.',modules:[{label:'Fields',path:'topics/07-fields/index.html',repo:'https://github.com/markstevengray95-star/alevel-fields-'}]},
    {id:'nuclear',code:'AQA 3.8',title:'Nuclear physics',short:'Nuclear',year:'Year 13',description:'Rutherford scattering, radioactivity, nuclear radius and density, mass–energy, fission, fusion and reactors.',modules:[{label:'Nuclear Physics',path:'topics/08-nuclear/index.html',repo:'https://github.com/markstevengray95-star/nuclear-physicsalevel'}]}
  ];

  const physics=createSubject({
    id:'physics',
    subject:'Physics',
    displayName:'A-Level Physics',
    brandMark:'φ',
    specCode:'7408',
    topicRange:'AQA 3.1–3.8',
    metaTitle:'AQA A-level Physics Course',
    metaDescription:'Unified AQA A-level Physics 7408 course with lessons, simulations, required practicals, exam marking, a student notebook and an AI study coach.',
    heroEyebrow:'AQA A-level Physics 7408',
    heroTitle:'Your Physics course.',
    heroDescription:'Move smoothly from learning the physics, to practising it experimentally, to answering and marking exam questions.',
    storage:{
      progress:'alevel-course-progress-v1',
      location:'alevel-course-location-v2',
      notebook:'alevel-physics-student-notebook-v1',
      coachHistory:'alevel-physics-coach-history-v2',
      topicSections:'alevel-course-topic-sections-v1'
    },
    coach:{label:'Physics Coach',endpoint:'/api/physics-coach'},
    practicalCount:12,
    stages:[
      {id:'year12',label:'Year 12',title:'Core foundations',topicIds:['measurements','particles','waves','mechanics-materials','electricity']},
      {id:'year13',label:'Year 13',title:'Advanced core',topicIds:['further-mechanics','fields','nuclear']}
    ],
    tools:{
      practicals:{id:'practicals',label:'Required Practicals',eyebrow:'AQA Physics 7408 · Practicals 1–12',url:'tools/practicals/index.html',repo:'https://github.com/markstevengray95-star/Alevel-prac',external:false},
      marking:{id:'marking',label:'Exam Practice & Marking',eyebrow:'AQA A-Level Physics · Exam practice',url:'https://alevel-marking.vercel.app',repo:'https://github.com/markstevengray95-star/alevel-marking-',external:true}
    },
    topics:physicsTopics
  });

  const biology=createSubject({
    id:'biology',subject:'Biology',displayName:'A-Level Biology',brandMark:'β',specCode:'7402',topicRange:'AQA Biology',
    enabled:false,topics:[],storage:{progress:'alevel-biology-progress-v1',location:'alevel-biology-location-v1',notebook:'alevel-biology-student-notebook-v1',coachHistory:'alevel-biology-coach-history-v1',topicSections:'alevel-biology-topic-sections-v1'},
    coach:{label:'Biology Coach',endpoint:'/api/biology-coach'},tools:{},stages:[]
  });

  const chemistry=createSubject({
    id:'chemistry',subject:'Chemistry',displayName:'A-Level Chemistry',brandMark:'χ',specCode:'7405',topicRange:'AQA Chemistry',
    enabled:false,topics:[],storage:{progress:'alevel-chemistry-progress-v1',location:'alevel-chemistry-location-v1',notebook:'alevel-chemistry-student-notebook-v1',coachHistory:'alevel-chemistry-coach-history-v1',topicSections:'alevel-chemistry-topic-sections-v1'},
    coach:{label:'Chemistry Coach',endpoint:'/api/chemistry-coach'},tools:{},stages:[]
  });

  const registry=Object.freeze({physics,biology,chemistry});
  const params=new URLSearchParams(window.location.search);
  const requested=(params.get('subject')||'physics').toLowerCase();
  const selected=registry[requested]?.enabled===false?physics:(registry[requested]||physics);

  window.ALEVEL_COURSE_REGISTRY=registry;
  window.ALEVEL_COURSE_CONFIG=selected;
  window.ALEVEL_COURSE_CONFIG_VERSION='1.0.0';
})();