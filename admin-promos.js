import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';

const SUPABASE_URL='https://emjmvgginijkupwuflla.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_axgWqbWx-24V2b9s7mE1Fw__N3Ce61f';
const FUNCTION_URL=`${SUPABASE_URL}/functions/v1/alevel-promo-admin`;
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let mounted=false;
let loading=false;

const esc=(v='')=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const money=v=>`£${Number(v||0).toFixed(2)}`;
const dateFromUnix=v=>v?new Intl.DateTimeFormat('en-GB',{dateStyle:'medium'}).format(new Date(Number(v)*1000)):'No expiry';

function injectStyles(){
  if(document.getElementById('adminPromoStyles'))return;
  const style=document.createElement('style');
  style.id='adminPromoStyles';
  style.textContent=`
    .admin-promo-section{margin-top:26px;padding-top:2px}
    .promo-shell{border:1px solid var(--line-soft);border-radius:16px;background:rgba(255,255,255,.022);overflow:hidden}
    .promo-connection{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border-bottom:1px solid var(--line-soft);background:#0a1420}
    .promo-connection-copy{display:grid;gap:4px}.promo-connection-copy strong{font-size:.8rem}.promo-connection-copy span{font-size:.67rem;color:var(--muted);line-height:1.45}
    .promo-status{display:inline-flex;align-items:center;gap:6px;font-size:.65rem;font-weight:850}.promo-status i{width:8px;height:8px;border-radius:50%;background:#687c90}.promo-status[data-connected="true"] i{background:var(--good)}
    .promo-connect-form{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:8px;padding:14px 16px;border-bottom:1px solid var(--line-soft)}
    .promo-connect-form input,.promo-form input,.promo-form select{width:100%;border:1px solid var(--line);background:#07111c;color:var(--text);border-radius:9px;padding:9px 10px;font:inherit;font-size:.72rem;outline:none}
    .promo-connect-note{grid-column:1/-1;margin:0;font-size:.63rem;color:var(--muted);line-height:1.45}
    .promo-main{padding:16px}.promo-form{display:grid;grid-template-columns:1.15fr .9fr .8fr .9fr .8fr .8fr;gap:10px;align-items:end}
    .promo-field{display:grid;gap:6px}.promo-field>span{font-size:.62rem;color:#a9bac9;font-weight:800}.promo-field small{font-size:.58rem;color:var(--muted)}
    .promo-check{display:flex;align-items:center;gap:7px;min-height:36px;font-size:.66rem;color:#bac8d5}.promo-check input{width:auto}
    .promo-create{min-height:36px}
    .promo-message{min-height:18px;margin:10px 0 0;font-size:.66rem;color:var(--muted)}.promo-message[data-type="error"]{color:var(--danger)}.promo-message[data-type="success"]{color:var(--good)}
    .promo-list-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:20px 0 9px}.promo-list-head h4{margin:0;font-size:.82rem}.promo-list-head span{font-size:.62rem;color:var(--muted)}
    .promo-table-wrap{overflow:auto;border:1px solid var(--line-soft);border-radius:12px;background:#07111c}.promo-table{width:100%;border-collapse:collapse;min-width:780px}.promo-table th,.promo-table td{padding:9px 10px;text-align:left;border-bottom:1px solid var(--line-soft);font-size:.66rem;white-space:nowrap}.promo-table th{font-size:.57rem;color:#8fa4b8;text-transform:uppercase;letter-spacing:.05em;background:#0d1825}.promo-table tr:last-child td{border-bottom:0}.promo-code{font-weight:900;letter-spacing:.035em;color:#d8f7f3}.promo-badge{display:inline-flex;padding:3px 6px;border-radius:999px;border:1px solid rgba(102,217,208,.25);font-size:.58rem;font-weight:850}.promo-badge.off{color:#8c9bae;border-color:var(--line)}
    .promo-disconnect{appearance:none;border:0;background:transparent;color:#8fa3b7;font:inherit;font-size:.62rem;text-decoration:underline;cursor:pointer;padding:0}
    @media(max-width:1100px){.promo-form{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:720px){.promo-connection{align-items:flex-start;flex-direction:column}.promo-connect-form{grid-template-columns:1fr}.promo-form{grid-template-columns:1fr 1fr}.promo-main{padding:12px}}
  `;
  document.head.appendChild(style);
}

