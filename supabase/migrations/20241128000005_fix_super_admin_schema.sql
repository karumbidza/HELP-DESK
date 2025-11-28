-- Update profiles table to allow NULL organization_id for super admin
ALTER TABLE profiles ALTER COLUMN organization_id DROP NOT NULL;

-- Update RLS policies to handle super admin correctly

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;

-- Create new policies with proper super admin handling
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (
        id = auth.uid()
    );

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (
        id = auth.uid()
    );

CREATE POLICY "Admins can view profiles in their organization" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role IN ('org_admin', 'super_admin')
            AND (
                admin_profile.role = 'super_admin' 
                OR admin_profile.organization_id = profiles.organization_id
            )
        )
    );

CREATE POLICY "Admins can create profiles in their organization" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role IN ('org_admin', 'super_admin')
            AND (
                admin_profile.role = 'super_admin' 
                OR admin_profile.organization_id = organization_id
            )
        )
    );

CREATE POLICY "Admins can update profiles in their organization" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role IN ('org_admin', 'super_admin')
            AND (
                admin_profile.role = 'super_admin' 
                OR admin_profile.organization_id = profiles.organization_id
            )
        )
    );

-- Super admin specific policies
CREATE POLICY "Super admin can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Update organizations policies for super admin
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;

CREATE POLICY "Super admin can manage all organizations" ON organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

CREATE POLICY "Organization members can view their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid()
        )
    );