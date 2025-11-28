'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CacheBusterPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const supabase = createClient()

  const aggressiveCacheBust = async () => {
    setLoading(true)
    setStep(1)

    try {
      // Step 1: Clear all local storage
      localStorage.clear()
      sessionStorage.clear()
      setStep(2)

      // Step 2: Delete all cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      })
      setStep(3)

      // Step 3: Force refresh session
      await supabase.auth.refreshSession()
      setStep(4)

      // Step 4: Sign out and back in
      await supabase.auth.signOut()
      setStep(5)

      // Step 5: Redirect to login
      setTimeout(() => {
        window.location.href = '/login?cache_bust=' + Date.now()
      }, 1000)

    } catch (error) {
      console.error('Cache bust error:', error)
      setLoading(false)
    }
  }

  const steps = [
    'Ready to clear cache',
    'Clearing local storage...',
    'Clearing cookies...',
    'Refreshing session...',
    'Signing out...',
    'Redirecting to fresh login...'
  ]

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Super Admin Cache Buster</CardTitle>
          <CardDescription>
            Force clear all cached session data and re-authenticate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              {steps[step]}
            </p>
            
            {loading && (
              <div className="flex justify-center mb-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              </div>
            )}
          </div>

          <Button 
            onClick={aggressiveCacheBust} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Clear All Cache & Re-login'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            This will sign you out and clear all browser data for this site
          </p>
        </CardContent>
      </Card>
    </div>
  )
}