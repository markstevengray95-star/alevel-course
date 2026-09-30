(() => {
  'use strict';
  if (window.self === window.top) return;

  const root = document.documentElement;
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const post = payload => { try { window.parent.postMessage(payload, '*'); } catch {} };
  const getActiveIndex = buttons => {
    const index = buttons.findIndex(button =>
      button.classList.contains('active') ||
      button.getAttribute('aria-current') === 'page' ||
      button.getAttribute('aria-selected') === 'true'
    );
    return index >= 0 ? index : 0;
  };

  let buttons = [];
  let picker = null;
  let pendingRestore = null;
  let started = false;

  root.classList.add('unified-course-embedded');

  function sectionLabel(index) {
    return clean(buttons[index]?.textContent) || `Section ${index + 1}`;
  }

  function announce(index) {
    post({
      type: 'alevel-topic-section',
      index,
      label: sectionLabel(index),
      pageTitle: document.title
    });
  }

  function syncFromButtons({announceChange = false} = {}) {
    if (!picker || !buttons.length) return;
    const index = getActiveIndex(buttons);
    picker.value = String(index);
    if (announceChange) announce(index);
  }

  function applyRestore() {
    if (!Number.isInteger(pendingRestore) || !buttons.length) return;
    const index = Math.min(Math.max(pendingRestore, 0), buttons.length - 1);
    pendingRestore = null;
    picker.value = String(index);
    if (getActiveIndex(buttons) !== index) buttons[index]?.click();
    announce(index);
  }

  function selectedText() {
    return clean(window.getSelection?.()?.toString()).slice(0, 5000);
  }

  function buildToolbar(nav) {
    if (started) return;
    started = true;

    const toolbar = document.createElement('div');
    toolbar.className = 'uc-embedded-toolbar';
    toolbar.setAttribute('aria-label', 'Topic navigation');

    const exit = document.createElement('button');
    exit.type = 'button';
    exit.className = 'uc-exit-course';
    exit.textContent = '← Home';
    exit.addEventListener('click', () => post({type: 'alevel-course-exit'}));

    const pickerWrap = document.createElement('label');
    pickerWrap.className = 'uc-view-picker';
    const pickerLabel = document.createElement('span');
    pickerLabel.textContent = 'Section';
    picker = document.createElement('select');
    picker.setAttribute('aria-label', 'Choose topic section');

    if (buttons.length) {
      buttons.forEach((button, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = sectionLabel(index);
        picker.appendChild(option);
        button.addEventListener('click', () => {
          picker.value = String(index);
          announce(index);
        });
      });
    } else {
      const option = document.createElement('option');
      option.value = '0';
      option.textContent = 'Overview';
      picker.appendChild(option);
      picker.disabled = true;
    }

    picker.addEventListener('change', () => {
      const index = Number(picker.value);
      const button = buttons[index];
      if (button) button.click();
      announce(index);
    });
    pickerWrap.append(pickerLabel, picker);

    const textbook = document.createElement('button');
    textbook.type = 'button';
    textbook.className = 'uc-textbook-button';
    textbook.innerHTML = '<span aria-hidden="true">▦</span><b>Textbook</b>';
    textbook.addEventListener('click', () => post({type: 'alevel-textbook-open'}));

    const notebook = document.createElement('button');
    notebook.type = 'button';
    notebook.className = 'uc-notebook-button';
    notebook.innerHTML = '<span aria-hidden="true">▤</span><b>Notes</b>';
    notebook.addEventListener('click', () => {
      const text = selectedText();
      post({
        type: text ? 'alevel-notebook-save' : 'alevel-notebook-open',
        text,
        sourceType: text ? 'selection' : 'manual',
        sectionTitle: buttons.length ? sectionLabel(getActiveIndex(buttons)) : document.title,
        pageTitle: document.title
      });
      if (text) window.getSelection?.()?.removeAllRanges?.();
    });

    toolbar.append(exit, pickerWrap, textbook, notebook);
    if (nav?.parentNode) nav.before(toolbar);
    else document.body.prepend(toolbar);

    syncFromButtons();
    applyRestore();
    root.classList.add('uc-embedded-ready');
  }

  function boot(attempt = 0) {
    if (started) return;
    const nav = document.querySelector('.main-nav');
    buttons = nav ? [...nav.querySelectorAll('.nav-button')].filter(button => clean(button.textContent)) : [];
    if ((!nav || !buttons.length) && attempt < 40) {
      window.setTimeout(() => boot(attempt + 1), 100);
      return;
    }
    buildToolbar(nav);
  }

  window.addEventListener('message', event => {
    const data = event.data || {};
    if (data.type === 'alevel-mobile-mode') root.classList.toggle('unified-course-mobile', !!data.enabled);
    if (data.type === 'alevel-topic-restore-section') {
      const index = Number(data.index);
      if (Number.isInteger(index)) {
        pendingRestore = index;
        applyRestore();
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || document.fullscreenElement) return;
    const tag = document.activeElement?.tagName || '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    event.preventDefault();
    post({type: 'alevel-course-exit'});
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(), {once: true});
  else boot();
})();
