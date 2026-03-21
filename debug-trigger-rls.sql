-- Debug trigger and RLS issue
-- Execute this in Supabase SQL Editor

-- 1. Check if trigger exists and is active
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 2. Check RLS status on user_profiles
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as rls_forced
FROM pg_class 
WHERE relname = 'user_profiles';

-- 3. List all policies on user_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. Test if we can insert directly into user_profiles (bypassing trigger)
-- This checks if RLS is blocking the trigger
INSERT INTO user_profiles (id, email, role, is_active)
VALUES (gen_random_uuid(), 'manual_test@example.com', 'editor', true);

-- 5. Check if the insert worked
SELECT * FROM user_profiles WHERE email = 'manual_test@example.com';
