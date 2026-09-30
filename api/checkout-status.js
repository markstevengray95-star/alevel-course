export default function handler(_req,res){
  res.status(410).json({error:'This checkout verification endpoint has been retired. Subscription access is verified by the Stripe webhook.'});
}
