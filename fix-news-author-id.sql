-- Исправление ограничения author_id в таблице news
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

-- Удаляем NOT NULL constraint из author_id
ALTER TABLE news ALTER COLUMN author_id DROP NOT NULL;

-- Проверяем результат
SELECT 
    column_name, 
    is_nullable, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'news' 
  AND column_name = 'author_id';
