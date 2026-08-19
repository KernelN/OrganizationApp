/**
 * Vercel Serverless Function: /api/sync
 * 
 * Handles push (POST) and pull (GET) requests for Cronograma user data.
 * Authenticates via HTTP Bearer token matching the user's secret sync_key.
 * Integrates with Upstash Redis and Vercel KV REST APIs with strict production validation.
 */

// Global in-memory fallback for local development / testing without Redis
if (!globalThis._cronoSyncStore) {
  globalThis._cronoSyncStore = new Map();
}

/**
 * Resolves Redis REST API configuration from environment variables.
 * Supports Upstash Redis Integration, Vercel KV, and generic Redis REST variables.
 */
function getRedisConfig() {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.REDIS_REST_URL ||
    process.env.KV_URL ||
    process.env.REDIS_URL ||
    ''
  ).trim();

  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.REDIS_REST_TOKEN ||
    process.env.KV_REST_API_READ_ONLY_TOKEN ||
    ''
  ).trim();

  return { url, token, isConfigured: Boolean(url && token) };
}

/**
 * Safely parses data returned from Redis or local store,
 * handling double-encoded strings from earlier versions.
 */
function parseStoredValue(raw) {
  if (raw === null || raw === undefined) return null;
  let parsed = raw;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return parsed;
    }
  }
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      // keep parsed as string if not JSON
    }
  }
  return parsed;
}

/**
 * Executes a raw Redis REST command against Upstash or Vercel KV.
 */
async function executeRedisCommand(url, token, commandArray) {
  const cleanUrl = url.replace(/\/+$/, '');
  const res = await fetch(cleanUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commandArray)
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Redis REST request failed [${res.status}]: ${errorText || res.statusText}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`Redis error: ${json.error}`);
  }
  return json.result;
}

/**
 * Tests active Redis connectivity.
 */
async function testRedisConnection(url, token) {
  try {
    const result = await executeRedisCommand(url, token, ['PING']);
    return { ok: true, result };
  } catch (err) {
    // Fallback: try GET endpoint
    try {
      const cleanUrl = url.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/get/__crono_ping__`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) return { ok: true, result: 'PONG' };
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    } catch (fallbackErr) {
      return { ok: false, error: err.message || fallbackErr.message };
    }
  }
}

/**
 * Retrieves data from Redis or in-memory fallback.
 */
async function getFromKV(key) {
  const { url, token, isConfigured } = getRedisConfig();
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (isConfigured) {
    try {
      const result = await executeRedisCommand(url, token, ['GET', key]);
      return parseStoredValue(result);
    } catch (err) {
      // Try path-based REST fallback
      const cleanUrl = url.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        return parseStoredValue(json.result);
      }
      throw err;
    }
  }

  if (isProduction) {
    throw new Error(
      'Redis database is not configured in Vercel. Missing UPSTASH_REDIS_REST_URL / KV_REST_API_URL and token environment variables in project settings.'
    );
  }

  return globalThis._cronoSyncStore.get(key) || null;
}

/**
 * Saves data to Redis or in-memory fallback.
 */
async function setToKV(key, value) {
  const { url, token, isConfigured } = getRedisConfig();
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const serialized = JSON.stringify(value);

  if (isConfigured) {
    try {
      await executeRedisCommand(url, token, ['SET', key, serialized]);
      return true;
    } catch (err) {
      // Try path-based REST fallback
      const cleanUrl = url.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: serialized
      });
      if (res.ok) return true;
      throw err;
    }
  }

  if (isProduction) {
    throw new Error(
      'Redis database is not configured in Vercel. Missing UPSTASH_REDIS_REST_URL / KV_REST_API_URL and token environment variables in project settings.'
    );
  }

  globalThis._cronoSyncStore.set(key, value);
  return true;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header. Expected Bearer token matching your sync key.'
      });
    }

    const syncKey = authHeader.replace('Bearer ', '').trim();
    if (!syncKey || syncKey.length < 8) {
      return res.status(401).json({
        success: false,
        error: 'Invalid sync key format. Key must be at least 8 characters long.'
      });
    }

    // Health check / ping test
    if (req.query?.action === 'ping' || req.body?.action === 'ping') {
      const redisConfig = getRedisConfig();
      if (redisConfig.isConfigured) {
        const pingTest = await testRedisConnection(redisConfig.url, redisConfig.token);
        if (!pingTest.ok) {
          return res.status(502).json({
            success: false,
            error: `Redis connection error: ${pingTest.error}`,
            provider: 'Redis (Error)'
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Vercel sync endpoint active and connected to Redis database.',
          provider: 'Redis (Online)'
        });
      }

      if (isProduction) {
        return res.status(503).json({
          success: false,
          error: 'Redis database is not configured in Vercel. Missing UPSTASH_REDIS_REST_URL / KV_REST_API_URL environment variables in project settings.',
          provider: 'None (Missing Env Vars)'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Local development in-memory sync active (ephemeral).',
        provider: 'In-Memory (Dev)'
      });
    }

    // Metadata check (timestamp and counts)
    if (req.query?.action === 'metadata') {
      const data = await getFromKV(syncKey);
      if (!data) {
        return res.status(404).json({ success: false, error: 'No synced data found for this key.' });
      }
      return res.status(200).json({
        success: true,
        _synced_at: data._synced_at || null,
        taskCount: Array.isArray(data.tasks) ? data.tasks.length : 0,
        tagCount: Array.isArray(data.tags) ? data.tags.length : 0
      });
    }

    // PULL Data (GET)
    if (req.method === 'GET') {
      const data = await getFromKV(syncKey);
      if (!data) {
        return res.status(404).json({ success: false, error: 'No synced data found for this key.' });
      }
      return res.status(200).json({ success: true, data });
    }

    // PUSH Data (POST)
    if (req.method === 'POST') {
      const body = req.body;
      const dataToStore = typeof body === 'string' ? JSON.parse(body) : body;

      if (!dataToStore || typeof dataToStore !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid payload: expected object.' });
      }

      const syncTimestamp = new Date().toISOString();
      await setToKV(syncKey, {
        ...dataToStore,
        _synced_at: syncTimestamp
      });

      return res.status(200).json({
        success: true,
        message: 'Data synced successfully to Redis.',
        _synced_at: syncTimestamp
      });
    }

    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed.` });
  } catch (err) {
    console.error('Vercel sync handler error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
}
