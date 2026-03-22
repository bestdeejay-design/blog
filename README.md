# 📰 Блог - Новости

Простая система управления новостями с поддержкой нескольких каналов.

---

## 🚀 Тестирование новостей

### GitHub Pages (статический HTML)

**📍 URL:** https://bestdeejay-design.github.io/blog/test-news-widget.html

Откройте ссылку выше чтобы увидеть последние новости!

---

## 🔧 Технологии

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Supabase (PostgreSQL)
- **Хостинг:** Vercel + GitHub Pages
- **Стили:** Tailwind CSS

---

## 📊 Возможности

✅ Управление новостями  
✅ Мультиканальность (одна новость в нескольких каналах)  
✅ Фильтрация по каналам и авторам  
✅ Аналитика и статистика  
✅ Публичный API для внешних сайтов  
✅ Черновики и опубликованные материалы  

---

## 🌐 API

### Публичный API для новостей

```bash
# Получить последние новости
GET https://blog-three-opal-85.vercel.app/api/public/news

# Фильтр по каналу
GET https://blog-three-opal-85.vercel.app/api/public/news?channel=main

# Лимит записей
GET https://blog-three-opal-85.vercel.app/api/public/news?limit=5
```

**Ответ:**
```json
{
  "success": true,
  "news": [
    {
      "id": "...",
      "title": "...",
      "content": "...",
      "channels": { "name": "...", "slug": "..." },
      "user_profiles": { "full_name": "..." }
    }
  ]
}
```

---

## 👥 Админка

**Вход в админку:** https://blog-three-opal-85.vercel.app/login

**Роль:** super_admin  
**Email:** dj@li.ru  

---

## 📁 Структура проекта

```
├── app/
│   ├── api/              # API endpoints
│   │   ├── news/         # CRUD новостей
│   │   ├── channels/     # Управление каналами
│   │   ├── users/        # Пользователи
│   │   └── public/       # Публичный API
│   ├── dashboard/        # Админ панель
│   └── test-news-widget/ # Тестовая страница
├── public/               # Статические файлы
├── lib/                  # Утилиты и helpers
└── test-news-widget.html # Виджет для GitHub Pages
```

---

## 🎯 Для разработчиков

### Интеграция виджета на ваш сайт

```html
<!-- Добавьте этот код на вашу страницу -->
<div id="news-widget">
  <h2>📰 Последние новости</h2>
  <div id="news-container"></div>
</div>

<script>
const API_URL = 'https://blog-three-opal-85.vercel.app/api/public/news';

async function loadNews() {
  const response = await fetch(API_URL + '?limit=10');
  const data = await response.json();
  
  if (data.success && data.news) {
    // Отобразить новости
    console.log(data.news);
  }
}

loadNews();
</script>
```

Полная документация в файле [`GITHUB_PAGES_WIDGET.md`](./GITHUB_PAGES_WIDGET.md)

---

## 📝 Лицензия

MIT

---

**🔗 Сайт с новостями:** https://bestdeejay-design.github.io/blog/test-news-widget.html
