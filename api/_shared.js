// Shared helpers for the serverless endpoints (files starting with "_" are not routes on Vercel).

// Sites allowed to call the API from the browser.
const ALLOWED = [
  /^https:\/\/hemasamir\.github\.io$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];
const extra = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);

export function cors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED.some((re) => re.test(origin)) || extra.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return true; }
  return false;
}

// Best-effort per-instance rate limit (protects the API bill from simple abuse).
const hits = new Map();
export function rateLimited(req, limit = 20, windowMs = 10 * 60 * 1000) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'anon').split(',')[0].trim();
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > limit;
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

export const clip = (s, n) => String(s || '').slice(0, n);
