// pages/api/login.js
import { SignJWT } from 'jose';
import cookie from 'cookie';

const isProd = process.env.NODE_ENV === 'production';

function setSessionCookie(res, accessToken) {
  const payload = { accessToken, loginTime: Date.now() };
  const value = encodeURIComponent(JSON.stringify(payload));

  res.setHeader('Set-Cookie', cookie.serialize('sessionid', value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 1 day
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  // Replace with real DB check
  if (email !== 'test@example.com' || password !== 'secret') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  setSessionCookie(res, token);
  return res.status(200).json({ ok: true });
}
