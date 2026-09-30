import { createClient } from 'npm:@supabase/supabase-js@2.117.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const pubKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}');
const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
const PUBLISHABLE = pubKeys.default || Deno.env.get('SUPABASE_ANON_KEY') || '';
const SECRET = secretKeys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const admin = createClient(SUPABASE_URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
const publicClient = createClient(SUPABASE_URL, PUBLISHABLE, { auth: { persistSession: false, autoRefreshToken: false } });

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const ALEVEL_PRODUCTS = [
  'prod_VM6e8WP7JfgNey',
  'prod_VM6fugzA9WjJoC',
  'prod_VM6fVBxhDyJwgo'
];

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
}

function cleanText(value: unknown, max = 120) {
  return String(value ?? '').trim().slice(0, max);
}

async function requireAdmin(req: Request) {
  const header = req.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) throw Object.assign(new Error('Administrator sign-in required'), { status: 401 });
  const token = header.slice(7);
  const { data, error } = await publicClient.auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error('Session is invalid or expired'), { status: 401 });
  const { data: row, error: roleError } = await admin.from('alevel_admins').select('role').eq('user_id', data.user.id).maybeSingle();
  if (roleError) throw roleError;
  if (!row) throw Object.assign(new Error('Administrator access required'), { status: 403 });
  return { userId: data.user.id, email: data.user.email || '', role: String(row.role || 'admin') };
}

async function getStripeKey() {
  const { data, error } = await admin.rpc('alevel_get_stripe_admin_key');
  if (error) throw error;
  return String(data || '');
}

async function setStripeKey(value: string) {
  const { error } = await admin.rpc('alevel_set_stripe_admin_key', { p_value: value });
  if (error) throw error;
}

async function clearStripeKey() {
  const { error } = await admin.rpc('alevel_clear_stripe_admin_key');
  if (error) throw error;
}

