// middleware.js
// Ultra-minimal middleware to avoid Edge Runtime issues

import { NextResponse } from 'next/server';

export async function middleware(request) {
  try {
    const { pathname } = request.nextUrl;

    // Skip middleware entirely for these paths
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname === '/login.html' ||
      pathname === '/favicon.ico' ||
      pathname === '/bg.webp'
    ) {
      return NextResponse.next();
    }

    // Only protect root and index.html
    if (pathname === '/' || pathname === '/index.html') {
      const cookieHeader = request.headers.get('cookie');
      
      // Simple string check - no parsing
      if (!cookieHeader || !cookieHeader.includes('sessionid=')) {
        return NextResponse.redirect(new URL('/login.html', request.url));
      }
    }

    return NextResponse.next();

  } catch (error) {
    // Redirect to login on any error
    return NextResponse.redirect(new URL('/login.html', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
