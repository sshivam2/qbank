// api/create-user.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret !== process.env.ADMIN_SECRET) return res.status(401).send('Unauthorized');

  const { email, password, full_name, role, sendReset } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: { full_name, role },
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });

    if (sendReset) {
      await fetch(`${process.env.SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    }

    res.status(200).json({ user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
