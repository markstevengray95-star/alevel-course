(()=>{
'use strict';
const refs=(start,end)=>Array.from({length:end-start+1},(_,i)=>`3.${start+i}`);
const biologySections=['3.1.1','3.1.2','3.1.3','3.1.4','3.1.5','3.1.6','3.1.7','3.1.8','3.2.1','3.2.2','3.2.3','3.2.4','3.3.1','3.3.2','3.3.3','3.3.4','3.4.1','3.4.2','3.4.3','3.4.4','3.4.5','3.4.6','3.4.7','3.5.1','3.5.2','3.5.3','3.5.4','3.6.1','3.6.2','3.6.3','3.6.4','3.7.1','3.7.2','3.7.3','3.7.4','3.8.1','3.8.2','3.8.3','3.8.4'];
const chemistrySections=['3.1.1','3.1.2','3.1.3','3.1.4','3.1.5','3.1.6','3.1.7','3.1.8','3.1.9','3.1.10','3.1.11','3.1.12','3.2.1','3.2.2','3.2.3','3.2.4','3.2.5','3.2.6','3.3.1','3.3.2','3.3.3','3.3.4','3.3.5','3.3.6','3.3.7','3.3.8','3.3.9','3.3.10','3.3.11','3.3.12','3.3.13','3.3.14','3.3.15','3.3.16'];
const at=Object.freeze(['a','b','c','d','e','f','g','h','i','j','k','l']);
const practical=(id,title)=>Object.freeze({id,title});
const paper=(id,marks,minutes,weight,scope)=>Object.freeze({id,marks,minutes,weight,scope});
const physics=Object.freeze({
 id:'physics',name:'Physics',code:'7408',verified:'2026-10-01',
 source:'https://www.aqa.org.uk/subjects/physics/a-level/physics-7408/specification',
 contentSource:'https://www.aqa.org.uk/subjects/physics/a-level/physics-7408/specification/subject-content',
 assessmentSource:'https://www.aqa.org.uk/subjects/physics/a-level/physics-7408/specification/specification-at-a-glance',
 core:Object.freeze([
  ['3.1','Measurements and their errors','topics/01-measurements'],['3.2','Particles and radiation','topics/02-particles-radiation'],['3.3','Waves','topics/03-waves'],['3.4','Mechanics and materials','topics/04-mechanics-materials'],['3.5','Electricity','topics/05-electricity'],['3.6','Further mechanics and thermal physics','topics/06-further-mechanics-thermal'],['3.7','Fields and their consequences','topics/07-fields'],['3.8','Nuclear physics','topics/08-nuclear']
 ].map(([ref,title,path])=>Object.freeze({ref,title,path}))),
 options:Object.freeze([
  ['3.9','Astrophysics','astrophysics'],['3.10','Medical physics','medical-physics'],['3.11','Engineering physics','engineering-physics'],['3.12','Turning points in physics','turning-points'],['3.13','Electronics','electronics']
 ].map(([ref,title,id])=>Object.freeze({ref,title,id}))),
 practicals:Object.freeze([
  practical(1,'Stationary waves on a string'),practical(2,'Young slits and diffraction grating'),practical(3,'Free-fall determination of g'),practical(4,'Young modulus'),practical(5,'Resistivity of a wire'),practical(6,'EMF and internal resistance'),practical(7,'Simple harmonic motion'),practical(8,'Boyle and Charles gas laws'),practical(9,'Capacitor charge and discharge'),practical(10,'Force on a current-carrying wire'),practical(11,'Search coil and magnetic flux linkage'),practical(12,'Inverse-square gamma investigation')
 ]),
 apparatus:at,mathsMinimum:40,practicalMinimum:15,
 papers:Object.freeze([
  paper('Paper 1',85,120,34,'Sections 1–5 and 6.1 Periodic motion'),
  paper('Paper 2',85,120,34,'Section 6.2 Thermal physics, 7 and 8; assumed knowledge from 1–6.1'),
  paper('Paper 3',80,120,32,'Section A practical skills/data analysis; Section B one option from 3.9–3.13')
 ])
});
const biology=Object.freeze({
 id:'biology',name:'Biology',code:'7402',verified:'2026-10-01',
 source:'https://www.aqa.org.uk/subjects/biology/a-level/biology-7402/specification',
 contentSource:'https://www.aqa.org.uk/subjects/biology/a-level/biology-7402/specification/subject-content',
 assessmentSource:'https://www.aqa.org.uk/subjects/biology/a-level/biology-7402/specification/specification-at-a-glance',
 topics:Object.freeze(refs(1,8)),sections:Object.freeze(biologySections),
 practicals:Object.freeze([
  practical(1,'Effect of a variable on the rate of an enzyme-controlled reaction'),practical(2,'Root-tip squash, stages of mitosis and mitotic index'),practical(3,'Dilution series to determine water potential of plant tissue'),practical(4,'Effect of a variable on cell-surface membrane permeability'),practical(5,'Dissection of a gas-exchange or mass-transport system or organ'),practical(6,'Aseptic technique and antimicrobial substances on microbial growth'),practical(7,'Chromatography of pigments from leaves'),practical(8,'Effect of a factor on dehydrogenase activity in chloroplast extracts'),practical(9,'Effect of a variable on respiration in single-celled organisms'),practical(10,'Effect of an environmental variable on animal movement using a choice chamber or maze'),practical(11,'Glucose dilution series, colorimetry and a calibration curve for an unknown sample'),practical(12,'Effect of an environmental factor on the distribution of a species')
 ]),
 apparatus:at,mathsMinimum:10,practicalMinimum:15,
 papers:Object.freeze([
  paper('Paper 1',91,120,35,'Topics 1–4 including relevant practical skills'),paper('Paper 2',91,120,35,'Topics 5–8 including relevant practical skills'),paper('Paper 3',78,120,30,'Topics 1–8, practical techniques, data analysis and 25-mark essay')
 ])
});
const chemistry=Object.freeze({
 id:'chemistry',name:'Chemistry',code:'7405',verified:'2026-10-01',
 source:'https://www.aqa.org.uk/subjects/chemistry/a-level/chemistry-7405/specification',
 contentSource:'https://www.aqa.org.uk/subjects/chemistry/a-level/chemistry-7405/specification/subject-content',
 assessmentSource:'https://www.aqa.org.uk/subjects/chemistry/a-level/chemistry-7405/specification/specification-at-a-glance',
 topics:Object.freeze(['3.1','3.2','3.3']),sections:Object.freeze(chemistrySections),
 practicals:Object.freeze([
  practical(1,'Volumetric solution and acid–base titration'),practical(2,'Measurement of an enthalpy change'),practical(3,'Effect of temperature on the rate of a reaction'),practical(4,'Identification of Group 2/NH4+ cations and halide/OH−/CO3²−/SO4²− anions'),practical(5,'Distillation of a product from a reaction'),practical(6,'Tests for alcohol, aldehyde, alkene and carboxylic acid functional groups'),practical(7,'Rate by initial-rate and continuous-monitoring methods'),practical(8,'EMF of an electrochemical cell'),practical(9,'pH changes in weak acid/strong base and strong acid/weak base titrations'),practical(10,'Preparation and purification of organic solids and liquids'),practical(11,'Identification of transition-metal ions in aqueous solution'),practical(12,'Separation by thin-layer chromatography')
 ]),
 apparatus:at,mathsMinimum:20,practicalMinimum:15,
 papers:Object.freeze([
  paper('Paper 1',105,120,35,'Selected physical chemistry plus inorganic chemistry'),paper('Paper 2',105,120,35,'Selected physical chemistry plus organic chemistry'),paper('Paper 3',90,120,30,'Any content, practical/data analysis and multiple choice')
 ])
});
const manifest=Object.freeze({version:'phase-17',verified:'2026-10-01',board:'AQA',subjects:Object.freeze({physics,biology,chemistry}),totals:Object.freeze({biologySections:biologySections.length,chemistrySections:chemistrySections.length,physicsCore:physics.core.length,physicsOptions:physics.options.length,requiredPracticals:physics.practicals.length+biology.practicals.length+chemistry.practicals.length})});
window.ALEVEL_SPECIFICATION_MANIFEST=manifest;
})();