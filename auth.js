import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';

const SUPABASE_URL = 'https://emjmvgginijkupwuflla.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_axgWqbWx-24V2b9s7mE1Fw__N3Ce61f';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const PLAN_LABELS = { free: 'Free', plus: 'Plus', pro: 'Pro', school: 'School' };
let currentSession = null;
let currentProfile = null;
let appOpenLogged = false;
let lastTrackedTopic = '';

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function mountAuthUI() {
  const topbar = $('.topbar-inner');
  if (topbar && !$('#accountButton')) {
    topbar.insertAdjacentHTML('beforeend', `
      <div class="account-actions" id="accountActions" hidden>
        <button class="account-button" id="accountButton" type="button" aria-haspopup="dialog">
          <span class="account-avatar" aria-hidden="true">●</span>
          <span class="account-copy"><strong>Account</strong><small id="accountPlan">Free</small></span>
        </button>
      </div>
    `);
  }

  document.body.insertAdjacentHTML('beforeend', `
    <div class="auth-gate" id="authGate" hidden>
      <div class="auth-shell" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <div class="auth-brand"><span class="auth-mark">φ</span><div><strong>A-Level Physics</strong><small>AQA 7408</small></div></div>
        <div class="auth-intro">
          <span class="eyebrow">Your course account</span>
          <h1 id="authTitle">Sign in to continue</h1>
          <p>Keep your account, course access and usage securely linked to your email.</p>
        </div>
        <div class="auth-tabs" role="tablist" aria-label="Account options">
          <button class="auth-tab active" type="button" data-auth-mode="signin" role="tab" aria-selected="true">Sign in</button>
          <button class="auth-tab" type="button" data-auth-mode="signup" role="tab" aria-selected="false">Create account</button>
        </div>
        <form class="auth-form" id="authForm" novalidate>
          <label><span>Email address</span><input id="authEmail" type="email" autocomplete="email" inputmode="email" required placeholder="you@example.com"></label>
          <label><span>Password</span><input id="authPassword" type="password" autocomplete="current-password" minlength="8" required placeholder="At least 8 characters"></label>
          <label class="auth-confirm-row" id="authConfirmRow" hidden><span>Confirm password</span><input id="authPasswordConfirm" type="password" autocomplete="new-password" minlength="8" placeholder="Repeat your password"></label>
          <p class="auth-message" id="authMessage" role="status" aria-live="polite"></p>
          <button class="button primary auth-submit" id="authSubmit" type="submit">Sign in</button>
        </form>
        <p class="auth-security-note">Passwords are handled by Supabase Auth and are never stored in this website's code.</p>
      </div>
    </div>

    <div class="account-backdrop" id="accountBackdrop" hidden></div>
    <section class="account-panel" id="accountPanel" hidden role="dialog" aria-modal="true" aria-labelledby="accountPanelTitle">
      <div class="account-panel-head">
        <div><span class="eyebrow">Signed in</span><h2 id="accountPanelTitle">Your account</h2></div>
        <button class="nav-square" id="accountClose" type="button" aria-label="Close account panel">×</button>
      </div>
      <div class="account-profile-card">
        <div class="account-profile-avatar" aria-hidden="true">●</div>
        <div><strong id="accountEmail">—</strong><span id="accountTierLine">Free plan</span></div>
      </div>
      <div class="account-detail-grid">
        <div><span>Plan</span><strong id="accountTier">Free</strong></div>
        <div><span>Status</span><strong id="accountStatus">Active</strong></div>
      </div>
      <button class="button primary admin-entry" id="adminEntry" type="button" hidden>Open admin dashboard</button>
      <button class="button quiet account-signout" id="signOutButton" type="button">Sign out</button>
    </section>

    <div class="admin-backdrop" id="adminBackdrop" hidden></div>
    <section class="admin-panel" id="adminPanel" hidden role="dialog" aria-modal="true" aria-labelledby="adminTitle">
      <div class="admin-panel-head">
        <div><span class="eyebrow">Owner access</span><h2 id="adminTitle">Admin dashboard</h2><p>Course accounts, usage and plan distribution.</p></div>
        <div class="admin-head-actions"><button class="button quiet" id="adminRefresh" type="button">Refresh</button><button class="nav-square" id="adminClose" type="button" aria-label="Close admin dashboard">×</button></div>
      </div>
      <div class="admin-loading" id="adminLoading">Loading account data…</div>
      <div id="adminContent" hidden>
        <div class="admin-stat-grid" id="adminStats"></div>
        <div class="admin-section-head"><div><span class="eyebrow">Subscriptions</span><h3>Users and uses by payment category</h3></div></div>
        <div class="plan-breakdown" id="planBreakdown"></div>
        <div class="admin-section-head"><div><span class="eyebrow">Accounts</span><h3>Recent users</h3></div><span id="adminUserCount"></span></div>
        <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Email</th><th>Plan</th><th>Status</th><th>Joined</th><th>Last active</th><th>Uses</th><th>30 days</th></tr></thead><tbody id="adminUserRows"></tbody></table></div>
      </div>
      <p class="admin-error" id="adminError" hidden></p>
    </section>
  `);

  bindAuthUI();
}

