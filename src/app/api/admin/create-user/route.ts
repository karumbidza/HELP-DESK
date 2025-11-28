import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@/types/database.types'

interface CreateUserRequest {
  email: string
  password: string
  full_name: string
  role: UserRole
  organization_id?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current user profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user can create other users
    if (!['super_admin', 'org_admin'].includes(currentProfile.role)) {
      return NextResponse.json(
        { error: 'Only admins can create users' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: CreateUserRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.password || !body.full_name || !body.role) {
      return NextResponse.json(
        { error: 'Email, password, full_name, and role are required' },
        { status: 400 }
      )
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate role hierarchy
    if (currentProfile.role === 'org_admin') {
      // Org admins can only create users, contractors, and other org_admins in their organization
      if (!['user', 'contractor', 'org_admin'].includes(body.role)) {
        return NextResponse.json(
          { error: 'Organization admins can only create users, contractors, and other org admins' },
          { status: 403 }
        )
      }

      // Must specify organization_id or use current user's organization
      const targetOrgId = body.organization_id || currentProfile.organization_id
      
      if (targetOrgId !== currentProfile.organization_id) {
        return NextResponse.json(
          { error: 'Organization admins can only create users in their own organization' },
          { status: 403 }
        )
      }

      body.organization_id = targetOrgId
    } else if (currentProfile.role === 'super_admin') {
      // Super admins can create anyone
      if (body.role === 'super_admin') {
        return NextResponse.json(
          { error: 'Cannot create another super admin' },
          { status: 403 }
        )
      }

      // For org-level users, organization_id is required
      if (!['super_admin'].includes(body.role) && !body.organization_id) {
        return NextResponse.json(
          { error: 'organization_id is required for organization-level users' },
          { status: 400 }
        )
      }

      // Validate organization exists
      if (body.organization_id) {
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('id', body.organization_id)
          .single()

        if (orgError || !org) {
          return NextResponse.json(
            { error: 'Invalid organization' },
            { status: 400 }
          )
        }
      }
    }

    // Check if user with email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', body.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create the auth user
    const { data: authData, error: createAuthError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name,
        role: body.role
      }
    })

    if (createAuthError) {
      console.error('Auth creation error:', createAuthError)
      return NextResponse.json(
        { error: 'Failed to create user account', details: createAuthError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create the profile
    const { data: newProfile, error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: body.full_name,
        role: body.role,
        organization_id: body.organization_id || null
      })
      .select(`
        *,
        organization:organizations(id, name)
      `)
      .single()

    if (createProfileError) {
      console.error('Profile creation error:', createProfileError)
      // Cleanup auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Failed to create user profile', details: createProfileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.full_name,
        role: newProfile.role,
        organization: newProfile.organization,
        created_at: newProfile.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}