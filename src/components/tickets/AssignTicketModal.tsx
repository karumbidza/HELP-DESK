'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, User, Clock, Calendar } from 'lucide-react'
import { AssignTicketRequest } from '@/types/tickets'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
}

interface AssignTicketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: string
  ticketTitle: string
  currentContractorId?: string | null
  onSuccess?: () => void
}

export function AssignTicketModal({ 
  open, 
  onOpenChange, 
  ticketId, 
  ticketTitle,
  currentContractorId,
  onSuccess 
}: AssignTicketModalProps) {
  const [contractors, setContractors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingContractors, setLoadingContractors] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<AssignTicketRequest>({
    contractor_id: currentContractorId || '',
    notes: '',
    estimated_duration: undefined,
    scheduled_arrival: ''
  })

  // Load contractors when modal opens
  useEffect(() => {
    if (open) {
      loadContractors()
    }
  }, [open])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        contractor_id: currentContractorId || '',
        notes: '',
        estimated_duration: undefined,
        scheduled_arrival: ''
      })
      setError(null)
      setSuccess(null)
    }
  }, [open, currentContractorId])

  const loadContractors = async () => {
    setLoadingContractors(true)
    try {
      const response = await fetch('/api/users?role=contractor')
      const data = await response.json()
      
      if (response.ok) {
        setContractors(data.users || [])
      } else {
        setError('Failed to load contractors')
      }
    } catch (err) {
      setError('Failed to load contractors')
    } finally {
      setLoadingContractors(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.contractor_id) {
      setError('Please select a contractor')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload: AssignTicketRequest = {
        contractor_id: formData.contractor_id,
        notes: formData.notes || undefined,
        estimated_duration: formData.estimated_duration || undefined,
        scheduled_arrival: formData.scheduled_arrival || undefined
      }

      const response = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign ticket')
      }

      setSuccess(`Ticket assigned to ${data.contractor.name}`)
      
      // Close modal after a delay and trigger success callback
      setTimeout(() => {
        onSuccess?.()
        onOpenChange(false)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUnassign = async () => {
    if (!currentContractorId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unassign ticket')
      }

      setSuccess('Ticket unassigned successfully')
      
      setTimeout(() => {
        onSuccess?.()
        onOpenChange(false)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const selectedContractor = contractors.find(c => c.id === formData.contractor_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentContractorId ? 'Reassign Ticket' : 'Assign Ticket'}
          </DialogTitle>
          <DialogDescription>
            Assign "{ticketTitle}" to a contractor
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contractor Selection */}
          <div className="space-y-2">
            <Label htmlFor="contractor">Contractor *</Label>
            {loadingContractors ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading contractors...</span>
              </div>
            ) : (
              <Select 
                value={formData.contractor_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, contractor_id: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contractor" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{contractor.full_name}</div>
                          <div className="text-xs text-gray-500">{contractor.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  {contractors.length === 0 && (
                    <div className="px-2 py-1 text-sm text-gray-500">
                      No contractors available
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Estimated Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (hours)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="2.0"
                  className="pl-10"
                  value={formData.estimated_duration || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimated_duration: e.target.value ? parseFloat(e.target.value) * 60 : undefined // Convert to minutes
                  }))}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Scheduled Arrival */}
            <div className="space-y-2">
              <Label htmlFor="arrival">Scheduled Arrival</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="arrival"
                  type="datetime-local"
                  className="pl-10"
                  value={formData.scheduled_arrival}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_arrival: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes</Label>
            <Textarea
              id="notes"
              placeholder="Special instructions, requirements, or notes for the contractor..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Selected Contractor Info */}
          {selectedContractor && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900">Selected Contractor</h4>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800">{selectedContractor.full_name}</span>
                <span className="text-blue-600 text-sm">({selectedContractor.email})</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentContractorId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleUnassign}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Unassign
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.contractor_id || loadingContractors}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  currentContractorId ? 'Reassign' : 'Assign Ticket'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}