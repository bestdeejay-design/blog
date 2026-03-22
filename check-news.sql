-- Быстрая проверка созданных новостей
-- Выполните в Supabase Dashboard → SQL Editor

-- Посмотреть все каналы
SELECT * FROM channels ORDER BY created_at DESC;

-- Посмотреть все новости с информацией о канале и авторе
SELECT 
  n.id,
  n.title,
  n.content,
  n.status,
  n.published_at,
  c.name as channel_name,
  u.full_name as author_name,
  n.created_at
FROM news n
LEFT JOIN channels c ON n.channel_id = c.id
LEFT JOIN user_profiles u ON n.author_id = u.id
ORDER BY n.created_at DESC;

-- Посмотреть опубликованные новости
SELECT 
  n.id,
  n.title,
  n.excerpt,
  n.published_at,
  c.name as channel_name
FROM news n
LEFT JOIN channels c ON n.channel_id = c.id
WHERE n.status = 'published'
ORDER BY n.published_at DESC
LIMIT 10;

-- Количество новостей по статусам
SELECT 
  status,
  COUNT(*) as count
FROM news
GROUP BY status;
