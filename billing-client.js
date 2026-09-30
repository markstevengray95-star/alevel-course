(()=>{
  'use strict';

  let checkoutBusy=false;

  async function json(url,options={}){
    const response=await fetch(url,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
    let data={};
    try{data=await response.json();}catch{}
    if(!response.ok)throw new Error(data?.error||`Request failed (${response.status})`);
    return data;
  }

  function announce(message){
    if(window.ALEVEL_ACCESS?.announce)window.ALEVEL_ACCESS.announce(message);
    else console.info(message);
  }

  async function refreshEntitlement(){
    try{
      const data=await json('/api/entitlement',{method:'GET',headers:{}});
      if(data?.plan)window.ALEVEL_ACCESS?.applyEntitlement?.({plan:data.plan,verified:!!data.verified});
      return data;
    }catch{
      return null;
    }
  }

  async function verifyCheckout(){
    const url=new URL(location.href);
    if(url.searchParams.get('checkout')!=='success')return false;
    const sessionId=url.searchParams.get('session_id');
    if(!sessionId)return false;
    try{
      const data=await json(`/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`,{method:'GET',headers:{}});
      if(data?.plan)window.ALEVEL_ACCESS?.applyEntitlement?.({plan:data.plan,verified:true});
      announce(`${String(data.plan||'Paid').replace(/^./,c=>c.toUpperCase())} access is now active.`);
      url.searchParams.delete('checkout');
      url.searchParams.delete('session_id');
      history.replaceState(history.state,'',url);
      return true;
    }catch(error){
      announce(error.message||'Payment completed, but access verification needs attention.');
      return false;
    }
  }

  async function startCheckout(detail){
    if(checkoutBusy)return;
    checkoutBusy=true;
    document.documentElement.classList.add('billing-checkout-busy');
    try{
      const data=await json('/api/create-checkout-session',{
        method:'POST',
        body:JSON.stringify({plan:detail?.plan,period:detail?.period})
      });
      if(!data?.url)throw new Error('Checkout did not return a payment URL.');
      location.assign(data.url);
    }catch(error){
      announce(error.message||'Unable to open secure checkout.');
      checkoutBusy=false;
      document.documentElement.classList.remove('billing-checkout-busy');
    }
  }

  window.addEventListener('alevel:checkout-requested',event=>startCheckout(event.detail||{}));

  const start=async()=>{
    const url=new URL(location.href);
    if(url.searchParams.get('checkout')==='cancelled'){
      url.searchParams.delete('checkout');
      history.replaceState(history.state,'',url);
      announce('Checkout cancelled — your current plan has not changed.');
    }
    const verified=await verifyCheckout();
    if(!verified)await refreshEntitlement();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.ALEVEL_BILLING={refreshEntitlement,startCheckout};
})();
