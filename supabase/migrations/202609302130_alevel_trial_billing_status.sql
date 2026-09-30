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
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select lower(email) into v_email
  from auth.users
  where id = v_uid;

  insert into public.alevel_profiles(user_id, last_seen_at)
  values (v_uid, now())
  on conflict (user_id) do update set last_seen_at = excluded.last_seen_at;

  if v_email = 'msgray95@hotmail.com' then
    insert into public.alevel_admins(user_id, role)
    values (v_uid, 'owner')
    on conflict (user_id) do update set role = 'owner';

    update public.alevel_profiles
    set plan_tier = 'teacher',
        subscription_status = 'active',
        last_seen_at = now(),
        updated_at = now()
    where user_id = v_uid;
  end if;

  select * into v_profile
  from public.alevel_profiles
  where user_id = v_uid;

  select exists(
    select 1 from public.alevel_admins a where a.user_id = v_uid
  ) into v_is_admin;

  if v_is_admin then
    v_effective_plan := 'teacher';
  elsif v_profile.subscription_status in ('active','trialing') then
    v_effective_plan := v_profile.plan_tier;
  else
    v_effective_plan := 'free';
  end if;

  return jsonb_build_object(
    'user_id', v_uid,
    'plan_tier', v_effective_plan,
    'subscription_status', v_profile.subscription_status,
    'is_admin', v_is_admin,
    'current_period_end', v_profile.current_period_end,
    'cancel_at_period_end', coalesce(v_profile.cancel_at_period_end, false),
    'billing_interval', v_profile.billing_interval
  );
end;
$$;
