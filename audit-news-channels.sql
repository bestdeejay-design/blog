-- 🔍 АУДИТ: Проверка мультиканальности новостей

-- 1. Проверяем структуру news_channels
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'news_channels'
ORDER BY ordinal_position;

-- 2. Проверяем все записи в news_channels для последних новостей
SELECT 
  nc.news_id,
  n.title as news_title,
  nc.channel_id,
  c.name as channel_name,
  nc.published_at,
  n.status
FROM news_channels nc
INNER JOIN news n ON nc.news_id = n.id
INNER JOIN channels c ON nc.channel_id = c.id
ORDER BY n.created_at DESC, c.name
LIMIT 20;

-- 3. Проверяем дубликаты - сколько каналов у каждой новости
SELECT 
  n.id,
  n.title,
  n.status,
  COUNT(nc.channel_id) as channel_count,
  STRING_AGG(c.name, ', ') as all_channels
FROM news n
LEFT JOIN news_channels nc ON n.id = nc.news_id
LEFT JOIN channels c ON nc.channel_id = c.id
GROUP BY n.id, n.title, n.status
ORDER BY n.created_at DESC
LIMIT 10;

-- 4. Проверяем основную таблицу news - channel_id
SELECT 
  id, 
  title, 
  status,
  channel_id as main_channel_id,
  published_at,
  created_at
FROM news
ORDER BY created_at DESC
LIMIT 10;
