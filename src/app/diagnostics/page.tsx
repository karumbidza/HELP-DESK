'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  error: Error | null
}

interface ProfileData {
  id: string
  full_name: string
  role: string
  organization_id: string | null
  created_at: string
}

interface ProfileState {
  data: ProfileData | null
  error: Error | null
}

export default function DiagnosticsPage() {
  const [authState, setAuthState] = useState<AuthState | null>(null)
  const [profile, setProfile] = useState<ProfileState | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuthState = async () => {
    const supabase = createClient()
    
    // Check auth user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Auth User:', user)
    console.log('Auth Error:', userError)
    
    setAuthState({ user, error: userError })

    if (user) {
      // Check profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      console.log('Profile:', profileData)
      console.log('Profile Error:', profileError)
      
      setProfile({ data: profileData as ProfileData, error: profileError })
    }

    setLoading(false)
  }

  const login = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@test.com',
      password: 'admin123'
    })
    console.log('Login result:', { data, error })
    await checkAuthState()
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuthState(null)
    setProfile(null)
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Diagnostics</h1>

      <div className="space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkAuthState}>Refresh State</Button>
              <Button onClick={login} variant="outline">Test Login</Button>
              <Button onClick={logout} variant="destructive">Logout</Button>
            </div>
            <div className="flex gap-4">
              <Button asChild variant="secondary">
                <a href="/setup-super-admin">Setup Super Admin</a>
              </Button>
              <Button asChild variant="secondary">
                <a href="/login">Go to Login</a>
              </Button>
              <Button asChild variant="secondary">
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auth State */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            {authState?.user ? (
              <div className="space-y-2">
                <div><strong>User ID:</strong> {authState.user.id}</div>
                <div><strong>Email:</strong> {authState.user.email}</div>
                <div><strong>Created:</strong> {new Date(authState.user.created_at).toLocaleString()}</div>
                <Badge variant="default" className="bg-green-100 text-green-800">Authenticated</Badge>
              </div>
            ) : (
              <div>
                <Badge variant="destructive">Not Authenticated</Badge>
                {authState?.error && (
                  <p className="text-red-600 mt-2">Error: {authState.error.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile State */}
        <Card>
          <CardHeader>
            <CardTitle>Profile State</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.data ? (
              <div className="space-y-2">
                <div><strong>Full Name:</strong> {profile.data.full_name}</div>
                <div><strong>Role:</strong> {profile.data.role}</div>
                <div><strong>Organization ID:</strong> {profile.data.organization_id || 'NULL (Super Admin)'}</div>
                <div><strong>Created:</strong> {new Date(profile.data.created_at).toLocaleString()}</div>
                <Badge variant="default" className={`
                  ${profile.data.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : ''}
                  ${profile.data.role === 'org_admin' ? 'bg-blue-100 text-blue-800' : ''}
                  ${profile.data.role === 'user' ? 'bg-gray-100 text-gray-800' : ''}
                  ${profile.data.role === 'contractor' ? 'bg-orange-100 text-orange-800' : ''}
                `}>
                  {profile.data.role}
                </Badge>
              </div>
            ) : (
              <div>
                <Badge variant="destructive">No Profile Found</Badge>
                {profile?.error && (
                  <p className="text-red-600 mt-2">Error: {profile.error.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Role Access Levels</CardTitle>
            <CardDescription>What each role should be able to access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border p-3 rounded">
                <div className="font-semibold text-purple-800">Super Admin</div>
                <div className="text-sm text-gray-600">
                  • Access all organizations and tickets<br/>
                  • Create organizations and org admins<br/>
                  • Full system access<br/>
                  • No organization_id (NULL)
                </div>
              </div>
              
              <div className="border p-3 rounded">
                <div className="font-semibold text-blue-800">Organization Admin</div>
                <div className="text-sm text-gray-600">
                  • Access tickets in their organization<br/>
                  • Create users and contractors<br/>
                  • Assign tickets to contractors<br/>
                  • Manage organization settings
                </div>
              </div>
              
              <div className="border p-3 rounded">
                <div className="font-semibold text-gray-800">User</div>
                <div className="text-sm text-gray-600">
                  • Create tickets in their organization<br/>
                  • View their own tickets<br/>
                  • Update ticket status (limited)
                </div>
              </div>
              
              <div className="border p-3 rounded">
                <div className="font-semibold text-orange-800">Contractor</div>
                <div className="text-sm text-gray-600">
                  • View assigned tickets<br/>
                  • Accept/reject assignments<br/>
                  • Update ticket progress<br/>
                  • Upload documents
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}