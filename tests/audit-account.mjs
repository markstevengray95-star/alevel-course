// Deterministic account boundary for UI audits. Never connects to a real account.
// Only loopback test servers may use this fixture; production auth is unchanged.
export async function installAuditAccount(context, base) {
  if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname)) {
    throw new Error('The audit account fixture is restricted to a local test server');
  }
  await context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm', route => route.fulfill({
    contentType: 'application/javascript',
    body: `
      const session = { user: { id: 'audit-user', email: 'audit@example.test' } };
      export function createClient() {
        return {
          auth: {
            getSession: async () => ({ data: { session }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } })
          },
          rpc: async name => {
            if (name === 'alevel_register_session') return { data: {
              plan_tier: 'teacher', subscription_status: 'active', is_admin: false
            }, error: null };
            if (name === 'alevel_record_usage') return { data: null, error: null };
            if (name === 'alevel_create_checkout_reference') return { data: 'a'.repeat(64), error: null };
            throw new Error('Unexpected RPC in course UI audit: ' + name);
          }
        };
      }
    `
  }));
  await context.route('https://*.supabase.co/**', route => route.abort());
}
