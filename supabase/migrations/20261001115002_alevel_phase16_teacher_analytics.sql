create table if not exists public.alevel_teacher_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  join_code text not null unique check (join_code ~ '^[A-Z0-9]{6,10}$'),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.alevel_teacher_class_members (
  class_id uuid not null references public.alevel_teacher_classes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.alevel_progress_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists alevel_teacher_classes_teacher_idx on public.alevel_teacher_classes(teacher_id) where archived_at is null;
create index if not exists alevel_teacher_class_members_student_idx on public.alevel_teacher_class_members(student_id);
create index if not exists alevel_teacher_class_members_class_idx on public.alevel_teacher_class_members(class_id);
create index if not exists alevel_progress_snapshots_updated_idx on public.alevel_progress_snapshots(updated_at desc);

alter table public.alevel_teacher_classes enable row level security;
alter table public.alevel_teacher_class_members enable row level security;
alter table public.alevel_progress_snapshots enable row level security;
revoke all on table public.alevel_teacher_classes from public, anon, authenticated;
revoke all on table public.alevel_teacher_class_members from public, anon, authenticated;
revoke all on table public.alevel_progress_snapshots from public, anon, authenticated;

create or replace function private.alevel_teacher_allowed(p_uid uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select p_uid is not null and (
    exists(select 1 from public.alevel_admins a where a.user_id=p_uid)
    or exists(
      select 1 from public.alevel_profiles p
      where p.user_id=p_uid
        and p.plan_tier='teacher'
        and p.subscription_status in ('active','trialing')
    )
  )
$$;
revoke all on function private.alevel_teacher_allowed(uuid) from public, anon, authenticated;

create or replace function public.alevel_sync_progress(p_snapshot jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_updated timestamptz;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then raise exception 'Invalid snapshot'; end if;
  if pg_column_size(p_snapshot) > 100000 then raise exception 'Snapshot too large'; end if;

  insert into public.alevel_progress_snapshots(user_id,snapshot,updated_at)
  values(v_uid,p_snapshot,now())
  on conflict (user_id) do update
    set snapshot=excluded.snapshot,updated_at=excluded.updated_at
  returning updated_at into v_updated;

  return jsonb_build_object('ok',true,'updated_at',v_updated);
end;
$$;
revoke all on function public.alevel_sync_progress(jsonb) from public, anon, authenticated;
grant execute on function public.alevel_sync_progress(jsonb) to authenticated;

create or replace function public.alevel_create_class(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_name text := btrim(coalesce(p_name,''));
  v_code text;
  v_id uuid;
  v_try integer;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not private.alevel_teacher_allowed(v_uid) then raise exception 'Teacher access required'; end if;
  if char_length(v_name) < 2 or char_length(v_name) > 80 then raise exception 'Class name must be 2 to 80 characters'; end if;

  for v_try in 1..20 loop
    v_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
    begin
      insert into public.alevel_teacher_classes(teacher_id,name,join_code)
      values(v_uid,v_name,v_code)
      returning id into v_id;
      exit;
    exception when unique_violation then
      v_id := null;
    end;
  end loop;
  if v_id is null then raise exception 'Could not create a unique class code'; end if;

  return jsonb_build_object('id',v_id,'name',v_name,'join_code',v_code);
end;
$$;
revoke all on function public.alevel_create_class(text) from public, anon, authenticated;
grant execute on function public.alevel_create_class(text) to authenticated;

create or replace function public.alevel_teacher_classes()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_admin boolean;
  v_result jsonb;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not private.alevel_teacher_allowed(v_uid) then raise exception 'Teacher access required'; end if;
  select exists(select 1 from public.alevel_admins a where a.user_id=v_uid) into v_admin;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',c.id,
    'name',c.name,
    'join_code',c.join_code,
    'teacher_id',c.teacher_id,
    'created_at',c.created_at,
    'student_count',(select count(*) from public.alevel_teacher_class_members m where m.class_id=c.id),
    'last_sync',(select max(s.updated_at) from public.alevel_teacher_class_members m left join public.alevel_progress_snapshots s on s.user_id=m.student_id where m.class_id=c.id)
  ) order by c.created_at desc),'[]'::jsonb)
  into v_result
  from public.alevel_teacher_classes c
  where c.archived_at is null and (v_admin or c.teacher_id=v_uid);

  return v_result;
end;
$$;
revoke all on function public.alevel_teacher_classes() from public, anon, authenticated;
grant execute on function public.alevel_teacher_classes() to authenticated;

create or replace function public.alevel_join_class(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(regexp_replace(coalesce(p_code,''),'[^A-Za-z0-9]','','g'));
  v_class public.alevel_teacher_classes%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if char_length(v_code) < 6 then raise exception 'Enter a valid class code'; end if;
  select * into v_class from public.alevel_teacher_classes where join_code=v_code and archived_at is null;
  if v_class.id is null then raise exception 'Class code not found'; end if;
  if v_class.teacher_id=v_uid then raise exception 'You already own this class'; end if;

  insert into public.alevel_teacher_class_members(class_id,student_id)
  values(v_class.id,v_uid)
  on conflict (class_id,student_id) do nothing;

  return jsonb_build_object('id',v_class.id,'name',v_class.name,'joined',true);
end;
$$;
revoke all on function public.alevel_join_class(text) from public, anon, authenticated;
grant execute on function public.alevel_join_class(text) to authenticated;

create or replace function public.alevel_student_classes()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_result jsonb;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',c.id,'name',c.name,'joined_at',m.joined_at
  ) order by m.joined_at desc),'[]'::jsonb)
  into v_result
  from public.alevel_teacher_class_members m
  join public.alevel_teacher_classes c on c.id=m.class_id
  where m.student_id=v_uid and c.archived_at is null;
  return v_result;
