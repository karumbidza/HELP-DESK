import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TicketsListView } from '@/components/tickets/TicketsListView'
import { TicketWithRelations } from '@/types/tickets'
import { UserRole } from '@/types/database.types'

async function getTickets() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Build query based on user role
  let query = supabase
    .from('tickets')
    .select(`
      *,
      requester:profiles!tickets_requester_id_fkey(id, full_name, email),
      admin:profiles!tickets_admin_id_fkey(id, full_name, email),
      contractor:profiles!tickets_contractor_id_fkey(id, full_name, email),
      organization:organizations(id, name)
    `)

  // Apply role-based filtering
  if (profile.role !== 'super_admin') {
    query = query.eq('organization_id', profile.organization_id)
  }

  switch (profile.role) {
    case 'user':
      query = query.eq('requester_id', user.id)
      break
    case 'contractor':
      query = query.or(`contractor_id.eq.${user.id},status.eq.open`)
      break
    // admin and super_admin see all tickets (with org filter above for admin)
  }

  query = query.order('created_at', { ascending: false }).limit(50)

  const { data: tickets, error } = await query

  if (error) {
    console.error('Error fetching tickets:', error)
    return { tickets: [], profile }
  }

  return { tickets: tickets || [], profile }
}

export default async function TicketsPage() {
  const { tickets, profile } = await getTickets()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage and track your support tickets</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <TicketsListView 
          tickets={tickets} 
          userRole={profile.role as UserRole}
          userId={profile.id}
        />
      </Suspense>
    </div>
  )
}