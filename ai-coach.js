(()=>{
  'use strict';

  const panel=document.getElementById('coachPanel');
  const backdrop=document.getElementById('coachBackdrop');
  const messagesEl=document.getElementById('coachMessages');
  const input=document.getElementById('coachInput');
  const form=document.getElementById('coachForm');
  const modeEl=document.getElementById('coachMode');
  const statusEl=document.getElementById('coachStatus');
  const contextLabel=document.getElementById('coachContextLabel');
  const sendBtn=document.getElementById('coachSend');
  const historyKey='alevel-physics-coach-history-v1';
  let history=loadHistory();
  let busy=false;

  const fallbackKnowledge={
    measurements:{
      ideas:['Use SI units consistently and convert prefixes before substituting into equations.','Random uncertainty affects spread; systematic error shifts readings in the same direction.','Percentage uncertainty is especially useful when combining measured quantities.'],
      mistakes:['mixing absolute and percentage uncertainty','using too many significant figures','forgetting uncertainty in gradients or derived quantities'],
      calc:'A length is measured as 0.842 m ± 0.003 m. Calculate its percentage uncertainty.'
    },
    particles:{
      ideas:['Conservation laws constrain whether particle interactions can occur.','Antiparticles have the same rest mass as their partner but opposite charge and relevant quantum numbers.','Photon energy is E = hf and pair production requires enough energy for rest mass plus any kinetic energy.'],
      mistakes:['confusing hadrons with leptons','forgetting baryon or lepton number conservation','using electronvolts without converting when joules are required'],
      calc:'Calculate the energy of a photon with frequency 6.0 × 10^14 Hz using E = hf.'
    },
    waves:{
      ideas:['Wave speed, frequency and wavelength are linked by v = fλ.','Superposition explains interference and stationary waves.','Phase difference is central to interference, diffraction and stationary-wave reasoning.'],
      mistakes:['confusing amplitude with intensity','measuring angles from the surface instead of the normal','using path difference and phase difference interchangeably'],
      calc:'A wave travels at 340 m s⁻¹ with frequency 680 Hz. Calculate its wavelength.'
    },
    'mechanics-materials':{
      ideas:['Start mechanics problems with a force diagram and a clear positive direction.','Momentum is conserved for an isolated system; kinetic energy is not necessarily conserved.','Stress, strain and Young modulus describe how materials respond within the elastic region.'],
      mistakes:['treating vector quantities as scalars','mixing mass and weight','using original length instead of extension when calculating strain'],
      calc:'A 2.0 kg object accelerates at 3.5 m s⁻². Calculate the resultant force.'
    },
    electricity:{
      ideas:['Current is rate of flow of charge: I = Q/t.','Potential difference is energy transferred per unit charge.','For a source with internal resistance, terminal pd falls as current increases: V = ε − Ir.'],
      mistakes:['confusing emf with terminal pd','adding parallel resistances directly','using power equations without checking which quantities are known'],
      calc:'A 12 V supply drives 2.0 A through a circuit. Calculate the electrical power transferred.'
    },
    'further-mechanics':{
      ideas:['Centripetal acceleration points towards the centre of circular motion.','In SHM, acceleration is proportional to displacement and opposite in direction: a = −ω²x.','The ideal gas model links macroscopic variables to microscopic particle motion.'],
      mistakes:['treating centripetal force as an extra force','losing the negative sign in SHM acceleration','using Celsius rather than kelvin in gas equations'],
      calc:'A 0.50 kg mass moves in a circle of radius 0.80 m at 4.0 m s⁻¹. Calculate the centripetal force.'
    },
    fields:{
      ideas:['Field strength describes force per unit test quantity.','Potential is energy per unit mass or charge and is a scalar.','Magnetic force depends on charge/current, field strength and orientation.'],
      mistakes:['confusing field strength with potential','forgetting the sign of charge','using the wrong angle in F = BIL sinθ or F = BQv sinθ'],
      calc:'A charge of 2.0 μC experiences a force of 0.030 N. Calculate the electric field strength.'
    },
    nuclear:{
      ideas:['Radioactive decay is random for an individual nucleus but predictable statistically for a large sample.','Activity obeys A = λN and half-life is related to decay constant by t½ = ln2/λ.','Binding energy comes from mass defect through E = mc².'],
      mistakes:['treating half-life as a linear decrease','confusing activity with number of undecayed nuclei','mixing atomic mass units and kilograms without conversion'],
      calc:'A source has a half-life of 6.0 h. What fraction of the original nuclei remain after 18 h?'
    }
  };

  function loadHistory(){
    try{
      const parsed=JSON.parse(localStorage.getItem(historyKey)||'[]');
      return Array.isArray(parsed)?parsed.slice(-16):[];
    }catch{return []}
  }
  function saveHistory(){
    localStorage.setItem(historyKey,JSON.stringify(history.slice(-16)));
  }
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function formatText(text){
    return escapeHtml(text).replace(/\n/g,'<br>');
  }
  function appendMessage(role,text,persist=true){
    const box=document.createElement('div');
    box.className=`coach-message ${role}`;
    box.innerHTML=`<strong>${role==='user'?'You':'Physics Coach'}</strong><p>${formatText(text)}</p>`;
    messagesEl.appendChild(box);
    messagesEl.scrollTop=messagesEl.scrollHeight;
    if(persist){history.push({role,text:String(text).slice(0,5000)});saveHistory();}
    return box;
  }
  function restoreMessages(){
    if(!history.length)return;
    messagesEl.innerHTML='';
    history.forEach(m=>appendMessage(m.role,m.text,false));
  }
  function setStatus(label,state='ready'){
    statusEl.classList.toggle('thinking',state==='thinking');
    statusEl.classList.toggle('offline',state==='offline');
    statusEl.querySelector('span:last-child').textContent=label;
  }
  function openCoach(){
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
    backdrop.hidden=false;
    updateContextLabel();
    setTimeout(()=>input.focus(),80);
  }
  function closeCoach(){
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    backdrop.hidden=true;
  }
  function context(){return window.CourseApp?.getActiveContext?.()||{topicId:'measurements',code:'AQA 3.1',title:'Measurements and their errors',moduleLabel:'Measurements & Errors',pageText:''};}
  function updateContextLabel(){
    const c=context();
    contextLabel.textContent=`${c.code} · ${c.title}${c.moduleLabel?` · ${c.moduleLabel}`:''}`;
  }

  async function askLiveAI(payload){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),30000);
    try{
      const res=await fetch('/api/physics-coach',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload),
        signal:controller.signal
      });
      if(!res.ok)throw new Error(`AI endpoint ${res.status}`);
      const data=await res.json();
      if(!data?.answer)throw new Error('AI response missing answer');
      return data;
    }finally{clearTimeout(timeout);}
  }

  function offlineCoach(payload){
    const c=payload.context||context();
    const k=fallbackKnowledge[c.topicId]||fallbackKnowledge.measurements;
    const q=payload.message.toLowerCase();
    const mode=payload.mode;

    if(mode==='quiz'||/quiz|question|test me|retrieval/.test(q)){
      return `Built-in course coach · ${c.code}\n\nQuestion: ${k.ideas[Math.floor(Math.random()*k.ideas.length)].replace(/\.$/,'')} — explain why this is important and give one equation or example linked to it.\n\nI will check your reasoning when you reply.`;
    }
    if(mode==='hint'){
      return `Built-in course coach · ${c.code}\n\nHint 1: identify the quantity you are trying to find and write down the relevant relationship before putting numbers in.\n\nHint 2: check every value is in SI units.\n\nFor this topic, remember: ${k.ideas[0]}\n\nSend me your next step and I will guide you from there.`;
    }
    if(mode==='worked'||/calculation|calculate|worked|example/.test(q)){
      return `Built-in course coach · ${c.code}\n\nPractice calculation: ${k.calc}\n\nMethod:\n1. List the known quantities with units.\n2. Write the equation before substituting.\n3. Convert to SI units if needed.\n4. Substitute and calculate.\n5. Give the final unit and sensible significant figures.\n\nTry it first. If you send your working, I can check each step.`;
    }
    if(mode==='exam'||/exam|mistake|mark|feedback/.test(q)){
      return `Built-in course coach · ${c.code}\n\nCommon exam traps in this topic:\n• ${k.mistakes[0]}\n• ${k.mistakes[1]}\n• ${k.mistakes[2]}\n\nFor a strong answer, define the physics clearly, use the correct equation or principle, show working, include units, and link each statement to the question rather than listing facts.`;
    }
    const pageHint=c.pageText?`\n\nI can also see the current lesson page, so ask me about a specific equation, paragraph or activity shown there.`:'';
    return `Built-in course coach · ${c.code} ${c.title}\n\nKey ideas:\n• ${k.ideas[0]}\n• ${k.ideas[1]}\n• ${k.ideas[2]}${pageHint}\n\nAsk me to explain one of these, quiz you, or give you a calculation.`;
  }

  async function send(message){
    if(busy)return;
    const clean=String(message||'').trim();
    if(!clean)return;
    busy=true;
    sendBtn.disabled=true;
    appendMessage('user',clean);
    input.value='';
    setStatus('Thinking…','thinking');

    const typing=document.createElement('div');
    typing.className='coach-message assistant';
    typing.innerHTML='<strong>Physics Coach</strong><div class="coach-thinking" aria-label="Thinking"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop=messagesEl.scrollHeight;

    const payload={
      message:clean,
      mode:modeEl.value,
      context:context(),
      history:history.slice(-8)
    };

    try{
      const live=await askLiveAI(payload);
      typing.remove();
      appendMessage('assistant',live.answer);
      setStatus(live.model?`Live AI · ${String(live.model).split('/').pop()}`:'Live AI');
    }catch{
      typing.remove();
      appendMessage('assistant',offlineCoach(payload));
      setStatus('Built-in coach','offline');
    }finally{
      busy=false;
      sendBtn.disabled=false;
      input.focus();
    }
  }

  form.addEventListener('submit',e=>{e.preventDefault();send(input.value);});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
  document.getElementById('coachToggle').addEventListener('click',openCoach);
  document.getElementById('coachFab').addEventListener('click',openCoach);
  document.getElementById('heroCoachBtn').addEventListener('click',openCoach);
  document.getElementById('workspaceCoachBtn').addEventListener('click',openCoach);
  document.getElementById('coachClose').addEventListener('click',closeCoach);
  backdrop.addEventListener('click',closeCoach);
  document.getElementById('coachClear').addEventListener('click',()=>{
    history=[];saveHistory();messagesEl.innerHTML='';
    appendMessage('assistant','Chat cleared. I am ready to help with the current AQA Physics topic.',false);
    setStatus('Ready');
  });
  document.querySelectorAll('[data-coach-prompt]').forEach(btn=>btn.addEventListener('click',()=>{
    const text=btn.dataset.coachPrompt;
    if(/Quiz me/i.test(btn.textContent))modeEl.value='quiz';
    if(/Calculation/i.test(btn.textContent))modeEl.value='worked';
    openCoach();send(text);
  }));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open'))closeCoach();});
  window.addEventListener('coursecontextchange',updateContextLabel);

  restoreMessages();
  updateContextLabel();
})();
