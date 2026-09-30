import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';

const SUPABASE_URL='https://emjmvgginijkupwuflla.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_axgWqbWx-24V2b9s7mE1Fw__N3Ce61f';
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

const PAYMENT_LINKS={
  plus:{monthly:'https://buy.stripe.com/6oU7sMbWrcHc1u985b5AQ0b',annual:'https://buy.stripe.com/14A7sM0dJbD81u9dpv5AQ0c'},
  pro:{monthly:'https://buy.stripe.com/4gMaEYbWrgXsdcR2KR5AQ0d',annual:'https://buy.stripe.com/8x24gA3pVaz41u9gBH5AQ0e'},
  teacher:{annual:'https://buy.stripe.com/bJecN67Gb9v05Kp85b5AQ0f'}
};
const PORTAL_URL='https://billing.stripe.com/p/login/bJe6oI8Kf5eK8WBetz5AQ00';
const TRIAL_DAYS=7;
let currentUser=null;
let checkoutReference='';
let configureVersion=0;

function withReference(base,reference){
  const url=new URL(base);
  url.searchParams.set('client_reference_id',reference);
  return url.toString();
}
function openPortal(){
  location.href=PORTAL_URL;
}
function clearCheckout(){
  checkoutReference='';
  window.ALEVEL_CHECKOUT_URLS={};
  document.documentElement.dataset.billingReady='false';
}
function ensureManageButton(){
  const signOut=document.getElementById('signOutButton');
  if(!signOut)return null;
  let button=document.getElementById('manageSubscriptionButton');
  if(button)return button;
  button=document.createElement('button');
  button.type='button';
  button.id='manageSubscriptionButton';
  button.className='button quiet account-manage-billing';
  button.textContent='Manage subscription / cancel';
  button.hidden=true;
  button.addEventListener('click',openPortal);
  signOut.before(button);
  return button;
}
function ensureTrialNotice(){
  const section=document.getElementById('pricingSection');
  if(!section||document.getElementById('billingTrialNote'))return;
  const note=document.createElement('p');
  note.id='billingTrialNote';
  note.className='pricing-note billing-trial-note';
  note.textContent=`Plus, Pro and Teacher include a ${TRIAL_DAYS}-day free trial. A payment method is collected at checkout and billing starts automatically when the trial ends unless you cancel first. Promo codes can be entered at checkout. Free stays £0 and is never auto-charged.`;
  const existing=section.querySelector('.pricing-note');
  if(existing)existing.before(note);else section.appendChild(note);
}
function syncBillingUi(plan=document.documentElement.dataset.accessPlan||'free'){
  const button=ensureManageButton();
  if(button){
    const adminEntry=document.getElementById('adminEntry');
    const isAdmin=!!adminEntry&&!adminEntry.hidden;
    button.hidden=!currentUser||isAdmin||plan==='free';
  }
  ensureTrialNotice();
}
async function configure(user){
  const version=++configureVersion;
  currentUser=user||null;
  clearCheckout();
  syncBillingUi();
  if(!currentUser?.id)return;
  try{
    const {data,error}=await supabase.rpc('alevel_create_checkout_reference');
    if(error)throw error;
    if(version!==configureVersion||currentUser?.id!==user.id)return;
    const reference=String(data||'');
    if(!/^[0-9a-f]{64}$/i.test(reference))throw new Error('Invalid checkout reference');
    checkoutReference=reference;
    window.ALEVEL_CHECKOUT_URLS={
      plus:{monthly:withReference(PAYMENT_LINKS.plus.monthly,reference),annual:withReference(PAYMENT_LINKS.plus.annual,reference)},
      pro:{monthly:withReference(PAYMENT_LINKS.pro.monthly,reference),annual:withReference(PAYMENT_LINKS.pro.annual,reference)},
      teacher:{annual:withReference(PAYMENT_LINKS.teacher.annual,reference)}
    };
    document.documentElement.dataset.billingReady='true';
    window.dispatchEvent(new CustomEvent('alevel:billing-ready',{detail:{ready:true,trialDays:TRIAL_DAYS}}));
    window.setTimeout(()=>syncBillingUi(),0);
  }catch(error){
    console.error('Secure checkout setup failed:',error);
    clearCheckout();
  }
}
async function boot(){
  const {data,error}=await supabase.auth.getSession();
  if(error)console.error('Billing session check failed:',error);
  await configure(data?.session?.user||null);
  supabase.auth.onAuthStateChange((_event,session)=>window.setTimeout(()=>configure(session?.user||null),0));
}

window.addEventListener('alevel:plan-changed',event=>syncBillingUi(event.detail?.plan||'free'));
window.addEventListener('alevel:billing-ready',()=>syncBillingUi());
window.addEventListener('alevel:plan-downgrade-requested',()=>{
  if(currentUser)openPortal();
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>syncBillingUi(),{once:true});
else syncBillingUi();

window.ALEVEL_BILLING={paymentLinks:PAYMENT_LINKS,portalUrl:PORTAL_URL,trialDays:TRIAL_DAYS,openPortal,get ready(){return !!checkoutReference;}};
boot();
