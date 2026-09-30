'use strict';

const GATEWAY_URL='https://ai-gateway.vercel.sh/v1/chat/completions';
const DEFAULT_MODEL='openai/gpt-5.6-sol';
const ALLOWED_MODES=new Set(['explain','hint','quiz','worked','exam']);

function clean(value,max=5000){return String(value??'').replace(/\u0000/g,'').trim().slice(0,max);}
function cleanList(value,limit=8,itemMax=700){return Array.isArray(value)?value.slice(0,limit).map(v=>clean(v,itemMax)).filter(Boolean):[];}
function json(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));}
function equationLines(value){
  if(!Array.isArray(value))return[];
  return value.slice(0,6).map(eq=>Array.isArray(eq)?eq.map(x=>clean(x,350)).filter(Boolean).join(' — '):clean(eq,500)).filter(Boolean);
}
function chunkLines(value){
  if(!Array.isArray(value))return[];
  return value.slice(0,8).map(chunk=>{
    if(!chunk||typeof chunk!=='object')return clean(chunk,900);
    const title=clean(chunk.title,180);const text=cleanList(chunk.text,5,700).join(' ');
    return clean(`${title}${title&&text?': ':''}${text}`,1100);
  }).filter(Boolean);
}

module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});

  const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_KEY;
  if(!key)return json(res,503,{error:'Live AI is not configured',code:'AI_NOT_CONFIGURED'});

  let body=req.body;
  if(typeof body==='string'){
    try{body=JSON.parse(body);}catch{return json(res,400,{error:'Invalid JSON'});}
  }
  body=body||{};

  const message=clean(body.message,4200);
  if(!message)return json(res,400,{error:'Message is required'});

  const mode=ALLOWED_MODES.has(body.mode)?body.mode:'explain';
  const context=body.context||{};
  const topicCode=clean(context.code,60)||'AQA Physics';
  const topicTitle=clean(context.title,180)||'Current topic';
  const moduleLabel=clean(context.moduleLabel,180);
  const description=clean(context.description,900);
  const pageTitle=clean(context.pageTitle,220);
  const pageText=clean(context.pageText,6500);

  const lesson=body.lesson&&typeof body.lesson==='object'?body.lesson:{};
  const lessonTitle=clean(lesson.title,240);
  const lessonRef=clean(lesson.ref,80);
  const lessonFocus=clean(lesson.focus,2200);
  const lessonObjectives=cleanList(lesson.objectives,6,500);
  const lessonKeywords=cleanList(lesson.keywords,12,120);
  const lessonEquations=equationLines(lesson.equations);
  const lessonChunks=chunkLines(lesson.chunks);
  const lessonMisconceptions=cleanList(lesson.misconceptions,6,650);
  const lessonChecks=cleanList(lesson.checks,5,650);
  const lessonExam=Array.isArray(lesson.exam)?lesson.exam.slice(0,4).map(q=>clean(typeof q==='object'?`${q.marks||''} marks: ${q.q||''}`:q,800)).filter(Boolean):[];
  const worked=lesson.worked&&typeof lesson.worked==='object'?lesson.worked:{};
  const workedText=clean([worked.question,...cleanList(worked.steps,6,500),worked.answer].filter(Boolean).join(' | '),2500);

  const hasLesson=!!(lessonTitle||lessonFocus||lessonChunks.length||lessonEquations.length);
  const lessonGrounding=hasLesson?clean([
    `Lesson/section: ${lessonTitle||'current lesson'}`,
    lessonRef?`Reference: ${lessonRef}`:'',
    lessonFocus?`Focus: ${lessonFocus}`:'',
    lessonObjectives.length?`Objectives: ${lessonObjectives.join(' | ')}`:'',
    lessonKeywords.length?`Keywords: ${lessonKeywords.join(', ')}`:'',
    lessonEquations.length?`Equations: ${lessonEquations.join(' | ')}`:'',
    lessonChunks.length?`Teaching text: ${lessonChunks.join(' | ')}`:'',
    workedText?`Worked example: ${workedText}`:'',
    lessonMisconceptions.length?`Known misconceptions: ${lessonMisconceptions.join(' | ')}`:'',
    lessonChecks.length?`Checks: ${lessonChecks.join(' | ')}`:'',
    lessonExam.length?`Exam practice: ${lessonExam.join(' | ')}`:''
  ].filter(Boolean).join('\n'),9000):'';

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
- Topic scope: ${description||'Use the supplied lesson/textbook grounding and standard AQA A-level Physics knowledge.'}
- Current page title: ${pageTitle||lessonTitle||'not available'}

Teaching mode: ${mode}
${modeRules[mode]}

Accuracy rules:
1. Stay focused on AQA A-level Physics and the current topic unless the student clearly asks for a connection to another topic.
2. Treat supplied lesson/textbook material as the immediate learning context. Explain it faithfully, but correct an error if one is present rather than repeating it.
3. Use correct SI units, symbols and sign conventions. For calculations, write the equation before substituting and check units/significant figures.
4. Distinguish scalar/vector quantities and assumptions where relevant.
5. Never invent an AQA specification statement, practical requirement or official mark-scheme point. If uncertain, say what is uncertain.
6. Prefer explanation and reasoning over simply giving an answer. In hint or quiz mode, do not jump straight to the final answer.
7. If marking a student answer, make the feedback specific and evidence-based and describe any mark estimate as approximate unless an official mark scheme is supplied.
8. When an analogy is requested, explicitly state where the analogy stops matching the real physics.
9. Keep the response readable: short paragraphs, equations on clear lines, and usually under 450 words.
10. End with one useful next step or check question when appropriate.

Lesson/textbook grounding:
${lessonGrounding||'[No structured lesson/textbook bundle was supplied.]'}

Visible course page context:
${pageText||'[No embedded page text was available.]'}`;

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
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
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