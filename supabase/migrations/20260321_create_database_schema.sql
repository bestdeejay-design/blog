-- Database schema for blog news system
-- Execute this in Supabase Dashboard SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  url TEXT,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'editor', -- editor, admin, super_admin
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create channel_editors table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS channel_editors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{"read": true, "write": true, "publish": false}',
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
  author_id UUID REFERENCES user_profiles(id), -- NULL разрешен (необязательное поле)
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500),
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, hidden, archived
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create news_channels table (many-to-many for multi-channel publishing)
CREATE TABLE IF NOT EXISTS news_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(news_id, channel_id)
);

-- Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_channel_id ON news(channel_id);
CREATE INDEX IF NOT EXISTS idx_news_channels_news_id ON news_channels(news_id);
CREATE INDEX IF NOT EXISTS idx_news_channels_channel_id ON news_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_editors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Public read access for active channels" ON channels;
DROP POLICY IF EXISTS "Public read access for user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public read published news" ON news;
DROP POLICY IF EXISTS "Authenticated users can read all news" ON news;
DROP POLICY IF EXISTS "Authenticated users can create news" ON news;
DROP POLICY IF EXISTS "Authenticated users can update news" ON news;
DROP POLICY IF EXISTS "Public read news_channels" ON news_channels;
DROP POLICY IF EXISTS "Authenticated users can read channel_editors" ON channel_editors;

-- Policies for channels (public read for active channels)
CREATE POLICY "Public read access for active channels"
  ON channels FOR SELECT
  USING (is_active = true);

-- Policies for user_profiles (users can read all, update own)
CREATE POLICY "Public read access for user profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for news (authenticated users can read drafts, public can read published)
DROP POLICY IF EXISTS "Public read published news" ON news;
CREATE POLICY "Public read published news"
  ON news FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can read all news" ON news;
CREATE POLICY "Authenticated users can read all news"
  ON news FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create news" ON news;
CREATE POLICY "Authenticated users can create news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update news" ON news;
CREATE POLICY "Authenticated users can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for news_channels (public read)
DROP POLICY IF EXISTS "Public read news_channels" ON news_channels;
CREATE POLICY "Public read news_channels"
  ON news_channels FOR SELECT
  USING (true);

-- Policies for channel_editors (authenticated users can read)
DROP POLICY IF EXISTS "Authenticated users can read channel_editors" ON channel_editors;
CREATE POLICY "Authenticated users can read channel_editors"
  ON channel_editors FOR SELECT
  TO authenticated
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at (create if not exists)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_channels_updated_at'
    ) THEN
        CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_news_updated_at'
    ) THEN
        CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
