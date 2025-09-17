// pages/api/auth-check.js
import { getSession } from './set-session.js'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mxymburfwdjqrbhsqzod.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eW1idXJmd2RqcXJiaHNxem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzc0NDYsImV4cCI6MjA3MzYxMzQ0Nn0.9xRwH5la1vqpDsGKGif5zM8wnaVWJbDbA6ARrZfg5pU'

export async function authCheck(req) {
  try {
    const session = await getSession(req)
    if (!session || !session.accessToken) {
      return { authenticated: false, message: 'User not authenticated' }
    }

    // Verify the session with Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error } = await supabase.auth.getUser(session.accessToken)
    
    if (error || !user) {
      return { authenticated: false, message: 'Invalid session' }
    }

    return { 
      authenticated: true, 
      session: { ...session, user } 
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return { authenticated: false, message: error.message }
  }
}

// Helper function to get user info from middleware headers
export function getUserFromHeaders(request) {
  const userId = request.headers.get('x-user-id')
  const email = request.headers.get('x-user-email')
  
  if (!userId) return null
  
  return { userId, email }
}
