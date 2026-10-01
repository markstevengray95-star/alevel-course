/* Original teaching and worked examples mapped to AQA 7405 section 3.3. */
(()=>{'use strict';const rows=[];const L=(ref,title,core,question,answer,precision)=>rows.push({ref,title,core,question,answer,precision});
L('3.3.1.1','Organic formulae and nomenclature',[
'Molecular formula counts atoms; empirical formula gives their simplest ratio. Structural formula shows connectivity; displayed formula shows every bond; skeletal formula omits carbon labels and their attached hydrogens.',
'Choose the longest appropriate carbon chain containing the principal functional group. Number it to give that group, then unsaturation/substituents as appropriate, the required lowest locants.',
'Use suffixes such as -ene, -ol, -al, -one and -oic acid, and prefixes such as bromo- or methyl-. Repeated substituents use di-, tri- and so on; alphabetise prefixes independently of these multipliers.',
'In skeletal drawings each unlabelled line end or vertex is carbon. Complete carbon valence to four with implicit hydrogens, but show heteroatoms and their attached hydrogens explicitly.'
],'Name CH₃CH(OH)CH₂CH₃ and state its molecular formula.',[
'The longest chain has four carbon atoms, so its root is butan-.',
'Number from the end nearest the OH group; it is on carbon 2, not carbon 3.',
'Use the alcohol suffix and position: butan-2-ol.',
'Count all hydrogens, including the OH hydrogen: C₄H₁₀O. The formula alone does not distinguish it from other isomers.'
],'The OH hydrogen counts in the molecular formula, even when a skeletal drawing omits C–H bonds.');
L('3.3.1.2','Reaction mechanisms and curly arrows',[
'A curly arrow tracks movement of an electron pair. Its tail starts at a bond or lone pair and its head ends where those electrons form a bond or become a lone pair.',
'A nucleophile donates an electron pair; an electrophile accepts one. Polar bonds create partial charges that help identify an electron-deficient site.',
'Heterolytic bond fission sends both bonding electrons to one atom and forms ions. Homolytic fission sends one electron to each atom and forms radicals; single-headed arrows track individual electrons.',
'Mechanisms must conserve atoms and charge. Include relevant lone pairs, partial charges, ionic charges, intermediates and reagents; name the reaction type as well as drawing arrows.'
],'Describe the arrows for OH⁻ reacting with CH₃CH₂Br in nucleophilic substitution.',[
'The C–Br bond is polar, with Cδ⁺ and Brδ⁻; the hydroxide oxygen has a lone pair and negative charge.',
'Draw a curly arrow from an oxygen lone pair to the carbon bonded to Br, forming a C–O bond.',
'Draw a second curly arrow from the C–Br bond to Br, showing heterolytic cleavage and formation of Br⁻.',
'The products are CH₃CH₂OH and Br⁻. Total charge remains −1 and the carbon skeleton is unchanged.'
],'A curly arrow starts at electrons, not at a positive charge or an atom without a shown electron source.');
L('3.3.1.3','Structural and E–Z isomerism',[
'Structural isomers have the same molecular formula but different connectivity: chain, position or functional-group isomerism. Stereoisomers have the same connectivity but a different spatial arrangement.',
'A C=C double bond restricts rotation because rotating would disrupt π overlap. E–Z isomerism additionally requires each double-bond carbon to carry two different substituents.',
'Use Cahn–Ingold–Prelog priorities: on each alkene carbon, the substituent whose directly attached atom has higher atomic number has higher priority. Resolve ties by moving outward along the groups.',
'Z means the higher-priority groups are on the same side; E means opposite sides. Cis–trans labels work for some simple alkenes but do not replace the general priority rule.'
],'Explain why but-2-ene has E–Z isomers but 2-methylpropene does not.',[
'In but-2-ene, each double-bond carbon has H and CH₃: two different substituents.',
'C=C restricts rotation, allowing distinct arrangements that cannot interconvert by free rotation.',
'CH₃ has higher priority than H: same-side CH₃ groups give Z-but-2-ene and opposite-side groups give E-but-2-ene.',
'In 2-methylpropene one alkene carbon has two H groups and the other two methyl groups; the different-substituent requirement fails.'
],'Restricted rotation alone is insufficient: inspect the two groups on each alkene carbon.');
L('3.3.2.1','Crude oil and fractional distillation',[
'Crude oil is a mixture mainly of hydrocarbons. Fractional distillation separates useful fractions by differences in boiling range, without converting them into different compounds.',
'Vaporised oil enters a column hotter at the bottom and cooler at the top. Components condense where the local temperature is below their boiling range.',
'Larger hydrocarbon molecules generally have stronger London forces and higher boiling points, so heavy fractions condense lower down; smaller molecules travel further up.',
'Each fraction remains a mixture rather than a pure alkane. Chain length also affects viscosity, volatility and ease of ignition, linking composition to fuel use.'
],'Explain why a fraction containing mainly C₁₅ hydrocarbons is collected below one containing mainly C₆ hydrocarbons.',[
'C₁₅ molecules are larger and contain more electrons than C₆ molecules.',
'Their London intermolecular attractions are stronger, requiring more energy to separate molecules.',
'They therefore have a higher boiling range and condense in the hotter lower region of the column.',
'The separation changes physical state and composition of the collected mixture; it does not break the hydrocarbons into shorter molecules.'
],'Distillation overcomes intermolecular attractions; cracking breaks covalent bonds.');
L('3.3.2.2','Thermal and catalytic cracking',[
'Cracking converts long-chain hydrocarbons into shorter alkanes and alkenes, improving the supply of useful fuels and chemical feedstocks.',
'Thermal cracking uses high temperature and pressure and can produce a high proportion of alkenes. Catalytic cracking uses a zeolite catalyst at elevated temperature and lower pressure.',
'Catalytic routes can produce branched or cyclic fuel molecules with useful combustion characteristics. Conditions and product distribution depend on the industrial process.',
'Balance carbon and hydrogen in proposed equations. A cracking equation is one possible product combination, rather than proof that only those products form.'
],'Complete C₁₀H₂₂ → C₈H₁₈ + X and identify the reaction and product class.',[
'Carbon balance leaves 10 − 8 = 2 carbon atoms in X.',
'Hydrogen balance leaves 22 − 18 = 4 hydrogen atoms, so X is C₂H₄.',
'C₂H₄ is ethene, an alkene with a C=C double bond. The equation is balanced as written.',
'This is cracking: a larger hydrocarbon forms smaller molecules, including a useful alkene feedstock for polymers.'
],'Check both atom balances; do not assume that the second product is always an alkane.');
L('3.3.2.3','Combustion and atmospheric pollutants',[
'Complete combustion of a hydrocarbon in sufficient oxygen produces CO₂ and H₂O. In incomplete combustion, limited oxygen can produce poisonous CO and/or carbon particulates.',
'Carbon monoxide binds strongly to haemoglobin and reduces oxygen transport. Particulates can harm respiratory health; CO₂ contributes to the enhanced greenhouse effect.',
'Sulfur impurities produce SO₂, associated with acid deposition. High engine temperatures allow nitrogen and oxygen to form nitrogen oxides, which also contribute to atmospheric pollution.',
'Catalytic converters promote oxidation of CO/unburned hydrocarbons and reduction of nitrogen oxides. Evaluate emissions over fuel production and use, not only the visible exhaust.'
],'Balance propane complete combustion and contrast it with an incomplete-combustion equation forming CO.',[
'Complete combustion: C₃H₈ + 5O₂ → 3CO₂ + 4H₂O.',
'If carbon is converted to CO instead, oxygen demand is smaller: 2C₃H₈ + 7O₂ → 6CO + 8H₂O.',
'Both equations conserve carbon, hydrogen and oxygen; the second describes one possible incomplete-combustion product mixture.',
'CO is toxic because it impairs oxygen transport; colourless exhaust is not evidence that combustion products are harmless.'
],'Incomplete combustion does not always give a single pure product: CO, CO₂ and soot can coexist.');
L('3.3.2.4','Free-radical chlorination of alkanes',[
'Ultraviolet light causes homolytic fission of Cl₂ in initiation: Cl₂ → 2Cl•. Each chlorine radical has an unpaired electron.',
'Propagation regenerates a radical: Cl• + CH₄ → HCl + CH₃•, then CH₃• + Cl₂ → CH₃Cl + Cl•. The chain can continue many times after one initiation event.',
'Termination occurs when two radicals combine, for example Cl• + Cl• → Cl₂ or CH₃• + Cl• → CH₃Cl. No radical remains to continue that chain.',
'Further substitution forms CH₂Cl₂, CHCl₃ and CCl₄; larger alkanes can also give position isomers. Radical substitution therefore produces mixtures and is often poor for a single selective synthesis.'
],'Give two propagation steps and one termination step for chlorination of methane.',[
'Cl• + CH₄ → HCl + CH₃• is the first propagation step: a hydrogen is abstracted.',
'CH₃• + Cl₂ → CH₃Cl + Cl• is the second: a C–Cl bond forms and chlorine radical is regenerated.',
'A valid termination is CH₃• + CH₃• → C₂H₆; two radicals combine with no radical product.',
'Adding the propagation steps cancels radicals and gives CH₄ + Cl₂ → CH₃Cl + HCl overall. UV light is needed for initiation.'
],'Radicals are not ions: show the radical dot rather than a charge.');
L('3.3.3.1','Halogenoalkane nucleophilic substitution',[
'The polar C–X bond makes carbon electrophilic. OH⁻, CN⁻ and NH₃ can donate electron pairs and substitute the halogen.',
'Warm aqueous hydroxide gives an alcohol; cyanide in ethanolic conditions gives a nitrile, extending the carbon chain by one; excess ethanolic ammonia gives a primary amine.',
'C–I is weaker than C–Br, which is weaker than C–Cl, so corresponding iodoalkanes generally hydrolyse fastest. Bond strength is the key explanation, rather than C–X polarity alone.',
'Hydrolysis rate can be compared using silver nitrate in aqueous ethanol: released halide ions form a precipitate. Control temperature, concentration and volume for a fair comparison.'
],'Explain how bromoethane can be converted into propanenitrile and why the carbon count increases.',[
'Use cyanide ions, commonly KCN in ethanol with heating under reflux: CH₃CH₂Br + CN⁻ → CH₃CH₂CN + Br⁻.',
'The carbon end of CN⁻ donates a lone pair to the electrophilic carbon bearing Br.',
'The C–Br bonding pair moves to bromine, producing Br⁻ in nucleophilic substitution.',
'The cyanide carbon becomes part of the product chain, so a two-carbon halogenoalkane gives a three-carbon nitrile.'
],'Count the carbon in the nitrile group; CH₃CH₂CN has three carbons.');
L('3.3.3.2','Halogenoalkane elimination',[
'Heating a halogenoalkane with ethanolic hydroxide favours elimination. The base removes a hydrogen from a carbon adjacent to the carbon bearing the halogen.',
'The C–H electron pair forms a C=C bond while the C–X pair moves to the halogen. An alkene, halide ion and water are produced.',
'Substitution and elimination compete. Aqueous hydroxide favours alcohol formation; ethanol and stronger heating favour alkene formation, but the mixture also depends on substrate structure.',
'Different adjacent hydrogen positions can give different alkene positions; some products also have E–Z isomers. Draw the carbon chain before predicting every possible product.'
],'Explain why elimination of 2-bromobutane can form but-1-ene and but-2-ene.',[
'The Br-bearing carbon is carbon 2; hydrogens can be removed from either adjacent carbon 1 or carbon 3.',
'Removing H from carbon 1 forms a C1=C2 bond and gives but-1-ene.',
'Removing H from carbon 3 forms a C2=C3 bond and gives but-2-ene, which can exist as E and Z forms.',
'Use hot ethanolic hydroxide; the net ionic change is C₄H₉Br + OH⁻ → C₄H₈ + Br⁻ + H₂O.'
],'The eliminated hydrogen must be on an adjacent carbon, not arbitrarily elsewhere in the chain.');
L('3.3.3.3','Ozone depletion by radicals',[
'Stratospheric ozone absorbs harmful ultraviolet radiation. UV can break C–Cl bonds in sufficiently persistent chlorinated compounds, releasing chlorine radicals.',
'A chlorine radical reacts with ozone: Cl• + O₃ → ClO• + O₂. A second step regenerates the chlorine radical: ClO• + O₃ → Cl• + 2O₂.',
'The net effect of this cycle is 2O₃ → 3O₂. Regeneration allows one chlorine radical to destroy many ozone molecules before a terminating or reservoir-forming reaction removes it.',
'CFC alternatives are assessed for atmospheric persistence, ozone-depletion potential, greenhouse impact and practical use. A replacement without chlorine may avoid this chlorine cycle while still carrying other environmental costs.'
],'Show why chlorine acts catalytically in the two ozone-reaction steps given above.',[
'Write Cl• + O₃ → ClO• + O₂ and ClO• + O₃ → Cl• + 2O₂.',
'Adding the equations cancels both Cl• and ClO• because each occurs on both sides.',
'The remaining overall equation is 2O₃ → 3O₂.',
'Chlorine radical is regenerated rather than used up overall, so it catalyses repeated ozone destruction until removed from the active cycle.'
],'Ozone depletion and the greenhouse effect are different atmospheric processes.');
L('3.3.4.1','Alkene structure and reactivity',[
'An alkene contains a C=C double bond, comprising one σ bond and one π bond. Each double-bond carbon is approximately trigonal planar with angles near 120°.',
'The π bond results from sideways overlap of parallel p orbitals above and below the σ-bond plane. It restricts rotation and supplies an electron-rich region.',
'Electrophiles accept a pair of π electrons, so alkenes commonly undergo electrophilic addition. The π bond is broken while new σ bonds form.',
'The general formula CₙH₂ₙ applies to acyclic alkenes with one double bond, but is not unique to them: cycloalkanes share it. Use structural evidence, not formula alone.'
],'Explain why ethene reacts with an electrophile but ethane is much less reactive in that reaction type.',[
'Ethene has a π electron pair in a region above and below its planar C=C bond.',
'The electron-rich π bond can donate a pair to an electrophile and form a new σ bond.',
'This initiates an addition mechanism and removes the π bond, while the C–C σ framework remains.',
'Ethane contains only σ bonds and lacks this exposed electron-rich π region, so it does not undergo the same straightforward electrophilic addition.'
],'Addition breaks the π component, not necessarily the whole carbon–carbon bond.');
L('3.3.4.2','Electrophilic addition of alkenes',[
'Alkenes add HBr, bromine and, under acidic conditions, water. Bromine water changes from orange to colourless as the alkene reacts, providing a test for unsaturation.',
'In HBr addition, the π pair bonds to Hδ⁺ and the H–Br pair moves to Br, forming a carbocation. Br⁻ then donates a lone pair to that positive carbon.',
'For an unsymmetrical alkene, the route forming the more stable carbocation usually gives the major product. Alkyl groups stabilise a positive charge by electron donation.',
'Hydration uses steam with an acid catalyst; addition polymerisation is a separate repeated-addition process. Always state reagent, conditions and product connectivity.'
],'Explain the major product when propene reacts with HBr.',[
'The π bond accepts H⁺ from HBr while the H–Br bond breaks heterolytically.',
'Adding H to the terminal carbon gives a secondary carbocation on carbon 2; the alternative gives a less stable primary carbocation.',
'Br⁻ attacks the secondary carbocation with a lone pair, giving CH₃CHBrCH₃.',
'The major product is 2-bromopropane; product preference follows relative carbocation stability rather than simply counting hydrogen atoms without explanation.'
],'Show the intermediate charge and both curly-arrow steps in an HBr mechanism.');
L('3.3.4.3','Addition polymers and repeat units',[
'In addition polymerisation, many alkene molecules join as their π bonds open and new carbon–carbon σ bonds connect the monomers.',
'The repeat unit retains all the atoms of the monomer; no small molecule is eliminated. Replace the C=C with C–C and retain its substituents.',
'Draw brackets around the repeat unit, with continuation bonds extending through both sides and n outside. Reverse this process to recover an alkene monomer from a polymer.',
'Typical addition polymers have relatively unreactive C–C backbones and are not readily hydrolysed. Reuse, recycling and disposal depend on polymer identity, additives and contamination.'
],'Give the repeat unit of poly(chloroethene) and explain its atom economy for polymerisation.',[
'The monomer is CH₂=CHCl. Open the π bond but retain H and Cl on their original carbons.',
'The repeat unit is [–CH₂–CHCl–]ₙ, with bonds through the bracket edges.',
'All monomer atoms enter the polymer; there is no water or other molecular by-product in the ideal addition step.',
'The ideal reaction therefore has 100% atom economy, which does not mean a real process has 100% isolated yield or no environmental impact.'
],'An addition-polymer repeat unit has a single C–C bond where the monomer had C=C.');
L('3.3.5.1','Alcohol production: fermentation and hydration',[
'Yeast enzymes ferment glucose under warm anaerobic conditions: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂. The product is a dilute ethanol solution that needs separation.',
'Ethene hydration uses steam and a phosphoric acid catalyst at high temperature and pressure: C₂H₄ + H₂O ⇌ C₂H₅OH. Unreacted gases can be recycled.',
'Fermentation uses renewable carbohydrate feedstocks but is slow, batch-based and limited by enzyme denaturation or ethanol inhibition. Hydration supports fast continuous production but uses energy and usually a petrochemical feedstock.',
'Compare purity, rate, energy, land use, waste and lifecycle emissions. Renewable feedstock does not automatically make a process carbon neutral.'
],'Calculate the theoretical ethanol mass from 180 g glucose, using Mr(glucose) = 180 and Mr(ethanol) = 46.',[
'n(glucose) = mass/Mr = 180/180 = 1.00 mol.',
'The fermentation equation gives two moles of ethanol per mole of glucose.',
'n(ethanol) = 2.00 mol, so theoretical mass = 2.00 × 46 = 92.0 g.',
'This is a stoichiometric maximum; incomplete fermentation and separation losses reduce actual yield.'
],'Ethanol produced by either route is the same compound; purity and process consequences differ.');
L('3.3.5.2','Alcohol oxidation: distillation and reflux',[
'Acidified potassium dichromate(VI) oxidises alcohols and changes from orange to green. Primary alcohols can form aldehydes and then carboxylic acids.',
'To isolate an aldehyde, use controlled oxidant and distil the product as it forms, reducing further oxidation. To obtain a carboxylic acid, heat under reflux with excess oxidant.',
'Secondary alcohols oxidise to ketones; tertiary alcohols resist oxidation under these usual conditions because the OH-bearing carbon lacks the necessary hydrogen.',
'[O] is a bookkeeping symbol for oxidising equivalents: RCH₂OH + [O] → RCHO + H₂O, then RCHO + [O] → RCOOH. Reflux retains volatile reactants while permitting prolonged heating.'
],'Give reagents, conditions and equations for converting ethanol separately into ethanal and ethanoic acid.',[
'Use acidified potassium dichromate(VI) as oxidant; the observation is orange to green.',
'For ethanal, warm with controlled oxidant and distil off the aldehyde: CH₃CH₂OH + [O] → CH₃CHO + H₂O.',
'For ethanoic acid, heat under reflux with excess oxidant: CH₃CH₂OH + 2[O] → CH₃COOH + H₂O.',
'Distillation removes the volatile aldehyde; reflux keeps it in contact with oxidant so it can be oxidised further.'
],'Reflux and distillation control which product is isolated; they are not interchangeable apparatus labels.');
L('3.3.5.3','Alcohol dehydration to alkenes',[
'Heating an alcohol with concentrated sulfuric or phosphoric acid can eliminate water to form an alkene. The acid acts as a catalyst.',
'A hydrogen and OH are removed from adjacent carbons overall; the carbon skeleton remains and a C=C bond forms. Secondary alcohols can give different alkene positions.',
'Ethanol dehydration gives ethene: CH₃CH₂OH → CH₂=CH₂ + H₂O. This is elimination, reversing the overall addition of water in hydration.',
'Confirm an alkene using its reaction with bromine water and support structure assignments with spectroscopy. Product mixtures may require separation rather than a single assumed product.'
],'Compare making ethene from ethanol with making it from bromoethane.',[
'Ethanol can be heated with concentrated phosphoric acid: CH₃CH₂OH → CH₂=CH₂ + H₂O.',
'Bromoethane can be heated with ethanolic KOH: CH₃CH₂Br + OH⁻ → CH₂=CH₂ + Br⁻ + H₂O.',
'Both transformations are elimination and preserve the two-carbon skeleton.',
'Their reagents and leaving groups differ: acid-catalysed loss of water from an alcohol versus base-promoted elimination from a halogenoalkane.'
],'Specify concentrated acid for alcohol dehydration and ethanolic hydroxide for halogenoalkane elimination.');
L('3.3.6.1','Test-tube identification of functional groups',[
'Bromine water decolourisation supports a C=C group in the intended school-level comparison. Warm acidified dichromate turns orange to green with primary or secondary alcohols and aldehydes.',
'Aldehydes reduce Tollens’ reagent to a silver mirror and Fehling’s solution to a brick-red precipitate; ordinary ketones do not. Fresh reagent, suitable warming and safe disposal are necessary.',
'A carboxylic acid reacts with carbonate to release CO₂, confirmed by turning limewater milky. Gas evolution alone is incomplete identification without a confirming test.',
'Use a sequence of independent tests on separate portions and combine results with spectral evidence. A positive oxidation test is not by itself unique to one functional group.'
],'A compound gives a silver mirror with Tollens’ reagent. Another does not. Both contain a carbonyl group. Interpret the results.',[
'Tollens’ reagent contains [Ag(NH₃)₂]⁺, which is reduced to metallic silver in a positive test.',
'The positive carbonyl compound is an aldehyde in this A-level comparison; its aldehyde group is oxidised to carboxylate under the alkaline test conditions.',
'The negative carbonyl compound is consistent with a ketone, which is not oxidised by Tollens’ reagent under these conditions.',
'Confirm the assignments using additional evidence; for example carbonyl IR absorption plus molecular formula or NMR, rather than treating one test as an absolute identification in every possible mixture.'
],'Do not label every compound that reduces dichromate as an alcohol; aldehydes also do so.');
L('3.3.6.2','Organic mass spectra and fragments',[
'The molecular ion in electron-impact mass spectrometry is commonly M⁺•. Its m/z gives relative molecular mass when the ion is singly charged and the molecular-ion peak is identifiable.',
'Fragment peaks arise when the molecular ion breaks apart. The detected fragment is positively charged; a neutral fragment lost from it is not directly detected.',
'The base peak is the most intense signal, assigned relative intensity 100, and need not be the molecular ion. Compare possible fragment formulae with the molecular formula.',
'Isotope patterns provide further constraints: a single chlorine atom commonly gives M and M+2 near 3:1, whereas a single bromine atom gives them near 1:1.'
],'A spectrum of propanone has M⁺• at m/z 58 and a strong fragment at 43. Assign the fragment.',[
'Propanone is CH₃COCH₃ with Mr = 3(12) + 6(1) + 16 = 58, matching the molecular ion.',
'A plausible positively charged fragment is CH₃CO⁺, whose mass is 2(12) + 3(1) + 16 = 43.',
'Fragmentation can be represented as [CH₃COCH₃]⁺• → CH₃CO⁺ + CH₃•.',
'The methyl radical is neutral and is not the m/z 43 detected ion. A strong peak gives supporting structural evidence rather than a unique whole-molecule identity.'
],'The base peak and molecular-ion peak are different concepts.');
L('3.3.6.3','Infrared spectroscopy and absorption bands',[
'Infrared radiation excites molecular vibrations when an appropriate vibrational energy change involves a change in dipole moment. Use supplied wavenumber tables to assign characteristic bands.',
'A strong C=O absorption is typically near 1700 cm⁻¹. Alcohol O–H is usually broad around 3230–3550 cm⁻¹; carboxylic acid O–H is broader and extends roughly 2500–3300 cm⁻¹.',
'The fingerprint region contains a complex pattern useful for matching a sample with a reference spectrum. Single bands identify possible groups, not normally a unique compound.',
'Infrared absorption by atmospheric molecules contributes to the greenhouse effect. Distinguish vibrational IR evidence from electronic absorption in visible spectroscopy.'
],'A spectrum has a strong band near 1700 cm⁻¹ and a very broad band across 2500–3300 cm⁻¹. What group is indicated?',[
'The band near 1700 cm⁻¹ supports a carbonyl C=O bond.',
'The very broad 2500–3300 cm⁻¹ band is characteristic of carboxylic-acid O–H absorption.',
'Together they support a –COOH group rather than an ordinary ketone or an alcohol alone.',
'They do not determine the carbon-chain length. Use molecular mass, formula, NMR and the fingerprint region to distinguish particular carboxylic acids.'
],'Identify groups by the combined evidence; a C=O band alone does not distinguish an acid from a ketone.');
L('3.3.7','Optical isomers and racemic mixtures',[
'A tetrahedral carbon attached to four different groups can be a chiral centre. Its two mirror-image arrangements are non-superimposable and form an enantiomeric pair.',
'Enantiomers rotate plane-polarised light in opposite directions by equal magnitudes under identical conditions. A 1:1 racemic mixture has no net rotation.',
'Their ordinary physical properties are the same in an achiral environment, but interactions with chiral systems such as enzymes can differ greatly.',
'Nucleophilic attack on either face of a planar carbonyl can create a new chiral centre. If both routes are equally likely in an achiral environment, the product is racemic.'
],'Explain why adding HCN to ethanal can form a racemic mixture.',[
'Ethanal has a planar carbonyl carbon, so CN⁻ can attack from either side of its carbonyl plane.',
'The product CH₃CH(OH)CN has a carbon attached to CH₃, H, OH and CN: four different groups.',
'Attack from the two faces gives a pair of non-superimposable mirror images.',
'Equal formation of the two enantiomers gives a racemate with zero net optical rotation, because their opposite rotations cancel.'
],'A molecule with a chiral centre is not automatically a racemic mixture; racemic describes the proportions of enantiomers.');
L('3.3.8','Aldehydes and ketones: reduction and addition',[
'An aldehyde has terminal –CHO, while a ketone has C=O between two carbon groups. Aldehydes are readily oxidised by mild reagents; ketones usually resist those conditions.',
'NaBH₄ reduces aldehydes to primary alcohols and ketones to secondary alcohols. Hydride acts as a nucleophile, then the oxygen is protonated.',
'HCN addition, catalysed by cyanide ions, forms hydroxynitriles. CN⁻ attacks the δ⁺ carbonyl carbon and the π pair moves onto oxygen; protonation then gives OH.',
'HCN is highly toxic; the mechanism is a conceptual chemical explanation, not a home experiment. New chiral centres may give racemic products because the carbonyl is planar.'
],'Describe the nucleophilic addition mechanism forming a hydroxynitrile from propanone.',[
'Start with CH₃COCH₃. Draw an arrow from the carbon lone pair of CN⁻ to the carbonyl carbon.',
'Draw an arrow from the C=O π bond to oxygen, forming (CH₃)₂C(O⁻)CN.',
'The oxygen lone pair accepts a proton from HCN (or the indicated proton source), producing (CH₃)₂C(OH)CN and regenerating CN⁻ where HCN is used.',
'This product is not chiral at that carbon because two of its four groups are identical CH₃ groups; nucleophilic addition does not always create optical isomerism.'
],'An aldehyde reduction gives a primary alcohol; ketone reduction gives a secondary alcohol.');
L('3.3.9.1','Carboxylic acids, esters and hydrolysis',[
'Carboxylic acids are weak acids: RCOOH ⇌ RCOO⁻ + H⁺. They neutralise bases and carbonates to produce salts; carbonate reactions also give CO₂ and water.',
'An acid and alcohol form an ester in a reversible acid-catalysed reaction: RCOOH + R′OH ⇌ RCOOR′ + H₂O. Esters are used in solvents, fragrances and fats/oils.',
'Acid hydrolysis gives a carboxylic acid and alcohol and is reversible. Alkaline hydrolysis gives carboxylate salt and alcohol; formation of carboxylate drives the reaction effectively to completion.',
'Biodiesel can be produced by transesterifying triglycerides with methanol, giving fatty-acid methyl esters and glycerol. Identify which part of an ester originates from each reagent.'
],'Name the ester from ethanoic acid and propan-1-ol, and give products of its alkaline hydrolysis with NaOH.',[
'The alcohol supplies the propyl group and the acid supplies ethanoate: the ester is propyl ethanoate, CH₃COOCH₂CH₂CH₃.',
'Formation: CH₃COOH + CH₃CH₂CH₂OH ⇌ CH₃COOCH₂CH₂CH₃ + H₂O, with acid catalyst.',
'Alkaline hydrolysis: CH₃COOCH₂CH₂CH₃ + NaOH → CH₃COONa + CH₃CH₂CH₂OH.',
'The acid-derived product is sodium ethanoate, not free ethanoic acid; acidification would be a further step.'
],'Name the alcohol-derived alkyl group first and the acid-derived carboxylate second.');
L('3.3.9.2','Acyl chlorides, anhydrides and acylation',[
'Acyl chlorides RCOCl and acid anhydrides (RCO)₂O react by nucleophilic addition–elimination at the carbonyl carbon. They are more reactive acylating agents than ordinary carboxylic acids.',
'Water gives a carboxylic acid; alcohol gives an ester; ammonia gives a primary amide; a primary amine gives an N-substituted amide. Acyl chlorides also generate HCl.',
'The nucleophile attacks Cδ⁺ and the π pair moves to O. The intermediate then reforms C=O and expels the leaving group, followed by proton transfer.',
'For amide formation, additional ammonia or amine neutralises the acid by-product. Acid anhydrides are often preferred in preparations such as aspirin for practical handling and less corrosive by-products.'
],'Write the overall equation for ethanoyl chloride with excess ammonia and explain the second ammonia molecule.',[
'The overall equation is CH₃COCl + 2NH₃ → CH₃CONH₂ + NH₄Cl.',
'One ammonia molecule acts as a nucleophile at the carbonyl carbon and forms the amide ethanamide.',
'Chloride is displaced through addition–elimination; proton transfer generates an acidic by-product.',
'A second ammonia molecule accepts a proton to give NH₄⁺, paired with Cl⁻. This explains the 2:1 ammonia/acyl-chloride ratio.'
],'Acyl substitution retains the carbonyl after elimination; simple carbonyl addition alone does not.');
L('3.3.10.1','Benzene bonding and stability',[
'Benzene is planar with six carbon atoms in a hexagonal ring. Each carbon forms three σ bonds and has a p orbital perpendicular to the ring.',
'The six p orbitals overlap into a delocalised π system above and below the ring. All C–C bonds have equal length, intermediate between typical single and double bonds.',
'Benzene is more stable than a hypothetical structure with three independent C=C bonds. Its hydrogenation enthalpy is less exothermic than three times the corresponding isolated-alkene value.',
'Substitution can preserve or restore the delocalised system; addition would permanently disrupt it. Benzene therefore favours electrophilic substitution rather than alkene-like addition under ordinary comparison conditions.'
],'Cyclohexene hydrogenation is −120 kJ mol⁻¹ and benzene hydrogenation is −208 kJ mol⁻¹. Estimate the stabilisation relative to three isolated double bonds.',[
'Three independent double bonds would give an estimated hydrogenation enthalpy of 3 × (−120) = −360 kJ mol⁻¹.',
'The actual benzene value is −208 kJ mol⁻¹, so 152 kJ mol⁻¹ less energy is released.',
'Both comparisons end at cyclohexane; benzene must therefore start at a lower enthalpy than the hypothetical localised structure.',
'The estimated extra stability is 152 kJ mol⁻¹ and supports delocalisation, subject to the assumptions of this comparison.'
],'Draw delocalisation consistently; alternating bonds in a shorthand diagram do not mean benzene has alternating bond lengths.');
L('3.3.10.2','Benzene electrophilic substitution',[
'In nitration, concentrated nitric and sulfuric acids generate NO₂⁺: HNO₃ + H₂SO₄ → NO₂⁺ + HSO₄⁻ + H₂O. Controlled warming reduces further nitration.',
'A π electron pair bonds to the electrophile, temporarily disrupting aromatic delocalisation. A base removes H⁺ and the C–H pair restores the delocalised ring.',
'Friedel–Crafts acylation uses an acyl chloride and AlCl₃ to generate an acylium electrophile: RCOCl + AlCl₃ → RCO⁺ + AlCl₄⁻.',
'In both reactions the product replaces a ring hydrogen. Include electrophile generation, the positively charged intermediate, loss of H⁺ and regeneration of the catalyst.'
],'Describe the nitration mechanism of benzene and the role of sulfuric acid.',[
'H₂SO₄ helps generate the nitronium ion NO₂⁺ from HNO₃, using the equation HNO₃ + H₂SO₄ → NO₂⁺ + HSO₄⁻ + H₂O.',
'A curly arrow from the benzene π system to N forms a C–N bond and a positively charged intermediate.',
'HSO₄⁻ removes the hydrogen on that carbon; the C–H electron pair restores aromatic delocalisation.',
'Nitrobenzene is formed and H₂SO₄ is regenerated. The overall organic change is substitution, not permanent addition across a ring bond.'
],'The electrophile in nitration is NO₂⁺, not neutral nitric acid.');
L('3.3.11.1','Preparing primary amines',[
'Heating a halogenoalkane with excess ethanolic ammonia forms a primary amine by nucleophilic substitution. Excess ammonia reduces further alkylation but does not make the chemistry perfectly selective.',
'A nitrile can be reduced to a primary amine using hydrogen with a nickel catalyst or LiAlH₄ under suitable anhydrous conditions: RCN + 4[H] → RCH₂NH₂.',
'Nitrobenzene is reduced using tin and concentrated hydrochloric acid, followed by alkali to liberate phenylamine from its ammonium salt.',
'Check carbon count in a synthesis: cyanide substitution first adds one carbon, and reducing the nitrile retains that additional carbon in the amine.'
],'Plan a two-step route from bromoethane to propan-1-amine.',[
'Step 1: warm/reflux bromoethane with ethanolic KCN to form propanenitrile: CH₃CH₂Br + CN⁻ → CH₃CH₂CN + Br⁻.',
'Step 2: reduce the nitrile using H₂/Ni or the specified appropriate reducing agent.',
'The reduction equation is CH₃CH₂CN + 4[H] → CH₃CH₂CH₂NH₂.',
'The product has three carbons because the cyanide carbon became the terminal CH₂NH₂ carbon; direct ammonia substitution would instead give ethylamine.'
],'Do not use NaBH₄ as the standard reagent for nitrile reduction in this A-level route.');
L('3.3.11.2','Amine base strength',[
'An amine accepts a proton using the nitrogen lone pair: RNH₂ + H⁺ → RNH₃⁺. In water it establishes RNH₂ + H₂O ⇌ RNH₃⁺ + OH⁻.',
'Alkyl groups donate electron density toward nitrogen, making the lone pair more available. A simple primary alkylamine is therefore usually more basic than ammonia in the comparison used here.',
'In phenylamine the nitrogen lone pair is delocalised into the aromatic ring and is less available to bond to H⁺, so phenylamine is less basic than ammonia.',
'Base strength describes equilibrium tendency to accept a proton, not solution concentration. More substituted amines also involve solvation and steric effects, so avoid unrestricted rules for every amine.'
],'Rank ethylamine, ammonia and phenylamine in base strength and explain.',[
'For this aqueous A-level comparison: ethylamine > ammonia > phenylamine.',
'The ethyl group donates electron density toward nitrogen, increasing availability of the lone pair for H⁺.',
'Ammonia has no electron-donating alkyl group and no aromatic delocalisation of its lone pair.',
'In phenylamine the lone pair overlaps with the ring π system and is less available for proton bonding; all three form positively charged species on accepting H⁺.'
],'A weak base can still be concentrated; weak describes its equilibrium, not the number of moles added.');
L('3.3.11.3','Amines as nucleophiles and acylation',[
'Amines donate the nitrogen lone pair to electrophilic carbon atoms. With halogenoalkanes, substitution can continue from primary to secondary to tertiary amines and finally quaternary ammonium salts.',
'With acyl chlorides, a primary amine forms an N-substituted amide by addition–elimination. A second amine molecule can neutralise the HCl formed.',
'An amine acts as a base when it bonds to H⁺, and as a nucleophile when it bonds to another electrophile such as carbon. The same lone pair can support either role.',
'Amides are much less basic than amines because the nitrogen lone pair is delocalised toward the carbonyl. Identify the C(=O)–N linkage rather than treating every nitrogen group as an amine.'
],'Give the product and equation for ethanoyl chloride reacting with excess methylamine.',[
'Methylamine CH₃NH₂ attacks the carbonyl carbon of CH₃COCl using its nitrogen lone pair.',
'The organic product is N-methylethanamide, CH₃CONHCH₃; the methyl group remains attached to nitrogen.',
'Overall: CH₃COCl + 2CH₃NH₂ → CH₃CONHCH₃ + CH₃NH₃Cl.',
'One methylamine forms the amide; another accepts H⁺ and gives methylammonium chloride. This is acylation by nucleophilic addition–elimination.'
],'An amide contains a carbonyl attached to nitrogen; an amine does not have that linkage.');
L('3.3.12.1','Condensation polymers: polyesters and polyamides',[
'Condensation polymerisation joins monomers with two reactive functional groups, forming ester or amide links and eliminating a small molecule such as water or HCl.',
'A diol and dicarboxylic acid form a polyester. A diamine and dicarboxylic acid form a polyamide. A hydroxycarboxylic acid or an amino acid can also polymerise using two groups within one monomer.',
'A repeat unit must preserve the correct –COO– or –CONH– linkage and display continuation bonds. Water loss comes from an OH group and a hydrogen on the other reacting functional group.',
'Hydrolysis of the linking groups recovers acid and alcohol/amine components, with their protonation depending on conditions. Addition and condensation polymers differ in mechanism and potential hydrolysable links.'
],'Show the polyester repeat unit from HOCH₂CH₂OH and HOOCCH₂CH₂COOH.',[
'The diol supplies the –O–CH₂CH₂–O– segment and the diacid supplies –CO–CH₂CH₂–CO–.',
'The repeat unit is [–O–CH₂CH₂–O–CO–CH₂CH₂–CO–]ₙ with continuation bonds across the brackets.',
'Each ester bond forms by condensation of alcohol and carboxylic-acid groups, eliminating water.',
'For a finite chain the exact number of waters depends on how many links and chain ends form; two waters per repeat is a long-chain idealisation, not an exact end-group count for every oligomer.'
],'Separate monomer atoms into the repeat unit and small by-product; do not leave extra OH groups at internal links.');
L('3.3.12.2','Polymer hydrolysis, biodegradability and disposal',[
'Polyesters and polyamides contain bonds that can be hydrolysed under suitable conditions. Typical addition polymers have C–C backbones that are much more resistant to hydrolysis.',
'Biodegradability depends on accessible bonds, suitable organisms/enzymes, temperature, moisture and time. A chemically hydrolysable polymer is not guaranteed to degrade quickly in the sea or a landfill.',
'Mechanical recycling reprocesses suitable separated polymers; chemical recycling breaks polymers into smaller feedstocks. Contamination and mixed materials can reduce feasibility.',
'Combustion can recover energy but releases CO₂ and may require treatment of toxic or acidic products. Landfill uses space and wastes material resources; compare options for a specified polymer and setting.'
],'Explain why a polyester may be hydrolysed more readily than poly(ethene), and why that does not guarantee rapid biodegradation.',[
'A polyester backbone includes polar ester links with an electrophilic carbonyl carbon.',
'Water, acid/base or an appropriate enzyme can promote ester-bond hydrolysis and split the chain into shorter molecules.',
'Poly(ethene) has a comparatively unreactive C–C backbone without these hydrolysable ester links.',
'Actual biodegradation still requires suitable environmental conditions and biological access; crystallinity, additives and exposure can strongly affect the rate.'
],'Biodegradable, recyclable and renewable describe different properties.');
L('3.3.13.1','Amino acids, zwitterions and pH',[
'An α-amino acid has NH₂ and COOH attached to the same carbon: H₂N–CH(R)–COOH. Most have a chiral carbon; glycine has R = H and is achiral.',
'Proton transfer produces a zwitterion, ⁺H₃N–CH(R)–COO⁻, carrying both positive and negative charges but zero net charge.',
'In acidic solution the carboxylate is protonated and the amino acid is predominantly a cation. In alkaline solution the ammonium group loses H⁺ and it is predominantly an anion.',
'Amino acids form peptide links by condensation and can react with acids/bases. Treat side-chain ionisation separately when a question gives an additional acidic or basic group.'
],'Draw alanine in strongly acidic, near-neutral and strongly alkaline conditions and state each net charge.',[
'Alanine has R = CH₃. In strongly acidic solution: ⁺H₃N–CH(CH₃)–COOH, net charge +1.',
'Near its zwitterionic region: ⁺H₃N–CH(CH₃)–COO⁻, net charge 0.',
'In strongly alkaline solution: H₂N–CH(CH₃)–COO⁻, net charge −1.',
'The carbon skeleton does not change. Protonation of COOH/COO⁻ and NH₂/NH₃⁺ explains the changing charge and electrophoretic behaviour.'
],'A zwitterion has internal charges; it is not an uncharged structure with no formal charges.');
L('3.3.13.2','Peptides, protein structure and hydrolysis',[
'A peptide bond is the amide link –CO–NH– formed when amino and carboxyl groups condense. A dipeptide has an amino end and a carboxyl end and releases one water on formation.',
'Primary structure is amino-acid sequence; secondary structure includes α helices and β sheets stabilised by hydrogen bonds in the backbone; tertiary structure is the overall three-dimensional folding.',
'Tertiary folding involves hydrogen bonds, ionic interactions, disulfide links and hydrophobic interactions between side chains. Some proteins have quaternary association of multiple polypeptide chains.',
'Acid or alkaline hydrolysis breaks peptide links; protonation of products depends on conditions. Denaturation usually disrupts folding without hydrolysing every peptide bond.'
],'Compare complete acid hydrolysis of a tripeptide with denaturation by heat.',[
'A linear tripeptide contains two peptide links. Complete hydrolysis uses two water molecules to break them.',
'It yields three amino-acid units, predominantly with protonated amino groups in strongly acidic solution.',
'Heat denaturation disrupts interactions maintaining secondary/tertiary structure and can destroy a functional binding site.',
'Denaturation generally leaves the primary sequence and peptide bonds intact; hydrolysis specifically breaks those covalent links.'
],'Loss of protein activity does not prove that all peptide bonds have been broken.');
L('3.3.13.3','Enzymes and molecular recognition',[
'Enzymes are biological catalysts with active sites whose shape and chemical interactions favour binding particular substrates. An enzyme–substrate complex leads to a lower-activation-energy pathway.',
'Temperature initially increases collision frequency, but excessive heat disrupts tertiary structure. pH changes protonation and can alter active-site charge and stabilising interactions.',
'A competitive inhibitor occupies the active site; a non-competitive inhibitor binds elsewhere and affects activity. Interpret rate evidence rather than assigning a mechanism from inhibitor presence alone.',
'Enzymes and receptors are chiral environments, so two enantiomers can interact differently. Molecular recognition helps explain stereoselective biological effects of drugs.'
],'Explain why two enantiomers of a drug can have different effects at an enzyme active site.',[
'Enantiomers have the same connectivity but opposite three-dimensional arrangements.',
'The enzyme active site is itself chiral, with binding groups fixed in a particular arrangement.',
'One enantiomer may align several interactions correctly and bind strongly, whereas its mirror image cannot make the same set of contacts.',
'This changes binding and activity, even though the enantiomers have identical ordinary physical properties in an achiral environment.'
],'Enzymes lower activation energy; they do not alter ΔG or the equilibrium constant of the overall reaction.');
L('3.3.13.4','DNA nucleotides and base pairing',[
'A DNA nucleotide contains phosphate, deoxyribose and a nitrogenous base. Covalent phosphodiester links join the sugar and phosphate groups along each strand.',
'Two antiparallel strands pair into a double helix. Adenine pairs with thymine through two hydrogen bonds; cytosine pairs with guanine through three.',
'Complementary pairing allows each strand to act as a template when DNA is copied. Base sequence stores information rather than the sugar–phosphate backbone sequence.',
'Hydrogen bonds hold paired bases across the strands, while covalent bonds make each strand continuous. Distinguish these interactions when explaining strand separation and damage.'
],'A DNA fragment has 40 A–T pairs and 60 G–C pairs. Find the number of base-pair hydrogen bonds and bases.',[
'Each A–T pair has two hydrogen bonds: 40 × 2 = 80.',
'Each G–C pair has three: 60 × 3 = 180.',
'Total base-pair hydrogen bonds = 80 + 180 = 260 in the ideal pairing model.',
'There are 100 pairs and therefore 200 bases across the two strands. These counts do not describe the number of covalent phosphodiester links.'
],'Bases pair through hydrogen bonds; nucleotides within a strand are joined covalently.');
L('3.3.13.5','Cisplatin and anticancer action',[
'Cisplatin is square planar cis-[Pt(NH₃)₂Cl₂]. Its adjacent chloride ligands can be replaced in reactions with biological donor atoms.',
'Platinum can coordinate to nitrogen sites in DNA bases, producing links that distort DNA and interfere with replication and transcription.',
'Damage can trigger cell death and inhibit rapidly dividing tumour cells. Healthy cells can also be affected, so treatment has substantial side effects and requires medical management.',
'The cis geometry gives a binding arrangement relevant to its activity; trans geometry changes possible interactions. Shape, ligand substitution and molecular recognition link inorganic and biological chemistry.'
],'Explain how cisplatin’s coordination chemistry relates to its anticancer action.',[
'Pt(II) is surrounded by two NH₃ and two adjacent Cl ligands in a square planar arrangement.',
'The chloride ligands can undergo substitution, allowing platinum to bind to nitrogen donor sites on DNA bases.',
'Multiple binding interactions create DNA cross-links/distortion and can hinder DNA replication.',
'This can inhibit tumour-cell division and promote cell death, but action is not exclusive to cancer cells, which explains the potential for side effects.'
],'The biological action involves ligand substitution and DNA binding, rather than platinum simply oxidising every DNA base.');
L('3.3.14','Planning multi-step organic synthesis',[
'Work backwards from the target functional group and carbon skeleton. Match each change to a known reaction, reagent, conditions and intermediate structure.',
'Track carbon count: cyanide substitution extends a chain by one, while alcohol oxidation usually retains it. Check which oxygen/nitrogen atoms are introduced or removed.',
'Select conditions that favour the intended product, such as distillation versus reflux, aqueous versus ethanolic hydroxide, or excess ammonia to reduce multiple alkylation.',
'Purify products by suitable separation, drying and distillation/recrystallisation, and verify them with spectra or chemical tests. Evaluate yield over the whole route rather than just the final step.'
],'Plan a route from bromoethane to propanoic acid, naming intermediates and conditions.',[
'The target has three carbons, so first extend the two-carbon chain using cyanide substitution.',
'Heat/reflux CH₃CH₂Br with ethanolic KCN to form CH₃CH₂CN, propanenitrile.',
'Hydrolyse the nitrile by heating under reflux with dilute aqueous acid: CH₃CH₂CN + 2H₂O + H⁺ → CH₃CH₂COOH + NH₄⁺.',
'The product is propanoic acid. Direct substitution with OH⁻ followed by oxidation would give ethanoic acid and would not achieve the required carbon count.'
],'A synthesis answer must include reagents and conditions at every step, not just product names.');
L('3.3.15','NMR: environments, integration and splitting',[
'¹³C NMR signal count reports chemically distinct carbon environments in the simplified spectrum. Chemical shift identifies the likely type of carbon using the supplied data table.',
'¹H NMR chemical shift indicates proton environment; integration gives relative numbers of protons. TMS defines zero chemical shift and a deuterated solvent avoids a large solvent proton signal.',
'In the simple first-order n+1 model, n equivalent protons on an adjacent carbon split a signal into n+1 peaks. The neighbouring group is in a different environment from the protons producing the signal.',
'Equivalent protons do not split one another in this model. O–H/N–H exchange often prevents ordinary splitting; D₂O exchange can remove such proton signals. Combine all evidence to determine structure.'
],'Interpret a compound C₃H₆O₂ with proton signals: 3H singlet near 2.1 ppm and 3H singlet near 3.7 ppm, plus a carbonyl IR band.',[
'The formula and carbonyl band support an ester or another oxygen-containing carbonyl compound; the two equal integrals indicate two methyl environments.',
'A methyl next to C=O is consistent with the signal near 2.1 ppm; a methyl attached to O is consistent with the signal near 3.7 ppm.',
'Methyl ethanoate, CH₃COOCH₃, matches both signals and C₃H₆O₂.',
'Both are singlets because neither methyl has protons on an adjacent carbon to split it in the simple n+1 model. Check the complete data rather than relying on one shift alone.'
],'For n+1, count an equivalent neighbouring set, not arbitrary non-equivalent protons throughout the molecule.');
L('3.3.16','Chromatography, Rf and retention time',[
'Chromatography separates substances by their different distributions between a stationary phase and a mobile phase. Greater affinity for the stationary phase usually slows movement.',
'For TLC, draw a pencil baseline above the solvent, apply small spots and mark the solvent front promptly. Rf = distance travelled by spot/distance travelled by solvent front, both measured from the baseline.',
'Compare Rf values with standards under identical solvent and stationary-phase conditions. A matching value supports identification but does not prove uniqueness.',
'Gas chromatography gives retention times and peak areas; GC–MS adds mass-spectral evidence for separated components. Retention times depend on operating conditions and calibrated peak area can support quantitative analysis.'
],'In TLC a spot moves 3.6 cm and the solvent front 6.0 cm. Calculate Rf and explain a comparison with a standard.',[
'Measure both distances from the same original baseline, not from the bottom of the plate.',
'Rf = 3.6/6.0 = 0.60; the ratio has no unit.',
'If a standard also has Rf = 0.60 on the same plate/conditions, the sample may contain that compound.',
'A different compound can share the same Rf, so use co-spotting or a second solvent and additional analytical evidence before claiming certain identification.'
],'Rf is a dimensionless ratio; retention time is a time and belongs to a different chromatographic readout.');
window.ALEVEL_CHEMISTRY_DETAIL_ROWS=[...(window.ALEVEL_CHEMISTRY_DETAIL_ROWS||[]),...rows];})();
