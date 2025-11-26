# Database Schema Documentation

## Overview
This SaaS platform uses a multi-tenant architecture with role-based access control (RBAC). Data isolation is enforced through PostgreSQL Row Level Security (RLS) policies.

## User Roles

### 1. Super Admin (`super_admin`)
- Full access to all organizations
- Can create, read, update, and delete any organization
- Can manage users across all organizations
- System-wide administrative privileges

### 2. Organization Admin (`org_admin`)
- Full access within their organization
- Can manage users within their organization
- Can update organization settings
- Cannot access other organizations

### 3. Contractor (`contractor`)
- Limited access based on assigned projects
- Can view and update assigned tasks
- Read-only access to organization data

### 4. User (`user`)
- Basic access to platform features
- Can view their own data and assigned tasks
- Limited to read-only access for most resources

## Core Tables

### `organizations`
Primary tenant table. Each organization represents a separate customer/tenant.

```sql
id                UUID PRIMARY KEY
name              TEXT NOT NULL
subdomain         TEXT UNIQUE
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

**Relationships:**
- Has many `profiles` (users)

**RLS Policies:**
- Super admins: Full access
- Org admins: Can view and update their own organization
- Users: Can view their own organization

---

### `profiles`
User profiles that extend Supabase's `auth.users` table. Links users to organizations and roles.

```sql
id                UUID PRIMARY KEY (FK to auth.users)
email             TEXT
full_name         TEXT
role              TEXT (enum: super_admin, org_admin, contractor, user)
organization_id   UUID (FK to organizations)
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

**Relationships:**
- Belongs to one `organization`
- One-to-one with `auth.users`

**RLS Policies:**
- Users can view/update their own profile
- Super admins can view/manage all profiles
- Org admins can view/manage profiles in their organization

## Data Isolation Strategy

### Multi-Tenancy Implementation
1. **Organization-based isolation**: All data is scoped to `organization_id`
2. **RLS enforcement**: PostgreSQL enforces data access at the database level
3. **JWT token claims**: User's role and organization stored in auth token

### Security Features
- Row Level Security enabled on all tables
- Policies prevent cross-tenant data access
- Role checks in policies ensure proper authorization
- Automatic profile creation on user signup

## Database Triggers

### `handle_new_user()`
Automatically creates a profile when a user signs up through Supabase Auth.

### `update_updated_at_column()`
Automatically updates the `updated_at` timestamp on record modifications.

## Setup Instructions

### 1. In Supabase Dashboard
1. Go to your project's SQL Editor
2. Copy and paste the contents of `001_initial_schema.sql`
3. Execute the SQL to create tables, policies, and triggers

### 2. Verify Setup
```sql
-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Test Data Isolation
```sql
-- Create test organization
INSERT INTO organizations (name, subdomain)
VALUES ('Test Org', 'test');

-- Verify RLS policies work by querying as different users
```

## Future Enhancements

### Planned Tables
- `projects`: Project management
- `tasks`: Task tracking
- `time_entries`: Time tracking for contractors
- `billing`: Subscription and payment tracking
- `audit_logs`: Activity tracking

### Advanced Features
- Multi-factor authentication
- API key management
- Webhooks for integrations
- Custom fields per organization
- Advanced analytics and reporting

## Migration Strategy

All schema changes should be:
1. Created as numbered migration files: `00X_description.sql`
2. Tested in development environment
3. Documented in this README
4. Applied to production during maintenance windows

## Backup and Recovery

- Supabase automatically backs up your database
- Consider implementing point-in-time recovery
- Export critical data regularly for compliance
- Test restoration procedures quarterly
