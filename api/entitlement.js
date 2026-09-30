import crypto from 'node:crypto';

const VALID_PLANS=new Set(['free','plus','pro','teacher']);
function send(res,status,body){res.status(status).json(body);}
function parseCookies(header=''){
  return Object.fromEntries(header.split(';').map(v=>v.trim()).filter(Boolean).map(pair=>{
    const i=pair.indexOf('=');
    return [pair.slice(0,i),decodeURIComponent(pair.slice(i+1))];
  }));
}
function expected(plan,secret){return crypto.createHmac('sha256',secret).update(plan).digest('hex');}
function safeEqual(a,b){
  try{
    const aa=Buffer.from(String(a));const bb=Buffer.from(String(b));
    return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);
  }catch{return false;}
}

export default async function handler(req,res){
  if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
  const secret=process.env.ENTITLEMENT_SECRET;
  if(!secret)return send(res,200,{plan:'free',verified:false,configured:false});
  const raw=parseCookies(req.headers.cookie||'').alevel_entitlement||'';
  const [plan,sig]=raw.split('.');
  if(!VALID_PLANS.has(plan)||!safeEqual(sig,expected(plan,secret)))return send(res,200,{plan:'free',verified:false,configured:true});
  return send(res,200,{plan,verified:true,configured:true});
}
