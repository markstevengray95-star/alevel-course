create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.alevel_webhook_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
revoke all on table private.alevel_webhook_config from public, anon, authenticated;

create or replace function public.alevel_verify_stripe_signature(p_payload text, p_signature text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret text;
  v_timestamp text;
  v_expected text;
  v_sig text;
  v_now bigint := extract(epoch from now())::bigint;
  v_ts bigint;
begin
  select value into v_secret
  from private.alevel_webhook_config
  where key = 'stripe_webhook_signing_secret';
  if v_secret is null or p_payload is null or p_signature is null then return false; end if;

  v_timestamp := substring(p_signature from '(?:^|,)t=([0-9]+)');
  if v_timestamp is null then return false; end if;
  begin v_ts := v_timestamp::bigint; exception when others then return false; end;
  if abs(v_now - v_ts) > 300 then return false; end if;

  v_expected := encode(extensions.hmac(convert_to(v_timestamp || '.' || p_payload, 'utf8'), convert_to(v_secret, 'utf8'), 'sha256'), 'hex');
  for v_sig in select (m)[1] from regexp_matches(p_signature, '(?:^|,)v1=([0-9a-fA-F]+)', 'g') as m loop
    if lower(v_sig) = lower(v_expected) then return true; end if;
  end loop;
  return false;
end;
$$;
revoke all on function public.alevel_verify_stripe_signature(text,text) from public, anon, authenticated;
grant execute on function public.alevel_verify_stripe_signature(text,text) to service_role;

create or replace function public.alevel_claim_stripe_webhook_event(p_event_id text, p_event_type text)
returns table(claimed boolean, state text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := 'alevel:' || p_event_id;
  v_row public.stripe_webhook_events%rowtype;
begin
  if p_event_id is null or length(p_event_id) < 3 then raise exception 'Invalid event id'; end if;

  insert into public.stripe_webhook_events(event_id,event_type,status,attempt_count,created_at,updated_at,processed_at,last_error)
  values(v_key,p_event_type,'processing',1,now(),now(),null,null)
  on conflict (event_id) do nothing;
  if found then return query select true, 'claimed'::text; return; end if;

  select * into v_row from public.stripe_webhook_events where event_id = v_key for update;
  if v_row.status = 'completed' then return query select false, 'completed'::text; return; end if;
  if v_row.status = 'failed' or (v_row.status = 'processing' and v_row.updated_at < now() - interval '5 minutes') then
    update public.stripe_webhook_events
    set event_type=p_event_type,status='processing',attempt_count=attempt_count+1,updated_at=now(),processed_at=null,last_error=null
    where event_id=v_key;
    return query select true, 'reclaimed'::text; return;
  end if;
  return query select false, 'processing'::text;
end;
$$;
revoke all on function public.alevel_claim_stripe_webhook_event(text,text) from public, anon, authenticated;
grant execute on function public.alevel_claim_stripe_webhook_event(text,text) to service_role;

create or replace function public.alevel_finish_stripe_webhook_event(p_event_id text, p_success boolean, p_error text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.stripe_webhook_events
  set status=case when p_success then 'completed' else 'failed' end,
      processed_at=case when p_success then now() else null end,
      updated_at=now(),
      last_error=case when p_success then null else left(coalesce(p_error,'unknown error'),1000) end
  where event_id='alevel:' || p_event_id;
end;
$$;
revoke all on function public.alevel_finish_stripe_webhook_event(text,boolean,text) from public, anon, authenticated;
grant execute on function public.alevel_finish_stripe_webhook_event(text,boolean,text) to service_role;

create or replace function public.alevel_register_session()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_profile public.alevel_profiles%rowtype;
  v_is_admin boolean := false;
  v_effective_plan text := 'free';
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select lower(email) into v_email from auth.users where id=v_uid;
  insert into public.alevel_profiles(user_id,last_seen_at) values(v_uid,now())
  on conflict (user_id) do update set last_seen_at=excluded.last_seen_at;

  if v_email='msgray95@hotmail.com' then
    insert into public.alevel_admins(user_id,role) values(v_uid,'owner')
    on conflict (user_id) do update set role='owner';
    update public.alevel_profiles
    set plan_tier='teacher',subscription_status='active',last_seen_at=now(),updated_at=now()
    where user_id=v_uid;
  end if;

  select * into v_profile from public.alevel_profiles where user_id=v_uid;
  select exists(select 1 from public.alevel_admins a where a.user_id=v_uid) into v_is_admin;

  if v_is_admin then v_effective_plan:='teacher';
  elsif v_profile.subscription_status in ('active','trialing') then v_effective_plan:=v_profile.plan_tier;
  else v_effective_plan:='free';
  end if;

  return jsonb_build_object(
    'user_id',v_uid,
    'plan_tier',v_effective_plan,
    'subscription_status',v_profile.subscription_status,
    'is_admin',v_is_admin
  );
end;
$$;

-- Store stripe_webhook_signing_secret outside source control in private.alevel_webhook_config after creating/rotating the Stripe endpoint.
