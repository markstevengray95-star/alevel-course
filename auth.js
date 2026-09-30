import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';

const SUPABASE_URL='https://emjmvgginijkupwuflla.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_axgWqbWx-24V2b9s7mE1Fw__N3Ce61f';
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const PLAN_LABELS={free:'Free',plus:'Plus',pro:'Pro',teacher:'Teacher'};
let session=null,profile=null,appOpenLogged=false,lastTopic='';
const $=(s,r=document)=>r.querySelector(s);
const esc=(v='')=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

function prettyDate(value){
  if(!value)return '—';
  const d=new Date(value);if(Number.isNaN(d.getTime()))return '—';
  return new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short'}).format(d);
}

function mount(){
  const top=$('.topbar-inner');
  if(top&&!$('#accountButton'))top.insertAdjacentHTML('beforeend',`<div class="account-actions" id="accountActions" hidden><button class="account-button" id="accountButton" type="button" aria-haspopup="dialog"><span class="account-avatar" aria-hidden="true">●</span><span class="account-copy"><strong>Account</strong><small id="accountPlan">Free</small></span></button></div>`);
  if($('#authGate'))return;
  document.body.insertAdjacentHTML('beforeend',`
    <div class="auth-gate" id="authGate" hidden>
      <div class="auth-shell" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <div class="auth-brand"><span class="auth-mark">φ</span><div><strong>A-Level Physics</strong><small>AQA 7408</small></div></div>
        <div class="auth-intro"><span class="eyebrow">Your course account</span><h1 id="authTitle">Sign in to continue</h1><p>Sign in with your email and password so your access and course usage stay linked to your account.</p></div>
        <div class="auth-tabs" role="tablist" aria-label="Account options"><button class="auth-tab active" type="button" data-auth-mode="signin" role="tab" aria-selected="true">Sign in</button><button class="auth-tab" type="button" data-auth-mode="signup" role="tab" aria-selected="false">Create account</button></div>
        <form class="auth-form" id="authForm" novalidate>
          <label><span>Email address</span><input id="authEmail" type="email" autocomplete="email" inputmode="email" required placeholder="you@example.com"></label>
          <label><span>Password</span><input id="authPassword" type="password" autocomplete="current-password" minlength="8" required placeholder="At least 8 characters"></label>
          <label id="authConfirmRow" hidden><span>Confirm password</span><input id="authPasswordConfirm" type="password" autocomplete="new-password" minlength="8" placeholder="Repeat your password"></label>
          <p class="auth-message" id="authMessage" role="status" aria-live="polite"></p>
          <button class="button primary auth-submit" id="authSubmit" type="submit">Sign in</button>
        </form>
        <p class="auth-security-note">Passwords are handled by Supabase Auth and are not stored in this website's source code.</p>
      </div>
    </div>
    <div class="account-backdrop" id="accountBackdrop" hidden></div>
    <section class="account-panel" id="accountPanel" hidden role="dialog" aria-modal="true" aria-labelledby="accountPanelTitle">
      <div class="account-panel-head"><div><span class="eyebrow">Signed in</span><h2 id="accountPanelTitle">Your account</h2></div><button class="nav-square" id="accountClose" type="button" aria-label="Close account panel">×</button></div>
      <div class="account-profile-card"><div class="account-profile-avatar" aria-hidden="true">●</div><div><strong id="accountEmail">—</strong><span id="accountTierLine">Free plan</span></div></div>
      <div class="account-detail-grid"><div><span>Plan</span><strong id="accountTier">Free</strong></div><div><span>Status</span><strong id="accountStatus">Active</strong></div></div>
      <button class="button primary admin-entry" id="adminEntry" type="button" hidden>Open admin dashboard</button>
      <button class="button quiet account-signout" id="signOutButton" type="button">Sign out</button>
    </section>
    <div class="admin-backdrop" id="adminBackdrop" hidden></div>
    <section class="admin-panel" id="adminPanel" hidden role="dialog" aria-modal="true" aria-labelledby="adminTitle">
      <div class="admin-panel-head"><div><span class="eyebrow">Owner access</span><h2 id="adminTitle">Admin dashboard</h2><p>Course accounts, usage and payment-category distribution.</p></div><div class="admin-head-actions"><button class="button quiet" id="adminRefresh" type="button">Refresh</button><button class="nav-square" id="adminClose" type="button" aria-label="Close admin dashboard">×</button></div></div>
      <div class="admin-loading" id="adminLoading">Loading account data…</div>
      <div id="adminContent" hidden>
        <div class="admin-stat-grid" id="adminStats"></div>
        <div class="admin-section-head"><div><span class="eyebrow">Subscriptions</span><h3>Users and uses by payment category</h3></div></div>
        <div class="plan-breakdown" id="planBreakdown"></div>
        <div class="admin-section-head"><div><span class="eyebrow">Accounts</span><h3>Recent users</h3></div><span id="adminUserCount"></span></div>
        <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Email</th><th>Plan</th><th>Status</th><th>Joined</th><th>Last active</th><th>Uses</th><th>30 days</th></tr></thead><tbody id="adminUserRows"></tbody></table></div>
      </div>
      <p class="admin-error" id="adminError" hidden></p>
    </section>`);
  bind();
}

