import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, MapPin, Clock, Calendar, ArrowLeft, UserPlus, Settings } from 'lucide-react'
import Link from 'next/link'
import { TicketActions } from '@/components/tickets/TicketActions'

interface TicketPageProps {
  params: {
    id: string
  }
}

async function getTicket(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile for role checking
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      requester:profiles!tickets_requester_id_fkey(id, full_name, email),
      admin:profiles!tickets_admin_id_fkey(id, full_name, email),
      contractor:profiles!tickets_contractor_id_fkey(id, full_name, email),
      organization:organizations(id, name),
      updates:ticket_updates(
        id, update_type, description, created_at, notes,
        created_by_user:profiles!ticket_updates_created_by_fkey(id, full_name)
      ),
      documents:documents(id, document_type, file_name, uploaded_at),
      comments:ticket_comments(
        id, comment, is_internal, created_at,
        created_by_user:profiles!ticket_comments_created_by_fkey(id, full_name)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !ticket) {
    notFound()
  }

  return { ticket, user, profile }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: string) {
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

function getPriorityColor(priority: string) {
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

export default async function TicketDetailPage({ params }: TicketPageProps) {
  const { ticket, user, profile } = await getTicket(params.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tickets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="text-gray-600">Ticket #{ticket.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(ticket.status)} border`}>
            {ticket.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPriorityColor(ticket.priority)}>
            {ticket.priority.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Track all updates and changes to this ticket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticket.updates && ticket.updates.length > 0 ? (
                  ticket.updates
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((update: any) => (
                      <div key={update.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium capitalize">
                              {update.update_type.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(update.created_at)}
                            </span>
                          </div>
                          {update.description && (
                            <p className="text-gray-700 text-sm">{update.description}</p>
                          )}
                          {update.notes && (
                            <p className="text-gray-600 text-sm mt-1 italic">{update.notes}</p>
                          )}
                          {update.created_by_user && (
                            <p className="text-xs text-gray-500 mt-1">
                              by {update.created_by_user.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-sm">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="font-medium">{ticket.category.toUpperCase()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{formatDate(ticket.created_at)}</p>
                </div>
              </div>

              {ticket.site_location && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-sm">{ticket.site_location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* People */}
          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.requester && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Requester</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{ticket.requester.full_name}</p>
                      <p className="text-xs text-gray-500">{ticket.requester.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {ticket.admin && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned Admin</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{ticket.admin.full_name}</p>
                      <p className="text-xs text-gray-500">{ticket.admin.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {ticket.contractor && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contractor</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{ticket.contractor.full_name}</p>
                      <p className="text-xs text-gray-500">{ticket.contractor.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <TicketActions
            ticket={ticket}
            userRole={profile?.role || 'user'}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  )
}