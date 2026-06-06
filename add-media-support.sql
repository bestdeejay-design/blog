-- 🔧 Создание таблицы для медиа новостей

-- Опционально: можно хранить медиа прямо в news JSON полем
-- Но если нужна отдельная таблица - раскомментируйте:

/*
CREATE TABLE IF NOT EXISTS news_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'youtube', 'rutube', 'vk_video', 'vimeo')),
  url TEXT NOT NULL,
  video_id TEXT,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_media_news_id ON news_media(news_id);
CREATE INDEX idx_news_media_type ON news_media(type);
*/

-- Добавим поле media в таблицу news (JSON формат)
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_news_media_json ON news USING GIN (media);

COMMENT ON COLUMN news.media IS 'Медиа контент: изображения и видео';
