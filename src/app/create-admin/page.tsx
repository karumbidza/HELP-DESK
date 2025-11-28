'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, User } from 'lucide-react'

export default function CreateSuperAdminPage() {
  const [formData, setFormData] = useState({
    email: 'admin@helpdesk.com',
    password: 'admin123456',
    confirmPassword: 'admin123456',
    fullName: 'Super Administrator'
  })
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error' | 'info' | null, message: string }>({ type: null, message: '' })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const createSuperAdmin = async () => {
    if (formData.password !== formData.confirmPassword) {
      setResult({ type: 'error', message: 'Passwords do not match!' })
      return
    }

    if (formData.password.length < 6) {
      setResult({ type: 'error', message: 'Password must be at least 6 characters!' })
      return
    }

    setIsCreating(true)
    setResult({ type: 'info', message: 'Creating super admin account...' })

    try {
      const response = await fetch('/api/setup-super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ 
          type: 'success', 
          message: `✅ SUCCESS!\n\nSuper Admin Created!\n\n📧 Email: ${formData.email}\n🔑 Password: ${formData.password}\n\nYou can now login at /login with these credentials.`
        })
      } else {
        setResult({ 
          type: 'error', 
          message: `❌ Failed to create super admin: ${data.error || 'Unknown error'}`
        })
      }
    } catch (error) {
      setResult({ 
        type: 'error', 
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsCreating(false)
    }
  }

  const checkExistingAdmins = async () => {
    try {
      setResult({ type: 'info', message: 'Checking for existing admins...' })
      
      const response = await fetch('/api/setup-super-admin')
      const data = await response.json()

      if (data.super_admin_exists) {
        setResult({ 
          type: 'info', 
          message: `ℹ️ Super admins already exist (${data.super_admins?.length || 0} found).\n\nIf you forgot your credentials, you may need to reset them.`
        })
      } else {
        setResult({ 
          type: 'info', 
          message: '✨ No super admins found. You can create the first one below.'
        })
      }
    } catch (error) {
      setResult({ 
        type: 'error', 
        message: `Error checking admins: ${error}`
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Super Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up the first administrator account for your help desk system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Administrator Details</CardTitle>
            <CardDescription>
              This will be your main admin account with full system access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter administrator name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter admin email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter secure password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm password"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={createSuperAdmin}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Create Super Admin'}
              </Button>
              <Button
                variant="outline"
                onClick={checkExistingAdmins}
                disabled={isCreating}
              >
                Check Status
              </Button>
            </div>

            {result.type && (
              <Alert className={result.type === 'error' ? 'border-red-200 bg-red-50' : result.type === 'success' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
                {result.type === 'success' && <CheckCircle className="h-4 w-4" />}
                {result.type === 'error' && <AlertCircle className="h-4 w-4" />}
                <AlertDescription className="whitespace-pre-line">
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="border-t pt-4 text-sm text-gray-600">
              <p><strong>Quick Actions:</strong></p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/login">Login Page</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/quick-test">Test Login</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin-setup">Database Setup</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}