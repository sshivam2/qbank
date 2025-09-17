// middleware.js
// Completely disabled middleware for testing

import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Do nothing - just pass through all requests
  return NextResponse.next();
}

// Empty matcher = middleware doesn't run on any routes
export const config = {
  matcher: [],
};
