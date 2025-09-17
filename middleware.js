// middleware.js
// Next.js middleware for protecting routes

import { NextResponse } from 'next/server';
import { authCheck } from './auth-check.js';

export async function middleware(request) {
  try {
    // Skip authentication for public routes
    const publicRoutes = ['/login', '/register', '/api/login', '/api/register'];
    const { pathname } = request.nextUrl;

    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check authentication for protected routes
    const authResult = await authCheck(request);
    
    if (!authResult.authenticated) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
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
