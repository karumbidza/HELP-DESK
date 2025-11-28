import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test database connection and check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec', { 
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        ` 
      })

    if (tablesError) {
      console.error('Error checking tables:', tablesError)
    }

    // Check if we can access the organizations table
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5)

    // Check if we can access the profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(5)

    return NextResponse.json({
      message: 'Database connection test',
      tables_query_error: tablesError?.message || null,
      tables_data: tables || null,
      organizations_error: orgsError?.message || null,
      organizations_count: orgs?.length || 0,
      profiles_error: profilesError?.message || null,
      profiles_count: profiles?.length || 0,
      current_user: await supabase.auth.getUser()
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}