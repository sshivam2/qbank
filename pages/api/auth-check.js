// auth-check.js
// Server-side authentication check (not for middleware)

import { getSession } from './set-session.js';

export async function authCheck(req) {
  try {
    const session = await getSession(req);
    if (!session) {
      return { authenticated: false, message: 'User not authenticated' };
    }

    // Check session expiry
    const sessionAge = Date.now() - session.loginTime;
    const maxAge = 60 * 60 * 24 * 7 * 1000; // 7 days
    
    if (sessionAge > maxAge) {
      return { authenticated: false, message: 'Session expired' };
    }

    return { authenticated: true, session };
  } catch (error) {
    console.error('Auth check error:', error);
    return { authenticated: false, message: error.message };
  }
}

// Helper function to get user info from middleware headers
export function getUserFromHeaders(request) {
  const userId = request.headers.get('x-user-id');
  const username = request.headers.get('x-username');
  
  if (!userId) return null;
  
  return { userId, username };
}
