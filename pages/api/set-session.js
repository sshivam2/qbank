// pages/api/set-session.js
import { serialize } from 'cookie';

const sessionCookieName = 'sessionid'; // Make sure this matches middleware

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const sessionData = {
      accessToken: access_token,
      loginTime: Date.now(),
    };

    // Create cookie with exact name middleware expects
    const cookie = serialize(sessionCookieName, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Ensure path is root
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true, message: 'Session set successfully' });

  } catch (error) {
    console.error('Set session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
