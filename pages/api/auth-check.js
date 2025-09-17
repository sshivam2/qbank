// pages/api/auth-check.js
// Pages-router API that validates the cookie and returns session info.
import cookie from 'cookie';

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
function base64UrlDecode(input) {
  if (!input || typeof input !== 'string') return null;
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad) input += '='.repeat(4 - pad);
  try { return Buffer.from(input, 'base64').toString('utf8'); } catch { return null; }
}
function jwtIsExpired(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const payload = base64UrlDecode(parts[1]);
  if (!payload) return false;
  try { const obj = JSON.parse(payload); return !!obj.exp && Math.floor(Date.now() / 1000) >= obj.exp; } catch { return false; }
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const header = req.headers.cookie || '';
  const cookies = cookie.parse(header || '');
  const raw = cookies.sessionid;

  if (!raw) return res.status(401).json({ authenticated: false });

  let val = raw;
  try { val = decodeURIComponent(raw); } catch {}
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);

  const parsed = safeJsonParse(val);
  if (parsed && parsed.accessToken) {
    if (jwtIsExpired(parsed.accessToken)) return res.status(401).json({ authenticated: false });
    return res.status(200).json({ authenticated: true, session: parsed });
  }

  // If cookie itself is a JWT
  if (typeof val === 'string' && val.split('.').length === 3) {
    if (jwtIsExpired(val)) return res.status(401).json({ authenticated: false });
    return res.status(200).json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false });
}
