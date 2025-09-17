// middleware.js — runs at the edge in Next.js on Vercel
import { NextResponse } from 'next/server'

export function middleware(req) {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // allow public and API and static assets
  if (
    pathname.startsWith('/login.html') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // serve files like .js, .css, images
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('sb-access-token')?.value
  if (!token) {
    url.pathname = '/login.html'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
