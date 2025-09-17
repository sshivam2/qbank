// set-session.js  
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

    // Handle different response object types (Node.js vs Web API)
    if (res.setHeader) {
      // Node.js/Express style response
      res.setHeader('Set-Cookie', cookie);
    } else if (res.headers?.set) {
      // Web API Response style
      res.headers.set('Set-Cookie', cookie);
    } else if (res.cookies) {
      // Next.js cookies() function
      res.cookies.set(sessionCookieName, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

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
      // Web API Request object
      cookieHeader = req.headers.get('cookie');
    } else if (req.headers?.cookie) {
      // Node.js request object
      cookieHeader = req.headers.cookie;
    } else if (req.cookies) {
      // Express with cookie-parser
      return req.cookies[sessionCookieName] ? JSON.parse(req.cookies[sessionCookieName]) : null;
    }

    if (!cookieHeader) return null;

    // Parse cookies manually
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

    if (res.setHeader) {
      res.setHeader('Set-Cookie', cookie);
    } else if (res.headers?.set) {
      res.headers.set('Set-Cookie', cookie);
    }

    return true;
  } catch (error) {
    console.error('Error clearing session cookie:', error);
    return false;
  }
}
