import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

function adminKey() {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    if (keys?.default) return String(keys.default);
  } catch (_) {}
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

const ADMIN_KEY = adminKey();
const baseHeaders: Record<string,string> = { apikey: ADMIN_KEY, "Content-Type": "application/json" };
if (!ADMIN_KEY.startsWith("sb_secret_")) baseHeaders.Authorization = `Bearer ${ADMIN_KEY}`;

const reply = (status:number, body:unknown) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" }
});

async function rest(path:string, init:RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...baseHeaders, ...(init.headers || {}) }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${text.slice(0,300)}`);
  return text ? JSON.parse(text) : null;
}

async function rpc(name:string, body:Record<string,unknown>) {
  return rest(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}

function localStatus(status:string) {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (["past_due","unpaid","incomplete"].includes(status)) return "past_due";
  if (["canceled","incomplete_expired"].includes(status)) return "canceled";
  return "inactive";
}

function periodEnd(sub:any) {
  const unix = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
  return unix ? new Date(Number(unix) * 1000).toISOString() : null;
}

async function isOwner(userId:string) {
  const rows = await rest(`alevel_admins?select=role&user_id=eq.${encodeURIComponent(userId)}&role=eq.owner&limit=1`);
  return Array.isArray(rows) && rows.length > 0;
}

async function patchUser(userId:string, patch:Record<string,unknown>) {
  if (await isOwner(userId)) {
    patch.plan_tier = "teacher";
    patch.subscription_status = "active";
  }
  patch.updated_at = new Date().toISOString();
  await rest(`alevel_profiles?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch)
  });
}

async function findBySubscription(subscriptionId:string) {
  const rows = await rest(`alevel_profiles?select=user_id&stripe_subscription_id=eq.${encodeURIComponent(subscriptionId)}&limit=1`);
  return Array.isArray(rows) && rows[0]?.user_id ? String(rows[0].user_id) : null;
}

async function resolveCheckoutReference(token:string) {
  if (!/^[0-9a-f]{64}$/i.test(token)) return null;
  const rows = await rest(`alevel_checkout_references?select=user_id,expires_at&token=eq.${encodeURIComponent(token)}&limit=1`);
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.user_id) return null;
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null;
  return String(row.user_id);
}

async function markReferenceUsed(token:string) {
  await rest(`alevel_checkout_references?token=eq.${encodeURIComponent(token)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ used_at: new Date().toISOString() })
  });
}

async function claimEvent(eventId:string, eventType:string) {
  const rows = await rpc("alevel_claim_stripe_webhook_event", { p_event_id: eventId, p_event_type: eventType });
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { claimed: Boolean(row?.claimed), state: String(row?.state || "unknown") };
}

async function finishEvent(eventId:string, success:boolean, error:string|null = null) {
  await rpc("alevel_finish_stripe_webhook_event", {
    p_event_id: eventId,
    p_success: success,
    p_error: error
  });
}

Deno.serve(async (req:Request) => {
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" });
  if (!ADMIN_KEY) return reply(500, { error: "server_configuration_error" });

  const raw = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  let verified = false;
  try {
    verified = Boolean(await rpc("alevel_verify_stripe_signature", {
      p_payload: raw,
      p_signature: signature
    }));
  } catch (_) {
    return reply(500, { error: "signature_verification_unavailable" });
  }
  if (!verified) return reply(401, { error: "invalid_signature" });

  let event:any;
  try { event = JSON.parse(raw); }
  catch { return reply(400, { error: "invalid_json" }); }

  const eventId = String(event?.id || "");
  const eventType = String(event?.type || "");
  if (!eventId || !eventType) return reply(400, { error: "invalid_event" });

  try {
    const claim = await claimEvent(eventId, eventType);
    if (!claim.claimed) return reply(200, { received: true, duplicate: true, state: claim.state });

    const object = event?.data?.object || {};

    if (eventType === "checkout.session.completed") {
      if (object?.metadata?.app !== "alevel-course") {
        await finishEvent(eventId, true);
        return reply(200, { received: true, ignored: true });
      }
      const checkoutRef = String(object.client_reference_id || "");
      const userId = await resolveCheckoutReference(checkoutRef);
      const plan = String(object?.metadata?.plan || "");
      const billing = String(object?.metadata?.billing || "");
      if (!userId || !["plus","pro","teacher"].includes(plan)) {
        throw new Error("Invalid checkout entitlement reference");
      }
      await patchUser(userId, {
        plan_tier: plan,
        subscription_status: "active",
        stripe_customer_id: object.customer || null,
        stripe_subscription_id: object.subscription || null,
        billing_interval: ["monthly","annual"].includes(billing) ? billing : null,
        cancel_at_period_end: false
      });
      await markReferenceUsed(checkoutRef);
    } else if (eventType.startsWith("customer.subscription.")) {
      if (object?.metadata?.app !== "alevel-course") {
        await finishEvent(eventId, true);
        return reply(200, { received: true, ignored: true });
      }
      const subId = String(object.id || "");
      const userId = await findBySubscription(subId);
      if (userId) {
        const deleted = eventType === "customer.subscription.deleted";
        const plan = String(object?.metadata?.plan || "");
        const billing = String(object?.metadata?.billing || "");
        const patch:Record<string,unknown> = {
          subscription_status: deleted ? "canceled" : localStatus(String(object.status || "inactive")),
          stripe_customer_id: object.customer || null,
          stripe_subscription_id: subId,
          current_period_end: periodEnd(object),
          cancel_at_period_end: Boolean(object.cancel_at_period_end),
          billing_interval: ["monthly","annual"].includes(billing) ? billing : null
        };
        if (deleted) patch.plan_tier = "free";
        else if (["plus","pro","teacher"].includes(plan)) patch.plan_tier = plan;
        await patchUser(userId, patch);
      }
    } else if (["invoice.payment_failed","invoice.payment_succeeded","invoice.paid"].includes(eventType)) {
      const subId = String(object?.subscription || object?.parent?.subscription_details?.subscription || "");
      if (subId) {
        const userId = await findBySubscription(subId);
        if (userId) await patchUser(userId, {
          subscription_status: eventType === "invoice.payment_failed" ? "past_due" : "active"
        });
      }
    }

    await finishEvent(eventId, true);
    return reply(200, { received: true });
  } catch (err) {
    const message = String((err as Error)?.message || err).slice(0,500);
    try { await finishEvent(eventId, false, message); } catch (_) {}
    return reply(500, { error: "processing_failed" });
  }
});