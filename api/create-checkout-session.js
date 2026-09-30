export default function handler(_req,res){
  res.status(410).json({error:'This checkout endpoint has been retired. Use the signed-in Stripe Payment Link flow.'});
}
