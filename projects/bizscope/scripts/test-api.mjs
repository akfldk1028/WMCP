#!/usr/bin/env node

/**
 * BizScope AI — API Integration Test Runner
 *
 * Usage:
 *   node scripts/test-api.mjs                          # auto-detect (localhost → production)
 *   node scripts/test-api.mjs http://localhost:3000     # specific URL
 *   node scripts/test-api.mjs https://bizscope-rho.vercel.app
 */

const URLS = [
  process.argv[2],
  'http://localhost:3000',
  'https://bizscope-theta.vercel.app',
].filter(Boolean);

const API_KEY = process.env.BIZSCOPE_API_KEY || 'dev_local_test_key_2026';

let BASE = '';
let passed = 0;
let failed = 0;
let skipped = 0;

// --- Helpers ---

async function post(path, body, headers = {}) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

function auth() {
  return { Authorization: `Bearer ${API_KEY}` };
}

async function test(name, fn, { requiresAuth = false } = {}) {
  if (requiresAuth && !authWorks) {
    skipped++;
    console.log(`  ⊘ ${name} (auth unavailable)`);
    return;
  }
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name} — ${err.message}`);
  }
}

let authWorks = false; // set in runTests

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// --- Tests ---

async function runTests() {
  // Detect server
  for (const url of URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok || res.status < 500) {
        BASE = url;
        break;
      }
    } catch { /* next */ }
  }

  if (!BASE) {
    console.log('✗ No server reachable. Start with: pnpm dev');
    process.exit(1);
  }

  // Test if auth works (MCP tests need it)
  authWorks = false;
  try {
    const r = await post('/api/mcp', { jsonrpc: '2.0', id: 0, method: 'ping', params: {} }, auth());
    const d = await r.json();
    authWorks = !!d.result;
  } catch { /* */ }

  console.log(`\n🔗 Testing: ${BASE}`);
  console.log(`🔑 Auth: ${authWorks ? 'OK' : 'UNAVAILABLE (MCP tests will skip)'}\n`);

  // --- MCP ---
  console.log('MCP (/api/mcp):');

  await test('initialize', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }, auth());
    assert(res.status === 200, `status ${res.status}`);
    const d = await res.json();
    assert(d.result.serverInfo.name === 'bizscope-ai', `name: ${d.result?.serverInfo?.name}`);
  }, { requiresAuth: true });

  await test('tools/list → 53 tools', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }, auth());
    const d = await res.json();
    assert(d.result.tools.length === 53, `got ${d.result?.tools?.length} tools`);
  }, { requiresAuth: true });

  await test('ping', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 3, method: 'ping', params: {} }, auth());
    const d = await res.json();
    assert(JSON.stringify(d.result) === '{}', 'expected empty result');
  }, { requiresAuth: true });

  await test('no auth → reject', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 4, method: 'tools/list', params: {} });
    const d = await res.json();
    assert(d.error, 'expected error');
  });

  await test('invalid key → reject', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 5, method: 'tools/list', params: {} }, { Authorization: 'Bearer fake' });
    const d = await res.json();
    assert(d.error, 'expected error');
  });

  await test('unknown tool → isError', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'nope', arguments: {} } }, auth());
    const d = await res.json();
    assert(d.result.isError === true, 'expected isError');
  }, { requiresAuth: true });

  await test('unknown method → -32601', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 7, method: 'foo/bar', params: {} }, auth());
    const d = await res.json();
    assert(d.error.code === -32601, `code: ${d.error?.code}`);
  }, { requiresAuth: true });

  await test('plan-status → completion data', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'bizscope-plan-status', arguments: {} } }, auth());
    const d = await res.json();
    const r = JSON.parse(d.result.content[0].text);
    assert('bmcCompletion' in r && 'planCompletion' in r, 'missing fields');
  }, { requiresAuth: true });

  await test('all tools have valid schema', async () => {
    const res = await post('/api/mcp', { jsonrpc: '2.0', id: 9, method: 'tools/list', params: {} }, auth());
    const d = await res.json();
    for (const t of d.result.tools) {
      assert(t.name.startsWith('bizscope-'), `bad name: ${t.name}`);
      assert(t.inputSchema?.type, `no schema: ${t.name}`);
    }
  }, { requiresAuth: true });

  // --- Planning Chat ---
  console.log('\nPlanning Chat (/api/planning/chat):');

  await test('missing fields → 400', async () => {
    const res = await post('/api/planning/chat', { mode: 'bmc' });
    assert(res.status === 400, `status ${res.status}`);
  });

  await test('invalid mode → 400', async () => {
    const res = await post('/api/planning/chat', { messages: [{ role: 'user', content: 'hi' }], mode: 'invalid' });
    assert(res.status === 400, `status ${res.status}`);
  });

  await test('valid request → SSE stream', async () => {
    const res = await post('/api/planning/chat', { messages: [{ role: 'user', content: 'hello' }], mode: 'bmc' });
    assert(res.status === 200, `status ${res.status}`);
    assert(res.headers.get('content-type')?.includes('text/event-stream'), 'not SSE');
  });

  // --- Brainstorm ---
  console.log('\nBrainstorm (/api/brainstorm):');

  await test('no auth → 403', async () => {
    const res = await post('/api/brainstorm', { topic: 'test' });
    assert(res.status === 403, `status ${res.status}`);
  });

  await test('missing topic → 400', async () => {
    const res = await post('/api/brainstorm', {}, auth());
    assert(res.status === 400, `status ${res.status}`);
  }, { requiresAuth: true });

  // --- License ---
  console.log('\nLicense APIs:');

  await test('/license/check — no key → 400', async () => {
    const res = await post('/api/license/check', {});
    assert(res.status === 400, `status ${res.status}`);
  });

  await test('/license/use — no key → 400+', async () => {
    const res = await post('/api/license/use', {});
    assert(res.status >= 400, `status ${res.status}`);
  });

  await test('/license/lookup — no email → 400+', async () => {
    const res = await post('/api/license/lookup', {});
    assert(res.status >= 400, `status ${res.status}`);
  });

  // --- Checkout ---
  console.log('\nCheckout:');

  await test('/checkout/status — no session → 400+', async () => {
    const res = await post('/api/checkout/status', {});
    assert(res.status >= 400, `status ${res.status}`);
  });

  // --- Tools (auth-gated) ---
  console.log('\nAuth-gated Tools:');

  await test('/tools/search — no auth → reject', async () => {
    const res = await post('/api/tools/search', { query: 'test' });
    assert(res.status >= 400, `status ${res.status}`);
  });

  await test('/tools/financial — no auth → reject', async () => {
    const res = await post('/api/tools/financial', { symbol: 'AAPL' });
    assert(res.status >= 400, `status ${res.status}`);
  });

  // --- Section ---
  console.log('\nSection Generation:');

  await test('/section/company-overview — no company → 400+', async () => {
    const res = await post('/api/section/company-overview', {});
    assert(res.status >= 400, `status ${res.status}`);
  });

  // --- Webhook ---
  console.log('\nWebhooks:');

  await test('/webhooks/lemonsqueezy — no sig → reject', async () => {
    const res = await post('/api/webhooks/lemonsqueezy', { meta: { event_name: 'test' } });
    assert(res.status >= 400, `status ${res.status}`);
  });

  // --- Summary ---
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log(`${'='.repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