async function api(action,payload={}){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session?.access_token)throw new Error('Sign in again to manage promo codes.');
  const res=await fetch(FUNCTION_URL,{method:'POST',headers:{'content-type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY,'authorization':`Bearer ${session.access_token}`},body:JSON.stringify({action,...payload})});
  const body=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(body?.error||'Promo-code request failed.');
  return body;
}

function mount(){
  if(mounted)return true;
  const breakdown=document.getElementById('planBreakdown');
  if(!breakdown)return false;
  mounted=true;injectStyles();
  const section=document.createElement('section');
  section.id='adminPromoSection';section.className='admin-promo-section';
  section.innerHTML=`
    <div class="admin-section-head"><div><span class="eyebrow">Billing tools</span><h3>Promo codes</h3></div><span>Create Stripe discounts without leaving the admin dashboard</span></div>
    <div class="promo-shell">
      <div class="promo-connection">
        <div class="promo-connection-copy"><strong>Stripe promo-code connection</strong><span id="promoConnectionText">Checking secure connection…</span></div>
        <div><span class="promo-status" id="promoStatus" data-connected="false"><i></i><span>Checking</span></span> <button class="promo-disconnect" id="promoDisconnect" type="button" hidden>Disconnect</button></div>
      </div>
      <form class="promo-connect-form" id="promoConnectForm" hidden>
        <input id="promoStripeKey" type="password" autocomplete="off" placeholder="rk_live_… restricted Stripe key" aria-label="Stripe restricted key">
        <button class="button primary" type="submit">Connect Stripe</button>
        <p class="promo-connect-note">One-time setup: use a live Stripe restricted key with Coupons and Promotion Codes read/write access. The key is sent only to the protected server function and is never stored in browser storage or source code.</p>
      </form>
      <div class="promo-main" id="promoManager" hidden>
        <form class="promo-form" id="promoForm">
          <label class="promo-field"><span>Promo code</span><input id="promoCode" maxlength="40" required placeholder="WELCOME20"><small>Letters, numbers and dashes</small></label>
          <label class="promo-field"><span>Discount type</span><select id="promoType"><option value="percent">Percentage off</option><option value="amount">Fixed £ amount</option></select></label>
          <label class="promo-field"><span>Discount</span><input id="promoValue" type="number" min="0.01" step="0.01" required placeholder="20"><small id="promoValueHelp">0–100%</small></label>
          <label class="promo-field"><span>Duration</span><select id="promoDuration"><option value="once">First payment only</option><option value="repeating">Repeat for months</option><option value="forever">Every payment</option></select></label>
          <label class="promo-field" id="promoMonthsField" hidden><span>Months</span><input id="promoMonths" type="number" min="1" max="60" step="1" value="3"></label>
          <label class="promo-field"><span>Max uses</span><input id="promoMaxUses" type="number" min="1" step="1" placeholder="Unlimited"></label>
          <label class="promo-field"><span>Expiry</span><input id="promoExpiry" type="datetime-local"></label>
          <label class="promo-check"><input id="promoFirstTime" type="checkbox"> First-time customers only</label>
          <button class="button primary promo-create" id="promoCreate" type="submit">Create promo code</button>
        </form>
        <p class="promo-message" id="promoMessage" role="status" aria-live="polite"></p>
        <div class="promo-list-head"><h4>Your A-Level promo codes</h4><span id="promoCount">0 codes</span></div>
        <div class="promo-table-wrap"><table class="promo-table"><thead><tr><th>Code</th><th>Discount</th><th>Duration</th><th>Uses</th><th>Expires</th><th>Status</th></tr></thead><tbody id="promoRows"><tr><td colspan="6">Connect Stripe to load promo codes.</td></tr></tbody></table></div>
      </div>
    </div>`;
  breakdown.insertAdjacentElement('afterend',section);
  bind();
  return true;
}

function setMessage(text,type=''){const el=document.getElementById('promoMessage');if(!el)return;el.textContent=text||'';el.dataset.type=type;}
function setConnection(connected){
  const status=document.getElementById('promoStatus'),form=document.getElementById('promoConnectForm'),manager=document.getElementById('promoManager'),disconnect=document.getElementById('promoDisconnect'),copy=document.getElementById('promoConnectionText');
  if(!status)return;
  status.dataset.connected=String(connected);status.querySelector('span').textContent=connected?'Connected':'Not connected';
  form.hidden=connected;manager.hidden=!connected;disconnect.hidden=!connected;
  copy.textContent=connected?'Secure live Stripe connection ready. Codes here apply only to A-Level Physics Plus, Pro and Teacher products.':'Connect once with a restricted live Stripe key to create codes from this dashboard.';
}

function renderCodes(codes=[]){
  const rows=document.getElementById('promoRows'),count=document.getElementById('promoCount');
  if(!rows)return;
  count.textContent=`${codes.length} code${codes.length===1?'':'s'}`;
  rows.innerHTML=codes.length?codes.map(c=>{
    const discount=c.discount_type==='percent'?`${Number(c.discount_value)}% off`:`${money(c.discount_value)} off`;
    const duration=c.duration==='forever'?'Every payment':c.duration==='repeating'?`${c.duration_in_months||'?'} months`:'First payment';
    const uses=c.max_redemptions?`${c.times_redeemed||0} / ${c.max_redemptions}`:`${c.times_redeemed||0} / unlimited`;
    return `<tr><td><span class="promo-code">${esc(c.code)}</span></td><td>${esc(discount)}</td><td>${esc(duration)}${c.first_time_only?' · new customers':''}</td><td>${esc(uses)}</td><td>${esc(dateFromUnix(c.expires_at))}</td><td><span class="promo-badge${c.active?'':' off'}">${c.active?'Active':'Inactive'}</span></td></tr>`;
  }).join(''):'<tr><td colspan="6">No A-Level promo codes have been created yet.</td></tr>';
}

async function loadPromos(){
  if(loading||!mounted)return;loading=true;setMessage('');
  try{
    const status=await api('status');setConnection(!!status.connected);
    if(status.connected){const result=await api('list');renderCodes(result.promo_codes||[]);}
  }catch(error){setConnection(false);setMessage(error?.message||'Could not load promo codes.','error');}
  finally{loading=false;}
}

function bind(){
  document.getElementById('promoType').addEventListener('change',e=>{document.getElementById('promoValueHelp').textContent=e.target.value==='percent'?'0–100%':'Amount in pounds';});
  document.getElementById('promoDuration').addEventListener('change',e=>{document.getElementById('promoMonthsField').hidden=e.target.value!=='repeating';});
  document.getElementById('promoConnectForm').addEventListener('submit',async e=>{e.preventDefault();const input=document.getElementById('promoStripeKey'),button=e.currentTarget.querySelector('button');button.disabled=true;setMessage('Checking Stripe permissions…');try{await api('connect',{stripe_key:input.value.trim()});input.value='';setConnection(true);setMessage('Stripe connected securely.','success');await loadPromos();}catch(error){setMessage(error?.message||'Could not connect Stripe.','error');}finally{button.disabled=false;}});
  document.getElementById('promoDisconnect').addEventListener('click',async()=>{if(!confirm('Disconnect Stripe promo-code management from this admin dashboard? Existing promo codes will remain active in Stripe.'))return;try{await api('disconnect');setConnection(false);renderCodes([]);setMessage('Stripe admin connection removed.','success');}catch(error){setMessage(error?.message||'Could not disconnect Stripe.','error');}});
  document.getElementById('promoForm').addEventListener('submit',async e=>{e.preventDefault();const button=document.getElementById('promoCreate');button.disabled=true;setMessage('Creating promo code in Stripe…');try{const payload={code:document.getElementById('promoCode').value.trim(),discount_type:document.getElementById('promoType').value,discount_value:Number(document.getElementById('promoValue').value),duration:document.getElementById('promoDuration').value,duration_in_months:Number(document.getElementById('promoMonths').value),max_redemptions:document.getElementById('promoMaxUses').value?Number(document.getElementById('promoMaxUses').value):null,expires_at:document.getElementById('promoExpiry').value||null,first_time_only:document.getElementById('promoFirstTime').checked};const result=await api('create',payload);setMessage(`Promo code ${result.promo_code?.code||payload.code.toUpperCase()} created and ready at checkout.`,'success');e.currentTarget.reset();document.getElementById('promoMonths').value='3';document.getElementById('promoMonthsField').hidden=true;document.getElementById('promoValueHelp').textContent='0–100%';await loadPromos();}catch(error){setMessage(error?.message||'Could not create promo code.','error');}finally{button.disabled=false;}});
  document.getElementById('adminEntry')?.addEventListener('click',()=>setTimeout(loadPromos,120));
  document.getElementById('adminRefresh')?.addEventListener('click',()=>setTimeout(loadPromos,40));
}

function start(){
  if(mount())return;
  const observer=new MutationObserver(()=>{if(mount()){observer.disconnect();}});observer.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
