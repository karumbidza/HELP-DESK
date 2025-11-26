# 🔧 Vercel + Supabase Connection Troubleshooting

## Common "Something doesn't exist" Error - SOLUTIONS

### Problem: Can't connect to Supabase or "doesn't exist" error in Vercel

This usually happens due to one of these reasons:

---

## ✅ Solution 1: Make Sure You Have a Supabase Project

### Check if Supabase project exists:

1. Go to: [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in
3. Do you see a project listed?

**If NO projects exist:**

### Create Supabase Project First (5 minutes):

1. Click **"New Project"**
2. Fill in:
   - **Name**: `help-desk-prod`
   - **Database Password**: Click generate (SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `US East (N. Virginia)`)
3. Click **"Create new project"**
4. **Wait 2-3 minutes** for project to initialize

### Run Database Migration:

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open this file on your Mac: `saas-platform/supabase/migrations/001_initial_schema.sql`
4. Copy ALL contents (Cmd+A, Cmd+C)
5. Paste into Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. You should see: ✅ "Success. No rows returned"

### Get Your API Keys:

1. Go to **Settings** (gear icon, bottom left)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

**COPY THESE - YOU'LL NEED THEM!**

---

## ✅ Solution 2: Vercel Environment Variables Format

The error might be in how you're adding variables. Here's the EXACT format:

### In Vercel Dashboard:

When adding environment variables, use this format:

```
Variable Name (exactly as shown):
NEXT_PUBLIC_SUPABASE_URL

Value (your actual URL):
https://xxxxxxxxxxxxx.supabase.co

Environment (select ALL three):
☑ Production
☑ Preview  
☑ Development
```

```
Variable Name (exactly as shown):
NEXT_PUBLIC_SUPABASE_ANON_KEY

Value (your actual key - starts with eyJ):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz...

Environment (select ALL three):
☑ Production
☑ Preview
☑ Development
```

**IMPORTANT**: 
- ❌ NO quotes around values
- ❌ NO spaces before/after
- ❌ NO trailing slashes in URL
- ✅ Copy-paste directly from Supabase

---

## ✅ Solution 3: Deploy Without Integration First

If Vercel's Supabase integration isn't working, just add variables manually:

### Step-by-Step:

1. **Import GitHub Repo**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Find `karumbidza/HELP-DESK`
   - Click "Import"

2. **Configure Project**:
   - Project Name: `help-desk` (or whatever you want)
   - Framework: Next.js (should be auto-detected)
   - Root Directory: `./`
   - ✅ Leave build settings as default

3. **Add Environment Variables MANUALLY**:
   - Expand "Environment Variables" section
   - Click "Add" or the input field
   - Add first variable:
     ```
     NAME: NEXT_PUBLIC_SUPABASE_URL
     VALUE: [paste your Supabase project URL]
     ```
   - Click "Add" again for second variable:
     ```
     NAME: NEXT_PUBLIC_SUPABASE_ANON_KEY
     VALUE: [paste your Supabase anon key]
     ```

4. **Deploy**:
   - Click "Deploy" button
   - Wait 2-3 minutes

---

## ✅ Solution 4: Use Vercel CLI (Easiest!)

If the dashboard isn't working, use the command line:

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to your project
cd "/Users/allen/projects/Help desk/saas-platform"

# Login to Vercel
vercel login
# This will open browser - sign in with GitHub

# Deploy
vercel

# Answer prompts:
# Set up and deploy? Y
# Which scope? [select your account]
# Link to existing project? N
# What's your project's name? help-desk
# In which directory is your code? ./
# Want to override settings? N

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# When prompted, paste your Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# When prompted, paste your Supabase anon key

# Deploy to production
vercel --prod
```

---

## 🐛 Specific Error Messages & Solutions

### Error: "Project does not exist"
**Solution**: Make sure you've created a Supabase project first (see Solution 1)

### Error: "Invalid API key"
**Solution**: 
1. Copy the ANON key (not the service role key!)
2. Copy the ENTIRE key (starts with `eyJ`, ends with long string)
3. No spaces or line breaks

### Error: "Failed to connect to database"
**Solution**:
1. Check if database migration ran successfully
2. Verify RLS policies were created
3. Check Supabase project is not paused (free tier auto-pauses after inactivity)

### Error: "Authentication failed"
**Solution**:
1. After deploying, add Vercel URL to Supabase redirect URLs
2. Go to Supabase: Authentication → URL Configuration
3. Add: `https://your-app.vercel.app/**`

---

## 📋 Quick Checklist

Before deploying, verify:

- [ ] Supabase project created and initialized
- [ ] Database migration SQL has been run
- [ ] Can see `organizations` and `profiles` tables in Supabase
- [ ] Copied Project URL from Supabase Settings → API
- [ ] Copied anon public key from Supabase Settings → API
- [ ] Both environment variables added to Vercel
- [ ] All three environments selected (Production, Preview, Development)

---

## 🎯 If Nothing Works - Start Fresh

### Complete Fresh Setup (10 minutes):

1. **Create New Supabase Project**:
   ```
   1. Go to supabase.com
   2. New Project
   3. Name: help-desk-fresh
   4. Generate password (save it!)
   5. Create
   6. Wait for initialization
   ```

2. **Run Migration**:
   ```
   1. SQL Editor → New Query
   2. Paste migration SQL
   3. Run
   4. Verify tables created
   ```

3. **Get Fresh API Keys**:
   ```
   1. Settings → API
   2. Copy Project URL
   3. Copy anon public key
   ```

4. **Deploy via CLI**:
   ```bash
   cd "/Users/allen/projects/Help desk/saas-platform"
   vercel login
   vercel
   # Answer prompts
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel --prod
   ```

5. **Update Supabase URLs**:
   ```
   1. Copy your Vercel URL
   2. Add to Supabase Auth → URL Configuration
   3. Add redirect URLs
   4. Save
   ```

---

## 💡 Pro Tips

1. **Use .env.local locally first**: Test that your Supabase connection works locally before deploying
2. **Check Supabase logs**: Dashboard → Logs to see connection attempts
3. **Test anon key**: Try making a simple query in Supabase to verify key works
4. **Vercel logs**: Check deployment logs for specific error messages

---

## 🆘 Still Stuck?

Share the exact error message you're seeing:
1. Screenshot the error
2. Check Vercel deployment logs
3. Check browser console (F12) for errors

**Need help?** Let me know the exact error message and I'll help you fix it!

---

## 📞 Quick Access

- **Supabase Dashboard**: [app.supabase.com](https://app.supabase.com)
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Your GitHub Repo**: [github.com/karumbidza/HELP-DESK](https://github.com/karumbidza/HELP-DESK)
