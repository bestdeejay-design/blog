-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create channels table (sites/news sources)
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    url TEXT,
    description TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table (extends Supabase auth)
-- Note: This table will be populated automatically by Supabase Auth triggers
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'editor',
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-promote first user to super_admin
CREATE OR REPLACE FUNCTION public.auto_promote_first_user()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Check if this is the first user
    SELECT COUNT(*) INTO user_count FROM user_profiles;
    
    IF user_count = 1 THEN
        UPDATE user_profiles SET role = 'super_admin' WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-promote first user
DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;
CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.auto_promote_first_user();

-- Create channel_editors junction table (many-to-many with permissions)
CREATE TABLE IF NOT EXISTS channel_editors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"can_create": true, "can_edit": true, "can_delete": false, "can_publish": false}'::jsonb,
    granted_by UUID REFERENCES user_profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES user_profiles(id),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(channel_id, slug)
);

-- Create news_channels table for multi-channel publishing
CREATE TABLE IF NOT EXISTS news_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    published_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(news_id, channel_id)
);

-- Create indexes for performance
CREATE INDEX idx_channels_slug ON channels(slug);
CREATE INDEX idx_channels_active ON channels(is_active);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_channel_editors_channel ON channel_editors(channel_id);
CREATE INDEX idx_channel_editors_user ON channel_editors(user_id);
CREATE INDEX idx_news_channel ON news(channel_id);
CREATE INDEX idx_news_author ON news(author_id);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_channels_news ON news_channels(news_id);
CREATE INDEX idx_news_channels_channel ON news_channels(channel_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_channels ENABLE ROW LEVEL SECURITY;

-- Channels policies
CREATE POLICY "Public channels are viewable by everyone"
    ON channels FOR SELECT
    USING (is_active = true);

CREATE POLICY "Super admins can manage all channels"
    ON channels FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM user_profiles up
                WHERE up.id = auth.uid()
                AND up.role = 'super_admin'
            )
        )
    );

-- User profiles policies
CREATE POLICY "User profiles are viewable by everyone"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Super admins can manage all profiles"
    ON user_profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM user_profiles up
                WHERE up.id = auth.uid()
                AND up.role = 'super_admin'
            )
        )
    );

-- Channel editors policies
CREATE POLICY "Channel editors are viewable by everyone"
    ON channel_editors FOR SELECT
    USING (true);

CREATE POLICY "Super admins can manage channel editors"
    ON channel_editors FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM user_profiles up
                WHERE up.id = auth.uid()
                AND up.role = 'super_admin'
            )
        )
    );

-- News policies
CREATE POLICY "Published news are viewable by everyone"
    ON news FOR SELECT
    USING (status = 'published');

CREATE POLICY "Authors and editors can view their news"
    ON news FOR SELECT
    USING (
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM channel_editors ce
            WHERE ce.channel_id = news.channel_id
            AND ce.user_id = auth.uid()
        )
    );

CREATE POLICY "Authors and editors can manage their news"
    ON news FOR ALL
    USING (
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM channel_editors ce
            WHERE ce.channel_id = news.channel_id
            AND ce.user_id = auth.uid()
            AND (ce.permissions->>'can_edit')::boolean = true
        )
    );

-- News channels policies
CREATE POLICY "News channels are viewable by everyone"
    ON news_channels FOR SELECT
    USING (true);

CREATE POLICY "Authors and editors can manage news channels"
    ON news_channels FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM news n
            JOIN channel_editors ce ON ce.channel_id = n.channel_id
            WHERE n.id = news_channels.news_id
            AND ce.user_id = auth.uid()
        )
    );
