import http from 'node:http';
import handler from '../api/sync.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`? PASS: ${message}`);
    passed++;
  } else {
    console.error(`? FAIL: ${message}`);
    failed++;
  }
}

function createMockReqRes(options = {}) {
  const req = {
    method: options.method || 'GET',
    headers: options.headers || {},
    query: options.query || {},
    body: options.body || null
  };

  let statusCode = 200;
  let responseData = null;
  let headersSet = {};

  const res = {
    setHeader: (name, val) => { headersSet[name] = val; },
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    end: () => res,
    getStatusCode: () => statusCode,
    getData: () => responseData
  };

  return { req, res };
}

async function runTests() {
  console.log('--- Running /api/sync Integration Tests ---');

  // Test 1: Missing auth header -> 401
  {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await handler(req, res);
    assert(res.getStatusCode() === 401, 'Rejects unauthenticated requests with 401');
  }

  // Test 2: Invalid sync key length -> 401
  {
    const { req, res } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer short' }
    });
    await handler(req, res);
    assert(res.getStatusCode() === 401, 'Rejects short sync keys with 401');
  }

  // Test 3: Ping in local dev mode -> 200 with In-Memory provider
  {
    delete process.env.VERCEL;
    delete process.env.NODE_ENV;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const { req, res } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer crono_test_key_12345' },
      query: { action: 'ping' }
    });
    await handler(req, res);
    assert(res.getStatusCode() === 200, 'Ping succeeds in local dev mode');
    assert(res.getData()?.provider === 'In-Memory (Dev)', 'Ping reports In-Memory provider in dev');
  }

  // Test 4: Dev Push & Pull
  {
    const syncKey = 'crono_test_key_dev12345';
    const payload = {
      tasks: [{ id: '01TASK1', title: 'Test Task' }],
      tags: [{ id: '01TAG1', name: 'Work' }],
      dependencies: [],
      time_logs: [],
      settings: { theme: 'dark' }
    };

    // Push
    const { req: pushReq, res: pushRes } = createMockReqRes({
      method: 'POST',
      headers: { authorization: `Bearer ${syncKey}` },
      body: payload
    });
    await handler(pushReq, pushRes);
    assert(pushRes.getStatusCode() === 200, 'Push succeeds in local dev mode');
    assert(Boolean(pushRes.getData()?._synced_at), 'Push returns _synced_at timestamp');

    // Metadata
    const { req: metaReq, res: metaRes } = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${syncKey}` },
      query: { action: 'metadata' }
    });
    await handler(metaReq, metaRes);
    assert(metaRes.getStatusCode() === 200, 'Metadata endpoint succeeds');
    assert(metaRes.getData()?.taskCount === 1, 'Metadata returns taskCount = 1');

    // Pull
    const { req: pullReq, res: pullRes } = createMockReqRes({
      method: 'GET',
      headers: { authorization: `Bearer ${syncKey}` }
    });
    await handler(pullReq, pullRes);
    assert(pullRes.getStatusCode() === 200, 'Pull succeeds in local dev mode');
    assert(pullRes.getData()?.data?.tasks?.length === 1, 'Pull returns saved tasks');
  }

  // Test 5: Production without Redis env vars -> 503 error
  {
    process.env.VERCEL = '1';
    const { req, res } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer crono_prod_test_key' },
      query: { action: 'ping' }
    });
    await handler(req, res);
    assert(res.getStatusCode() === 503, 'Returns 503 in Vercel production if Redis is not configured');
    assert(res.getData()?.error.includes('Missing UPSTASH_REDIS_REST_URL'), 'Returns helpful error message naming missing env vars');
  }

  // Test 6: Upstash Redis Mock Server Integration
  {
    const mockStore = new Map();
    const mockUpstashServer = http.createServer((sReq, sRes) => {
      let body = '';
      sReq.on('data', chunk => { body += chunk; });
      sReq.on('end', () => {
        sRes.setHeader('Content-Type', 'application/json');
        try {
          if (body) {
            const parsed = JSON.parse(body);
            if (Array.isArray(parsed)) {
              const [cmd, key, val] = parsed;
              if (cmd === 'PING') {
                return sRes.end(JSON.stringify({ result: 'PONG' }));
              }
              if (cmd === 'SET') {
                mockStore.set(key, val);
                return sRes.end(JSON.stringify({ result: 'OK' }));
              }
              if (cmd === 'GET') {
                return sRes.end(JSON.stringify({ result: mockStore.get(key) || null }));
              }
            }
          }
          sRes.end(JSON.stringify({ result: null }));
        } catch (err) {
          sRes.statusCode = 500;
          sRes.end(JSON.stringify({ error: err.message }));
        }
      });
    });

    await new Promise(resolve => mockUpstashServer.listen(0, '127.0.0.1', resolve));
    const port = mockUpstashServer.address().port;
    const mockUrl = `http://127.0.0.1:${port}`;
    const mockToken = 'mock_upstash_secret_token_123';

    // Inject UPSTASH credentials
    process.env.UPSTASH_REDIS_REST_URL = mockUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = mockToken;
    process.env.VERCEL = '1';

    // 6a: Ping active Redis
    const { req: pingReq, res: pingRes } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer crono_upstash_test_key' },
      query: { action: 'ping' }
    });
    await handler(pingReq, pingRes);
    assert(pingRes.getStatusCode() === 200, 'Ping succeeds with Upstash Redis configured');
    assert(pingRes.getData()?.provider === 'Redis (Online)', 'Ping confirms Redis (Online)');

    // 6b: Push to Redis
    const upstashPayload = {
      tasks: [{ id: '01UPSTASH1', title: 'Upstash Task' }],
      tags: [{ id: '01TAG_U', name: 'Cloud' }],
      dependencies: [],
      time_logs: [],
      settings: { accent_color: '#4F46E5' }
    };
    const { req: pushReq, res: pushRes } = createMockReqRes({
      method: 'POST',
      headers: { authorization: 'Bearer crono_upstash_test_key' },
      body: upstashPayload
    });
    await handler(pushReq, pushRes);
    assert(pushRes.getStatusCode() === 200, 'Push to Upstash Redis succeeds');

    // 6c: Pull from Redis
    const { req: pullReq, res: pullRes } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer crono_upstash_test_key' }
    });
    await handler(pullReq, pullRes);
    assert(pullRes.getStatusCode() === 200, 'Pull from Upstash Redis succeeds');
    assert(pullRes.getData()?.data?.tasks?.[0]?.title === 'Upstash Task', 'Retrieved task data matches pushed data');

    mockUpstashServer.close();
  }

  console.log(`\n=== TEST SUMMARY: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
