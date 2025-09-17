// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

async function verifyJWT(token) {
  try {
    // load secret key from env (must be the same you use to sign JWTs)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: process.env.JWT_ISSUER,   // optional
      audience: process.env.JWT_AUDIENCE // optional
    });
    return payload;
  } catch (err) {
    console.error('JWT verify failed:', err.message);
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/' || pathname === '/index.html') {
    const raw = request.cookies.get('sessionid')?.value;
    if (!raw) return NextResponse.redirect(new URL('/login.html', request.url));

    let cookieValue = raw;
    try { cookieValue = decodeURIComponent(raw); } catch {}
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) cookieValue = cookieValue.slice(1,-1);

    // If cookie is JSON { accessToken }
    const parsed = safeJsonParse(cookieValue);
    if (parsed?.accessToken) {
      const verified = await verifyJWT(parsed.accessToken);
      if (!verified) return NextResponse.redirect(new URL('/login.html', request.url));
      return NextResponse.next();
    }

    // If cookie is a JWT string itself
    if (typeof cookieValue === 'string' && cookieValue.split('.').length === 3) {
      const verified = await verifyJWT(cookieValue);
      if (!verified) return NextResponse.redirect(new URL('/login.html', request.url));
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login.html', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/', '/index.html'] };
