import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DebugPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  // Also check raw auth metadata
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Debug Information</h1>
        <p className="mt-1 text-gray-600">Complete diagnostic of your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Data</CardTitle>
          <CardDescription>Raw data from Supabase Auth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User ID:</h3>
            <code className="bg-gray-100 p-2 rounded block text-xs">{user.id}</code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Email:</h3>
            <code className="bg-gray-100 p-2 rounded block text-xs">{user.email}</code>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Session User Metadata:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(session?.user?.user_metadata, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Data</CardTitle>
          <CardDescription>Data from profiles table</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileError && (
            <div className="bg-red-50 p-3 rounded text-red-800 text-sm">
              <strong>Error:</strong> {profileError.message}
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-2">Profile Exists:</h3>
            <code className="bg-gray-100 p-2 rounded block text-xs">
              {profile ? 'YES' : 'NO'}
            </code>
          </div>

          {profile && (
            <>
              <div>
                <h3 className="font-semibold mb-2">Role in Database:</h3>
                <code className="bg-gray-100 p-2 rounded block text-xs font-bold text-lg">
                  {profile.role}
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Full Profile Object:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Fix Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/api/auth/refresh">
            <Button className="w-full">Force Refresh Session</Button>
          </Link>
          <form action="/api/auth/signout" method="POST">
            <Button variant="destructive" type="submit" className="w-full">
              Sign Out (Clear All Sessions)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
