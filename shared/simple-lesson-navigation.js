(() => {
  if (window.self === window.top) return;

  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const GROUPS = [
    { container: '.course-list', buttons: '.course-button', label: 'Lesson' },
    { container: '.lesson-path', buttons: '.lesson-path-step', label: 'Lesson' },
    { container: '.lesson-stage-list,.lesson-stages', buttons: '.lesson-stage-button', label: 'Stage' },
    { container: '.chunk-nav,.chunk-tabs,.lesson-chunks', buttons: '.chunk-button', label: 'Part' }
  ];
  let idCounter = 0;
  let scanTimer = 0;

  const activeIndex = (buttons, fallback = 0) => {
    const index = buttons.findIndex(button =>
      button.classList.contains('active') ||
      button.getAttribute('aria-current') === 'page' ||
      button.getAttribute('aria-selected') === 'true'
    );
    return index >= 0 ? index : Math.min(Math.max(fallback, 0), Math.max(0, buttons.length - 1));
  };

  function mount(container, buttonSelector, labelText) {
    if (container.dataset.ucSimpleNav === 'true') return;
    const initialButtons = [...container.querySelectorAll(buttonSelector)];
    if (initialButtons.length < 2) return;

    const id = `uc-lesson-nav-${++idCounter}`;
    container.dataset.ucSimpleNav = 'true';
    container.dataset.ucNavId = id;
    container.classList.add('uc-nav-managed');
    container.setAttribute('aria-hidden', 'true');

    const nav = document.createElement('nav');
    nav.className = 'uc-simple-lesson-nav';
    nav.dataset.targetId = id;
    nav.setAttribute('aria-label', `${labelText} navigation`);

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'uc-lesson-step uc-lesson-prev';
    previous.innerHTML = '<span aria-hidden="true">‹</span><b>Previous</b>';
    previous.title = `Previous ${labelText.toLowerCase()}`;

    const picker = document.createElement('label');
    picker.className = 'uc-lesson-picker';
    const pickerLabel = document.createElement('span');
    pickerLabel.textContent = labelText;
    const select = document.createElement('select');
    select.setAttribute('aria-label', `Choose ${labelText.toLowerCase()}`);
    picker.append(pickerLabel, select);

    const position = document.createElement('span');
    position.className = 'uc-lesson-position';
    position.setAttribute('aria-live', 'polite');

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'uc-lesson-step uc-lesson-next';
    next.innerHTML = '<b>Next</b><span aria-hidden="true">›</span>';
    next.title = `Next ${labelText.toLowerCase()}`;

    nav.append(previous, picker, position, next);
    container.before(nav);

    let fallbackIndex = 0;
    let signature = '';

    const buttons = () => [...container.querySelectorAll(buttonSelector)];

    function refreshOptions(items) {
      const nextSignature = items.map(button => clean(button.textContent)).join('|');
      if (nextSignature === signature && select.options.length === items.length) return;
      signature = nextSignature;
      select.replaceChildren();
      items.forEach((button, index) => {
        button.tabIndex = -1;
        button.setAttribute('aria-hidden', 'true');
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = `${index + 1}. ${clean(button.textContent) || `${labelText} ${index + 1}`}`;
        select.appendChild(option);
      });
    }

    function sync() {
      const items = buttons();
      if (items.length < 2) {
        nav.hidden = true;
        container.classList.remove('uc-nav-managed');
        container.removeAttribute('aria-hidden');
        return;
      }
      nav.hidden = false;
      container.classList.add('uc-nav-managed');
      container.setAttribute('aria-hidden', 'true');
      refreshOptions(items);
      fallbackIndex = activeIndex(items, fallbackIndex);
      select.value = String(fallbackIndex);
      position.textContent = `${fallbackIndex + 1} of ${items.length}`;
      previous.disabled = fallbackIndex <= 0;
      next.disabled = fallbackIndex >= items.length - 1;
      previous.setAttribute('aria-label', fallbackIndex > 0 ? `Previous ${labelText.toLowerCase()}: ${clean(items[fallbackIndex - 1]?.textContent)}` : `No previous ${labelText.toLowerCase()}`);
      next.setAttribute('aria-label', fallbackIndex < items.length - 1 ? `Next ${labelText.toLowerCase()}: ${clean(items[fallbackIndex + 1]?.textContent)}` : `No next ${labelText.toLowerCase()}`);
    }

    function go(index) {
      const items = buttons();
      const target = Math.min(Math.max(index, 0), items.length - 1);
      if (!items[target]) return;
      fallbackIndex = target;
      items[target].click();
      window.setTimeout(sync, 30);
      window.setTimeout(sync, 180);
    }

    previous.addEventListener('click', () => go(fallbackIndex - 1));
    next.addEventListener('click', () => go(fallbackIndex + 1));
    select.addEventListener('change', () => go(Number(select.value)));

    container.addEventListener('click', event => {
      const item = event.target.closest?.(buttonSelector);
      if (!item) return;
      const items = buttons();
      const index = items.indexOf(item);
      if (index >= 0) fallbackIndex = index;
      window.setTimeout(sync, 0);
    }, true);

    const observer = new MutationObserver(() => window.setTimeout(sync, 0));
    observer.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'aria-current', 'aria-selected']
    });

    sync();
  }

  function scan() {
    for (const group of GROUPS) {
      document.querySelectorAll(group.container).forEach(container => mount(container, group.buttons, group.label));
    }
  }

  function scheduleScan(delay = 40) {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(scan, delay);
  }

  const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.addedNodes.length || mutation.removedNodes.length)) scheduleScan();
  });

  const start = () => {
    scan();
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', () => scheduleScan(80), true);
    document.addEventListener('change', () => scheduleScan(80), true);
    document.documentElement.classList.add('uc-simple-navigation-ready');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
