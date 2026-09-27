'use strict';

const GATEWAY_URL='https://ai-gateway.vercel.sh/v1/chat/completions';
const DEFAULT_MODEL='openai/gpt-5.6-sol';
const ALLOWED_MODES=new Set(['explain','hint','quiz','worked','exam']);

function clean(value,max=5000){return String(value??'').replace(/\u0000/g,'').trim().slice(0,max);}
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));}

module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});

  const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_KEY;
  if(!key)return json(res,503,{error:'Live AI is not configured',code:'AI_NOT_CONFIGURED'});

  let body=req.body;
  if(typeof body==='string'){
    try{body=JSON.parse(body);}catch{return json(res,400,{error:'Invalid JSON'});}
  }
  body=body||{};

  const message=clean(body.message,3000);
  if(!message)return json(res,400,{error:'Message is required'});

  const mode=ALLOWED_MODES.has(body.mode)?body.mode:'explain';
  const context=body.context||{};
  const topicCode=clean(context.code,40)||'AQA Physics';
  const topicTitle=clean(context.title,160)||'Current topic';
  const moduleLabel=clean(context.moduleLabel,160);
  const description=clean(context.description,700);
  const pageTitle=clean(context.pageTitle,180);
  const pageText=clean(context.pageText,6500);

  const modeRules={
    explain:'Explain clearly from first principles, chunk the idea into short steps, and use equations only when they help.',
    hint:'Use a Socratic hint-first approach. Do not reveal the full answer immediately. Give one useful next step, then ask the student to continue.',
    quiz:'Ask one AQA-style question at a time. Do not reveal the answer in the same response. Wait for the student response before marking or explaining.',
    worked:'Give a worked example with givens, equation, rearrangement, substitution, unit and final check. Keep the arithmetic transparent.',
    exam:'Act as a careful AQA-style feedback coach. Identify what is correct, what is missing, and how to improve. Do not claim access to an official mark scheme unless one was provided.'
  };

  const system=`You are an expert AQA A-level Physics (7408) study coach for school students.

Current course context:
- Section: ${topicCode}
- Topic: ${topicTitle}
- Module: ${moduleLabel||'current module'}
- Topic scope: ${description||'Use the supplied lesson context and standard AQA A-level Physics knowledge.'}
- Current page title: ${pageTitle||'not available'}

Teaching mode: ${mode}
${modeRules[mode]}

Accuracy rules:
1. Stay focused on AQA A-level Physics and the current topic unless the student clearly asks for a connection to another topic.
2. Use correct SI units, symbols and sign conventions. For calculations, write the equation before substituting and check units/significant figures.
3. Distinguish scalar/vector quantities and assumptions where relevant.
4. Never invent an AQA specification statement, practical requirement or mark-scheme point. If uncertain, say what is uncertain.
5. Prefer explanation and reasoning over simply giving an answer. In hint or quiz mode, do not jump straight to the final answer.
6. If marking a student answer, make the feedback specific and evidence-based and describe any mark estimate as approximate unless an official mark scheme is supplied.
7. Keep the response readable: short paragraphs, equations on clear lines, and usually under 450 words.
8. End with one useful next step, check question, or invitation to show working when appropriate.

Visible lesson context (use this as grounding when relevant):
${pageText||'[No lesson text was available from the embedded page.]'}`;

  const history=Array.isArray(body.history)?body.history.slice(-8):[];
  const messages=[{role:'system',content:system}];
  for(const item of history){
    if(!item||!['user','assistant'].includes(item.role))continue;
    const content=clean(item.text||item.content,2200);
    if(content)messages.push({role:item.role,content});
  }
  messages.push({role:'user',content:message});

  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),28000);
  try{
    const response=await fetch(GATEWAY_URL,{
      method:'POST',
      headers:{
        'Authorization':`Bearer ${key}`,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({model:process.env.AI_MODEL||DEFAULT_MODEL,messages}),
      signal:controller.signal
    });

    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      console.error('AI Gateway error',response.status,data?.error?.type||data?.error?.message||'unknown');
      return json(res,502,{error:'AI provider request failed'});
    }

    const answer=data?.choices?.[0]?.message?.content;
    if(typeof answer!=='string'||!answer.trim())return json(res,502,{error:'AI provider returned no text'});

    return json(res,200,{answer:answer.trim(),model:data.model||process.env.AI_MODEL||DEFAULT_MODEL});
  }catch(error){
    const timedOut=error?.name==='AbortError';
    console.error('Physics coach request failed',timedOut?'timeout':error?.message||error);
    return json(res,timedOut?504:502,{error:timedOut?'AI request timed out':'AI request failed'});
  }finally{
    clearTimeout(timer);
  }
};
