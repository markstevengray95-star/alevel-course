(()=>{
  'use strict';

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const D=(kind,title,goal,detail='')=>Object.freeze({kind,title,goal,detail});
  const refs=Object.freeze([
    '3.1.1','3.1.2','3.1.3','3.1.4','3.1.5','3.1.6','3.1.7','3.1.8',
    '3.2.1','3.2.2','3.2.3','3.2.4',
    '3.3.1','3.3.2','3.3.3','3.3.4',
    '3.4.1','3.4.2','3.4.3','3.4.4','3.4.5','3.4.6','3.4.7',
    '3.5.1','3.5.2','3.5.3','3.5.4',
    '3.6.1','3.6.2','3.6.3','3.6.4',
    '3.7.1','3.7.2','3.7.3','3.7.4',
    '3.8.1','3.8.2','3.8.3','3.8.4'
  ]);

  const definitions=Object.freeze({
    '3.1.1':D('molecule','Build a biological polymer','Join monomers and compare condensation with hydrolysis.','condensation'),
    '3.1.2':D('molecule','Carbohydrate structure explorer','Compare storage and structural carbohydrate arrangements.','carbohydrate'),
    '3.1.3':D('molecule','Lipid structure explorer','Build triglyceride and phospholipid representations and connect structure to function.','lipid'),
    '3.1.4':D('enzyme','Enzyme rate simulator','Change temperature, pH and substrate concentration to explore enzyme activity.','enzyme'),
    '3.1.5':D('dna','DNA and RNA base-pairing lab','Build complementary strands and transcribe a short DNA template.','bases'),
    '3.1.6':D('energy','ATP cycle model','Change ATP demand and explore phosphorylation and hydrolysis.','atp'),
    '3.1.7':D('molecule','Water property explorer','Connect polarity and hydrogen bonding to biological properties.','water'),
    '3.1.8':D('homeostasis','Inorganic ion balance','Adjust ion concentration and identify likely biological consequences.','ions'),
    '3.2.1':D('cell','Interactive 3D-style cell','Rotate the cell and select organelles to reveal structure–function links.','cell'),
    '3.2.2':D('process','Cell cycle and mitosis stepper','Move through the cell cycle and identify chromosome behaviour.','cell-cycle'),
    '3.2.3':D('transport','Membrane transport simulator','Change concentration gradient and transport mechanism to predict movement.','membrane'),
    '3.2.4':D('process','Immune response simulator','Step through recognition, clonal selection and antibody production.','immunity'),
    '3.3.1':D('diffusion','Exchange surface calculator','Manipulate surface area, gradient and diffusion distance.','surface-area'),
    '3.3.2':D('diffusion','Gas-exchange simulator','Explore how ventilation, perfusion and surface area affect exchange rate.','gas-exchange'),
    '3.3.3':D('process','Digestion and absorption pathway','Track macromolecules through digestion and absorption.','digestion'),
    '3.3.4':D('process','Mass-transport flow model','Trace substances through mammalian and plant transport systems.','transport'),
    '3.4.1':D('dna','Gene and chromosome explorer','Relate DNA sequence, genes, loci and chromosomes.','gene'),
    '3.4.2':D('dna','Protein-synthesis lab','Transcribe and translate a short nucleotide sequence.','protein'),
    '3.4.3':D('dna','Mutation impact explorer','Introduce a base change and compare the resulting sequence.','mutation'),
    '3.4.4':D('process','Meiosis and variation stepper','Explore crossing over, independent segregation and haploid products.','meiosis'),
    '3.4.5':D('data','Species and taxonomy sorter','Compare classification evidence and group organisms using shared features.','taxonomy'),
    '3.4.6':D('data','Biodiversity sampling lab','Change sample size and observe how estimates become more representative.','biodiversity'),
    '3.4.7':D('data','Genetic diversity analyser','Compare allele-frequency data and similarity evidence.','diversity'),
    '3.5.1':D('energy','Photosynthesis rate simulator','Change light, carbon dioxide and temperature to identify limiting factors.','photosynthesis'),
    '3.5.2':D('energy','Respiration pathway simulator','Change oxygen and substrate availability and compare ATP output.','respiration'),
    '3.5.3':D('energy','Ecosystem energy transfer','Adjust transfer efficiency across trophic levels.','ecosystem-energy'),
    '3.5.4':D('process','Nutrient-cycle explorer','Move nitrogen and carbon through named biological processes.','cycles'),
    '3.6.1':D('process','Stimulus–response pathway','Step from receptor to coordinator to effector and response.','response'),
    '3.6.2':D('process','Neuron and synapse simulator','Trace an impulse and manipulate synaptic transmission.','neuron'),
    '3.6.3':D('process','Muscle contraction model','Step through calcium release, cross-bridge formation and filament sliding.','muscle'),
    '3.6.4':D('homeostasis','Homeostasis control simulator','Disturb a variable and observe negative-feedback correction.','homeostasis'),
    '3.7.1':D('genetics','Inheritance cross lab','Choose parental genotypes and inspect predicted offspring ratios.','inheritance'),
    '3.7.2':D('hardy','Hardy–Weinberg calculator','Change q and calculate p, carrier frequency and genotype proportions.','hardy-weinberg'),
    '3.7.3':D('population','Evolution and allele-frequency model','Apply selection pressure and follow allele frequency across generations.','evolution'),
    '3.7.4':D('population','Population growth model','Change carrying capacity and growth conditions.','population'),
    '3.8.1':D('process','Gene-expression switchboard','Turn regulatory influences on and off to explore transcriptional control.','gene-expression'),
    '3.8.2':D('population','Cell-cycle control model','Change checkpoint control and compare regulated with uncontrolled division.','cancer'),
    '3.8.3':D('data','Genome-data explorer','Compare sequence samples and identify variation patterns.','genome'),
    '3.8.4':D('geneTech','PCR and electrophoresis lab','Amplify DNA and separate fragments in a virtual gel.','gene-tech')
  });

  const processSteps=Object.freeze({
    'cell-cycle':['Interphase: DNA replicates and organelles increase.','Prophase/metaphase: chromosomes condense and align.','Anaphase: sister chromatids separate to opposite poles.','Telophase/cytokinesis: nuclei reform and cells separate.'],
    immunity:['Antigen is recognised as non-self.','Specific lymphocytes are selected and activated.','Clonal expansion produces many identical cells.','Plasma cells release antibodies; memory cells remain.'],
    digestion:['Large molecules enter the digestive system.','Specific enzymes hydrolyse polymers into smaller molecules.','Products cross epithelial cells at the ileum.','Absorbed molecules enter blood or lymph for transport.'],
    transport:['A pressure or water-potential difference is established.','Fluid enters the transport pathway.','Bulk flow moves material through vessels.','Exchange occurs at target tissues or sinks.'],
    meiosis:['Homologous chromosomes pair; crossing over may occur.','Homologous pairs align independently at metaphase I.','Homologous chromosomes separate in meiosis I.','Sister chromatids separate in meiosis II to form haploid cells.'],
    cycles:['A nutrient enters a biological pool.','Assimilation transfers it into biomass.','Feeding transfers it between organisms.','Decomposition and microbial processes return it to reusable forms.'],
    response:['A receptor detects a stimulus.','Information travels to a coordinator.','A signal travels to an effector.','The effector produces a response that changes the condition.'],
    neuron:['A stimulus changes membrane permeability and initiates depolarisation.','Local currents propagate an action potential along the axon.','Calcium entry triggers neurotransmitter release at the synapse.','Neurotransmitter binds receptors on the postsynaptic membrane.'],
    muscle:['An action potential triggers calcium-ion release.','Calcium exposes binding sites on actin.','Myosin heads form cross-bridges and perform power strokes.','ATP enables detachment and re-cocking so sliding can continue.'],
    'gene-expression':['A regulatory signal changes transcription-factor activity.','Transcription factors bind or leave regulatory DNA.','RNA polymerase access changes and transcription rate alters.','Protein abundance changes, affecting cell phenotype.']
  });

  function wrap(def,body,tip='Manipulate the controls, then explain the biological reason for the change you observe.'){
    return `<section class="bio-interactive" data-bio-interactive data-kind="${esc(def.kind)}">
      <div class="bio-int-head"><div><span class="eyebrow">Phase 7 interactive</span><h2>${esc(def.title)}</h2><p>${esc(def.goal)}</p></div><span class="bio-int-badge">AQA interactive</span></div>
      <div class="bio-int-body">${body}</div>
      <p class="bio-int-tip"><strong>Explain:</strong> ${esc(tip)}</p>
    </section>`;
  }

  function molecule(def){
    const options=def.detail==='carbohydrate'?['α-glucose','β-glucose','branching','H-bonding']:def.detail==='lipid'?['glycerol','fatty acid','phosphate','ester bond']:def.detail==='water'?['polarity','H-bond','cohesion','solvent']:['monomer','covalent bond','condensation','hydrolysis'];
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model molecule-model"><div class="molecule-chain" data-chain>${[0,1,2].map(i=>`<span style="--i:${i}"></span>`).join('')}</div><div class="bio-meter"><i data-meter style="width:42%"></i></div><strong data-readout>3 linked units</strong></div><div class="bio-controls"><p>Select ideas to add to the model:</p><div class="bio-chip-row">${options.map((x,i)=>`<button type="button" class="bio-chip" data-molecule-chip data-index="${i}">${esc(x)}</button>`).join('')}</div><button type="button" data-molecule-reset>Reset model</button></div></div>`,'Describe how the bonds or intermolecular forces shown explain the biological property.');
  }

  function enzyme(def){
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model enzyme-stage"><div class="enzyme-shape"></div><div class="substrate-dot"></div><div class="bio-meter"><i data-enzyme-meter></i></div><strong data-enzyme-output></strong></div><div class="bio-controls"><label>Temperature <output data-temp-o>37</output> °C<input data-enzyme-temp type="range" min="5" max="70" value="37"></label><label>pH <output data-ph-o>7</output><input data-enzyme-ph type="range" min="1" max="14" value="7"></label><label>Substrate concentration <output data-sub-o>60</output>%<input data-enzyme-sub type="range" min="5" max="100" value="60"></label></div></div>`,'Explain the rate using successful collisions, active-site shape and denaturation where appropriate.');
  }

  function dna(def){
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model dna-stage"><div class="dna-row" data-dna-template></div><div class="dna-row complement" data-dna-complement></div><div class="dna-row rna" data-rna-row></div></div><div class="bio-controls"><label>DNA template<select data-dna-select><option value="ATGCCATTA">ATGCCATTA</option><option value="TACGGTCAA">TACGGTCAA</option><option value="GGATACCTG">GGATACCTG</option></select></label><button type="button" data-dna-pair>Build complementary strand</button><button type="button" data-dna-transcribe>Transcribe to mRNA</button><button type="button" data-dna-mutate>Introduce one base substitution</button><p data-dna-message>Choose an action to manipulate the sequence.</p></div></div>`,'State which bonds/interactions are represented and distinguish replication, transcription and mutation.');
  }

  function cell(def){
    const organelles=[['nucleus','Stores DNA; site of transcription.'],['mitochondrion','Aerobic respiration and ATP production.'],['ribosome','Site of translation.'],['golgi','Modifies and packages proteins.'],['rough ER','Folds/transports proteins made by attached ribosomes.'],['lysosome','Contains hydrolytic enzymes.']];
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model cell-stage"><div class="cell-3d" data-cell style="--rotate:18deg"><span class="org nucleus"></span><span class="org mito m1"></span><span class="org mito m2"></span><span class="org golgi"></span><span class="org rer"></span><span class="org rib r1"></span><span class="org rib r2"></span></div><label class="rotate-control">Rotate cell<input data-cell-rotate type="range" min="-40" max="40" value="18"></label></div><div class="bio-controls"><div class="bio-chip-row">${organelles.map(([name])=>`<button type="button" class="bio-chip" data-organelle="${esc(name)}">${esc(name)}</button>`).join('')}</div><div class="bio-info" data-organelle-info>Select an organelle to reveal its function.</div></div></div>`,'Link each organelle’s structure to its function and explain how organelles cooperate within a cell.').replace('</section>',`<script type="application/json" data-organelle-data>${JSON.stringify(Object.fromEntries(organelles))}</script></section>`);
  }

  function transport(def){
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model membrane-stage"><div class="membrane"><i></i><i></i><i class="protein"></i><i></i><i></i></div><div class="particles left" data-left></div><div class="particles right" data-right></div><strong data-transport-output></strong></div><div class="bio-controls"><label>Outside concentration <output data-out-o>80</output>%<input data-out type="range" min="0" max="100" value="80"></label><label>Inside concentration <output data-in-o>25</output>%<input data-in type="range" min="0" max="100" value="25"></label><label>Mechanism<select data-mode><option>diffusion</option><option>facilitated diffusion</option><option>osmosis</option><option>active transport</option></select></label></div></div>`,'Predict net movement from the gradient, then explain when membrane proteins or ATP are required.');
  }

  function process(def){
    const steps=processSteps[def.detail]||['Identify the starting condition.','Describe the first biological change.','Explain the intermediate mechanism.','Link the final outcome back to function.'];
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model process-stage"><div class="process-track">${steps.map((s,i)=>`<button type="button" data-process-step="${i}" class="${i===0?'active':''}"><span>${i+1}</span></button>`).join('<i>→</i>')}</div><div class="bio-info" data-process-info>${esc(steps[0])}</div></div><div class="bio-controls"><button type="button" data-process-prev disabled>← Previous</button><button type="button" data-process-next>Next →</button><p>Use the stepper until you can reproduce the sequence without prompts.</p></div></div>`,'Explain why each step must occur before the next one.').replace('</section>',`<script type="application/json" data-process-data>${JSON.stringify(steps)}</script></section>`);
  }

  function diffusion(def){
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model diffusion-stage"><div class="diffusion-arrows" data-diffusion-arrows></div><div class="bio-meter"><i data-diffusion-meter></i></div><strong data-diffusion-output></strong></div><div class="bio-controls"><label>Surface area <output data-sa-o>70</output>%<input data-sa type="range" min="10" max="100" value="70"></label><label>Concentration gradient <output data-grad-o>65</output>%<input data-grad type="range" min="5" max="100" value="65"></label><label>Diffusion distance <output data-dist-o>30</output>%<input data-dist type="range" min="5" max="100" value="30"></label></div></div>`,'Use surface area, concentration gradient and diffusion distance in a linked explanation of exchange rate.');
  }

  function energy(def){
    const label=def.detail==='photosynthesis'?'Light intensity':def.detail==='respiration'?'Oxygen availability':def.detail==='ecosystem-energy'?'Transfer efficiency':'ATP demand';
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model energy-stage"><div class="energy-orb" data-energy-orb></div><div class="bio-meter"><i data-energy-meter></i></div><strong data-energy-output></strong></div><div class="bio-controls"><label>${esc(label)} <output data-energy-a-o>55</output>%<input data-energy-a type="range" min="0" max="100" value="55"></label><label>${def.detail==='photosynthesis'?'CO₂ availability':def.detail==='respiration'?'Substrate availability':def.detail==='ecosystem-energy'?'Starting biomass':'Phosphate availability'} <output data-energy-b-o>70</output>%<input data-energy-b type="range" min="0" max="100" value="70"></label><label>Temperature / condition <output data-energy-c-o>60</output>%<input data-energy-c type="range" min="0" max="100" value="60"></label></div></div>`,'Identify the limiting factor and explain why raising a different factor may have little effect.');
  }

  function homeostasis(def){
    const ions=def.detail==='ions';
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model homeostasis-stage"><div class="setpoint"><span data-home-value></span><i data-home-needle></i></div><strong data-home-output></strong></div><div class="bio-controls"><label>${ions?'Ion concentration':'Controlled variable'} <output data-home-o>${ions?'50':'70'}</output>%<input data-home type="range" min="0" max="100" value="${ions?'50':'70'}"></label><label>Feedback strength <output data-feedback-o>70</output>%<input data-feedback type="range" min="0" max="100" value="70"></label><button type="button" data-home-correct>Apply negative feedback</button></div></div>`,'Name the receptor, coordination pathway and effector response that would oppose the disturbance.');
  }

  function data(def){
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model data-stage"><div class="sample-grid" data-sample-grid>${Array.from({length:24},(_,i)=>`<i style="--v:${(i*7)%10}"></i>`).join('')}</div><strong data-data-output>Sample 5 quadrats to begin</strong></div><div class="bio-controls"><label>Sample size <output data-sample-o>5</output><input data-sample type="range" min="3" max="24" value="5"></label><button type="button" data-randomise>Randomise sample</button><p data-data-message>Increasing sample size generally reduces sampling error and improves confidence in an estimate.</p></div></div>`,'Evaluate representativeness, bias, repeatability and the strength of the conclusion.');
  }

  function genetics(def){
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model genetics-stage"><div class="punnett" data-punnett></div><strong data-genetics-output></strong></div><div class="bio-controls"><label>Parent 1<select data-p1><option>AA</option><option selected>Aa</option><option>aa</option></select></label><label>Parent 2<select data-p2><option>AA</option><option selected>Aa</option><option>aa</option></select></label><p>Assume A is dominant for this model.</p></div></div>`,'Distinguish genotype from phenotype and explain why predicted ratios are probabilities, not guaranteed family outcomes.');
  }

  function hardy(def){
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model hardy-stage"><div class="hardy-ring"><strong data-hardy-p></strong><span>p</span></div><div class="hardy-stats"><b data-hardy-aa></b><b data-hardy-het></b><b data-hardy-rec></b></div></div><div class="bio-controls"><label>Recessive allele frequency q <output data-q-o>0.30</output><input data-q type="range" min="1" max="99" value="30"></label><p data-hardy-check></p></div></div>`,'State the Hardy–Weinberg assumptions before using the calculated proportions to interpret a real population.');
  }

  function population(def){
    const evolution=def.detail==='evolution';
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model population-stage"><div class="pop-bars" data-pop-bars>${Array.from({length:10},(_,i)=>`<i style="--h:${20+i*5}%"></i>`).join('')}</div><strong data-pop-output></strong></div><div class="bio-controls"><label>${evolution?'Selection pressure':'Carrying capacity'} <output data-pop-a-o>60</output>%<input data-pop-a type="range" min="0" max="100" value="60"></label><label>${evolution?'Starting allele frequency':'Resource availability'} <output data-pop-b-o>45</output>%<input data-pop-b type="range" min="1" max="100" value="45"></label><button type="button" data-pop-run>Run 10 generations</button></div></div>`,'Explain the trend using selection, competition, reproduction and limits to population growth as appropriate.');
  }

  function geneTech(def){
    return wrap(def,`<div class="bio-int-grid"><div class="bio-model gene-tech-stage"><div class="pcr-copies" data-pcr-copies>1 copy</div><div class="gel" data-gel><i style="--y:18%"></i><i style="--y:38%"></i><i style="--y:64%"></i></div></div><div class="bio-controls"><label>PCR cycles <output data-cycles-o>5</output><input data-cycles type="range" min="0" max="20" value="5"></label><button type="button" data-pcr>Run PCR</button><label>Fragment size <output data-fragment-o>600</output> bp<input data-fragment type="range" min="100" max="1500" step="50" value="600"></label><button type="button" data-gel-run>Run electrophoresis</button><p data-gene-message>Use the controls to model amplification and DNA separation.</p></div></div>`,'Explain why PCR requires primers and thermostable DNA polymerase, then explain why smaller DNA fragments travel further through a gel.');
  }

  const renderers={molecule,enzyme,dna,cell,transport,process,diffusion,energy,homeostasis,data,genetics,hardy,population,geneTech};

  function initMolecule(host){
    let count=3;const chain=host.querySelector('[data-chain]');const meter=host.querySelector('[data-meter]');const readout=host.querySelector('[data-readout]');
    const paint=()=>{chain.innerHTML=Array.from({length:count},(_,i)=>`<span style="--i:${i}"></span>`).join('');meter.style.width=`${Math.min(100,20+count*12)}%`;readout.textContent=`${count} linked unit${count===1?'':'s'} · ${count>3?'greater structural complexity':'simple structure'}`;};
    host.querySelectorAll('[data-molecule-chip]').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');count=clamp(count+(btn.classList.contains('active')?1:-1),1,7);paint();}));
    host.querySelector('[data-molecule-reset]')?.addEventListener('click',()=>{count=3;host.querySelectorAll('[data-molecule-chip]').forEach(x=>x.classList.remove('active'));paint();});paint();
  }
  function initEnzyme(host){
    const t=host.querySelector('[data-enzyme-temp]'),p=host.querySelector('[data-enzyme-ph]'),s=host.querySelector('[data-enzyme-sub]');
    const update=()=>{const tv=+t.value,pv=+p.value,sv=+s.value;const temp=tv<=40?Math.max(0,1-Math.abs(tv-37)/45):Math.max(0,1-(tv-40)/30);const ph=Math.max(0,1-Math.abs(pv-7)/7);const sub=sv/(35+sv);const activity=clamp(Math.round(temp*ph*sub*150),0,100);host.querySelector('[data-enzyme-meter]').style.width=`${activity}%`;host.querySelector('[data-enzyme-output]').textContent=`Relative activity: ${activity}%${tv>50?' · denaturation dominates':''}`;host.querySelector('[data-temp-o]').value=tv;host.querySelector('[data-ph-o]').value=pv;host.querySelector('[data-sub-o]').value=sv;};[t,p,s].forEach(x=>x.addEventListener('input',update));update();
  }
  function initDna(host){
    let sequence=host.querySelector('[data-dna-select]').value;const pair=b=>({A:'T',T:'A',C:'G',G:'C'}[b]||'?');const rna=b=>({A:'U',T:'A',C:'G',G:'C'}[b]||'?');const draw=(node,seq)=>node.innerHTML=seq.split('').map(x=>`<b>${x}</b>`).join('');
    const reset=()=>{sequence=host.querySelector('[data-dna-select]').value;draw(host.querySelector('[data-dna-template]'),sequence);host.querySelector('[data-dna-complement]').innerHTML='';host.querySelector('[data-rna-row]').innerHTML='';};host.querySelector('[data-dna-select]').addEventListener('change',reset);host.querySelector('[data-dna-pair]').addEventListener('click',()=>{draw(host.querySelector('[data-dna-complement]'),sequence.split('').map(pair).join(''));host.querySelector('[data-dna-message]').textContent='Complementary DNA strand built using specific base pairing.';});host.querySelector('[data-dna-transcribe]').addEventListener('click',()=>{draw(host.querySelector('[data-rna-row]'),sequence.split('').map(rna).join(''));host.querySelector('[data-dna-message]').textContent='mRNA transcript shown beneath the DNA template.';});host.querySelector('[data-dna-mutate]').addEventListener('click',()=>{const i=Math.floor(sequence.length/2);const replacement=sequence[i]==='A'?'G':'A';sequence=sequence.slice(0,i)+replacement+sequence.slice(i+1);draw(host.querySelector('[data-dna-template]'),sequence);host.querySelector('[data-dna-message]').textContent=`Base substitution introduced at position ${i+1}.`;});reset();
  }
  function initCell(host){
    const data=JSON.parse(host.querySelector('[data-organelle-data]').textContent);host.querySelector('[data-cell-rotate]').addEventListener('input',e=>host.querySelector('[data-cell]').style.setProperty('--rotate',`${e.target.value}deg`));host.querySelectorAll('[data-organelle]').forEach(btn=>btn.addEventListener('click',()=>{host.querySelectorAll('[data-organelle]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');host.querySelector('[data-organelle-info]').innerHTML=`<strong>${esc(btn.dataset.organelle)}</strong><p>${esc(data[btn.dataset.organelle])}</p>`;}));
  }
  function initTransport(host){
    const out=host.querySelector('[data-out]'),inside=host.querySelector('[data-in]'),mode=host.querySelector('[data-mode]');const update=()=>{const a=+out.value,b=+inside.value,m=mode.value,delta=a-b;host.querySelector('[data-out-o]').value=a;host.querySelector('[data-in-o]').value=b;const direction=m==='active transport'?(delta>=0?'against a selected gradient using ATP':'against a selected gradient using ATP'):delta===0?'no net movement':delta>0?'outside → inside':'inside → outside';host.querySelector('[data-transport-output]').textContent=`${m}: ${direction}`;host.querySelector('[data-left]').style.opacity=String(.25+a/135);host.querySelector('[data-right]').style.opacity=String(.25+b/135);};[out,inside,mode].forEach(x=>x.addEventListener('input',update));update();
  }
  function initProcess(host){
    const steps=JSON.parse(host.querySelector('[data-process-data]').textContent);let i=0;const update=()=>{host.querySelectorAll('[data-process-step]').forEach((x,n)=>x.classList.toggle('active',n===i));host.querySelector('[data-process-info]').textContent=steps[i];host.querySelector('[data-process-prev]').disabled=i===0;host.querySelector('[data-process-next]').disabled=i===steps.length-1;};host.querySelectorAll('[data-process-step]').forEach(x=>x.addEventListener('click',()=>{i=+x.dataset.processStep;update();}));host.querySelector('[data-process-prev]').addEventListener('click',()=>{i=clamp(i-1,0,steps.length-1);update();});host.querySelector('[data-process-next]').addEventListener('click',()=>{i=clamp(i+1,0,steps.length-1);update();});update();
  }
  function initDiffusion(host){
    const sa=host.querySelector('[data-sa]'),g=host.querySelector('[data-grad]'),d=host.querySelector('[data-dist]');const update=()=>{const rate=clamp(Math.round((+sa.value)*(+g.value)/Math.max(8,+d.value)/1.1),0,100);host.querySelector('[data-sa-o]').value=sa.value;host.querySelector('[data-grad-o]').value=g.value;host.querySelector('[data-dist-o]').value=d.value;host.querySelector('[data-diffusion-meter]').style.width=`${rate}%`;host.querySelector('[data-diffusion-output]').textContent=`Relative exchange rate: ${rate}%`;host.querySelector('[data-diffusion-arrows]').style.setProperty('--rate',String(rate));};[sa,g,d].forEach(x=>x.addEventListener('input',update));update();
  }
  function initEnergy(host){
    const a=host.querySelector('[data-energy-a]'),b=host.querySelector('[data-energy-b]'),c=host.querySelector('[data-energy-c]');const update=()=>{const values=[+a.value,+b.value,+c.value];const out=Math.round(Math.min(...values)*.9+Math.max(...values)*.1);['a','b','c'].forEach((k,i)=>host.querySelector(`[data-energy-${k}-o]`).value=values[i]);host.querySelector('[data-energy-meter]').style.width=`${out}%`;host.querySelector('[data-energy-output]').textContent=`Relative process rate/output: ${out}% · limiting input ≈ ${Math.min(...values)}%`;host.querySelector('[data-energy-orb]').style.setProperty('--energy',String(out));};[a,b,c].forEach(x=>x.addEventListener('input',update));update();
  }
  function initHomeostasis(host){
    const v=host.querySelector('[data-home]'),f=host.querySelector('[data-feedback]');const update=()=>{const value=+v.value;host.querySelector('[data-home-o]').value=value;host.querySelector('[data-feedback-o]').value=f.value;host.querySelector('[data-home-value]').textContent=value;host.querySelector('[data-home-needle]').style.transform=`rotate(${(value-50)*1.5}deg)`;host.querySelector('[data-home-output]').textContent=Math.abs(value-50)<8?'Near set point':'Disturbance detected';};v.addEventListener('input',update);f.addEventListener('input',update);host.querySelector('[data-home-correct]').addEventListener('click',()=>{const strength=+f.value/100;v.value=Math.round(+v.value+(50-+v.value)*strength);update();});update();
  }
  function initData(host){
    const sample=host.querySelector('[data-sample]');let seed=3;const update=()=>{const n=+sample.value;host.querySelector('[data-sample-o]').value=n;host.querySelectorAll('[data-sample-grid] i').forEach((x,i)=>x.classList.toggle('sampled',((i*7+seed)%24)<n));host.querySelector('[data-data-output]').textContent=`${n} sampling units · relative sampling uncertainty ≈ ${Math.round(100/Math.sqrt(n))}%`;};sample.addEventListener('input',update);host.querySelector('[data-randomise]').addEventListener('click',()=>{seed=(seed+7)%24;update();});update();
  }
  function initGenetics(host){
    const p1=host.querySelector('[data-p1]'),p2=host.querySelector('[data-p2]');const gametes=g=>g==='AA'?['A','A']:g==='aa'?['a','a']:['A','a'];const update=()=>{const a=gametes(p1.value),b=gametes(p2.value),kids=[a[0]+b[0],a[0]+b[1],a[1]+b[0],a[1]+b[1]].map(x=>x.split('').sort().join(''));host.querySelector('[data-punnett]').innerHTML=kids.map(x=>`<b>${x}</b>`).join('');const dom=kids.filter(x=>x.includes('A')).length;host.querySelector('[data-genetics-output]').textContent=`Predicted dominant phenotype: ${dom}/4 · recessive phenotype: ${4-dom}/4`;};[p1,p2].forEach(x=>x.addEventListener('change',update));update();
  }
  function initHardy(host){
    const q=host.querySelector('[data-q]');const update=()=>{const qv=+q.value/100,p=1-qv;host.querySelector('[data-q-o]').value=qv.toFixed(2);host.querySelector('[data-hardy-p]').textContent=p.toFixed(2);host.querySelector('[data-hardy-aa]').textContent=`p² = ${(p*p).toFixed(3)}`;host.querySelector('[data-hardy-het]').textContent=`2pq = ${(2*p*qv).toFixed(3)}`;host.querySelector('[data-hardy-rec]').textContent=`q² = ${(qv*qv).toFixed(3)}`;host.querySelector('[data-hardy-check]').textContent=`Check: ${(p*p+2*p*qv+qv*qv).toFixed(3)} = 1.000`;};q.addEventListener('input',update);update();
  }
  function initPopulation(host){
    const a=host.querySelector('[data-pop-a]'),b=host.querySelector('[data-pop-b]');let run=0;const update=()=>{host.querySelector('[data-pop-a-o]').value=a.value;host.querySelector('[data-pop-b-o]').value=b.value;const vals=Array.from({length:10},(_,i)=>clamp((+b.value)+(i+run)*(+a.value-50)/8,5,100));host.querySelectorAll('[data-pop-bars] i').forEach((x,i)=>x.style.setProperty('--h',`${vals[i]}%`));host.querySelector('[data-pop-output]').textContent=`Generation 10 indicator: ${Math.round(vals[9])}%`;};[a,b].forEach(x=>x.addEventListener('input',update));host.querySelector('[data-pop-run]').addEventListener('click',()=>{run=(run+2)%8;update();});update();
  }
  function initGeneTech(host){
    const cycles=host.querySelector('[data-cycles]'),fragment=host.querySelector('[data-fragment]');const sync=()=>{host.querySelector('[data-cycles-o]').value=cycles.value;host.querySelector('[data-fragment-o]').value=fragment.value;};cycles.addEventListener('input',sync);fragment.addEventListener('input',sync);host.querySelector('[data-pcr]').addEventListener('click',()=>{const copies=2**(+cycles.value);host.querySelector('[data-pcr-copies]').textContent=`${copies.toLocaleString()} theoretical copies`;host.querySelector('[data-gene-message]').textContent='Each ideal PCR cycle doubles the target DNA amount.';});host.querySelector('[data-gel-run]').addEventListener('click',()=>{const distance=clamp(88-(+fragment.value/1500)*70,12,84);host.querySelector('[data-gel] i:first-child').style.setProperty('--y',`${distance}%`);host.querySelector('[data-gene-message]').textContent=`${fragment.value} bp fragment moved to a relative position of ${Math.round(distance)}%.`;});sync();
  }

  const initialisers={molecule:initMolecule,enzyme:initEnzyme,dna:initDna,cell:initCell,transport:initTransport,process:initProcess,diffusion:initDiffusion,energy:initEnergy,homeostasis:initHomeostasis,data:initData,genetics:initGenetics,hardy:initHardy,population:initPopulation,geneTech:initGeneTech};

  function render(context){
    const {config,section}=context||{};if(config?.subject!=='Biology'||!section)return false;
    const def=definitions[String(section.ref)];if(!def)return false;
    const lesson=document.getElementById('biologyLessonContent');if(!lesson)return false;
    lesson.querySelector('[data-bio-interactive]')?.remove();
    const renderer=renderers[def.kind];if(!renderer)return false;
    lesson.insertAdjacentHTML('beforeend',renderer(def));
    const host=lesson.querySelector('[data-bio-interactive]');initialisers[def.kind]?.(host,def);return true;
  }

  window.ALEVEL_BIOLOGY_INTERACTIVES=Object.freeze({
    version:'phase-7',refs,definitions,coverage:refs.length,render
  });
})();