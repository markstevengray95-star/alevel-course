(() => {
  if (window.self === window.top) return;

  const requestExit = () => window.parent.postMessage({type:'alevel-course-exit'}, '*');
  const requestTextbook = () => window.parent.postMessage({type:'alevel-textbook-open'}, '*');
  const cleanText = value => String(value || '').replace(/\s+/g,' ').trim();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const applyMobileMode = enabled => document.documentElement.classList.toggle('unified-course-mobile', !!enabled);
  let pendingRestoreIndex = null;
  let activeButtons = [];
  let activeSelect = null;
  let enrichmentPanel = null;
  let enrichmentRequestVersion = 0;
  let enrichmentDebounce = 0;
  let selectionAction = null;
  let selectionActionText = '';

  const getActiveIndex = buttons => Math.max(0, buttons.findIndex(button => button.classList.contains('active') || button.getAttribute('aria-current') === 'page'));

  const currentSection = (buttons) => {
    const activeNav = buttons.find(button => button.classList.contains('active') || button.getAttribute('aria-current') === 'page');
    const activeLesson = document.querySelector('.course-button.active,.lesson-path-step.active,.chapter-button.active,.textbook-sidebar button.active,.lesson-stage-button.active,.chunk-button.active,[data-lesson].active,[data-chapter].active,[data-chunk].active');
    const visibleHeading = [...document.querySelectorAll('.lesson-panel h1,.lesson-panel h2,.lesson-panel h3,.view:not([hidden]) .section-head h2,.view:not([hidden]) h2,.view:not([hidden]) h3')].find(el => {
      const style=getComputedStyle(el);return style.display!=='none'&&style.visibility!=='hidden'&&el.getClientRects().length>0&&cleanText(el.textContent);
    });
    const parts=[cleanText(activeNav?.textContent),cleanText(activeLesson?.textContent)||cleanText(visibleHeading?.textContent)].filter(Boolean);
    return [...new Set(parts)].join(' · ') || document.title;
  };

  function ensureEnrichmentPanel(){
    if(enrichmentPanel)return enrichmentPanel;
    enrichmentPanel=document.createElement('details');
    enrichmentPanel.className='uc-lesson-essentials';
    enrichmentPanel.open=!window.matchMedia('(max-width:650px)').matches;
    enrichmentPanel.innerHTML='<summary><span><small>Lesson support</small><strong>Lesson essentials</strong></span><span class="uc-essential-toggle">Details</span></summary><div class="uc-essential-body"><p class="uc-essential-loading">Matching this lesson to the full AQA textbook…</p></div>';
    const toolbar=document.querySelector('.uc-embedded-toolbar');
    toolbar?.after(enrichmentPanel);
    return enrichmentPanel;
  }

  const requestEnrichment = (buttons,{retry=true}={}) => {
    if (!buttons.length) return;
    const panel=ensureEnrichmentPanel();
    const index=getActiveIndex(buttons);
    const label=currentSection(buttons);
    const version=++enrichmentRequestVersion;
    panel.dataset.ready='false';
    const send=()=>window.parent.postMessage({
      type:'alevel-lesson-enrichment-request',
      index,
      label,
      pageTitle:document.title
    }, '*');
    send();
    if(retry){
      [250,700,1500,2800].forEach(delay=>window.setTimeout(()=>{
        if(version!==enrichmentRequestVersion||panel.dataset.ready==='true')return;
        send();
      },delay));
    }
  };

  const emitSection = buttons => {
    if (!buttons.length) return;
    const index = getActiveIndex(buttons);
    const button = buttons[index];
    window.parent.postMessage({
      type:'alevel-topic-section',
      index,
      label:cleanText(button?.textContent),
      pageTitle:document.title
    }, '*');
    requestEnrichment(buttons);
  };

  const scheduleLessonRefresh=(buttons,delay=90)=>{
    clearTimeout(enrichmentDebounce);
    enrichmentDebounce=window.setTimeout(()=>requestEnrichment(buttons),delay);
  };

  const applyRestore = () => {
    if (!activeButtons.length || !Number.isInteger(pendingRestoreIndex)) return;
    const index = Math.min(Math.max(pendingRestoreIndex,0),activeButtons.length-1);
    pendingRestoreIndex = null;
    const current = getActiveIndex(activeButtons);
    if (index !== current) activeButtons[index]?.click();
    window.setTimeout(() => {
      if (activeSelect) activeSelect.value=String(getActiveIndex(activeButtons));
      emitSection(activeButtons);
    }, 30);
  };

  function renderEnrichment(data){
    const panel=ensureEnrichmentPanel();
    const body=panel.querySelector('.uc-essential-body');
    if(!body)return;
    const ideas=(data.keyPoints||[]).map(point=>`<li><strong>${esc(point.heading)}</strong><span>${esc(point.body)}</span></li>`).join('');
    const equations=(data.equations||[]).map(item=>`<div class="uc-essential-equation"><span>${esc(item.name)}</span><code>${esc(item.formula)}</code>${item.unit?`<small>${esc(item.unit)}</small>`:''}</div>`).join('');
    const example=data.example?`<div class="uc-essential-example"><span>Worked example</span><p>${esc(data.example.question)}</p><strong>${esc(data.example.answer)}</strong></div>`:'';
    body.innerHTML=`<div class="uc-essential-intro"><span>${esc(data.code||'AQA Physics')}</span><strong>${esc(data.chapterTitle||'Lesson essentials')}</strong><p>${esc(data.summary||'')}</p></div>${ideas?`<div class="uc-essential-section"><span class="uc-essential-label">Key ideas</span><ul>${ideas}</ul></div>`:''}${equations?`<div class="uc-essential-section"><span class="uc-essential-label">Key equations</span><div class="uc-essential-equations">${equations}</div></div>`:''}${example}<div class="uc-essential-actions"><button type="button" class="uc-essential-textbook">Open full textbook chapter →</button></div>`;
    body.querySelector('.uc-essential-textbook')?.addEventListener('click',()=>window.parent.postMessage({type:'alevel-lesson-enrichment-open-textbook',topicId:data.topicId,chapterIndex:Number(data.chapterIndex)||0},'*'));
    panel.dataset.ready='true';
    window.__courseLessonEnrichment=data;
    window.CourseLessonPresentationEnhancer?.decorate?.(data);
  }

  window.addEventListener('message', event => {
    if (event.data?.type === 'alevel-mobile-mode') applyMobileMode(event.data.enabled);
    if (event.data?.type === 'alevel-topic-restore-section') {
      const index=Number(event.data.index);
      if (Number.isInteger(index)) {
        pendingRestoreIndex=index;
        applyRestore();
      }
    }
    if(event.data?.type==='alevel-lesson-enrichment')renderEnrichment(event.data);
  });

  const selectedText = () => cleanText(window.getSelection?.()?.toString()).slice(0,5000);
  const selectionElement = selection => {
    const node=selection?.anchorNode;
    return node?.nodeType===1?node:node?.parentElement;
  };
  function hideSelectionAction(){if(selectionAction)selectionAction.hidden=true;selectionActionText='';}
  function ensureSelectionAction(){
    if(selectionAction)return selectionAction;
    selectionAction=document.createElement('button');
    selectionAction.type='button';
    selectionAction.className='uc-selection-save';
    selectionAction.innerHTML='<span aria-hidden="true">▤</span> Save to Notebook';
    selectionAction.hidden=true;
    selectionAction.addEventListener('mousedown',event=>event.preventDefault());
    selectionAction.addEventListener('click',()=>{
      const text=selectionActionText||selectedText();
      if(!text)return;
      window.parent.postMessage({type:'alevel-notebook-save',text,sourceType:'selection',sectionTitle:currentSection(activeButtons),pageTitle:document.title},'*');
      selectionAction.textContent='Saved ✓';
      window.getSelection?.()?.removeAllRanges?.();
      window.setTimeout(()=>{selectionAction.innerHTML='<span aria-hidden="true">▤</span> Save to Notebook';hideSelectionAction();},850);
    });
    document.body.appendChild(selectionAction);
    return selectionAction;
  }
  function showSelectionAction(){
    const selection=window.getSelection?.();
    const text=selectedText();
    const anchor=selectionElement(selection);
    if(text.length<3||!selection?.rangeCount||!anchor||anchor.closest('.uc-embedded-toolbar,.uc-selection-save,input,textarea,select,button'))return hideSelectionAction();
    const rect=selection.getRangeAt(0).getBoundingClientRect();
    if(!rect||(!rect.width&&!rect.height))return hideSelectionAction();
    if(rect.bottom<0||rect.top>window.innerHeight||rect.right<0||rect.left>window.innerWidth)return hideSelectionAction();
    const button=ensureSelectionAction();
    selectionActionText=text;
    const width=156;
    const height=40;
    const left=Math.min(Math.max(8,rect.left+rect.width/2-width/2),Math.max(8,window.innerWidth-width-8));
    const preferredTop=rect.top>=50?rect.top-42:rect.bottom+8;
    const top=Math.min(Math.max(8,preferredTop),Math.max(8,window.innerHeight-height-8));
    button.style.left=`${left}px`;
    button.style.top=`${top}px`;
    button.hidden=false;
  }
  document.addEventListener('mouseup',event=>{if(!event.target.closest?.('.uc-selection-save'))window.setTimeout(showSelectionAction,0);});
  document.addEventListener('keyup',event=>{if(event.key==='Shift'||event.key.startsWith('Arrow'))window.setTimeout(showSelectionAction,0);});
  document.addEventListener('touchend',()=>window.setTimeout(showSelectionAction,90),{passive:true});
  document.addEventListener('scroll',hideSelectionAction,true);
  window.addEventListener('resize',hideSelectionAction);

  let bootstrapTimer=0;
  const ready = (attempt=0) => {
    document.documentElement.classList.add('unified-course-embedded');
    if (document.querySelector('.uc-embedded-toolbar')) {
      applyRestore();
      requestEnrichment(activeButtons);
      return;
    }

    const nav = document.querySelector('.main-nav');
    const buttons = nav ? [...nav.querySelectorAll('.nav-button')].filter(button => button.dataset.view || button.textContent.trim()) : [];
    if (!nav || !buttons.length) {
      if (attempt < 50) {
        clearTimeout(bootstrapTimer);
        bootstrapTimer=window.setTimeout(()=>ready(attempt+1),100);
      }
      return;
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'uc-embedded-toolbar';
    toolbar.setAttribute('aria-label', 'Topic navigation');

    const exit = document.createElement('button');
    exit.type = 'button';
    exit.className = 'uc-exit-course';
    exit.textContent = '← Home';
    exit.title = 'Return to Course Home (Esc)';
    exit.addEventListener('click', requestExit);

    const pickerWrap = document.createElement('label');
    pickerWrap.className = 'uc-view-picker';
    const label = document.createElement('span');
    label.textContent = 'Section';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Choose topic section');

    buttons.forEach((button, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = button.textContent.trim();
      select.appendChild(option);
    });

    const sync = ({announce=true}={}) => {
      const activeIndex = getActiveIndex(buttons);
      select.value = String(activeIndex);
      if (announce) emitSection(buttons);
    };

    select.addEventListener('change', () => {
      const button = buttons[Number(select.value)];
      if (button) button.click();
      window.setTimeout(()=>sync(), 0);
    });
    buttons.forEach(button => button.addEventListener('click', () => window.setTimeout(()=>sync(), 0)));

    const lessonControlSelector='.course-button,.lesson-path-step,.chapter-button,.lesson-stage-button,.chunk-button,[data-lesson],[data-chapter],[data-chunk]';
    document.addEventListener('click',event=>{
      if(event.target.closest?.(lessonControlSelector))scheduleLessonRefresh(buttons,100);
    },true);
    document.addEventListener('change',event=>{
      const el=event.target;
      if(el?.matches?.('.lesson-select,.chapter-select,[data-lesson-select],[data-chapter-select]'))scheduleLessonRefresh(buttons,80);
    },true);

    let rememberedSelection='';
    const rememberSelection=()=>{const text=selectedText();if(text)rememberedSelection=text;};
    document.addEventListener('selectionchange',rememberSelection);

    const textbook = document.createElement('button');
    textbook.type='button';
    textbook.className='uc-textbook-button';
    textbook.innerHTML='<span aria-hidden="true">▦</span><b>Textbook</b>';
    textbook.title='Open the full textbook for this AQA topic';
    textbook.addEventListener('click',requestTextbook);

    const notebook = document.createElement('button');
    notebook.type = 'button';
    notebook.className = 'uc-notebook-button';
    notebook.innerHTML = '<span aria-hidden="true">▤</span><b>Notes</b>';
    notebook.title = 'Select lesson text to save it, or open the course notebook';
    notebook.addEventListener('pointerdown',rememberSelection);
    notebook.addEventListener('mousedown',rememberSelection);
    notebook.addEventListener('click', () => {
      const text = rememberedSelection || selectedText();
      const payload = {
        type: text ? 'alevel-notebook-save' : 'alevel-notebook-open',
        text,
        sourceType: text ? 'selection' : 'manual',
        sectionTitle: currentSection(buttons),
        pageTitle: document.title
      };
      window.parent.postMessage(payload, '*');
      if (text) {
        rememberedSelection='';
        notebook.classList.add('saved');
        const original = notebook.querySelector('b')?.textContent || 'Notes';
        const labelEl = notebook.querySelector('b');
        if (labelEl) labelEl.textContent = 'Saved ✓';
        window.setTimeout(() => { notebook.classList.remove('saved'); if (labelEl) labelEl.textContent = original; }, 1200);
        window.getSelection?.()?.removeAllRanges?.();
      }
    });

    const observer = new MutationObserver(()=>sync({announce:false}));
    buttons.forEach(button => observer.observe(button, {attributes:true,attributeFilter:['class','aria-current']}));

    pickerWrap.append(label, select);
    toolbar.append(exit, pickerWrap, textbook, notebook);
    nav.before(toolbar);
    activeButtons=buttons;
    activeSelect=select;
    ensureEnrichmentPanel();
    sync({announce:false});
    requestEnrichment(buttons);
    applyRestore();
    document.documentElement.classList.add('uc-embedded-ready');

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (document.fullscreenElement) return;
      const tag = document.activeElement?.tagName || '';
      if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
      const visibleModal = [...document.querySelectorAll('.modal,.modal-backdrop,[role="dialog"]')].some(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
      });
      if (visibleModal) return;
      event.preventDefault();
      requestExit();
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>ready(), {once:true});
  else ready();
})();