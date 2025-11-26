# Deployment Guide

This guide covers deploying your SaaS platform to production using Vercel (frontend) and Supabase (backend/database).

## Overview

- **Frontend**: Deployed on Vercel
- **Backend/Database**: Supabase (managed service)
- **Optional**: Railway for self-hosted Supabase

---

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account ([sign up](https://vercel.com))
- [ ] Supabase account ([sign up](https://supabase.com))
- [ ] Railway account (optional, for self-hosting)

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `saas-platform-prod`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free or Pro

### Step 2: Run Database Migrations

1. Open your project in Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and click **Run**
6. Verify tables created: Go to **Table Editor**

### Step 3: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Confirmation email
   - Password reset
   - Invite email

### Step 4: Set Up RLS Policies

RLS policies are created in the migration script, but verify:

1. Go to **Authentication** → **Policies**
2. Verify policies exist for:
   - `organizations`
   - `profiles`
3. Test policies with different users

### Step 5: Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (safe for client-side)
   - **service_role key**: (optional, for server-side admin tasks)

---

## Part 2: Vercel Deployment

### Step 1: Push to GitHub

```bash
cd saas-platform
git add .
git commit -m "Initial commit: SaaS platform ready for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/saas-platform.git
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Configure Environment Variables

In Vercel project settings, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Do NOT add the service role key here for security reasons.

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL: `https://your-project.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your domain: `app.yourdomain.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~5-60 minutes)

---

## Part 3: Post-Deployment Configuration

### Step 1: Update Supabase Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add your production URLs:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**:
     - `https://your-project.vercel.app/**`
     - `http://localhost:3000/**` (for local dev)

### Step 2: Create First Super Admin

```sql
-- In Supabase SQL Editor
-- First, create user via Supabase Auth UI or signup page
-- Then update their role to super_admin

UPDATE profiles
SET role = 'super_admin'
WHERE email = 'your-admin@email.com';
```

### Step 3: Test Production Application

- [ ] Visit your production URL
- [ ] Sign up a new user
- [ ] Verify email confirmation
- [ ] Log in
- [ ] Test dashboard access
- [ ] Verify role-based access control
- [ ] Test organization creation (if super admin)

---

## Part 4: Railway Deployment (Optional Self-Hosting)

If you want to self-host Supabase instead of using their managed service:

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Add PostgreSQL database

### Step 2: Deploy Supabase Stack

```bash
# Clone Supabase
git clone --depth 1 https://github.com/supabase/supabase

# Navigate to docker directory
cd supabase/docker

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Deploy to Railway
railway up
```

### Step 3: Configure Services

In Railway:
- **Postgres**: Pre-configured
- **Kong**: API Gateway
- **GoTrue**: Authentication service
- **PostgREST**: REST API
- **Realtime**: WebSocket server

### Step 4: Update Application

Update your `.env.local` and Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-railway-url.railway.app
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_generated_anon_key
```

---

## Monitoring & Maintenance

### Vercel Monitoring

1. Go to **Analytics** tab
2. Monitor:
   - Page views
   - Performance metrics
   - Error rates
   - Build times

### Supabase Monitoring

1. Go to **Reports** in Supabase Dashboard
2. Monitor:
   - API requests
   - Database performance
   - Storage usage
   - Auth activity

### Logs

**Vercel Logs**:
- Go to **Deployments** → Select deployment → **Logs**

**Supabase Logs**:
- Go to **Logs** in sidebar
- Filter by severity, service, etc.

---

## Backup Strategy

### Supabase Backups

Supabase Pro plan includes:
- Daily automatic backups
- Point-in-time recovery
- 7-day backup retention

**Manual Backup**:
```bash
# Using pg_dump
pg_dump postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres > backup.sql
```

### Code Backups

- GitHub repository serves as code backup
- Tag important releases:
  ```bash
  git tag -a v1.0.0 -m "Production release v1.0.0"
  git push origin v1.0.0
  ```

---

## CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests
- **Development**: Commits to `dev` branch

### Deployment Protection

1. In Vercel → **Settings** → **Git**
2. Enable:
   - [ ] Deploy only production branch
   - [ ] Require approval for deployments
   - [ ] Run Lighthouse checks

---

## Security Checklist

- [ ] Environment variables configured correctly
- [ ] Service role key NOT exposed to client
- [ ] RLS policies tested and verified
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured in Supabase
- [ ] Rate limiting enabled
- [ ] Email confirmation required for signup
- [ ] Strong password policy configured

---

## Troubleshooting

### Issue: Authentication not working

**Solution**:
- Verify redirect URLs in Supabase
- Check environment variables in Vercel
- Clear browser cookies and cache

### Issue: RLS policies blocking queries

**Solution**:
```sql
-- Temporarily disable RLS for testing (NOT IN PRODUCTION)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Issue: Build fails on Vercel

**Solution**:
- Check build logs in Vercel
- Verify all dependencies in `package.json`
- Test build locally: `npm run build`

### Issue: Slow page loads

**Solution**:
- Enable Vercel Edge Functions
- Optimize images with `next/image`
- Review database query performance
- Add appropriate indexes

---

## Scaling Considerations

### Database Scaling (Supabase)

- **Free Plan**: 500MB database, 2GB bandwidth
- **Pro Plan**: 8GB database, 50GB bandwidth
- **Enterprise**: Custom limits

### Vercel Scaling

- Automatic scaling with serverless functions
- Edge Network for global distribution
- Consider upgrading to Pro for:
  - More bandwidth
  - Priority support
  - Advanced analytics

---

## Cost Estimates

### Supabase
- **Free**: $0/month (good for development)
- **Pro**: $25/month (production recommended)
- **Enterprise**: Custom pricing

### Vercel
- **Hobby**: $0/month (personal projects)
- **Pro**: $20/month/user (commercial projects)
- **Enterprise**: Custom pricing

### Railway (if self-hosting)
- **Developer**: $5/month minimum
- Pay as you grow based on usage

---

## Next Steps After Deployment

1. **Monitor Performance**: Set up alerts
2. **Gather Feedback**: Use analytics to understand user behavior
3. **Iterate**: Deploy improvements regularly
4. **Scale**: Upgrade plans as you grow
5. **Backup**: Regular database backups
6. **Security**: Regular security audits

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)

---

**Deployment Complete!** 🎉

Your SaaS platform is now live and ready for users.
