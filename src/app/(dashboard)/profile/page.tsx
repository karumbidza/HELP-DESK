import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { UserRole } from '@/types/database.types'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role as UserRole) || 'user'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-gray-600">
          View your account information and role
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your current profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-lg">{profile?.full_name || 'N/A'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg">{profile?.email || user.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1">
              <RoleBadge role={userRole} />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Organization</label>
            <p className="mt-1 text-lg">
              {profile?.organizations?.name || 'No organization assigned'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">User ID</label>
            <p className="mt-1 text-sm font-mono text-gray-600">{user.id}</p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{JSON.stringify({
  role: profile?.role,
  hasProfile: !!profile,
  organizationId: profile?.organization_id,
  organizationName: profile?.organizations?.name
}, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
