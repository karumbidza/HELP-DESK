# Quick Start Guide

Get your SaaS platform running in 10 minutes! 🚀

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] A Supabase account (free)
- [ ] A code editor (VS Code recommended)

---

## Step 1: Install Dependencies (2 minutes)

```bash
cd saas-platform
npm install
```

Expected output: ~375 packages installed

---

## Step 2: Set Up Supabase (3 minutes)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `saas-platform-dev`
   - **Database Password**: Generate and save it
   - **Region**: Choose closest to you
4. Wait ~2 minutes for project to initialize

### 2.2 Get API Keys

1. Click on your project
2. Go to **Settings** (gear icon) → **API**
3. Find these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (long string starting with eyJ)

---

## Step 3: Configure Environment (1 minute)

Create `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-long-key-here
```

---

## Step 4: Set Up Database (2 minutes)

### 4.1 Open SQL Editor

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"**

### 4.2 Run Migration

1. Open `supabase/migrations/001_initial_schema.sql` in your code editor
2. **Copy ALL contents** (Cmd+A, Cmd+C)
3. **Paste** into Supabase SQL Editor
4. Click **"Run"** (bottom right)

You should see: ✅ Success. No rows returned

### 4.3 Verify Tables Created

1. Click **Table Editor** (left sidebar)
2. You should see:
   - ✅ organizations
   - ✅ profiles

---

## Step 5: Start Development Server (1 minute)

```bash
npm run dev
```

Expected output:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in xxxms
```

---

## Step 6: Test Your Application (1 minute)

### 6.1 Open Application

Visit: [http://localhost:3000](http://localhost:3000)

You should see the landing page! 🎉

### 6.2 Create Your First Account

1. Click **"Get Started"** or **"Sign Up"**
2. Fill in:
   - **Full Name**: Your name
   - **Email**: your@email.com
   - **Password**: At least 6 characters
   - **Role**: Select "User" or "Contractor"
3. Click **"Create account"**

### 6.3 Check Email

Supabase will send a confirmation email to verify your account.

**⚠️ Important**: Check your spam folder if you don't see it.

### 6.4 Confirm Email

1. Open the confirmation email
2. Click **"Confirm your email"**
3. You'll be redirected to the login page

### 6.5 Sign In

1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Enter your email and password
3. Click **"Sign in"**

**Success!** You should now see your dashboard! 🎊

---

## Step 7: Create a Super Admin (Optional)

To access admin features like organization management:

### 7.1 Get Your User ID

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Find your user and copy the **ID** (UUID format)

### 7.2 Upgrade to Super Admin

1. Go to **SQL Editor**
2. Run this query (replace `your-user-id`):

```sql
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'your-user-id-here';
```

3. Click **"Run"**

### 7.3 Refresh Your Dashboard

1. Go back to your app
2. Refresh the page (Cmd+R / Ctrl+R)
3. You should now see admin options in the sidebar! 🎉

---

## 🎯 What You Can Do Now

### As a Regular User
- ✅ View your dashboard
- ✅ Update your profile
- ✅ See stats and activity

### As a Super Admin
- ✅ View all organizations
- ✅ Manage all users
- ✅ Access analytics
- ✅ Create new organizations

---

## Troubleshooting

### Problem: "Invalid API key"

**Solution**: Double-check your `.env.local` file:
- Ensure no extra spaces
- Verify keys are correct
- Restart dev server: `Ctrl+C`, then `npm run dev`

### Problem: "Row Level Security policy violation"

**Solution**: Make sure you ran the full migration SQL:
```bash
# Verify tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Problem: Email not received

**Solutions**:
1. Check spam folder
2. Wait 5 minutes (sometimes delayed)
3. In Supabase Dashboard → **Authentication** → **Users**:
   - Find your user
   - Click the `...` menu
   - Select "Send verification email"

### Problem: Can't see admin features

**Solution**: Verify your role:
```sql
SELECT email, role FROM profiles WHERE email = 'your@email.com';
```

Should return `super_admin` if you want admin access.

---

## 📚 Next Steps

Now that you're up and running, explore:

1. **[README.md](README.md)** - Full documentation
2. **[DATABASE.md](supabase/DATABASE.md)** - Database schema details
3. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to production

### Add More Features

- [ ] Project management
- [ ] Task assignment
- [ ] Time tracking
- [ ] Billing integration
- [ ] Email notifications

### Customize Your App

- [ ] Change colors in `tailwind.config.js`
- [ ] Update branding in components
- [ ] Add your logo
- [ ] Customize email templates in Supabase

---

## 🆘 Need Help?

- **Database Issues**: Check [supabase/DATABASE.md](supabase/DATABASE.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Congratulations!** 🎉 You now have a fully functional multi-tenant SaaS platform!

Happy coding! 💻✨
