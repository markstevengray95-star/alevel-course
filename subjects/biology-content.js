(()=>{
  'use strict';

  const profiles = Object.freeze({
  "3.1.1": {
    "q": "How do small biological monomers become larger molecules?",
    "core": [
      "Monomers are small molecular units; polymers are large molecules built from repeated monomers.",
      "Condensation reactions join molecules by forming a covalent bond and releasing water.",
      "Hydrolysis reactions use water to break covalent bonds between subunits.",
      "Monosaccharides, amino acids and nucleotides are important biological monomers."
    ],
    "model": [
      "Identify the monomers involved.",
      "Show the bond formed or broken.",
      "Track the water molecule: removed in condensation, used in hydrolysis."
    ],
    "terms": [
      "monomer",
      "polymer",
      "condensation",
      "hydrolysis"
    ],
    "mis": "Condensation is not simply 'removing water from a molecule'; the reaction forms a bond between molecules and water is produced.",
    "practical": [
      "Use molecular models or structural formulae to compare condensation and hydrolysis.",
      "Relate food digestion to hydrolysis and biosynthesis to condensation."
    ],
    "maths": [
      "Count monomer units and bonds in simple chains.",
      "Use ratios to compare monomer composition in molecules."
    ],
    "syn": [
      "Links directly to carbohydrates, proteins and nucleic acids.",
      "Explains why digestion and synthesis use opposite reaction types."
    ],
    "exam": [
      "Explain how a condensation reaction differs from hydrolysis.",
      "Predict the products when a short biological polymer is hydrolysed.",
      "Explain why condensation and hydrolysis are central to metabolism."
    ]
  },
  "3.1.2": {
    "q": "How does carbohydrate structure determine biological function?",
    "core": [
      "Glucose, galactose and fructose are monosaccharides; pairs can form disaccharides through glycosidic bonds.",
      "Alpha-glucose forms starch and glycogen; beta-glucose forms cellulose with straight chains and extensive hydrogen bonding.",
      "Starch stores glucose in plants; glycogen is highly branched for rapid glucose release in animals and fungi.",
      "Cellulose chains form microfibrils that give plant cell walls tensile strength."
    ],
    "model": [
      "Compare alpha- and beta-glucose orientation.",
      "Trace condensation to a glycosidic bond.",
      "Link branching or hydrogen bonding to storage or strength."
    ],
    "terms": [
      "glycosidic bond",
      "starch",
      "glycogen",
      "cellulose"
    ],
    "mis": "Cellulose is not made from alpha-glucose; its beta-glucose arrangement gives a different chain geometry and function.",
    "practical": [
      "Use Benedict's reagent for reducing sugars and iodine solution for starch.",
      "Control heating time, reagent volumes and concentration when comparing test results."
    ],
    "maths": [
      "Calculate percentage change in reducing-sugar concentration from calibration data.",
      "Interpret semi-quantitative colour or absorbance data."
    ],
    "syn": [
      "Links to respiration because glucose is an important respiratory substrate.",
      "Links to plant transport because sucrose is a major translocated carbohydrate."
    ],
    "exam": [
      "Compare starch, glycogen and cellulose in structure and function.",
      "Explain a positive Benedict's test in terms of reducing sugar.",
      "Explain why cellulose is suitable for strengthening plant cell walls."
    ]
  },
  "3.1.3": {
    "q": "Why are triglycerides and phospholipids suited to different biological roles?",
    "core": [
      "A triglyceride is formed from glycerol and three fatty acids joined by ester bonds in condensation reactions.",
      "Saturated fatty acids have no carbon-carbon double bonds; unsaturated fatty acids have one or more and may introduce kinks.",
      "Triglycerides are energy-dense, insoluble stores that do not affect water potential.",
      "Phospholipids have hydrophilic phosphate heads and hydrophobic fatty-acid tails, so they form bilayers."
    ],
    "model": [
      "Build glycerol plus fatty acids into a triglyceride.",
      "Distinguish saturated from unsaturated chains.",
      "Use amphipathic phospholipid structure to explain bilayer formation."
    ],
    "terms": [
      "triglyceride",
      "ester bond",
      "saturated",
      "phospholipid"
    ],
    "mis": "Lipids are not polymers made from one repeating monomer type; triglycerides are assembled from glycerol and fatty acids.",
    "practical": [
      "Use the emulsion test to detect lipids, keeping sample and ethanol volumes consistent.",
      "Relate membrane permeability to phospholipid behaviour."
    ],
    "maths": [
      "Compare energy stored per unit mass between lipid and carbohydrate data.",
      "Use surface-area or mass data when interpreting lipid storage."
    ],
    "syn": [
      "Phospholipids connect directly to membrane transport and cell signalling.",
      "Triglycerides connect to respiration and long-term energy balance."
    ],
    "exam": [
      "Explain why triglycerides are efficient energy stores.",
      "Explain how phospholipid structure leads to membrane formation.",
      "Describe and justify a biochemical test for lipid."
    ]
  },
  "3.1.4": {
    "q": "How does amino-acid sequence produce a functional protein?",
    "core": [
      "Amino acids join by peptide bonds to form polypeptides through condensation reactions.",
      "Primary structure is amino-acid sequence; secondary structure includes alpha helices and beta sheets stabilised by hydrogen bonds.",
      "Tertiary structure depends on interactions including hydrogen bonds, ionic bonds and disulfide bridges; some proteins have quaternary structure.",
      "Protein shape determines function, so changes in sequence or conditions can alter activity; enzymes are globular proteins with specific active sites."
    ],
    "model": [
      "Move from primary sequence to folding.",
      "Identify bonds or interactions stabilising higher structure.",
      "Connect three-dimensional shape to binding or structural function."
    ],
    "terms": [
      "peptide bond",
      "primary structure",
      "tertiary structure",
      "enzyme"
    ],
    "mis": "Denaturation usually changes higher-order structure, not the amino-acid sequence of the primary structure.",
    "practical": [
      "Use the Biuret test for peptide bonds and compare against controls.",
      "Investigate enzyme rate while controlling pH, temperature and substrate concentration."
    ],
    "maths": [
      "Calculate rate from product formed or substrate used per unit time.",
      "Interpret graphs of enzyme rate against temperature, pH or substrate concentration."
    ],
    "syn": [
      "Protein structure links gene sequence to phenotype.",
      "Enzymes connect biological molecules to respiration, digestion and DNA processes."
    ],
    "exam": [
      "Explain how primary structure can determine enzyme activity.",
      "Explain why high temperature can reduce enzyme-controlled reaction rate.",
      "Describe and justify a test for protein."
    ]
  },
  "3.1.5": {
    "q": "How do nucleic acids store, copy and transfer biological information?",
    "core": [
      "DNA and RNA are polynucleotides made from nucleotide monomers joined by phosphodiester bonds.",
      "DNA contains deoxyribose and bases A, T, C and G; RNA contains ribose and uses U instead of T.",
      "DNA has antiparallel strands held by hydrogen bonds between complementary base pairs A-T and C-G.",
      "Semi-conservative replication uses complementary base pairing; each new DNA molecule contains one original and one newly synthesised strand."
    ],
    "model": [
      "Represent nucleotide structure as phosphate-sugar-base.",
      "Use complementary base pairing to reconstruct a strand.",
      "Follow strand separation, complementary nucleotide pairing and phosphodiester bond formation in replication."
    ],
    "terms": [
      "nucleotide",
      "phosphodiester bond",
      "complementary base pairing",
      "semi-conservative replication"
    ],
    "mis": "Hydrogen bonds join the two DNA strands; phosphodiester bonds join adjacent nucleotides within each strand.",
    "practical": [
      "Interpret evidence from density-label experiments supporting semi-conservative replication.",
      "Use DNA sequence data to identify complementary sequences."
    ],
    "maths": [
      "Apply base-pair ratios in double-stranded DNA.",
      "Calculate proportions or percentages of bases from provided data."
    ],
    "syn": [
      "DNA structure links to protein synthesis in 3.4.2.",
      "Replication errors link to mutation and gene expression in 3.8."
    ],
    "exam": [
      "Compare DNA and RNA structure.",
      "Explain how complementary base pairing enables accurate DNA replication.",
      "Interpret experimental evidence for semi-conservative replication."
    ]
  },
  "3.1.6": {
    "q": "Why is ATP an effective immediate energy-transfer molecule?",
    "core": [
      "ATP consists of adenine, ribose and three phosphate groups.",
      "Hydrolysis of ATP to ADP and inorganic phosphate transfers energy for cellular processes.",
      "ATP can phosphorylate molecules, making them more reactive and helping couple energy-releasing and energy-requiring reactions.",
      "ATP is rapidly regenerated from ADP and phosphate during respiration and photosynthesis."
    ],
    "model": [
      "Identify ATP, ADP and phosphate.",
      "Link ATP hydrolysis to an energy-requiring process.",
      "Show ATP regeneration using energy from respiration or photosynthesis."
    ],
    "terms": [
      "ATP",
      "ADP",
      "phosphorylation",
      "energy coupling"
    ],
    "mis": "ATP is not a long-term energy store; it is an immediate energy-transfer molecule that is continually regenerated.",
    "practical": [
      "Use process diagrams to identify where ATP is produced and consumed.",
      "Relate ATP demand to active transport, muscle contraction and biosynthesis."
    ],
    "maths": [
      "Compare ATP yields from different respiratory pathways.",
      "Use rates of ATP use or production in data-response questions."
    ],
    "syn": [
      "Links directly to respiration and photosynthesis.",
      "Explains active transport, muscle contraction and many biosynthetic reactions."
    ],
    "exam": [
      "Explain why ATP is described as an immediate energy source.",
      "Explain how phosphorylation can make a molecule more reactive.",
      "Link ATP regeneration to respiration."
    ]
  },
  "3.1.7": {
    "q": "How do the properties of water support life?",
    "core": [
      "Water is polar because electrons are shared unequally, allowing hydrogen bonds between molecules.",
      "Hydrogen bonding gives water a high specific heat capacity and relatively high latent heat of vaporisation.",
      "Water is a useful solvent for ions and polar molecules, supporting transport and metabolic reactions.",
      "Cohesion between water molecules contributes to continuous columns of water in plant xylem."
    ],
    "model": [
      "Start with polarity.",
      "Use hydrogen bonding to explain a macroscopic property.",
      "Connect that property to a biological function."
    ],
    "terms": [
      "polar",
      "hydrogen bond",
      "specific heat capacity",
      "cohesion"
    ],
    "mis": "Hydrogen bonds are intermolecular attractions between water molecules, not the covalent O-H bonds inside one water molecule.",
    "practical": [
      "Interpret temperature-change data for water-rich systems.",
      "Relate evaporation to cooling and transpiration."
    ],
    "maths": [
      "Use temperature and energy data qualitatively or quantitatively.",
      "Compare rates of water loss under different conditions."
    ],
    "syn": [
      "Links to xylem transport and transpiration.",
      "Links to thermoregulation and stable aquatic environments."
    ],
    "exam": [
      "Explain how hydrogen bonding gives water a high specific heat capacity.",
      "Explain why water is a good transport medium.",
      "Explain how cohesion contributes to water movement in xylem."
    ]
  },
  "3.1.8": {
    "q": "Why are inorganic ions essential despite being present in small amounts?",
    "core": [
      "Ions occur in solution in cells and body fluids and can have structural, transport or regulatory roles.",
      "Hydrogen ions affect pH and therefore protein structure and enzyme activity.",
      "Iron ions are associated with haem groups in haemoglobin; phosphate ions occur in ATP, nucleotides and phospholipids.",
      "Sodium ions contribute to co-transport, nerve impulses and water balance."
    ],
    "model": [
      "Name the ion.",
      "Identify the molecule or process in which it functions.",
      "Explain the consequence if its concentration changes."
    ],
    "terms": [
      "inorganic ion",
      "hydrogen ion",
      "phosphate ion",
      "sodium ion"
    ],
    "mis": "An ion being present at low concentration does not mean it has little biological importance.",
    "practical": [
      "Interpret ion-concentration data from blood, tissues or plant solutions.",
      "Relate ionic gradients to transport across membranes."
    ],
    "maths": [
      "Compare concentrations using ratios or percentage differences.",
      "Interpret logarithmic pH values qualitatively."
    ],
    "syn": [
      "Links to haemoglobin, ATP, membranes and nervous coordination.",
      "Links concentration gradients to active transport and homeostasis."
    ],
    "exam": [
      "Explain two roles of inorganic ions in organisms.",
      "Explain how hydrogen-ion concentration can influence enzyme activity.",
      "Explain a role of sodium ions in membrane transport."
    ]
  },
  "3.2.1": {
    "q": "How does cell ultrastructure reveal specialised function?",
    "core": [
      "Eukaryotic cells contain membrane-bound organelles including nuclei, mitochondria, endoplasmic reticulum, Golgi apparatus and lysosomes.",
      "Prokaryotic cells lack a nucleus and membrane-bound organelles; they contain circular DNA, plasmids and smaller ribosomes.",
      "Viruses are acellular particles containing genetic material within a protein coat and replicate only inside host cells.",
      "Electron microscopes provide greater resolution than light microscopes; magnification does not automatically increase resolution."
    ],
    "model": [
      "Identify organelle structure.",
      "State its cellular role.",
      "Link abundance or specialisation of the organelle to the cell's function."
    ],
    "terms": [
      "ultrastructure",
      "resolution",
      "prokaryote",
      "organelle"
    ],
    "mis": "Higher magnification alone does not reveal more detail if the image lacks sufficient resolution.",
    "practical": [
      "Calibrate an eyepiece graticule using a stage micrometer and calculate actual specimen size.",
      "Compare light and electron micrographs using scale bars."
    ],
    "maths": [
      "Use magnification = image size / actual size with consistent units.",
      "Convert between mm, micrometres and nanometres."
    ],
    "syn": [
      "Links organelle abundance to ATP demand, protein secretion and digestion.",
      "Provides the structural basis for membrane transport and cell division."
    ],
    "exam": [
      "Compare prokaryotic and eukaryotic cells.",
      "Calculate actual cell size from a micrograph.",
      "Explain why electron microscopes reveal more cell detail than light microscopes."
    ]
  },
  "3.2.2": {
    "q": "How do cells produce genetically related cells and how do acellular viruses replicate?",
    "core": [
      "The cell cycle includes DNA replication followed by mitosis and cytokinesis.",
      "Mitosis separates replicated chromosomes to produce genetically identical daughter nuclei, supporting growth, repair and asexual reproduction.",
      "Binary fission in prokaryotes replicates circular DNA and plasmids before division.",
      "Viruses attach to host cells, introduce genetic material and use host machinery to produce new virus particles."
    ],
    "model": [
      "Replicate genetic material.",
      "Separate copies accurately.",
      "Divide the cell or assemble new viral particles."
    ],
    "terms": [
      "cell cycle",
      "mitosis",
      "binary fission",
      "viral replication"
    ],
    "mis": "Mitosis is nuclear division; DNA replication occurs before mitosis during interphase.",
    "practical": [
      "Identify stages of mitosis in prepared root-tip material and calculate mitotic index.",
      "Use aseptic interpretation when considering microbial growth."
    ],
    "maths": [
      "Calculate mitotic index as dividing cells / total cells.",
      "Use growth data to compare rates of cell division."
    ],
    "syn": [
      "Links to cancer when cell-cycle control fails.",
      "Links to genetic continuity and mutation."
    ],
    "exam": [
      "Explain why DNA replication must occur before mitosis.",
      "Compare mitosis with binary fission.",
      "Calculate and interpret mitotic index data."
    ]
  },
  "3.2.3": {
    "q": "How do membranes control exchange between cells and their surroundings?",
    "core": [
      "The fluid-mosaic membrane contains phospholipids, proteins, cholesterol and glycoproteins with different transport and signalling roles.",
      "Simple diffusion moves substances down a concentration gradient; facilitated diffusion uses channel or carrier proteins without ATP.",
      "Osmosis is movement of water across a partially permeable membrane from higher to lower water potential.",
      "Active transport moves substances against a gradient using ATP and carrier proteins; co-transport couples movement of one substance to another."
    ],
    "model": [
      "Identify the gradient and membrane component.",
      "Decide whether ATP is required.",
      "Explain the net movement and resulting change in concentration or water potential."
    ],
    "terms": [
      "fluid mosaic",
      "facilitated diffusion",
      "water potential",
      "active transport"
    ],
    "mis": "Osmosis refers specifically to net water movement, not the movement of solute particles.",
    "practical": [
      "Investigate the effect of external solute concentration on plant tissue mass or length.",
      "Control tissue size, temperature, time and solution volume."
    ],
    "maths": [
      "Calculate percentage change in mass or length.",
      "Plot a graph to estimate the solution concentration giving zero net change."
    ],
    "syn": [
      "Co-transport links to glucose absorption in the ileum.",
      "Active transport links membrane biology to ATP from respiration."
    ],
    "exam": [
      "Compare facilitated diffusion and active transport.",
      "Explain changes in plant tissue mass in different solutions.",
      "Explain how co-transport can absorb glucose against its concentration gradient."
    ]
  },
  "3.2.4": {
    "q": "How does the immune system distinguish self from non-self and remove pathogens?",
    "core": [
      "Cell-surface molecules allow recognition of self, foreign cells, pathogens and abnormal cells.",
      "Phagocytes engulf pathogens and can present antigens; T lymphocytes coordinate cellular responses and stimulate other immune cells.",
      "B lymphocytes undergo clonal selection and differentiate into plasma cells that secrete specific antibodies and memory cells.",
      "Vaccination produces primary exposure and memory, giving a faster, larger secondary response; pathogens such as HIV can disrupt immune function."
    ],
    "model": [
      "Recognise a foreign antigen.",
      "Activate the specific lymphocyte clone.",
      "Produce effector cells and memory cells for a faster future response."
    ],
    "terms": [
      "antigen",
      "phagocytosis",
      "clonal selection",
      "antibody"
    ],
    "mis": "Antibodies do not kill every pathogen directly; they bind specific antigens and can neutralise or help other immune processes remove pathogens.",
    "practical": [
      "Interpret antibody concentration or lymphocyte response graphs after vaccination.",
      "Evaluate vaccine data while distinguishing correlation, effectiveness and population coverage."
    ],
    "maths": [
      "Compare primary and secondary response curves.",
      "Calculate percentage effectiveness or relative risk from supplied data."
    ],
    "syn": [
      "Links protein shape to antibody specificity.",
      "Links gene mutation and pathogen evolution to vaccine effectiveness."
    ],
    "exam": [
      "Explain clonal selection of B lymphocytes.",
      "Explain why a second exposure can produce a faster response.",
      "Interpret data on vaccination and disease incidence."
    ]
  },
  "3.3.1": {
    "q": "Why does organism size change the way exchange must occur?",
    "core": [
      "Surface area increases with length squared whereas volume increases with length cubed, so surface-area-to-volume ratio falls as size increases.",
      "Small organisms may exchange sufficiently across their body surface; larger organisms need specialised exchange surfaces and mass transport systems.",
      "Efficient exchange surfaces have large area, short diffusion distance and mechanisms that maintain steep concentration gradients.",
      "Shape, folding, ventilation and blood flow can all improve exchange."
    ],
    "model": [
      "Compare surface area with volume.",
      "Identify the diffusion distance.",
      "Explain how a gradient is maintained."
    ],
    "terms": [
      "surface-area-to-volume ratio",
      "diffusion distance",
      "exchange surface",
      "concentration gradient"
    ],
    "mis": "Larger organisms do not have less surface area; they have less surface area relative to their volume.",
    "practical": [
      "Measure dimensions of model organisms or agar blocks to calculate surface-area-to-volume ratio.",
      "Compare diffusion distance or colour change through blocks of different size."
    ],
    "maths": [
      "Calculate surface area, volume and SA:V ratio.",
      "Use diffusion-distance or time data to compare exchange efficiency."
    ],
    "syn": [
      "Explains the need for lungs, gills, circulatory systems and transport tissues.",
      "Links to heat loss and metabolic demand."
    ],
    "exam": [
      "Explain why large organisms need specialised exchange systems.",
      "Calculate and compare SA:V ratios.",
      "Explain two adaptations of an efficient exchange surface."
    ]
  },
  "3.3.2": {
    "q": "How are gas-exchange surfaces adapted to different environments?",
    "core": [
      "Mammalian alveoli provide a large surface area, thin barrier, ventilation and blood supply for rapid gas exchange.",
      "Fish gills use filaments and lamellae; countercurrent flow maintains a diffusion gradient along the whole exchange surface.",
      "Insects deliver gases through tracheae and tracheoles, with ventilation and reduced diffusion distance to tissues.",
      "Leaves exchange gases through stomata and internal air spaces while balancing carbon dioxide uptake against water loss."
    ],
    "model": [
      "Identify the gas-exchange surface.",
      "Trace gas movement down partial-pressure or concentration gradients.",
      "Explain how structure and flow maintain the gradient."
    ],
    "terms": [
      "alveolus",
      "countercurrent flow",
      "tracheole",
      "stoma"
    ],
    "mis": "Countercurrent flow is effective because blood and water move in opposite directions, maintaining a gradient along the gill rather than reaching equilibrium early.",
    "practical": [
      "Measure stomatal density or investigate factors affecting ventilation or gas exchange.",
      "Use microscopy or respirometry-style data carefully with controls."
    ],
    "maths": [
      "Calculate rate of gas exchange from volume or concentration change over time.",
      "Interpret gradients and percentage changes in gas composition."
    ],
    "syn": [
      "Links to haemoglobin and mass transport.",
      "Links stomatal behaviour to transpiration and photosynthesis."
    ],
    "exam": [
      "Explain how alveoli are adapted for gas exchange.",
      "Explain the advantage of countercurrent flow in fish gills.",
      "Compare gas exchange in insects and mammals."
    ]
  },
  "3.3.3": {
    "q": "How are large food molecules digested and absorbed efficiently?",
    "core": [
      "Carbohydrases, proteases and lipases hydrolyse large molecules into absorbable monomers or smaller products.",
      "Endopeptidases hydrolyse internal peptide bonds; exopeptidases remove terminal amino acids; membrane-bound dipeptidases complete digestion.",
      "Bile salts emulsify lipids, increasing surface area for lipase, and micelles help transport lipid digestion products to epithelial cells.",
      "Ileum epithelial cells have microvilli, transport proteins and many mitochondria; sodium-glucose co-transport supports glucose uptake."
    ],
    "model": [
      "Hydrolyse the large molecule with specific enzymes.",
      "Bring products to the epithelial membrane.",
      "Use diffusion, facilitated diffusion or co-transport to enter cells and then the blood/lymph."
    ],
    "terms": [
      "hydrolysis",
      "endopeptidase",
      "micelle",
      "co-transport"
    ],
    "mis": "Bile is not an enzyme; it emulsifies lipids and helps create conditions that support lipid digestion.",
    "practical": [
      "Use food tests or enzyme investigations to relate digestion to molecular products.",
      "Interpret absorption data from intestinal tissue or transport-protein experiments."
    ],
    "maths": [
      "Calculate enzyme rate from concentration change.",
      "Compare absorption rates and percentage uptake."
    ],
    "syn": [
      "Links enzyme specificity to protein structure.",
      "Links co-transport to membrane transport and ATP."
    ],
    "exam": [
      "Explain how protein digestion produces absorbable amino acids.",
      "Explain the role of bile salts and micelles in lipid absorption.",
      "Explain sodium-glucose co-transport in the ileum."
    ]
  },
  "3.3.4": {
    "q": "How do animals and plants move substances over long distances?",
    "core": [
      "Haemoglobin loads oxygen where oxygen partial pressure is high and unloads it where lower; carbon dioxide and other factors can shift oxygen affinity.",
      "The mammalian heart creates pressure differences that drive blood through arteries, capillaries and veins; tissue fluid forms by pressure filtration and returns by osmotic forces and lymph.",
      "Xylem transports water and mineral ions largely by the cohesion-tension mechanism generated by transpiration.",
      "Phloem translocation moves assimilates between sources and sinks; loading can lower water potential and generate hydrostatic pressure."
    ],
    "model": [
      "Identify source and destination.",
      "State the pressure, water-potential or concentration difference.",
      "Explain how vessel structure and bulk flow maintain transport."
    ],
    "terms": [
      "haemoglobin",
      "tissue fluid",
      "cohesion-tension",
      "translocation"
    ],
    "mis": "Xylem water movement is not driven by ATP-powered pumps along the vessel; transpiration and cohesion generate tension in the water column.",
    "practical": [
      "Use a potometer to estimate water uptake under controlled environmental conditions.",
      "Interpret heart, blood-pressure, oxygen-dissociation or phloem-tracer data."
    ],
    "maths": [
      "Calculate cardiac output = heart rate × stroke volume.",
      "Calculate transpiration or uptake rate from distance/volume per time."
    ],
    "syn": [
      "Links gas exchange to oxygen transport and respiration.",
      "Links water transport to stomata, photosynthesis and mineral uptake."
    ],
    "exam": [
      "Explain the shape and shift of an oxygen dissociation curve.",
      "Explain tissue-fluid formation and return.",
      "Explain how transpiration can move water through xylem."
    ]
  },
  "3.4.1": {
    "q": "How is genetic information organised from DNA to chromosomes?",
    "core": [
      "A gene is a sequence of DNA bases that codes for a polypeptide or functional RNA product.",
      "A locus is the position of a gene on a chromosome; alleles are alternative forms of a gene.",
      "In eukaryotes, DNA is associated with proteins and arranged as linear chromosomes; prokaryotic DNA is typically circular and may include plasmids.",
      "The genome is the complete DNA of an organism; the proteome is the full set of proteins expressed by a cell or organism."
    ],
    "model": [
      "Locate a gene on DNA.",
      "Distinguish gene, allele and locus.",
      "Scale up from DNA sequence to chromosome to genome."
    ],
    "terms": [
      "gene",
      "locus",
      "allele",
      "genome"
    ],
    "mis": "A chromosome contains many genes; one chromosome is not equivalent to one gene.",
    "practical": [
      "Interpret chromosome, gene-map or sequence diagrams.",
      "Compare genome size or coding-sequence data."
    ],
    "maths": [
      "Use base-pair lengths and proportions of coding DNA.",
      "Compare chromosome or genome quantities using ratios."
    ],
    "syn": [
      "Sets up inheritance and gene expression.",
      "Links genome information to protein production and phenotype."
    ],
    "exam": [
      "Distinguish gene, allele and locus.",
      "Explain how DNA is organised in a eukaryotic chromosome.",
      "Interpret genome or chromosome data."
    ]
  },
  "3.4.2": {
    "q": "How is information in DNA converted into a polypeptide?",
    "core": [
      "During transcription, RNA polymerase uses one DNA strand as a template to produce complementary pre-mRNA/RNA.",
      "In eukaryotes, introns are removed and exons joined during RNA processing before mature mRNA leaves the nucleus.",
      "At ribosomes, mRNA codons are read; tRNA anticodons pair with codons and bring specific amino acids.",
      "Peptide bonds form between amino acids, producing a polypeptide whose primary structure influences final protein shape and function."
    ],
    "model": [
      "Transcribe a DNA template into RNA.",
      "Process RNA where relevant.",
      "Translate codons using tRNA and join amino acids into a polypeptide."
    ],
    "terms": [
      "transcription",
      "mRNA",
      "codon",
      "tRNA"
    ],
    "mis": "Translation does not occur in the nucleus in eukaryotic cells; ribosomes in the cytoplasm or on rough ER carry it out.",
    "practical": [
      "Use genetic-code tables to infer amino-acid sequences from nucleotide sequences.",
      "Interpret experimental data on transcription or translation inhibitors."
    ],
    "maths": [
      "Convert nucleotide counts into maximum amino-acid counts using triplets.",
      "Calculate changes in polypeptide length after sequence changes."
    ],
    "syn": [
      "Links directly to mutation, gene regulation and protein function.",
      "Connects nucleic acids to enzymes and cell structure."
    ],
    "exam": [
      "Explain transcription and RNA processing.",
      "Use a DNA sequence to determine an amino-acid sequence.",
      "Explain the role of tRNA in translation."
    ]
  },
  "3.4.3": {
    "q": "How do mutation and meiosis generate genetic diversity?",
    "core": [
      "Mutation creates new alleles by altering DNA sequence.",
      "Meiosis produces haploid cells and generates variation through crossing over between homologous chromosomes.",
      "Independent segregation of homologous chromosome pairs produces different combinations of maternal and paternal chromosomes.",
      "Random fertilisation further increases the number of possible genetic combinations."
    ],
    "model": [
      "Create allele variation by mutation.",
      "Recombine alleles during meiosis.",
      "Combine gametes randomly at fertilisation."
    ],
    "terms": [
      "mutation",
      "crossing over",
      "independent segregation",
      "genetic diversity"
    ],
    "mis": "Mitosis does not normally generate the same diversity as meiosis; its role is to produce genetically similar daughter cells.",
    "practical": [
      "Interpret chromosome diagrams showing crossing over and segregation.",
      "Use offspring or gamete data to infer sources of variation."
    ],
    "maths": [
      "Calculate possible chromosome combinations from independent segregation.",
      "Use probability rules for gamete or offspring combinations."
    ],
    "syn": [
      "Provides variation on which natural selection acts.",
      "Links to inheritance patterns and population genetics."
    ],
    "exam": [
      "Explain how crossing over increases genetic diversity.",
      "Explain independent segregation in meiosis.",
      "Compare sources of genetic variation in sexual reproduction."
    ]
  },
  "3.4.4": {
    "q": "How does selection turn variation into adaptation?",
    "core": [
      "Populations contain genetic variation caused by mutation and sexual reproduction.",
      "Selection pressures create differential survival and reproductive success among phenotypes.",
      "Alleles associated with advantageous phenotypes can increase in frequency over generations.",
      "Directional selection favours one extreme; stabilising selection favours intermediate phenotypes and reduces extremes."
    ],
    "model": [
      "Identify variation in the population.",
      "State the selection pressure and differential reproductive success.",
      "Track the resulting change in allele frequency across generations."
    ],
    "terms": [
      "selection pressure",
      "adaptation",
      "directional selection",
      "stabilising selection"
    ],
    "mis": "Individuals do not evolve because they 'need' to; allele frequencies change across generations in populations.",
    "practical": [
      "Interpret frequency distributions before and after selection.",
      "Evaluate data linking phenotype to survival or reproductive success."
    ],
    "maths": [
      "Compare means and distributions across generations.",
      "Calculate percentage or proportional changes in phenotype frequency."
    ],
    "syn": [
      "Links meiosis-generated variation to evolution.",
      "Links antibiotic resistance and environmental change to selection."
    ],
    "exam": [
      "Explain natural selection using allele frequency.",
      "Distinguish directional and stabilising selection.",
      "Interpret a graph showing phenotypic change under selection."
    ]
  },
  "3.4.5": {
    "q": "How do biologists define species and organise biological diversity?",
    "core": [
      "A species is commonly defined as organisms able to interbreed to produce fertile offspring.",
      "Taxonomy groups organisms hierarchically, with binomial names using genus and species.",
      "Modern classification uses evidence from morphology, molecular data and evolutionary relationships.",
      "Phylogenetic classification aims to reflect common ancestry and can change as new evidence becomes available."
    ],
    "model": [
      "Collect comparable characteristics or molecular evidence.",
      "Infer relatedness.",
      "Place organisms into a hierarchy or phylogenetic grouping."
    ],
    "terms": [
      "species",
      "taxonomy",
      "binomial nomenclature",
      "phylogeny"
    ],
    "mis": "Similarity in appearance alone does not prove two organisms belong to the same species or are closely related.",
    "practical": [
      "Interpret cladograms or molecular comparisons.",
      "Evaluate how new DNA or protein evidence could change classification."
    ],
    "maths": [
      "Compare percentage sequence similarity.",
      "Read branching diagrams and infer common ancestry."
    ],
    "syn": [
      "Links directly to DNA/protein comparisons in investigating diversity.",
      "Provides a framework for studying biodiversity and evolution."
    ],
    "exam": [
      "Explain the biological species concept.",
      "Explain why classification may change with new molecular evidence.",
      "Interpret a phylogenetic tree."
    ]
  },
  "3.4.6": {
    "q": "How can biodiversity within a community be measured and compared?",
    "core": [
      "Biodiversity includes species richness and the evenness or abundance distribution of species.",
      "An index of diversity combines the number of species with their relative abundance and allows communities to be compared.",
      "Agricultural practices can reduce biodiversity through habitat simplification, pesticide use and removal of competing species.",
      "Conservation decisions balance food production, economics and maintaining genetic/species diversity."
    ],
    "model": [
      "Sample species and abundance consistently.",
      "Calculate or compare a diversity measure.",
      "Explain ecological causes of differences between communities."
    ],
    "terms": [
      "biodiversity",
      "species richness",
      "abundance",
      "index of diversity"
    ],
    "mis": "A community with more species is not automatically more diverse if one species dominates almost all individuals.",
    "practical": [
      "Use quadrats or transects with random or systematic sampling as appropriate.",
      "Standardise sampling effort when comparing sites."
    ],
    "maths": [
      "Calculate an index of diversity from abundance data.",
      "Use means, percentages and appropriate graphical displays for field data."
    ],
    "syn": [
      "Links sampling to population ecology.",
      "Links biodiversity changes to succession and conservation."
    ],
    "exam": [
      "Explain how sampling design affects biodiversity estimates.",
      "Calculate and interpret a diversity index.",
      "Evaluate an agricultural practice for its effect on biodiversity."
    ]
  },
  "3.4.7": {
    "q": "How can molecular and observable evidence be used to investigate diversity?",
    "core": [
      "Variation within and between species can be studied using measurable characteristics, DNA base sequences, mRNA or amino-acid sequences.",
      "Greater sequence similarity generally indicates more recent common ancestry, though evidence must be interpreted with suitable models and samples.",
      "Immunological comparisons can use antibody-antigen binding as indirect evidence of protein similarity.",
      "Continuous and discontinuous variation require different descriptions and statistical approaches."
    ],
    "model": [
      "Choose a comparable biological feature.",
      "Quantify similarity or difference.",
      "Use the pattern as evidence for diversity or relatedness."
    ],
    "terms": [
      "intraspecific variation",
      "interspecific variation",
      "sequence similarity",
      "immunological comparison"
    ],
    "mis": "A single characteristic rarely gives a complete measure of relatedness; multiple lines of evidence strengthen conclusions.",
    "practical": [
      "Compare DNA/protein sequence data or measured phenotypes.",
      "Use appropriate sampling and avoid confounding environmental effects."
    ],
    "maths": [
      "Calculate means, standard deviations or percentage differences where appropriate.",
      "Interpret sequence-similarity matrices and distributions."
    ],
    "syn": [
      "Links taxonomy to molecular evidence.",
      "Links variation to natural selection and inheritance."
    ],
    "exam": [
      "Explain how DNA sequences can indicate relatedness.",
      "Evaluate the use of one phenotypic characteristic to compare populations.",
      "Interpret molecular-diversity data."
    ]
  },
  "3.5.1": {
    "q": "How is light energy converted into chemical energy in photosynthesis?",
    "core": [
      "Light-dependent reactions occur on thylakoid membranes where chlorophyll absorbs light and excited electrons enter electron-transfer chains.",
      "Photolysis of water provides electrons and protons and releases oxygen; electron transfer supports ATP synthesis by chemiosmosis.",
      "Reduced NADP and ATP supply reducing power and energy for the Calvin cycle in the stroma.",
      "RuBisCO fixes carbon dioxide to RuBP; GP is reduced to TP, some TP forms useful organic molecules and the rest regenerates RuBP."
    ],
    "model": [
      "Capture light and excite electrons.",
      "Generate ATP and reduced NADP in the light-dependent stage.",
      "Fix carbon dioxide and use ATP/reduced NADP to make TP in the Calvin cycle."
    ],
    "terms": [
      "photolysis",
      "chemiosmosis",
      "RuBisCO",
      "triose phosphate"
    ],
    "mis": "The light-independent reactions do not mean 'only happen in the dark'; they depend on ATP and reduced NADP supplied by light-dependent reactions.",
    "practical": [
      "Investigate effects of light intensity, wavelength or carbon dioxide on photosynthetic rate.",
      "Control temperature and account for limiting factors."
    ],
    "maths": [
      "Calculate rate from oxygen production or carbon-dioxide uptake.",
      "Interpret limiting-factor graphs and inverse-square changes in light intensity."
    ],
    "syn": [
      "Links chloroplast structure to ATP production.",
      "Links photosynthetic products to respiration and ecosystem productivity."
    ],
    "exam": [
      "Explain ATP production in the light-dependent reaction.",
      "Explain carbon fixation and RuBP regeneration in the Calvin cycle.",
      "Interpret a graph showing limiting factors of photosynthesis."
    ]
  },
  "3.5.2": {
    "q": "How is energy released from respiratory substrates to make ATP?",
    "core": [
      "Glycolysis in the cytoplasm converts glucose to pyruvate, producing a small yield of ATP and reduced NAD.",
      "In aerobic conditions pyruvate is decarboxylated and dehydrogenated in the link reaction, producing acetyl coenzyme A.",
      "The Krebs cycle produces carbon dioxide, ATP, reduced NAD and reduced FAD; reduced coenzymes deliver electrons to the electron-transfer chain.",
      "Oxidative phosphorylation uses electron transfer, proton pumping and chemiosmosis; oxygen is the final electron acceptor and water forms."
    ],
    "model": [
      "Partially oxidise glucose in glycolysis.",
      "Complete carbon oxidation through link reaction and Krebs cycle.",
      "Use reduced coenzymes to drive oxidative phosphorylation and ATP synthesis."
    ],
    "terms": [
      "glycolysis",
      "Krebs cycle",
      "oxidative phosphorylation",
      "chemiosmosis"
    ],
    "mis": "Oxygen is not used directly in glycolysis or the Krebs cycle; it acts as the final electron acceptor in oxidative phosphorylation.",
    "practical": [
      "Use respirometers to measure oxygen uptake while controlling temperature and organism mass.",
      "Interpret respiratory quotient or inhibitor data."
    ],
    "maths": [
      "Calculate respiration rate from gas-volume or distance changes over time.",
      "Use respiratory quotient = CO2 produced / O2 consumed when data are provided."
    ],
    "syn": [
      "Links ATP supply to active transport, muscle contraction and biosynthesis.",
      "Links mitochondrion structure to electron transfer and chemiosmosis."
    ],
    "exam": [
      "Explain oxidative phosphorylation in mitochondria.",
      "Explain the role of reduced NAD in respiration.",
      "Calculate and interpret respiration-rate data."
    ]
  },
  "3.5.3": {
    "q": "How efficiently is energy transferred through ecosystems?",
    "core": [
      "Gross primary production is the chemical energy stored by producers; net primary production equals GPP minus respiratory losses.",
      "Only some NPP is transferred to primary consumers because not all biomass is eaten or digested.",
      "At each trophic level energy is lost in respiration, movement, heat, waste and uneaten material.",
      "Agricultural systems can increase transfer efficiency by reducing movement, controlling temperature or reducing trophic levels."
    ],
    "model": [
      "Measure energy entering a trophic level.",
      "Subtract respiratory or other losses.",
      "Compare energy transferred to the next trophic level."
    ],
    "terms": [
      "GPP",
      "NPP",
      "trophic level",
      "transfer efficiency"
    ],
    "mis": "Energy is not recycled through ecosystems; energy flows through and is ultimately dissipated as heat, while nutrients are recycled.",
    "practical": [
      "Interpret biomass or calorimetry-style energy data across trophic levels.",
      "Evaluate interventions intended to improve agricultural productivity."
    ],
    "maths": [
      "Use NPP = GPP - R and calculate percentage efficiency = output/input × 100.",
      "Compare energy or biomass pyramids quantitatively."
    ],
    "syn": [
      "Links photosynthesis to ecosystem energy input.",
      "Links respiration to losses from trophic levels."
    ],
    "exam": [
      "Calculate NPP from GPP and respiratory loss.",
      "Explain why energy transfer between trophic levels is inefficient.",
      "Evaluate a method for increasing food-production efficiency."
    ]
  },
  "3.5.4": {
    "q": "How are mineral nutrients recycled through ecosystems?",
    "core": [
      "Decomposers digest organic material and release inorganic nutrients through mineralisation.",
      "The nitrogen cycle includes nitrogen fixation, ammonification, nitrification and denitrification carried out by different microorganisms.",
      "Plants absorb mineral ions and incorporate them into organic molecules; feeding transfers nutrients through food webs.",
      "Fertilisers can increase productivity but nutrient runoff can cause eutrophication, algal blooms, decomposition and oxygen depletion."
    ],
    "model": [
      "Identify the nutrient store.",
      "Name the biological or chemical process moving it.",
      "Track consequences for producers, decomposers and oxygen availability."
    ],
    "terms": [
      "mineralisation",
      "nitrification",
      "denitrification",
      "eutrophication"
    ],
    "mis": "Nitrifying and nitrogen-fixing bacteria perform different processes; they are not interchangeable labels.",
    "practical": [
      "Interpret nitrate/phosphate concentration, oxygen and species-abundance data from water bodies.",
      "Evaluate fertiliser use using both productivity and environmental evidence."
    ],
    "maths": [
      "Calculate percentage changes in nutrient or oxygen concentration.",
      "Interpret time-series and correlation data cautiously."
    ],
    "syn": [
      "Links decomposition to respiration.",
      "Links nutrient availability to productivity and succession."
    ],
    "exam": [
      "Explain the role of microorganisms in the nitrogen cycle.",
      "Explain how fertiliser runoff can lead to fish death.",
      "Interpret nutrient and dissolved-oxygen data."
    ]
  },
  "3.6.1": {
    "q": "How do organisms detect environmental change and produce adaptive responses?",
    "core": [
      "Receptors detect specific stimuli and convert them into signals that can coordinate a response.",
      "Simple organisms can alter movement using taxes, directed responses, or kineses, changes in activity related to stimulus intensity.",
      "Plants respond to directional stimuli through growth responses such as phototropism and gravitropism, involving unequal growth.",
      "Responses increase the probability of favourable conditions or reduce exposure to harmful conditions."
    ],
    "model": [
      "Detect the stimulus.",
      "Coordinate a directional or activity response.",
      "Explain the adaptive value of the changed behaviour or growth."
    ],
    "terms": [
      "receptor",
      "taxis",
      "kinesis",
      "tropism"
    ],
    "mis": "A kinesis is not directed toward or away from a stimulus; the rate of movement changes with stimulus intensity.",
    "practical": [
      "Investigate invertebrate choice or movement under controlled conditions while considering ethics.",
      "Measure plant growth responses to directional light or gravity."
    ],
    "maths": [
      "Compare time spent, turning frequency or movement rate between conditions.",
      "Use chi-squared or other supplied statistical approaches where appropriate."
    ],
    "syn": [
      "Links sensory detection to nervous coordination.",
      "Links plant responses to hormones and growth."
    ],
    "exam": [
      "Distinguish taxis from kinesis.",
      "Explain how a plant shoot responds to directional light.",
      "Evaluate a behavioural-response investigation."
    ]
  },
  "3.6.2": {
    "q": "How do neurones transmit information rapidly and precisely?",
    "core": [
      "Resting potential arises from ion gradients and selective membrane permeability maintained partly by the sodium-potassium pump.",
      "A threshold stimulus opens voltage-gated sodium channels, causing depolarisation; potassium-channel opening contributes to repolarisation.",
      "Local currents trigger adjacent membrane, producing an action potential that is all-or-nothing; myelination enables saltatory conduction.",
      "At synapses, neurotransmitter release, diffusion and receptor binding cause a postsynaptic response; synapses allow unidirectional transmission and integration."
    ],
    "model": [
      "Establish ion gradients and resting potential.",
      "Generate and propagate an action potential.",
      "Convert electrical to chemical and back to electrical signalling at a synapse."
    ],
    "terms": [
      "resting potential",
      "depolarisation",
      "action potential",
      "synapse"
    ],
    "mis": "A stronger stimulus does not make each action potential larger; it can increase the frequency of action potentials.",
    "practical": [
      "Interpret membrane-potential traces and conduction-velocity data.",
      "Evaluate effects of drugs or toxins on synaptic transmission from experimental data."
    ],
    "maths": [
      "Calculate conduction velocity from distance and time.",
      "Interpret threshold and frequency information from graphs."
    ],
    "syn": [
      "Links membrane transport and ATP to nervous signalling.",
      "Links neurones to muscle contraction and homeostatic control."
    ],
    "exam": [
      "Explain the generation of an action potential.",
      "Explain why myelination increases conduction speed.",
      "Explain transmission across a cholinergic synapse."
    ]
  },
  "3.6.3": {
    "q": "How does a nerve impulse cause skeletal muscle contraction?",
    "core": [
      "Skeletal muscle contains myofibrils organised into sarcomeres with overlapping actin and myosin filaments.",
      "Calcium ions bind to regulatory proteins, moving tropomyosin and exposing myosin-binding sites on actin.",
      "Myosin heads form cross-bridges, perform power strokes and detach when ATP binds; ATP hydrolysis re-cocks the head.",
      "Repeated cross-bridge cycling slides filaments past one another so sarcomeres shorten without the filaments themselves shortening."
    ],
    "model": [
      "Release calcium and expose actin binding sites.",
      "Form myosin-actin cross-bridges and perform power strokes.",
      "Use ATP for detachment and repeat the cycle."
    ],
    "terms": [
      "sarcomere",
      "actin",
      "myosin",
      "cross-bridge"
    ],
    "mis": "Actin and myosin filaments do not shorten during contraction; their overlap increases as they slide.",
    "practical": [
      "Interpret sarcomere micrographs or force data.",
      "Relate ATP availability or calcium concentration to contraction."
    ],
    "maths": [
      "Calculate percentage change in sarcomere length or overlap.",
      "Interpret force-frequency or length-tension graphs."
    ],
    "syn": [
      "Links nervous coordination to effector response.",
      "Links ATP from respiration to cross-bridge cycling."
    ],
    "exam": [
      "Explain the sliding-filament mechanism.",
      "Explain the role of ATP in muscle contraction.",
      "Interpret changes in sarcomere bands during contraction."
    ]
  },
  "3.6.4": {
    "q": "How does negative feedback maintain a stable internal environment?",
    "core": [
      "Homeostasis keeps internal conditions within limits using receptors, coordination centres and effectors, usually through negative feedback.",
      "Blood glucose is regulated by insulin and glucagon through effects on glucose uptake, glycogenesis, glycogenolysis and gluconeogenesis.",
      "The kidney filters blood at the glomerulus, selectively reabsorbs useful substances and forms urine; loop of Henle organisation supports a medullary water-potential gradient.",
      "ADH changes collecting-duct permeability, adjusting water reabsorption according to blood water potential."
    ],
    "model": [
      "Detect deviation from a set range.",
      "Activate an effector that opposes the change.",
      "Reduce the original stimulus as conditions return toward normal."
    ],
    "terms": [
      "negative feedback",
      "insulin",
      "ultrafiltration",
      "ADH"
    ],
    "mis": "Negative feedback does not keep a variable perfectly constant; it reduces deviations and maintains conditions within a suitable range.",
    "practical": [
      "Interpret glucose-tolerance, urine-concentration or hormone data.",
      "Use microscopy/data to relate nephron structure to function."
    ],
    "maths": [
      "Calculate changes in blood concentration or filtration/reabsorption percentages.",
      "Interpret time-series responses after a physiological challenge."
    ],
    "syn": [
      "Links hormones, membranes and transport proteins.",
      "Links homeostasis to nervous coordination and metabolism."
    ],
    "exam": [
      "Explain negative feedback in blood-glucose control.",
      "Explain ultrafiltration and selective reabsorption.",
      "Explain how ADH changes urine concentration."
    ]
  },
  "3.7.1": {
    "q": "How can inheritance patterns reveal interactions between alleles and genes?",
    "core": [
      "Genotypes determine inherited allele combinations; phenotype results from genotype interacting with environment.",
      "Monohybrid and dihybrid crosses use segregation and independent assortment; deviations can arise from linkage, sex linkage, codominance or multiple alleles.",
      "Epistasis occurs when one gene affects expression of another gene.",
      "Observed offspring ratios can be compared with expected ratios using a chi-squared test when assumptions are met."
    ],
    "model": [
      "Define parental genotypes and gametes.",
      "Use a genetic cross to predict offspring probabilities.",
      "Compare observed and expected results, then judge whether differences could be due to chance."
    ],
    "terms": [
      "genotype",
      "codominance",
      "sex linkage",
      "epistasis"
    ],
    "mis": "A probability from a genetic cross predicts proportions over many offspring; it does not guarantee a fixed outcome for a small family.",
    "practical": [
      "Analyse pedigree or breeding data without assuming phenotype always reveals genotype.",
      "Use chi-squared on categorical offspring data where appropriate."
    ],
    "maths": [
      "Use probability, ratios and chi-squared calculations.",
      "Interpret critical values and degrees of freedom when provided."
    ],
    "syn": [
      "Links meiosis to allele segregation.",
      "Links inheritance to population allele frequencies and evolution."
    ],
    "exam": [
      "Solve a genetic cross involving non-simple dominance.",
      "Interpret a pedigree for a sex-linked condition.",
      "Use chi-squared to compare observed and expected offspring."
    ]
  },
  "3.7.2": {
    "q": "How do allele frequencies describe genetic change in populations?",
    "core": [
      "A population is a group of organisms of the same species living in the same place at the same time.",
      "The gene pool contains all alleles in the population; allele frequency is the proportion of a particular allele.",
      "Under Hardy-Weinberg assumptions, p + q = 1 and p² + 2pq + q² = 1 for a two-allele locus.",
      "Selection, mutation, migration, non-random mating and genetic drift can change allele frequencies over time."
    ],
    "model": [
      "Define allele frequencies p and q.",
      "Use Hardy-Weinberg to predict genotype frequencies under assumptions.",
      "Compare prediction with evidence for evolutionary change."
    ],
    "terms": [
      "gene pool",
      "allele frequency",
      "Hardy-Weinberg",
      "genetic drift"
    ],
    "mis": "Hardy-Weinberg is a null model with assumptions; real populations may deviate because evolutionary forces operate.",
    "practical": [
      "Interpret genotype-count data from populations.",
      "Evaluate whether sampling and Hardy-Weinberg assumptions are reasonable."
    ],
    "maths": [
      "Use p + q = 1 and p² + 2pq + q² = 1.",
      "Convert genotype counts into frequencies and percentages."
    ],
    "syn": [
      "Connects inheritance to evolution quantitatively.",
      "Links selection pressure to changes in allele frequency."
    ],
    "exam": [
      "Calculate allele frequencies using Hardy-Weinberg.",
      "State assumptions of the Hardy-Weinberg principle.",
      "Explain how selection changes allele frequency."
    ]
  },
  "3.7.3": {
    "q": "How can reproductive isolation lead to new species?",
    "core": [
      "Natural selection changes allele frequencies when phenotypes differ in reproductive success.",
      "Reproductive isolation reduces gene flow between populations, allowing genetic differences to accumulate.",
      "Geographical isolation can initiate allopatric divergence; reproductive barriers can also develop without physical separation.",
      "If populations become unable to interbreed to produce fertile offspring, speciation has occurred under the biological species concept."
    ],
    "model": [
      "Reduce gene flow between populations.",
      "Allow mutation, selection and drift to change allele frequencies independently.",
      "Accumulate reproductive barriers until interbreeding no longer produces fertile offspring."
    ],
    "terms": [
      "reproductive isolation",
      "gene flow",
      "allopatric speciation",
      "speciation"
    ],
    "mis": "Geographical separation alone is not speciation; reproductive isolation must develop.",
    "practical": [
      "Interpret allele-frequency or trait data from diverging populations.",
      "Evaluate evidence for reproductive isolation."
    ],
    "maths": [
      "Compare allele-frequency changes through time.",
      "Interpret distributions or sequence divergence between populations."
    ],
    "syn": [
      "Builds directly on natural selection and population genetics.",
      "Links taxonomy and species concepts to evolutionary processes."
    ],
    "exam": [
      "Explain how geographical isolation can lead to speciation.",
      "Explain the role of selection in divergence.",
      "Interpret data from two diverging populations."
    ]
  },
  "3.7.4": {
    "q": "What controls population size and community change in ecosystems?",
    "core": [
      "Population size is affected by abiotic factors, competition, predation and disease; carrying capacity can vary with environmental conditions.",
      "Intraspecific competition occurs within a species; interspecific competition occurs between species and can alter distribution and abundance.",
      "Predator-prey populations can show linked fluctuations with time lags, though real systems are influenced by multiple factors.",
      "Succession changes community composition over time; conservation can manage habitats to maintain biodiversity and ecosystem function."
    ],
    "model": [
      "Measure population abundance and environmental variables.",
      "Identify density-dependent or abiotic influences.",
      "Use changes over time to explain competition, predation or succession."
    ],
    "terms": [
      "carrying capacity",
      "intraspecific competition",
      "predation",
      "succession"
    ],
    "mis": "Correlation between two population sizes does not prove one alone controls the other; multiple biotic and abiotic factors may contribute.",
    "practical": [
      "Estimate abundance using quadrats, transects or mark-release-recapture with appropriate assumptions.",
      "Record abiotic variables alongside species abundance."
    ],
    "maths": [
      "Use Lincoln index-style mark-release-recapture calculations when appropriate.",
      "Calculate means, percentages and correlations from ecological data."
    ],
    "syn": [
      "Links biodiversity methods to population ecology.",
      "Links nutrient cycles and productivity to succession."
    ],
    "exam": [
      "Explain factors affecting population size.",
      "Calculate a population estimate from mark-release-recapture data.",
      "Explain changes during ecological succession."
    ]
  },
  "3.8.1": {
    "q": "How can a change in DNA sequence alter protein structure and phenotype?",
    "core": [
      "Gene mutations include substitution, addition, deletion, inversion, duplication and translocation changes to DNA sequence.",
      "A substitution may change one codon but can be silent because the genetic code is degenerate.",
      "Additions or deletions can cause a frameshift if the number of bases changed is not a multiple of three.",
      "A changed amino-acid sequence can alter protein folding, active sites or structural properties and therefore phenotype."
    ],
    "model": [
      "Identify the DNA sequence change.",
      "Determine the effect on codons and amino-acid sequence.",
      "Link altered primary structure to protein shape/function and phenotype."
    ],
    "terms": [
      "mutation",
      "substitution",
      "frameshift",
      "degenerate code"
    ],
    "mis": "Not every mutation changes phenotype; some are silent or occur in regions that do not change the relevant protein product.",
    "practical": [
      "Compare original and mutated DNA or amino-acid sequences.",
      "Interpret mutation-rate data and effects of mutagenic agents."
    ],
    "maths": [
      "Count changed codons or amino acids.",
      "Calculate mutation frequency or percentage change from data."
    ],
    "syn": [
      "Links protein synthesis to phenotype.",
      "Provides new alleles for natural selection."
    ],
    "exam": [
      "Compare effects of substitution and deletion mutations.",
      "Explain why a substitution can be silent.",
      "Use sequence data to predict an effect on a protein."
    ]
  },
  "3.8.2": {
    "q": "How can cells switch genes on and off, and what happens when control fails?",
    "core": [
      "Transcription factors can increase or decrease transcription by binding to DNA regulatory regions and influencing RNA polymerase activity.",
      "Epigenetic changes such as DNA methylation and histone modification can alter chromatin accessibility and gene expression without changing base sequence.",
      "RNA interference can reduce translation by using small RNA molecules to target mRNA.",
      "Loss of normal control can contribute to cancer through oncogenes, tumour-suppressor genes and abnormal epigenetic regulation."
    ],
    "model": [
      "Alter access to or transcription of a gene.",
      "Change mRNA abundance or translation.",
      "Produce a changed protein level and phenotype."
    ],
    "terms": [
      "transcription factor",
      "epigenetics",
      "DNA methylation",
      "oncogene"
    ],
    "mis": "Epigenetic regulation changes gene expression without necessarily changing the DNA base sequence.",
    "practical": [
      "Interpret gene-expression, methylation or tumour-frequency data.",
      "Distinguish correlation from causal evidence in cancer studies."
    ],
    "maths": [
      "Compare relative gene-expression values.",
      "Interpret risk, frequency or correlation data with appropriate caution."
    ],
    "syn": [
      "Links gene regulation to cell specialisation.",
      "Links mutation, cell cycle and cancer."
    ],
    "exam": [
      "Explain how transcription factors regulate gene expression.",
      "Explain how methylation can affect transcription.",
      "Evaluate evidence linking a gene-regulation change to cancer."
    ]
  },
  "3.8.3": {
    "q": "What can genome projects reveal and what are their limitations?",
    "core": [
      "Genome sequencing identifies the order of DNA bases across an organism's genome.",
      "Comparing genomes can identify genes, alleles, evolutionary relationships and possible disease-associated variants.",
      "In simpler organisms, sequence can often be linked more directly to genes; in complex organisms, regulatory DNA, alternative splicing and interactions make interpretation harder.",
      "Proteomics complements genomics because cells with the same genome can express different sets of proteins."
    ],
    "model": [
      "Sequence DNA accurately.",
      "Annotate and compare sequences.",
      "Relate genetic information to function using expression and protein evidence."
    ],
    "terms": [
      "genome sequencing",
      "annotation",
      "proteome",
      "bioinformatics"
    ],
    "mis": "Knowing a DNA sequence does not automatically reveal every protein or phenotype; gene regulation and environment matter.",
    "practical": [
      "Interpret simplified sequence-alignment or gene-expression data.",
      "Evaluate benefits and limitations of genomic information."
    ],
    "maths": [
      "Compare sequence identity percentages.",
      "Interpret large data sets, frequencies or association results."
    ],
    "syn": [
      "Links genomes to gene expression and mutation.",
      "Links molecular evidence to phylogeny and personalised medicine."
    ],
    "exam": [
      "Explain one use of genome sequencing.",
      "Explain why the proteome cannot always be predicted directly from the genome.",
      "Evaluate a conclusion based on genome-association data."
    ]
  },
  "3.8.4": {
    "q": "How can gene technologies analyse and deliberately alter genetic information?",
    "core": [
      "Restriction endonucleases cut DNA at specific recognition sites; DNA ligase joins DNA fragments by forming phosphodiester bonds.",
      "Vectors can transfer recombinant DNA into host cells; marker genes can help identify transformed cells.",
      "PCR amplifies selected DNA using primers, thermostable DNA polymerase, nucleotides and repeated temperature cycles.",
      "Gel electrophoresis separates DNA fragments by size; probes, sequencing and DNA profiling can identify specific sequences, while genetic modification has medical, agricultural and ethical implications."
    ],
    "model": [
      "Obtain or amplify the target DNA.",
      "Cut, separate, detect or insert DNA using sequence-specific tools.",
      "Verify the desired sequence or phenotype and evaluate consequences."
    ],
    "terms": [
      "restriction endonuclease",
      "DNA ligase",
      "PCR",
      "gel electrophoresis"
    ],
    "mis": "PCR amplifies DNA; it does not itself separate fragments by size—that is the role of gel electrophoresis.",
    "practical": [
      "Interpret PCR and gel-electrophoresis results, including controls and fragment patterns.",
      "Evaluate the design and consequences of genetically modified organisms or gene-based therapies."
    ],
    "maths": [
      "Use exponential amplification reasoning for PCR cycles.",
      "Estimate fragment size from a DNA ladder or migration data."
    ],
    "syn": [
      "Combines nucleic-acid chemistry, mutation and gene expression.",
      "Links biotechnology to diagnosis, forensics, agriculture and medicine."
    ],
    "exam": [
      "Explain the role of primers and thermostable polymerase in PCR.",
      "Interpret a gel-electrophoresis pattern.",
      "Evaluate a biological application of recombinant DNA technology."
    ]
  }
});
  const get = ref => profiles[String(ref||'')] || null;
  const refs = Object.freeze(Object.keys(profiles));
  window.ALEVEL_BIOLOGY_CONTENT = Object.freeze({
    version:'phase-5',
    count:refs.length,
    refs,
    get,
    all:profiles
  });
})();
