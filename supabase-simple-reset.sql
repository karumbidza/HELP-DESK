-- ================================================
-- SUPABASE SQL SCRIPT: SIMPLE CLEAN RESET
-- Run this in Supabase SQL Editor to clean all data
-- ================================================

-- Step 1: Clean up all existing data
-- ================================================
DELETE FROM ticket_comments;
DELETE FROM ticket_updates;  
DELETE FROM tickets;
DELETE FROM profiles;
DELETE FROM organizations;

-- Note: We cannot directly delete from auth.users in SQL Editor
-- You'll need to manually delete users in Supabase Auth dashboard
-- OR use the Supabase dashboard Users tab to delete all users

-- Step 2: Reset organizations table
-- ================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (length(name) >= 2 AND length(name) <= 100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make sure organization_id can be NULL for super admin
ALTER TABLE profiles ALTER COLUMN organization_id DROP NOT NULL;

-- Step 3: Create sample organization
-- ================================================
INSERT INTO organizations (name, description) 
VALUES ('Default Company', 'Sample organization for testing');

-- Step 4: Verify cleanup
-- ================================================
SELECT 
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