create or replace function public.alevel_get_stripe_admin_key()
returns text
language sql
security definer
set search_path = ''
as $$
  select value
  from private.alevel_webhook_config
  where key = 'stripe_admin_restricted_key'
  limit 1;
$$;
revoke all on function public.alevel_get_stripe_admin_key() from public, anon, authenticated;
grant execute on function public.alevel_get_stripe_admin_key() to service_role;

create or replace function public.alevel_set_stripe_admin_key(p_value text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_value is null or p_value !~ '^rk_live_[A-Za-z0-9_]+$' then
    raise exception 'A live restricted Stripe key is required';
  end if;

  insert into private.alevel_webhook_config(key, value, updated_at)
  values ('stripe_admin_restricted_key', p_value, now())
  on conflict (key) do update
    set value = excluded.value,
        updated_at = excluded.updated_at;
end;
$$;
revoke all on function public.alevel_set_stripe_admin_key(text) from public, anon, authenticated;
grant execute on function public.alevel_set_stripe_admin_key(text) to service_role;

create or replace function public.alevel_clear_stripe_admin_key()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from private.alevel_webhook_config
  where key = 'stripe_admin_restricted_key';
$$;
revoke all on function public.alevel_clear_stripe_admin_key() from public, anon, authenticated;
grant execute on function public.alevel_clear_stripe_admin_key() to service_role;
