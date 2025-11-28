import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  // Nuclear session reset
  await supabase.auth.signOut({ scope: 'global' })

  const response = NextResponse.redirect(new URL('/login?reset=1', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  
  // Nuclear cache clearing headers
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage", "executionContexts"')
  
  // Clear all cookies
  response.cookies.set('sb-access-token', '', { expires: new Date(0) })
  response.cookies.set('sb-refresh-token', '', { expires: new Date(0) })
  response.cookies.set('supabase-auth-token', '', { expires: new Date(0) })

  return response
}

export async function GET() {
  return POST() // Allow GET requests too
}