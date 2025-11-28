'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreateTicketRequest, TicketCategory, TicketPriority } from '@/types/tickets'

const priorityOptions: { value: TicketPriority; label: string; description: string }[] = [
  {
    value: 'low',
    label: 'Low',
    description: 'Non-urgent issues that can wait'
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Standard issues requiring attention'
  },
  {
    value: 'high',
    label: 'High',
    description: 'Important issues affecting productivity'
  },
  {
    value: 'urgent',
    label: 'Urgent',
    description: 'Critical issues requiring immediate attention'
  }
]

const categoryOptions: { value: TicketCategory; label: string; description: string }[] = [
  {
    value: 'IT',
    label: 'IT Support',
    description: 'Computer, network, or software issues'
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    description: 'Building, equipment, or facility maintenance'
  },
  {
    value: 'projects',
    label: 'Projects',
    description: 'Project-related work or installations'
  },
  {
    value: 'sales',
    label: 'Sales Support',
    description: 'Sales-related assistance or setup'
  },
  {
    value: 'stores',
    label: 'Store Operations',
    description: 'Retail store operational support'
  },
  {
    value: 'general',
    label: 'General',
    description: 'Other general requests'
  }
]

export default function CreateTicketPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateTicketRequest>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    site_location: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ticket')
      }

      setSuccess('Ticket created successfully!')
      
      // Redirect to ticket detail page after a short delay
      setTimeout(() => {
        router.push(`/tickets/${data.ticket.id}`)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateTicketRequest) => (
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
        <p className="mt-1 text-gray-600">
          Submit a new support request or work order
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
          <CardDescription>
            Provide clear information about your request to help us assist you quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue..."
                value={formData.title}
                onChange={(e) => handleInputChange('title')(e.target.value)}
                required
                minLength={5}
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the issue, steps to reproduce, or specific requirements..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description')(e.target.value)}
                required
                minLength={10}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Minimum 10 characters. Current: {formData.description.length}
              </p>
            </div>

            {/* Priority and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={handleInputChange('priority')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={handleInputChange('category')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Site Location */}
            <div className="space-y-2">
              <Label htmlFor="site_location">Site Location</Label>
              <Input
                id="site_location"
                placeholder="Building, floor, room number, or specific location..."
                value={formData.site_location}
                onChange={(e) => handleInputChange('site_location')(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Optional: Specific location where work needs to be performed
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || formData.title.length < 5 || formData.description.length < 10}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}