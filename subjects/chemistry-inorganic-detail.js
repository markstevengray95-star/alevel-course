/* Original worked teaching material. Specification mapping: AQA 7405, section 3.2. */
(()=>{'use strict';const rows=[];const L=(ref,title,core,question,answer,precision)=>rows.push({ref,title,core,question,answer,precision});
L('3.2.1.1','Classification and electron blocks',[
'Elements are arranged by increasing proton number. A period corresponds to filling a principal energy level; similar outer-electron arrangements produce recurring chemical behaviour.',
'The s, p, d and f blocks describe the subshell being filled. Group 1 and 2 are s block; the main right-hand groups are p block. Helium has a filled 1s subshell but is placed with the noble gases.',
'Write the electron configuration before classifying an element. Sodium is [Ne]3s¹; chlorine is [Ne]3s²3p⁵; iron is [Ar]3d⁶4s².',
'A d-block element is not automatically a transition element. The A-level transition definition requires an ion with an incomplete d subshell; zinc forms Zn²⁺ with 3d¹⁰.'
],'Classify Na, Cl and Zn by electron block and explain why Zn is not a transition element.',[
'Na ends in 3s¹ and belongs to the s block; its outer electron is in an s subshell.',
'Cl ends in 3p⁵ and belongs to the p block; its valence shell contains seven electrons.',
'Zn has [Ar]3d¹⁰4s² and lies in the d block. In Zn²⁺ the two 4s electrons are removed.',
'Zn²⁺ retains a full 3d¹⁰ subshell, so zinc does not meet the transition-element definition used at A-level.'
],'Periodic-table position and the transition-element definition are different classifications.');
L('3.2.1.2','Period 3 physical-property trends',[
'Across Na–Ar, proton number increases while added electrons enter the same principal shell. Similar shielding and greater nuclear charge give stronger attraction and a generally smaller atomic radius.',
'First ionisation energy generally rises across the period. Al is lower than Mg because its removed electron is in higher-energy 3p; S is lower than P because paired-electron repulsion makes removal easier.',
'Na, Mg and Al are metallic: more delocalised electrons and greater ionic charge strengthen metallic bonding. Silicon has a giant covalent network requiring many covalent bonds to be broken on melting.',
'P₄, S₈ and Cl₂ are simple molecules; Ar is monatomic. Their melting points depend on London forces, rather than breaking the covalent bonds within each molecule.'
],'Explain why sulfur has a lower first ionisation energy than phosphorus but a higher melting point.',[
'Phosphorus has 3p³: one electron occupies each p orbital before pairing occurs.',
'Sulfur has 3p⁴: one orbital contains a pair, whose mutual repulsion makes an electron easier to remove despite the greater nuclear charge.',
'Solid sulfur contains S₈ molecules, whereas molecular phosphorus contains P₄ molecules.',
'S₈ has more electrons and stronger London attractions; more energy is required to overcome the intermolecular forces on melting.'
],'Explain each property with its relevant model: electron removal and melting are different processes.');
L('3.2.2','Group 2: trends, reactions and tests',[
'Down Mg–Ba, more occupied shells increase radius and shielding; first ionisation energy falls and loss of the two outer electrons becomes easier. Melting points are not a simple monotonic trend.',
'Ca, Sr and Ba react with cold water: M + 2H₂O → M(OH)₂ + H₂. Magnesium reacts slowly with cold water and reacts with steam to make MgO and hydrogen.',
'Hydroxide solubility generally increases down the group; sulfate solubility decreases. Mg(OH)₂ neutralises stomach acid, Ca(OH)₂ treats acidic soil, and insoluble BaSO₄ is used as a contrast material.',
'Acidify with dilute HCl then add BaCl₂ to test for sulfate: Ba²⁺ + SO₄²⁻ → BaSO₄(s), a white precipitate. Acid removes carbonate interference. Mg reduces TiCl₄: TiCl₄ + 2Mg → Ti + 2MgCl₂; CaO or CaCO₃ removes acidic SO₂ from flue gas.'
],'A solution may contain carbonate or sulfate. Explain the acidified barium chloride test and why sulfuric acid must not be used.',[
'Add dilute hydrochloric acid first. Carbonate reacts to release CO₂, removing a possible white barium carbonate precipitate.',
'Add barium chloride solution. A persistent white precipitate indicates sulfate ions under these test conditions.',
'The ionic equation is Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s); sodium and chloride ions are spectators.',
'Sulfuric acid would introduce sulfate and could cause a false positive, so it is unsuitable for acidification.'
],'Only insoluble barium sulfate is used medically; soluble barium salts are toxic.');
L('3.2.3.1','Halogen trends, displacement and halide tests',[
'Down Group 17, radius and shielding increase: electronegativity and oxidising strength decrease. Boiling points rise because larger molecules with more electrons have stronger London forces.',
'A stronger halogen oxidising agent displaces a weaker one from halide solution: Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂. Halide reducing strength increases down the group.',
'With concentrated H₂SO₄, chloride gives an acid–base reaction only; bromide can reduce sulfur to SO₂; iodide can reduce it further to sulfur and H₂S. Write oxidation and reduction half-equations before combining.',
'For halides, acidify with dilute HNO₃ then add AgNO₃: AgCl white, AgBr cream, AgI yellow. AgCl dissolves in dilute NH₃; AgBr needs concentrated NH₃; AgI remains insoluble. Nitric acid removes carbonate without adding halide ions.'
],'Chlorine is added to aqueous potassium bromide. Give the ionic equation and electron-transfer explanation.',[
'Cl₂(aq) + 2Br⁻(aq) → 2Cl⁻(aq) + Br₂(aq); an orange/brown bromine colour develops.',
'Reduction: Cl₂ + 2e⁻ → 2Cl⁻. Chlorine accepts electrons and acts as the oxidising agent.',
'Oxidation: 2Br⁻ → Br₂ + 2e⁻. Bromide loses electrons and acts as the reducing agent.',
'Potassium ions are unchanged spectators. Bromine cannot produce the reverse displacement of chloride in the corresponding test.'
],'Halogens are oxidising agents; their halide ions act as reducing agents.');
L('3.2.3.2','Chlorine, chlorate(I) and water treatment',[
'Chlorine reacts reversibly with water: Cl₂ + H₂O ⇌ HCl + HClO. Chlorine is reduced to −1 in chloride and oxidised to +1 in chloric(I) acid: disproportionation.',
'With cold dilute aqueous NaOH: Cl₂ + 2NaOH → NaCl + NaClO + H₂O. Sodium chlorate(I) is used in bleach; specify conditions because hot concentrated alkali gives different products.',
'HClO/ClO⁻ provide antimicrobial activity. Chlorination reduces transmission of waterborne disease; assess this benefit against toxicity, handling risk and formation of unwanted chlorinated by-products.',
'In sunlight, the overall decomposition can be represented as 2Cl₂ + 2H₂O → 4HCl + O₂. Chlorine disinfectants require controlled conditions; acidifying hypochlorite bleach can release toxic chlorine.'
],'Show that the reaction of chlorine with cold dilute NaOH is disproportionation.',[
'Write the balanced equation: Cl₂ + 2NaOH → NaCl + NaClO + H₂O.',
'Chlorine starts at oxidation state 0 in elemental Cl₂.',
'In NaCl chlorine is −1, so it is reduced. In NaClO chlorine is +1 because Na is +1 and O is −2.',
'The same element is both oxidised and reduced in one reaction, which defines disproportionation.'
],'Chlorate(I), ClO⁻, is distinct from chlorate(V), ClO₃⁻.');
L('3.2.4','Period 3 oxides: structure and acid–base reactions',[
'Na₂O and MgO form giant ionic lattices; Al₂O₃ has substantial ionic character; SiO₂ is a giant covalent network. Strong lattice attractions or many covalent bonds produce high melting points.',
'P₄O₁₀, SO₂ and SO₃ are covalent molecular oxides with lower melting points governed mainly by intermolecular attractions. Oxide character changes from basic through amphoteric to acidic.',
'Na₂O + H₂O → 2NaOH; MgO + H₂O → Mg(OH)₂ gives a weakly alkaline mixture because the hydroxide is sparingly soluble. Al₂O₃ and SiO₂ do not simply dissolve/react with water.',
'P₄O₁₀ + 6H₂O → 4H₃PO₄; SO₂ + H₂O ⇌ H₂SO₃; SO₃ + H₂O → H₂SO₄. Al₂O₃ reacts with both acid and alkali; SiO₂ reacts with hot alkali. Track formulae, charge and balanced water molecules.'
],'Use equations to distinguish MgO, Al₂O₃ and SO₃ as basic, amphoteric and acidic oxides.',[
'MgO consumes acid: MgO + 2H⁺ → Mg²⁺ + H₂O, showing basic behaviour.',
'Al₂O₃ consumes acid: Al₂O₃ + 6H⁺ → 2Al³⁺ + 3H₂O.',
'It also reacts with aqueous alkali: Al₂O₃ + 2OH⁻ + 3H₂O → 2[Al(OH)₄]⁻, demonstrating amphoteric behaviour.',
'SO₃ consumes base: SO₃ + 2OH⁻ → SO₄²⁻ + H₂O, consistent with an acidic oxide.'
],'A high melting point does not alone prove that an oxide is ionic; SiO₂ is giant covalent.');
L('3.2.5.1','Transition metals, ligands and coordination',[
'Transition elements form at least one ion with a partially filled d subshell. Common properties include variable oxidation states, coloured ions, complex formation and catalytic activity.',
'A ligand supplies a lone pair into a coordinate bond with a central metal atom or ion. H₂O, NH₃ and Cl⁻ are monodentate; ethane-1,2-diamine and ethanedioate are bidentate.',
'Coordination number counts coordinate bonds to the metal, not ligand molecules. Three bidentate ligands give six coordinate bonds and an octahedral complex.',
'Find metal oxidation state from ligand charges and total complex charge. Water and ammonia are neutral; each chloride is −1, ethanedioate is −2, and EDTA is normally represented as EDTA⁴⁻.'
],'Find the oxidation state and coordination number of cobalt in [Co(en)₃]³⁺, where en is neutral bidentate ethane-1,2-diamine.',[
'All three en ligands are neutral, so cobalt accounts for the whole 3+ complex charge: oxidation state +3.',
'Each en molecule donates two nitrogen lone pairs and makes two coordinate bonds.',
'Three ligands therefore make 3 × 2 = 6 coordinate bonds: coordination number six.',
'The usual arrangement is octahedral; saying coordination number three confuses the ligand count with the bond count.'
],'A coordinate bond contains two electrons donated initially by one atom.');
L('3.2.5.2','Ligand substitution and the chelate effect',[
'Ligand substitution exchanges ligands without necessarily changing the metal oxidation state. Excess NH₃ can replace four waters in [Cu(H₂O)₆]²⁺ to form deep-blue [Cu(NH₃)₄(H₂O)₂]²⁺.',
'Concentrated chloride replaces water in cobalt complexes: [Co(H₂O)₆]²⁺ + 4Cl⁻ ⇌ [CoCl₄]²⁻ + 6H₂O. Pink octahedral aqua ions change to blue tetrahedral chloride complexes.',
'A multidentate ligand can replace several monodentate ligands. Releasing more separate molecules often gives a favourable entropy change, helping stabilise chelated complexes; enthalpy also contributes to ΔG.',
'Haem contains Fe²⁺ coordinated to a multidentate ligand. Oxygen binds reversibly for transport; carbon monoxide binds strongly and reduces oxygen-carrying capacity. Use ligand equations to distinguish substitution from precipitation.'
],'Explain the entropy contribution when [Cu(H₂O)₆]²⁺ reacts with EDTA⁴⁻ to form [Cu(EDTA)]²⁻.',[
'The ligand equation is [Cu(H₂O)₆]²⁺ + EDTA⁴⁻ → [Cu(EDTA)]²⁻ + 6H₂O.',
'One hexadentate EDTA ligand makes six coordinate bonds and replaces the six water ligands.',
'The process releases six water molecules; the greater number of freely moving species favours increased dispersal and a positive entropy contribution.',
'In ΔG = ΔH − TΔS, positive ΔS makes the entropy term more favourable. The full equilibrium still depends on both enthalpy and entropy, rather than entropy alone.'
],'Adding a little ammonia may first cause an acid–base precipitate; excess ammonia can then cause ligand substitution.');
L('3.2.5.3','Complex shapes and stereoisomerism',[
'Six coordinate bonds commonly give an octahedron with 90° and 180° angles. Four bonds can give tetrahedral geometry near 109.5° or square planar geometry at 90°.',
'Large chloride ligands commonly produce tetrahedral complexes. Pt(II) can form square planar complexes; [Ag(NH₃)₂]⁺ is linear with a 180° bond angle.',
'In cis–trans isomerism, equivalent ligands are adjacent in cis and opposite in trans arrangements. Cisplatin has adjacent chloride ligands in square planar [Pt(NH₃)₂Cl₂].',
'An octahedral complex with three bidentate ligands can have non-superimposable mirror images and show optical isomerism. A tetrahedral complex with two pairs of identical ligands does not show cis–trans isomerism.'
],'Compare [CoCl₄]²⁻ with cis-[Pt(NH₃)₂Cl₂] in shape, bond angles and cis–trans isomerism.',[
'[CoCl₄]²⁻ is tetrahedral: its four Co–Cl coordinate bonds have angles near 109.5°.',
'Its four identical chloride ligands give no cis–trans pair; there are no distinct adjacent versus opposite positions in the tetrahedron.',
'[Pt(NH₃)₂Cl₂] is square planar with 90° adjacent and 180° opposite bond angles.',
'It can have cis and trans forms: the two Cl ligands are adjacent in cisplatin and opposite in the trans isomer.'
],'Coordination number four does not uniquely determine tetrahedral geometry.');
L('3.2.5.4','Colour, d-orbital splitting and colorimetry',[
'Ligands split the energies of metal d orbitals. A d electron can absorb a photon of appropriate energy and move to a higher level: ΔE = hν = hc/λ.',
'The observed colour corresponds to the light transmitted or reflected after particular wavelengths have been absorbed; absorbed and observed colours are not the same.',
'Changing ligand, oxidation state or coordination geometry changes the splitting and can change colour. Simple d–d transitions require a suitable partially occupied d subshell; other mechanisms can also produce colour.',
'For colorimetry, use a blank, a suitable complementary-colour filter/wavelength and standards of known concentration. Draw a calibration plot of absorbance against concentration and interpolate within its calibrated range.'
],'A complex absorbs light of wavelength 600 nm. Using h = 6.63 × 10⁻³⁴ J s and c = 3.00 × 10⁸ m s⁻¹, calculate its photon energy.',[
'Convert wavelength: 600 nm = 6.00 × 10⁻⁷ m.',
'Use ΔE = hc/λ = (6.63 × 10⁻³⁴ × 3.00 × 10⁸)/(6.00 × 10⁻⁷).',
'ΔE = 3.32 × 10⁻¹⁹ J per photon, to three significant figures.',
'This is the gap for the absorbing transition; the colour seen arises from remaining transmitted/reflected wavelengths, not simply the absorbed 600 nm light.'
],'Do not substitute a wavelength in nanometres into an SI equation without conversion.');
L('3.2.5.5','Variable oxidation states and redox titrations',[
'Transition metals can lose different numbers of electrons because the 4s and 3d energy levels are relatively close. Oxidation-state changes produce characteristic chemical and colour changes.',
'Vanadium solutions commonly progress V(V) yellow, V(IV) blue, V(III) green and V(II) violet on reduction. Cr(VI) dichromate is orange and Cr(III) is green.',
'Acidified manganate(VII) is reduced from purple MnO₄⁻ to nearly colourless Mn²⁺: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O. Five Fe²⁺ ions supply five electrons.',
'Use dilute sulfuric acid for the Fe²⁺/MnO₄⁻ titration. Manganate(VII) acts as its own indicator: the first persistent faint pink indicates slight excess titrant. Insufficient acid can form brown MnO₂.'
],'25.0 cm³ Fe²⁺ requires 20.0 cm³ 0.0200 mol dm⁻³ MnO₄⁻ in acid. Find the Fe²⁺ concentration.',[
'The balanced equation is MnO₄⁻ + 8H⁺ + 5Fe²⁺ → Mn²⁺ + 4H₂O + 5Fe³⁺.',
'n(MnO₄⁻) = 0.0200 × 20.0/1000 = 4.00 × 10⁻⁴ mol.',
'n(Fe²⁺) = 5 × 4.00 × 10⁻⁴ = 2.00 × 10⁻³ mol.',
'c(Fe²⁺) = 2.00 × 10⁻³/0.0250 = 0.0800 mol dm⁻³; the endpoint is a persistent faint pink.'
],'Use the electron-balanced mole ratio; the titrant and analyte are not automatically in a 1:1 ratio.');
L('3.2.5.6','Homogeneous and heterogeneous catalysts',[
'A catalyst provides an alternative route with lower activation energy and is regenerated overall. It changes how quickly equilibrium is reached, rather than the equilibrium constant.',
'In heterogeneous catalysis, reactants adsorb at active surface sites, bonds weaken, reaction occurs and products desorb. Iron catalyses ammonia synthesis; nickel catalyses hydrogenation.',
'Catalyst poisons bind strongly and block active sites. Adsorption must be strong enough to activate reactants but not so strong that products cannot leave.',
'Homogeneous catalysts are in the same phase as reactants and can cycle through oxidation states. Fe²⁺/Fe³⁺ catalyses reaction of peroxodisulfate with iodide; Mn²⁺ autocatalyses oxidation of ethanedioate by acidified manganate(VII).'
],'Explain the Fe²⁺/Fe³⁺ catalytic cycle for S₂O₈²⁻ + 2I⁻ → 2SO₄²⁻ + I₂.',[
'First: S₂O₈²⁻ + 2Fe²⁺ → 2SO₄²⁻ + 2Fe³⁺. Iron(II) is oxidised.',
'Then: 2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂. Iron(III) is reduced and the catalyst is regenerated.',
'Add the steps and cancel both iron species to obtain the stated overall equation.',
'The catalysed route uses oppositely charged ions in the first encounter instead of bringing the two negatively charged reactants together, and provides a lower-activation-energy pathway.'
],'A regenerated catalyst can still be deactivated in practice by poisoning or loss of active surface area.');
L('3.2.6','Aqueous metal ions: acidity, precipitates and identification',[
'Metal aqua ions are Brønsted–Lowry acids because the metal polarises O–H bonds of coordinated water. Small highly charged ions such as Al³⁺ and Fe³⁺ produce more acidic solutions than many 2+ ions.',
'OH⁻ removes protons from coordinated water: [M(H₂O)₆]³⁺ + 3OH⁻ → [M(H₂O)₃(OH)₃](s) + 3H₂O. Fe³⁺ gives a brown precipitate; Al³⁺ gives white; Fe²⁺ green and Cu²⁺ blue hydroxide precipitates.',
'Excess OH⁻ dissolves amphoteric aluminium hydroxide to [Al(OH)₄]⁻. Excess NH₃ dissolves a Cu²⁺ precipitate by ligand substitution to deep-blue [Cu(NH₃)₄(H₂O)₂]²⁺; it does not dissolve every metal hydroxide.',
'Carbonate commonly precipitates carbonates of 2+ ions; strongly acidic 3+ aqua ions instead give hydroxide precipitate and CO₂. Test gases separately and combine observations with equations rather than relying on colour alone.'
],'Explain the observations when NaOH is added dropwise then in excess to an Al³⁺ solution.',[
'At first a white aluminium hydroxide precipitate forms as OH⁻ removes protons from the aqua ion.',
'Represent precipitation as Al³⁺ + 3OH⁻ → Al(OH)₃(s), or use the complete aqua-ion equation.',
'In excess hydroxide the precipitate dissolves: Al(OH)₃(s) + OH⁻ → [Al(OH)₄]⁻(aq).',
'The resulting solution is colourless. Reaction with both acid and excess alkali shows the hydroxide is amphoteric, without changing aluminium’s +3 oxidation state.'
],'Distinguish proton transfer, ligand substitution and redox; a colour change alone does not prove oxidation-state change.');
window.ALEVEL_CHEMISTRY_DETAIL_ROWS=[...(window.ALEVEL_CHEMISTRY_DETAIL_ROWS||[]),...rows];})();
