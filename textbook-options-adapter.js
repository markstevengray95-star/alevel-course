(()=>{
'use strict';
const OPTION_KEY='alevel-physics-paper3-option-v1';
const OPTION_MAP={'Astrophysics':'astrophysics','Medical physics':'medical-physics','Engineering physics':'engineering-physics','Turning points in physics':'turning-points','Electronics':'electronics'};
const VIRTUAL_PREFIX='textbook-option-';
let observer=null,applying=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const selectedId=()=>{try{return OPTION_MAP[localStorage.getItem(OPTION_KEY)||'']||''}catch{return''}};
const state=()=>window.CourseTextbook?.getState?.()||{};
const current=()=>{const s=state(),topic=window.CourseTextbook?.data?.[s.topicId],index=Number(s.chapterIndex)||0;return{s,topic,chapter:topic?.chapters?.[index],index}};
function virtualLesson(topicId,chapter,index){return{id:`${VIRTUAL_PREFIX}${topicId}-${index}`,title:chapter.title,ref:String(window.CourseTextbook?.data?.[topicId]?.code||'').replace(/^AQA\s*/i,''),focus:chapter.summary||chapter.title,type:'Paper 3 option',minutes:55,topicId,topicCode:window.CourseTextbook?.data?.[topicId]?.code||'',topicTitle:window.CourseTextbook?.data?.[topicId]?.title||'',year:'Year 13',lessonNumber:index+1,option:true}}
function syncVirtualLessons(){
 const list=window.ALEVEL_LESSONS;if(!Array.isArray(list))return;
 for(let i=list.length-1;i>=0;i--)if(String(list[i]?.id||'').startsWith(VIRTUAL_PREFIX))list.splice(i,1);
 const id=selectedId(),topic=window.CourseTextbook?.data?.[id];if(!id||!topic)return;
 (topic.chapters||[]).forEach((chapter,index)=>list.push(virtualLesson(id,chapter,index)));
 window.ALEVEL_GUIDED_TUTOR?.refresh?.();
}
function optionVisualModel(topicId,chapter){const src=`${chapter?.title||''} ${chapter?.summary||''}`.toLowerCase();
 if(topicId==='astrophysics'){
  if(/cosmology|redshift|exoplanet/.test(src))return{title:'Hubble relationship explorer',label:'Distance / relative units',min:.5,max:5,step:.1,value:2.5,draw:v=>({path:Array.from({length:50},(_,i)=>{const x=i/49*5,y=v*x;return[x,y]}),summary:`Increasing H₀ steepens the recession-speed versus distance graph. Relative H₀ setting: ${v.toFixed(1)}.`})};
  return{title:'Black-body peak explorer',label:'Temperature / kK',min:3,max:20,step:.5,value:6,draw:v=>{const peak=2.90/v;return{path:Array.from({length:70},(_,i)=>{const x=.1+i/69*3.9,y=Math.pow(x/peak,3)*Math.exp(3-3*x/peak);return[x,Math.max(0,y)]}),summary:`At ${v.toFixed(1)} kK the Wien peak is near ${(2.90/v).toFixed(2)} μm. Hotter stars peak at shorter wavelength.`}}};
 }
 if(topicId==='medical-physics')return{title:'Attenuation explorer',label:'Attenuation coefficient',min:.1,max:1.2,step:.05,value:.45,draw:v=>({path:Array.from({length:70},(_,i)=>{const x=i/69*8;return[x,Math.exp(-v*x)]}),summary:`I/I₀ falls exponentially. Here the half-value thickness is about ${(Math.log(2)/v).toFixed(2)} relative length units.`})};
 if(topicId==='engineering-physics'){
  if(/rotation/.test(src))return{title:'Rotational energy explorer',label:'Moment of inertia',min:.5,max:5,step:.1,value:2,draw:v=>({path:Array.from({length:60},(_,i)=>{const w=i/59*10;return[w,.5*v*w*w]}),summary:`E = ½Iω². Increasing I raises stored rotational energy at every angular speed.`})};
  return{title:'p–V cycle visual',label:'Pressure scale',min:.5,max:2,step:.1,value:1,draw:v=>({path:[[1,1*v],[4,1*v],[4,2*v],[1,2*v],[1,1*v]],summary:'The enclosed loop area represents net work per cycle; reversing loop direction changes the sign of net work.'})};
 }
 if(topicId==='turning-points'){
  if(/relativity/.test(src))return{title:'Relativity factor explorer',label:'Maximum v/c',min:.2,max:.98,step:.02,value:.8,draw:v=>({path:Array.from({length:70},(_,i)=>{const b=i/69*v*.999;return[b,1/Math.sqrt(1-b*b)]}),summary:`γ rises slowly at low speed and sharply as v approaches c. At ${v.toFixed(2)}c, γ ≈ ${(1/Math.sqrt(1-v*v)).toFixed(2)}.`})};
  return{title:'de Broglie relationship',label:'Momentum scale',min:.5,max:4,step:.1,value:2,draw:v=>({path:Array.from({length:70},(_,i)=>{const p=.3+i/69*4;return[p,v/p]}),summary:'Matter wavelength is inversely proportional to momentum: doubling momentum halves λ.'})};
 }
 if(topicId==='electronics'){
  if(/op-amp|amplifier/.test(src))return{title:'Amplifier transfer explorer',label:'Voltage gain',min:1,max:20,step:1,value:5,draw:v=>({path:Array.from({length:60},(_,i)=>{const x=-1+i/59*2;return[x,Math.max(-10,Math.min(10,v*x))]}),summary:`Ideal linear region has gradient equal to gain. Real outputs eventually saturate at supply limits.`})};
  return{title:'Digital sampling explorer',label:'Samples per cycle',min:2,max:16,step:1,value:6,draw:v=>({path:Array.from({length:Math.round(v*3)+1},(_,i)=>{const x=i/(v*3)*3;return[x,Math.sin(2*Math.PI*x)]}),points:true,summary:`More samples per cycle represent the waveform more faithfully; too few samples lose timing/detail information.`})};
 }
 return null;
}
function pointsToSvg(points,w=620,h=230,p=32){if(!points?.length)return{path:'',dots:''};const xs=points.map(x=>x[0]),ys=points.map(x=>x[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),xr=xmax-xmin||1,yr=ymax-ymin||1;const pts=points.map(([x,y])=>[p+(x-xmin)/xr*(w-2*p),h-p-(y-ymin)/yr*(h-2*p)]);return{path:pts.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' '),dots:pts.map(([x,y])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"/>`).join('')}}
function addOptionVisual(article,topicId,chapter){if(article.querySelector('.paper3-option-visual'))return;const model=optionVisualModel(topicId,chapter);if(!model)return;const box=document.createElement('section');box.className='paper3-option-visual';box.innerHTML=`<div class="paper3-option-visual-head"><div><span>Paper 3 visual explorer</span><h2>${esc(model.title)}</h2></div><label><span>${esc(model.label)}</span><input type="range" min="${model.min}" max="${model.max}" step="${model.step}" value="${model.value}"><b data-v></b></label></div><svg viewBox="0 0 620 230" role="img" aria-label="${esc(model.title)}"></svg><p data-summary></p>`;const anchor=article.querySelector('.tbp4-maths')||article.querySelector('.textbook-section');anchor?.insertAdjacentElement('afterend',box);const input=box.querySelector('input'),svg=box.querySelector('svg'),summary=box.querySelector('[data-summary]'),value=box.querySelector('[data-v]');const draw=()=>{const v=Number(input.value),d=model.draw(v),g=pointsToSvg(d.path);value.textContent=v.toFixed(Number(model.step)<1?2:0);svg.innerHTML=`<line x1="32" y1="198" x2="594" y2="198" class="paper3-axis"/><line x1="32" y1="198" x2="32" y2="25" class="paper3-axis"/>${d.points?`<g class="paper3-dots">${g.dots}</g>`:`<path d="${g.path}" class="paper3-curve"/>`}`;summary.textContent=d.summary};input.addEventListener('input',draw);draw()}
function apply(){if(applying)return;const article=document.getElementById('textbookArticle'),{s,topic,chapter}=current();if(!article||!topic||!chapter)return;applying=true;try{if(topic.option)addOptionVisual(article,s.topicId,chapter);syncVirtualLessons()}finally{applying=false}}
function observe(){const article=document.getElementById('textbookArticle');if(!article)return;observer?.disconnect();observer=new MutationObserver(()=>requestAnimationFrame(apply));observer.observe(article,{childList:true,subtree:true});apply()}
window.addEventListener('textbookchange',e=>{if(e.detail?.open)setTimeout(observe,70)});window.addEventListener('focus',syncVirtualLessons);const start=()=>{syncVirtualLessons();document.getElementById('textbookArticle')?observe():setTimeout(start,180)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
window.ALEVEL_PAPER3_OPTION_ADAPTER={sync:syncVirtualLessons};
})();