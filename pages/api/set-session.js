// pages/api/set-session.js
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed')
  const { access_token } = req.body || {}
  if (!access_token) return res.status(400).json({ error: 'Missing access_token' })

  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${access_token}`, apikey: process.env.SUPABASE_ANON_KEY }
    })
    if (!r.ok) {
      const txt = await r.text()
      return res.status(401).send(`Token invalid: ${txt}`)
    }
  } catch (e) {
    return res.status(502).send('Auth verification failed')
  }

  const maxAge = 60 * 60
  res.setHeader('Set-Cookie', cookie.serialize('sb-access-token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
    sameSite: 'lax'
  }))
  res.status(200).json({ ok: true })
}
