import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  // Force refresh the session
  const { error } = await supabase.auth.refreshSession()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
