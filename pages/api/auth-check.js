// auth-check.js
// Middleware function checks if user is authenticated
// Checks session cookie and validates user

import { getSession } from './set-session.js';

export async function authCheck(req) {
  try {
    // Supports both Node.js and Web API request objects
    const session = await getSession(req);
    if (!session) {
      return { authenticated: false, message: 'User not authenticated' };
    }
    // Additional checks can be added here (token expiry, user validation, etc.)
    return { authenticated: true, session };
  } catch (error) {
    console.error('Auth check error:', error);
    return { authenticated: false, message: error.message };
  }
}
