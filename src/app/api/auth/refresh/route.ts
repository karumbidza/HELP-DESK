import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  // Force refresh the session
  const { error } = await supabase.auth.refreshSession()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Add cache busting headers
  const response = NextResponse.redirect(new URL('/dashboard?refresh=' + Date.now(), process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}
