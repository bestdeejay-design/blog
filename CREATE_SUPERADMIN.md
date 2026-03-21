# Создание супер-админа для блога

## Данные для входа (ТЕКУЩИЙ СУПЕР-АДМИН):
```
Email: best@admin.ru
Пароль: 334144
Username: admin
```

## Если пароль не подходит, создайте нового пользователя:

### Способ 1: Через Supabase Dashboard (РЕКОМЕНДУЕМЫЙ)

1. Перейдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Откройте **SQL Editor**
4. Выполните следующий SQL:

```sql
-- Создаем нового пользователя
-- Email: admin@blog.local
-- Пароль: Admin@2026Secure!
-- Username: superadmin

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Создаем запись в auth.users
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
  ) RETURNING id INTO new_user_id;
  
  -- Создаем профиль
  INSERT INTO user_profiles (id, username, full_name, role, email)
  VALUES (
    new_user_id,
    'superadmin',
    'Super Admin',
    'super-admin',
    'admin@blog.local'
  );
END $$;
```

5. После выполнения запишите новые учетные данные:
   - **Email**: `admin@blog.local`
   - **Пароль**: `Admin@2026Secure!`
   - **Username**: `superadmin`

### Способ 2: Через API (если есть доступ)

Выполните POST запрос на:
```
POST https://YOUR_PROJECT_REF.supabase.co/auth/v1/admin/users
Headers:
  apikey: YOUR_SERVICE_ROLE_KEY
  Authorization: Bearer YOUR_SERVICE_ROLE_KEY
  Content-Type: application/json

Body:
{
  "email": "admin@blog.local",
  "password": "Admin@2026Secure!",
  "user_metadata": {
    "username": "superadmin",
    "full_name": "Super Admin"
  },
  "app_metadata": {
    "role": "super-admin"
  }
}
```

### Проверка пользователя

После создания проверьте пользователя:

```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data->>'username' as username,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'admin@blog.local';
```

## Вход в систему

1. Перейдите на `/api/admin/login`
2. Введите:
   - Email/Username: `admin@blog.local` или `superadmin`
   - Пароль: `Admin@2026Secure!`
3. После входа вы получите cookie и будете перенаправлены в `/dashboard`

## Важно

- Никогда не обновляйте поле `encrypted_password` напрямую через SQL UPDATE
- Всегда используйте `crypt()` функцию для генерации хэша
- Убедитесь, что `email_confirmed_at` установлен (иначе потребуется подтверждение email)
- Роль должна быть установлена и в `auth.users` (app_metadata), и в `user_profiles`
