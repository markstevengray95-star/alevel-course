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

function withReference(base,userId){
  const url=new URL(base);
  url.searchParams.set('client_reference_id',userId);
  return url.toString();
}
function configure(user){
  currentUser=user||null;
  if(!currentUser?.id){
    window.ALEVEL_CHECKOUT_URLS={};
    document.documentElement.dataset.billingReady='false';
    return;
  }
  window.ALEVEL_CHECKOUT_URLS={
    plus:{monthly:withReference(PAYMENT_LINKS.plus.monthly,currentUser.id),annual:withReference(PAYMENT_LINKS.plus.annual,currentUser.id)},
    pro:{monthly:withReference(PAYMENT_LINKS.pro.monthly,currentUser.id),annual:withReference(PAYMENT_LINKS.pro.annual,currentUser.id)},
    teacher:{annual:withReference(PAYMENT_LINKS.teacher.annual,currentUser.id)}
  };
  document.documentElement.dataset.billingReady='true';
  window.dispatchEvent(new CustomEvent('alevel:billing-ready',{detail:{userId:currentUser.id}}));
}
async function boot(){
  const {data,error}=await supabase.auth.getSession();
  if(error)console.error('Billing session check failed:',error);
  configure(data?.session?.user||null);
  supabase.auth.onAuthStateChange((_event,session)=>configure(session?.user||null));
}

window.ALEVEL_BILLING={paymentLinks:PAYMENT_LINKS,get userId(){return currentUser?.id||null;},get ready(){return !!currentUser?.id;}};
boot();
