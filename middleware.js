// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  console.log('Middleware started for:', request.nextUrl.pathname);
  
  try {
    const pathname = request.nextUrl.pathname;
    console.log('Processing pathname:', pathname);
    
    if (pathname === '/' || pathname === '/index.html') {
      console.log('Checking cookies for protected route');
      
      const cookies = request.headers.get('cookie') || '';
      console.log('Cookie header:', cookies ? 'present' : 'missing');
      
      if (!cookies.includes('sessionid')) {
        console.log('No session cookie, redirecting to login');
        return NextResponse.redirect(new URL('/login.html', request.url));
      }
      
      console.log('Session cookie found, allowing access');
    }
    
    console.log('Middleware completed successfully');
    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    console.error('Error stack:', error.stack);
    // Return a simple response instead of crashing
    return NextResponse.redirect(new URL('/login.html', request.url));
  }
}

export const config = {
  matcher: ['/', '/index.html'],
};