async function stripeRequest(key: string, path: string, method = 'GET', params?: URLSearchParams) {
  const init: RequestInit = {
    method,
    headers: { Authorization: `Bearer ${key}` }
  };
  if (method !== 'GET' && params) {
    (init.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
    init.body = params.toString();
  }
  const res = await fetch(`https://api.stripe.com${path}`, init);
  const text = await res.text();
  let body: any = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { error: { message: text || 'Stripe request failed' } }; }
  if (!res.ok) {
    const message = body?.error?.message || `Stripe request failed (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status >= 500 ? 502 : 400 });
  }
  return body;
}

async function listPromos(key: string) {
  const query = new URLSearchParams();
  query.set('limit', '100');
  query.append('expand[]', 'data.promotion.coupon');
  const result = await stripeRequest(key, `/v1/promotion_codes?${query.toString()}`);
  const rows = Array.isArray(result?.data) ? result.data : [];
  const output = [];
  for (const item of rows) {
    if (item?.metadata?.app !== 'alevel-course') continue;
    let coupon: any = item?.promotion?.coupon || null;
    if (typeof coupon === 'string') {
      try { coupon = await stripeRequest(key, `/v1/coupons/${encodeURIComponent(coupon)}`); }
      catch { coupon = null; }
    }
    output.push({
      id: item.id,
      code: item.code,
      active: Boolean(item.active),
      created: item.created || null,
      expires_at: item.expires_at || null,
      max_redemptions: item.max_redemptions || null,
      times_redeemed: item.times_redeemed || 0,
      first_time_only: Boolean(item?.restrictions?.first_time_transaction),
      discount_type: coupon?.percent_off != null ? 'percent' : 'amount',
      discount_value: coupon?.percent_off != null ? Number(coupon.percent_off) : Number(coupon?.amount_off || 0) / 100,
      duration: coupon?.duration || 'once',
      duration_in_months: coupon?.duration_in_months || null,
      currency: coupon?.currency || 'gbp'
    });
  }
  output.sort((a: any, b: any) => Number(b.created || 0) - Number(a.created || 0));
  return output;
}

async function createPromo(key: string, body: any, actor: { email: string }) {
  const code = cleanText(body.code, 40).toUpperCase();
  if (!/^[A-Z0-9-]{3,40}$/.test(code)) throw Object.assign(new Error('Use 3–40 letters, numbers or dashes for the promo code.'), { status: 400 });

  const discountType = body.discount_type === 'amount' ? 'amount' : 'percent';
  const value = Number(body.discount_value);
  if (!Number.isFinite(value) || value <= 0) throw Object.assign(new Error('Enter a valid discount value.'), { status: 400 });
  if (discountType === 'percent' && value > 100) throw Object.assign(new Error('Percentage discounts cannot exceed 100%.'), { status: 400 });
  if (discountType === 'amount' && value > 10000) throw Object.assign(new Error('Fixed discounts cannot exceed £10,000.'), { status: 400 });

  const duration = ['once', 'repeating', 'forever'].includes(String(body.duration)) ? String(body.duration) : 'once';
  const repeatMonths = duration === 'repeating' ? Math.trunc(Number(body.duration_in_months)) : null;
  if (duration === 'repeating' && (!repeatMonths || repeatMonths < 1 || repeatMonths > 60)) {
    throw Object.assign(new Error('Repeating discounts must last between 1 and 60 months.'), { status: 400 });
  }

  const maxRedemptions = body.max_redemptions ? Math.trunc(Number(body.max_redemptions)) : null;
  if (maxRedemptions != null && (maxRedemptions < 1 || maxRedemptions > 1000000)) {
    throw Object.assign(new Error('Maximum uses must be between 1 and 1,000,000.'), { status: 400 });
  }

  let expiresAt: number | null = null;
  if (body.expires_at) {
    const timestamp = new Date(String(body.expires_at)).getTime();
    if (!Number.isFinite(timestamp) || timestamp <= Date.now() + 60000) throw Object.assign(new Error('Expiry must be in the future.'), { status: 400 });
    expiresAt = Math.floor(timestamp / 1000);
  }

  const coupon = new URLSearchParams();
  coupon.set('duration', duration);
  coupon.set('name', `A-Level Physics ${code}`);
  coupon.set('metadata[app]', 'alevel-course');
  coupon.set('metadata[created_via]', 'admin-terminal');
  coupon.set('metadata[created_by]', cleanText(actor.email, 120));
  ALEVEL_PRODUCTS.forEach((product, index) => coupon.set(`applies_to[products][${index}]`, product));
  if (discountType === 'percent') coupon.set('percent_off', String(value));
  else {
    coupon.set('amount_off', String(Math.round(value * 100)));
    coupon.set('currency', 'gbp');
  }
  if (duration === 'repeating') coupon.set('duration_in_months', String(repeatMonths));

  const couponObject = await stripeRequest(key, '/v1/coupons', 'POST', coupon);
  try {
    const promo = new URLSearchParams();
    promo.set('code', code);
    promo.set('active', 'true');
    promo.set('promotion[type]', 'coupon');
    promo.set('promotion[coupon]', couponObject.id);
    promo.set('metadata[app]', 'alevel-course');
    promo.set('metadata[created_via]', 'admin-terminal');
    promo.set('metadata[created_by]', cleanText(actor.email, 120));
    if (maxRedemptions) promo.set('max_redemptions', String(maxRedemptions));
    if (expiresAt) promo.set('expires_at', String(expiresAt));
    if (body.first_time_only) promo.set('restrictions[first_time_transaction]', 'true');
    const promotionCode = await stripeRequest(key, '/v1/promotion_codes', 'POST', promo);
    return { id: promotionCode.id, code: promotionCode.code };
  } catch (error) {
    try { await stripeRequest(key, `/v1/coupons/${encodeURIComponent(couponObject.id)}`, 'DELETE'); } catch (_) {}
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);

  try {
    const actor = await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const action = cleanText(body.action, 40);

    if (action === 'status') {
      const key = await getStripeKey();
      return reply({ ok: true, connected: key.startsWith('rk_live_') });
    }

    if (action === 'connect') {
      if (actor.role !== 'owner') return reply({ error: 'Only the owner can change the Stripe admin connection.' }, 403);
      const key = cleanText(body.stripe_key, 220);
      if (!/^rk_live_[A-Za-z0-9_]+$/.test(key)) return reply({ error: 'Use a live Stripe restricted key (rk_live_…).' }, 400);
      await stripeRequest(key, '/v1/promotion_codes?limit=1');
      await stripeRequest(key, '/v1/coupons?limit=1');
      await setStripeKey(key);
      return reply({ ok: true, connected: true });
    }

    if (action === 'disconnect') {
      if (actor.role !== 'owner') return reply({ error: 'Only the owner can change the Stripe admin connection.' }, 403);
      await clearStripeKey();
      return reply({ ok: true, connected: false });
    }

    const key = await getStripeKey();
    if (!key.startsWith('rk_live_')) return reply({ error: 'Connect a Stripe restricted key first.', code: 'stripe_not_connected' }, 409);

    if (action === 'list') return reply({ ok: true, promo_codes: await listPromos(key) });
    if (action === 'create') return reply({ ok: true, promo_code: await createPromo(key, body, actor) });

    return reply({ error: 'Unknown action' }, 400);
  } catch (error: any) {
    console.error('alevel-promo-admin', error?.message || error);
    return reply({ error: error?.message || 'Promo-code request failed.' }, error?.status || 500);
  }
});