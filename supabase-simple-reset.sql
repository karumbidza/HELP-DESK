-- ================================================
-- SUPABASE SQL SCRIPT: COMPLETE SETUP AND CLEAN RESET
-- Run this in Supabase SQL Editor to setup/clean all data
-- ================================================

-- Step 1: Create all necessary ENUM types
-- ================================================
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'assigned', 'accepted', 'in_progress', 'completed', 'closed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_category AS ENUM ('IT', 'maintenance', 'projects', 'sales', 'stores', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE update_type AS ENUM ('created', 'assigned', 'accepted', 'rejected', 'arrived', 'in_progress', 'completed', 'closed', 'cancelled', 'status_change', 'comment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create organizations table
-- ================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (length(name) >= 2 AND length(name) <= 100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Ensure profiles table exists with correct structure
-- ================================================
-- Note: profiles table should already exist from Supabase auth
-- But let's make sure it has all the columns we need

DO $$ 
BEGIN 
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
    
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- Add organization_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id') THEN
        ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Make sure organization_id can be NULL for super admin
ALTER TABLE profiles ALTER COLUMN organization_id DROP NOT NULL;

-- Step 4: Create tickets table
-- ================================================
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

-- Step 5: Create ticket_comments table
-- ================================================
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL CHECK (length(message) >= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create ticket_updates table
-- ================================================
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

-- Step 7: Enable RLS on all tables
-- ================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_updates ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for organizations
-- ================================================
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;
CREATE POLICY "Super admins can manage all organizations" ON organizations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "Org admins can view their organization" ON organizations;
CREATE POLICY "Org admins can view their organization" ON organizations
FOR SELECT USING (
    id IN (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid()
        AND role IN ('org_admin', 'user', 'contractor')
    )
);

-- Step 9: NOW CLEAN ALL EXISTING DATA
-- ================================================
DELETE FROM ticket_comments;
DELETE FROM ticket_updates;  
DELETE FROM tickets;
DELETE FROM profiles WHERE role != 'service_role'; -- Don't delete service role
DELETE FROM organizations;

-- Step 10: Create sample organization
-- ================================================
INSERT INTO organizations (name, description) 
VALUES ('Default Company', 'Sample organization for testing the help desk system');

-- Step 11: Verify the setup
-- ================================================
SELECT 
    'Database Setup Complete' as status,
    (SELECT COUNT(*) FROM profiles) as profiles_count,
    (SELECT COUNT(*) FROM organizations) as organizations_count,
    (SELECT COUNT(*) FROM tickets) as tickets_count,
    (SELECT COUNT(*) FROM ticket_comments) as comments_count;

-- Show the organization we created
SELECT 
    'Organization Ready' as status,
    id,
    name,
    description,
    created_at
FROM organizations;

-- Check table structure
SELECT 
    'Tables Created' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'organizations', 'tickets', 'ticket_comments', 'ticket_updates')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;