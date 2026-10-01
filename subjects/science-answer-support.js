(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function practiceHtml(p){return p.exam.map((q,i)=>`<article class="science-question"><h4>Practice ${i+1}</h4><p>${esc(q)}</p><details><summary>Show detailed model answer</summary><ol>${(p.examAnswers?.[i]||[]).map(step=>`<li>${esc(step)}</li>`).join('')}</ol></details></article>`).join('');}
function answers(p){return p.exam.flatMap((q,i)=>[`Question ${i+1}: ${q}`,...(p.examAnswers?.[i]||[])]);}
function practice(p){return p.exam.map((question,i)=>({question,answer:p.examAnswers?.[i]||[]}));}
function presentationHtml(items,index){return `<nav class="science-practice-nav" aria-label="Practice questions">${items.map((q,i)=>`<button type="button" data-science-practice="${i}" aria-pressed="${i===index}">Question ${i+1}</button>`).join('')}</nav><p class="science-practice-question">${esc(items[index].question)}</p><p class="science-practice-hint">Attempt this question, then reveal its matching model answer.</p>`;}
function subtopicsHtml(p,context){
 if(!p.subtopics?.length)return '';
 const base=context.section.parentRef||context.section.ref;
 return `<article class="bio-card science-subtopics"><span>Individual lessons in this chapter</span><ul>${p.subtopics.map(r=>`<li><a href="?subject=chemistry&topic=${esc(context.topic.id)}&section=${esc(base)}&lesson=${esc(r.ref)}">${esc(r.ref)} ${esc(r.title)}</a></li>`).join('')}</ul></article>`;
}
function sourceHtml(p){return p.source?`<p class="science-source">Specification guide: <a href="${esc(p.source)}" target="_blank" rel="noopener">AQA subject content</a>. The practice questions and model answers are original teaching material, not official AQA mark schemes.</p>`:'';}
window.ALEVEL_SCIENCE_ANSWERS=Object.freeze({practiceHtml,answers,practice,presentationHtml,subtopicsHtml,sourceHtml});
})();
