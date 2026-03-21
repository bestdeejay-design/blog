-- Fix RLS policies to avoid infinite recursion
-- Execute this in Supabase SQL Editor

-- Drop old problematic policies
DROP POLICY IF EXISTS "Public channels are viewable by everyone" ON channels;
DROP POLICY IF EXISTS "Super admins can manage all channels" ON channels;
DROP POLICY IF EXISTS "User profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Channel editors are viewable by everyone" ON channel_editors;
DROP POLICY IF EXISTS "Super admins can manage channel editors" ON channel_editors;
DROP POLICY IF EXISTS "Published news are viewable by everyone" ON news;
DROP POLICY IF EXISTS "Authors and editors can view their news" ON news;
DROP POLICY IF EXISTS "Authors and editors can manage their news" ON news;
DROP POLICY IF EXISTS "News channels are viewable by everyone" ON news_channels;
DROP POLICY IF EXISTS "Authors and editors can manage news channels" ON news_channels;

-- Create new fixed policies

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
