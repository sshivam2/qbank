// middleware.js
// Edge Runtime compatible middleware (no external imports)

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
    if (!sessionData.accessToken || !sessionData.loginTime) {
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
      '/login.html',
      '/api/set-session',
      '/api/login',
      '/api/register',
      '/api/logout',
      '/_next',
      '/favicon.ico',
      '/bg.webp'
    ];

    // Check if current path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    
    if (isPublicPath) {
      return NextResponse.next();
    }

    // For the root path /, allow access but check session for user info
    if (pathname === '/') {
      const session = getSessionFromRequest(request);
      
      if (session) {
        // Add user info to headers for API routes to use
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-authenticated', 'true');
        requestHeaders.set('x-access-token', session.accessToken);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          }
        });
      }
      
      // No session, redirect to login
      const loginUrl = new URL('/login.html', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // For all other routes, check authentication
    const session = getSessionFromRequest(request);
    
    if (!session) {
      // Redirect to login page
      const loginUrl = new URL('/login.html', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Add session data to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-authenticated', 'true');
    requestHeaders.set('x-access-token', session.accessToken);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });

  } catch (error) {
    console.error('Middleware error:', error);
    // Redirect to login on any error
    const loginUrl = new URL('/login.html', request.url);
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
