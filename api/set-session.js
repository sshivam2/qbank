// api/set-session.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { access_token } = req.body || {};
  if (!access_token) return res.status(400).json({ error: 'Missing access_token' });

  // Verify token with Supabase
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        apikey: process.env.SUPABASE_ANON_KEY,
      },
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(401).send(`Token invalid: ${txt}`);
    }
  } catch (err) {
    return res.status(502).send('Auth verification failed');
  }

  const maxAge = 60 * 60; // 1 hour
  const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  const cookie = `sb-access-token=${access_token}; HttpOnly; ${secureFlag}Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ ok: true });
}
