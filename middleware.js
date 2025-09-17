// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // Add extensive logging
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Pathname:', pathname);
  console.log('Full URL:', request.url);
  
  if (pathname === '/' || pathname === '/index.html') {
    const cookieHeader = request.headers.get('cookie');
    console.log('Raw cookie header:', cookieHeader);
    
    if (!cookieHeader) {
      console.log('❌ No cookie header found - redirecting to login');
      return NextResponse.redirect(new URL('/login.html', request.url));
    }
    
    // Parse and log all cookies
    const cookies = {};
    cookieHeader.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookies[key] = value;
      }
    });
    
    console.log('Parsed cookies:', cookies);
    console.log('sessionid exists:', !!cookies.sessionid);
    console.log('sessionid value:', cookies.sessionid);
    
    if (!cookies.sessionid || cookies.sessionid === 'undefined') {
      console.log('❌ No valid sessionid - redirecting to login');
      return NextResponse.redirect(new URL('/login.html', request.url));
    }
    
    console.log('✅ Valid session found - allowing access');
  }
  
  console.log('=== END MIDDLEWARE DEBUG ===');
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/index.html'],
};
