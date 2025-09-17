// pages/api/verify-session.js
import { parse } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookieHeader = req.headers.cookie;
    
    if (!cookieHeader) {
      return res.status(401).json({ authenticated: false });
    }

    const cookies = parse(cookieHeader);
    const sessionString = cookies.sessionid;
    
    if (!sessionString) {
      return res.status(401).json({ authenticated: false });
    }

    // The cookie library automatically URL-decodes values
    const sessionData = JSON.parse(sessionString);
    
    if (sessionData.accessToken && sessionData.loginTime) {
      // Check if session is not expired
      const sessionAge = Date.now() - sessionData.loginTime;
      const maxAge = 60 * 60 * 24 * 7 * 1000; // 7 days
      
      if (sessionAge > maxAge) {
        return res.status(401).json({ authenticated: false, reason: 'Session expired' });
      }
      
      return res.status(200).json({ 
        authenticated: true,
        user: { 
          email: 'shaswat.madridista@gmail.com', // Extract from JWT if needed
          accessToken: sessionData.accessToken 
        }
      });
    } else {
      return res.status(401).json({ authenticated: false });
    }
    
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(401).json({ authenticated: false });
  }
}
