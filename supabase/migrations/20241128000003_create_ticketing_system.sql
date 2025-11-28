-- Create ENUM types for better data validation
CREATE TYPE ticket_status AS ENUM ('open', 'assigned', 'accepted', 'in_progress', 'completed', 'closed', 'cancelled');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_category AS ENUM ('IT', 'maintenance', 'projects', 'sales', 'stores', 'general');
CREATE TYPE update_type AS ENUM ('created', 'assigned', 'accepted', 'rejected', 'arrived', 'in_progress', 'completed', 'closed', 'cancelled');
CREATE TYPE document_type AS ENUM ('permit_to_work', 'job_card', 'invoice', 'proof_of_payment', 'quote', 'photo', 'other');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'whatsapp', 'push');
CREATE TYPE notification_status AS ENUM ('sent', 'pending', 'failed');

-- Tickets table
CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 200),
    description TEXT NOT NULL CHECK (length(description) >= 10),
    status ticket_status DEFAULT 'open' NOT NULL,
    priority ticket_priority DEFAULT 'medium' NOT NULL,
    category ticket_category DEFAULT 'general' NOT NULL,
    site_location TEXT,
    
    -- User relationships
    requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    contractor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Additional contractor info
    contractor_name TEXT,
    estimated_duration INTEGER, -- in minutes
    scheduled_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status_progression CHECK (
        CASE 
            WHEN status = 'assigned' THEN admin_id IS NOT NULL AND contractor_id IS NOT NULL
            WHEN status IN ('accepted', 'in_progress', 'completed') THEN contractor_id IS NOT NULL
            ELSE true
        END
    )
);

-- Ticket updates table for audit trail
CREATE TABLE ticket_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    update_type update_type NOT NULL,
    description TEXT,
    notes TEXT,
    
    -- Who made the update
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional context
    metadata JSONB DEFAULT '{}' -- For storing additional update-specific data
);

-- Documents table
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    document_type document_type NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    
    -- Metadata
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Storage
    storage_bucket TEXT DEFAULT 'documents',
    public_url TEXT
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    
    message TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    status notification_status DEFAULT 'pending' NOT NULL,
    
    -- Delivery tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional data (email addresses, phone numbers, etc.)
    metadata JSONB DEFAULT '{}'
);

-- Comments table for ticket discussions
CREATE TABLE ticket_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    comment TEXT NOT NULL CHECK (length(comment) >= 1),
    is_internal BOOLEAN DEFAULT false, -- Internal admin/contractor notes
    
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tickets_organization_id ON tickets(organization_id);
CREATE INDEX idx_tickets_requester_id ON tickets(requester_id);
CREATE INDEX idx_tickets_admin_id ON tickets(admin_id);
CREATE INDEX idx_tickets_contractor_id ON tickets(contractor_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_updated_at ON tickets(updated_at DESC);

CREATE INDEX idx_ticket_updates_ticket_id ON ticket_updates(ticket_id);
CREATE INDEX idx_ticket_updates_created_at ON ticket_updates(created_at DESC);

CREATE INDEX idx_documents_ticket_id ON documents(ticket_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_ticket_id ON notifications(ticket_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at 
    BEFORE UPDATE ON ticket_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create ticket update when ticket status changes
CREATE OR REPLACE FUNCTION create_ticket_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create update if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO ticket_updates (
            ticket_id,
            update_type,
            description,
            created_by
        ) VALUES (
            NEW.id,
            NEW.status::update_type,
            CASE NEW.status
                WHEN 'assigned' THEN 'Ticket assigned to contractor'
                WHEN 'accepted' THEN 'Contractor accepted the ticket'
                WHEN 'rejected' THEN 'Contractor rejected the ticket'
                WHEN 'in_progress' THEN 'Work has started on this ticket'
                WHEN 'completed' THEN 'Work has been completed'
                WHEN 'closed' THEN 'Ticket has been closed'
                WHEN 'cancelled' THEN 'Ticket has been cancelled'
                ELSE 'Status updated to ' || NEW.status
            END,
            COALESCE(NEW.admin_id, NEW.contractor_id, NEW.requester_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ticket_status_change_trigger
    AFTER UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION create_ticket_status_update();