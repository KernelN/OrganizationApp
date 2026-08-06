/**
 * Vercel Serverless Function: /api/sync
 * 
 * Handles push (POST) and pull (GET) requests for Cronograma user data.
 * Authenticates via HTTP Bearer token matching the user's secret sync_key.
 * Uses @vercel/kv REST API if environment variables exist, otherwise falls back to memory store.
 */

// Fallback Vercel KV / Upstash credentials if environment variables are not set in Vercel UI
const DEFAULT_KV_REST_API_URL = '';
const DEFAULT_KV_REST_API_TOKEN = '';

// Global in-memory fallback for local development / testing without Vercel KV
if (!globalThis._cronoSyncStore) {
  globalThis._cronoSyncStore = new Map();
}

async function getFromKV(key) {
  const kvUrl = process.env.KV_REST_API_URL || DEFAULT_KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || DEFAULT_KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    const res = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result ? JSON.parse(json.result) : null;
  }

  return globalThis._cronoSyncStore.get(key) || null;
}

async function setToKV(key, value) {
  const kvUrl = process.env.KV_REST_API_URL || DEFAULT_KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || DEFAULT_KV_REST_API_TOKEN;

  const stringified = JSON.stringify(value);

  if (kvUrl && kvToken) {
    const res = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stringified)
    });
    if (!res.ok) {
      throw new Error(`Vercel KV write failed with status ${res.status}`);
    }
    return true;
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

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header. Expected Bearer token.' });
    }

    const syncKey = authHeader.replace('Bearer ', '').trim();
    if (!syncKey || syncKey.length < 8) {
      return res.status(401).json({ success: false, error: 'Invalid sync key format.' });
    }

    // Health check / ping test
    if (req.query?.action === 'ping' || req.body?.action === 'ping') {
      return res.status(200).json({ success: true, message: 'Vercel sync endpoint active and authenticated.' });
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

      await setToKV(syncKey, {
        ...dataToStore,
        _synced_at: new Date().toISOString()
      });

      return res.status(200).json({ success: true, message: 'Data synced successfully.' });
    }

    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed.` });
  } catch (err) {
    console.error('Vercel sync handler error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
