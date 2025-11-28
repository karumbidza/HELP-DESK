import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminTestPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Force check if this specific email should be super admin
  const isSuperAdmin = user.email === 'karumbidzaallen21@gmail.com'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Test Page</h1>
        <p className="mt-1 text-gray-600">Direct access to admin features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Access Menu</CardTitle>
          <CardDescription>
            Direct links to admin features (bypassing role checks)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuperAdmin ? (
            <div className="grid gap-3">
              <Link href="/admin/organizations">
                <Button className="w-full justify-start">
                  🏢 Manage Organizations
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button className="w-full justify-start">
                  👥 Manage Users
                </Button>
              </Link>
              <Link href="/admin/organizations/create">
                <Button className="w-full justify-start">
                  ➕ Create Organization
                </Button>
              </Link>
              <Link href="/admin/users/create">
                <Button className="w-full justify-start">
                  👤 Create User
                </Button>
              </Link>
              <Link href="/analytics">
                <Button className="w-full justify-start">
                  📊 View Analytics
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-red-600">Access denied. You need karumbidzaallen21@gmail.com account.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Is Super Admin:</strong> {isSuperAdmin ? 'YES ✅' : 'NO ❌'}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}