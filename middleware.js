// middleware.js (root)
export const config = {
  matcher: [
    /*
      protect everything except static assets and the login page:
      adjust the patterns to fit your structure
    */
    '/((?!login\\.html|_next|api|favicon.ico|static).*)',
  ],
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON) {
  // Ensure build fails early if env not set
  console.warn('Missing SUPABASE_URL or SUPABASE_ANON_KEY env var')
}

export default async function middleware(req) {
  try {
    // read cookie sb-access-token
    const cookie = req.headers.get('cookie') || ''
    // simple parse for sb-access-token
    const match = cookie.match(/sb-access-token=([^;]+)/)
    const token = match ? decodeURIComponent(match[1]) : null

    // If no token -> redirect to login
    if (!token) {
      return Response.redirect(new URL('/login.html', req.url))
    }

    // Verify token with Supabase auth user endpoint
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON,
      },
    })

    if (!resp.ok) {
      // invalid token -> redirect to login
      return Response.redirect(new URL('/login.html', req.url))
    }

    // token valid -> continue
    return new Response(null, { status: 204 })
  } catch (err) {
    // On any error, fail closed and redirect to login
    console.error('Middleware auth error:', err)
    return Response.redirect(new URL('/login.html', req.url))
  }
}
