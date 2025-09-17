// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/' || pathname === '/index.html') {
    // Preferred API to read cookies in Next middleware
    const cookie = request.cookies.get('sessionid')?.value;

    // If cookie missing -> redirect
    if (!cookie) return NextResponse.redirect(new URL('/login.html', request.url));

    // If cookie is a JSON string you control, parse it safely.
    // If it's a token/JWT, do not JSON.parse. Do a simple sanity check.
    try {
      // Example: if you expect JSON, validate; otherwise skip parse.
      if (cookie.startsWith('{') || cookie.startsWith('[')) {
        const sessionData = JSON.parse(cookie);
        if (!sessionData?.accessToken) {
          return NextResponse.redirect(new URL('/login.html', request.url));
        }
      } else {
        // token format sanity check: not empty and not too short
        if (typeof cookie !== 'string' || cookie.length < 10) {
          return NextResponse.redirect(new URL('/login.html', request.url));
        }
      }
    } catch (err) {
      // parsing failed -> treat as invalid
      return NextResponse.redirect(new URL('/login.html', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/index.html'],
};
