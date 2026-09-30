(()=>{
  'use strict';

  const repoUrl='https://github.com/markstevengray95-star/alevel-course';
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
  const section=(subject,topicId,ref,title,year,summary,focus=[])=>({
    ref,title,label:title,year,summary,focus,
    path:`subjects/topic-shell.html?subject=${subject}&topic=${topicId}&section=${encodeURIComponent(ref)}`,
    repo:repoUrl
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

  const biologyTopics=[
    {id:'bio-molecules',code:'AQA 3.1',title:'Biological molecules',short:'Biological molecules',year:'Year 12',description:'The shared chemistry of life: carbohydrates, lipids, proteins, enzymes, nucleic acids, ATP, water and inorganic ions.',modules:[
      section('biology','bio-molecules','3.1.1','Monomers and polymers','Year 12','Condensation and hydrolysis reactions link monomers and polymers.',['Recognise monomers and polymers in biological systems.','Explain condensation and hydrolysis reactions.','Apply structure–function ideas to unfamiliar biological molecules.']),
      section('biology','bio-molecules','3.1.2','Carbohydrates','Year 12','Monosaccharides, disaccharides and polysaccharides including starch, glycogen and cellulose.',['Compare alpha and beta glucose.','Explain glycosidic bond formation and hydrolysis.','Relate starch, glycogen and cellulose structure to function.']),
      section('biology','bio-molecules','3.1.3','Lipids','Year 12','Triglycerides and phospholipids, their formation, properties and biological roles.',['Explain ester bond formation.','Compare triglycerides and phospholipids.','Relate lipid properties to energy storage and membranes.']),
      section('biology','bio-molecules','3.1.4','Proteins','Year 12','Amino acids, peptide bonds, protein structure and enzymes.',['Build polypeptides from amino acids.','Explain primary, secondary, tertiary and quaternary structure.','Link enzyme action to protein structure.']),
      section('biology','bio-molecules','3.1.5','Nucleic acids are important information-carrying molecules','Year 12','DNA and RNA structure, replication and the role of nucleotides.',['Compare DNA and RNA.','Explain semi-conservative DNA replication.','Relate nucleotide structure to information storage.']),
      section('biology','bio-molecules','3.1.6','ATP','Year 12','ATP as an immediate energy source in cells.',['Describe ATP structure.','Explain ATP hydrolysis and phosphorylation.','Apply ATP roles to active processes in cells.']),
      section('biology','bio-molecules','3.1.7','Water','Year 12','Properties of water that make it essential for living organisms.',['Explain polarity and hydrogen bonding.','Relate water properties to transport and temperature control.','Apply solvent properties to metabolism.']),
      section('biology','bio-molecules','3.1.8','Inorganic ions','Year 12','Biological roles of key inorganic ions.',['Link ion charge and concentration to function.','Apply named ions to biological processes.','Interpret ion-related experimental data.'])
    ]},
    {id:'bio-cells',code:'AQA 3.2',title:'Cells',short:'Cells',year:'Year 12',description:'Cell ultrastructure, cell division, membrane transport, cell recognition and immunity.',modules:[
      section('biology','bio-cells','3.2.1','Cell structure','Year 12','Eukaryotic and prokaryotic cells, viruses and methods used to study cells.',['Compare eukaryotic and prokaryotic cell structure.','Use magnification and resolution correctly.','Explain cell fractionation and microscopy.']),
      section('biology','bio-cells','3.2.2','All cells arise from other cells','Year 12','The cell cycle, mitosis, binary fission and viral replication.',['Explain the cell cycle and mitosis.','Compare mitosis with binary fission.','Apply cell division to growth and disease.']),
      section('biology','bio-cells','3.2.3','Transport across cell membranes','Year 12','Diffusion, facilitated diffusion, osmosis, active transport and co-transport.',['Compare passive and active transport.','Use water potential ideas in osmosis.','Explain co-transport using concentration gradients.']),
      section('biology','bio-cells','3.2.4','Cell recognition and the immune system','Year 12','Antigens, phagocytosis, T cells, B cells, antibodies, vaccination and immunity.',['Explain recognition of self and non-self.','Sequence cellular and humoral immune responses.','Evaluate vaccination and antibody-based applications.'])
    ]},
    {id:'bio-exchange',code:'AQA 3.3',title:'Organisms exchange substances with their environment',short:'Exchange',year:'Year 12',description:'Exchange surfaces, gas exchange, digestion and absorption, and mass transport in animals and plants.',modules:[
      section('biology','bio-exchange','3.3.1','Surface area to volume ratio','Year 12','How organism size affects exchange and the need for specialised exchange systems.',['Calculate and compare surface area to volume ratios.','Explain adaptations that improve exchange.','Relate size to transport-system requirements.']),
      section('biology','bio-exchange','3.3.2','Gas exchange','Year 12','Gas exchange in single-celled organisms, insects, fish and plants.',['Compare different gas-exchange surfaces.','Explain ventilation and diffusion gradients.','Interpret adaptations in unfamiliar organisms.']),
      section('biology','bio-exchange','3.3.3','Digestion and absorption','Year 12','Hydrolysis of food molecules and absorption in the small intestine.',['Explain enzyme action in digestion.','Describe micelles and lipid absorption.','Explain co-transport of glucose and amino acids.']),
      section('biology','bio-exchange','3.3.4','Mass transport','Year 12','Mass transport in mammals and flowering plants.',['Explain haemoglobin loading and unloading.','Analyse the cardiac cycle and blood vessels.','Explain transpiration and translocation in plants.'])
    ]},
    {id:'bio-genetic-info',code:'AQA 3.4',title:'Genetic information, variation and relationships between organisms',short:'Genetic information',year:'Year 12',description:'DNA and protein synthesis, genetic diversity, selection, taxonomy, biodiversity and investigating variation.',modules:[
      section('biology','bio-genetic-info','3.4.1','DNA, genes and chromosomes','Year 12','The organisation of genetic information in prokaryotes and eukaryotes.',['Define genes, loci and chromosomes.','Explain the genetic code.','Distinguish coding and non-coding DNA.']),
      section('biology','bio-genetic-info','3.4.2','DNA and protein synthesis','Year 12','Transcription, RNA processing and translation.',['Compare mRNA and tRNA.','Explain transcription and splicing.','Explain translation and use genetic-code data.']),
      section('biology','bio-genetic-info','3.4.3','Genetic diversity can arise as a result of mutation or during meiosis','Year 12','Mutation, meiosis, crossing over, independent segregation and random fertilisation.',['Explain sources of genetic variation.','Compare mitosis and meiosis.','Apply chromosome behaviour to unfamiliar life cycles.']),
      section('biology','bio-genetic-info','3.4.4','Genetic diversity and adaptation','Year 12','Natural selection, directional and stabilising selection, and adaptation.',['Explain changes in allele frequency.','Compare directional and stabilising selection.','Apply natural-selection reasoning to data.']),
      section('biology','bio-genetic-info','3.4.5','Species and taxonomy','Year 12','Species concepts, courtship, phylogeny and classification.',['Use the biological species concept.','Explain courtship and species recognition.','Interpret phylogenetic relationships.']),
      section('biology','bio-genetic-info','3.4.6','Biodiversity within a community','Year 12','Species richness, index of diversity and impacts of farming.',['Calculate an index of diversity.','Interpret biodiversity data.','Evaluate conservation and farming trade-offs.']),
      section('biology','bio-genetic-info','3.4.7','Investigating diversity','Year 12','Comparing DNA, RNA, proteins and measurable characteristics to investigate diversity.',['Use molecular evidence to infer relationships.','Apply random sampling and statistics.','Interpret means and standard deviations.'])
    ]},
    {id:'bio-energy',code:'AQA 3.5',title:'Energy transfers in and between organisms',short:'Energy transfers',year:'Year 13',description:'Photosynthesis, respiration, productivity, energy transfer and nutrient cycling.',modules:[
      section('biology','bio-energy','3.5.1','Photosynthesis','Year 13','Light-dependent and light-independent reactions and limiting factors.',['Explain photophosphorylation and chemiosmosis.','Explain the Calvin cycle.','Evaluate limiting factors and agricultural applications.']),
      section('biology','bio-energy','3.5.2','Respiration','Year 13','Glycolysis, link reaction, Krebs cycle and oxidative phosphorylation.',['Sequence aerobic respiration.','Explain anaerobic pathways.','Link electron transfer to ATP production.']),
      section('biology','bio-energy','3.5.3','Energy and ecosystems','Year 13','Primary production, secondary production and efficiency of energy transfer.',['Calculate GPP, NPP and productivity.','Calculate transfer efficiencies.','Evaluate farming methods that alter energy transfer.']),
      section('biology','bio-energy','3.5.4','Nutrient cycles','Year 13','Nitrogen and phosphorus cycles, decomposition, fertilisers and eutrophication.',['Explain microbial roles in nutrient cycles.','Describe mycorrhizal relationships.','Evaluate fertiliser use and eutrophication.'])
    ]},
    {id:'bio-response',code:'AQA 3.6',title:'Organisms respond to changes in their internal and external environments',short:'Responses',year:'Year 13',description:'Receptors, nervous coordination, muscles and homeostasis.',modules:[
      section('biology','bio-response','3.6.1','Stimuli, both internal and external, are detected and lead to a response','Year 13','Plant and animal responses, receptors, reflexes and control of heart rate.',['Explain taxes, kineses and tropisms.','Explain receptor and generator potentials.','Explain autonomic control of heart rate.']),
      section('biology','bio-response','3.6.2','Nervous coordination','Year 13','Resting potentials, action potentials and synaptic transmission.',['Explain generation and propagation of action potentials.','Explain saltatory conduction and refractory periods.','Explain transmission and summation at synapses.']),
      section('biology','bio-response','3.6.3','Skeletal muscles are stimulated to contract by nerves and act as effectors','Year 13','Muscle structure and the sliding-filament mechanism.',['Describe skeletal muscle ultrastructure.','Explain actin–myosin bridge cycling.','Compare slow and fast muscle fibres.']),
      section('biology','bio-response','3.6.4','Homeostasis is the maintenance of a stable internal environment','Year 13','Negative feedback, blood glucose control and osmoregulation.',['Explain negative feedback.','Explain hormonal control of blood glucose.','Explain kidney function and ADH in water-potential control.'])
    ]},
    {id:'bio-populations',code:'AQA 3.7',title:'Genetics, populations, evolution and ecosystems',short:'Genetics & ecosystems',year:'Year 13',description:'Inheritance, Hardy–Weinberg, evolution, speciation and population ecology.',modules:[
      section('biology','bio-populations','3.7.1','Inheritance','Year 13','Genetic crosses, linkage, epistasis and chi-squared testing.',['Construct genetic diagrams.','Apply linkage, sex linkage and epistasis.','Use chi-squared to compare observed and expected ratios.']),
      section('biology','bio-populations','3.7.2','Populations','Year 13','Gene pools, allele frequencies and the Hardy–Weinberg principle.',['Define populations and gene pools.','Use p and q relationships.','Calculate allele, genotype and phenotype frequencies.']),
      section('biology','bio-populations','3.7.3','Evolution may lead to speciation','Year 13','Selection, genetic drift and allopatric and sympatric speciation.',['Explain evolution as allele-frequency change.','Compare selection and genetic drift.','Explain reproductive isolation and speciation.']),
      section('biology','bio-populations','3.7.4','Populations in ecosystems','Year 13','Communities, carrying capacity, sampling, succession and conservation.',['Explain biotic and abiotic population controls.','Apply quadrat and mark–release–recapture methods.','Explain succession and conservation management.'])
    ]},
    {id:'bio-gene-expression',code:'AQA 3.8',title:'The control of gene expression',short:'Gene expression',year:'Year 13',description:'Mutation, regulation of gene expression, genome projects and gene technologies.',modules:[
      section('biology','bio-gene-expression','3.8.1','Alteration of the sequence of bases in DNA can alter the structure of proteins','Year 13','Gene mutations and their effects on polypeptide structure.',['Classify mutation types.','Explain frameshifts and substitution effects.','Relate base-sequence change to protein structure.']),
      section('biology','bio-gene-expression','3.8.2','Gene expression is controlled by a number of features','Year 13','Stem cells, transcription factors, epigenetics, RNA interference and cancer.',['Compare cell potency.','Explain transcriptional and epigenetic control.','Apply gene regulation to cancer and disease.']),
      section('biology','bio-gene-expression','3.8.3','Using genome projects','Year 13','Genome sequencing, proteomes and applications of sequencing data.',['Compare genomes and proteomes.','Explain limitations of predicting proteomes.','Apply sequencing information to biological problems.']),
      section('biology','bio-gene-expression','3.8.4','Gene technologies allow the study and alteration of gene function','Year 13','Recombinant DNA, PCR, probes, genetic screening and genetic fingerprinting.',['Explain recombinant DNA technology.','Explain PCR, probes and electrophoresis.','Evaluate medical, industrial and ethical applications.'])
    ]}
  ];

  const physics=createSubject({
    id:'physics',subject:'Physics',displayName:'A-Level Physics',brandMark:'φ',specCode:'7408',topicRange:'AQA 3.1–3.8',metaTitle:'AQA A-level Physics Course',metaDescription:'Unified AQA A-level Physics 7408 course with lessons, simulations, required practicals, exam marking, a student notebook and an AI study coach.',heroEyebrow:'AQA A-level Physics 7408',heroTitle:'Your Physics course.',heroDescription:'Move smoothly from learning the physics, to practising it experimentally, to answering and marking exam questions.',storage:{progress:'alevel-course-progress-v1',location:'alevel-course-location-v2',notebook:'alevel-physics-student-notebook-v1',coachHistory:'alevel-physics-coach-history-v2',topicSections:'alevel-course-topic-sections-v1'},coach:{label:'Physics Coach',endpoint:'/api/physics-coach',enabled:true},practicalCount:12,stages:[{id:'year12',label:'Year 12',title:'Core foundations',topicIds:['measurements','particles','waves','mechanics-materials','electricity']},{id:'year13',label:'Year 13',title:'Advanced core',topicIds:['further-mechanics','fields','nuclear']}],tools:{practicals:{id:'practicals',label:'Required Practicals',eyebrow:'AQA Physics 7408 · Practicals 1–12',url:'tools/practicals/index.html',repo:'https://github.com/markstevengray95-star/Alevel-prac',external:false},marking:{id:'marking',label:'Exam Practice & Marking',eyebrow:'AQA A-Level Physics · Exam practice',url:'https://alevel-marking.vercel.app',repo:'https://github.com/markstevengray95-star/alevel-marking-',external:true}},topics:physicsTopics
  });

  const biology=createSubject({
    id:'biology',subject:'Biology',displayName:'A-Level Biology',brandMark:'β',specCode:'7402',topicRange:'AQA 3.1–3.8',metaTitle:'AQA A-level Biology Course',metaDescription:'AQA A-level Biology 7402 course structure with all specification topics connected to the shared A-Level course engine.',heroEyebrow:'AQA A-level Biology 7402',heroTitle:'Your Biology course.',heroDescription:'Work through the complete AQA Biology specification from biological molecules and cells to ecosystems, gene expression and modern gene technologies.',enabled:true,storage:{progress:'alevel-biology-progress-v1',location:'alevel-biology-location-v1',notebook:'alevel-biology-student-notebook-v1',coachHistory:'alevel-biology-coach-history-v1',topicSections:'alevel-biology-topic-sections-v1'},coach:{label:'Biology Coach',endpoint:'/api/biology-coach',enabled:false},practicalCount:12,stages:[{id:'year12',label:'Year 12',title:'AS foundations',topicIds:['bio-molecules','bio-cells','bio-exchange','bio-genetic-info']},{id:'year13',label:'Year 13',title:'A-Level extension',topicIds:['bio-energy','bio-response','bio-populations','bio-gene-expression']}],tools:{},topics:biologyTopics
  });

  const chemistry=createSubject({id:'chemistry',subject:'Chemistry',displayName:'A-Level Chemistry',brandMark:'χ',specCode:'7405',topicRange:'AQA Chemistry',enabled:false,topics:[],storage:{progress:'alevel-chemistry-progress-v1',location:'alevel-chemistry-location-v1',notebook:'alevel-chemistry-student-notebook-v1',coachHistory:'alevel-chemistry-coach-history-v1',topicSections:'alevel-chemistry-topic-sections-v1'},coach:{label:'Chemistry Coach',endpoint:'/api/chemistry-coach',enabled:false},tools:{},stages:[]});

  const registry=Object.freeze({physics,biology,chemistry});
  const params=new URLSearchParams(window.location.search);
  const requested=(params.get('subject')||'physics').toLowerCase();
  const selected=registry[requested]?.enabled===false?physics:(registry[requested]||physics);

  function installSubjectSwitcher(){
    const host=document.querySelector('.topbar-inner');
    if(!host||document.getElementById('subjectSwitcher'))return;
    const nav=document.createElement('nav');nav.id='subjectSwitcher';nav.setAttribute('aria-label','A-Level subject');
    nav.style.cssText='display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:10px';
    Object.values(registry).forEach(subject=>{
      const a=document.createElement('a');a.textContent=subject.subject;a.style.cssText='text-decoration:none;color:inherit;border:1px solid rgba(160,190,225,.22);padding:7px 10px;border-radius:999px;font-size:.82rem;opacity:'+(subject.enabled===false?'.45':'1')+';background:'+(selected.id===subject.id?'rgba(119,189,251,.16)':'transparent');
      if(subject.enabled===false){a.setAttribute('aria-disabled','true');a.title='Coming in the next build phase';a.href='#';a.addEventListener('click',e=>e.preventDefault());}
      else{const url=new URL(location.href);url.searchParams.delete('view');url.searchParams.delete('topic');url.searchParams.delete('module');if(subject.id==='physics')url.searchParams.delete('subject');else url.searchParams.set('subject',subject.id);a.href=url.pathname+url.search;}
      nav.appendChild(a);
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
  window.ALEVEL_COURSE_CONFIG_VERSION='2.0.0';
  installSubjectSwitcher();
  prepareSubjectShell();
})();