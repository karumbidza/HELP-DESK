'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, MessageCircle, Upload, Edit, RotateCcw } from 'lucide-react'
import { AssignTicketModal } from './AssignTicketModal'
import { UserRole } from '@/types/database.types'

interface TicketActionsProps {
  ticket: any
  userRole: UserRole
  userId: string
}

export function TicketActions({ ticket, userRole, userId }: TicketActionsProps) {
  const router = useRouter()
  const [showAssignModal, setShowAssignModal] = useState(false)

  const canAssign = ['org_admin', 'super_admin'].includes(userRole)
  const canEdit = canAssign || ticket.requester_id === userId
  const isContractor = userRole === 'contractor'
  const isAssignedContractor = isContractor && ticket.contractor_id === userId

  const handleAssignSuccess = () => {
    router.refresh()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Admin Actions */}
          {canAssign && (
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setShowAssignModal(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {ticket.contractor_id ? 'Reassign Ticket' : 'Assign to Contractor'}
            </Button>
          )}

          {/* Contractor Actions */}
          {isAssignedContractor && ticket.status === 'assigned' && (
            <>
              <Button className="w-full justify-start" variant="default">
                <RotateCcw className="mr-2 h-4 w-4" />
                Accept Ticket
              </Button>
              <Button className="w-full justify-start" variant="destructive">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reject Ticket
              </Button>
            </>
          )}

          {isAssignedContractor && ticket.status === 'accepted' && (
            <Button className="w-full justify-start" variant="default">
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Work
            </Button>
          )}

          {isAssignedContractor && ticket.status === 'in_progress' && (
            <Button className="w-full justify-start" variant="default">
              <RotateCcw className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}

          {/* Universal Actions */}
          <Button className="w-full justify-start" variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Add Comment
          </Button>

          <Button className="w-full justify-start" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>

          {canEdit && (
            <Button className="w-full justify-start" variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Ticket
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <AssignTicketModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        ticketId={ticket.id}
        ticketTitle={ticket.title}
        currentContractorId={ticket.contractor_id}
        onSuccess={handleAssignSuccess}
      />
    </>
  )
}