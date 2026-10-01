import fs from 'node:fs';
const html=fs.readFileSync('subjects/teacher-analytics.html','utf8');
const js=fs.readFileSync('subjects/teacher-analytics.js','utf8');
const sync=fs.readFileSync('subjects/progress-class-sync.js','utf8');
const bridge=fs.readFileSync('subject-tool-bridge.js','utf8');
const progress=fs.readFileSync('subjects/progress-mastery.html','utf8');
const migration=fs.readFileSync('supabase/migrations/20261001115002_alevel_phase16_teacher_analytics.sql','utf8');
const failures=[];
for(const token of ['Teacher Analytics','Misconception hotspots','Required practical gaps','Intervention queue','Class progress'])if(!html.includes(token))failures.push(`Teacher dashboard missing: ${token}`);
for(const token of ['studentPriority','aggregate(payload)','renderHotspots','renderPracticals','exportCSV','alevel_teacher_class_analytics','alevel_create_class','fixturePayload'])if(!js.includes(token))failures.push(`Teacher analytics engine missing: ${token}`);
for(const token of ['buildSnapshot','aoSummary','weakSummary','misconceptionSummary','alevel_sync_progress','alevel_join_class','alevel_student_classes','alevel_leave_class'])if(!sync.includes(token))failures.push(`Student sync missing: ${token}`);
if(sync.includes('notebook'))failures.push('Student sync must not upload notebook content');
if(!progress.includes('progress-class-sync.js')||!progress.includes('classCodeInput'))failures.push('Progress dashboard is not wired to class sync');
for(const token of ["'teacher-analytics'",'openTeacherAnalytics','Teacher plan · Class intelligence'])if(!bridge.includes(token))failures.push(`Course bridge missing teacher analytics token: ${token}`);
for(const token of ['alevel_teacher_classes','alevel_teacher_class_members','alevel_progress_snapshots','private.alevel_teacher_allowed','alevel_teacher_class_analytics','alevel_teacher_remove_student','alevel_archive_class'])if(!migration.includes(token))failures.push(`Migration missing: ${token}`);
for(const table of ['alevel_teacher_classes','alevel_teacher_class_members','alevel_progress_snapshots']){if(!migration.includes(`alter table public.${table} enable row level security`))failures.push(`RLS not enabled for ${table}`);if(!migration.includes(`revoke all on table public.${table} from public, anon, authenticated`))failures.push(`Table grants not revoked for ${table}`)}
for(const fn of ['alevel_sync_progress','alevel_create_class','alevel_teacher_classes','alevel_join_class','alevel_student_classes','alevel_leave_class','alevel_teacher_remove_student','alevel_archive_class','alevel_teacher_class_analytics'])if(!migration.includes(`security definer`)||!migration.includes(`public.${fn}`))failures.push(`Secured RPC missing: ${fn}`);
if(!migration.includes("p.plan_tier='teacher'")||!migration.includes("exists(select 1 from public.alevel_admins"))failures.push('Teacher/admin authorization check missing');
if(failures.length){console.error('Teacher Analytics coverage audit failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log('Teacher Analytics coverage passed: class security, sanitised progress sync, diagnostics and global routing are represented.');