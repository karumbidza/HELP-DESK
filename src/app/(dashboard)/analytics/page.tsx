import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserRole } from '@/types/database.types'
import { TrendingUp, Users, Building2, Activity, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role as UserRole) || 'user'

  // Only super_admin and org_admin can access analytics
  if (!['super_admin', 'org_admin'].includes(userRole)) {
    redirect('/dashboard')
  }

  // Fetch real analytics data
  const { data: organizations } = await supabase
    .from('organizations')
    .select('*')

  const { data: users } = await supabase
    .from('profiles')
    .select('*')

  // Mock analytics data (you'd calculate from real data)
  const analytics = {
    totalUsers: users?.length || 0,
    totalOrganizations: organizations?.length || 0,
    activeUsers: Math.floor((users?.length || 0) * 0.7), // 70% active
    newUsersThisMonth: Math.floor((users?.length || 0) * 0.2), // 20% new
    userGrowth: 15.2,
    orgGrowth: 8.5,
    activityGrowth: 12.1,
    revenueGrowth: 23.4
  }

  const metrics = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      change: analytics.userGrowth,
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Organizations',
      value: analytics.totalOrganizations,
      change: analytics.orgGrowth,
      icon: Building2,
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers,
      change: analytics.activityGrowth,
      icon: Activity,
      trend: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: '$12,420',
      change: analytics.revenueGrowth,
      icon: TrendingUp,
      trend: 'up'
    }
  ]

  const recentActivity = [
    { action: 'New user registered', user: 'john@acme.com', time: '2 minutes ago' },
    { action: 'Organization created', user: 'TechCorp', time: '1 hour ago' },
    { action: 'Project completed', user: 'jane@startup.com', time: '3 hours ago' },
    { action: 'User upgraded plan', user: 'mike@company.com', time: '5 hours ago' },
    { action: 'New organization signup', user: 'Enterprise Ltd', time: '1 day ago' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-600">
          {userRole === 'super_admin' 
            ? 'Platform-wide analytics and insights' 
            : 'Your organization\'s analytics and performance'
          }
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  {metric.trend === 'up' ? (
                    <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {metric.change}%
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart placeholder - integrate with charting library</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Breakdown (Super Admin only) */}
      {userRole === 'super_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Breakdown</CardTitle>
            <CardDescription>Users per organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations?.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-sm text-gray-600">{org.subdomain || 'No subdomain'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">0 users</p>
                    <p className="text-sm text-gray-600">Created {new Date(org.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )) || (
                <p className="text-center text-gray-500 py-4">No organizations found</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}