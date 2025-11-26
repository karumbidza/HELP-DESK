'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RefreshSessionPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const refreshSession = async () => {
      // Force refresh the session
      await supabase.auth.refreshSession()
      
      // Wait a moment then redirect
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    }

    refreshSession()
  }, [router, supabase])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Refreshing Session</CardTitle>
          <CardDescription>
            Updating your account permissions...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
