(()=>{
'use strict';
const SUPABASE_URL='https://emjmvgginijkupwuflla.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_axgWqbWx-24V2b9s7mE1Fw__N3Ce61f';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
const pct=n=>Math.round(clamp(n)*100);
const mean=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
const params=new URLSearchParams(location.search);
const state={client:null,classes:[],classId:null,payload:null};
const SUBJECTS=[['physics','Physics','physics'],['biology','Biology','bio'],['chemistry','Chemistry','chem']];

function fixturePayload(){
 const snap=(overall,p,b,c,ao,weak,practicals)=>({version:'phase-16',captured_at:'2026-10-01T10:00:00Z',overall,subjects:{physics:{mastery:p,coverage:{done:Math.round(p*8),total:8,ratio:p}},biology:{mastery:b,coverage:{done:Math.round(b*8),total:8,ratio:b},assessment:{ratio:b,answers:12,attempts:2},practicals:{done:practicals[0],total:12,ratio:practicals[0]/12},skills:{done:6,total:10,ratio:.6}},chemistry:{mastery:c,coverage:{done:Math.round(c*3),total:3,ratio:c},assessment:{ratio:c,answers:10,attempts:2},practicals:{done:practicals[1],total:12,ratio:practicals[1]/12},skills:{done:8,total:14,ratio:8/14}}},ao,weak,misconceptions:weak.map((x,i)=>({subject:x.subject,ref:x.ref,topic:x.ref.split('.').slice(0,2).join('.'),ao:i%2?'AO2':'AO3',count:2,gap:3-i}))});
 return {class:{id:'fixture-class',name:'Year 12 Science',join_code:'ABC12345',created_at:'2026-09-01T08:00:00Z'},students:[
  {user_id:'s1',email:'student1@example.com',joined_at:'2026-09-02T08:00:00Z',updated_at:'2026-10-01T10:00:00Z',snapshot:snap(.78,.75,.82,.76,[{ao:'AO1',score:8,marks:10,n:4,ratio:.8},{ao:'AO2',score:7,marks:10,n:4,ratio:.7},{ao:'AO3',score:6,marks:10,n:4,ratio:.6}],[{subject:'Biology',id:'biology',ref:'3.2.3',n:3,ratio:.5}],[10,9])},
  {user_id:'s2',email:'student2@example.com',joined_at:'2026-09-03T08:00:00Z',updated_at:'2026-09-30T15:00:00Z',snapshot:snap(.46,.5,.42,.46,[{ao:'AO1',score:5,marks:10,n:4,ratio:.5},{ao:'AO2',score:4,marks:10,n:4,ratio:.4},{ao:'AO3',score:3,marks:10,n:4,ratio:.3}],[{subject:'Chemistry',id:'chemistry',ref:'3.1.12',n:4,ratio:.25},{subject:'Biology',id:'biology',ref:'3.4.2',n:2,ratio:.4}],[5,4])},
  {user_id:'s3',email:'student3@example.com',joined_at:'2026-09-04T08:00:00Z',updated_at:null,snapshot:{}}
 ]};
}

async function getClient(){
 if(state.client)return state.client;
 try{if(parent&&parent!==window&&parent.ALevelAuth?.supabase){state.client=parent.ALevelAuth.supabase;return state.client}}catch{}
 if(window.ALevelAuth?.supabase){state.client=window.ALevelAuth.supabase;return state.client}
 const mod=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm');
 state.client=mod.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return state.client;
}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1700)}
function statusClass(v){return v>=.7?'good':v>=.45?'mid':'low'}
function formatDate(value){if(!value)return'Never';const d=new Date(value);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short'}).format(d)}
function snapshotSubject(student,id){return student.snapshot?.subjects?.[id]||{}}
function overall(student){const snap=student.snapshot||{};if(Number.isFinite(Number(snap.overall)))return clamp(snap.overall);const vals=SUBJECTS.map(([id])=>Number(snapshotSubject(student,id).mastery)).filter(Number.isFinite);return mean(vals.map(clamp))}
function studentPriority(student){
 if(!student.updated_at||!student.snapshot?.version)return{level:'high',label:'No progress sync',detail:'Ask the student to open Progress & Mastery while signed in.'};
 const o=overall(student),subjects=SUBJECTS.map(([id,label])=>({id,label,d:snapshotSubject(student,id)}));
 const lowAssessment=subjects.filter(x=>Number(x.d.assessment?.answers)>0&&clamp(x.d.assessment?.ratio)<.6).sort((a,b)=>clamp(a.d.assessment?.ratio)-clamp(b.d.assessment?.ratio))[0];
 if(o<.45)return{level:'high',label:'Priority support',detail:`Recorded mastery evidence is ${pct(o)}%. Start with the weakest subject and short retrieval checks.`};
 if(lowAssessment)return{level:'high',label:`${lowAssessment.label} assessment`,detail:`Assessment evidence is ${pct(lowAssessment.d.assessment.ratio)}%. Use targeted questions before moving on.`};
 const practical=subjects.filter(x=>x.id!=='physics'&&x.d.practicals&&clamp(x.d.practicals.ratio)<.67).sort((a,b)=>clamp(a.d.practicals.ratio)-clamp(b.d.practicals.ratio))[0];
 if(practical)return{level:'medium',label:`${practical.label} practical catch-up`,detail:`${Number(practical.d.practicals.done)||0}/12 required practicals recorded.`};
 const skills=subjects.filter(x=>x.d.skills&&clamp(x.d.skills.ratio)<.5).sort((a,b)=>clamp(a.d.skills.ratio)-clamp(b.d.skills.ratio))[0];
 if(skills)return{level:'medium',label:`${skills.label} skills`,detail:'Quantitative/data coach evidence is below 50%.'};
 const coverage=subjects.filter(x=>x.d.coverage&&clamp(x.d.coverage.ratio)<.65).sort((a,b)=>clamp(a.d.coverage.ratio)-clamp(b.d.coverage.ratio))[0];
 if(coverage)return{level:'medium',label:`${coverage.label} catch-up`,detail:`Course coverage is ${pct(coverage.d.coverage.ratio)}%.`};
 return{level:'low',label:'On track',detail:'No major gap is visible in the current evidence.'};
}
function aggregate(payload){
 const raw=Array.isArray(payload?.students)?payload.students:[];
 const students=raw.map(s=>({...s,snapshot:s.snapshot&&typeof s.snapshot==='object'?s.snapshot:{},overall:overall(s),priority:studentPriority(s)}));
 const synced=students.filter(s=>s.updated_at&&s.snapshot?.version);
 const subject=Object.fromEntries(SUBJECTS.map(([id,label])=>{const vals=synced.map(s=>clamp(snapshotSubject(s,id).mastery)).filter(Number.isFinite);const cov=synced.map(s=>clamp(snapshotSubject(s,id).coverage?.ratio)).filter(Number.isFinite);return[id,{label,mastery:mean(vals),coverage:mean(cov),n:vals.length}]}));
 const ao={};for(const key of ['AO1','AO2','AO3'])ao[key]={score:0,marks:0,n:0};
 for(const s of synced)for(const row of Array.isArray(s.snapshot.ao)?s.snapshot.ao:[]){if(!ao[row.ao])continue;const marks=Number(row.marks)||Number(row.n)||0,score=Number(row.score);ao[row.ao].marks+=marks;ao[row.ao].score+=Number.isFinite(score)?score:clamp(row.ratio)*marks;ao[row.ao].n+=Number(row.n)||0}
 const hotspots=new Map();for(const s of synced)for(const m of Array.isArray(s.snapshot.misconceptions)?s.snapshot.misconceptions:[]){const key=`${m.subject||'Science'}|${m.ref||m.topic||'Other'}`,x=hotspots.get(key)||{subject:m.subject||'Science',ref:m.ref||m.topic||'Other',students:new Set(),gap:0,count:0,ao:m.ao||''};x.students.add(s.user_id);x.gap+=Number(m.gap)||1;x.count+=Number(m.count)||1;hotspots.set(key,x)}
 const practicals={biology:{done:0,total:synced.length*12},chemistry:{done:0,total:synced.length*12}};for(const s of synced)for(const id of ['biology','chemistry'])practicals[id].done+=Math.min(12,Number(snapshotSubject(s,id).practicals?.done)||0);
 const assessmentVals=[];for(const s of synced)for(const id of ['biology','chemistry']){const a=snapshotSubject(s,id).assessment;if(Number(a?.answers)>0)assessmentVals.push(clamp(a.ratio))}
 return{students,synced,subject,ao,hotspots:[...hotspots.values()].sort((a,b)=>b.students.size-a.students.size||b.gap-a.gap).slice(0,8),practicals,classMastery:mean(synced.map(s=>s.overall)),assessment:mean(assessmentVals),assessmentN:assessmentVals.length};
}
function renderSummary(a){$('summaryGrid').innerHTML=`<article class="summary-card"><strong>${a.students.length}</strong><span>students in class</span></article><article class="summary-card"><strong>${a.synced.length}/${a.students.length}</strong><span>students synced</span></article><article class="summary-card"><strong>${a.synced.length?pct(a.classMastery)+'%':'—'}</strong><span>average mastery evidence</span></article><article class="summary-card"><strong>${a.assessmentN?pct(a.assessment)+'%':'—'}</strong><span>Biology/Chemistry assessment</span></article>`}
function renderSubjects(a){$('subjectGrid').innerHTML=SUBJECTS.map(([id,label,cls])=>{const s=a.subject[id];return`<div class="subject-row ${cls}"><span>${label}</span><div class="meter"><i style="width:${pct(s.mastery)}%"></i></div><b>${s.n?pct(s.mastery)+'%':'—'}</b></div>`}).join('')}
function renderAO(a){$('aoGrid').innerHTML=['AO1','AO2','AO3'].map(k=>{const x=a.ao[k],r=x.marks?x.score/x.marks:0;return`<div class="ao-card"><strong>${x.marks?pct(r)+'%':'—'}</strong><span>${k} · ${x.n} responses</span></div>`}).join('')}
function renderHotspots(a){$('hotspotList').innerHTML=a.hotspots.length?a.hotspots.map((x,i)=>`<div class="hotspot"><span class="rank">${i+1}</span><div><strong>${esc(x.subject)} · ${esc(x.ref)}</strong><small>${x.students.size} student${x.students.size===1?'':'s'} showing repeated gaps${x.ao?' · '+esc(x.ao):''}</small></div><b>${x.count} gaps</b></div>`).join(''):'<div class="empty">No misconception hotspots yet. More assessment evidence will make this more useful.</div>'}
function renderPracticals(a){$('practicalGrid').innerHTML=['biology','chemistry'].map(id=>{const x=a.practicals[id],missing=Math.max(0,x.total-x.done);return`<div class="practical-card"><strong>${missing}</strong><span>${id==='biology'?'Biology':'Chemistry'} practical completions still unrecorded across the class</span></div>`}).join('')}
function renderInterventions(a){const items=a.students.map(s=>({s,p:s.priority})).sort((x,y)=>({high:0,medium:1,low:2}[x.p.level]-({high:0,medium:1,low:2}[y.p.level])||x.s.overall-y.s.overall);$('interventionList').innerHTML=items.length?items.slice(0,12).map(({s,p})=>`<div class="intervention"><span class="priority-dot">${p.level==='high'?'!':p.level==='medium'?'•':'✓'}</span><div><strong>${esc(s.email||'Student')} · ${esc(p.label)}</strong><small>${esc(p.detail)}</small></div><span class="priority-pill ${p.level}">${p.level==='high'?'Priority':p.level==='medium'?'Review':'On track'}</span></div>`).join(''):'<div class="empty">No students have joined this class yet.</div>'}
function renderStudents(a){$('studentCount').textContent=`${a.students.length} student${a.students.length===1?'':'s'}`;$('studentRows').innerHTML=a.students.length?a.students.map(s=>{const p=snapshotSubject(s,'physics').mastery,b=snapshotSubject(s,'biology').mastery,c=snapshotSubject(s,'chemistry').mastery,pr=(Number(snapshotSubject(s,'biology').practicals?.done)||0)+(Number(snapshotSubject(s,'chemistry').practicals?.done)||0);const cell=v=>Number.isFinite(Number(v))?`<span class="score ${statusClass(clamp(v))}">${pct(v)}%</span>`:'—';return`<tr><td><strong>${esc(s.email||'Student')}</strong></td><td>${s.updated_at?cell(s.overall):'—'}</td><td>${cell(p)}</td><td>${cell(b)}</td><td>${cell(c)}</td><td>${s.updated_at?`${pr}/24`:'—'}</td><td>${formatDate(s.updated_at)}</td><td><span class="priority-pill ${s.priority.level}">${esc(s.priority.label)}</span></td></tr>`}).join(''):'<tr><td colspan="8"><div class="empty">Share the class code with students to start collecting progress snapshots.</div></td></tr>'}
function renderPayload(payload){state.payload=payload;const a=aggregate(payload);$('joinCode').textContent=payload?.class?.join_code||'—';renderSummary(a);renderSubjects(a);renderAO(a);renderHotspots(a);renderPracticals(a);renderInterventions(a);renderStudents(a);$('classContent').hidden=false;$('classEmpty').hidden=true;return a}
function setAccess(message){$('loadingCard').hidden=true;$('analyticsApp').hidden=true;$('accessCard').hidden=false;if(message)$('accessCard').querySelector('p').textContent=message}
function renderClassOptions(){const sel=$('classSelect');sel.innerHTML=state.classes.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} · ${c.student_count||0} students</option>`).join('');if(state.classId&&state.classes.some(c=>c.id===state.classId))sel.value=state.classId;else state.classId=state.classes[0]?.id||null}
async function loadClass(id){if(!id)return;state.classId=id;$('classContent').hidden=true;const {data,error}=await state.client.rpc('alevel_teacher_class_analytics',{p_class_id:id});if(error)throw error;renderPayload(data||{});$('classSelect').value=id}
async function loadClasses(){const {data,error}=await state.client.rpc('alevel_teacher_classes');if(error)throw error;state.classes=Array.isArray(data)?data:[];renderClassOptions();$('loadingCard').hidden=true;$('analyticsApp').hidden=false;if(!state.classes.length){$('classEmpty').hidden=false;$('classContent').hidden=true;return}await loadClass(state.classId||state.classes[0].id)}
async function createClass(name){const clean=String(name||'').trim();if(clean.length<2)return toast('Enter a class name.');const {data,error}=await state.client.rpc('alevel_create_class',{p_name:clean});if(error)throw error;toast(`Class created · ${data.join_code}`);state.classId=data.id;await loadClasses()}
async function archiveClass(){if(!state.classId)return;if(!confirm('Archive this class? Students will no longer be able to join it.'))return;const {error}=await state.client.rpc('alevel_archive_class',{p_class_id:state.classId});if(error)throw error;toast('Class archived');state.classId=null;await loadClasses()}
function exportCSV(){if(!state.payload)return;const a=aggregate(state.payload);const q=v=>`"${String(v??'').replaceAll('"','""')}"`;const rows=[['Student','Overall','Physics','Biology','Chemistry','Biology practicals','Chemistry practicals','Last sync','Priority']];for(const s of a.students)rows.push([s.email,s.updated_at?pct(s.overall)+'%':'',Number.isFinite(Number(snapshotSubject(s,'physics').mastery))?pct(snapshotSubject(s,'physics').mastery)+'%':'',Number.isFinite(Number(snapshotSubject(s,'biology').mastery))?pct(snapshotSubject(s,'biology').mastery)+'%':'',Number.isFinite(Number(snapshotSubject(s,'chemistry').mastery))?pct(snapshotSubject(s,'chemistry').mastery)+'%':'',snapshotSubject(s,'biology').practicals?.done??'',snapshotSubject(s,'chemistry').practicals?.done??'',s.updated_at||'',s.priority.label]);const blob=new Blob([rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'}),url=URL.createObjectURL(blob),aEl=document.createElement('a');aEl.href=url;aEl.download=`${(state.payload.class?.name||'class').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-analytics.csv`;aEl.click();URL.revokeObjectURL(url)}
async function boot(){
 const from=params.get('from');if(['physics','biology','chemistry'].includes(from))$('backLink').href=`../index.html?subject=${from}`;
 bind();
 if(params.get('fixture')==='1'){state.classes=[{id:'fixture-class',name:'Year 12 Science',student_count:3,join_code:'ABC12345'}];state.classId='fixture-class';renderClassOptions();$('loadingCard').hidden=true;$('analyticsApp').hidden=false;renderPayload(fixturePayload());return}
 try{state.client=await getClient();const {data,error}=await state.client.auth.getUser();if(error||!data?.user)return setAccess('Sign in to the A-Level course first, then reopen Teacher Analytics.');await loadClasses()}catch(error){console.error(error);if(String(error?.message||'').toLowerCase().includes('teacher access'))setAccess('This account does not currently have Teacher Analytics access. A Teacher plan or admin account is required.');else setAccess(error?.message||'Teacher Analytics could not load.')}
}
function bind(){
 $('refreshBtn').onclick=()=>params.get('fixture')==='1'?renderPayload(fixturePayload()):loadClasses().catch(e=>toast(e.message||'Refresh failed'));
 $('classSelect').onchange=()=>loadClass($('classSelect').value).catch(e=>toast(e.message||'Could not load class'));
 $('copyCodeBtn').onclick=async()=>{const code=$('joinCode').textContent;if(code==='—')return;try{await navigator.clipboard.writeText(code);toast('Class code copied')}catch{toast(`Class code: ${code}`)}};
 $('newClassForm').onsubmit=e=>{e.preventDefault();createClass($('newClassName').value).then(()=>{$('newClassName').value=''}).catch(x=>toast(x.message||'Could not create class'))};
 $('firstClassForm').onsubmit=e=>{e.preventDefault();createClass($('firstClassName').value).then(()=>{$('firstClassName').value=''}).catch(x=>toast(x.message||'Could not create class'))};
 $('archiveClassBtn').onclick=()=>archiveClass().catch(e=>toast(e.message||'Could not archive class'));
 $('exportBtn').onclick=exportCSV;
}
window.ALEVEL_TEACHER_ANALYTICS=Object.freeze({version:'phase-16',aggregate,fixturePayload,renderFixture:()=>renderPayload(fixturePayload())});
boot();
})();