function setAuthMode(mode) {
  const signup = mode === 'signup';
  document.querySelectorAll('[data-auth-mode]').forEach((button) => {
    const active = button.dataset.authMode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  $('#authConfirmRow').hidden = !signup;
  $('#authPassword').autocomplete = signup ? 'new-password' : 'current-password';
  $('#authPasswordConfirm').required = signup;
  $('#authSubmit').textContent = signup ? 'Create account' : 'Sign in';
  $('#authTitle').textContent = signup ? 'Create your account' : 'Sign in to continue';
  $('#authMessage').textContent = '';
  $('#authForm').dataset.mode = mode;
}

function setAuthMessage(message, type = '') {
  const el = $('#authMessage');
  el.textContent = message || '';
  el.dataset.type = type;
}

function setAuthBusy(busy) {
  $('#authSubmit').disabled = busy;
  document.querySelectorAll('[data-auth-mode]').forEach((button) => { button.disabled = busy; });
  if (busy) $('#authSubmit').textContent = $('#authForm').dataset.mode === 'signup' ? 'Creating account…' : 'Signing in…';
  else $('#authSubmit').textContent = $('#authForm').dataset.mode === 'signup' ? 'Create account' : 'Sign in';
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const mode = $('#authForm').dataset.mode || 'signin';
  const email = $('#authEmail').value.trim();
  const password = $('#authPassword').value;
  const confirm = $('#authPasswordConfirm').value;

  if (!email || !password) return setAuthMessage('Enter your email and password.', 'error');
  if (password.length < 8) return setAuthMessage('Use a password with at least 8 characters.', 'error');
  if (mode === 'signup' && password !== confirm) return setAuthMessage('The passwords do not match.', 'error');

  setAuthBusy(true);
  setAuthMessage('');
  try {
    if (mode === 'signup') {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      if (data.session) {
        setAuthMessage('Account created. Signing you in…', 'success');
        await applySession(data.session);
      } else {
        setAuthMessage('Account created. Check your email to confirm your address, then sign in.', 'success');
        setAuthMode('signin');
        $('#authEmail').value = email;
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await applySession(data.session);
    }
  } catch (error) {
    setAuthMessage(error?.message || 'Could not complete sign in. Please try again.', 'error');
  } finally {
    setAuthBusy(false);
  }
}

async function applySession(session) {
  currentSession = session || null;
  currentProfile = null;
  const signedIn = Boolean(currentSession?.user);
  $('#authGate').hidden = signedIn;
  $('#accountActions').hidden = !signedIn;
  document.body.classList.toggle('auth-required', !signedIn);

  if (!signedIn) {
    closeAccount();
    closeAdmin();
    return;
  }

  $('#accountEmail').textContent = currentSession.user.email || 'Signed-in user';

  try {
    const { data, error } = await supabase.rpc('alevel_register_session');
    if (error) throw error;
    currentProfile = data || {};
    updateAccountUI();

    if (!appOpenLogged) {
      appOpenLogged = true;
      await recordUsage('app_open', { path: location.pathname, referrer: document.referrer ? 'external' : 'direct' });
    }
  } catch (error) {
    console.error('Could not initialise A-level account:', error);
    $('#accountTierLine').textContent = 'Account connected';
  }
}

function updateAccountUI() {
  const tier = currentProfile?.plan_tier || 'free';
  const status = currentProfile?.subscription_status || 'active';
  const label = PLAN_LABELS[tier] || tier;
  $('#accountPlan').textContent = currentProfile?.is_admin ? `${label} · Admin` : label;
  $('#accountTier').textContent = label;
  $('#accountStatus').textContent = status.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
  $('#accountTierLine').textContent = currentProfile?.is_admin ? `${label} plan · Owner admin` : `${label} plan`;
  $('#adminEntry').hidden = !currentProfile?.is_admin;
}

async function recordUsage(eventType, metadata = {}) {
  if (!currentSession?.user) return;
  try {
    const { error } = await supabase.rpc('alevel_record_usage', { p_event_type: eventType, p_metadata: metadata });
    if (error) throw error;
  } catch (error) {
    console.warn('Usage event was not recorded:', error?.message || error);
  }
}

function openAccount() {
  if (!currentSession) return;
  $('#accountBackdrop').hidden = false;
  $('#accountPanel').hidden = false;
  requestAnimationFrame(() => $('#accountPanel').classList.add('open'));
}

function closeAccount() {
  const panel = $('#accountPanel');
  if (!panel) return;
  panel.classList.remove('open');
  $('#accountBackdrop').hidden = true;
  panel.hidden = true;
}

function openAdmin() {
  if (!currentProfile?.is_admin) return;
  closeAccount();
  $('#adminBackdrop').hidden = false;
  $('#adminPanel').hidden = false;
  requestAnimationFrame(() => $('#adminPanel').classList.add('open'));
  loadAdminDashboard();
}

function closeAdmin() {
  const panel = $('#adminPanel');
  if (!panel) return;
  panel.classList.remove('open');
  $('#adminBackdrop').hidden = true;
  panel.hidden = true;
}

async function loadAdminDashboard() {
  if (!currentProfile?.is_admin) return;
  $('#adminLoading').hidden = false;
  $('#adminContent').hidden = true;
  $('#adminError').hidden = true;
  try {
    const [summaryResponse, usersResponse] = await Promise.all([
      supabase.rpc('alevel_admin_summary'),
      supabase.rpc('alevel_admin_recent_users', { p_limit: 100 })
    ]);
    if (summaryResponse.error) throw summaryResponse.error;
    if (usersResponse.error) throw usersResponse.error;
    renderAdminDashboard(summaryResponse.data || {}, usersResponse.data || []);
    $('#adminLoading').hidden = true;
    $('#adminContent').hidden = false;
  } catch (error) {
    $('#adminLoading').hidden = true;
    $('#adminError').hidden = false;
    $('#adminError').textContent = error?.message || 'Could not load admin data.';
  }
}

function renderAdminDashboard(summary, users) {
  const stats = [
    ['Total users', summary.total_users ?? 0],
    ['Active · 7 days', summary.active_7d ?? 0],
    ['Active · 30 days', summary.active_30d ?? 0],
    ['Total uses', summary.total_uses ?? 0],
    ['Uses today', summary.uses_today ?? 0],
    ['Topic opens · 30 days', summary.topic_opens_30d ?? 0]
  ];
  $('#adminStats').innerHTML = stats.map(([label, value]) => `<div class="admin-stat"><span>${escapeHtml(label)}</span><strong>${Number(value).toLocaleString('en-GB')}</strong></div>`).join('');

  const breakdown = summary.plan_breakdown || {};
  $('#planBreakdown').innerHTML = ['free', 'plus', 'pro', 'school'].map((tier) => {
    const item = breakdown[tier] || { users: 0, uses_total: 0, uses_30d: 0 };
    return `<article class="plan-card" data-plan="${tier}"><div class="plan-card-head"><strong>${PLAN_LABELS[tier]}</strong><span>${Number(item.users || 0).toLocaleString('en-GB')} users</span></div><div class="plan-card-metrics"><div><span>Total uses</span><b>${Number(item.uses_total || 0).toLocaleString('en-GB')}</b></div><div><span>Last 30 days</span><b>${Number(item.uses_30d || 0).toLocaleString('en-GB')}</b></div></div></article>`;
  }).join('');

  $('#adminUserCount').textContent = `${users.length} shown`;
  $('#adminUserRows').innerHTML = users.length ? users.map((user) => `
    <tr>
      <td><strong>${escapeHtml(user.email || '—')}</strong></td>
      <td><span class="plan-pill" data-plan="${escapeHtml(user.plan_tier || 'free')}">${escapeHtml(PLAN_LABELS[user.plan_tier] || user.plan_tier || 'Free')}</span></td>
      <td>${escapeHtml((user.subscription_status || 'active').replaceAll('_', ' '))}</td>
      <td>${escapeHtml(formatDate(user.created_at))}</td>
      <td>${escapeHtml(formatDate(user.last_seen_at))}</td>
      <td>${Number(user.uses_total || 0).toLocaleString('en-GB')}</td>
      <td>${Number(user.uses_30d || 0).toLocaleString('en-GB')}</td>
    </tr>
  `).join('') : '<tr><td colspan="7" class="admin-empty">No A-level course users yet.</td></tr>';
}

function bindAuthUI() {
  setAuthMode('signin');
  document.querySelectorAll('[data-auth-mode]').forEach((button) => button.addEventListener('click', () => setAuthMode(button.dataset.authMode)));
  $('#authForm').addEventListener('submit', handleAuthSubmit);
  $('#accountButton').addEventListener('click', openAccount);
  $('#accountClose').addEventListener('click', closeAccount);
  $('#accountBackdrop').addEventListener('click', closeAccount);
  $('#adminEntry').addEventListener('click', openAdmin);
  $('#adminClose').addEventListener('click', closeAdmin);
  $('#adminBackdrop').addEventListener('click', closeAdmin);
  $('#adminRefresh').addEventListener('click', loadAdminDashboard);
  $('#signOutButton').addEventListener('click', async () => {
    await supabase.auth.signOut();
    closeAccount();
  });

  window.addEventListener('coursecontextchange', (event) => {
    const detail = event.detail || {};
    if (!detail.courseOpen || !detail.topicId || detail.topicId === lastTrackedTopic) return;
    lastTrackedTopic = detail.topicId;
    recordUsage('topic_open', { topic_id: detail.topicId, code: detail.code || '', module: detail.moduleLabel || '' });
  });

  document.addEventListener('click', (event) => {
    const tool = event.target.closest?.('[data-course-tool]');
    if (tool?.dataset?.courseTool) recordUsage('tool_open', { tool: tool.dataset.courseTool });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!$('#adminPanel').hidden) closeAdmin();
    else if (!$('#accountPanel').hidden) closeAccount();
  });
}

async function bootAuth() {
  mountAuthUI();
  const { data, error } = await supabase.auth.getSession();
  if (error) console.error('Session check failed:', error);
  await applySession(data?.session || null);
  supabase.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => applySession(session), 0);
  });
}

bootAuth();
window.ALevelAuth = { supabase, recordUsage, openAdmin };
