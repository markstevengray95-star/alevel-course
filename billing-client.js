import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';

const SUPABASE_URL='https://emjmvgginijkupwuflla.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_axgWqbWx-24V2b9s7mE1Fw__N3Ce61f';
const supabase=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

const PAYMENT_LINKS={
  plus:{monthly:'https://buy.stripe.com/6oU7sMbWrcHc1u985b5AQ0b',annual:'https://buy.stripe.com/14A7sM0dJbD81u9dpv5AQ0c'},
  pro:{monthly:'https://buy.stripe.com/4gMaEYbWrgXsdcR2KR5AQ0d',annual:'https://buy.stripe.com/8x24gA3pVaz41u9gBH5AQ0e'},
  teacher:{annual:'https://buy.stripe.com/bJecN67Gb9v05Kp85b5AQ0f'}
};
let currentUser=null;
let checkoutReference='';
let configureVersion=0;

function withReference(base,reference){
  const url=new URL(base);
  url.searchParams.set('client_reference_id',reference);
  return url.toString();
}
function clearCheckout(){
  checkoutReference='';
  window.ALEVEL_CHECKOUT_URLS={};
  document.documentElement.dataset.billingReady='false';
}
async function configure(user){
  const version=++configureVersion;
  currentUser=user||null;
  clearCheckout();
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
    window.dispatchEvent(new CustomEvent('alevel:billing-ready',{detail:{ready:true}}));
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

window.ALEVEL_BILLING={paymentLinks:PAYMENT_LINKS,get ready(){return !!checkoutReference;}};
boot();
