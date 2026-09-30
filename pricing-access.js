(()=>{
  'use strict';

  const STORAGE_KEY='alevel-course-plan-v1';
  const PREVIEW_TOPIC='measurements';
  const VALID_PLANS=['free','plus','pro','teacher'];
  const PLAN_RANK={free:0,plus:1,pro:2,teacher:3};

  const PLANS={
    free:{
      id:'free',name:'Free',eyebrow:'Explore the course',rank:0,
      monthly:0,annual:0,
      summary:'Try the AQA Physics course before upgrading.',
      features:['Course map and progress preview','Measurements topic preview','Sample lesson presentations','Upgrade at any time']
    },
    plus:{
      id:'plus',name:'Plus',eyebrow:'Full learning course',rank:1,
      monthly:4.99,annual:39.99,
      summary:'Everything needed to learn the full AQA course.',
      features:['Full AQA A-level Physics course','Complete textbook','Student notebook','Interactive simulations','All lesson presentations']
    },
    pro:{
      id:'pro',name:'Pro',eyebrow:'Complete student access',rank:2,
      monthly:7.99,annual:59.99,
      summary:'The full course plus assessment, feedback and advanced tools.',
      features:['Everything in Plus','Exam Practice & Marking','AQA-style exam-question tools','Required Practical Lab','AI Physics Coach','Auto-marking and mastery checks','A* synoptic challenges and progression tools']
    },
    teacher:{
      id:'teacher',name:'Teacher',eyebrow:'Classroom licence',rank:3,
      monthly:null,annual:89,
      summary:'Everything in Pro plus classroom and teacher planning tools.',
      features:['Everything in Pro','Teacher lesson toolkit','Presenter and classroom controls','Copyable lesson plans','Teacher questioning and differentiation prompts','Teaching resources for every lesson']
    }
  };

  const FEATURE_MIN_PLAN={
    course:'plus',
    textbook:'plus',
    notebook:'plus',
    simulations:'plus',
    practicals:'pro',
    examTools:'pro',
    aiCoach:'pro',
    activities:'pro',
    automarking:'pro',
    mastery:'pro',
    astar:'pro',
    progression:'pro',
    teacherTools:'teacher',
    presenterTools:'teacher'
  };

  const FEATURE_LABELS={
    course:'the full AQA Physics course',
    textbook:'the complete textbook',
    notebook:'the student notebook',
    simulations:'all interactive simulations',
    practicals:'the Required Practical Lab',
    examTools:'Exam Practice & Marking',
    aiCoach:'the AI Physics Coach',
    activities:'advanced lesson activities',
    automarking:'automatic answer marking',
    mastery:'lesson mastery assessments',
    astar:'A* synoptic challenges',
    progression:'advanced progress tools',
    teacherTools:'the Teacher lesson toolkit',
    presenterTools:'teacher presenter controls'
  };

  function normalisePlan(value){
    const v=String(value||'').trim().toLowerCase();
    return VALID_PLANS.includes(v)?v:null;
  }

  function initialPlan(){
    const supplied=normalisePlan(window.ALEVEL_ENTITLEMENT?.plan||document.documentElement.dataset.plan);
    if(supplied)return supplied;
    const stored=normalisePlan(localStorage.getItem(STORAGE_KEY));
    if(stored)return stored;
    if(['localhost','127.0.0.1'].includes(location.hostname)){
      const preview=normalisePlan(new URL(location.href).searchParams.get('plan-preview'));
      if(preview)return preview;
    }
    return 'free';
  }

  let currentPlan=initialPlan();
  let billing='annual';
  let gateFeature='';
  let syncQueued=false;

  function requiredPlan(feature){return FEATURE_MIN_PLAN[feature]||'free';}
  function has(feature){return PLAN_RANK[currentPlan]>=PLAN_RANK[requiredPlan(feature)];}
  function planName(id){return PLANS[id]?.name||'Free';}
  function money(value){return `£${Number(value).toFixed(value%1?2:0)}`;}
  function annualSaving(plan){
    const p=PLANS[plan];
    if(!p?.monthly||!p?.annual)return 0;
    return Math.max(0,p.monthly*12-p.annual);
  }

  function setPlan(next,{persist=false,source='entitlement'}={}){
    const value=normalisePlan(next);
    if(!value)return false;
    currentPlan=value;
    if(persist)localStorage.setItem(STORAGE_KEY,value);
    document.documentElement.dataset.accessPlan=value;
    document.body?.setAttribute('data-access-plan',value);
    syncAccessUi();
    window.dispatchEvent(new CustomEvent('alevel:plan-changed',{detail:{plan:value,source}}));
    return true;
  }

  function applyEntitlement(payload){
    const plan=normalisePlan(typeof payload==='string'?payload:payload?.plan);
    if(!plan)return false;
    return setPlan(plan,{persist:false,source:'verified-entitlement'});
  }

  function checkoutUrl(plan,period){
    const config=window.ALEVEL_CHECKOUT_URLS||{};
    const value=config?.[plan];
    if(typeof value==='string')return value;
    return value?.[period]||value?.annual||'';
  }

  function planAction(plan,period=billing){
    if(plan===currentPlan)return;
    if(plan==='free'){
      window.dispatchEvent(new CustomEvent('alevel:plan-downgrade-requested',{detail:{plan:'free'}}));
      announce('Plan changes are managed through your account.');
      return;
    }
    const url=checkoutUrl(plan,period);
    const detail={plan,period,price:PLANS[plan]?.[period]??PLANS[plan]?.annual};
    window.dispatchEvent(new CustomEvent('alevel:checkout-requested',{detail}));
    if(url){location.href=url;return;}
    announce(`${planName(plan)} is ready in the app. Connect its checkout link to start taking payments.`);
  }

  function pricingCards(compact=false){
    return VALID_PLANS.map(id=>{
      const p=PLANS[id];
      const featured=id==='pro'?' featured':'';
      const current=id===currentPlan?' current':'';
      const price=id==='teacher'?`${money(p.annual)}<small>/year</small>`:id==='free'?'£0<small>forever</small>':billing==='monthly'?`${money(p.monthly)}<small>/month</small>`:`${money(p.annual)}<small>/year</small>`;
      const save=id!=='free'&&id!=='teacher'&&billing==='annual'?`<span class="plan-save">Save ${money(annualSaving(id))}/year</span>`:'';
      const list=compact?p.features.slice(0,4):p.features;
      const label=id===currentPlan?'Current plan':id==='free'?'Free plan':`Choose ${p.name}`;
      return `<article class="pricing-card${featured}${current}" data-pricing-plan="${id}">
        ${id==='pro'?'<span class="pricing-popular">Most complete</span>':''}
        <span class="pricing-eyebrow">${p.eyebrow}</span>
        <div class="pricing-title-row"><h3>${p.name}</h3>${id===currentPlan?'<span class="current-pill">Current</span>':''}</div>
        <div class="pricing-price">${price}</div>${save}
        <p>${p.summary}</p>
        <ul>${list.map(item=>`<li><span>✓</span>${item}</li>`).join('')}</ul>
        <button type="button" class="pricing-action" data-plan-action="${id}" ${id===currentPlan?'disabled':''}>${label}</button>
      </article>`;
    }).join('');
  }

  function ensurePricingSection(){
    if(document.getElementById('pricingSection'))return;
    const tools=document.getElementById('courseTools');
    if(!tools)return;
    const section=document.createElement('section');
    section.id='pricingSection';
    section.className='pricing-section';
    section.setAttribute('aria-label','Access plans');
    section.innerHTML=`
      <div class="pricing-heading">
        <div><span class="eyebrow">Simple access</span><h2>Choose the level of support you need.</h2><p>Start free, unlock the full learning course with Plus, or add assessment and advanced tools with Pro.</p></div>
        <div class="billing-toggle" role="group" aria-label="Billing period">
          <button type="button" data-billing="monthly">Monthly</button>
          <button type="button" data-billing="annual" class="active">Annual <span>best value</span></button>
        </div>
      </div>
      <div class="pricing-grid" data-pricing-grid>${pricingCards(false)}</div>
      <p class="pricing-note">Teacher is an individual teacher licence. School plans are not currently offered.</p>`;
    tools.after(section);
  }

  function ensureHeaderPlan(){
    if(document.getElementById('currentPlanButton'))return;
    const progress=document.querySelector('.header-progress');
    if(!progress)return;
    const button=document.createElement('button');
    button.type='button';
    button.id='currentPlanButton';
    button.className='current-plan-button';
    button.setAttribute('data-open-pricing','');
    button.innerHTML='<span>Plan</span><strong data-current-plan-name>Free</strong>';
    progress.before(button);
  }

  function ensureGate(){
    if(document.getElementById('planGate'))return;
    const gate=document.createElement('div');
    gate.id='planGate';
    gate.className='plan-gate';
    gate.hidden=true;
    gate.innerHTML=`<div class="plan-gate-backdrop" data-gate-close></div><section class="plan-gate-card" role="dialog" aria-modal="true" aria-labelledby="planGateTitle">
      <button class="plan-gate-close" type="button" data-gate-close aria-label="Close">×</button>
      <span class="plan-gate-eyebrow" data-gate-eyebrow>Upgrade</span>
      <h2 id="planGateTitle" data-gate-title>Unlock this feature</h2>
      <p data-gate-copy></p>
      <ul data-gate-features></ul>
      <div class="plan-gate-actions"><button type="button" class="plan-gate-primary" data-gate-plan>See plan</button><button type="button" class="plan-gate-secondary" data-gate-close>Not now</button></div>
    </section>`;
    document.body.appendChild(gate);
  }

  function ensureToast(){
    if(document.getElementById('planToast'))return;
    const toast=document.createElement('div');
    toast.id='planToast';toast.className='plan-toast';toast.hidden=true;toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
    document.body.appendChild(toast);
  }

  let toastTimer=0;
  function announce(message){
    ensureToast();const toast=document.getElementById('planToast');if(!toast)return;
    toast.textContent=message;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;},4200);
  }

  function openGate(feature){
    if(has(feature))return false;
    ensureGate();gateFeature=feature;
    const gate=document.getElementById('planGate');
    const required=requiredPlan(feature), plan=PLANS[required];
    gate.querySelector('[data-gate-eyebrow]').textContent=`${plan.name} feature`;
    gate.querySelector('[data-gate-title]').textContent=`Unlock ${FEATURE_LABELS[feature]||'this feature'}`;
    gate.querySelector('[data-gate-copy]').textContent=`Your ${planName(currentPlan)} plan does not include this yet. ${plan.name} unlocks ${FEATURE_LABELS[feature]||'this feature'} and the features below.`;
    gate.querySelector('[data-gate-features]').innerHTML=plan.features.slice(0,5).map(item=>`<li><span>✓</span>${item}</li>`).join('');
    gate.querySelector('[data-gate-plan]').textContent=`See ${plan.name} plan`;
    gate.hidden=false;
    document.body.classList.add('plan-gate-open');
    requestAnimationFrame(()=>gate.querySelector('[data-gate-plan]')?.focus());
    return true;
  }

  function closeGate(){
    const gate=document.getElementById('planGate');if(!gate)return;
    gate.hidden=true;gateFeature='';document.body.classList.remove('plan-gate-open');
  }

  function showPricing(planId){
    closeGate();
    if(document.body.classList.contains('lesson-presentation-primary'))window.ALEVEL_PRIMARY_PRESENTATION?.notes?.();
    if(document.body.classList.contains('tool-mode'))document.getElementById('toolBack')?.click();
    if(document.body.classList.contains('course-mode'))window.CourseApp?.exitCourse?.({scroll:false});
    ensurePricingSection();
    window.setTimeout(()=>{
      const section=document.getElementById('pricingSection');
      section?.scrollIntoView({behavior:'smooth',block:'start'});
      if(planId){
        const card=section?.querySelector(`[data-pricing-plan="${planId}"]`);
        card?.classList.add('pricing-attention');
        setTimeout(()=>card?.classList.remove('pricing-attention'),1500);
      }
    },40);
  }

  function setLocked(el,feature,locked){
    if(!el)return;
    if(locked){
      const p=requiredPlan(feature);
      el.classList.add('plan-locked');
      el.dataset.planRequired=p;
      el.dataset.planRequiredLabel=planName(p);
      el.setAttribute('aria-description',`Requires ${planName(p)}`);
    }else{
      el.classList.remove('plan-locked');
      delete el.dataset.planRequired;delete el.dataset.planRequiredLabel;
      el.removeAttribute('aria-description');
    }
  }

  function lockSelectors(selector,feature){
    document.querySelectorAll(selector).forEach(el=>setLocked(el,feature,!has(feature)));
  }

  function syncTopicLocks(){
    document.querySelectorAll('.topic-card[data-id]').forEach(card=>{
      const locked=!has('course')&&card.dataset.id!==PREVIEW_TOPIC;
      setLocked(card,'course',locked);
    });
    const select=document.getElementById('quickCourseSelect');
    if(select){
      [...select.options].forEach(option=>{option.disabled=!has('course')&&option.value!==PREVIEW_TOPIC;});
    }
    ['nextCourse','workspaceNext'].forEach(id=>{
      const button=document.getElementById(id);
      if(button)setLocked(button,'course',!has('course'));
    });
  }

  function syncAdvancedSections(){
    const rules=[
      ['.mastery-assessment','mastery'],['.astar-zone','astar'],['.teacher-toolkit','teacherTools'],
      ['.automark-banner','automarking'],['.automark-actions','automarking']
    ];
    rules.forEach(([selector,feature])=>document.querySelectorAll(selector).forEach(el=>{el.hidden=!has(feature);}));
  }

  function syncPricingUi(){
    document.querySelectorAll('[data-current-plan-name]').forEach(el=>el.textContent=planName(currentPlan));
    document.querySelectorAll('[data-billing]').forEach(btn=>btn.classList.toggle('active',btn.dataset.billing===billing));
    document.querySelectorAll('[data-pricing-grid]').forEach(grid=>grid.innerHTML=pricingCards(grid.closest('.plan-gate')!==null));
  }

  function syncAccessUi(){
    if(syncQueued)return;
    syncQueued=true;
    requestAnimationFrame(()=>{
      syncQueued=false;
      document.documentElement.dataset.accessPlan=currentPlan;
      document.body?.setAttribute('data-access-plan',currentPlan);
      ensureHeaderPlan();ensurePricingSection();ensureGate();ensureToast();
      lockSelectors('#notebookToggle,#homeNotebookBtn,#toolNotebook,#mobileDockNotebook','notebook');
      lockSelectors('[data-course-tool="practicals"],#toolAreaPracticals','practicals');
      lockSelectors('[data-course-tool="marking"],#toolAreaMarking','examTools');
      lockSelectors('#coachToggle,#heroCoachBtn,#coachFab,#toolAI,#mobileDockAI,[data-coach-prompt]','aiCoach');
      lockSelectors('[data-scroll-section="lr-mastery"],[data-mastery-jump],[data-mastery-form] button','mastery');
      lockSelectors('[data-scroll-section="lr-astar"],[data-astar-check]','astar');
      lockSelectors('[data-scroll-section="lr-teacher"],[data-copy-teacher],[data-teacher-presentation]','teacherTools');
      lockSelectors('.automark-button,.automark-tutor','automarking');
      syncTopicLocks();syncAdvancedSections();syncPricingUi();
    });
  }

  function featureForClick(target){
    if(target.closest?.('[data-course-tool="marking"],#toolAreaMarking'))return 'examTools';
    if(target.closest?.('[data-course-tool="practicals"],#toolAreaPracticals'))return 'practicals';
    if(target.closest?.('#coachToggle,#heroCoachBtn,#coachFab,#toolAI,#mobileDockAI,[data-coach-prompt]'))return 'aiCoach';
    if(target.closest?.('#notebookToggle,#homeNotebookBtn,#toolNotebook,#mobileDockNotebook'))return 'notebook';
    if(target.closest?.('[data-scroll-section="lr-mastery"],[data-mastery-jump],[data-mastery-form] button'))return 'mastery';
    if(target.closest?.('[data-scroll-section="lr-astar"],[data-astar-check]'))return 'astar';
    if(target.closest?.('[data-scroll-section="lr-teacher"],[data-copy-teacher],[data-teacher-presentation]'))return 'teacherTools';
    if(target.closest?.('.automark-button,.automark-tutor'))return 'automarking';
    return '';
  }

  function lockedTopicTarget(target){
    const card=target.closest?.('.topic-card[data-id]');
    return card&&!has('course')&&card.dataset.id!==PREVIEW_TOPIC;
  }

  document.addEventListener('click',event=>{
    const target=event.target;
    if(target.closest?.('[data-gate-close]')){event.preventDefault();closeGate();return;}
    const gatePlan=target.closest?.('[data-gate-plan]');
    if(gatePlan){event.preventDefault();showPricing(requiredPlan(gateFeature));return;}
    const pricing=target.closest?.('[data-open-pricing]');
    if(pricing){event.preventDefault();showPricing();return;}
    const billingButton=target.closest?.('[data-billing]');
    if(billingButton){event.preventDefault();billing=billingButton.dataset.billing==='monthly'?'monthly':'annual';syncPricingUi();return;}
    const planButton=target.closest?.('[data-plan-action]');
    if(planButton){event.preventDefault();planAction(planButton.dataset.planAction,billing);return;}

    if(lockedTopicTarget(target)){
      event.preventDefault();event.stopImmediatePropagation();openGate('course');return;
    }
    if(!has('course')&&target.closest?.('#nextCourse,#workspaceNext')){
      event.preventDefault();event.stopImmediatePropagation();openGate('course');return;
    }
    if(!has('course')&&target.closest?.('#continueBtn')){
      event.preventDefault();event.stopImmediatePropagation();window.CourseApp?.openTopic?.(PREVIEW_TOPIC,true,0);return;
    }
    const feature=featureForClick(target);
    if(feature&&!has(feature)){
      event.preventDefault();event.stopImmediatePropagation();openGate(feature);
    }
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!document.getElementById('planGate')?.hidden){event.preventDefault();closeGate();return;}
    if((event.key==='Enter'||event.key===' ')&&lockedTopicTarget(event.target)){
      event.preventDefault();event.stopImmediatePropagation();openGate('course');
    }
  },true);

  document.addEventListener('change',event=>{
    if(event.target?.id==='quickCourseSelect'&&!has('course')&&event.target.value!==PREVIEW_TOPIC){
      event.preventDefault();event.stopImmediatePropagation();event.target.value=PREVIEW_TOPIC;openGate('course');
    }
  },true);

  window.addEventListener('coursecontextchange',event=>{
    const state=event.detail||window.CourseApp?.getState?.();
    if(!has('course')&&state?.courseOpen&&state.topicId&&state.topicId!==PREVIEW_TOPIC){
      window.CourseApp?.openTopic?.(PREVIEW_TOPIC,false,0,{historyMode:'replace'});
      openGate('course');
    }
    syncAccessUi();
  });

  ['alevel:lesson-selected','alevel:presentation-engine-ready','alevel:assessment-updated','alevel:astar-updated','coursetoolchange'].forEach(name=>{
    window.addEventListener(name,()=>setTimeout(syncAccessUi,60));
  });

  const start=()=>syncAccessUi();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.ALEVEL_ACCESS={
    plans:PLANS,
    featureMinimums:FEATURE_MIN_PLAN,
    has,
    requiredPlan,
    openPricing:showPricing,
    require(feature){return has(feature)||openGate(feature)&&false;},
    applyEntitlement,
    checkout:planAction,
    refresh:syncAccessUi,
    get plan(){return currentPlan;},
    get billing(){return billing;}
  };
})();