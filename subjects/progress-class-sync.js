(()=>{
'use strict';
const SUPABASE_URL='https://emjmvgginijkupwuflla.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_axgWqbWx-24V2b9s7mE1Fw__N3Ce61f';
const $=id=>document.getElementById(id);
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
const pct=n=>Math.round(clamp(n)*100);
let client=null,user=null,syncTimer=null;
function hasAuthToken(){try{return Object.keys(localStorage).some(k=>/^sb-.*-auth-token$/.test(k))}catch{return false}}
async function getClient(){
 if(client)return client;
 try{if(parent&&parent!==window&&parent.ALevelAuth?.supabase){client=parent.ALevelAuth.supabase;return client}}catch{}
 if(window.ALevelAuth?.supabase){client=window.ALevelAuth.supabase;return client}
 if(!hasAuthToken())return null;
 const mod=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm');
 client=mod.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return client;
}
function setStatus(text,kind=''){const el=$('classSyncStatus');if(!el)return;el.textContent=text;el.className=`sync-status ${kind}`.trim()}
function toast(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1600)}
function subjectSnapshot(s){return{mastery:clamp(s?.mastery),coverage:{done:Number(s?.course?.done)||0,total:Number(s?.course?.total)||0,ratio:clamp(s?.course?.ratio)},assessment:s?.assessment?{ratio:clamp(s.assessment.ratio),answers:Array.isArray(s.assessment.answers)?s.assessment.answers.length:0,attempts:Array.isArray(s.assessment.attempts)?s.assessment.attempts.length:0}:null,practicals:s?.practicals?{done:Number(s.practicals.done)||0,total:Number(s.practicals.total)||12,ratio:clamp(s.practicals.ratio)}:null,skills:s?.skills?{done:Number(s.skills.done)||0,total:Number(s.skills.total)||0,ratio:clamp(s.skills.ratio)}:null,stretch:s?.stretch?{done:Number(s.stretch.done)||0,total:Number(s.stretch.total)||0,ratio:clamp(s.stretch.ratio)}:null}}
function aoSummary(data){const rows=Object.values(data).flatMap(s=>s.assessment?.answers||[]);return['AO1','AO2','AO3'].map(ao=>{const a=rows.filter(x=>x.ao===ao),marks=a.reduce((n,x)=>n+(Number(x.marks)||0),0),score=a.reduce((n,x)=>n+(Number(x.score)||0),0);return{ao,n:a.length,marks,score,ratio:marks?score/marks:0}})}
function weakSummary(data){const out=[];for(const s of Object.values(data)){if(!s.assessment)continue;const groups={};for(const a of s.assessment.answers||[]){const ref=a.ref||a.topic||'Other';groups[ref]??={marks:0,score:0,n:0};groups[ref].marks+=Number(a.marks)||0;groups[ref].score+=Number(a.score)||0;groups[ref].n++}for(const [ref,g] of Object.entries(groups))out.push({subject:s.cfg?.label||s.id,id:s.id,ref,n:g.n,ratio:g.marks?g.score/g.marks:0})}return out.sort((a,b)=>a.ratio-b.ratio||b.n-a.n).slice(0,8)}
function misconceptionSummary(data){const map=new Map();for(const s of Object.values(data)){for(const a of s.assessment?.answers||[]){const marks=Number(a.marks)||0,score=Number(a.score)||0;if(!marks||score>=marks)continue;const ref=a.ref||a.topic||'Other',key=`${s.id}|${ref}|${a.ao||''}`,x=map.get(key)||{subject:s.cfg?.label||s.id,ref,topic:a.topic||'',ao:a.ao||'',count:0,gap:0};x.count++;x.gap+=Math.max(0,marks-score);map.set(key,x)}}return[...map.values()].sort((a,b)=>b.gap-a.gap||b.count-a.count).slice(0,12)}
function buildSnapshot(){const api=window.ALEVEL_PROGRESS_MASTERY;if(!api?.collect)return null;const data=api.collect(),subjects=Object.fromEntries(Object.entries(data).map(([id,s])=>[id,subjectSnapshot(s)])),vals=Object.values(subjects).map(s=>s.mastery);return{version:'phase-16',captured_at:new Date().toISOString(),overall:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0,subjects,ao:aoSummary(data),weak:weakSummary(data),misconceptions:misconceptionSummary(data)}}
async function loadClasses(){if(!client||!user)return;const {data,error}=await client.rpc('alevel_student_classes');if(error)throw error;const rows=Array.isArray(data)?data:[];const wrap=$('joinedClasses');if(!wrap)return;wrap.innerHTML=rows.length?rows.map(c=>`<div class="joined-class"><div><strong>${String(c.name||'Class').replace(/[<>]/g,'')}</strong><small>Joined ${c.joined_at?new Date(c.joined_at).toLocaleDateString('en-GB'):'recently'}</small></div><button type="button" data-leave-class="${c.id}">Leave</button></div>`).join(''):'<span class="muted">No linked classes yet.</span>';wrap.querySelectorAll('[data-leave-class]').forEach(b=>b.onclick=()=>leaveClass(b.dataset.leaveClass))}
async function sync(){const snapshot=buildSnapshot();if(!snapshot)return false;client=await getClient();if(!client){setStatus('Sign in to sync','warn');return false}const auth=await client.auth.getUser();if(auth.error||!auth.data?.user){setStatus('Sign in to sync','warn');return false}user=auth.data.user;setStatus('Syncing…');const {error}=await client.rpc('alevel_sync_progress',{p_snapshot:snapshot});if(error)throw error;setStatus(`Synced · ${pct(snapshot.overall)}% overall`,'good');await loadClasses();return true}
async function joinClass(code){client=await getClient();if(!client)return setStatus('Sign in to join a class','warn');const auth=await client.auth.getUser();if(auth.error||!auth.data?.user)return setStatus('Sign in to join a class','warn');user=auth.data.user;const clean=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(clean.length<6)return toast('Enter the class code from your teacher.');const {data,error}=await client.rpc('alevel_join_class',{p_code:clean});if(error)throw error;toast(`Joined ${data?.name||'class'}`);$('classCodeInput').value='';await sync()}
async function leaveClass(id){if(!client||!user)return;const {error}=await client.rpc('alevel_leave_class',{p_class_id:id});if(error)return toast(error.message||'Could not leave class');toast('Left class');await loadClasses()}
function schedule(){clearTimeout(syncTimer);syncTimer=setTimeout(()=>sync().catch(e=>{console.warn('Class progress sync failed:',e?.message||e);setStatus('Sync unavailable','warn')}),450)}
function bind(){const form=$('joinClassForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();joinClass($('classCodeInput')?.value).catch(x=>toast(x.message||'Could not join class'))});window.addEventListener('focus',schedule);window.addEventListener('storage',e=>{if(e.key?.startsWith('alevel-'))schedule()});$('refreshBtn')?.addEventListener('click',schedule)}
window.ALEVEL_CLASS_SYNC=Object.freeze({version:'phase-16',buildSnapshot,sync,loadClasses});
bind();schedule();
})();