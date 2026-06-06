-- =====================================================
-- BLOG NEWS MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Run this in your Supabase SQL Editor to set up the database
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CHANNELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_channels_slug ON channels(slug);

-- =====================================================
-- 2. USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'editor',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- =====================================================
-- 3. NEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  author_id UUID REFERENCES user_profiles(id),
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  thumbnail TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_channel_id ON news(channel_id);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_news_title_search ON news USING gin(to_tsvector('russian', title));

-- =====================================================
-- 4. NEWS-CHANNELS JUNCTION TABLE (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS news_channels (
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, channel_id)
);

-- Index for junction table
CREATE INDEX IF NOT EXISTS idx_news_channels_news_id ON news_channels(news_id);
CREATE INDEX IF NOT EXISTS idx_news_channels_channel_id ON news_channels(channel_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_channels ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CHANNELS POLICIES
-- =====================================================

-- Anyone can view channels
CREATE POLICY "Public can view channels"
ON channels FOR SELECT
USING (true);

-- Only authenticated users can create/update/delete channels
CREATE POLICY "Authenticated users can manage channels"
ON channels FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Super admins can manage all profiles
CREATE POLICY "Super admins can manage all profiles"
ON user_profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- =====================================================
-- NEWS POLICIES
-- =====================================================

-- Public can view published news
CREATE POLICY "Public can view published news"
ON news FOR SELECT
USING (status = 'published');

-- Authenticated users can view all news (including drafts)
CREATE POLICY "Authenticated users can view all news"
ON news FOR SELECT
USING (auth.role() = 'authenticated');

-- Authors can create news
CREATE POLICY "Authors can create news"
ON news FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own news
CREATE POLICY "Authors can update own news"
ON news FOR UPDATE
USING (auth.uid() = author_id);

-- Authors can delete their own news
CREATE POLICY "Authors can delete own news"
ON news FOR DELETE
USING (auth.uid() = author_id);

-- Super admins can do anything with news
CREATE POLICY "Super admins full access to news"
ON news FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- =====================================================
-- NEWS_CHANNELS POLICIES
-- =====================================================

-- Public can view news-channel relationships
CREATE POLICY "Public can view news_channels"
ON news_channels FOR SELECT
USING (true);

-- Authenticated users can manage news-channel relationships
CREATE POLICY "Authenticated users can manage news_channels"
ON news_channels FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 6. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. SEED DATA (Optional - Remove in production)
-- =====================================================

-- Create default channel
INSERT INTO channels (name, slug, description) VALUES
  ('Main News', 'main-news', 'Primary news channel')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 8. CREATE FIRST SUPER ADMIN FUNCTION
-- =====================================================

-- This function creates a super admin user
-- Call it after signing up with Supabase Auth
CREATE OR REPLACE FUNCTION create_super_admin(
  p_user_id UUID,
  p_username VARCHAR(255),
  p_full_name VARCHAR(255) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_profiles (id, username, full_name, role)
  VALUES (p_user_id, p_username, p_full_name, 'super_admin')
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USAGE EXAMPLE:
-- =====================================================
-- 1. Sign up via Supabase Auth dashboard or API
-- 2. Get the user ID from auth.users
-- 3. Run: SELECT create_super_admin('user-id-here', 'admin', 'Administrator');
-- =====================================================

-- =====================================================
-- 9. HELPER VIEWS
-- =====================================================

-- View: Published news with channel info
CREATE OR REPLACE VIEW published_news_with_channels AS
SELECT 
  n.*,
  c.name as channel_name,
  c.slug as channel_slug,
  u.username as author_username,
  u.full_name as author_name
FROM news n
LEFT JOIN channels c ON n.channel_id = c.id
LEFT JOIN user_profiles u ON n.author_id = u.id
WHERE n.status = 'published'
ORDER BY n.published_at DESC;

-- View: News count by channel
CREATE OR REPLACE VIEW news_count_by_channel AS
SELECT 
  c.id,
  c.name,
  c.slug,
  COUNT(n.id) as news_count,
  COUNT(CASE WHEN n.status = 'published' THEN 1 END) as published_count,
  COUNT(CASE WHEN n.status = 'draft' THEN 1 END) as draft_count
FROM channels c
LEFT JOIN news n ON c.id = n.channel_id
GROUP BY c.id, c.name, c.slug;

-- =====================================================
-- SETUP COMPLETE! ✅
-- =====================================================
-- Your database is now ready to use.
-- Next steps:
-- 1. Configure environment variables
-- 2. Create first super admin user
-- 3. Start the development server
-- =====================================================
