import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { UserRole } from '@/types/database.types'
import { Plus } from 'lucide-react'

export default async function AdminUsersPage() {
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

  // Only super_admin and org_admin can access this page
  if (!(['super_admin', 'org_admin'] as UserRole[]).includes(userRole)) {
    redirect('/dashboard')
  }

  // Fetch users based on role
  let usersQuery = supabase.from('profiles').select('*, organizations(name)')

  if (userRole === 'org_admin' && profile?.organization_id) {
    usersQuery = usersQuery.eq('organization_id', profile.organization_id)
  }

  const { data: users } = await usersQuery

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">
            Manage and monitor user accounts {userRole === 'org_admin' ? 'in your organization' : 'across all organizations'}
          </p>
        </div>
        {userRole === 'super_admin' && (
          <Link href="/admin/users/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users?.length || 0} user{users?.length !== 1 ? 's' : ''} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {userRole === 'super_admin' && <TableHead>Organization</TableHead>}
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || 'N/A'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={u.role as UserRole} />
                    </TableCell>
                    {userRole === 'super_admin' && (
                      <TableCell>{(u as any).organizations?.name || 'N/A'}</TableCell>
                    )}
                    <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={userRole === 'super_admin' ? 5 : 4} className="text-center text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
