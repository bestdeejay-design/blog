-- Исправление ограничения author_id в таблице news
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

-- ВОЗВРАЩАЕМ NOT NULL constraint для author_id
-- Это правильное поведение - мы должны знать кто создал новость!
ALTER TABLE news ALTER COLUMN author_id SET NOT NULL;

-- Проверяем результат
SELECT 
    column_name, 
    is_nullable, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'news' 
  AND column_name = 'author_id';

-- Сообщение:
-- is_nullable = 'NO' означает что поле обязательное (правильно!)
