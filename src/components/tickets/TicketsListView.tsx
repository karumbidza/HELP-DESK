'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye,
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  MapPin,
  Ticket
} from 'lucide-react'
import { TicketWithRelations, TicketStatus, TicketPriority } from '@/types/tickets'
import { UserRole } from '@/types/database.types'
import { TicketDetailModal } from '@/components/tickets/TicketDetailModal'
import { QuickAssignButton } from '@/components/tickets/QuickAssignButton'

interface TicketsListViewProps {
  tickets: TicketWithRelations[]
  userRole: UserRole
  userId: string
}

function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case 'open':
      return <AlertCircle className="h-3 w-3" />
    case 'assigned':
      return <User className="h-3 w-3" />
    case 'in_progress':
      return <Clock className="h-3 w-3" />
    case 'completed':
      return <CheckCircle className="h-3 w-3" />
    case 'closed':
      return <CheckCircle className="h-3 w-3" />
    default:
      return <AlertCircle className="h-3 w-3" />
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
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function TicketsListView({ tickets, userRole, userId }: TicketsListViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<TicketWithRelations | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.requester?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.contractor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openTicketModal = (ticket: TicketWithRelations) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  const closeTicketModal = () => {
    setSelectedTicket(null)
    setIsModalOpen(false)
  }

  const canAssign = ['super_admin', 'org_admin'].includes(userRole)

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button asChild>
            <Link href="/tickets/create">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Ticket className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No tickets match your search' : 'No tickets found'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {searchTerm 
                ? `No tickets found matching "${searchTerm}". Try adjusting your search terms.`
                : userRole === 'user' 
                  ? "You haven't created any tickets yet."
                  : "No tickets available in this organization."
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/tickets/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first ticket
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {filteredTickets.length} {filteredTickets.length === 1 ? 'Ticket' : 'Tickets'}
              {searchTerm && ` matching "${searchTerm}"`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Requester</TableHead>
                    {(userRole === 'super_admin' || userRole === 'org_admin') && (
                      <TableHead>Contractor</TableHead>
                    )}
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div 
                            className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                            onClick={() => openTicketModal(ticket)}
                          >
                            {ticket.title}
                          </div>
                          {ticket.site_location && (
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {ticket.site_location}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ticket.requester?.full_name || 'Unknown'}
                        </div>
                      </TableCell>
                      {(userRole === 'super_admin' || userRole === 'org_admin') && (
                        <TableCell>
                          <div className="text-sm">
                            {ticket.contractor?.full_name || (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTicketModal(ticket)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {canAssign && ticket.status === 'open' && (
                            <QuickAssignButton 
                              ticketId={ticket.id}
                              ticketTitle={ticket.title}
                              currentContractorId={ticket.contractor_id}
                              userRole={userRole}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={closeTicketModal}
        userRole={userRole}
        userId={userId}
      />
    </div>
  )
}