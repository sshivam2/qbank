// middleware.js (production-safe)
import { NextResponse } from 'next/server';

function safeJsonParse(s){ try{ return JSON.parse(s); }catch{return null;} }
function base64UrlDecode(input){
  if(!input||typeof input!=='string')return null;
  input=input.replace(/-/g,'+').replace(/_/g,'/');
  const pad=input.length%4; if(pad) input+='='.repeat(4-pad);
  try{ if(typeof globalThis.atob==='function') return globalThis.atob(input); return Buffer.from(input,'base64').toString('utf8'); }catch{return null;}
}
function jwtIsExpired(token){
  if(!token||typeof token!=='string') return false;
  const parts=token.split('.'); if(parts.length!==3) return false;
  const payload=base64UrlDecode(parts[1]); if(!payload) return false;
  try{ const obj=JSON.parse(payload); return !!obj.exp && Math.floor(Date.now()/1000) >= obj.exp; }catch{return false;}
}

export async function middleware(request){
  const { pathname } = request.nextUrl;

  if (pathname === '/' || pathname === '/index.html') {
    const raw = request.cookies.get('sessionid')?.value;
    if (!raw) return NextResponse.redirect(new URL('/login.html', request.url));

    let cookieValue = raw;
    try { cookieValue = decodeURIComponent(raw); } catch {}
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) cookieValue = cookieValue.slice(1,-1);

    const parsed = safeJsonParse(cookieValue);
    if (parsed) {
      if (!parsed.accessToken) return NextResponse.redirect(new URL('/login.html', request.url));
      if (typeof parsed.accessToken === 'string' && jwtIsExpired(parsed.accessToken)) return NextResponse.redirect(new URL('/login.html', request.url));
      return NextResponse.next();
    }

    if (typeof cookieValue === 'string' && cookieValue.split('.').length === 3) {
      if (jwtIsExpired(cookieValue)) return NextResponse.redirect(new URL('/login.html', request.url));
      return NextResponse.next();
    }

    if (typeof cookieValue === 'string' && cookieValue.length >= 10) return NextResponse.next();

    return NextResponse.redirect(new URL('/login.html', request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ['/', '/index.html'] };
