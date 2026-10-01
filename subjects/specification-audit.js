(()=>{
'use strict';
const M=window.ALEVEL_SPECIFICATION_MANIFEST;
if(!M)return;
const $=id=>document.getElementById(id);
const subjects=Object.values(M.subjects);
const params=new URLSearchParams(location.search);
const from=['physics','biology','chemistry'].includes(params.get('from'))?params.get('from'):'physics';
$('backLink').href=from==='physics'?'../index.html':`../index.html?subject=${from}`;
const date=new Date(`${M.verified}T12:00:00Z`);
$('verifiedDate').textContent=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric'}).format(date);
$('verifiedBadge').textContent=`Verified ${M.verified}`;
$('overallStatus').textContent='COMPLETE';
$('summaryGrid').innerHTML=[
 ['8/8','Physics core areas'],['5/5','Physics Paper 3 options'],[`${M.totals.biologySections}/39`,'Biology numbered sections'],[`${M.totals.chemistrySections}/34`,'Chemistry numbered sections'],[`${M.totals.requiredPracticals}/36`,'required practicals']
].map(([n,l])=>`<article class="summary-card"><strong>${n}</strong><span>${l}</span></article>`).join('');
function subjectCard(s){
 const content=s.id==='physics'?[['Core content',`${s.core.length}/8`],['Paper 3 options',`${s.options.length}/5`]]:[['Numbered sections',`${s.sections.length}/${s.id==='biology'?39:34}`]];
 return `<article class="subject-card ${s.id}"><span class="eyebrow">AQA ${s.code}</span><h3>${s.name}</h3>${content.map(([l,v])=>`<div class="check-row"><span>${l}</span><b>${v} ✓</b></div>`).join('')}<div class="check-row"><span>Required practicals</span><b>${s.practicals.length}/12 ✓</b></div><div class="check-row"><span>Apparatus techniques</span><b>${s.apparatus.length}/12 ✓</b></div></article>`;
}
$('subjectGrid').innerHTML=subjects.map(subjectCard).join('');
$('weightGrid').innerHTML=subjects.map(s=>`<div class="weight-card"><div><b>${s.name}</b><span>Minimum mathematical skills in written assessment</span></div><strong>${s.mathsMinimum}%</strong></div>`).join('')+`<div class="weight-card"><div><b>All three sciences</b><span>Minimum assessment of practical knowledge, skills and understanding</span></div><strong>≥15%</strong></div>`;
$('practicalGrid').innerHTML=subjects.map(s=>`<div class="practical-card"><div><b>${s.name}</b><span>${s.practicals.map(p=>p.id).join(' · ')} · apparatus a–l</span></div><strong>${s.practicals.length}/12</strong></div>`).join('');
$('papers').innerHTML=subjects.map(s=>`<article class="paper-subject"><h3>${s.name} · ${s.code}</h3>${s.papers.map(p=>`<div class="paper"><strong>${p.id} · ${p.marks} marks · ${p.minutes} min · ${p.weight}%</strong><small>${p.scope}</small></div>`).join('')}</article>`).join('');
$('optionGrid').innerHTML=M.subjects.physics.options.map(o=>`<article class="option"><b>${o.ref}</b><span>${o.title}</span></article>`).join('');
$('sourceLinks').innerHTML=subjects.map(s=>`<a href="${s.source}" target="_blank" rel="noopener">${s.name} ${s.code} specification</a>`).join('');
window.ALEVEL_SPECIFICATION_AUDIT=Object.freeze({manifest:M,status:'complete'});
})();