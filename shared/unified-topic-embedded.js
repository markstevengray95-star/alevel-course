(() => {
  if (window.self === window.top) return;

  const requestExit = () => window.parent.postMessage({type:'alevel-course-exit'}, '*');
  const cleanText = value => String(value || '').replace(/\s+/g,' ').trim();
  const applyMobileMode = enabled => document.documentElement.classList.toggle('unified-course-mobile', !!enabled);
  window.addEventListener('message', event => {
    if (event.data?.type === 'alevel-mobile-mode') applyMobileMode(event.data.enabled);
  });

  const currentSection = (buttons) => {
    const activeNav = buttons.find(button => button.classList.contains('active') || button.getAttribute('aria-current') === 'page');
    const activeLesson = document.querySelector('.course-button.active,.lesson-path-step.active,.chapter-button.active,.textbook-sidebar button.active,.lesson-stage-button.active,.chunk-button.active');
    const visibleHeading = [...document.querySelectorAll('.lesson-panel h2,.lesson-panel h3,.view:not([hidden]) .section-head h2,.view:not([hidden]) h2')].find(el => {
      const style=getComputedStyle(el);return style.display!=='none'&&style.visibility!=='hidden'&&el.getClientRects().length>0&&cleanText(el.textContent);
    });
    const parts=[cleanText(activeNav?.textContent),cleanText(activeLesson?.textContent)||cleanText(visibleHeading?.textContent)].filter(Boolean);
    return [...new Set(parts)].join(' · ') || document.title;
  };
  const selectedText = () => cleanText(window.getSelection?.()?.toString()).slice(0,5000);

  let bootstrapTimer=0;
  const ready = (attempt=0) => {
    document.documentElement.classList.add('unified-course-embedded');
    if (document.querySelector('.uc-embedded-toolbar')) return;

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

    const sync = () => {
      const activeIndex = Math.max(0, buttons.findIndex(button => button.classList.contains('active') || button.getAttribute('aria-current') === 'page'));
      select.value = String(activeIndex);
    };

    select.addEventListener('change', () => {
      const button = buttons[Number(select.value)];
      if (button) button.click();
      window.setTimeout(sync, 0);
    });
    buttons.forEach(button => button.addEventListener('click', () => window.setTimeout(sync, 0)));

    let rememberedSelection='';
    const rememberSelection=()=>{const text=selectedText();if(text)rememberedSelection=text;};
    document.addEventListener('selectionchange',rememberSelection);

    const notebook = document.createElement('button');
    notebook.type = 'button';
    notebook.className = 'uc-notebook-button';
    notebook.innerHTML = '<span aria-hidden="true">▤</span><b>Save note</b>';
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
        const original = notebook.querySelector('b')?.textContent || 'Save note';
        const labelEl = notebook.querySelector('b');
        if (labelEl) labelEl.textContent = 'Saved ✓';
        window.setTimeout(() => { notebook.classList.remove('saved'); if (labelEl) labelEl.textContent = original; }, 1400);
        window.getSelection?.()?.removeAllRanges?.();
      }
    });

    const observer = new MutationObserver(sync);
    buttons.forEach(button => observer.observe(button, {attributes:true,attributeFilter:['class','aria-current']}));

    pickerWrap.append(label, select);
    toolbar.append(exit, pickerWrap, notebook);
    nav.before(toolbar);
    sync();
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
