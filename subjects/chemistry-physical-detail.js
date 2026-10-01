/* Original teaching explanations mapped to AQA 7405. Review sources are linked in chemistry-detail.js. */
(()=>{'use strict';
const rows=[];
const L=(ref,title,core,question,answer,precision)=>rows.push({ref,title,core,question,answer,precision});
L('3.1.1.1','Fundamental particles',[
'A proton has relative mass 1 and charge +1; a neutron has relative mass 1 and no charge. An electron has relative mass about 1/1836 and charge −1.',
'The nucleus contains protons and neutrons and almost all the atomic mass. Most atomic volume is occupied by the region containing electrons.',
'Atomic number Z counts protons; mass number A counts protons plus neutrons. Changing the electron count makes an ion, without changing the element.',
'For charge +x, electron number = Z − x; for charge −x, electron number = Z + x. Always include the ionic charge in particle calculations.'
],'Find the proton, neutron and electron numbers in ²⁷Al³⁺.',[
'Aluminium has Z = 13, so the nucleus contains 13 protons.',
'Neutrons = A − Z = 27 − 13 = 14.',
'The 3+ charge means three electrons have been lost: electrons = 13 − 3 = 10.',
'Check the net charge: 13 positive charges minus 10 negative charges gives 3+.'
],'Ion formation changes electrons, not the number of protons or neutrons.');
L('3.1.1.2','Isotopes and time-of-flight mass spectrometry',[
'Isotopes are atoms with equal proton numbers but different neutron numbers. Their chemical properties are almost identical because their electron configurations are the same.',
'In electron-impact ionisation an electron is removed: X(g) → X⁺(g) + e⁻. Electrospray normally forms [M + H]⁺ from molecules in a volatile solvent.',
'An electric field accelerates ions to equal kinetic energy, KE = ½mv². For ions with the same charge, heavier ions travel more slowly; t = d√(m/2KE).',
'Ion impacts produce a detector current. Flight time gives mass-to-charge ratio; the relative current measures relative abundance. Use kilograms for one ion in TOF calculations.'
],'Chlorine contains 75.0% ³⁵Cl and 25.0% ³⁷Cl. Calculate Ar and explain which singly charged ion arrives first.',[
'Ar = (35 × 75.0 + 37 × 25.0)/100 = 35.5; relative atomic mass has no unit.',
'The ions have equal kinetic energy and charge, so v = √(2KE/m).',
'³⁵Cl⁺ has smaller mass and therefore greater speed than ³⁷Cl⁺.',
'Over the same flight distance, ³⁵Cl⁺ has the shorter flight time and reaches the detector first.'
],'The isotopic abundance weights each mass; do not take the unweighted mean of the two isotope masses.');
L('3.1.1.3','Electron configurations and ionisation energies',[
'An orbital holds at most two electrons with opposite spins. The s, p and d subshells contain 1, 3 and 5 orbitals, holding 2, 6 and 10 electrons respectively.',
'For the first 36 elements use the usual filling order 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, with the chromium and copper exceptions.',
'Cr is [Ar]3d⁵4s¹ and Cu is [Ar]3d¹⁰4s¹. When transition-metal cations form, 4s electrons are removed before 3d electrons.',
'First ionisation energy is the energy needed to remove one mole of electrons from one mole of gaseous atoms to form one mole of gaseous 1+ ions. Large successive-ionisation jumps show removal from an inner shell.'
],'Write the configurations of Fe and Fe²⁺, and explain a large jump between a metal’s second and third ionisation energies.',[
'Fe has 26 electrons: [Ar]3d⁶4s².',
'Fe²⁺ loses the two 4s electrons first, giving [Ar]3d⁶.',
'A large jump after the second removal indicates that the third electron is removed from an inner shell, closer to the nucleus and less shielded.',
'The atom therefore has two outer-shell electrons; this evidence supports Group 2 for a main-group metal.'
],'The filling order does not mean that 3d electrons are removed before 4s electrons.');
L('3.1.2.1','Relative atomic and molecular masses',[
'Relative atomic mass is the weighted mean atomic mass compared with one twelfth of the mass of a carbon-12 atom. It is dimensionless.',
'Relative molecular mass is the sum of the relative atomic masses in a molecule. Use relative formula mass for a substance such as an ionic solid.',
'Isotope data must be weighted by fractional abundance or normalised by the total abundance, which need not be exactly 100 in supplied data.',
'Molar mass has the same numerical value as relative formula mass when expressed in g mol⁻¹, but these quantities have different definitions and units.'
],'A sample has isotope masses 10 and 11 in relative abundances 20 and 80. Find Ar and the formula mass of X₂O₃ using Ar(O) = 16.',[
'Weighted mean = (10 × 20 + 11 × 80)/(20 + 80) = 10.8.',
'X₂O₃ contains two X atoms and three oxygen atoms per formula unit.',
'Relative formula mass = 2(10.8) + 3(16) = 69.6, with no unit.',
'The corresponding molar mass is 69.6 g mol⁻¹.'
],'Relative mass is dimensionless; molar mass requires a mass-per-mole unit.');
L('3.1.2.2','Moles and the Avogadro constant',[
'One mole contains 6.022 × 10²³ specified entities. State whether the entities are atoms, molecules, ions or electrons.',
'Amount n = m/M; use compatible mass and molar-mass units. Particle number N = nNA.',
'For solutions c = n/V with V in dm³ when c is in mol dm⁻³. Convert cm³ to dm³ by dividing by 1000.',
'The formula specifies the number of each particle per formula unit: one mole of MgCl₂ contains one mole of Mg²⁺ and two moles of Cl⁻.'
],'How many chloride ions are present in 0.250 mol of MgCl₂?',[
'Each formula unit contains two chloride ions.',
'Amount of chloride ions = 2 × 0.250 = 0.500 mol.',
'N = 0.500 × 6.022 × 10²³ = 3.011 × 10²³ ions.',
'Report 3.01 × 10²³ chloride ions to three significant figures.'
],'A mole counts the specified entities; a mole of a compound need not contain one mole of each ion.');
L('3.1.2.3','The ideal gas equation',[
'pV = nRT relates pressure, gas volume, amount and absolute temperature for an ideal gas.',
'With R = 8.31 J mol⁻¹ K⁻¹, use p in Pa, V in m³ and T in K. Celsius temperature must be converted by adding 273.15.',
'1 dm³ = 10⁻³ m³ and 1 cm³ = 10⁻⁶ m³. Unit errors can change the answer by factors of 1000 or more.',
'The ideal model assumes negligible particle volume and intermolecular forces. Real gases depart more from ideal behaviour at high pressure and low temperature.'
],'Calculate the amount of gas occupying 250 cm³ at 100 kPa and 298 K, using R = 8.31 J mol⁻¹ K⁻¹.',[
'p = 100000 Pa and V = 250 × 10⁻⁶ = 2.50 × 10⁻⁴ m³.',
'Rearrange n = pV/(RT).',
'n = (100000 × 2.50 × 10⁻⁴)/(8.31 × 298) = 0.0101 mol.',
'The units and size are reasonable: the sample is much smaller than the volume of one mole at room conditions.'
],'Do not use pressure in kPa or volume in dm³ with R = 8.31 unless all units have been consistently converted.');
L('3.1.2.4','Empirical and molecular formulae',[
'The empirical formula gives the simplest whole-number atom ratio; the molecular formula gives the actual number of atoms in a molecule.',
'Convert each elemental mass or percentage to moles using its atomic mass, then divide every result by the smallest.',
'Multiply fractional ratios such as 1:1.5 by a common factor. Do not round 1.5 to 2.',
'The molecular multiplier is Mr/(empirical formula mass). It must be a positive whole number within the precision of the data.'
],'A compound contains 40.0% C, 6.67% H and 53.33% O and has Mr = 180. Find its formulae.',[
'For 100 g: n(C) = 40.0/12 = 3.33, n(H) = 6.67/1 = 6.67, n(O) = 53.33/16 = 3.33 mol.',
'Divide by 3.33 to obtain C:H:O = 1:2:1, so empirical formula = CH₂O.',
'Empirical formula mass = 12 + 2 + 16 = 30.',
'Multiplier = 180/30 = 6; molecular formula = C₆H₁₂O₆.'
],'A molecular formula cannot normally be found from percentage composition without additional molecular-mass information.');
L('3.1.2.5','Stoichiometry, titrations, yield and atom economy',[
'Balance atoms and charge before using a reaction. Coefficients give mole ratios; they do not give mass ratios.',
'For a limiting reagent, compare each reactant’s amount divided by its coefficient. The smallest ratio limits the reaction extent.',
'Percentage yield = actual product/theoretical product × 100. Atom economy = stoichiometric Mr of desired products/stoichiometric Mr of all products × 100.',
'For titrations, rinse the pipette with the solution it delivers and the burette with the titrant; rinse the conical flask with deionised water. Use concordant accurate titres and exclude the rough titre.'
],'25.0 cm³ NaOH is neutralised by 20.0 cm³ of 0.100 mol dm⁻³ H₂SO₄. Calculate the NaOH concentration.',[
'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O.',
'n(H₂SO₄) = 0.100 × 20.0/1000 = 0.00200 mol.',
'n(NaOH) = 2 × 0.00200 = 0.00400 mol.',
'c(NaOH) = 0.00400/(25.0/1000) = 0.160 mol dm⁻³.'
],'Atom economy is a theoretical property of the equation; percentage yield depends on the actual preparation.');
L('3.1.3.1','Ionic bonding',[
'Ionic bonding is the electrostatic attraction between oppositely charged ions in a giant lattice; electron transfer explains ion formation, not the attractive bond itself.',
'Attractions act in all directions. Many strong ionic attractions must be overcome to melt an ionic solid, so melting points are generally high.',
'In a solid the ions occupy fixed positions and cannot carry current through the material. When molten or dissolved, mobile ions carry charge.',
'Lattice strength depends on ionic charges and separation: higher charges and smaller ions usually give stronger attractions.'
],'Explain why sodium chloride does not conduct when solid but does conduct when molten.',[
'Sodium chloride has a giant lattice containing Na⁺ and Cl⁻.',
'The solid contains charged particles, but they cannot move through the lattice.',
'Melting disrupts the lattice sufficiently for the ions to move.',
'Mobile positive and negative ions carry charge to the electrodes; the conduction is not due to delocalised electrons.'
],'Having charged particles is insufficient for conduction: the charge carriers must be mobile.');
L('3.1.3.2','Covalent and dative covalent bonding',[
'A covalent bond is electrostatic attraction between a shared pair of electrons and the nuclei of the bonded atoms.',
'A dative covalent bond contains a pair originally donated by one atom. The donation arrow points from the lone-pair donor to the acceptor.',
'A lone pair on nitrogen in NH₃ can bond to H⁺, forming NH₄⁺. After formation the four N–H bonds are equivalent.',
'Coordinate bonds also form between ligand lone pairs and a metal ion. Count donated electron pairs when determining coordination number.'
],'Describe the formation of NH₄⁺ from NH₃ and H⁺, including the origin of the bonding electrons.',[
'Nitrogen in ammonia has one lone pair.',
'H⁺ can accept an electron pair and brings no electron to the new bond.',
'The nitrogen lone pair is donated to H⁺; show an arrow from N to H when indicating the dative bond.',
'The resulting ammonium ion has four bonding pairs and no nitrogen lone pair, giving a tetrahedral shape.'
],'A dative bond is not inherently weaker simply because both electrons were donated by the same atom.');
L('3.1.3.3','Metallic bonding',[
'Metallic bonding is attraction between positive metal ions and delocalised electrons throughout a giant lattice.',
'Delocalised electrons are mobile and carry current in both solid and liquid metals; they also transfer thermal energy.',
'Metal layers can slide while attraction to the electron sea persists, explaining malleability rather than brittleness.',
'Across Na, Mg and Al the greater ionic charge, more delocalised electrons and smaller ionic size generally strengthen metallic bonding.'
],'Explain why magnesium generally has stronger metallic bonding than sodium.',[
'Magnesium contributes two outer electrons per atom to the delocalised system; sodium contributes one.',
'Mg²⁺ has greater charge than Na⁺.',
'Mg²⁺ is also smaller, so attraction between the positive ions and the delocalised electrons is stronger.',
'More energy is required to overcome these attractions when magnesium melts.'
],'Metallic bonding involves positive ions attracted to electrons, not positive ions attracted to each other.');
L('3.1.3.4','Structures and physical properties',[
'Ionic, metallic, giant covalent and molecular structures must be distinguished; the particles and the bonds overcome during melting differ.',
'Diamond has four covalent bonds per carbon in a three-dimensional lattice. Graphite has three bonds per carbon in layers and delocalised electrons.',
'Iodine contains I₂ molecules with London attractions between molecules. Ice contains water molecules in an open hydrogen-bonded lattice.',
'Explain melting and conductivity separately: strong bonds affect melting, while mobile ions or delocalised electrons are required for electrical conduction.'
],'Compare the electrical conductivity and melting behaviour of diamond, graphite and iodine.',[
'Diamond has strong covalent bonds throughout its lattice and no mobile electrons: high melting point, no electrical conductivity.',
'Graphite also has strong covalent bonds within extended layers, giving a high melting point.',
'Graphite’s delocalised electrons move along layers, allowing electrical conduction.',
'Iodine melts at a much lower temperature because intermolecular London attractions are overcome; I₂ molecules have no mobile charge carriers.'
],'Boiling a molecular substance usually overcomes intermolecular forces, not the covalent bonds within its molecules.');
L('3.1.3.5','Molecular shapes and bond angles',[
'Count electron-pair regions around the central atom; a multiple bond counts as one region for the shape model.',
'Two, three, four, five and six bonding regions give linear, trigonal planar, tetrahedral, trigonal bipyramidal and octahedral arrangements.',
'Lone pairs repel more strongly: lone pair–lone pair > lone pair–bond pair > bond pair–bond pair.',
'CH₄ is tetrahedral, 109.5°; NH₃ is pyramidal, about 107°; H₂O is bent, about 104.5°. Molecular shape names describe atom positions, not the lone pairs.'
],'Explain the different bond angles of CH₄, NH₃ and H₂O.',[
'All three have four electron-pair regions around the central atom.',
'CH₄ has four bonding pairs, which minimise repulsion at 109.5°.',
'NH₃ has one lone pair: greater lone pair–bond pair repulsion compresses the H–N–H angle to about 107°.',
'H₂O has two lone pairs and greater compression, giving about 104.5°.'
],'Four electron regions do not always give a tetrahedral molecular shape: lone pairs alter the arrangement of the atoms.');
L('3.1.3.6','Electronegativity and molecular polarity',[
'Electronegativity is the ability of an atom to attract the bonding pair of electrons in a covalent bond.',
'An electronegativity difference creates an unequal electron distribution and partial charges δ+ and δ−.',
'The molecular dipole depends on the vector sum of bond dipoles. Symmetrical identical polar bonds may cancel.',
'CO₂ has polar C=O bonds but no permanent dipole because it is linear; H₂O is polar because its bent geometry prevents cancellation.'
],'Why is CO₂ non-polar while H₂O is polar?',[
'Oxygen is more electronegative than carbon or hydrogen, so the bonds in both molecules are polar.',
'CO₂ is linear with two equal C=O bond dipoles pointing in opposite directions.',
'These dipoles cancel, giving no permanent molecular dipole.',
'H₂O is bent; its O–H dipoles do not cancel, so the molecule has a permanent dipole.'
],'The presence of a polar bond alone does not establish that a whole molecule is polar.');
L('3.1.3.7','Intermolecular forces and hydrogen bonding',[
'London forces arise from instantaneous and induced dipoles and occur between all atoms and molecules. They tend to increase with electron number and contact area.',
'Permanent dipole–dipole attractions occur between polar molecules. London forces remain present as well.',
'Hydrogen bonding requires a hydrogen covalently bonded to N, O or F interacting with a lone pair on N, O or F in another molecule.',
'Ice has an open hydrogen-bonded arrangement and lower density than liquid water. Melting or boiling changes intermolecular arrangements rather than breaking O–H covalent bonds.'
],'Explain why ethanol boils at a higher temperature than a similar-sized alkane.',[
'Ethanol’s O–H group permits hydrogen bonding between its molecules.',
'A similar-sized alkane has London forces but cannot form hydrogen bonds with itself.',
'The additional strong intermolecular attractions in ethanol require more energy to overcome.',
'The comparison controls approximate size; for very different molecular sizes London forces can change the overall ranking.'
],'Do not claim that hydrogen bonding always outweighs London forces regardless of molecular size.');
L('3.1.4.1','Standard enthalpy changes',[
'Enthalpy change is heat transferred at constant pressure. Exothermic reactions have ΔH < 0; endothermic reactions have ΔH > 0.',
'Standard conditions specify 100 kPa and a stated temperature, commonly 298 K; substances are in their standard states.',
'Standard formation enthalpy refers to forming one mole of a compound from its elements in their standard states.',
'Standard combustion enthalpy refers to complete combustion of one mole of a substance in oxygen. Include correct state symbols and fractional coefficients where required.'
],'Write the standard formation equation for liquid ethanol.',[
'Use the elements in their standard states: carbon as graphite, hydrogen as H₂(g), oxygen as O₂(g).',
'Form exactly one mole of C₂H₅OH(l).',
'The equation is 2C(s, graphite) + 3H₂(g) + ½O₂(g) → C₂H₅OH(l).',
'The coefficient of ethanol must remain 1 because the definition is per mole formed.'
],'Standard conditions are not the same as a universal requirement of 0 °C; the temperature must be stated.');
L('3.1.4.2','Calorimetry and molar enthalpy',[
'q = mcΔT gives the energy transferred to the measured material. The solution mass is not necessarily the mass of the limiting reagent.',
'Convert q from joules to kilojoules before reporting ΔH in kJ mol⁻¹. For a warming solution, the reaction has released heat, so ΔH is negative.',
'Use the amount of reaction defined by the equation, determined from the limiting reagent. ΔH = −q/n for an exothermic reaction warming the surroundings.',
'Heat loss and ignoring the apparatus heat capacity usually underestimate the magnitude of an exothermic enthalpy. Insulation and extrapolation of a temperature–time graph reduce specific errors.'
],'50.0 g of solution warms by 6.00 K when 0.0200 mol reacts. Use c = 4.18 J g⁻¹ K⁻¹ to find ΔH.',[
'q = 50.0 × 4.18 × 6.00 = 1254 J transferred to the solution.',
'q = 1.254 kJ.',
'The reaction is exothermic because the solution warms: ΔH = −1.254/0.0200.',
'ΔH = −62.7 kJ mol⁻¹, assuming no heat loss and the stated heat capacity.'
],'A rise in solution temperature means the reaction’s enthalpy change is negative.');
L('3.1.4.3','Hess cycles',[
'Hess’s law states that total enthalpy change depends only on initial and final states, not on the route.',
'Reverse an equation and reverse its ΔH sign. Multiply an equation’s coefficients and multiply ΔH by the same factor.',
'With formation data, ΔHreaction = ΣνΔHf(products) − ΣνΔHf(reactants). Standard formation enthalpy of an element in its standard state is zero.',
'With combustion data, reactants and products reach the same combustion products, so ΔHreaction = ΣνΔHc(reactants) − ΣνΔHc(products).'
],'For CO(g) + ½O₂(g) → CO₂(g), use ΔHf(CO) = −111 and ΔHf(CO₂) = −394 kJ mol⁻¹.',[
'Identify one mole of each carbon-containing species in the equation.',
'O₂(g) is an element in its standard state, so its ΔHf is zero.',
'ΔH = −394 − [−111 + ½(0)] = −283 kJ mol⁻¹.',
'The negative sign agrees with the combustion of carbon monoxide being exothermic.'
],'Formation and combustion routes use different subtraction orders; justify signs using the cycle rather than memorising one universal rule.');
L('3.1.4.4','Mean bond enthalpies',[
'Mean bond enthalpy is the mean enthalpy needed to break one mole of a specified covalent bond in gaseous molecules, averaged across compounds.',
'Bond breaking requires energy; bond formation releases energy. ΔH ≈ ΣE(bonds broken) − ΣE(bonds formed).',
'Count every bond and include stoichiometric coefficients. A double bond has its own bond-enthalpy value, not twice the single-bond value.',
'The calculation is approximate because bond energies depend on the chemical environment and the data are gas-phase averages; phase changes may also matter.'
],'Estimate ΔH for H₂(g) + Cl₂(g) → 2HCl(g), using H–H 436, Cl–Cl 242 and H–Cl 431 kJ mol⁻¹.',[
'Break one H–H and one Cl–Cl bond: 436 + 242 = 678 kJ mol⁻¹.',
'Form two H–Cl bonds, releasing 2 × 431 = 862 kJ mol⁻¹.',
'ΔH ≈ 678 − 862 = −184 kJ mol⁻¹.',
'The negative result means the energy released on forming bonds exceeds the energy required to break them.'
],'Breaking bonds is never the energy-releasing step in a bond-enthalpy calculation.');
L('3.1.5.1','Collision theory and activation energy',[
'Reaction requires collisions with sufficient energy to overcome the activation barrier and, where relevant, a suitable orientation.',
'Activation energy is the minimum energy required for reaction through the stated pathway.',
'Collision frequency alone does not determine rate: many collisions are unsuccessful.',
'A rate explanation must identify whether a change affects collision frequency, the fraction with enough energy, or the reaction pathway.'
],'Why do not all collisions between reacting particles lead to reaction?',[
'Particles have a distribution of energies rather than a single energy.',
'Many collisions have less energy than the activation energy, so the required bond rearrangement cannot occur.',
'For molecular reactions, the collision may also have an unsuitable orientation.',
'Only collisions meeting the relevant energy and orientation requirements contribute to product formation.'
],'Frequency of collisions and frequency of successful collisions are different quantities.');
L('3.1.5.2','Maxwell–Boltzmann distributions',[
'Plot number or fraction of molecules against energy. The curve starts at the origin, rises to a peak and approaches the energy axis without a sharp maximum cutoff.',
'The area under the curve represents the total number of molecules; for a fixed sample it remains the same when temperature changes.',
'At higher temperature the peak is lower and moves to greater energy. The area beyond a fixed Ea increases.',
'The peak is the most probable energy, not the mean energy. A catalyst changes the activation threshold, not the distribution at a fixed temperature.'
],'Describe the changes to a Maxwell–Boltzmann curve when the same gas sample is warmed.',[
'Draw a lower, broader peak displaced to the right.',
'Keep the total area under the distribution unchanged because the number of molecules is unchanged.',
'Keep the activation-energy line fixed for the same uncatalysed reaction.',
'A larger area lies to the right of Ea, so a larger fraction of collisions can be successful.'
],'Do not increase the total area merely because the molecules have greater average energy.');
L('3.1.5.3','Temperature and reaction rate',[
'Increasing temperature increases mean kinetic energy and changes the molecular-energy distribution.',
'The fraction of particles with energy ≥ Ea rises substantially; this is the main reason a small temperature rise can produce a large rate increase.',
'Faster particles also collide somewhat more frequently, but this is a smaller contribution than the change in successful-collision fraction.',
'In a temperature investigation, control concentrations, volumes and the endpoint. Equilibrate reagents in a water bath before mixing.'
],'Explain why a small temperature increase can greatly increase the rate of a reaction.',[
'At the higher temperature the energy distribution extends further toward high energies.',
'The area beyond the unchanged Ea is much larger.',
'A larger proportion of collisions therefore has enough energy to react.',
'Successful collisions per second increase substantially; simply saying that particles move faster is incomplete.'
],'Temperature increases the fraction exceeding Ea; it does not lower Ea for the same reaction pathway.');
L('3.1.5.4','Concentration, gas pressure and reaction rate',[
'Increasing solution concentration places more reacting particles in each unit volume.',
'Increasing gas pressure by compressing reacting gases increases their concentration and collision frequency.',
'At fixed temperature the energy distribution and fraction above Ea remain unchanged.',
'A concentration explanation uses more frequent successful collisions, not a higher energy per collision. Inert-gas pressure changes must be analysed using the actual reacting-gas concentrations.'
],'Explain why compressing a reacting gas mixture at constant temperature usually increases the collision rate.',[
'The same number of reacting molecules occupies a smaller volume.',
'There are more reacting molecules per unit volume and shorter average distances between them.',
'Collisions occur more frequently, while the fraction with sufficient energy is unchanged.',
'Consequently, the number of successful collisions per second increases.'
],'A rise in total pressure caused only by adding an inert gas at fixed volume need not increase reacting-gas concentrations.');
L('3.1.5.5','Catalysts and reaction pathways',[
'A catalyst increases reaction rate and is regenerated overall; it may take part in intermediate steps.',
'It offers an alternative route with lower activation energy. At fixed temperature more collisions exceed the lower threshold.',
'The catalyst does not change ΔH, the equilibrium constant or the equilibrium composition at a fixed temperature.',
'Both forward and reverse rates increase, so equilibrium is reached sooner. Heterogeneous catalysts may work through adsorption at active surface sites.'
],'Explain why a catalyst increases the rate but does not increase the equilibrium yield.',[
'The catalysed route has a lower activation barrier.',
'At the same temperature more particles have sufficient energy for this route.',
'The catalyst accelerates both directions of the reversible reaction.',
'The relative equilibrium amounts are still determined by thermodynamics and K at that temperature, so the equilibrium yield is unchanged.'
],'A catalyst changes the pathway, not the energy distribution of the reacting molecules.');
L('3.1.6.1','Dynamic equilibrium and industrial compromises',[
'Dynamic equilibrium requires a closed system. Forward and reverse reactions continue at equal rates, keeping concentrations constant.',
'Increasing a reactant concentration favours its consumption. Increasing pressure by compression favours the side with fewer gas moles.',
'Increasing temperature favours the endothermic direction. A catalyst changes the time to equilibrium but not its position.',
'Industrial conditions balance equilibrium yield, rate, energy use, pressure-equipment cost and safety; a maximum theoretical yield is not necessarily the most economical choice.'
],'For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH < 0, explain the effects of temperature, pressure and an iron catalyst.',[
'Higher pressure favours ammonia because gas moles decrease from four to two.',
'Lower temperature favours the exothermic forward reaction and a higher equilibrium yield.',
'A low temperature gives a slow reaction, so an intermediate operating temperature is used as a compromise.',
'Iron increases the rate of reaching equilibrium without changing the equilibrium yield.'
],'Equal forward and reverse rates do not imply equal reactant and product concentrations.');
L('3.1.6.2','Kc expressions and equilibrium calculations',[
'For aA + bB ⇌ cC + dD in a homogeneous system, Kc = [C]ᶜ[D]ᵈ/[A]ᵃ[B]ᵇ using equilibrium concentrations.',
'First convert equilibrium amounts into concentrations with the equilibrium volume; initial concentrations cannot be substituted directly unless unchanged.',
'Derive units from the expression. The same reaction can have a different numerical constant if its written equation is reversed or rescaled.',
'For a fixed equation Kc depends on temperature, not concentration changes or a catalyst. A temperature rise decreases Kc for an exothermic forward reaction.'
],'For H₂ + I₂ ⇌ 2HI, equilibrium concentrations are 0.200, 0.100 and 0.600 mol dm⁻³ respectively. Calculate Kc.',[
'Kc = [HI]²/([H₂][I₂]).',
'Substitute equilibrium values: Kc = 0.600²/(0.200 × 0.100).',
'Kc = 18.0.',
'Concentration powers cancel, so Kc has no units for this equation. It favours products but does not imply complete conversion.'
],'A disturbance may change equilibrium composition while leaving Kc unchanged at the same temperature.');
L('3.1.7','Oxidation states and redox equations',[
'Oxidation is electron loss and an increase in oxidation state; reduction is electron gain and a decrease in oxidation state.',
'An oxidising agent accepts electrons and is itself reduced. A reducing agent donates electrons and is oxidised.',
'Oxidation states sum to the overall charge. Oxygen is usually −2 and hydrogen usually +1, with stated exceptions such as peroxides and metal hydrides.',
'Balance a half-equation using H₂O for oxygen, H⁺ for hydrogen in acid, and electrons for charge. Multiply half-equations to cancel electron numbers before adding.'
],'Balance reduction of MnO₄⁻ to Mn²⁺ in acid and combine it with oxidation of Fe²⁺.',[
'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O; atoms and total charge are balanced.',
'Fe²⁺ → Fe³⁺ + e⁻; multiply by five.',
'Overall: MnO₄⁻ + 8H⁺ + 5Fe²⁺ → Mn²⁺ + 4H₂O + 5Fe³⁺.',
'Mn changes from +7 to +2 and is reduced; Fe changes from +2 to +3 and is oxidised.'
],'Electrons belong in half-equations but must cancel from the overall redox equation.');
L('3.1.8.1','Born–Haber, lattice and solution cycles',[
'A Born–Haber cycle connects formation of an ionic solid with atomisation, ionisation, electron affinity and lattice formation. Define every step for one mole and with correct states.',
'Lattice formation enthalpy is for gaseous ions forming one mole of solid and is negative; lattice dissociation is its positive reverse.',
'ΔHsolution = ΔHlattice dissociation + ΣΔHhydration. Hydration forms aqueous ions from gaseous ions and is normally exothermic.',
'Greater ionic charge and smaller radii increase ionic-model lattice attraction. A more exothermic Born–Haber lattice value than the perfect ionic model suggests additional covalent character from polarisation.'
],'For NaCl, ΔHf = −411, atomisation Na = +108, IE₁ = +496, ½Cl₂ dissociation = +121 and EA₁ = −349 kJ mol⁻¹. Find lattice formation enthalpy.',[
'The gaseous-ion preparation total is 108 + 496 + 121 − 349 = +376 kJ mol⁻¹.',
'Hess’s law gives −411 = 376 + ΔHlattice formation.',
'ΔHlattice formation = −787 kJ mol⁻¹.',
'The reverse lattice dissociation value is +787 kJ mol⁻¹. Do not double chlorine’s atomisation value again.'
],'Keep lattice formation and lattice dissociation conventions separate; changing the convention changes the sign.');
L('3.1.8.2','Entropy, Gibbs energy and feasibility',[
'Entropy measures the dispersal of energy among accessible arrangements; gas production and increased gas moles often increase entropy.',
'ΔS = ΣνS(products) − ΣνS(reactants), using stoichiometric coefficients. Units are commonly J K⁻¹ mol⁻¹.',
'ΔG = ΔH − TΔS, with T in kelvin and consistent energy units. Negative ΔG indicates thermodynamic feasibility; ΔG = 0 is the equilibrium boundary.',
'Feasibility does not establish a useful reaction rate. A feasible reaction may still have a large activation barrier; a catalyst affects that barrier, not ΔG.'
],'A reaction has ΔH = +50.0 kJ mol⁻¹ and ΔS = +100 J K⁻¹ mol⁻¹. Find ΔG at 298 K and the threshold temperature.',[
'Convert ΔS to 0.100 kJ K⁻¹ mol⁻¹.',
'ΔG298 = 50.0 − 298(0.100) = +20.2 kJ mol⁻¹, so the forward reaction is not thermodynamically feasible under those conditions.',
'At ΔG = 0, T = ΔH/ΔS = 50.0/0.100 = 500 K.',
'With these values treated as constant, ΔG is negative above 500 K; at 500 K it is the equilibrium boundary.'
],'Never subtract TΔS in joules from ΔH in kilojoules.');
L('3.1.9.1','Rate equations and the Arrhenius equation',[
'Rate = k[A]ᵐ[B]ⁿ; orders are obtained experimentally and need not match overall equation coefficients. Overall order is m + n.',
'Find k by substituting a measured rate and concentrations. Derive its units from the rate equation rather than assuming s⁻¹.',
'k = Ae^(−Ea/RT), with Ea in J mol⁻¹, T in K and R in J mol⁻¹ K⁻¹. Temperature changes k.',
'ln k = −Ea/(RT) + ln A. A graph of ln k against 1/T has gradient −Ea/R and intercept ln A; ln is the natural logarithm.'
],'For rate = k[A][B]², rate = 0.0240 mol dm⁻³ s⁻¹, [A] = 0.200 and [B] = 0.100 mol dm⁻³. Find k and units.',[
'k = rate/([A][B]²).',
'k = 0.0240/(0.200 × 0.100²) = 12.0.',
'Units = (mol dm⁻³ s⁻¹)/(mol³ dm⁻⁹) = dm⁶ mol⁻² s⁻¹.',
'The overall order is three. A temperature change requires a new value of k, not a new order inferred from the balanced equation.'
],'Orders are experimental quantities, not the stoichiometric coefficients of the overall reaction.');
L('3.1.9.2','Determining orders and mechanisms',[
'Compare initial-rate experiments where only one reactant concentration changes; the rate ratio equals the concentration ratio raised to that reactant’s order.',
'A linear concentration–time graph indicates zero order; a constant half-life indicates first order. Distinguish graphs of concentration against time from rate against concentration.',
'A rate-determining step is the slow step in a proposed mechanism. The experimental rate equation can support or rule out a mechanism, but does not normally prove one uniquely.',
'Continuous monitoring can use a gas syringe, balance or colorimeter; initial-rate methods compare early gradients or an appropriately controlled fixed endpoint.'
],'Doubling [A] with [B] fixed quadruples the initial rate; doubling [B] with [A] fixed has no effect. Determine the rate equation.',[
'For A, 4 = 2ᵐ, so m = 2.',
'For B, 1 = 2ⁿ, so n = 0.',
'Rate = k[A]²[B]⁰ = k[A]²; overall order is two.',
'B may still participate in the overall reaction or a fast step; zero order does not mean B is chemically absent.'
],'A zero-order reactant can be essential to the reaction while its concentration does not control rate over the studied range.');
L('3.1.10','Partial pressures and Kp',[
'For an ideal gas mixture, partial pressure pX = mole fraction X × total pressure; mole fraction is nX/ntotal.',
'Construct Kp using equilibrium partial pressures raised to the gas coefficients. Use the same pressure unit throughout and derive Kp units from the expression.',
'A pressure change alters equilibrium composition but not Kp at fixed temperature. Temperature changes Kp according to the reaction’s enthalpy direction.',
'Before calculating, use the balanced equation to find equilibrium amounts and total gas moles. Never substitute total pressure for each species’ partial pressure.'
],'For N₂ + 3H₂ ⇌ 2NH₃, an equilibrium mixture contains 1, 3 and 2 mol respectively at 600 kPa. Find Kp.',[
'Total amount = 6 mol. Partial pressures are N₂ = 100, H₂ = 300 and NH₃ = 200 kPa.',
'Kp = p(NH₃)²/[p(N₂)p(H₂)³].',
'Kp = 200²/(100 × 300³) = 1.48 × 10⁻⁵.',
'Units are kPa²/kPa⁴ = kPa⁻². Using Pa would give a different numerical value and unit.'
],'The numerical value of a dimensional Kp depends on the pressure unit chosen.');
L('3.1.11.1','Electrode potentials and electrochemical cells',[
'Standard electrode potentials are reduction potentials measured relative to the standard hydrogen electrode at 100 kPa, 298 K and 1.00 mol dm⁻³ solutions.',
'The standard hydrogen electrode uses platinum, H₂ and H⁺. A platinum electrode also provides an inert conductor when a half-cell has no conducting solid.',
'E°cell = E°reduction at positive electrode − E°reduction at negative electrode. Reverse the negative half-equation to show oxidation; never multiply E° by a balancing coefficient.',
'A positive calculated E°cell predicts thermodynamic feasibility under standard conditions. Kinetic barriers and non-standard concentrations can change observed behaviour; a salt bridge completes the ionic circuit.'
],'E°(Cu²⁺/Cu) = +0.34 V and E°(Zn²⁺/Zn) = −0.76 V. Find the cell potential and overall equation.',[
'Copper has the more positive reduction potential and is reduced at the positive electrode.',
'Zinc is oxidised: Zn → Zn²⁺ + 2e⁻.',
'E°cell = 0.34 − (−0.76) = +1.10 V.',
'Overall: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s); electrons travel in the external circuit from zinc to copper.'
],'The salt bridge carries ions, not the electrons flowing through the external wire.');
L('3.1.11.2','Batteries and fuel cells',[
'Primary cells are used until their reactants are depleted; rechargeable cells use an external supply to reverse the chemical changes.',
'Fuel cells receive fuel and oxidant continuously rather than storing a fixed quantity of all reactants inside the cell.',
'For a hydrogen–oxygen fuel cell the overall reaction is 2H₂ + O₂ → 2H₂O. Write half-equations appropriate to the acidic or alkaline electrolyte given.',
'Assess energy efficiency, operating cost, storage, durability and environmental effects. Water at the point of use does not imply zero emissions over fuel production and transport.'
],'Write the half-equations for a hydrogen–oxygen fuel cell with an acidic electrolyte, and give one lifecycle limitation.',[
'At the negative electrode: 2H₂ → 4H⁺ + 4e⁻.',
'At the positive electrode: O₂ + 4H⁺ + 4e⁻ → 2H₂O.',
'Adding cancels protons and electrons, leaving 2H₂ + O₂ → 2H₂O.',
'Hydrogen production may consume fossil fuels or carbon-intensive electricity, so assess the whole production route as well as local emissions.'
],'Fuel cells are not automatically carbon-neutral merely because their operating product is water.');
L('3.1.12.1','Brønsted–Lowry acids and bases',[
'A Brønsted–Lowry acid donates H⁺; a base accepts H⁺. Water can act as either depending on its reaction partner.',
'A conjugate acid–base pair differs by exactly one proton. Identify pairs on opposite sides of the proton-transfer equation.',
'Strong acids ionise essentially completely in water; weak acids establish an equilibrium. Strength is not the same as concentration.',
'For HA + H₂O ⇌ H₃O⁺ + A⁻, HA/A⁻ and H₃O⁺/H₂O are conjugate pairs; H⁺(aq) is a common shorthand for hydrated protons.'
],'Identify the conjugate pairs in NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.',[
'NH₃ accepts H⁺ and is the base; NH₄⁺ is its conjugate acid.',
'H₂O donates H⁺ and is the acid; OH⁻ is its conjugate base.',
'The pairs are NH₄⁺/NH₃ and H₂O/OH⁻.',
'Each pair differs by one H⁺, including the corresponding change in charge.'
],'A dilute strong acid and a concentrated weak acid cannot be ranked by concentration alone.');
L('3.1.12.2','pH of strong acids',[
'pH = −log₁₀[H⁺]; conversely [H⁺] = 10^(−pH), with concentration in mol dm⁻³.',
'For a strong monoprotic acid, [H⁺] ≈ its analytical concentration provided water’s contribution is negligible.',
'For neutralisation mixtures, use stoichiometry first to find excess acid or base, then divide by the total mixed volume.',
'A tenfold increase in [H⁺] lowers pH by one. pH is logarithmic and has no unit; distinguish it from an arithmetic measure of acidity.'
],'Calculate the pH of 0.00500 mol dm⁻³ HCl, treated as fully dissociated.',[
'HCl is monoprotic, so [H⁺] = 0.00500 mol dm⁻³.',
'pH = −log₁₀(0.00500).',
'pH = 2.301, usually reported as 2.30 to an appropriate precision.',
'The result is greater than the pH of 0.0500 mol dm⁻³ HCl by exactly one pH unit.'
],'At extremely low acid concentrations water ionisation matters, so [H⁺] is not simply the added acid concentration.');
L('3.1.12.3','Kw and strong-base calculations',[
'Kw = [H⁺][OH⁻]; at 298 K Kw ≈ 1.00 × 10⁻¹⁴ mol² dm⁻⁶. This equilibrium constant links hydrogen-ion and hydroxide-ion concentrations in aqueous solution.',
'For a strong base first find [OH⁻], including how many hydroxide ions the formula supplies, then use [H⁺] = Kw/[OH⁻].',
'Neutrality means [H⁺] = [OH⁻], so [H⁺] = √Kw. Neutral pH is 7.00 at 298 K but changes with temperature.',
'Water ionisation is endothermic. Increasing temperature increases Kw and lowers neutral pH without making pure water acidic relative to its neutral point.'
],'Find the pH of 0.0200 mol dm⁻³ NaOH at 298 K using Kw = 1.00 × 10⁻¹⁴.',[
'NaOH provides one OH⁻ per formula unit, so [OH⁻] = 0.0200 mol dm⁻³.',
'[H⁺] = 1.00 × 10⁻¹⁴/0.0200 = 5.00 × 10⁻¹³ mol dm⁻³.',
'pH = −log₁₀(5.00 × 10⁻¹³) = 12.30.',
'This assumes the stated temperature and complete dissociation.'
],'Neutral pH is not always 7; use the Kw value for the stated temperature.');
L('3.1.12.4','Weak acids, Ka and pKa',[
'For HA ⇌ H⁺ + A⁻, Ka = [H⁺][A⁻]/[HA] and pKa = −log₁₀Ka. Greater Ka and lower pKa mean a stronger acid.',
'For an isolated weak acid of initial concentration c, set [H⁺] = [A⁻] = x and [HA] = c − x, so Ka = x²/(c − x).',
'If x is small compared with c and water ionisation is negligible, x ≈ √(Kac). Check the approximation after calculating x.',
'If dissociation is not small, solve the quadratic or use the full equilibrium expression rather than forcing the weak-acid approximation.'
],'Calculate the pH of 0.100 mol dm⁻³ HA with Ka = 1.80 × 10⁻⁵ mol dm⁻³.',[
'Using small dissociation, [H⁺] ≈ √(1.80 × 10⁻⁵ × 0.100) = 1.34 × 10⁻³ mol dm⁻³.',
'pH ≈ −log₁₀(1.34 × 10⁻³) = 2.87.',
'Dissociation is about (0.00134/0.100) × 100 = 1.34%, supporting the approximation.',
'The exact quadratic gives a very similar pH; record the approximation used.'
],'Weak does not mean dilute, and Ka is not equal to the initial acid concentration.');
L('3.1.12.5','Titration curves and indicator choice',[
'A pH curve plots pH against added titrant volume. The equivalence point is the stoichiometric completion point, not necessarily pH 7.',
'Strong acid–strong base titrations have a large steep region around equivalence. Weak acid–strong base equivalence is above pH 7; strong acid–weak base equivalence is below pH 7.',
'Choose an indicator whose transition range lies within the steep pH change. Weak acid–weak base curves do not normally provide a sharp indicator endpoint.',
'A calibrated pH meter and smaller volume increments near equivalence resolve the curve. At half-neutralisation of a weak acid by strong base, pH = pKa under the usual approximation.'
],'Choose between methyl orange (pH 3.1–4.4) and phenolphthalein (pH 8.2–10.0) for a typical ethanoic acid–NaOH titration.',[
'Ethanoic acid is weak and NaOH is strong; equivalence is on the alkaline side.',
'The steep part of a typical curve includes phenolphthalein’s transition range.',
'Choose phenolphthalein; methyl orange would normally change before stoichiometric equivalence.',
'For supplied experimental curves, use the actual steep interval rather than only the acid/base labels.'
],'The indicator endpoint approximates equivalence; it is not the definition of the equivalence point.');
L('3.1.12.6','Buffer action and buffer pH',[
'An acidic buffer contains a weak acid HA and a significant amount of its conjugate base A⁻, often supplied by a soluble salt.',
'Added acid is removed by A⁻ + H⁺ → HA; added alkali is removed by HA + OH⁻ → A⁻ + H₂O. The composition changes but pH changes only slightly for small additions.',
'From Ka, [H⁺] ≈ Ka[HA]/[A⁻], or pH = pKa + log₁₀([A⁻]/[HA]), using equilibrium concentrations and appropriate approximations.',
'After adding a reacting acid or base, do stoichiometry first and use the remaining acid/base ratio. Buffer capacity is finite and improves with larger available amounts.'
],'A buffer contains 0.100 mol HA and 0.100 mol A⁻. Ka = 1.80 × 10⁻⁵. Find pH after adding 0.0100 mol HCl with negligible volume change.',[
'H⁺ reacts with A⁻: the remaining amounts are A⁻ = 0.0900 mol and HA = 0.110 mol.',
'Because both occupy the same volume, [HA]/[A⁻] = 0.110/0.0900.',
'[H⁺] ≈ 1.80 × 10⁻⁵ × (0.110/0.0900) = 2.20 × 10⁻⁵ mol dm⁻³.',
'pH ≈ 4.66, compared with the initial pKa ≈ 4.74: a small decrease, not zero change.'
],'A buffer resists a small pH change; it neither keeps pH exactly constant nor has unlimited capacity.');
window.ALEVEL_CHEMISTRY_DETAIL_ROWS=[...(window.ALEVEL_CHEMISTRY_DETAIL_ROWS||[]),...rows];
})();
