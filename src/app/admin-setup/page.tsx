'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Database, User, Shield } from 'lucide-react'

interface DatabaseStatus {
  super_admin_exists: boolean
  super_admins: Array<{
    id: string
    email: string
    full_name: string
  }>
  database_ready: boolean
}

export default function DatabaseManagementPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [setupLoading, setSetupLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/setup-super-admin')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupDatabase = async () => {
    setSetupLoading(true)
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        alert('Database setup completed successfully!')
        fetchStatus()
      } else {
        const error = await response.json()
        alert(`Setup failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Setup error:', error)
      alert('Setup failed: ' + error)
    } finally {
      setSetupLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
        <p className="text-gray-600">Manage your ticketing system database and super admin accounts</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Setup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              onClick={setupDatabase} 
              disabled={setupLoading}
              className="w-full"
            >
              {setupLoading ? 'Setting up...' : 'Setup Tickets Table'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Creates tickets table and related infrastructure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admin</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              asChild
              variant="outline"
              className="w-full"
            >
              <a href="/setup-super-admin">Create Super Admin</a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Create initial super admin account
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dashboard</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              asChild
              variant="secondary"
              className="w-full"
            >
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Access the main application
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current state of your ticketing system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Database Ready</span>
            </div>
            {status?.database_ready ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Not Ready
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Super Admin Accounts</span>
            </div>
            {status?.super_admin_exists ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {status.super_admins?.length || 0} Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                None Created
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Super Admin List */}
      {status?.super_admins && status.super_admins.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Super Admin Accounts</CardTitle>
            <CardDescription>Active super administrator accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.super_admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{admin.full_name}</div>
                    <div className="text-sm text-gray-500">{admin.email}</div>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Super Admin
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to get your system running</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Setup Tickets Table" to create the database schema</li>
            <li>Click "Create Super Admin" to create your first administrator account</li>
            <li>Login with the super admin credentials</li>
            <li>Create organizations and organization admins</li>
            <li>Organization admins can then create users and contractors</li>
            <li>Start creating and managing tickets!</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}