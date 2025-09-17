// pages/api/auth-check.js
export default async function handler(req, res) {
  const cookieHeader = req.headers.cookie || ''
  const m = cookieHeader.match(/sb-access-token=([^;]+)/)
  const token = m ? m[1] : null
  if (!token) return res.status(401).json({ ok: false })

  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY }
    })
    if (!r.ok) return res.status(401).json({ ok: false })
    const user = await r.json()
    return res.status(200).json({ ok: true, user })
  } catch (e) {
    return res.status(502).json({ ok: false })
  }
}
