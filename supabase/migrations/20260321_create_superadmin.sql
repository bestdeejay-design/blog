-- Создаем нового супер-админа через Supabase Auth API
-- Этот файл нужно выполнить через Supabase Dashboard SQL Editor

-- Шаг 1: Создаем пользователя через функцию (если есть)
-- Или используем прямой INSERT в auth.users

-- Вариант 1: Прямое добавление в auth.users с правильным хэшем
-- Пароль: Admin@2026Secure!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@blog.local',
  crypt('Admin@2026Secure!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"superadmin","full_name":"Super Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Шаг 2: Добавляем профиль
INSERT INTO user_profiles (id, username, full_name, role, email)
SELECT 
  id,
  'superadmin',
  'Super Admin',
  'super-admin',
  'admin@blog.local'
FROM auth.users
WHERE email = 'admin@blog.local'
ON CONFLICT (id) DO UPDATE SET
  username = 'superadmin',
  full_name = 'Super Admin',
  role = 'super-admin',
  email = 'admin@blog.local';
