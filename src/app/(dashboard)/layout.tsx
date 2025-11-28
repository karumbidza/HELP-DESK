import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/shared/Header'
import { SidebarNav } from '@/components/shared/SidebarNav'
import { UserRole } from '@/types/database.types'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch user profile with role - FORCE fresh data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Debug logging
  console.log('=== Dashboard Layout Debug ===')
  console.log('User ID:', user.id)
  console.log('User Email:', user.email)
  console.log('Profile Error:', profileError)
  console.log('Profile:', JSON.stringify(profile, null, 2))
  console.log('Profile Role:', profile?.role)
  console.log('==============================')

  const userRole = (profile?.role as UserRole) || 'user'

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarNav 
              userRole={userRole} 
            />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          userEmail={user.email} 
          userFullName={profile?.full_name} 
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}