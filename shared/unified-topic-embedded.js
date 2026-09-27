(() => {
  if (window.self === window.top) return;

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
    exit.textContent = '← Exit course';
    exit.addEventListener('click', () => window.parent.postMessage({type:'alevel-course-exit'}, '*'));

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

    pickerWrap.append(label, select);
    toolbar.append(exit, pickerWrap);
    nav.before(toolbar);
    sync();
    document.documentElement.classList.add('uc-embedded-ready');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true});
  else ready();
})();
