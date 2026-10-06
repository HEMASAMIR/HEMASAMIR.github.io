// POST /api/lead  { source, lang, name?, summary }
// Sends an instant Telegram alert when a visitor uses the estimator, contact form or chat hand-off.
// Env (optional): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID. Without them this is a no-op that still returns ok.
import { cors, rateLimited, readBody, clip } from './_shared.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (rateLimited(req, 15)) return res.status(429).json({ error: 'rate_limited' });

  const body = await readBody(req);
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return res.status(200).json({ ok: true, delivered: false });

  const text = [
    `🔔 New lead — ${clip(body.source, 40) || 'website'}`,
    body.name ? `👤 ${clip(body.name, 80)}` : '',
    `🌐 ${body.lang === 'en' ? 'English' : 'عربي'}`,
    '',
    clip(body.summary, 3000),
  ].filter((l) => l !== '').join('\n');

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    return res.status(200).json({ ok: true, delivered: r.ok });
  } catch {
    return res.status(200).json({ ok: true, delivered: false });
  }
}
