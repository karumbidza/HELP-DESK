import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== FORCE CREATE SUPER ADMIN API ===')
    
    const supabase = await createClient()
    
    // Force create the super admin user directly
    const adminEmail = 'admin@helpdesk.com'
    const adminPassword = 'admin123456'
    const adminName = 'Super Administrator'

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: adminName
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({ 
        error: 'Failed to create auth user', 
        details: authError.message 
      }, { status: 500 })
    }

    console.log('Auth user created:', authData.user?.id)

    // Create the profile with super_admin role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        full_name: adminName,
        role: 'super_admin',
        organization_id: null // Super admin has no organization
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // Try to clean up the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json({ 
        error: 'Failed to create profile', 
        details: profileError.message 
      }, { status: 500 })
    }

    console.log('Profile created:', profileData)

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully!',
      credentials: {
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin'
      },
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: adminName
      }
    })

  } catch (error) {
    console.error('Force create super admin error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check current super admins
    const { data: superAdmins, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'super_admin')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      super_admin_exists: (superAdmins?.length || 0) > 0,
      super_admins: superAdmins || [],
      count: superAdmins?.length || 0
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check super admins',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}