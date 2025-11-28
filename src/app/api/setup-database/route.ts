import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is super admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
    }

    // Create the tickets table and related infrastructure
    const createTablesSQL = `
      -- Create ENUM types
      CREATE TYPE IF NOT EXISTS ticket_status AS ENUM ('open', 'assigned', 'accepted', 'in_progress', 'completed', 'closed', 'cancelled');
      CREATE TYPE IF NOT EXISTS ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
      CREATE TYPE IF NOT EXISTS ticket_category AS ENUM ('IT', 'maintenance', 'projects', 'sales', 'stores', 'general');
      CREATE TYPE IF NOT EXISTS update_type AS ENUM ('created', 'assigned', 'accepted', 'rejected', 'arrived', 'in_progress', 'completed', 'closed', 'cancelled', 'status_change', 'comment');
      CREATE TYPE IF NOT EXISTS document_type AS ENUM ('permit_to_work', 'job_card', 'invoice', 'proof_of_payment', 'quote', 'photo', 'other');
      CREATE TYPE IF NOT EXISTS notification_type AS ENUM ('email', 'sms', 'whatsapp', 'push');
      CREATE TYPE IF NOT EXISTS notification_status AS ENUM ('sent', 'pending', 'failed');

      -- Create tickets table
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 200),
        description TEXT NOT NULL CHECK (length(description) >= 10),
        status ticket_status DEFAULT 'open' NOT NULL,
        priority ticket_priority DEFAULT 'medium' NOT NULL,
        category ticket_category DEFAULT 'general' NOT NULL,
        site_location TEXT,
        
        requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        contractor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        
        contractor_name TEXT,
        estimated_duration INTEGER,
        scheduled_arrival TIMESTAMP WITH TIME ZONE,
        actual_arrival TIMESTAMP WITH TIME ZONE,
        completion_date TIMESTAMP WITH TIME ZONE,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create ticket_comments table for chat functionality
      CREATE TABLE IF NOT EXISTS ticket_comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
        user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        message TEXT NOT NULL CHECK (length(message) >= 1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create ticket_updates table for tracking changes
      CREATE TABLE IF NOT EXISTS ticket_updates (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
        user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        update_type update_type NOT NULL,
        description TEXT,
        old_status ticket_status,
        new_status ticket_status,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE ticket_updates ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies for tickets
      CREATE POLICY IF NOT EXISTS "Users can view tickets in their organization" ON tickets
        FOR SELECT USING (
          organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
          )
        );

      CREATE POLICY IF NOT EXISTS "Users can create tickets in their organization" ON tickets
        FOR INSERT WITH CHECK (
          organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
          )
          AND requester_id = auth.uid()
        );

      CREATE POLICY IF NOT EXISTS "Admins and contractors can update tickets in their org" ON tickets
        FOR UPDATE USING (
          organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
            AND role IN ('org_admin', 'contractor', 'super_admin')
          )
        );

      CREATE POLICY IF NOT EXISTS "Super admins can manage all tickets" ON tickets
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
          )
        );

      -- Create RLS policies for ticket_comments
      CREATE POLICY IF NOT EXISTS "Users can view comments for accessible tickets" ON ticket_comments
        FOR SELECT USING (
          ticket_id IN (
            SELECT id FROM tickets WHERE
            organization_id IN (
              SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
            OR requester_id = auth.uid()
            OR contractor_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
            )
          )
        );

      CREATE POLICY IF NOT EXISTS "Users can create comments for accessible tickets" ON ticket_comments
        FOR INSERT WITH CHECK (
          ticket_id IN (
            SELECT id FROM tickets WHERE
            organization_id IN (
              SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
            OR requester_id = auth.uid()
            OR contractor_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
            )
          )
        );

      -- Create RLS policies for ticket_updates
      CREATE POLICY IF NOT EXISTS "Users can view updates for accessible tickets" ON ticket_updates
        FOR SELECT USING (
          ticket_id IN (
            SELECT id FROM tickets WHERE
            organization_id IN (
              SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
            OR requester_id = auth.uid()
            OR contractor_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
            )
          )
        );

      CREATE POLICY IF NOT EXISTS "Users can create updates for accessible tickets" ON ticket_updates
        FOR INSERT WITH CHECK (
          ticket_id IN (
            SELECT id FROM tickets WHERE
            organization_id IN (
              SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
            OR requester_id = auth.uid()
            OR contractor_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
            )
          )
        );
    `

    const { error } = await supabase.rpc('exec', { sql: createTablesSQL })

    if (error) {
      console.error('Database setup error:', error)
      return NextResponse.json({ 
        error: 'Failed to setup database',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Database setup completed successfully',
      tables_created: ['tickets', 'ticket_comments', 'ticket_updates']
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}