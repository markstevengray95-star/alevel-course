export default function handler(_req,res){
  res.status(410).json({error:'This cookie entitlement endpoint has been retired. Access is read from the signed-in Supabase account.'});
}
