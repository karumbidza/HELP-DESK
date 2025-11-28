'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { AssignTicketModal } from './AssignTicketModal'
import { UserRole } from '@/types/database.types'

interface QuickAssignButtonProps {
  ticketId: string
  ticketTitle: string
  currentContractorId?: string | null
  userRole: UserRole
  onSuccess?: () => void
}

export function QuickAssignButton({ 
  ticketId, 
  ticketTitle, 
  currentContractorId, 
  userRole,
  onSuccess 
}: QuickAssignButtonProps) {
  const [showAssignModal, setShowAssignModal] = useState(false)

  // Only show for admins
  if (!['org_admin', 'super_admin'].includes(userRole)) {
    return null
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowAssignModal(true)
        }}
      >
        <UserPlus className="h-3 w-3 mr-1" />
        {currentContractorId ? 'Reassign' : 'Assign'}
      </Button>

      <AssignTicketModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        ticketId={ticketId}
        ticketTitle={ticketTitle}
        currentContractorId={currentContractorId}
        onSuccess={onSuccess}
      />
    </>
  )
}