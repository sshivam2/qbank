// pages/api/set-session.js
// Call this after successful authentication to set cookie server-side.
import cookie from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { accessToken } = req.body || {};
  if (!accessToken) return res.status(400).json({ error: 'Missing accessToken' });

  const payload = {
    accessToken,
    loginTime: Date.now()
  };

  const value = encodeURIComponent(JSON.stringify(payload));
  const isProd = process.env.NODE_ENV === 'production';

  const cookieHeader = cookie.serialize('sessionid', value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days; adjust as needed
  });

  res.setHeader('Set-Cookie', cookieHeader);
  return res.status(200).json({ ok: true });
}
