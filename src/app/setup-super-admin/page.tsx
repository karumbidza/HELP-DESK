'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Crown, Shield } from 'lucide-react'

interface SuperAdminStatus {
  exists: boolean
  count: number
  super_admins: Array<{
    id: string
    email: string
    full_name: string
    created_at: string
  }>
}

export default function SuperAdminSetupPage() {
  const [status, setStatus] = useState<SuperAdminStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })

  useEffect(() => {
    checkSuperAdminStatus()
  }, [])

  const checkSuperAdminStatus = async () => {
    try {
      const response = await fetch('/api/setup-super-admin')
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
      } else {
        setError('Failed to check super admin status')
      }
    } catch (err) {
      setError('Failed to check super admin status')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/setup-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Super admin created successfully! You can now log in.')
        setFormData({ email: '', password: '', confirmPassword: '', full_name: '' })
        await checkSuperAdminStatus() // Refresh status
      } else {
        setError(data.error || 'Failed to create super admin')
      }
    } catch (err) {
      setError('Failed to create super admin')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking super admin status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Crown className="mx-auto h-12 w-12 text-yellow-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Super Admin Setup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Initialize the help desk system with a super admin account
          </p>
        </div>

        {status?.exists ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Super Admin Already Exists
              </CardTitle>
              <CardDescription>
                The system is already initialized with {status.count} super admin(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {status.super_admins.map((admin) => (
                  <div key={admin.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-medium text-green-900">{admin.full_name}</div>
                    <div className="text-sm text-green-700">{admin.email}</div>
                    <div className="text-xs text-green-600">
                      Created: {new Date(admin.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <Button asChild className="w-full">
                    <a href="/login">Go to Login</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create Super Admin</CardTitle>
              <CardDescription>
                Create the first super admin account to manage organizations and users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Super Admin"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                    disabled={creating}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@helpdesk.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={creating}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                    disabled={creating}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    disabled={creating}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={creating || !formData.email || !formData.password || !formData.full_name}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Super Admin...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Create Super Admin
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in here
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}