# 🖼️ Медиа в новостях - Инструкция

## ✅ Что добавлено:

1. **Загрузка изображений** через Supabase Storage
2. **Вставка видео** из YouTube, RuTube, VK Видео
3. **Автоматическая обработка** при создании/редактировании
4. **Отображение** в модальном окне просмотра

---

## 📋 Как использовать:

### 1️⃣ Создание новости с картинкой

1. Откройте админку: https://blog-three-opal-85.vercel.app/dashboard
2. Нажмите **"➕ Добавить новость"**
3. Заполните заголовок и текст
4. В секции **"Медиа"**:
   - Нажмите **"📷 Загрузить картинку"**
   - Выберите файл на компьютере
   - Картинка автоматически загрузится в Supabase Storage

### 2️⃣ Создание новости с видео

1. Откройте админку
2. Создайте новость
3. В секции **"Медиа"**:
   - Вставьте ссылку на видео в поле **"🎥 Ссылка на видео"**
   - Примеры:
     - YouTube: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
     - RuTube: `https://rutube.ru/video/12345678/`
     - VK: `https://vk.com/video-123_456`

### 3️⃣ Новости с картинкой И видео

Можно добавить и картинку, и видео одновременно!

---

## 🗄️ База данных

### Выполните SQL для обновления схемы:

Откройте https://supabase.com/dashboard → SQL Editor и выполните:

```sql
-- Добавим поле media в таблицу news
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_news_media_json ON news USING GIN (media);

COMMENT ON COLUMN news.media IS 'Медиа контент: изображения и видео';
```

---

## 📦 Формат хранения медиа:

```json
{
  "media": [
    {
      "type": "image",
      "url": "https://...supabase.co/storage/.../photo.jpg",
      "caption": ""
    },
    {
      "type": "youtube",
      "url": "https://www.youtube.com/watch?v=...",
      "videoId": "dQw4w9WgXcQ"
    },
    {
      "type": "rutube",
      "url": "https://rutube.ru/video/...",
      "videoId": "12345678"
    },
    {
      "type": "vk",
      "url": "https://vk.com/video-123_456",
      "videoId": "-123_456"
    }
  ]
}
```

---

## 🎨 Отображение:

### Модальное окно просмотра:

Откройте https://bestdeejay-design.github.io/blog/news-viewer.html

**Особенности:**
- ✅ Картинки показываются первыми
- ✅ Видео встраиваются через iframe
- ✅ Адаптивный размер для всех устройств
- ✅ Поддержка нескольких медиа в одной новости

---

## 📁 Структура файлов:

```
lib/media.ts              # Библиотека для работы с медиа
app/api/news/create/      # API создания с поддержкой медиа
news-viewer.html          # Просмотр с медиа
add-media-support.sql     # SQL для обновления БД
```

---

## 🔧 Технические детали:

### Загрузка изображений:
- **Хранилище:** Supabase Storage bucket `blog-media`
- **Путь:** `public/{news-id}-{timestamp}.{ext}`
- **Форматы:** JPG, PNG, GIF, WebP
- **Лимит:** 10MB на файл (настройка Supabase)

### Обработка видео:
- **Извлечение ID:** Автоматическое из URL
- **Embed:** Генерация embed ссылки для iframe
- **Поддержка:** YouTube, RuTube, VK Видео

---

## 🚀 Следующие шаги:

1. ✅ Выполните SQL для добавления поля `media`
2. ✅ Создайте тестовую новость с картинкой
3. ✅ Проверьте на https://bestdeejay-design.github.io/blog/news-viewer.html

---

## ❓ Вопросы?

- Картинки хранятся в Supabase Storage (бесплатно до 1GB)
- Видео не хранятся, только ссылки и ID
- Поддерживается несколько медиа в одной новости
- Порядок отображения: сначала картинки, потом видео
