-- Create first super admin user directly in database
-- Execute this in Supabase SQL Editor

-- 1. Create auth user (this will be simplified)
-- For now, let's just use the existing user and update their profile

-- Check existing user
SELECT id, email, confirmed_at FROM auth.users;

-- 2. Make sure user profile exists with super_admin role
UPDATE user_profiles 
SET role = 'super_admin',
    is_active = true
WHERE email = 'dj@li.ru';

-- 3. Verify
SELECT * FROM user_profiles WHERE email = 'dj@li.ru';
