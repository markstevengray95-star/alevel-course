(()=>{
'use strict';
const topicLabels={
  biology:{'3.1':'Biological molecules','3.2':'Cells','3.3':'Exchange with the environment','3.4':'Genetic information, variation & relationships','3.5':'Energy transfers','3.6':'Responses to change','3.7':'Genetics, populations, evolution & ecosystems','3.8':'Control of gene expression'},
  chemistry:{'3.1':'Physical chemistry','3.2':'Inorganic chemistry','3.3':'Organic chemistry'}
};
const exam={
  biology:{code:'7402',papers:{paper1:{label:'Paper 1',marks:91,minutes:120,scope:'Topics 1–4 + practical skills'},paper2:{label:'Paper 2',marks:91,minutes:120,scope:'Topics 5–8 + practical skills'},paper3:{label:'Paper 3',marks:78,minutes:120,scope:'Topics 1–8 + practical/data/synoptic skills'}}},
  chemistry:{code:'7405',papers:{paper1:{label:'Paper 1',marks:105,minutes:120,scope:'Selected physical + inorganic chemistry'},paper2:{label:'Paper 2',marks:105,minutes:120,scope:'Selected physical + organic chemistry'},paper3:{label:'Paper 3',marks:90,minutes:120,scope:'Any content + practical/data + synoptic/MCQ'}}}
};
const sourceFor=s=>s==='biology'?window.ALEVEL_BIOLOGY_CONTENT:window.ALEVEL_CHEMISTRY_CONTENT;
const topicKey=(subject,ref)=>subject==='biology'?ref.split('.').slice(0,2).join('.'):ref.split('.').slice(0,2).join('.');
const chemistryPaper1Physical=new Set(['3.1.1','3.1.2','3.1.3','3.1.4','3.1.6','3.1.7','3.1.8','3.1.10','3.1.11','3.1.12']);
const chemistryPaper2Physical=new Set(['3.1.2','3.1.3','3.1.4','3.1.5','3.1.6','3.1.9']);
function papersFor(subject,ref){
  if(subject==='biology'){
    const topic=Number(ref.split('.')[1]);
    return topic<=4?['paper1','paper3']:['paper2','paper3'];
  }
  const papers=['paper3'];
  if(ref.startsWith('3.2.')||chemistryPaper1Physical.has(ref))papers.unshift('paper1');
  if(ref.startsWith('3.3.')||chemistryPaper2Physical.has(ref))papers.unshift('paper2');
  return [...new Set(papers)];
}
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function points(arr,max=4){return (Array.isArray(arr)?arr:[]).map(clean).filter(Boolean).slice(0,max);}
function buildQuestions(subject){
  const source=sourceFor(subject);
  if(!source?.all)return [];
  const questions=[];
  for(const ref of source.refs||Object.keys(source.all)){
    const p=source.all[ref];if(!p)continue;
    const topic=topicKey(subject,ref),label=topicLabels[subject][topic]||topic;
    const base={subject,ref,topic,topicLabel:label,papers:papersFor(subject,ref)};
    const core=points(p.core,4),model=points(p.model,4),practical=points(p.practical,4),maths=points(p.maths,3),syn=points(p.syn,3);
    const terms=points(p.terms,5);
    questions.push({...base,id:`${subject}-${ref}-ao1`,ao:'AO1',marks:4,kind:'knowledge',practical:false,maths:false,
      prompt:p.exam?.[0]||`Explain the key science in: ${p.q}`,
      context:`Use precise ${subject} terminology.`,markPoints:core.length?core:[p.q],terms});
    questions.push({...base,id:`${subject}-${ref}-ao2`,ao:'AO2',marks:4,kind:'application',practical:false,maths:maths.length>0,
      prompt:p.exam?.[1]||`Apply your understanding of ${terms.slice(0,2).join(' and ')||label} to an unfamiliar context.`,
      context:`Your answer should apply principles rather than only recall definitions.${maths[0]?` Relevant quantitative skill: ${maths[0]}`:''}`,
      markPoints:(model.length?model:core).slice(0,4),terms});
    questions.push({...base,id:`${subject}-${ref}-ao3`,ao:'AO3',marks:4,kind:'analysis',practical:false,maths:false,
      prompt:p.exam?.[2]||`Analyse or evaluate evidence connected with ${p.q}`,
      context:p.mis?`A common misconception is: “${p.mis}” Analyse the science carefully.`:'Use evidence and reach a justified conclusion.',
      markPoints:[...syn,...core].slice(0,4),terms});
    questions.push({...base,id:`${subject}-${ref}-practical`,ao:'AO3',marks:4,kind:'practical',practical:true,maths:maths.length>0,
      prompt:`A student investigates a practical context linked to ${label}. Explain how the investigation should produce valid evidence and how the results should be analysed.`,
      context:practical[0]||`Plan, analyse and evaluate a practical linked to ${p.q}`,
      markPoints:[...practical,...maths].slice(0,4),terms});
  }
  return questions;
}
const banks=Object.freeze({biology:Object.freeze(buildQuestions('biology')),chemistry:Object.freeze(buildQuestions('chemistry'))});
window.ALEVEL_ASSESSMENT_DATA=Object.freeze({version:'phase-11',topicLabels,exam,banks,getBank:s=>banks[s]||[]});
})();