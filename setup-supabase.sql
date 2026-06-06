-- Step 1: Add username and password fields to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- Step 2: Update existing user profile (run this AFTER creating user in Auth)
-- First, check what users exist:
-- SELECT id, email FROM auth.users;

-- Then update the profile for your user (replace YOUR_USER_ID with actual UUID):
-- UPDATE user_profiles SET username = 'admin', password = '$2a$10$J0VFNdZUE8vgm6QWHt2fKOAVEEEtwQ6E7/ajGTp5v7fbkdh46RW.6', role = 'super_admin' WHERE id = 'YOUR_USER_ID';
