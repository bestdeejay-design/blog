-- 🔍 Проверка подключения Qoder к Supabase

-- 1. Проверяем количество записей в каждой таблице
SELECT 
  'news' as table_name, 
  COUNT(*) as record_count 
FROM news
UNION ALL
SELECT 
  'channels' as table_name, 
  COUNT(*) as record_count 
FROM channels
UNION ALL
SELECT 
  'news_channels' as table_name, 
  COUNT(*) as record_count 
FROM news_channels
UNION ALL
SELECT 
  'user_profiles' as table_name, 
  COUNT(*) as record_count 
FROM user_profiles;

-- 2. Проверяем последние новости с каналами
SELECT 
  n.id,
  n.title,
  n.status,
  n.published_at,
  STRING_AGG(c.name, ', ') as channels,
  COUNT(nc.channel_id) as channel_count
FROM news n
LEFT JOIN news_channels nc ON n.id = nc.news_id
LEFT JOIN channels c ON nc.channel_id = c.id
GROUP BY n.id, n.title, n.status, n.published_at
ORDER BY n.created_at DESC
LIMIT 10;

-- 3. Проверяем RLS политики
SELECT 
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
