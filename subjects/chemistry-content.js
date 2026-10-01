(()=>{
  'use strict';

  const P=(q,core,model,terms,mis,practical,maths,syn)=>Object.freeze({
    q,core,model,terms,mis,practical,maths,syn,
    exam:[
      `Explain the chemistry needed to answer: ${q}`,
      `Apply ${terms[0]} and ${terms[1]} to an unfamiliar chemical context.`,
      `Use experimental, numerical or analytical evidence to justify a conclusion about this topic.`
    ]
  });

  const profiles=Object.freeze({
    '3.1.1':P(
      'How does atomic structure explain isotopes, mass spectra and periodic behaviour?',
      [
        'Atoms contain protons and neutrons in a nucleus with electrons occupying shells, subshells and orbitals around it.',
        'Isotopes have the same proton number but different neutron numbers; mass spectrometry measures isotopic masses and relative abundances.',
        'In a time-of-flight mass spectrometer ions are formed, accelerated to the same kinetic energy, separated by flight time and detected.',
        'Electron configurations and successive ionisation energies provide evidence for shells and subshells and help explain periodic trends.'
      ],
      ['Determine proton, neutron and electron numbers from A, Z and ionic charge.','Use isotopic abundance to calculate Ar or interpret a simple mass spectrum.','Write electron configurations and relate ionisation-energy changes to electron removal.'],
      ['isotope','time-of-flight mass spectrometry','electron configuration','ionisation energy'],
      'Relative atomic mass is a weighted mean of isotopic masses, not simply the mass number of the most abundant isotope.',
      ['Interpret a mass spectrum and identify isotope peaks and abundances.','Compare ionisation-energy data with predicted electron configurations.'],
      ['Calculate weighted mean relative atomic mass from isotopic abundance.','Use KE = 1/2 mv² relationships qualitatively to explain TOF separation and report answers to suitable significant figures.'],
      ['Links to periodicity because electron configuration determines position and chemical behaviour.','Links to bonding and redox because valence electrons control ion formation and reactivity.']
    ),
    '3.1.2':P(
      'How can chemical amounts be converted between particles, moles, masses, gases and solutions?',
      [
        'One mole contains the Avogadro constant number of specified particles and links microscopic particles to measurable amounts.',
        'Amount of substance is related to mass by n = m/M and to solution concentration by c = n/V with volume in dm³.',
        'Balanced equations give mole ratios that allow reacting quantities, limiting reagents, gas volumes and titration results to be calculated.',
        'Empirical and molecular formulae, percentage yield and atom economy connect composition and stoichiometry to chemical efficiency.'
      ],
      ['Convert all quantities into moles before applying the balanced-equation ratio.','Identify the limiting reagent where more than one reactant amount is supplied.','Convert the required mole amount back into mass, concentration, gas volume or particle number.'],
      ['mole','Avogadro constant','stoichiometry','limiting reagent'],
      'A balanced equation gives a ratio of amounts in moles, not a direct ratio of masses.',
      ['Use volumetric apparatus correctly for preparing standard solutions and titrations.','Use concordant titres and appropriate significant figures when calculating an unknown concentration.'],
      ['Use n = m/M, c = n/V and pV = nRT in multi-step calculations.','Calculate empirical/molecular formula, percentage yield, percentage purity and atom economy.'],
      ['Links to every quantitative area of Chemistry because equations are interpreted using mole ratios.','Links to energetics, equilibrium and acids because all use amount or concentration data.']
    ),
    '3.1.3':P(
      'How do bonding and intermolecular forces determine molecular shape and physical properties?',
      [
        'Ionic bonding is electrostatic attraction between oppositely charged ions; covalent bonding is attraction between nuclei and shared electron pairs; metallic bonding involves positive ions and delocalised electrons.',
        'Electron-pair repulsion determines molecular shape; lone pairs repel more strongly than bonding pairs and reduce bond angles.',
        'Electronegativity differences create polar bonds, but molecular symmetry can produce a non-polar molecule despite polar bonds.',
        'London forces, permanent dipole–dipole forces and hydrogen bonding help explain boiling point, solubility and other physical properties.'
      ],
      ['Identify the bonding and particles present.','Determine shape from bonding pairs and lone pairs, then assign an approximate bond angle.','Link the strongest relevant intermolecular force to the observed physical property.'],
      ['electronegativity','bond polarity','electron-pair repulsion','hydrogen bonding'],
      'A molecule is not automatically polar because it contains polar bonds; the vector effect of bond dipoles and molecular shape must be considered.',
      ['Use models to compare predicted shapes and bond angles.','Compare boiling-point or solubility data with intermolecular-force predictions.'],
      ['Interpret trends in boiling point against molecular size and branching.','Use bond angles and three-dimensional representations accurately.'],
      ['Links to organic chemistry because structure and polarity determine mechanisms and solubility.','Links to biological molecules through hydrogen bonding and molecular recognition.']
    ),
    '3.1.4':P(
      'How can enthalpy changes be measured and calculated when reactions take different routes?',
      [
        'Enthalpy change is the heat-energy change at constant pressure and is negative for exothermic reactions and positive for endothermic reactions.',
        'Standard enthalpy changes include formation and combustion under defined standard conditions.',
        'Calorimetry estimates q = mcΔT and then converts heat transferred into molar enthalpy change for the chemical reaction.',
        'Hess cycles and mean bond enthalpies use energy conservation to calculate enthalpy changes that may be difficult to measure directly.'
      ],
      ['Write the target reaction and identify the known enthalpy data.','Choose a Hess route or bond-breaking/bond-making calculation with a consistent sign convention.','Check that the answer corresponds to the stoichiometric equation as written.'],
      ['enthalpy change','standard conditions','Hess law','mean bond enthalpy'],
      'Breaking bonds requires energy whereas forming bonds releases energy; reversing these signs gives incorrect bond-enthalpy calculations.',
      ['Carry out simple calorimetry with insulation, temperature measurement and known amounts.','Evaluate heat loss, incomplete combustion and assumptions about solution density and heat capacity.'],
      ['Use q = mcΔT and convert to kJ mol⁻¹ for the stated amount reacted.','Construct and use Hess cycles, including combustion or formation data.'],
      ['Links to thermodynamics, where enthalpy is combined with entropy to predict feasibility.','Links to fuels and sustainability because energy output alone does not determine environmental suitability.']
    ),
    '3.1.5':P(
      'Why do temperature, concentration, pressure and catalysts change reaction rate?',
      [
        'Reaction rate depends on the frequency of successful collisions between reacting particles.',
        'Particles must collide with energy at least equal to the activation energy and with a suitable orientation.',
        'Increasing temperature changes the Maxwell–Boltzmann distribution so a much larger fraction of particles exceeds the activation energy.',
        'Catalysts provide an alternative pathway with lower activation energy and are regenerated overall.'
      ],
      ['Use collision theory to identify which collision factor changes.','Use a Maxwell–Boltzmann distribution to explain temperature or catalyst effects.','Separate increased collision frequency from increased fraction of successful collisions.'],
      ['activation energy','collision theory','Maxwell–Boltzmann distribution','catalyst'],
      'A catalyst does not increase the energy of reacting particles or change the equilibrium constant; it lowers activation energy for both directions.',
      ['Measure rate using gas volume, mass loss, colorimetry or sampling depending on the reaction.','Control temperature and initial quantities so only the chosen variable changes.'],
      ['Determine rate from concentration–time or quantity–time graphs and gradients.','Compare relative areas beyond Ea on qualitative Maxwell–Boltzmann distributions.'],
      ['Links to rate equations, where experimental orders quantify concentration effects.','Links to equilibrium because catalysts change the speed of reaching equilibrium but not its position.']
    ),
    '3.1.6':P(
      'How do equilibrium position and Kc respond to changing conditions?',
      [
        'Dynamic equilibrium occurs in a closed system when forward and reverse reactions continue at equal rates.',
        'Le Chatelier’s principle predicts how equilibrium position changes after concentration, pressure or temperature changes.',
        'Kc is written using equilibrium concentrations raised to powers from the balanced equation, omitting pure solids where appropriate.',
        'At a fixed temperature Kc has a fixed value; changing concentrations or pressure changes the position but not Kc.'
      ],
      ['Write the balanced equilibrium equation before constructing Kc.','Predict the direction of shift by considering how the disturbance is opposed.','Distinguish a change in equilibrium composition from a change in the numerical value of Kc.'],
      ['dynamic equilibrium','Le Chatelier principle','equilibrium constant Kc','equilibrium concentration'],
      'Adding a catalyst does not change equilibrium yield or Kc; it accelerates both forward and reverse reactions.',
      ['Investigate an equilibrium colour system by changing concentration or temperature.','Use measured equilibrium concentrations to calculate Kc and assess experimental uncertainty.'],
      ['Construct Kc expressions and calculate Kc or missing equilibrium concentrations.','Use stoichiometric change tables where initial and equilibrium concentrations are related.'],
      ['Links to acids and bases because Ka is an equilibrium constant.','Links to industrial chemistry where temperature and pressure balance yield, rate, cost and safety.']
    ),
    '3.1.7':P(
      'How can electron transfer be represented using oxidation states and redox equations?',
      [
        'Oxidation is loss of electrons and reduction is gain of electrons; both occur together in a redox process.',
        'Oxidation states provide a bookkeeping system for identifying which species is oxidised or reduced.',
        'Half-equations explicitly show electron loss or gain and can be combined to form an overall ionic equation.',
        'An oxidising agent accepts electrons and is reduced; a reducing agent donates electrons and is oxidised.'
      ],
      ['Assign oxidation states using standard rules.','Write oxidation and reduction half-equations with balanced atoms and charge.','Scale half-equations so electron numbers cancel before combining.'],
      ['oxidation','reduction','oxidation state','half-equation'],
      'The oxidising agent is itself reduced, while the reducing agent is itself oxidised.',
      ['Observe redox reactions and use colour or electrode observations as evidence.','Balance ionic equations from experimental reaction information.'],
      ['Use electron counts to balance redox equations.','Calculate reacting amounts from redox stoichiometry where needed.'],
      ['Links directly to electrode potentials and electrochemical cells.','Links to transition metals because variable oxidation states are central to their chemistry.']
    ),
    '3.1.8':P(
      'How do enthalpy, entropy and lattice energies explain energetic stability and reaction feasibility?',
      [
        'Lattice enthalpy, hydration enthalpy and enthalpy of solution can be connected by Hess cycles.',
        'Born–Haber cycles use atomisation, ionisation, electron affinity and formation data to determine lattice enthalpy.',
        'Entropy measures the dispersal of energy and matter; entropy changes can be estimated from standard molar entropy data.',
        'Gibbs free-energy change ΔG = ΔH − TΔS predicts thermodynamic feasibility under specified conditions when units are consistent.'
      ],
      ['Build a labelled energy cycle with arrows matching the sign convention of the data.','Calculate ΔS for products minus reactants and convert J K⁻¹ mol⁻¹ to kJ K⁻¹ mol⁻¹ when needed.','Use ΔG and temperature to determine feasibility while recognising kinetics may still limit rate.'],
      ['lattice enthalpy','Born–Haber cycle','entropy','Gibbs free energy'],
      'Thermodynamically feasible does not mean fast; a reaction can have negative ΔG but a large activation energy.',
      ['Use solubility or energetic data to compare ionic compounds.','Evaluate assumptions in perfect-ionic models when experimental and theoretical lattice values differ.'],
      ['Complete Born–Haber and solution cycles algebraically.','Use ΔG = ΔH − TΔS and calculate threshold temperature for feasibility.'],
      ['Links back to energetics and forward to electrochemical feasibility.','Links bonding models to measurable energetic quantities in ionic compounds.']
    ),
    '3.1.9':P(
      'How can experimental rate data reveal a rate equation and reaction mechanism?',
      [
        'A rate equation has the form rate = k[A]^m[B]^n where orders are determined experimentally rather than from the overall equation.',
        'Initial-rate data can reveal each order by comparing experiments in which one concentration changes.',
        'The rate constant k depends on temperature and its units depend on the overall order.',
        'A proposed mechanism must have a rate-determining step consistent with the experimentally observed rate equation.'
      ],
      ['Compare experiments where only one reactant concentration changes.','Infer each order, then substitute data to calculate k.','Check whether the species in the proposed slow step can generate the observed rate dependence.'],
      ['rate equation','order of reaction','rate constant','rate-determining step'],
      'Reaction orders cannot usually be read from stoichiometric coefficients in the overall equation.',
      ['Collect concentration–time or clock-reaction data while controlling temperature.','Use initial rates or half-life evidence to distinguish zero-, first- and second-order behaviour where appropriate.'],
      ['Determine orders from proportional changes in initial-rate data.','Calculate k, its units and rate at new concentrations; use first-order half-life evidence.'],
      ['Links to kinetics through activation energy and temperature.','Links to organic mechanisms because experimental rate laws can support or reject proposed steps.']
    ),
    '3.1.10':P(
      'How does Kp describe gaseous equilibria using partial pressures?',
      [
        'Partial pressure is the contribution a gas makes to total pressure and equals mole fraction multiplied by total pressure.',
        'Kp expressions use equilibrium partial pressures raised to stoichiometric powers for gaseous species.',
        'At constant temperature Kp is unchanged by altering pressure, amounts or adding an inert gas under the standard idealised treatment.',
        'Temperature can change Kp because it changes the energetic balance between forward and reverse reactions.'
      ],
      ['Find equilibrium mole amounts and total moles.','Convert each gas amount to mole fraction and partial pressure.','Substitute equilibrium partial pressures into the correct Kp expression and interpret its magnitude.'],
      ['partial pressure','mole fraction','equilibrium constant Kp','homogeneous equilibrium'],
      'Increasing total pressure may shift equilibrium position but does not itself change Kp when temperature is constant.',
      ['Use pressure or composition data from a closed gaseous equilibrium.','Evaluate assumptions such as ideal-gas behaviour and accurate equilibrium composition.'],
      ['Calculate mole fractions, partial pressures and Kp with correct powers and units.','Solve equilibrium-composition problems from Kp and initial amounts.'],
      ['Links to Le Chatelier’s principle but provides a quantitative equilibrium description.','Links to industrial gas-phase processes such as ammonia manufacture.']
    ),
    '3.1.11':P(
      'How do electrode potentials predict cell voltage and redox feasibility?',
      [
        'A half-cell establishes an electrode potential relative to the standard hydrogen electrode under standard conditions.',
        'More positive standard electrode potentials correspond to a greater tendency for reduction under standard conditions.',
        'Cell emf is calculated from the reduction potential of the cathode minus that of the anode.',
        'Electrochemical cells convert chemical energy to electrical energy, while fuel cells continuously use supplied reactants.'
      ],
      ['Write both reduction half-equations in the tabulated direction.','Choose the more positive potential as reduction at the cathode for a spontaneous standard cell.','Calculate E°cell and then consider whether conditions or kinetics limit the prediction.'],
      ['standard electrode potential','standard hydrogen electrode','cell emf','electrochemical cell'],
      'A positive E°cell suggests thermodynamic feasibility under standard conditions but does not guarantee an observable fast reaction.',
      ['Construct simple electrochemical cells with salt bridges and high-resistance voltmeters.','Compare measured emf with calculated standard values and explain deviations from standard conditions.'],
      ['Use E°cell = E°cathode − E°anode and combine half-equations without multiplying electrode potentials.','Use Faraday-style electron stoichiometry qualitatively when linking charge transfer to redox amount.'],
      ['Links directly to redox, thermodynamics and transition-metal oxidation states.','Links to batteries, rechargeable cells, fuel cells and sustainable energy storage.']
    ),
    '3.1.12':P(
      'How do acid–base equilibria determine pH, buffer action and titration behaviour?',
      [
        'Brønsted–Lowry acids donate protons and bases accept protons; conjugate acid–base pairs differ by H⁺.',
        'Strong acids dissociate essentially completely whereas weak acids establish equilibria described by Ka and pKa.',
        'Water auto-ionisation is described by Kw and allows hydroxide concentration to be related to pH.',
        'Buffers contain a weak acid/base pair and resist pH change by removing added H⁺ or OH⁻; titration curves guide indicator choice.'
      ],
      ['Identify the relevant acid–base equilibrium and write its expression.','Choose the appropriate approximation or stoichiometric neutralisation step before applying Ka, Kw or buffer equations.','Check whether the calculated pH is chemically sensible for the solution type.'],
      ['Brønsted–Lowry acid','Ka and pKa','buffer solution','titration curve'],
      'A weak acid is not necessarily dilute; strength describes degree of ionisation whereas concentration describes amount per volume.',
      ['Use pH meters and volumetric apparatus to obtain acid–base titration curves.','Prepare or investigate buffer solutions and compare measured pH after small acid/base additions.'],
      ['Calculate pH of strong acids/bases, weak acids, buffers and selected titration points.','Use Ka, pKa, Kw and logarithms accurately with appropriate approximations.'],
      ['Links to equilibrium constants and biological/industrial buffer systems.','Links to inorganic aqueous-ion chemistry where hydrolysis can make solutions acidic.']
    ),

    '3.2.1':P(
      'How do electronic structure and bonding explain periodic trends across Period 3?',
      [
        'Elements are classified into s, p, d or f blocks according to the subshell receiving the highest-energy electron.',
        'Across Period 3 nuclear charge increases while shielding changes relatively little, so atomic radius generally decreases.',
        'First ionisation energy generally increases across Period 3, with deviations explained by subshell energy and electron pairing.',
        'Melting-point trends depend on whether the element has metallic, giant covalent or simple molecular/atomic structure.'
      ],
      ['Identify structure and bonding before explaining a melting point.','Use nuclear charge, shielding and atomic radius together to explain ionisation energy.','Explain anomalies using the energy or occupancy of the electron removed.'],
      ['periodicity','first ionisation energy','atomic radius','Period 3'],
      'Ionisation energy does not rise perfectly smoothly across a period; subshell and paired-electron effects cause predictable deviations.',
      ['Compare physical-property data across Period 3.','Use ionisation-energy evidence to infer electron configurations.'],
      ['Plot or interpret trends in atomic radius, ionisation energy and melting point.','Use successive ionisation-energy ratios to locate a main-group element.'],
      ['Links atomic structure to Group 2 and Period 3 chemical behaviour.','Links bonding type to macroscopic melting points and conductivity.']
    ),
    '3.2.2':P(
      'Why does Group 2 chemistry change down the group and how are its compounds used?',
      [
        'Down Group 2 atomic radius and shielding increase, so first ionisation energy decreases and metals generally become more reactive.',
        'Group 2 metals form M²⁺ ions and react with water with increasing vigour down the group.',
        'Hydroxide solubility generally increases down the group while sulfate solubility generally decreases.',
        'These trends support uses including neutralising acidity, removing sulfur dioxide and using insoluble barium sulfate in imaging.'
      ],
      ['Explain reactivity using attraction between the nucleus and outer electrons.','State and apply the opposing solubility trends for hydroxides and sulfates.','Link a compound property to its practical use and any necessary safety reasoning.'],
      ['Group 2','alkaline earth metal','hydroxide solubility','sulfate solubility'],
      'Solubility trends for Group 2 hydroxides and sulfates run in opposite directions.',
      ['Compare Mg–Ba reactions with water or steam where safe and appropriate.','Test sulfate ions using acidified barium chloride and explain why the reagent is acidified.'],
      ['Interpret solubility or reactivity trend data down the group.','Use stoichiometry in neutralisation, precipitation or flue-gas treatment calculations.'],
      ['Links to periodicity through radius and ionisation energy.','Links to qualitative analysis through sulfate precipitation tests.']
    ),
    '3.2.3':P(
      'How do halogen oxidising power and halide reducing power change down Group 7?',
      [
        'Halogens become less electronegative and weaker oxidising agents down the group as electron gain becomes less favourable.',
        'More reactive halogens oxidise halide ions of less reactive halogens in displacement reactions.',
        'Halide ions become stronger reducing agents down the group and show different reactions with concentrated sulfuric acid.',
        'Silver nitrate tests distinguish halides using precipitate colour and ammonia solubility, while chlorine chemistry connects to water treatment and environmental issues.'
      ],
      ['Use electron-transfer equations to predict displacement.','Relate oxidising power to atomic size, shielding and attraction for an incoming electron.','Use observations and follow-up ammonia tests to identify a halide.'],
      ['halogen','halide ion','oxidising agent','reducing agent'],
      'The oxidising power of halogens decreases down the group while the reducing power of halide ions increases.',
      ['Carry out halogen–halide displacement observations with suitable microscale/safety controls.','Identify halides using acidified silver nitrate followed by ammonia where specified.'],
      ['Use redox stoichiometry and oxidation states in halogen reactions.','Interpret trends in boiling point, electronegativity or redox potential.'],
      ['Links to redox and electrode potentials.','Links to environmental chemistry through chlorine, ozone and halogen-containing compounds.']
    ),
    '3.2.4':P(
      'How do the structures and acid–base properties of Period 3 elements and oxides change across the period?',
      [
        'Period 3 elements change from metallic structures through giant covalent silicon to simple molecular/atomic structures.',
        'Their melting points and electrical conductivities follow from these structures and the forces or bonds that must be overcome.',
        'Period 3 oxides change from basic ionic oxides through amphoteric aluminium oxide to acidic covalent oxides.',
        'Reactions of oxides with water, acids and bases can be predicted from bonding and acid–base character.'
      ],
      ['Classify the structure and bonding of the element or oxide.','Use this classification to predict melting point, conductivity or acid–base behaviour.','Write balanced equations for representative oxide reactions with water, acid or base.'],
      ['Period 3 oxides','amphoteric','acidic oxide','basic oxide'],
      'An oxide’s acid–base behaviour is not determined only by whether oxygen is present; bonding and the element’s position across the period matter.',
      ['Compare pH or reactions of selected Period 3 oxides with water, acid and alkali where appropriate.','Use observations to classify oxide behaviour.'],
      ['Interpret melting-point and conductivity data across Period 3.','Balance acid–base and redox equations involving Period 3 species.'],
      ['Links to periodicity and bonding.','Links to aqueous-ion reactions and industrial acid/base chemistry.']
    ),
    '3.2.5':P(
      'Why do transition metals show variable oxidation states, coloured complexes and catalytic behaviour?',
      [
        'Transition metals form at least one stable ion with an incomplete d subshell, giving characteristic chemistry.',
        'They show variable oxidation states, form complex ions with ligands and often act as catalysts.',
        'Complex shape depends on coordination number; ligand substitution and changes in oxidation state can alter colour.',
        'Optical and geometrical isomerism can occur in complexes, and redox potentials help predict reactions between oxidation states.'
      ],
      ['Identify oxidation state, ligand charge and coordination number.','Predict common shapes and follow ligand-substitution or redox changes.','Use observations, equations and electrode potentials to justify the identity or behaviour of a complex.'],
      ['transition metal','ligand','complex ion','coordination number'],
      'A coloured ion is not explained simply by “having d electrons”; the relevant partially filled d subshell and ligand environment must be considered.',
      ['Observe ligand-substitution, precipitation or redox changes of transition-metal ions.','Use colorimetry to relate concentration to absorbance for a coloured species where appropriate.'],
      ['Calculate oxidation states and stoichiometry in complex/redox reactions.','Use calibration graphs or Beer–Lambert-style proportional reasoning qualitatively where specified.'],
      ['Links to electrode potentials, redox and catalysis.','Links to organic synthesis because transition metals catalyse many industrial reactions.']
    ),
    '3.2.6':P(
      'How do metal aqua ions react with water, hydroxide and ligands in aqueous solution?',
      [
        'Metal ions in water form hydrated complex ions, often represented as hexaaqua complexes.',
        'Small highly charged metal ions polarise O–H bonds in coordinated water, making some aqua ions acidic.',
        'Adding hydroxide can produce metal hydroxide precipitates; excess ligand or hydroxide may dissolve some precipitates by complex formation or amphoteric behaviour.',
        'Ligand exchange and precipitation observations provide a systematic way to identify and compare aqueous ions.'
      ],
      ['Write the initial aqua complex where required.','Predict acid–base, precipitation or ligand-substitution behaviour from the reagent added.','Use colour, precipitate and solubility observations to distinguish ions.'],
      ['aqua ion','hydrolysis','precipitation','ligand substitution'],
      'A precipitate dissolving in excess reagent may be due to complex formation rather than simple reversal of precipitation.',
      ['Carry out microscale tests with hydroxide, ammonia or other specified ligands and record colours carefully.','Use control samples and consistent reagent addition to compare observations.'],
      ['Use ionic equations and stoichiometric ratios for precipitation.','Interpret qualitative observations alongside pH or concentration data.'],
      ['Links to transition-metal complexes and acids/bases.','Links to analytical chemistry through systematic qualitative identification.']
    ),

    '3.3.1':P(
      'How are organic molecules named, represented and described using reaction mechanisms?',
      [
        'Organic compounds are organised by homologous series and functional groups and are named systematically using IUPAC rules.',
        'Molecules can be represented by empirical, molecular, structural, displayed and skeletal formulae.',
        'Structural isomerism includes chain, position and functional-group isomerism.',
        'Mechanisms use curly arrows to show movement of electron pairs and distinguish nucleophiles, electrophiles, radicals and bond fission.'
      ],
      ['Identify the principal functional group and longest appropriate carbon chain.','Number substituents to give the required lowest locants and construct the IUPAC name.','For mechanisms, start each curly arrow at an electron pair or bond and finish at the atom or bond receiving it.'],
      ['functional group','homologous series','structural isomerism','curly arrow'],
      'Curly arrows represent movement of electron pairs, not movement of whole atoms or positive charges.',
      ['Build or draw isomers and convert between displayed and skeletal formulae.','Use reaction schemes to classify addition, substitution, elimination, oxidation or reduction.'],
      ['Determine empirical or molecular formula from composition data where linked.','Count possible structural isomers for small formulae systematically.'],
      ['Provides the language needed for every later organic topic.','Links bonding and polarity to why nucleophiles and electrophiles react.']
    ),
    '3.3.2':P(
      'How are alkanes separated, modified, burned and substituted?',
      [
        'Crude oil is a mixture rich in hydrocarbons that can be separated into fractions by boiling-range differences in fractional distillation.',
        'Cracking breaks C–C bonds in larger hydrocarbons to form more useful smaller molecules, including alkenes.',
        'Complete and incomplete combustion produce different products and pollutants; catalytic converters reduce harmful exhaust emissions.',
        'Alkanes undergo free-radical substitution with halogens through initiation, propagation and termination steps.'
      ],
      ['Relate boiling point to intermolecular forces and hydrocarbon size.','Balance cracking or combustion equations and identify environmental products.','Write radical substitution steps with radicals shown explicitly and regenerated in propagation.'],
      ['alkane','fractional distillation','cracking','free-radical substitution'],
      'A propagation step must consume one radical and produce another; a step that removes radicals is termination.',
      ['Model fractional distillation or compare hydrocarbon properties across fractions.','Investigate combustion products or reaction conditions using appropriate safety controls.'],
      ['Balance hydrocarbon combustion and cracking equations.','Use percentage yield or atom economy when comparing routes to useful products.'],
      ['Links to alkenes because cracking supplies alkene feedstocks.','Links to atmospheric chemistry through NOx, CO, particulates and sulfur dioxide.']
    ),
    '3.3.3':P(
      'Why do halogenoalkanes undergo substitution and elimination, and what controls their reaction rate?',
      [
        'The carbon–halogen bond is polar, making the carbon atom susceptible to attack by nucleophiles.',
        'OH⁻, CN⁻ and NH3 can substitute the halogen through nucleophilic substitution to form different organic products.',
        'Hydroxide can also act as a base, so substitution and elimination can compete depending on conditions.',
        'Hydrolysis rate depends strongly on carbon–halogen bond enthalpy; CFC photochemistry releases chlorine radicals that catalyse ozone destruction.'
      ],
      ['Identify whether the reagent is acting as a nucleophile or base.','Draw the curly arrow from the nucleophile lone pair and show C–X bond breaking.','Use bond enthalpy and conditions to explain rate or substitution–elimination competition.'],
      ['halogenoalkane','nucleophilic substitution','elimination','nucleophile'],
      'The C–F bond is highly polar yet fluoroalkanes hydrolyse slowly because the C–F bond is very strong.',
      ['Compare hydrolysis rates of halogenoalkanes using silver-ion precipitation after controlled reaction conditions.','Purify a halogenoalkane product using separation and distillation where appropriate.'],
      ['Interpret rate data and compare relative carbon–halogen bond enthalpies.','Use stoichiometry for substitution products and yield calculations.'],
      ['Links to alcohols, nitriles and amines as substitution products.','Links to atmospheric radical chemistry through ozone depletion.']
    ),
    '3.3.4':P(
      'Why does the electron-rich C=C bond undergo electrophilic addition and form polymers?',
      [
        'Alkenes contain a sigma bond and a pi bond; the pi bond gives a region of high electron density and makes alkenes reactive toward electrophiles.',
        'Electrophilic addition with reagents such as HBr, H2SO4 and Br2 proceeds through electron-pair movement and may form carbocation intermediates.',
        'Unsymmetrical alkenes can give major and minor products because more stable carbocations form preferentially.',
        'Alkenes undergo addition polymerisation, and restricted rotation around C=C can produce E/Z stereoisomerism where groups permit it.'
      ],
      ['Identify the electrophile and electron-rich pi bond.','Draw the first curly arrow from the C=C bond and then complete attack on the carbocation intermediate.','For unsymmetrical alkenes compare carbocation stability before predicting the major product.'],
      ['alkene','electrophile','carbocation','E/Z isomerism'],
      'The major product is not chosen by counting atoms; it follows from the relative stability of possible carbocation intermediates.',
      ['Use bromine water to test for unsaturation with appropriate handling controls.','Model or draw E/Z structures and addition-polymer repeating units.'],
      ['Calculate percentage yield or atom economy for alkene reactions.','Determine molecular formula or degree of unsaturation from analytical data.'],
      ['Links to halogenoalkanes and alcohols through electrophilic addition products.','Links to polymers and stereochemistry.']
    ),
    '3.3.5':P(
      'How are alcohols made and converted into alkenes, carbonyl compounds and carboxylic acids?',
      [
        'Ethanol can be produced by alkene hydration or fermentation, routes with different feedstocks, rates, purity and sustainability considerations.',
        'Primary alcohols oxidise first to aldehydes and then to carboxylic acids; secondary alcohols oxidise to ketones while tertiary alcohols resist oxidation under these conditions.',
        'Distillation can remove an aldehyde product before further oxidation, whereas reflux promotes more complete reaction without loss of volatile material.',
        'Alcohols can undergo acid-catalysed elimination to form alkenes and other substitution reactions specified elsewhere in the course.'
      ],
      ['Classify the alcohol as primary, secondary or tertiary.','Choose oxidation conditions and apparatus to stop at or continue beyond the first oxidation product.','For elimination identify the atoms removed and the C=C bond formed.'],
      ['primary alcohol','oxidation','reflux','distillation'],
      'Reflux and distillation are not interchangeable: reflux returns vapour to the reaction mixture, while distillation removes a volatile component.',
      ['Oxidise an alcohol under controlled conditions and distinguish distillation from reflux setups.','Compare fermentation and hydration using yield, rate, purity and renewable-feedstock evidence.'],
      ['Balance oxidation equations using [O] conventions where appropriate.','Compare percentage yield, atom economy and energy requirements of alternative routes.'],
      ['Links to aldehydes, ketones and carboxylic acids.','Links to green chemistry when comparing fermentation and petrochemical hydration.']
    ),
    '3.3.6':P(
      'How can test-tube reactions, mass spectrometry and infrared spectroscopy identify an organic compound?',
      [
        'Characteristic chemical tests can distinguish selected functional groups by visible observations.',
        'High-resolution mass data can support determination of molecular formula from an accurate molecular ion mass.',
        'Infrared absorption occurs at characteristic wavenumbers for particular bonds and functional groups.',
        'The fingerprint region helps confirm identity by comparison with reference spectra, while multiple techniques together give stronger structural evidence.'
      ],
      ['Use chemical-test observations to narrow possible functional groups.','Use accurate mass and formula constraints to identify plausible molecular formulae.','Use diagnostic IR absorptions to confirm or exclude bonds, then combine all evidence.'],
      ['functional-group test','molecular ion','infrared spectrum','fingerprint region'],
      'One IR absorption rarely proves a full structure; structural identification should combine multiple independent pieces of evidence.',
      ['Carry out suitable microscale functional-group tests and record observations.','Interpret supplied IR and mass spectra rather than relying on colour alone.'],
      ['Use accurate relative masses to distinguish molecular formulae.','Read wavenumbers and compare spectral evidence with candidate structures.'],
      ['Links to NMR and chromatography as complementary analytical techniques.','Links to every organic topic because identification depends on known functional-group chemistry.']
    ),
    '3.3.7':P(
      'How does chirality produce optical isomers with different three-dimensional arrangements?',
      [
        'A chiral centre is commonly a tetrahedral carbon attached to four different groups.',
        'Optical isomers are non-superimposable mirror images called enantiomers.',
        'Enantiomers have many identical physical properties in achiral environments but interact differently with other chiral species.',
        'A racemic mixture contains equal amounts of two enantiomers and has no overall optical rotation because their effects cancel.'
      ],
      ['Locate possible tetrahedral carbon centres and test whether four different groups are attached.','Draw the pair as mirror-image three-dimensional structures.','Distinguish a single enantiomer from a racemic mixture and explain biological relevance.'],
      ['chiral centre','enantiomer','optical isomer','racemic mixture'],
      'A carbon bonded to two identical groups is not chiral even if the rest of the molecule is complex.',
      ['Use molecular models to test superimposability of mirror-image structures.','Relate stereochemistry to drug–receptor or enzyme interactions qualitatively.'],
      ['Count chiral centres in supplied structures.','Use proportional composition reasoning for enantiomeric or racemic samples where data are supplied.'],
      ['Links to amino acids and biological molecules.','Links to organic synthesis because synthetic routes may create mixtures of stereoisomers.']
    ),
    '3.3.8':P(
      'How do aldehydes and ketones differ in oxidation, reduction and nucleophilic-addition chemistry?',
      [
        'Aldehydes and ketones contain the polar carbonyl C=O group, with an electron-deficient carbon susceptible to nucleophilic attack.',
        'Aldehydes can be oxidised to carboxylic acids and give positive Tollens’/Fehling-type tests, whereas ketones resist these mild oxidations.',
        'Both aldehydes and ketones can be reduced to alcohols using suitable reducing agents.',
        'HCN adds by a nucleophilic-addition mechanism to form hydroxynitriles and can create a new chiral centre.'
      ],
      ['Identify the partially positive carbonyl carbon.','Draw nucleophilic attack followed by protonation in the addition mechanism.','Use oxidation-test observations to distinguish aldehydes from ketones.'],
      ['carbonyl group','aldehyde','ketone','nucleophilic addition'],
      'Ketones do undergo many addition and reduction reactions; their resistance here refers to oxidation by the specified mild reagents.',
      ['Use Tollens’ reagent or another specified test to distinguish aldehydes and ketones with correct safety procedures.','Prepare or analyse carbonyl derivatives using supplied data where specified.'],
      ['Use stoichiometry and yield calculations for oxidation or reduction.','Interpret analytical data for carbonyl-containing compounds.'],
      ['Links to alcohol oxidation and carboxylic acids.','Links to optical isomerism when nucleophilic addition creates a chiral centre.']
    ),
    '3.3.9':P(
      'Why are carboxylic acids acidic and why are acyl derivatives highly reactive?',
      [
        'Carboxylic acids are weak acids whose conjugate carboxylate ions are stabilised by delocalisation.',
        'Carboxylic acids form esters with alcohols in reversible acid-catalysed reactions.',
        'Acyl chlorides and acid anhydrides undergo nucleophilic addition–elimination with water, alcohols, ammonia and amines.',
        'The high reactivity of acyl chlorides makes them useful synthetic intermediates for esters and amides.'
      ],
      ['Identify the acyl carbon as the electrophilic centre.','For addition–elimination show nucleophilic attack, tetrahedral intermediate and loss of the leaving group.','Choose the nucleophile to predict ester, acid or amide product.'],
      ['carboxylic acid','esterification','acyl chloride','nucleophilic addition–elimination'],
      'Esterification of a carboxylic acid is reversible, whereas acyl chlorides react much more vigorously and are not treated as equivalent reagents.',
      ['Prepare an ester using heating/reflux, separation and purification steps where appropriate.','Compare reactions of acyl derivatives using controlled microscale observations.'],
      ['Calculate equilibrium/yield or reagent amounts for esterification and acylation.','Use atom economy to compare synthetic routes.'],
      ['Links to amines, polymers and organic synthesis.','Links to equilibrium through reversible esterification.']
    ),
    '3.3.10':P(
      'Why is benzene unusually stable and why does it favour electrophilic substitution?',
      [
        'Benzene is planar with six delocalised pi electrons and equal C–C bond lengths intermediate between single and double bonds.',
        'Delocalisation stabilises benzene relative to a hypothetical localised cyclohexatriene structure.',
        'Electrophilic substitution preserves the aromatic delocalised system after temporary disruption during the mechanism.',
        'AQA reactions include nitration and Friedel–Crafts acylation using catalysts to generate sufficiently strong electrophiles.'
      ],
      ['Use bond-length or enthalpy evidence to justify delocalisation.','Generate or identify the electrophile under the specified reaction conditions.','Draw attack of benzene, formation of the intermediate and loss of H⁺ to restore aromaticity.'],
      ['benzene','delocalisation','electrophilic substitution','Friedel–Crafts acylation'],
      'Benzene does not contain three ordinary localised C=C bonds; its six pi electrons are delocalised around the ring.',
      ['Compare expected and measured hydrogenation enthalpy evidence for benzene stability.','Use reaction schemes to plan nitration or acylation steps.'],
      ['Use enthalpy differences to estimate delocalisation stabilisation.','Calculate stoichiometry and yield for aromatic substitution products.'],
      ['Links to amine synthesis through nitrobenzene reduction.','Links to organic synthesis because aromatic substitution builds more complex carbon frameworks.']
    ),
    '3.3.11':P(
      'How are amines prepared and why do their basic and nucleophilic properties vary?',
      [
        'Primary aliphatic amines can be prepared from halogenoalkanes with ammonia or by reduction of nitriles; aromatic amines can be made by reducing nitro compounds.',
        'Amines are weak bases because the nitrogen lone pair can accept H⁺.',
        'Alkyl groups increase electron density around nitrogen whereas delocalisation into an aromatic ring can reduce lone-pair availability, affecting base strength.',
        'Amines act as nucleophiles in substitution with halogenoalkanes and addition–elimination with acyl chlorides or acid anhydrides.'
      ],
      ['Identify the nitrogen lone pair as the reactive electron pair.','Use electronic effects to compare base strength.','Draw nucleophilic attack and account for further alkylation or acylation products.'],
      ['amine','lone pair','basicity','nucleophile'],
      'Aromatic amines are not necessarily stronger bases than aliphatic amines; delocalisation can make the nitrogen lone pair less available.',
      ['Compare pH/basicity evidence for ammonia and different amines.','Use reaction schemes for amine preparation and acylation.'],
      ['Use pH or equilibrium information qualitatively to compare base strength.','Calculate reagent quantities and yields in amine synthesis.'],
      ['Links to halogenoalkanes, nitriles, aromatic chemistry and acyl derivatives.','Links to amino acids and proteins through nitrogen-containing functional groups.']
    ),
    '3.3.12':P(
      'How are condensation polymers formed and why do different polymers have different disposal problems?',
      [
        'Condensation polymers form when bifunctional monomers react repeatedly with elimination of a small molecule.',
        'Dicarboxylic acids with diols form polyesters, while dicarboxylic acids/acyl derivatives with diamines form polyamides.',
        'Repeating units must preserve the correct ester or amide linkage and can be used to reconstruct monomer structures.',
        'Polyalkenes are relatively inert and non-biodegradable, whereas ester and amide linkages can undergo hydrolysis; disposal choices involve trade-offs.'
      ],
      ['Identify both functional groups on each monomer.','Form the correct linkage and draw the repeating unit through the chain bonds.','Reverse the linkage to recover monomers and use hydrolysis chemistry to discuss degradation.'],
      ['condensation polymer','polyester','polyamide','repeating unit'],
      'The atoms shown in brackets in a repeating unit must connect correctly to neighbouring repeats; end groups are not normally part of the repeat.',
      ['Prepare a small sample or demonstration of nylon where appropriate.','Compare physical or chemical behaviour of addition and condensation polymers.'],
      ['Calculate repeat-unit Mr or mass composition.','Compare atom economy and waste for addition versus condensation polymerisation.'],
      ['Links to carboxylic-acid derivatives and amines.','Links to sustainability, hydrolysis and material properties.']
    ),
    '3.3.13':P(
      'How do acid–base behaviour, peptide bonding and molecular interactions shape amino acids, proteins and DNA?',
      [
        'Amino acids contain acidic and basic groups and can exist as zwitterions; their form changes with pH.',
        'Amino acids join by condensation to form peptide links, and peptide hydrolysis regenerates amino acids.',
        'Protein primary, secondary and tertiary structures are stabilised by interactions including hydrogen bonds and disulfide bonds.',
        'DNA structure depends on a sugar–phosphate backbone, complementary base pairing and hydrogen bonding; molecular shape also underpins enzyme and drug action.'
      ],
      ['Draw the correct ionic form of an amino acid in acidic, neutral/zwitterionic or alkaline conditions.','Form or hydrolyse peptide links while preserving side chains.','Relate intermolecular bonding and three-dimensional structure to protein, enzyme or DNA function.'],
      ['zwitterion','peptide link','protein structure','complementary base pairing'],
      'A zwitterion is not uncharged at every atom; it contains both positive and negative charges with an overall net charge of zero.',
      ['Use chromatography to separate amino acids and calculate Rf values.','Use molecular models to relate stereospecific active sites or base pairing to intermolecular forces.'],
      ['Calculate Rf and interpret chromatograms.','Use stoichiometry for peptide hydrolysis or condensation and count peptide bonds.'],
      ['Links strongly to Biology but is assessed through chemical structure and bonding.','Links to optical isomerism, polymers, enzymes and drug design.']
    ),
    '3.3.14':P(
      'How can a target organic molecule be made efficiently through a multi-step synthesis?',
      [
        'Organic synthesis combines reactions from across the specification into connected routes between functional groups.',
        'A successful route must use reagents and conditions that produce the required functional-group changes in a feasible sequence.',
        'Purification and identification steps are needed because reactions may be incomplete or produce mixtures.',
        'Overall yield decreases across multiple steps, so route length, selectivity, hazards, waste and atom economy matter.'
      ],
      ['Compare the target structure with the starting material and identify functional-group changes.','Work backwards or forwards through known reactions, adding reagents and conditions to each arrow.','Check carbon-chain length, selectivity, purification and overall yield across the whole route.'],
      ['synthetic route','reagent','reaction conditions','overall yield'],
      'A chemically possible individual step is not enough; every intermediate must connect correctly to the next step and preserve the required carbon skeleton.',
      ['Plan a multi-step preparation including reaction, separation, purification and identification.','Use distillation, reflux, extraction, recrystallisation or chromatography appropriately for the species involved.'],
      ['Calculate overall percentage yield by multiplying fractional yields of consecutive steps.','Compare atom economy and material efficiency of alternative routes.'],
      ['Synoptic by design: links alkenes, halogenoalkanes, alcohols, carbonyls, acids, amines and aromatic chemistry.','Links analytical chemistry to proving product identity and purity.']
    ),
    '3.3.15':P(
      'How can proton and carbon-13 NMR spectra be used to deduce organic structures?',
      [
        'Chemical shift depends on the electronic environment of a nucleus relative to a reference standard.',
        '13C NMR gives one signal for each distinct carbon environment in the simplified AQA treatment.',
        '1H NMR gives chemical shifts, relative integration and spin–spin splitting that reveal proton environments and neighbouring equivalent protons.',
        'NMR evidence is strongest when combined with molecular formula, mass spectrometry and infrared data.'
      ],
      ['Determine the number of distinct environments predicted by each candidate structure.','Use chemical shift, integration and n+1 splitting together rather than separately.','Cross-check the proposed structure against formula, IR and mass evidence.'],
      ['chemical shift','integration','spin–spin splitting','NMR spectrum'],
      'The number of hydrogen atoms represented by a signal comes from relative integration, not from peak height alone.',
      ['Interpret supplied 1H and 13C spectra and compare candidate structures.','Use reference chemical-shift tables and combined analytical data systematically.'],
      ['Use integration ratios and n+1 splitting to infer neighbouring protons.','Count distinct carbon and proton environments from molecular symmetry.'],
      ['Links to organic analysis, isomerism and structure determination.','Links to synthesis because spectra verify whether the intended product was formed.']
    ),
    '3.3.16':P(
      'How does chromatography separate mixtures and identify components quantitatively?',
      [
        'Chromatography separates components because they distribute differently between stationary and mobile phases.',
        'In thin-layer chromatography an Rf value compares distance moved by a solute with distance moved by the solvent front under the same conditions.',
        'Gas chromatography separates volatile components and retention times can support identification when compared under controlled conditions.',
        'Coupling chromatography with mass spectrometry improves identification by combining separation with structural/mass information.'
      ],
      ['Identify the stationary and mobile phases and the property causing different retention.','Calculate or compare Rf/retention data only under matching conditions.','Use multiple standards or MS evidence where necessary because one retention value alone may not prove identity.'],
      ['stationary phase','mobile phase','Rf value','retention time'],
      'Rf values are not universal constants; they depend on the stationary phase, solvent and experimental conditions.',
      ['Carry out TLC with a pencil baseline, small concentrated spots and a solvent level below the baseline.','Interpret gas-chromatography or GC–MS data from supplied chromatograms.'],
      ['Calculate Rf = distance travelled by solute / distance travelled by solvent front.','Use peak areas or calibration information to estimate composition where supplied.'],
      ['Links to amino-acid analysis, organic synthesis and product purity.','Links to mass spectrometry and NMR as part of combined analytical problem solving.']
    )
  });

  const get=ref=>window.ALEVEL_CHEMISTRY_DETAIL?.resolve(String(ref||''),profiles)||profiles[String(ref||'')]||null;
  const refs=Object.freeze(Object.keys(profiles));
  window.ALEVEL_CHEMISTRY_CONTENT=Object.freeze({
    version:'phase-6',
    count:refs.length,
    refs,
    get,
    all:profiles
  });
})();