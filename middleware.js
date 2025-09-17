// middleware.js
import { NextResponse } from 'next/server';
console.log('req.cookies entries:', [...request.cookies.entries()]);
console.log('sessionid raw:', request.cookies.get('sessionid')?.value);


function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function base64UrlDecode(input) {
  // pad, replace URL-safe chars then use atob (available in Edge)
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad) input += '='.repeat(4 - pad);
  try { return atob(input); } catch { return null; }
}

function jwtIsExpired(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return false; // not a JWT, treat as non-expiring here
  const payload = base64UrlDecode(parts[1]);
  if (!payload) return false;
  try {
    const obj = JSON.parse(payload);
    if (!obj.exp) return false;
    // exp is seconds since epoch
    return Math.floor(Date.now() / 1000) >= obj.exp;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/' || pathname === '/index.html') {
    // use Next's cookie API (auto-decoded)
    const raw = request.cookies.get('sessionid')?.value;

    if (!raw) {
      return NextResponse.redirect(new URL('/login.html', request.url));
    }

    // Try common cases:
    // 1) JSON string containing accessToken
    // 2) Raw JWT string
    // 3) URL-encoded JSON or token (cookie API usually decodes, but safe)
    let cookieValue = raw;
    try { cookieValue = decodeURIComponent(raw); } catch {}

    // Strip optional surrounding quotes
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }

    // Case A: JSON object
    const parsed = safeJsonParse(cookieValue);
    if (parsed) {
      if (!parsed.accessToken) {
        return NextResponse.redirect(new URL('/login.html', request.url));
      }
      // If it's a JWT inside JSON, check expiry
      if (typeof parsed.accessToken === 'string' && jwtIsExpired(parsed.accessToken)) {
        return NextResponse.redirect(new URL('/login.html', request.url));
      }
      return NextResponse.next();
    }

    // Case B: cookieValue is a JWT directly
    if (typeof cookieValue === 'string' && cookieValue.split('.').length === 3) {
      if (jwtIsExpired(cookieValue)) {
        return NextResponse.redirect(new URL('/login.html', request.url));
      }
      return NextResponse.next();
    }

    // Case C: fallback token sanity check
    if (typeof cookieValue === 'string' && cookieValue.length >= 10) {
      return NextResponse.next();
    }

    // invalid otherwise
    return NextResponse.redirect(new URL('/login.html', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/', '/index.html'] };
