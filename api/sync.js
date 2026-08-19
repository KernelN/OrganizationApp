import Redis from 'ioredis';

/**
 * Vercel Serverless Function: /api/sync
 * 
 * Handles push (POST) and pull (GET) requests for Cronograma user data.
 * Authenticates via HTTP Bearer token matching the user's secret sync_key.
 * Connects natively to Redis Cloud (cloud.redis.io) / Redis TCP via ioredis.
 */

// Global in-memory fallback for local development / testing without Redis
if (!globalThis._cronoSyncStore) {
  globalThis._cronoSyncStore = new Map();
}

let redisClient = null;

/**
 * Resolves or initializes the singleton ioredis client.
 */
function getRedisClient() {
  const redisUrl = (
    process.env.REDIS_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_URL ||
    ''
  ).trim();

  if (!redisUrl) return null;

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 100, 2000);
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });
  }

  return redisClient;
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
 * Tests active Redis connectivity using PING.
 */
async function testRedisConnection() {
  const client = getRedisClient();
  if (!client) {
    return { ok: false, error: 'No REDIS_URL configured' };
  }
  try {
    const pong = await client.ping();
    return { ok: true, result: pong };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Retrieves data from Redis Cloud or in-memory fallback.
 */
async function getFromKV(key) {
  const client = getRedisClient();
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  if (client) {
    const raw = await client.get(key);
    return parseStoredValue(raw);
  }

  if (isProduction) {
    throw new Error(
      'Redis database is not configured in Vercel. Missing REDIS_URL environment variable in project settings.'
    );
  }

  return globalThis._cronoSyncStore.get(key) || null;
}

/**
 * Saves data to Redis Cloud or in-memory fallback.
 */
async function setToKV(key, value) {
  const client = getRedisClient();
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const serialized = JSON.stringify(value);

  if (client) {
    await client.set(key, serialized);
    return true;
  }

  if (isProduction) {
    throw new Error(
      'Redis database is not configured in Vercel. Missing REDIS_URL environment variable in project settings.'
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
      const client = getRedisClient();
      if (client) {
        const pingTest = await testRedisConnection();
        if (!pingTest.ok) {
          return res.status(502).json({
            success: false,
            error: `Redis connection error: ${pingTest.error}`,
            provider: 'Redis (Error)'
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Vercel sync endpoint active and connected to Redis Cloud database.',
          provider: 'Redis Cloud (Online)'
        });
      }

      if (isProduction) {
        return res.status(503).json({
          success: false,
          error: 'Redis database is not configured in Vercel. Missing REDIS_URL environment variable in project settings.',
          provider: 'None (Missing REDIS_URL)'
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
        message: 'Data synced successfully to Redis Cloud.',
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
