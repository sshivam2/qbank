// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname === '/' || pathname === '/index.html') {
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      return NextResponse.redirect(new URL('/login.html', request.url));
    }
    
    // Parse cookies with URL decoding
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const [key, ...valueParts] = cookie.trim().split('=');
      if (key && valueParts.length > 0) {
        // URL decode the cookie value
        cookies[key] = decodeURIComponent(valueParts.join('='));
      }
    });
    
    if (!cookies.sessionid) {
      return NextResponse.redirect(new URL('/login.html', request.url));
    }
    
    // Try to parse the JSON to make sure it's valid
    try {
      const sessionData = JSON.parse(cookies.sessionid);
      if (!sessionData.accessToken) {
        return NextResponse.redirect(new URL('/login.html', request.url));
      }
    } catch (error) {
      console.error('Cookie parsing error:', error);
      return NextResponse.redirect(new URL('/login.html', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/index.html'],
};
