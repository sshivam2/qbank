// pages/api/set-session.js (Node Serverless function)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  let body = {}
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).send('Bad JSON')
  }

  const token = body?.access_token
  if (!token) return res.status(400).send('Missing access_token')

  // set HttpOnly cookie for 1 hour
  const maxAge = 60 * 60
  res.setHeader(
    'Set-Cookie',
    `sb-access-token=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`
  )

  res.status(200).json({ ok: true })
}
