# 🚀 Vercel Deployment Guide

## Quick Deploy to Vercel (5 minutes)

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Import Your Repository

1. **Go to Vercel**: [vercel.com/new](https://vercel.com/new)
2. **Sign in** with GitHub (if not already)
3. **Import Git Repository**:
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Find and select: `karumbidza/HELP-DESK`
   - Click "Import"

#### Step 2: Configure Project

Vercel will auto-detect Next.js settings:

- ✅ **Framework Preset**: Next.js (auto-detected)
- ✅ **Root Directory**: `./`
- ✅ **Build Command**: `npm run build` (auto)
- ✅ **Output Directory**: `.next` (auto)
- ✅ **Install Command**: `npm install` (auto)

Click "Deploy" if you just want to test, or continue to add environment variables.

#### Step 3: Add Environment Variables

**CRITICAL**: Add your Supabase credentials before deploying:

1. Click **"Environment Variables"** section
2. Add the following variables:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc... (your anon key)
Environment: Production, Preview, Development
```

3. Click **"Deploy"**

#### Step 4: Wait for Deployment (2-3 minutes)

Watch the build logs. You should see:
```
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
✓ Build completed
```

#### Step 5: Success! 🎉

Your app is live at:
```
https://help-desk-xxxxx.vercel.app
```

---

### Option 2: Deploy via Vercel CLI

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Login to Vercel

```bash
vercel login
```

#### Deploy

```bash
cd "/Users/allen/projects/Help desk/saas-platform"
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Select your account**
- Link to existing project? **N**
- What's your project's name? **help-desk** (or your choice)
- In which directory is your code located? **./\**
- Want to modify settings? **N**

#### Add Environment Variables

```bash
# Add production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your Supabase anon key when prompted
```

#### Deploy to Production

```bash
vercel --prod
```

---

## Post-Deployment Configuration

### 1. Update Supabase Redirect URLs

**IMPORTANT**: Add your Vercel URL to Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add to **Redirect URLs**:
   ```
   https://your-project.vercel.app/**
   https://your-project.vercel.app/login
   ```
5. Update **Site URL**:
   ```
   https://your-project.vercel.app
   ```
6. Click **Save**

### 2. Test Your Deployment

Visit your Vercel URL and test:
- [ ] Landing page loads
- [ ] Sign up works
- [ ] Email confirmation works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Role-based navigation works

### 3. Set Up Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

---

## Vercel Environment Variables

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API |

### How to Add Variables in Dashboard

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter variable name and value
5. Select environments: Production, Preview, Development
6. Click **Save**

### How to Update Variables

After adding/updating variables:
1. Go to **Deployments**
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** or **Redeploy from scratch**

---

## Automatic Deployments

### Production Deployments

- **Trigger**: Push to `main` branch
- **URL**: Your production URL
- **Previews**: No

### Preview Deployments

- **Trigger**: Push to any other branch or Pull Request
- **URL**: Unique preview URL per branch/PR
- **Previews**: Yes

### Configuration

In your Vercel project:
- Go to **Settings** → **Git**
- Configure:
  - ✅ Production Branch: `main`
  - ✅ Preview Deployments: All branches
  - ✅ Deployment Protection (optional)

---

## Troubleshooting

### Build Fails with "Module not found"

**Solution**: Make sure all dependencies are in `package.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Environment Variables Not Working

**Solution**:
1. Verify variables are set in Vercel dashboard
2. Make sure variable names are EXACT (case-sensitive)
3. Redeploy after adding variables
4. Check build logs for errors

### Authentication Not Working

**Solution**:
1. Verify Supabase redirect URLs include your Vercel domain
2. Check environment variables are correct
3. Clear browser cache and cookies
4. Check Supabase authentication logs

### "Module parse failed" Error

**Solution**: This is usually a Next.js version issue
```bash
npm install next@latest react@latest react-dom@latest
git add package.json package-lock.json
git commit -m "fix: update Next.js dependencies"
git push
```

---

## Monitoring & Analytics

### Vercel Analytics

1. Go to your project in Vercel
2. Click **Analytics** tab
3. View:
   - Page views
   - Top pages
   - Audience insights
   - Performance metrics

### Vercel Speed Insights

Enable in project settings:
1. **Settings** → **Speed Insights**
2. Enable Speed Insights
3. Deploy to activate

---

## Deployment Checklist

Before going live:

- [ ] Environment variables added to Vercel
- [ ] Database migrations run in Supabase
- [ ] Supabase redirect URLs updated
- [ ] Custom domain configured (if applicable)
- [ ] Test authentication flow
- [ ] Test all user roles
- [ ] Verify email confirmations work
- [ ] Check mobile responsiveness
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (optional)

---

## Quick Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View project info
vercel inspect

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add VARIABLE_NAME
```

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

## Next Steps After Deployment

1. ✅ Share your live URL
2. ✅ Create your first super admin user
3. ✅ Test all features in production
4. ✅ Set up monitoring and alerts
5. ✅ Configure custom domain
6. ✅ Enable HTTPS (automatic with Vercel)
7. ✅ Set up backup strategy

---

**Your app is ready to go live!** 🚀

**Deploy Now**: [vercel.com/new](https://vercel.com/new)
