'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function QuickTestPage() {
  const [email, setEmail] = useState('admin@test.com')
  const [password, setPassword] = useState('admin123456')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setResult(`Login Error: ${error.message}`)
      } else {
        setResult(`Login Success! User: ${data.user?.email}`)
        
        // Check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .single()
        
        if (profile) {
          setResult(prev => `${prev}\nProfile: ${profile.full_name} (${profile.role})`)
        } else {
          setResult(prev => `${prev}\nProfile Error: ${profileError?.message}`)
        }
      }
    } catch (err) {
      setResult(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const checkSuperAdmins = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup-super-admin')
      const data = await response.json()
      
      setResult(`Super Admins Found: ${data.super_admin_exists ? 'YES' : 'NO'}\n` +
                `Count: ${data.super_admins?.length || 0}\n` +
                `Database Ready: ${data.database_ready ? 'YES' : 'NO'}`)
    } catch (err) {
      setResult(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Quick Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testLogin} disabled={loading}>
              Test Login
            </Button>
            <Button onClick={checkSuperAdmins} variant="outline" disabled={loading}>
              Check Super Admins
            </Button>
          </div>
          
          {result && (
            <div className="bg-gray-100 p-3 rounded-md">
              <pre className="text-sm">{result}</pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>Quick Links:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><a href="/setup-super-admin" className="text-blue-600 hover:underline">Setup Super Admin</a></li>
              <li><a href="/admin-setup" className="text-blue-600 hover:underline">Database Setup</a></li>
              <li><a href="/diagnostics" className="text-blue-600 hover:underline">Full Diagnostics</a></li>
              <li><a href="/login" className="text-blue-600 hover:underline">Regular Login Page</a></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}