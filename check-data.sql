-- Check what we have in the database
SELECT '=== USER PROFILES ===' as info;
SELECT id, username, password, role, full_name, email FROM user_profiles;

SELECT '=== AUTH USERS ===' as info;
SELECT id, email, created_at FROM auth.users;
