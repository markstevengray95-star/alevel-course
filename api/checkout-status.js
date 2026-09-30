import crypto from 'node:crypto';

const VALID_PLANS=new Set(['plus','pro','teacher']);
function send(res,status,body){res.status(status).json(body);}
function sign(plan,secret){return crypto.createHmac('sha256',secret).update(plan).digest('hex');}
function cookieFor(plan,secret){
  const value=`${plan}.${sign(plan,secret)}`;
  return `alevel_entitlement=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
}

export default async function handler(req,res){
  if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
  const sessionId=String(req.query?.session_id||'');
  if(!sessionId.startsWith('cs_'))return send(res,400,{error:'Invalid checkout session.'});
  if(!process.env.STRIPE_SECRET_KEY||!process.env.ENTITLEMENT_SECRET)return send(res,503,{error:'Billing verification is not configured on Vercel yet.'});

  try{
    const stripe=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,{
      headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`}
    });
    const data=await stripe.json();
    if(!stripe.ok)return send(res,stripe.status||500,{error:data?.error?.message||'Unable to verify checkout.'});

    const plan=String(data?.metadata?.alevel_plan||data?.subscription?.metadata?.alevel_plan||'').toLowerCase();
    const complete=data?.status==='complete' && ['paid','no_payment_required'].includes(data?.payment_status);
    const subscriptionOk=!data?.subscription || ['active','trialing'].includes(data.subscription.status);
    if(!complete||!subscriptionOk||!VALID_PLANS.has(plan))return send(res,403,{error:'Checkout is not an active paid subscription.'});

    res.setHeader('Set-Cookie',cookieFor(plan,process.env.ENTITLEMENT_SECRET));
    return send(res,200,{plan,verified:true});
  }catch{
    return send(res,500,{error:'Unable to verify subscription.'});
  }
}
