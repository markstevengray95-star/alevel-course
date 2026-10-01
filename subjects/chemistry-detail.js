(()=>{'use strict';
const rows=Object.freeze((window.ALEVEL_CHEMISTRY_DETAIL_ROWS||[]).map(r=>Object.freeze(r)));
const lookup=Object.freeze(Object.fromEntries(rows.map(r=>[r.ref,r])));
const children=ref=>rows.filter(r=>r.ref.startsWith(ref+'.'));
const source=ref=>'https://www.aqa.org.uk/subjects/chemistry/a-level/chemistry-7405/specification/subject-content/'+({'1':'physical-chemistry','2':'inorganic-chemistry','3':'organic-chemistry'}[ref.split('.')[1]]);
function resolve(ref,profiles){
 const direct=lookup[ref],parentRef=ref.split('.').slice(0,3).join('.'),base=profiles[ref]||profiles[parentRef];
 if(!base)return null;
 const parts=children(ref);
 if(!direct&&!parts.length)return base;
 if(direct){
  return {...base,q:direct.question,core:direct.core,model:direct.answer,mis:direct.precision,source:source(ref),
   worked:{question:direct.question,answer:direct.answer},
   exam:[direct.question,`Explain the principles of ${direct.title.toLowerCase()}, linking each conclusion to a scientific reason.`,`Explain this accuracy check with a chemical example: ${direct.precision}`],
   examAnswers:[direct.answer,direct.core,[direct.precision,...direct.answer.slice(-2)]],subtopics:parts};
 }
 const selected=parts.length>2?[parts[0],parts[Math.floor(parts.length/2)],parts.at(-1)]:parts;
 const exam=selected.map(r=>r.question),answers=selected.map(r=>r.answer);
 if(exam.length<3){exam.push(base.q);answers.push(base.core);}
 if(exam.length<3){exam.push(`Explain and correct the misconception: ${base.mis}`);answers.push([base.mis,...base.core.slice(0,2)]);}
 return {...base,source:source(ref),subtopics:parts,worked:{question:parts[0].question,answer:parts[0].answer},exam,examAnswers:answers};
}
window.ALEVEL_CHEMISTRY_DETAIL=Object.freeze({rows,lookup,children,resolve,source,reviewed:'2026-10-01'});
function installIndex(){
 if(window.ALEVEL_COURSE_CONFIG?.id!=='chemistry'||document.getElementById('chemistryDetailedIndex'))return;
 const host=document.getElementById('courseMap');if(!host)return;
 const config=window.ALEVEL_COURSE_CONFIG,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const index=document.createElement('section');index.id='chemistryDetailedIndex';index.className='science-lesson-index';
 const chapters=config.topics.flatMap(topic=>topic.modules.map(section=>({topic,section})));
 index.innerHTML=`<span class="eyebrow">CHEMISTRY LESSON LIBRARY</span><h2>Find a Chemistry lesson</h2><p>Chapter overviews and individual specification topics, with worked answers. Choose a topic to study its notes or presentation.</p><label>Search lessons <input type="search" aria-label="Search Chemistry lessons" placeholder="Try buffers, ozone, NMR or ligand substitution"></label><p data-chem-library-count role="status"></p><div data-chem-library-results></div>`;
 host.insertAdjacentElement('afterend',index);
 function render(){
  const term=index.querySelector('input').value.trim().toLowerCase();let count=0;
  index.querySelector('[data-chem-library-results]').innerHTML=chapters.map(({topic,section})=>{
   const items=[{ref:section.ref,title:section.title},...children(section.ref)].filter(r=>`${r.ref} ${r.title} ${r.core?.join(' ')||''}`.toLowerCase().includes(term));
   count+=items.length;if(!items.length)return '';
   return `<details ${term?'open':''}><summary>${esc(section.ref)} ${esc(section.title)} · ${items.length} lesson${items.length===1?'':'s'}</summary><ul>${items.map(r=>`<li><a href="subjects/topic-shell.html?subject=chemistry&topic=${esc(topic.id)}&section=${esc(section.ref)}${r.ref===section.ref?'':`&lesson=${esc(r.ref)}`}"><strong>${esc(r.ref)}</strong> ${esc(r.title)}</a></li>`).join('')}</ul></details>`;
  }).join('')||'<p>No matching lessons. Try a broader chemical term.</p>';
  index.querySelector('[data-chem-library-count]').textContent=`${count} lessons shown · ${chapters.length} chapter overviews`;
 }
 index.querySelector('input').addEventListener('input',render);render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installIndex,{once:true});else installIndex();
})();
