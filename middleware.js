// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname === '/' || pathname === '/index.html') {
    const cookies = request.headers.get('cookie') || '';
    if (!cookies.includes('sessionid')) {
      return NextResponse.redirect(new URL('/login.html', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/index.html'],
};
