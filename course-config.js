(()=>{
  'use strict';

  const repoUrl='https://github.com/markstevengray95-star/alevel-course';
  const freezeArray=value=>Object.freeze([...(value||[])]);
  const createSubject=config=>Object.freeze({
    enabled:true,qualification:'A-level',board:'AQA',...config,
    storage:Object.freeze(config.storage||{}),
    coach:Object.freeze(config.coach||{}),
    stages:freezeArray(config.stages),
    tools:Object.freeze(config.tools||{}),
    topics:freezeArray(config.topics),
    options:freezeArray(config.options),
    assessment:Object.freeze(config.assessment||{})
  });
  const section=(subject,topicId,ref,title,year,summary='')=>({ref,title,label:title,year,summary:summary||`${title}, aligned to AQA ${ref}.`,focus:[`Master the core knowledge and terminology in ${ref}.`,`Apply ${title.toLowerCase()} to data, practical and exam-style contexts.`,`Connect this section to the wider A-Level ${subject==='biology'?'Biology':'Chemistry'} course.`],path:`subjects/topic-shell.html?subject=${subject}&topic=${topicId}&section=${encodeURIComponent(ref)}`,repo:repoUrl});
  const modules=(subject,topicId,rows)=>rows.map(([ref,title,year,summary])=>section(subject,topicId,ref,title,year,summary));

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
  const physicsOptions=[
    {ref:'3.9',title:'Astrophysics',textbookId:'astrophysics'},
    {ref:'3.10',title:'Medical physics',textbookId:'medical-physics'},
    {ref:'3.11',title:'Engineering physics',textbookId:'engineering-physics'},
    {ref:'3.12',title:'Turning points in physics',textbookId:'turning-points'},
    {ref:'3.13',title:'Electronics',textbookId:'electronics'}
  ];

  const biologyTopics=[
    {id:'bio-molecules',code:'AQA 3.1',title:'Biological molecules',short:'Biological molecules',year:'Year 12',description:'The shared chemistry of life: carbohydrates, lipids, proteins, enzymes, nucleic acids, ATP, water and inorganic ions.',modules:modules('biology','bio-molecules',[
      ['3.1.1','Monomers and polymers','Year 12'],['3.1.2','Carbohydrates','Year 12'],['3.1.3','Lipids','Year 12'],['3.1.4','Proteins','Year 12'],['3.1.5','Nucleic acids are important information-carrying molecules','Year 12'],['3.1.6','ATP','Year 12'],['3.1.7','Water','Year 12'],['3.1.8','Inorganic ions','Year 12']
    ])},
    {id:'bio-cells',code:'AQA 3.2',title:'Cells',short:'Cells',year:'Year 12',description:'Cell ultrastructure, cell division, membrane transport, cell recognition and immunity.',modules:modules('biology','bio-cells',[
      ['3.2.1','Cell structure','Year 12'],['3.2.2','All cells arise from other cells','Year 12'],['3.2.3','Transport across cell membranes','Year 12'],['3.2.4','Cell recognition and the immune system','Year 12']
    ])},
    {id:'bio-exchange',code:'AQA 3.3',title:'Organisms exchange substances with their environment',short:'Exchange',year:'Year 12',description:'Exchange surfaces, gas exchange, digestion and absorption, and mass transport in animals and plants.',modules:modules('biology','bio-exchange',[
      ['3.3.1','Surface area to volume ratio','Year 12'],['3.3.2','Gas exchange','Year 12'],['3.3.3','Digestion and absorption','Year 12'],['3.3.4','Mass transport','Year 12']
    ])},
    {id:'bio-genetic-info',code:'AQA 3.4',title:'Genetic information, variation and relationships between organisms',short:'Genetic information',year:'Year 12',description:'DNA and protein synthesis, genetic diversity, selection, taxonomy, biodiversity and investigating variation.',modules:modules('biology','bio-genetic-info',[
      ['3.4.1','DNA, genes and chromosomes','Year 12'],['3.4.2','DNA and protein synthesis','Year 12'],['3.4.3','Genetic diversity can arise as a result of mutation or during meiosis','Year 12'],['3.4.4','Genetic diversity and adaptation','Year 12'],['3.4.5','Species and taxonomy','Year 12'],['3.4.6','Biodiversity within a community','Year 12'],['3.4.7','Investigating diversity','Year 12']
    ])},
    {id:'bio-energy',code:'AQA 3.5',title:'Energy transfers in and between organisms',short:'Energy transfers',year:'Year 13',description:'Photosynthesis, respiration, productivity, energy transfer and nutrient cycling.',modules:modules('biology','bio-energy',[
      ['3.5.1','Photosynthesis','Year 13'],['3.5.2','Respiration','Year 13'],['3.5.3','Energy and ecosystems','Year 13'],['3.5.4','Nutrient cycles','Year 13']
    ])},
    {id:'bio-response',code:'AQA 3.6',title:'Organisms respond to changes in their internal and external environments',short:'Responses',year:'Year 13',description:'Receptors, nervous coordination, muscles and homeostasis.',modules:modules('biology','bio-response',[
      ['3.6.1','Stimuli, both internal and external, are detected and lead to a response','Year 13'],['3.6.2','Nervous coordination','Year 13'],['3.6.3','Skeletal muscles are stimulated to contract by nerves and act as effectors','Year 13'],['3.6.4','Homeostasis is the maintenance of a stable internal environment','Year 13']
    ])},
    {id:'bio-populations',code:'AQA 3.7',title:'Genetics, populations, evolution and ecosystems',short:'Genetics & ecosystems',year:'Year 13',description:'Inheritance, Hardy–Weinberg, evolution, speciation and population ecology.',modules:modules('biology','bio-populations',[
      ['3.7.1','Inheritance','Year 13'],['3.7.2','Populations','Year 13'],['3.7.3','Evolution may lead to speciation','Year 13'],['3.7.4','Populations in ecosystems','Year 13']
    ])},
    {id:'bio-gene-expression',code:'AQA 3.8',title:'The control of gene expression',short:'Gene expression',year:'Year 13',description:'Mutation, regulation of gene expression, genome projects and gene technologies.',modules:modules('biology','bio-gene-expression',[
      ['3.8.1','Alteration of the sequence of bases in DNA can alter the structure of proteins','Year 13'],['3.8.2','Gene expression is controlled by a number of features','Year 13'],['3.8.3','Using genome projects','Year 13'],['3.8.4','Gene technologies allow the study and alteration of gene function','Year 13']
    ])}
  ];

  const chemistryTopics=[
    {id:'chem-physical',code:'AQA 3.1',title:'Physical chemistry',short:'Physical chemistry',year:'Years 12–13',description:'Atomic structure, quantitative chemistry, bonding, energetics, kinetics, equilibria, thermodynamics, electrochemistry and acids and bases.',modules:modules('chemistry','chem-physical',[
      ['3.1.1','Atomic structure','Year 12'],['3.1.2','Amount of substance','Year 12'],['3.1.3','Bonding','Year 12'],['3.1.4','Energetics','Year 12'],['3.1.5','Kinetics','Year 12'],['3.1.6','Chemical equilibria, Le Chatelier’s principle and Kc','Year 12'],['3.1.7','Oxidation, reduction and redox equations','Year 12'],['3.1.8','Thermodynamics','Year 13'],['3.1.9','Rate equations','Year 13'],['3.1.10','Equilibrium constant Kp for homogeneous systems','Year 13'],['3.1.11','Electrode potentials and electrochemical cells','Year 13'],['3.1.12','Acids and bases','Year 13']
    ])},
    {id:'chem-inorganic',code:'AQA 3.2',title:'Inorganic chemistry',short:'Inorganic chemistry',year:'Years 12–13',description:'Periodicity, Group 2, Group 7, Period 3 chemistry, transition metals and reactions of aqueous ions.',modules:modules('chemistry','chem-inorganic',[
      ['3.2.1','Periodicity','Year 12'],['3.2.2','Group 2, the alkaline earth metals','Year 12'],['3.2.3','Group 7(17), the halogens','Year 12'],['3.2.4','Properties of Period 3 elements and their oxides','Year 13'],['3.2.5','Transition metals','Year 13'],['3.2.6','Reactions of ions in aqueous solution','Year 13']
    ])},
    {id:'chem-organic',code:'AQA 3.3',title:'Organic chemistry',short:'Organic chemistry',year:'Years 12–13',description:'Organic nomenclature and mechanisms through synthesis, polymers, biomolecules, spectroscopy and chromatography.',modules:modules('chemistry','chem-organic',[
      ['3.3.1','Introduction to organic chemistry','Year 12'],['3.3.2','Alkanes','Year 12'],['3.3.3','Halogenoalkanes','Year 12'],['3.3.4','Alkenes','Year 12'],['3.3.5','Alcohols','Year 12'],['3.3.6','Organic analysis','Year 12'],['3.3.7','Optical isomerism','Year 13'],['3.3.8','Aldehydes and ketones','Year 13'],['3.3.9','Carboxylic acids and derivatives','Year 13'],['3.3.10','Aromatic chemistry','Year 13'],['3.3.11','Amines','Year 13'],['3.3.12','Polymers','Year 13'],['3.3.13','Amino acids, proteins and DNA','Year 13'],['3.3.14','Organic synthesis','Year 13'],['3.3.15','Nuclear magnetic resonance spectroscopy','Year 13'],['3.3.16','Chromatography','Year 13']
    ])}
  ];

  const physics=createSubject({id:'physics',subject:'Physics',displayName:'A-Level Physics',brandMark:'φ',specCode:'7408',topicRange:'AQA 3.1–3.8 core · 3.9–3.13 options',metaTitle:'AQA A-level Physics Course',metaDescription:'Unified AQA A-level Physics 7408 course with the full core, all five Paper 3 options, simulations, required practicals, exam marking, a student notebook and an AI study coach.',heroEyebrow:'AQA A-level Physics 7408',heroTitle:'Your Physics course.',heroDescription:'Move smoothly from the eight core areas to required practicals, exam practice and your chosen Paper 3 option.',storage:{progress:'alevel-course-progress-v1',location:'alevel-course-location-v2',notebook:'alevel-physics-student-notebook-v1',coachHistory:'alevel-physics-coach-history-v2',topicSections:'alevel-course-topic-sections-v1'},coach:{label:'Physics Coach',endpoint:'/api/physics-coach',enabled:true},practicalCount:12,options:physicsOptions,assessment:{mathsMinimum:40,practicalMinimum:15,papers:[{marks:85,weight:34},{marks:85,weight:34},{marks:80,weight:32}]},stages:[{id:'year12',label:'Year 12',title:'Core foundations',topicIds:['measurements','particles','waves','mechanics-materials','electricity']},{id:'year13',label:'Year 13',title:'Advanced core',topicIds:['further-mechanics','fields','nuclear']}],tools:{practicals:{id:'practicals',label:'Required Practicals',eyebrow:'AQA Physics 7408 · Practicals 1–12',url:'tools/practicals/index.html',repo:'https://github.com/markstevengray95-star/Alevel-prac',external:false},marking:{id:'marking',label:'Exam Practice & Marking',eyebrow:'AQA A-Level Physics · Exam practice',url:'https://alevel-marking.vercel.app',repo:'https://github.com/markstevengray95-star/alevel-marking-',external:true}},topics:physicsTopics});

  const biology=createSubject({id:'biology',subject:'Biology',displayName:'A-Level Biology',brandMark:'β',specCode:'7402',topicRange:'AQA 3.1–3.8',metaTitle:'AQA A-level Biology Course',metaDescription:'Complete AQA A-level Biology 7402 specification structure connected to the shared A-Level course engine.',heroEyebrow:'AQA A-level Biology 7402',heroTitle:'Your Biology course.',heroDescription:'Work through the complete AQA Biology specification from biological molecules and cells to ecosystems, gene expression and modern gene technologies.',storage:{progress:'alevel-biology-progress-v1',location:'alevel-biology-location-v1',notebook:'alevel-biology-student-notebook-v1',coachHistory:'alevel-biology-coach-history-v1',topicSections:'alevel-biology-topic-sections-v1'},coach:{label:'Biology Coach',endpoint:'/api/biology-coach',enabled:false},practicalCount:12,assessment:{mathsMinimum:10,practicalMinimum:15,papers:[{marks:91,weight:35},{marks:91,weight:35},{marks:78,weight:30}]},stages:[{id:'year12',label:'Year 12',title:'AS foundations',topicIds:['bio-molecules','bio-cells','bio-exchange','bio-genetic-info']},{id:'year13',label:'Year 13',title:'A-Level extension',topicIds:['bio-energy','bio-response','bio-populations','bio-gene-expression']}],tools:{},topics:biologyTopics});

  const chemistry=createSubject({id:'chemistry',subject:'Chemistry',displayName:'A-Level Chemistry',brandMark:'χ',specCode:'7405',topicRange:'AQA 3.1–3.3',metaTitle:'AQA A-level Chemistry Course',metaDescription:'Complete AQA A-level Chemistry 7405 specification structure connected to the shared A-Level course engine.',heroEyebrow:'AQA A-level Chemistry 7405',heroTitle:'Your Chemistry course.',heroDescription:'Work through Physical, Inorganic and Organic Chemistry with every numbered AQA 7405 specification section connected to the shared course engine.',storage:{progress:'alevel-chemistry-progress-v1',location:'alevel-chemistry-location-v1',notebook:'alevel-chemistry-student-notebook-v1',coachHistory:'alevel-chemistry-coach-history-v1',topicSections:'alevel-chemistry-topic-sections-v1'},coach:{label:'Chemistry Coach',endpoint:'/api/chemistry-coach',enabled:false},practicalCount:12,assessment:{mathsMinimum:20,practicalMinimum:15,papers:[{marks:105,weight:35},{marks:105,weight:35},{marks:90,weight:30}]},stages:[],tools:{},topics:chemistryTopics});

  const registry=Object.freeze({physics,biology,chemistry});
  const params=new URLSearchParams(window.location.search);
  const requested=(params.get('subject')||'physics').toLowerCase();
  const selected=registry[requested]||physics;

  function installSubjectSwitcher(){
    const host=document.querySelector('.topbar-inner');
    if(!host||document.getElementById('subjectSwitcher'))return;
    const nav=document.createElement('nav');nav.id='subjectSwitcher';nav.setAttribute('aria-label','A-Level subject');nav.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:10px';
    Object.values(registry).forEach(subject=>{
      const a=document.createElement('a');a.textContent=subject.subject;a.style.cssText='text-decoration:none;color:inherit;border:1px solid rgba(160,190,225,.22);padding:7px 10px;border-radius:999px;font-size:.82rem;background:'+(selected.id===subject.id?'rgba(119,189,251,.16)':'transparent');
      const url=new URL(location.href);url.searchParams.delete('view');url.searchParams.delete('topic');url.searchParams.delete('module');if(subject.id==='physics')url.searchParams.delete('subject');else url.searchParams.set('subject',subject.id);a.href=url.pathname+url.search;nav.appendChild(a);
    });
    host.insertBefore(nav,host.querySelector('.global-course-nav'));
  }

  function prepareSubjectShell(){
    if(selected.id==='physics')return;
    document.querySelectorAll('[data-course-tool]').forEach(el=>el.hidden=true);
    ['#courseTools','#toolWorkspace','#coachFab','#coachBackdrop','#coachPanel','#notebookBackdrop','#notebookPanel','#notebookToast','#homeNotebookBtn','#heroCoachBtn','#notebookToggle','#coachToggle','#mobileDockNotebook','#mobileDockAI','#toolNotebook','#toolAI'].forEach(selector=>{const el=document.querySelector(selector);if(el)el.hidden=true;});
    const sentinel=document.createElement('span');sentinel.id='homeLearningDashboard';sentinel.hidden=true;document.body.appendChild(sentinel);
  }

  window.ALEVEL_COURSE_REGISTRY=registry;
  window.ALEVEL_COURSE_CONFIG=selected;
  window.ALEVEL_COURSE_CONFIG_VERSION='4.0.0';
  installSubjectSwitcher();
  prepareSubjectShell();
})();