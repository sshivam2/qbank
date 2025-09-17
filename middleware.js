// middleware.js
// Next.js middleware for protecting routes (Edge Runtime compatible)

import { NextResponse } from 'next/server';

const sessionCookieName = 'sessionid';

// Edge Runtime compatible session parsing
function getSessionFromRequest(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    // Parse cookies manually (Edge Runtime compatible)
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const [key, ...valueParts] = cookie.trim().split('=');
      if (key && valueParts.length > 0) {
        cookies[key] = decodeURIComponent(valueParts.join('='));
      }
    });

    const sessionString = cookies[sessionCookieName];
    if (!sessionString) return null;

    const sessionData = JSON.parse(sessionString);
    
    // Basic session validation
    if (!sessionData.userId || !sessionData.loginTime) {
      return null;
    }

    // Check if session is expired (7 days)
    const sessionAge = Date.now() - sessionData.loginTime;
    const maxAge = 60 * 60 * 24 * 7 * 1000; // 7 days in milliseconds
    
    if (sessionAge > maxAge) {
      return null; // Session expired
    }

    return sessionData;
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
}

export async function middleware(request) {
  try {
    const { pathname } = request.nextUrl;

    // Skip authentication for public routes
    const publicPaths = [
      '/login',
      '/register', 
      '/api/login',
      '/api/register',
      '/_next',
      '/favicon.ico',
      '/public'
    ];

    // Check if current path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Check authentication for protected routes
    const session = getSessionFromRequest(request);
    
    if (!session) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Add session data to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-username', session.username);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });

  } catch (error) {
    console.error('Middleware error:', error);
    // Redirect to login on any error
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