function setMode(mode,{keepMessage=false}={}){
  const signup=mode==='signup';
  document.querySelectorAll('[data-auth-mode]').forEach(b=>{const active=b.dataset.authMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
  $('#authConfirmRow').hidden=!signup;$('#authPasswordConfirm').required=signup;$('#authPassword').autocomplete=signup?'new-password':'current-password';
  $('#authForm').dataset.mode=mode;$('#authTitle').textContent=signup?'Create your account':'Sign in to continue';$('#authSubmit').textContent=signup?'Create account':'Sign in';
  if(!keepMessage)message('');
}
function message(text,type=''){const el=$('#authMessage');el.textContent=text||'';el.dataset.type=type;}
function busy(on){$('#authSubmit').disabled=on;document.querySelectorAll('[data-auth-mode]').forEach(b=>b.disabled=on);$('#authSubmit').textContent=on?($('#authForm').dataset.mode==='signup'?'Creating account…':'Signing in…'):($('#authForm').dataset.mode==='signup'?'Create account':'Sign in');}

async function submitAuth(event){
  event.preventDefault();
  const mode=$('#authForm').dataset.mode||'signin',email=$('#authEmail').value.trim(),password=$('#authPassword').value,confirm=$('#authPasswordConfirm').value;
  if(!email||!password)return message('Enter your email and password.','error');
  if(password.length<8)return message('Use a password with at least 8 characters.','error');
  if(mode==='signup'&&password!==confirm)return message('The passwords do not match.','error');
  busy(true);message('');
  try{
    if(mode==='signup'){
      const redirectTo=`${location.origin}${location.pathname}`;
      const {data,error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});if(error)throw error;
      if(data.session){message('Account created. Signing you in…','success');await applySession(data.session);}
      else{setMode('signin',{keepMessage:true});$('#authEmail').value=email;message('Account created. Check your email to confirm your address, then sign in.','success');}
    }else{
      const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await applySession(data.session);
    }
  }catch(error){message(error?.message||'Could not complete sign in. Please try again.','error');}
  finally{busy(false);}
}

function applyEntitlement(tier){
  const plan=PLAN_LABELS[tier]?tier:'free';
  window.ALEVEL_ENTITLEMENT={...(window.ALEVEL_ENTITLEMENT||{}),plan};
  let attempts=0;
  const sync=()=>{if(window.ALEVEL_ACCESS?.applyEntitlement){window.ALEVEL_ACCESS.applyEntitlement(plan);return true;}return false;};
  if(sync())return;
  const timer=window.setInterval(()=>{attempts+=1;if(sync()||attempts>40)window.clearInterval(timer);},100);
}

async function applySession(next){
  session=next||null;profile=null;
  const signedIn=!!session?.user;
  $('#authGate').hidden=signedIn;$('#accountActions').hidden=!signedIn;document.body.classList.toggle('auth-required',!signedIn);
  if(!signedIn){appOpenLogged=false;closeAccount();closeAdmin();return;}
  $('#accountEmail').textContent=session.user.email||'Signed-in user';
  try{
    const {data,error}=await supabase.rpc('alevel_register_session');if(error)throw error;profile=data||{};
    applyEntitlement(profile.plan_tier||'free');updateAccount();
    if(!appOpenLogged){appOpenLogged=true;await recordUsage('app_open',{path:location.pathname,referrer:document.referrer?'external':'direct'});}
  }catch(error){console.error('A-level account initialisation failed:',error);$('#accountTierLine').textContent='Account connected';}
}

function updateAccount(){
  const tier=profile?.plan_tier||'free',status=profile?.subscription_status||'active',label=PLAN_LABELS[tier]||tier;
  $('#accountPlan').textContent=profile?.is_admin?`${label} · Admin`:label;$('#accountTier').textContent=label;$('#accountStatus').textContent=status.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
  $('#accountTierLine').textContent=profile?.is_admin?`${label} plan · Owner admin`:`${label} plan`;$('#adminEntry').hidden=!profile?.is_admin;
}

async function recordUsage(type,metadata={}){
  if(!session?.user)return;
  try{const {error}=await supabase.rpc('alevel_record_usage',{p_event_type:type,p_metadata:metadata});if(error)throw error;}catch(error){console.warn('Usage event not recorded:',error?.message||error);}
}

function openAccount(){if(!session)return;$('#accountBackdrop').hidden=false;$('#accountPanel').hidden=false;requestAnimationFrame(()=>$('#accountPanel').classList.add('open'));}
function closeAccount(){const p=$('#accountPanel');if(!p)return;p.classList.remove('open');$('#accountBackdrop').hidden=true;p.hidden=true;}
function openAdmin(){if(!profile?.is_admin)return;closeAccount();$('#adminBackdrop').hidden=false;$('#adminPanel').hidden=false;requestAnimationFrame(()=>$('#adminPanel').classList.add('open'));loadAdmin();}
function closeAdmin(){const p=$('#adminPanel');if(!p)return;p.classList.remove('open');$('#adminBackdrop').hidden=true;p.hidden=true;}

async function loadAdmin(){
  if(!profile?.is_admin)return;$('#adminLoading').hidden=false;$('#adminContent').hidden=true;$('#adminError').hidden=true;
  try{
    const [s,u]=await Promise.all([supabase.rpc('alevel_admin_summary'),supabase.rpc('alevel_admin_recent_users',{p_limit:100})]);if(s.error)throw s.error;if(u.error)throw u.error;
    renderAdmin(s.data||{},u.data||[]);$('#adminLoading').hidden=true;$('#adminContent').hidden=false;
  }catch(error){$('#adminLoading').hidden=true;$('#adminError').hidden=false;$('#adminError').textContent=error?.message||'Could not load admin data.';}
}

function renderAdmin(summary,users){
  const stats=[['Total users',summary.total_users??0],['Active · 7 days',summary.active_7d??0],['Active · 30 days',summary.active_30d??0],['Total uses',summary.total_uses??0],['Uses today',summary.uses_today??0],['Topic opens · 30 days',summary.topic_opens_30d??0]];
  $('#adminStats').innerHTML=stats.map(([l,v])=>`<div class="admin-stat"><span>${esc(l)}</span><strong>${Number(v).toLocaleString('en-GB')}</strong></div>`).join('');
  const breakdown=summary.plan_breakdown||{};
  $('#planBreakdown').innerHTML=['free','plus','pro','teacher'].map(t=>{const i=breakdown[t]||{users:0,uses_total:0,uses_30d:0};return `<article class="plan-card" data-plan="${t}"><div class="plan-card-head"><strong>${PLAN_LABELS[t]}</strong><span>${Number(i.users||0).toLocaleString('en-GB')} users</span></div><div class="plan-card-metrics"><div><span>Total uses</span><b>${Number(i.uses_total||0).toLocaleString('en-GB')}</b></div><div><span>Last 30 days</span><b>${Number(i.uses_30d||0).toLocaleString('en-GB')}</b></div></div></article>`;}).join('');
  $('#adminUserCount').textContent=`${users.length} shown`;
  $('#adminUserRows').innerHTML=users.length?users.map(u=>`<tr><td><strong>${esc(u.email||'—')}</strong></td><td><span class="plan-pill" data-plan="${esc(u.plan_tier||'free')}">${esc(PLAN_LABELS[u.plan_tier]||u.plan_tier||'Free')}</span></td><td>${esc((u.subscription_status||'active').replaceAll('_',' '))}</td><td>${esc(prettyDate(u.created_at))}</td><td>${esc(prettyDate(u.last_seen_at))}</td><td>${Number(u.uses_total||0).toLocaleString('en-GB')}</td><td>${Number(u.uses_30d||0).toLocaleString('en-GB')}</td></tr>`).join(''):'<tr><td colspan="7" class="admin-empty">No A-level course users yet.</td></tr>';
}

function bind(){
  setMode('signin');document.querySelectorAll('[data-auth-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.authMode)));$('#authForm').addEventListener('submit',submitAuth);
  $('#accountButton').addEventListener('click',openAccount);$('#accountClose').addEventListener('click',closeAccount);$('#accountBackdrop').addEventListener('click',closeAccount);$('#adminEntry').addEventListener('click',openAdmin);$('#adminClose').addEventListener('click',closeAdmin);$('#adminBackdrop').addEventListener('click',closeAdmin);$('#adminRefresh').addEventListener('click',loadAdmin);
  $('#signOutButton').addEventListener('click',async()=>{await supabase.auth.signOut();closeAccount();});
  window.addEventListener('coursecontextchange',e=>{const d=e.detail||{};if(!d.courseOpen||!d.topicId||d.topicId===lastTopic)return;lastTopic=d.topicId;recordUsage('topic_open',{topic_id:d.topicId,code:d.code||'',module:d.moduleLabel||''});});
  document.addEventListener('click',e=>{const tool=e.target.closest?.('[data-course-tool]');if(tool?.dataset?.courseTool)recordUsage('tool_open',{tool:tool.dataset.courseTool});});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!$('#adminPanel').hidden)closeAdmin();else if(!$('#accountPanel').hidden)closeAccount();});
}

async function boot(){
  mount();const {data,error}=await supabase.auth.getSession();if(error)console.error('Session check failed:',error);await applySession(data?.session||null);
  supabase.auth.onAuthStateChange((_event,next)=>window.setTimeout(()=>applySession(next),0));
}

boot();
window.ALevelAuth={supabase,recordUsage,openAdmin,get profile(){return profile;}};
