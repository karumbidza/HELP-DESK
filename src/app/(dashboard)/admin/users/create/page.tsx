'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserRole } from '@/types/database.types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateUserPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [organizationId, setOrganizationId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrganizations() {
      const { data } = await supabase.from('organizations').select('*')
      setOrganizations(data || [])
    }
    fetchOrganizations()
  }, [supabase])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (signUpError) throw signUpError

      // Update profile with organization
      if (authData.user && organizationId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ organization_id: organizationId })
          .eq('id', authData.user.id)

        if (profileError) throw profileError
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/users')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred creating the user')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">User Created Successfully!</CardTitle>
            <CardDescription>
              An email has been sent to {email} with login instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Redirecting to users list...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="mt-1 text-gray-600">Add a new user to the platform</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">User will receive this password via email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="org_admin">Organization Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select 
                value={organizationId} 
                onValueChange={setOrganizationId} 
                disabled={loading || role === 'super_admin'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization (optional for super admin)" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role === 'super_admin' && (
                <p className="text-xs text-gray-500">Super admins don&apos;t need an organization</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating User...' : 'Create User'}
              </Button>
              <Link href="/admin/users">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
