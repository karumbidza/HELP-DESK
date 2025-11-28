-- ================================================
-- SUPABASE SQL SCRIPT: CLEAN RESET AND CREATE SUPER ADMIN
-- Run this directly in your Supabase SQL Editor
-- ================================================

-- Step 1: Clean up all existing user data
-- ================================================

-- Delete all existing profiles (this will cascade to tickets, comments, etc.)
DELETE FROM profiles;

-- Delete all existing organizations
DELETE FROM organizations;

-- Delete all auth users (this removes all authentication data)
DELETE FROM auth.users;

-- Reset any sequences/counters
-- (Supabase handles UUIDs automatically, so no sequences to reset)

-- Step 2: Create the organizations table structure if it doesn't exist
-- ================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (length(name) >= 2 AND length(name) <= 100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
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

-- Step 3: Ensure profiles table has correct structure
-- ================================================
-- Make sure organization_id can be NULL for super admin
ALTER TABLE profiles ALTER COLUMN organization_id DROP NOT NULL;

-- Add any missing columns (if they don't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id') THEN
        ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Create the Super Admin user directly in auth.users
-- ================================================
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    email_change_token_new,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    last_sign_in_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@helpdesk.com',
    -- This is the bcrypt hash for password 'admin123456'
    '$2a$10$rJ7jXJZNWBvHTtL9JQNzwOH8qOcL9SaGPYmKYJHtPnb2Q2V7jgYoi',
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Super Administrator"}',
    false,
    NOW()
);

-- Step 5: Create the Super Admin profile
-- ================================================
INSERT INTO profiles (
    id,
    email,
    full_name,
    role,
    organization_id,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    'admin@helpdesk.com',
    'Super Administrator',
    'super_admin',
    NULL, -- Super admin has no organization
    NOW(),
    NOW()
FROM auth.users u 
WHERE u.email = 'admin@helpdesk.com'
LIMIT 1;

-- Step 6: Create a sample organization for testing
-- ================================================
INSERT INTO organizations (
    id,
    name,
    description,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Default Company',
    'Sample organization for testing the help desk system',
    NOW(),
    NOW()
);

-- Step 7: Verify the setup
-- ================================================
-- Check that super admin was created
SELECT 
    'Super Admin Created' as status,
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id,
    p.created_at
FROM profiles p
WHERE p.role = 'super_admin';

-- Check that organization was created
SELECT 
    'Organization Created' as status,
    o.id,
    o.name,
    o.description,
    o.created_at
FROM organizations o
WHERE o.name = 'Default Company';

-- Show auth user
SELECT 
    'Auth User Created' as status,
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at
FROM auth.users u
WHERE u.email = 'admin@helpdesk.com';

-- ================================================
-- FINAL RESULT: LOGIN CREDENTIALS
-- ================================================
SELECT 
    '🎉 SUPER ADMIN READY! 🎉' as message,
    'admin@helpdesk.com' as email,
    'admin123456' as password,
    'super_admin' as role,
    'Login at your app /login page' as instructions;