end;
$$;
revoke all on function public.alevel_student_classes() from public, anon, authenticated;
grant execute on function public.alevel_student_classes() to authenticated;

create or replace function public.alevel_leave_class(p_class_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  delete from public.alevel_teacher_class_members where class_id=p_class_id and student_id=v_uid;
  return found;
end;
$$;
revoke all on function public.alevel_leave_class(uuid) from public, anon, authenticated;
grant execute on function public.alevel_leave_class(uuid) to authenticated;

create or replace function public.alevel_teacher_remove_student(p_class_id uuid,p_student_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_admin boolean;
  v_owner uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not private.alevel_teacher_allowed(v_uid) then raise exception 'Teacher access required'; end if;
  select teacher_id into v_owner from public.alevel_teacher_classes where id=p_class_id and archived_at is null;
  select exists(select 1 from public.alevel_admins a where a.user_id=v_uid) into v_admin;
  if v_owner is null or (not v_admin and v_owner<>v_uid) then raise exception 'Class access denied'; end if;
  delete from public.alevel_teacher_class_members where class_id=p_class_id and student_id=p_student_id;
  return found;
end;
$$;
revoke all on function public.alevel_teacher_remove_student(uuid,uuid) from public, anon, authenticated;
grant execute on function public.alevel_teacher_remove_student(uuid,uuid) to authenticated;

create or replace function public.alevel_archive_class(p_class_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_admin boolean;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not private.alevel_teacher_allowed(v_uid) then raise exception 'Teacher access required'; end if;
  select exists(select 1 from public.alevel_admins a where a.user_id=v_uid) into v_admin;
  update public.alevel_teacher_classes
  set archived_at=now()
  where id=p_class_id and archived_at is null and (teacher_id=v_uid or v_admin);
  return found;
end;
$$;
revoke all on function public.alevel_archive_class(uuid) from public, anon, authenticated;
grant execute on function public.alevel_archive_class(uuid) to authenticated;

create or replace function public.alevel_teacher_class_analytics(p_class_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_admin boolean;
  v_class public.alevel_teacher_classes%rowtype;
  v_students jsonb;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not private.alevel_teacher_allowed(v_uid) then raise exception 'Teacher access required'; end if;
  select exists(select 1 from public.alevel_admins a where a.user_id=v_uid) into v_admin;
  select * into v_class from public.alevel_teacher_classes where id=p_class_id and archived_at is null;
  if v_class.id is null or (not v_admin and v_class.teacher_id<>v_uid) then raise exception 'Class access denied'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',u.id,
    'email',u.email,
    'joined_at',m.joined_at,
    'updated_at',s.updated_at,
    'snapshot',coalesce(s.snapshot,'{}'::jsonb)
  ) order by coalesce(s.updated_at,m.joined_at) desc),'[]'::jsonb)
  into v_students
  from public.alevel_teacher_class_members m
  join auth.users u on u.id=m.student_id
  left join public.alevel_progress_snapshots s on s.user_id=m.student_id
  where m.class_id=v_class.id;

  return jsonb_build_object(
    'class',jsonb_build_object('id',v_class.id,'name',v_class.name,'join_code',v_class.join_code,'created_at',v_class.created_at),
    'students',v_students
  );
end;
$$;
revoke all on function public.alevel_teacher_class_analytics(uuid) from public, anon, authenticated;
grant execute on function public.alevel_teacher_class_analytics(uuid) to authenticated;