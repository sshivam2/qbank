// pages/api/set-session.js
// Functions related to session management for login

import { serialize, parse } from 'cookie';

const sessionCookieName = 'sessionid';

export async function setSession(res, sessionData) {
  try {
    const cookie = serialize(sessionCookieName, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    res.setHeader('Set-Cookie', cookie);
    return true;
  } catch (error) {
    console.error('Error setting session cookie:', error);
    return false;
  }
}

export async function getSession(req) {
  try {
    // Handle different request object types
    let cookieHeader;
    
    if (req.headers?.get) {
      cookieHeader = req.headers.get('cookie');
    } else if (req.headers?.cookie) {
      cookieHeader = req.headers.cookie;
    }

    if (!cookieHeader) return null;

    const cookies = parse(cookieHeader);
    const sessionString = cookies[sessionCookieName];
    if (!sessionString) return null;

    const sessionData = JSON.parse(sessionString);
    return sessionData;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export function clearSession(res) {
  try {
    const cookie = serialize(sessionCookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // Expire immediately
    });
    res.setHeader('Set-Cookie', cookie);
    return true;
  } catch (error) {
    console.error('Error clearing session cookie:', error);
    return false;
  }
}

// ADD THIS: Default export to handle HTTP requests
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Create session data with the Supabase access token
    const sessionData = {
      accessToken: access_token,
      loginTime: Date.now(),
    };

    // Set the session cookie
    const success = await setSession(res, sessionData);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to set session' });
    }

    return res.status(200).json({ success: true, message: 'Session set successfully' });

  } catch (error) {
    console.error('Set session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
