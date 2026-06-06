# 🚀 Complete Setup Guide

Step-by-step instructions to get your blog system running in under 10 minutes.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **Git** installed ([Download](https://git-scm.com/))
- ✅ **Supabase account** (free tier works) ([Sign up](https://supabase.com))
- ✅ **Basic terminal knowledge**

---

## 🎯 Quick Start (Choose Your Path)

### Option A: Automated Setup (Recommended for first-time)

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/blog.git
cd blog

# Install dependencies
npm install

# Run setup wizard
npm run setup
```

### Option B: Manual Setup (For experienced users)

Follow the detailed steps below.

---

## 📖 Detailed Setup Instructions

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/blog.git
cd blog
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14 & React 18
- Supabase client
- Tailwind CSS
- TypeScript
- Authentication libraries (jose, bcryptjs)
- Icon library (lucide-react)

### Step 3: Setup Supabase Database

#### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Choose organization (or create new)
4. Enter project name (e.g., "My Blog")
5. Set database password (save it!)
6. Choose region (closest to you)
7. Wait ~2 minutes for setup

#### 3.2 Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `supabase/schema.sql`
4. Paste into editor
5. Click **Run** or press `Ctrl+Enter`

You should see: **"Success. No rows returned"**

✅ Database is now set up with:
- All tables (channels, user_profiles, news, news_channels)
- Row Level Security policies
- Indexes for performance
- Helper views
- Triggers for auto-updating timestamps

#### 3.3 Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`) ⚠️ Keep secret!

### Step 4: Configure Environment Variables

#### 4.1 Create .env.local File

```bash
cp .env.local.example .env.local
```

#### 4.2 Edit .env.local

Open `.env.local` in your editor and fill in:

```env
# Required - from Supabase API page
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# Required - Generate with: openssl rand -base64 32
JWT_SECRET=your-random-32-character-secret-key

# Optional - for production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

💡 **Generate JWT Secret:**

```bash
# macOS/Linux
openssl rand -base64 32

# Or use this online tool: https://generate-secret.vercel.app/32
```

### Step 5: Create First User

You have two options:

#### Option A: Using Setup Script (Easiest)

```bash
node scripts/create-first-user.js
```

The script will ask:
- Username (e.g., `admin`)
- Email (can be fake for local dev)
- Password (min 6 characters)
- Full Name (optional)

It will automatically:
- Create user in Supabase Auth
- Set role to `super_admin`
- Show you credentials

⚠️ **Save the credentials it displays!**

#### Option B: Manual Creation via Supabase Dashboard

1. Go to Supabase **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Copy the **User ID** (UUID format)
5. Go to **SQL Editor**
6. Run:

```sql
SELECT create_super_admin('paste-user-id-here', 'admin', 'Administrator');
```

### Step 6: Run Development Server

```bash
npm run dev
```

Server starts on: **http://localhost:3000**

### Step 7: Login to Dashboard

1. Visit: **http://localhost:3000/login**
2. Enter credentials from Step 5
3. You're in! 🎉

---

## ✅ Verify Installation

Checklist to ensure everything works:

- [ ] Can access localhost:3000
- [ ] Can login with credentials
- [ ] See dashboard with stats
- [ ] Can create a news channel
- [ ] Can create a news article
- [ ] Can upload image
- [ ] Can switch themes (light/dark)
- [ ] News appears on news page

If any fail, check troubleshooting below.

---

## 🔧 Troubleshooting

### Issue: "Missing Supabase credentials"

**Solution:**
```bash
# Make sure .env.local exists
ls -la .env.local

# If not, copy example
cp .env.local.example .env.local

# Then edit with your credentials
```

### Issue: "Database relation does not exist"

**Solution:**
1. Go to Supabase SQL Editor
2. Re-run `supabase/schema.sql`
3. Check for errors in output

### Issue: "Invalid API key"

**Solution:**
- Verify you copied correct keys from Supabase
- Check no extra spaces in .env.local
- Restart dev server after changing .env.local

### Issue: "Cannot connect to database"

**Solution:**
- Check Supabase project is active (not paused)
- Verify project URL is correct
- Check internet connection

### Issue: "Login fails with 401"

**Solution:**
- User might not exist - run create-first-user.js
- Check JWT_SECRET is 32+ characters
- Clear browser cookies and try again

---

## 🌐 Deploy to Production (Vercel)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Add environment variables (same as .env.local)
5. Click **Deploy**

### Step 3: Custom Domain (Optional)

1. Vercel → Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Wait for SSL (automatic)

---

## 📊 Post-Setup Tasks

### Recommended Next Steps:

1. **Change default password** immediately
2. **Create additional channels** for different news categories
3. **Set up storage bucket** for media uploads:
   - Supabase → Storage → New Bucket
   - Name: `media`
   - Public: Yes
4. **Configure CORS** if embedding widgets on other domains
5. **Set up monitoring** (Sentry, LogRocket, etc.)

### Optional Enhancements:

- [ ] Add custom domain
- [ ] Set up email notifications
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Enable CDN caching
- [ ] Set up automated backups
- [ ] Add rate limiting
- [ ] Configure SEO meta tags
- [ ] Add social media sharing

---

## 🆘 Getting Help

### Resources:

- 📖 [Full Documentation](README.md)
- 💬 [GitHub Issues](https://github.com/YOUR_USERNAME/blog/issues)
- 📧 Email: support@example.com

### Common Questions:

**Q: Can I use this commercially?**  
A: Yes! MIT license allows commercial use.

**Q: How do I add more users?**  
A: Dashboard → Users tab → Create User

**Q: Can I customize the design?**  
A: Yes! Edit Tailwind classes in components.

**Q: How do I backup data?**  
A: Supabase → Database → Backups (automatic daily)

---

## 🎉 Success!

If you've made it here, your blog system is ready to use!

**Next:** Check out [USAGE.md](USAGE.md) for how to create news and manage your platform.

Happy publishing! 📰✨
