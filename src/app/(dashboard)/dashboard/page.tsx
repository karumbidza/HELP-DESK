import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { UserRole } from '@/types/database.types'
import { Users, Building2, BarChart3, FolderKanban } from 'lucide-react'

export default async function DashboardPage() {
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

  // Fetch stats based on role
  let stats: Array<{
    name: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
  }> = []

  if (userRole === 'super_admin') {
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    stats = [
      { name: 'Total Organizations', value: orgCount || 0, icon: Building2 },
      { name: 'Total Users', value: userCount || 0, icon: Users },
      { name: 'Active Projects', value: 0, icon: FolderKanban },
      { name: 'System Health', value: '99.9%', icon: BarChart3 },
    ]
  } else if (userRole === 'org_admin') {
    const { count: orgUserCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile?.organization_id)

    stats = [
      { name: 'Organization Users', value: orgUserCount || 0, icon: Users },
      { name: 'Active Projects', value: 0, icon: FolderKanban },
      { name: 'This Month', value: '0', icon: BarChart3 },
    ]
  } else {
    stats = [
      { name: 'My Projects', value: 0, icon: FolderKanban },
      { name: 'Tasks Assigned', value: 0, icon: BarChart3 },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || user.email}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here&apos;s what&apos;s happening with your {userRole === 'super_admin' ? 'platform' : 'account'} today.
          </p>
        </div>
        <RoleBadge role={userRole} />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            No recent activity to display. Start by creating a project or inviting team members.
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions based on role */}
      {userRole === 'super_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-gray-700">
              • Create new organization<br />
              • Manage system users<br />
              • View platform analytics<br />
              • Configure system settings
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'org_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-gray-700">
              • Invite team members<br />
              • Create new project<br />
              • Review team activity<br />
              • Update organization settings
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
