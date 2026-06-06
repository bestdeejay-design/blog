-- 🔧 ИСПРАВЛЕНИЕ: Бесконечная рекурсия в RLS user_profiles

-- Проблема: Политики на user_profiles вызывают рекурсию
-- Решение: Упростить политики и разрешить публичное чтение

-- 1. Отключаем старые политики
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- 2. Создаем простую политику для публичного чтения
CREATE POLICY "Allow public read access" ON user_profiles
  FOR SELECT
  USING (true);

-- 3. Проверяем что политики применены
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;
