// Ticket system types

// Ticket types
export type TicketStatus = 'open' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'closed' | 'cancelled'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory = 'IT' | 'maintenance' | 'projects' | 'sales' | 'stores' | 'general'
export type UpdateType = 'created' | 'assigned' | 'accepted' | 'rejected' | 'arrived' | 'in_progress' | 'completed' | 'closed' | 'cancelled'
export type DocumentType = 'permit_to_work' | 'job_card' | 'invoice' | 'proof_of_payment' | 'quote' | 'photo' | 'other'
export type NotificationType = 'email' | 'sms' | 'whatsapp' | 'push'
export type NotificationStatus = 'sent' | 'pending' | 'failed'

// Main ticket interface
export interface Ticket {
  id: string
  organization_id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  site_location: string | null
  
  // User relationships
  requester_id: string | null
  admin_id: string | null
  contractor_id: string | null
  
  // Additional contractor info
  contractor_name: string | null
  estimated_duration: number | null // in minutes
  scheduled_arrival: string | null
  actual_arrival: string | null
  completion_date: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface TicketWithRelations extends Ticket {
  requester?: Profile
  admin?: Profile
  contractor?: Profile
  organization?: Organization
  updates?: TicketUpdate[]
  documents?: Document[]
  comments?: TicketComment[]
}

export interface TicketUpdate {
  id: string
  ticket_id: string
  update_type: UpdateType
  description: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  metadata: Record<string, any>
}

export interface TicketUpdateWithUser extends TicketUpdate {
  created_by_user?: Profile
}

export interface Document {
  id: string
  ticket_id: string
  organization_id: string
  document_type: DocumentType
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  uploaded_by: string | null
  uploaded_at: string
  storage_bucket: string
  public_url: string | null
}

export interface DocumentWithUser extends Document {
  uploaded_by_user?: Profile
}

export interface Notification {
  id: string
  organization_id: string
  user_id: string
  ticket_id: string
  message: string
  notification_type: NotificationType
  status: NotificationStatus
  sent_at: string | null
  failed_reason: string | null
  created_at: string
  metadata: Record<string, any>
}

export interface TicketComment {
  id: string
  ticket_id: string
  organization_id: string
  comment: string
  is_internal: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TicketCommentWithUser extends TicketComment {
  created_by_user?: Profile
}

// Form types
export interface CreateTicketRequest {
  title: string
  description: string
  priority: TicketPriority
  category: TicketCategory
  site_location?: string
}

export interface AssignTicketRequest {
  contractor_id: string
  notes?: string
  estimated_duration?: number
  scheduled_arrival?: string
}

export interface AcceptTicketRequest {
  arrival_time?: string
  duration?: number
  technician_name?: string
  notes?: string
}

export interface RejectTicketRequest {
  reason: string
}

export interface UploadDocumentRequest {
  document_type: DocumentType
  file: File
}

export interface CreateCommentRequest {
  comment: string
  is_internal?: boolean
}

// Filter types
export interface TicketFilters {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  category?: TicketCategory[]
  requester_id?: string
  admin_id?: string
  contractor_id?: string
  site_location?: string
  created_after?: string
  created_before?: string
}

// Dashboard stats
export interface TicketStats {
  total: number
  open: number
  assigned: number
  in_progress: number
  completed: number
  closed: number
  by_priority: Record<TicketPriority, number>
  by_category: Record<TicketCategory, number>
  avg_resolution_time?: number // in hours
}

// Existing types from our current system
export interface Profile {
  id: string
  organization_id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  domain: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type UserRole = 'super_admin' | 'admin' | 'contractor' | 'user'