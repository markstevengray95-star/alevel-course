(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean = value => String(value ?? '').replace(/\s+/g,' ').trim();
  const list = value => Array.isArray(value) ? value.filter(Boolean) : [];

  let panel=null, button=null, currentProfile=null, stages=[], stageIndex=0, observer=null;

  function shell(){ return document.querySelector('.lesson-presentation-shell'); }
  function deck(){ return shell()?.querySelector('.deep-deck'); }
  function dock(){ return shell()?.querySelector('.presentation-control-dock'); }
  function activeId(){ return window.ALEVEL_DEEPENING?.activeLessonId || window.ALEVEL_PRIMARY_PRESENTATION?.activeLessonId || window.ALEVEL_ACTIVE_LESSON?.id || null; }
  function profile(){ const id=activeId(); return id ? window.ALEVEL_PHASE3?.profile?.(id) : null; }
  function isPractical(p){ return !!p && (p.type==='practical' || /required practical|practical|investigat(e|ion)/i.test(`${p.title} ${p.focus || ''}`)); }
  function modelFor(p){ return clean(p?.primaryEquation?.[1] || p?.equations?.[0]?.[1] || p?.concept?.model || 'the relevant physics model'); }

  function practicalKind(p){
    const text=`${p?.title || ''} ${p?.focus || ''}`.toLowerCase();
    if(/radioactive|radiation|inverse.square|alpha|beta|gamma|count rate/.test(text)) return 'radiation-data';
    if(/resistivity|wire.*resistance/.test(text)) return 'resistivity';
    if(/i.?v|current.?voltage|characteristic/.test(text)) return 'iv';
    if(/internal resistance|emf/.test(text)) return 'emf';
    if(/young|stress|strain|extension|material/.test(text)) return 'materials';
    if(/stationary|wave|frequency|wavelength/.test(text)) return 'waves';
    if(/projectile|acceleration|motion|force|momentum/.test(text)) return 'mechanics';
    if(/shm|oscillat|spring|pendulum/.test(text)) return 'shm';
    if(/capacitor|time constant|charge|discharge/.test(text)) return 'capacitor';
    if(/specific heat|thermal|latent|gas/.test(text)) return 'thermal';
    if(/field|magnetic|induction/.test(text)) return 'fields';
    return 'general';
  }

  function contextFor(p){
    const kind=practicalKind(p), model=modelFor(p), focus=clean(p.focus || p.title);
    const base={
      aim:[`Investigate ${focus}.`,`Collect repeatable quantitative evidence that can be tested against ${model}.`],
      variables:['Identify the independent variable before collecting data.','Identify the dependent variable and how it will be measured.','List the control variables that must stay constant for a fair comparison.'],
      equipment:['Use the school-approved apparatus specified for this lesson.','Choose measuring instruments with suitable range and resolution.','Record instrument resolution before taking measurements.'],
      apparatus:['Sketch the apparatus before starting and label each measured quantity.','Show exactly where each measurement is taken.','Check that the arrangement allows the independent variable to be changed without altering control variables.'],
      method:['Set up the apparatus using the approved school method.','Change only the independent variable between readings.','Take a suitable range of values and repeat measurements where appropriate.','Record raw measurements immediately with units.'],
      safety:['Follow the school risk assessment and teacher/technician instructions.','Keep the workspace organised and identify any electrical, thermal, optical or mechanical hazard before starting.','Stop and ask the supervising adult if equipment behaves unexpectedly.'],
      measurements:['Use a results table with quantity and unit in each heading.','Record raw data to the precision of the measuring instrument.','Take repeats where they improve reliability and note anomalous readings rather than silently deleting them.'],
      results:['Calculate derived quantities only after the raw data table is complete.','Keep units consistent and avoid premature rounding.','Show one sample calculation so the processing can be checked.'],
      graph:['Put the independent variable on the x-axis and the dependent/derived quantity on the y-axis.','Choose sensible linear scales that use most of the graph area.','Plot points carefully, add uncertainty/error bars where appropriate, and draw a best-fit line or curve.'],
      analysis:[`Use the graph, gradient, intercept or pattern to test ${model}.`,'Link the numerical result back to the physical model rather than only describing the graph.','Check whether the magnitude and units of the result are physically sensible.'],
      uncertainty:['Identify the measurements that contribute most to the uncertainty.','Use instrument resolution, repeat spread and percentage uncertainty appropriately.','Explain how uncertainty affects the final conclusion rather than simply listing sources of error.'],
      evaluation:['Identify the main limitation in the evidence.','Explain the direction or size of its effect on the result.','Propose a specific practical improvement and explain why it would improve the evidence.']
    };

    const overrides={
      resistivity:{
        variables:['Independent variable: conductor length or another planned geometry variable.','Dependent variable: resistance calculated from measured potential difference and current.','Controls: material, temperature and cross-sectional area where length is varied.'],
        equipment:['Low-voltage d.c. supply, switch, ammeter and voltmeter.','Test wire/conductor, metre rule and connection leads.','Micrometer or equivalent school instrument for diameter measurements.'],
        measurements:['Measure potential difference and current for each chosen wire length.','Measure diameter at several positions if appropriate and calculate cross-sectional area.','Allow for heating effects by following the approved low-current school method.'],
        graph:['Plot resistance against length when material and area are controlled.','Use the best-fit gradient with cross-sectional area to determine resistivity.','Quote the final value with unit Ω m and an uncertainty statement.']
      },
      iv:{
        variables:['Independent variable: potential difference across the component.','Dependent variable: current through the component.','Controls: component type and temperature where required.'],
        equipment:['Low-voltage d.c. supply, ammeter, voltmeter and variable resistor/current control.','School-approved component under test and connection leads.'],
        graph:['Plot current against potential difference using the convention required by the lesson.','Use the shape/gradient to describe whether resistance is constant.','Compare positive and negative p.d. where the component behaviour requires it.']
      },
      emf:{
        variables:['Independent variable: current drawn from the source.','Dependent variable: terminal potential difference.','Controls: source condition and circuit temperature as far as practicable.'],
        graph:['Plot terminal p.d. V against current I.','Use V = ε − Ir: intercept gives emf and gradient magnitude gives internal resistance.','State units for both quantities and discuss scatter/uncertainty.']
      },
      materials:{
        variables:['Independent variable: applied force/load within the approved range.','Dependent variable: extension.','Controls: original length, material and cross-sectional area.'],
        graph:['Plot force-extension or stress-strain as required by the lesson.','Identify the linear region before using a gradient-derived property.','Do not extend conclusions beyond the range supported by the data.']
      },
      waves:{
        variables:['Independent variable: frequency, length, separation or geometry specified by the lesson.','Dependent variable: wavelength/pattern position or another measurable wave quantity.','Controls: medium, tension and boundary conditions where relevant.'],
        safety:['Use only school-approved optical/wave equipment under supervision.','Do not look directly into bright optical sources; follow the school eye-safety controls.','Keep cables, stands and vibrating equipment secure.']
      },
      mechanics:{
        variables:['Independent variable: force, mass, launch condition or another quantity specified by the lesson.','Dependent variable: acceleration, time, displacement or velocity.','Controls: track/geometry, start condition and frictional conditions where relevant.'],
        equipment:['School dynamics apparatus such as trolley/track or equivalent approved setup.','Timing/light-gate or motion-sensing equipment where provided.','Masses, ruler and other measuring equipment specified by the teacher.'],
        safety:['Keep moving apparatus within the controlled track/work area.','Secure masses and stands; keep feet/hands clear of falling or moving equipment.','Follow the approved school setup before releasing any moving object.']
      },
      shm:{
        variables:['Independent variable: mass, length or another planned oscillator parameter.','Dependent variable: period, frequency or displacement.','Controls: amplitude range and oscillator geometry where appropriate.'],
        measurements:['Time multiple oscillations where appropriate rather than relying on one period.','Repeat timing and use a mean.','Keep amplitude within the regime assumed by the model.']
      },
      capacitor:{
        variables:['Independent variable: time during charge/discharge or a circuit parameter such as resistance.','Dependent variable: capacitor potential difference or current.','Controls: initial voltage and component values not being varied.'],
        safety:['Use only the low-voltage school circuit provided.','Discharge circuits only by the approved school method; do not short components directly.','Check polarity for polarised capacitors before the circuit is energised.']
      },
      thermal:{
        variables:['Independent variable: heating time/input energy or chosen thermal variable.','Dependent variable: temperature or another thermal response.','Controls: sample mass, insulation and environmental conditions where practicable.'],
        safety:['Use school-approved heating equipment only under supervision.','Treat hot apparatus as hot even after power is removed.','Keep liquids/electrical equipment arranged according to the school risk assessment.']
      },
      fields:{
        variables:['Independent variable: field-related quantity or geometry specified by the lesson.','Dependent variable: induced p.d., force, field response or other measured quantity.','Controls: orientation, geometry and equipment settings not intentionally varied.']
      },
      'radiation-data':{
        aim:[`Analyse teacher-provided, simulated or previously collected radiation data linked to ${focus}.`,`Use the data to test the expected relationship without students handling radioactive sources.`],
        variables:['Identify the independent variable represented in the supplied dataset.','Identify the measured count-rate/activity quantity and any background correction supplied.','State which conditions would need controlling in a supervised school investigation.'],
        equipment:['Use the app simulation, spreadsheet/graphing tools or teacher-provided dataset.','Any real radioactive-source apparatus remains under authorised staff control and is not handled by students.'],
        apparatus:['Interpret the labelled teacher-prepared/simulated setup diagram.','Identify detector position, measured quantities and the data that would be recorded.','Do not reproduce source-handling procedures.'],
        method:['Use the supplied or simulated dataset.','Apply any stated background correction.','Process the values, plot the required graph and test the model mathematically.'],
        safety:['Students do not handle radioactive sources.','Any real source work must follow the school/technician-approved procedure and be carried out by authorised staff.','For student work, use simulation, demonstration data or pre-collected measurements.'],
        measurements:['Work from the supplied count-rate/activity dataset.','Keep raw and background-corrected values distinct.','Quote count-rate units and statistical/measurement uncertainty where provided.']
      }
    };
    return {...base,...(overrides[kind] || {}),kind,model,focus};
  }

  function buildStages(p){
    const c=contextFor(p);
    const exam=list(p.exam).find(q=>Number(q.marks)>=4) || list(p.exam)[0];
    return [
      ['Aim','What are we testing?',c.aim],
      ['Variables','Plan the investigation',c.variables],
      ['Equipment','What is needed?',c.equipment],
      ['Apparatus','Build the measurement model',c.apparatus],
      ['Method','Collect valid evidence',c.method],
      ['Safety','Work within the approved controls',c.safety],
      ['Measurements','Record raw data properly',c.measurements],
      ['Results','Process the data',c.results],
      ['Graph','Turn data into evidence',c.graph],
      ['Analysis','Use the physics model',c.analysis],
      ['Uncertainty','Quantify confidence',c.uncertainty],
      ['Evaluation','Improve the evidence',c.evaluation],
      ['Exam question','Apply practical skills under exam conditions',[clean(exam?.q || `Evaluate an investigation of ${p.title.toLowerCase()}, including variables, uncertainty, data analysis and one justified improvement.`),`AQA reference: ${clean(p.ref || 'mapped lesson reference')}.`,`Model to connect to the evidence: ${c.model}.`]]
    ].map((item,index)=>({index,title:item[0],subtitle:item[1],bullets:item[2]}));
  }

  function ensurePanel(){
    const d=deck();
    if(!d || panel?.isConnected) return panel;
    panel=document.createElement('section');
    panel.className='p7-practical-panel';
    panel.hidden=true;
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','Required practical presentation');
    panel.innerHTML=`
      <header class="p7-head"><div><span>Required practical</span><h2 data-p7-title></h2><p data-p7-ref></p></div><button type="button" data-p7-close aria-label="Close practical deck">×</button></header>
      <div class="p7-body">
        <nav class="p7-stage-list" data-p7-list aria-label="Practical stages"></nav>
        <article class="p7-stage" data-p7-stage></article>
      </div>
      <footer class="p7-foot"><strong data-p7-count></strong><div><button type="button" data-p7-prev>← Previous</button><button type="button" class="primary" data-p7-next>Next →</button></div></footer>`;
    d.appendChild(panel);
    panel.addEventListener('click',event=>{
      if(event.target.closest('[data-p7-close]')) close();
      if(event.target.closest('[data-p7-prev]')) move(-1);
      if(event.target.closest('[data-p7-next]')) move(1);
      const jump=event.target.closest('[data-p7-index]');
      if(jump){ stageIndex=Number(jump.dataset.p7Index); render(); }
    });
    return panel;
  }

  function ensureButton(){
    const bar=dock();
    if(!bar) return;
    button=bar.querySelector('[data-p7-practical]');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.dataset.p7Practical='';
      button.textContent='Practical';
      button.title='Open required practical sequence (G)';
      const reveal=bar.querySelector('[data-p4-reveal]');
      if(reveal) reveal.insertAdjacentElement('afterend',button); else bar.prepend(button);
      button.addEventListener('click',()=>panel?.hidden===false ? close() : open());
    }
  }

  function render(){
    const host=ensurePanel();
    if(!host || !currentProfile || !stages.length) return;
    stageIndex=Math.max(0,Math.min(stages.length-1,stageIndex));
    const stage=stages[stageIndex];
    host.querySelector('[data-p7-title]').textContent=currentProfile.title;
    host.querySelector('[data-p7-ref]').textContent=`AQA ${currentProfile.ref || ''} · practical skills sequence`;
    host.querySelector('[data-p7-count]').textContent=`Stage ${stageIndex+1} / ${stages.length}`;
    host.querySelector('[data-p7-stage]').innerHTML=`<span class="p7-eyebrow">${esc(stage.title)}</span><h3>${esc(stage.subtitle)}</h3><ol>${list(stage.bullets).map(item=>`<li>${esc(item)}</li>`).join('')}</ol>`;
    host.querySelector('[data-p7-list]').innerHTML=stages.map((item,index)=>`<button type="button" data-p7-index="${index}" class="${index===stageIndex?'active':''}"><b>${index+1}</b><span>${esc(item.title)}</span></button>`).join('');
    host.querySelector('[data-p7-prev]').disabled=stageIndex===0;
    host.querySelector('[data-p7-next]').disabled=stageIndex===stages.length-1;
  }

  function open(){
    currentProfile=profile();
    if(!isPractical(currentProfile)) return false;
    stages=buildStages(currentProfile);
    stageIndex=0;
    ensurePanel().hidden=false;
    deck()?.classList.add('p7-practical-open');
    render();
    return true;
  }
  function close(){
    if(panel) panel.hidden=true;
    deck()?.classList.remove('p7-practical-open');
  }
  function move(delta){ stageIndex=Math.max(0,Math.min(stages.length-1,stageIndex+delta)); render(); }

  function refresh(){
    currentProfile=profile();
    ensureButton();
    const available=isPractical(currentProfile);
    if(button){ button.hidden=!available; button.disabled=!available; }
    if(!available) close();
  }

  function keydown(event){
    if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]')) return;
    if(event.key==='g' || event.key==='G'){
      if(isPractical(profile())){
        event.preventDefault();
        event.stopImmediatePropagation();
        panel?.hidden===false ? close() : open();
      }
      return;
    }
    if(panel?.hidden===false){
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}
      else if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();event.stopImmediatePropagation();move(-1);}
      else if(event.key==='ArrowRight'||event.key==='PageDown'||event.key===' '||event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();move(1);}
    }
  }

  function start(){
    if(!shell() || !dock()){ window.setTimeout(start,100); return; }
    ensurePanel(); ensureButton(); refresh();
    observer=new MutationObserver(()=>window.requestAnimationFrame(refresh));
    observer.observe(shell(),{subtree:true,childList:true,characterData:true});
  }

  window.addEventListener('keydown',keydown,true);
  window.addEventListener('alevel:lesson-selected',()=>window.setTimeout(refresh,160));
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();

  window.ALEVEL_PRACTICAL_PRESENTATION={open,close,refresh,isPractical,build:p=>buildStages(p || profile())};
})();