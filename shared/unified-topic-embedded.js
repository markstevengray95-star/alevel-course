(() => {
  if (window.self === window.top) return;

  const requestExit = () => window.parent.postMessage({type:'alevel-course-exit'}, '*');
  const currentSection = (buttons) => {
    const active = buttons.find(button => button.classList.contains('active') || button.getAttribute('aria-current') === 'page');
    return active?.textContent.trim() || document.querySelector('.view:not([hidden]) .section-head h2,.view:not([hidden]) h2,.lesson-panel h2,h1')?.textContent?.trim() || document.title;
  };
  const selectedText = () => String(window.getSelection?.()?.toString() || '').replace(/\s+/g,' ').trim().slice(0,5000);

  const ready = () => {
    document.documentElement.classList.add('unified-course-embedded');
    const nav = document.querySelector('.main-nav');
    if (!nav || document.querySelector('.uc-embedded-toolbar')) return;

    const buttons = [...nav.querySelectorAll('.nav-button')].filter(button => button.dataset.view || button.textContent.trim());
    if (!buttons.length) return;

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

    const notebook = document.createElement('button');
    notebook.type = 'button';
    notebook.className = 'uc-notebook-button';
    notebook.innerHTML = '<span aria-hidden="true">▤</span><b>Save note</b>';
    notebook.title = 'Select lesson text to save it, or open the course notebook';
    notebook.addEventListener('click', () => {
      const text = selectedText();
      const payload = {
        type: text ? 'alevel-notebook-save' : 'alevel-notebook-open',
        text,
        sourceType: text ? 'selection' : 'manual',
        sectionTitle: currentSection(buttons),
        pageTitle: document.title
      };
      window.parent.postMessage(payload, '*');
      if (text) {
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true});
  else ready();
})();
