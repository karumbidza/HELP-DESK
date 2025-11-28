'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  Building2,
  MessageCircle,
  Send,
  AlertCircle,
  CheckCircle,
  Settings,
  FileText,
  Users
} from 'lucide-react'
import { TicketWithRelations, TicketStatus, TicketPriority } from '@/types/tickets'
import { UserRole } from '@/types/database.types'
import { TicketStatusUpdate } from './TicketStatusUpdate'
import { TicketChat } from './TicketChat'

interface TicketDetailModalProps {
  ticket: TicketWithRelations | null
  isOpen: boolean
  onClose: () => void
  userRole: UserRole
  userId: string
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

export function TicketDetailModal({ 
  ticket, 
  isOpen, 
  onClose, 
  userRole, 
  userId 
}: TicketDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'history'>('details')

  if (!ticket) return null

  const canUpdateStatus = ['super_admin', 'org_admin', 'contractor'].includes(userRole)
  const isRequester = ticket.requester_id === userId
  const isContractor = ticket.contractor_id === userId
  const isAdmin = ['super_admin', 'org_admin'].includes(userRole)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(ticket.status)} border`}>
                  {getStatusIcon(ticket.status)}
                  <span className="ml-1 capitalize">
                    {ticket.status.replace('_', ' ')}
                  </span>
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {ticket.category}
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-xs text-gray-500">
            Ticket ID: {ticket.id}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <FileText className="h-4 w-4 inline mr-1" />
            Details
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageCircle className="h-4 w-4 inline mr-1" />
            Chat
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <Settings className="h-4 w-4 inline mr-1" />
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'details' && (
            <div className="h-full overflow-y-auto p-4 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {ticket.description}
                </p>
              </div>

              {/* Ticket Information */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ticket Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Created:</span>
                      <span>{new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                    
                    {ticket.site_location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Location:</span>
                        <span>{ticket.site_location}</span>
                      </div>
                    )}
                    
                    {ticket.estimated_duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Est. Duration:</span>
                        <span>{ticket.estimated_duration} hours</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">People Involved</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Requester:</span>
                      <span>{ticket.requester?.full_name || 'Unknown'}</span>
                    </div>
                    
                    {ticket.admin && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Admin:</span>
                        <span>{ticket.admin.full_name}</span>
                      </div>
                    )}
                    
                    {ticket.contractor ? (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Contractor:</span>
                        <span>{ticket.contractor.full_name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span className="italic">No contractor assigned</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status Update Section */}
              {canUpdateStatus && (
                <TicketStatusUpdate 
                  ticket={ticket}
                  userRole={userRole}
                  onStatusUpdate={() => window.location.reload()}
                />
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="h-full">
              <TicketChat 
                ticketId={ticket.id}
                userRole={userRole}
                userId={userId}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Ticket History</h3>
                <p className="text-sm text-gray-500">
                  Ticket history and updates will be displayed here.
                </p>
                {/* TODO: Implement ticket history/updates timeline */}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}