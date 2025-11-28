import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Filter, Search, Clock, User, AlertCircle, CheckCircle, UserPlus } from 'lucide-react'
import { TicketWithRelations, TicketStatus, TicketPriority } from '@/types/tickets'
import { UserRole } from '@/types/database.types'
import { QuickAssignButton } from '@/components/tickets/QuickAssignButton'

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

function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case 'open':
      return <AlertCircle className="h-4 w-4" />
    case 'assigned':
      return <User className="h-4 w-4" />
    case 'in_progress':
      return <Clock className="h-4 w-4" />
    case 'completed':
      return <CheckCircle className="h-4 w-4" />
    case 'closed':
      return <CheckCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

function getStatusColor(status: TicketStatus) {
  switch (status) {
    case 'open':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'assigned':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'accepted':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'in_progress':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getPriorityColor(priority: TicketPriority) {
  switch (priority) {
    case 'low':
      return 'bg-gray-100 text-gray-800'
    case 'medium':
      return 'bg-blue-100 text-blue-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'urgent':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60)
    return `${minutes} min ago`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours}h ago`
  } else if (diffInHours < 168) { // 7 days
    const days = Math.floor(diffInHours / 24)
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

function TicketCard({ ticket, userRole, onAssignSuccess }: { 
  ticket: TicketWithRelations
  userRole: UserRole
  onAssignSuccess?: () => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${getStatusColor(ticket.status)} border`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(ticket.status)}
                  <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                </div>
              </Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {ticket.category.toUpperCase()}
              </Badge>
            </div>
            <CardTitle className="text-lg">
              <Link 
                href={`/tickets/${ticket.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {ticket.title}
              </Link>
            </CardTitle>
          </div>
          <div className="text-right text-sm text-gray-500">
            {formatDate(ticket.created_at)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="mb-3 line-clamp-2">
          {ticket.description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{ticket.requester?.full_name || 'Unknown'}</span>
            </div>
            {ticket.site_location && (
              <div className="flex items-center gap-1">
                <span>📍 {ticket.site_location}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {ticket.contractor && (
              <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                Assigned to {ticket.contractor.full_name}
              </div>
            )}
            <QuickAssignButton
              ticketId={ticket.id}
              ticketTitle={ticket.title}
              currentContractorId={ticket.contractor_id}
              userRole={userRole}
              onSuccess={onAssignSuccess}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TicketStats({ tickets }: { tickets: TicketWithRelations[] }) {
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    assigned: tickets.filter(t => t.status === 'assigned').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-gray-500">Total Tickets</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-red-600">{stats.open}</div>
          <p className="text-xs text-gray-500">Open</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-yellow-600">{stats.assigned}</div>
          <p className="text-xs text-gray-500">Assigned</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-purple-600">{stats.in_progress}</div>
          <p className="text-xs text-gray-500">In Progress</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs text-gray-500">Completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          <p className="text-xs text-gray-500">Urgent</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function TicketsPage() {
  const { tickets, profile } = await getTickets()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="mt-1 text-gray-600">
            Manage support requests and work orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Link href="/tickets/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <TicketStats tickets={tickets} />
      </Suspense>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tickets found</h3>
                <p className="mt-1 text-gray-500">
                  Get started by creating your first support ticket.
                </p>
                <div className="mt-6">
                  <Link href="/tickets/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Ticket
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                userRole={profile.role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}