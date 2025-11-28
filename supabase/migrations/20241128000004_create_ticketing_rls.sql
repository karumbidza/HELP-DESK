-- Enable RLS on all ticketing tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Tickets policies
CREATE POLICY "Users can view tickets in their organization" ON tickets
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create tickets in their organization" ON tickets
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
        )
        AND requester_id = auth.uid()
    );

CREATE POLICY "Admins and contractors can update tickets in their org" ON tickets
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
            AND role IN ('admin', 'contractor', 'super_admin')
        )
    );

CREATE POLICY "Super admins can manage all tickets" ON tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Ticket updates policies
CREATE POLICY "Users can view ticket updates for their org tickets" ON ticket_updates
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM tickets 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create ticket updates for their org tickets" ON ticket_updates
    FOR INSERT WITH CHECK (
        ticket_id IN (
            SELECT id FROM tickets 
            WHERE organization_id IN (
                SELECT organization_id FROM profiles 
                WHERE id = auth.uid()
            )
        )
        AND created_by = auth.uid()
    );

-- Documents policies
CREATE POLICY "Users can view documents for their org tickets" ON documents
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can upload documents for their org tickets" ON documents
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
        )
        AND uploaded_by = auth.uid()
    );

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (
        uploaded_by = auth.uid()
    );

CREATE POLICY "Admins can delete documents in their org" ON documents
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "System can create notifications for users" ON notifications
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their notification status" ON notifications
    FOR UPDATE USING (
        user_id = auth.uid()
    );

-- Ticket comments policies
CREATE POLICY "Users can view comments for their org tickets" ON ticket_comments
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create comments for their org tickets" ON ticket_comments
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update their own comments" ON ticket_comments
    FOR UPDATE USING (
        created_by = auth.uid()
    );

CREATE POLICY "Admins can delete comments in their org" ON ticket_comments
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );