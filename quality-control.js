(() => {
  const EXPECTED_TOPICS = ['measurements','particles','waves','mechanics-materials','electricity','further-mechanics','fields','nuclear'];
  const EXPECTED_LESSONS = 118;
  const REQUIRED_APIS = ['ALEVEL_PHASE3','ALEVEL_ACTIVITIES','ALEVEL_SIMULATIONS','ALEVEL_ASSESSMENT','ALEVEL_PROGRESSION','ALEVEL_TEACHER_TOOLS','ALEVEL_ASTAR'];
  const REQUIRED_LESSON_SECTIONS = ['lr-overview','lr-textbook','lr-equations','lr-activities','lr-simulation','lr-mastery','lr-astar','lr-teacher','lr-exam'];
  let latestReport = null;

  function escapeHtml(value){return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function check(label, ok, detail=''){return {label, ok:!!ok, detail};}

  function run(){
    const topics = window.CourseApp?.topics || [];
    const lessons = window.ALEVEL_LESSONS || [];
    const ids = lessons.map(l => l.id);
    const checks = [
      check('Eight compulsory core topics loaded', topics.length === 8 && EXPECTED_TOPICS.every(id => topics.some(t => t.id === id)), `${topics.length} loaded`),
      check('Complete mapped core lesson sequence loaded', lessons.length === EXPECTED_LESSONS, `${lessons.length} / ${EXPECTED_LESSONS}`),
      check('Lesson IDs are unique', new Set(ids).size === ids.length, `${new Set(ids).size} unique IDs`),
      check('AQA references stay within core sections 3.1–3.8', lessons.every(l => /^3\.[1-8](?:\b|[.\s/–-])/.test(l.ref || '')), 'Curriculum map references'),
      check('Year 12 / Year 13 core split is valid', lessons.every(l => {
        const section = Number(String(l.ref || '').match(/^3\.(\d)/)?.[1] || 0);
        return section ? l.year === (section <= 5 ? 'Year 12' : 'Year 13') : true;
      }), '3.1–3.5 Year 12 · 3.6–3.8 Year 13'),
      ...REQUIRED_APIS.map(api => check(`${api.replace('ALEVEL_','').replaceAll('_',' ')} system loaded`, !!window[api], api))
    ];
    latestReport = {checkedAt:new Date().toISOString(), checks, passed:checks.every(c => c.ok), topics:topics.length, lessons:lessons.length};
    renderReport();
    return latestReport;
  }

  function renderScope(){
    if(document.getElementById('qualificationScope')) return;
    const homeIntro = document.querySelector('.home-intro');
    if(!homeIntro) return;
    const section = document.createElement('section');
    section.id = 'qualificationScope';
    section.className = 'qualification-scope';
    section.setAttribute('aria-label','AQA qualification scope');
    section.innerHTML = `
      <div class="scope-core"><span class="scope-badge">AQA 7408 core</span><div><strong>Core Sections 3.1–3.8 are covered in this course.</strong><p>These include the compulsory content for Papers 1 and 2 and the core knowledge used in Paper 3.</p></div></div>
      <div class="scope-option"><strong>Paper 3 option still required</strong><p>For the full A-level qualification, students also study one option from Sections 3.9–3.13: Astrophysics, Medical physics, Engineering physics, Turning points in physics, or Electronics.</p><a href="https://www.aqa.org.uk/subjects/physics/a-level/physics-7408/specification/specification-at-a-glance" target="_blank" rel="noopener">Check the AQA 7408 assessment structure ↗</a></div>`;
    homeIntro.insertAdjacentElement('afterend', section);
  }

  function renderReport(){
    let panel = document.getElementById('phase10Quality');
    if(!panel){
      const footer = document.querySelector('.home-footer-tools');
      if(!footer) return;
      panel = document.createElement('details');
      panel.id = 'phase10Quality';
      panel.className = 'phase10-quality';
      footer.insertAdjacentElement('beforebegin', panel);
    }
    const report = latestReport;
    if(!report) return;
    const passed = report.checks.filter(c => c.ok).length;
    panel.innerHTML = `<summary><span>Phase 10 quality control</span><strong class="${report.passed?'qa-pass':'qa-warn'}">${report.passed?'Core checks passed':`${report.checks.length-passed} check(s) need attention`}</strong></summary><div class="qa-grid">${report.checks.map(c=>`<div class="qa-item ${c.ok?'pass':'fail'}"><span aria-hidden="true">${c.ok?'✓':'!'}</span><div><strong>${escapeHtml(c.label)}</strong><small>${escapeHtml(c.detail)}</small></div></div>`).join('')}</div><p class="qa-note">This automated check verifies the course shell and compulsory 3.1–3.8 lesson architecture. The optional Paper 3 topic is intentionally identified separately above.</p>`;
  }

  function checkOpenLesson(){
    const active = window.ALEVEL_ACTIVE_LESSON;
    if(!active) return;
    setTimeout(() => {
      const missing = REQUIRED_LESSON_SECTIONS.filter(id => !document.getElementById(id));
      if(missing.length) console.warn(`[Phase 10] ${active.id} missing lesson sections: ${missing.join(', ')}`);
      else console.info(`[Phase 10] ${active.id} lesson systems verified.`);
    }, 120);
  }

  function start(){
    renderScope();
    setTimeout(run, 80);
    setTimeout(run, 700);
    window.addEventListener('alevel:lesson-selected', checkOpenLesson);
    window.addEventListener('alevel:assessment-updated', () => setTimeout(run, 20));
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
  window.ALEVEL_QUALITY_CONTROL = {run, get report(){return latestReport;}};
})();
