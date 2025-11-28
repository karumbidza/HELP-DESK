import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { email, password, full_name } = await request.json()

    // Basic validation
    if (!email || !password || !full_name) {
      return NextResponse.json({
        error: 'Email, password, and full_name are required'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        error: 'Password must be at least 6 characters'
      }, { status: 400 })
    }

    // Check if a super admin already exists
    const { data: existingSuperAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1)

    if (existingSuperAdmin && existingSuperAdmin.length > 0) {
      return NextResponse.json({
        error: 'Super admin already exists'
      }, { status: 400 })
    }

    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({
        error: 'Failed to create super admin account',
        details: authError.message
      }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({
        error: 'Failed to create user'
      }, { status: 500 })
    }

    // Create the super admin profile (no organization needed)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name,
        role: 'super_admin',
        organization_id: null // Super admin doesn't belong to any organization
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      // Try to cleanup the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json({
        error: 'Failed to create super admin profile',
        details: profileError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Super admin created successfully',
      super_admin: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Super admin creation error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check if super admin exists
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: superAdmins, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('role', 'super_admin')

    if (error) {
      return NextResponse.json({
        error: 'Failed to check super admin status'
      }, { status: 500 })
    }

    return NextResponse.json({
      exists: (superAdmins?.length || 0) > 0,
      count: superAdmins?.length || 0,
      super_admins: superAdmins || []
    })

  } catch (error) {
    console.error('Error checking super admin:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}