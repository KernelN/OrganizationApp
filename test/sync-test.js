import net from 'node:net';
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
  console.log('--- Running /api/sync ioredis Integration Tests ---');

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
    delete process.env.REDIS_URL;

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
    delete process.env.REDIS_URL;

    const { req, res } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer crono_prod_test_key' },
      query: { action: 'ping' }
    });
    await handler(req, res);
    assert(res.getStatusCode() === 503, 'Returns 503 in Vercel production if REDIS_URL is missing');
    assert(res.getData()?.error.includes('Missing REDIS_URL'), 'Returns helpful error message naming REDIS_URL');
  }

  // Test 6: TCP Redis Server Integration (ioredis)
  {
    const tcpStore = new Map();
    const mockTcpRedisServer = net.createServer((socket) => {
      let buffer = '';
      socket.on('data', (chunk) => {
        buffer += chunk.toString();
        // Respond to RESP commands
        while (buffer.length > 0) {
          if (buffer.startsWith('*1\r\n$4\r\nping\r\n') || buffer.startsWith('*1\r\n$4\r\nPING\r\n') || buffer.toUpperCase().includes('PING')) {
            socket.write('+PONG\r\n');
            buffer = '';
            break;
          }
          if (buffer.toUpperCase().includes('SET')) {
            const lines = buffer.split('\r\n');
            // Format: *3\r\n$3\r\nSET\r\n$<len>\r\n<key>\r\n$<len>\r\n<val>\r\n
            const key = lines[4];
            const val = lines[6];
            if (key && val) {
              tcpStore.set(key, val);
              socket.write('+OK\r\n');
              buffer = '';
              break;
            }
          }
          if (buffer.toUpperCase().includes('GET')) {
            const lines = buffer.split('\r\n');
            const key = lines[4];
            if (key) {
              const val = tcpStore.get(key);
              if (val) {
                socket.write(`$${Buffer.byteLength(val)}\r\n${val}\r\n`);
              } else {
                socket.write('$-1\r\n');
              }
              buffer = '';
              break;
            }
          }
          break;
        }
      });
    });

    await new Promise(resolve => mockTcpRedisServer.listen(0, '127.0.0.1', resolve));
    const tcpPort = mockTcpRedisServer.address().port;

    process.env.REDIS_URL = `redis://127.0.0.1:${tcpPort}`;
    process.env.VERCEL = '1';

    // 6a: Ping TCP Redis
    const { req: pingReq, res: pingRes } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer crono_tcp_test_key' },
      query: { action: 'ping' }
    });
    await handler(pingReq, pingRes);
    assert(pingRes.getStatusCode() === 200, 'Ping succeeds with TCP REDIS_URL');
    assert(pingRes.getData()?.provider.includes('Redis Cloud (Online)'), 'Provider reports Redis Cloud (Online)');

    // 6b: Push via TCP Redis
    const tcpPayload = {
      tasks: [{ id: '01TCP1', title: 'TCP Task via REDIS_URL' }],
      tags: [{ id: '01TAG_TCP', name: 'RedisCloud' }],
      dependencies: [],
      time_logs: [],
      settings: { accent_color: '#6366F1' }
    };
    const { req: pushReq, res: pushRes } = createMockReqRes({
      method: 'POST',
      headers: { authorization: 'Bearer crono_tcp_test_key' },
      body: tcpPayload
    });
    await handler(pushReq, pushRes);
    assert(pushRes.getStatusCode() === 200, 'Push via TCP REDIS_URL succeeds');

    // 6c: Pull via TCP Redis
    const { req: pullReq, res: pullRes } = createMockReqRes({
      method: 'GET',
      headers: { authorization: 'Bearer crono_tcp_test_key' }
    });
    await handler(pullReq, pullRes);
    assert(pullRes.getStatusCode() === 200, 'Pull via TCP REDIS_URL succeeds');
    assert(pullRes.getData()?.data?.tasks?.[0]?.title === 'TCP Task via REDIS_URL', 'Retrieved task matches pushed TCP data');

    mockTcpRedisServer.close();
  }

  console.log(`\n=== TEST SUMMARY: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
