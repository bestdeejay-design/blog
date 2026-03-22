-- 🔍 ТЕСТ: Проверка работы API запроса

-- 1. Простой запрос без JOIN
SELECT id, title, status, published_at 
FROM news 
WHERE status = 'published'
ORDER BY published_at DESC NULLS LAST
LIMIT 5;

-- 2. Запрос с JOIN на channels
SELECT n.id, n.title, c.name as channel_name
FROM news n
INNER JOIN channels c ON n.channel_id = c.id
WHERE n.status = 'published'
ORDER BY n.published_at DESC NULLS LAST
LIMIT 5;

-- 3. Проверяем RLS на news
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'news'
ORDER BY policyname;
