const PLAN_PRICES={
  plus:{monthly:499,annual:3999},
  pro:{monthly:799,annual:5999},
  teacher:{annual:8900}
};
const PLAN_NAMES={plus:'A-Level Physics Plus',pro:'A-Level Physics Pro',teacher:'A-Level Physics Teacher'};

function send(res,status,body){res.status(status).json(body);}
function originFrom(req){
  const explicit=process.env.APP_URL;
  if(explicit)return explicit.replace(/\/$/,'');
  const host=req.headers['x-forwarded-host']||req.headers.host;
  const proto=req.headers['x-forwarded-proto']||'https';
  return `${proto}://${host}`;
}

export default async function handler(req,res){
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  if(!process.env.STRIPE_SECRET_KEY)return send(res,503,{error:'Stripe is not configured on Vercel yet.'});

  const plan=String(req.body?.plan||'').toLowerCase();
  const requestedPeriod=String(req.body?.period||'annual').toLowerCase();
  const period=plan==='teacher'?'annual':requestedPeriod;
  if(!PLAN_PRICES[plan]||!PLAN_PRICES[plan][period])return send(res,400,{error:'Unknown subscription plan or billing period.'});

  const amount=PLAN_PRICES[plan][period];
  const interval=period==='monthly'?'month':'year';
  const origin=originFrom(req);
  const params=new URLSearchParams();
  params.set('mode','subscription');
  params.set('ui_mode','hosted_page');
  params.set('submit_type','subscribe');
  params.set('locale','en-GB');
  params.set('success_url',`${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url',`${origin}/?checkout=cancelled`);
  params.set('allow_promotion_codes','true');
  params.set('billing_address_collection','auto');
  params.set('line_items[0][quantity]','1');
  params.set('line_items[0][price_data][currency]','gbp');
  params.set('line_items[0][price_data][unit_amount]',String(amount));
  params.set('line_items[0][price_data][recurring][interval]',interval);
  params.set('line_items[0][price_data][product_data][name]',PLAN_NAMES[plan]);
  params.set('line_items[0][price_data][product_data][description]',`${PLAN_NAMES[plan]} subscription (${period})`);
  params.set('metadata[alevel_plan]',plan);
  params.set('metadata[billing_period]',period);
  params.set('subscription_data[metadata][alevel_plan]',plan);
  params.set('subscription_data[metadata][billing_period]',period);
  params.set('subscription_data[billing_mode][type]','flexible');

  try{
    const stripe=await fetch('https://api.stripe.com/v1/checkout/sessions',{
      method:'POST',
      headers:{
        Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type':'application/x-www-form-urlencoded'
      },
      body:params.toString()
    });
    const data=await stripe.json();
    if(!stripe.ok)return send(res,stripe.status||500,{error:data?.error?.message||'Unable to create checkout session.'});
    return send(res,200,{url:data.url,id:data.id});
  }catch(error){
    return send(res,500,{error:'Unable to contact Stripe Checkout.'});
  }
}
