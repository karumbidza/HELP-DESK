'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Clock, User } from 'lucide-react'
import { TicketWithRelations, TicketStatus } from '@/types/tickets'
import { UserRole } from '@/types/database.types'

interface TicketStatusUpdateProps {
  ticket: TicketWithRelations
  userRole: UserRole
  onStatusUpdate: () => void
}

const statusOptions: { value: TicketStatus; label: string; description: string }[] = [
  { value: 'open', label: 'Open', description: 'Ticket is open and waiting for assignment' },
  { value: 'assigned', label: 'Assigned', description: 'Ticket has been assigned to a contractor' },
  { value: 'accepted', label: 'Accepted', description: 'Contractor has accepted the assignment' },
  { value: 'in_progress', label: 'In Progress', description: 'Work is currently being performed' },
  { value: 'completed', label: 'Completed', description: 'Work has been completed' },
  { value: 'closed', label: 'Closed', description: 'Ticket is closed and resolved' },
  { value: 'cancelled', label: 'Cancelled', description: 'Ticket has been cancelled' }
]

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

export function TicketStatusUpdate({ ticket, userRole, onStatusUpdate }: TicketStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(ticket.status)
  const [updateNote, setUpdateNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const getAvailableStatuses = (): TicketStatus[] => {
    const currentStatus = ticket.status
    
    // Define what statuses each role can set based on current status
    if (userRole === 'super_admin' || userRole === 'org_admin') {
      // Admins can set any status
      return statusOptions.map(option => option.value)
    } else if (userRole === 'contractor') {
      // Contractors have limited status options based on current status
      switch (currentStatus) {
        case 'assigned':
          return ['accepted', 'cancelled'] // Can accept or reject assignment
        case 'accepted':
          return ['in_progress', 'cancelled'] // Can start work or cancel
        case 'in_progress':
          return ['completed', 'in_progress'] // Can complete or keep in progress
        default:
          return [currentStatus] // Can't change other statuses
      }
    } else {
      // Users typically can't change status themselves
      return [currentStatus]
    }
  }

  const availableStatuses = getAvailableStatuses()
  const filteredStatusOptions = statusOptions.filter(option => 
    availableStatuses.includes(option.value)
  )

  const handleStatusUpdate = async () => {
    if (selectedStatus === ticket.status && !updateNote.trim()) {
      return // No changes to save
    }

    setIsUpdating(true)
    
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
          note: updateNote.trim() || undefined
        }),
      })

      if (response.ok) {
        onStatusUpdate()
        setUpdateNote('')
      } else {
        const error = await response.json()
        alert(`Failed to update status: ${error.error}`)
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('Failed to update status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const hasStatusChange = selectedStatus !== ticket.status
  const hasNote = updateNote.trim().length > 0
  const canSave = hasStatusChange || hasNote

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Update Status</CardTitle>
        <CardDescription>
          Change the ticket status and add notes about progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Current Status:</Label>
          <Badge className="bg-blue-100 text-blue-800">
            {getStatusIcon(ticket.status)}
            <span className="ml-1 capitalize">
              {ticket.status.replace('_', ' ')}
            </span>
          </Badge>
        </div>

        {/* Status Selector */}
        {filteredStatusOptions.length > 1 && (
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value: TicketStatus) => setSelectedStatus(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(option.value)}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Update Note */}
        <div className="space-y-2">
          <Label htmlFor="note">Update Note (Optional)</Label>
          <Textarea
            id="note"
            placeholder="Add a note about this status change or progress update..."
            value={updateNote}
            onChange={(e) => setUpdateNote(e.target.value)}
            rows={3}
          />
        </div>

        {/* Action Button */}
        {canSave && (
          <Button 
            onClick={handleStatusUpdate}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        )}

        {/* Quick Actions for Contractors */}
        {userRole === 'contractor' && ticket.status === 'assigned' && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={() => {
                setSelectedStatus('accepted')
                handleStatusUpdate()
              }}
              disabled={isUpdating}
              className="flex-1"
            >
              Accept Assignment
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStatus('cancelled')
                setUpdateNote('Assignment declined by contractor')
                handleStatusUpdate()
              }}
              disabled={isUpdating}
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}