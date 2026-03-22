# 📰 Новости - Виджет для GitHub Pages

## 🔧 Настройка

### 1. Добавьте этот код на вашу страницу (HTML)

```html
<!-- Контейнер для новостей -->
<div id="news-widget">
  <h2>📰 Последние новости</h2>
  <div id="news-container">Загрузка новостей...</div>
</div>
```

### 2. Добавьте CSS стили

```css
<style>
#news-widget {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#news-widget h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
}

.news-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.2s;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.news-title {
  font-size: 20px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.news-excerpt {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.news-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #888;
}

.news-channel {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 500;
}

.news-date {
  display: flex;
  align-items: center;
  gap: 5px;
}

.read-more {
  display: inline-block;
  margin-top: 10px;
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.read-more:hover {
  text-decoration: underline;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #888;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>
```

### 3. Добавьте JavaScript

```javascript
<script>
// URL вашего API (замените на ваш домен после деплоя)
const API_URL = 'https://your-blog-domain.vercel.app/api/public/news';

async function loadNews() {
  const container = document.getElementById('news-container');
  
  try {
    const response = await fetch(API_URL + '?limit=10');
    const data = await response.json();
    
    if (!data.success || !data.news || data.news.length === 0) {
      container.innerHTML = '<div class="error">Новостей пока нет</div>';
      return;
    }
    
    const newsHTML = data.news.map(news => {
      const date = new Date(news.published_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const channelName = news.channels?.name || 'Без канала';
      const excerpt = news.excerpt || (news.content ? news.content.substring(0, 200) + '...' : '');
      
      return `
        <div class="news-item">
          <div class="news-title">${escapeHtml(news.title)}</div>
          <div class="news-excerpt">${escapeHtml(excerpt)}</div>
          <div class="news-meta">
            <span class="news-channel">📺 ${escapeHtml(channelName)}</span>
            <span class="news-date">📅 ${date}</span>
            ${news.user_profiles?.full_name ? 
              `<span>✍️ ${escapeHtml(news.user_profiles.full_name)}</span>` : ''}
          </div>
          ${news.url ? `<a href="${escapeHtml(news.url)}" class="read-more">Читать далее →</a>` : ''}
        </div>
      `;
    }).join('');
    
    container.innerHTML = newsHTML;
    
  } catch (error) {
    console.error('Error loading news:', error);
    container.innerHTML = '<div class="error">Ошибка загрузки новостей</div>';
  }
}

// Функция для экранирования HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Загружаем новости при загрузке страницы
document.addEventListener('DOMContentLoaded', loadNews);
</script>
```

---

## 🎯 Примеры использования

### Вариант 1: Полная страница

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Новости</title>
  <!-- Вставьте CSS отсюда выше -->
</head>
<body>
  <div id="news-widget">
    <h2>📰 Последние новости</h2>
    <div id="news-container"></div>
  </div>
  <!-- Вставьте JS отсюда выше -->
</body>
</html>
```

### Вариант 2: Вставка в существующий сайт

Просто добавьте HTML в нужное место и подключите CSS/JS.

### Вариант 3: Фильтр по каналу

Измените API_URL:
```javascript
const API_URL = 'https://your-blog-domain.vercel.app/api/public/news?channel=main&limit=5';
```

---

## 🚀 После деплоя

1. **Задеплойте проект** (например, на Vercel)
2. **Узнайте ваш домен** (например, `myblog.vercel.app`)
3. **Замените API_URL** в коде на ваш домен
4. **Добавьте виджет** на ваш GitHub Pages сайт

---

## 📝 Дополнительные параметры API

- `?limit=5` - показать только 5 последних новостей
- `?channel=main` - новости только из канала с slug "main"
- `?channel=pizza&limit=3` - 3 новости из канала "pizza"

---

## 💡 Советы

1. **Кэширование**: API кэширует ответы на 60 секунд
2. **CORS**: Полностью настроено для работы с GitHub Pages
3. **Безопасность**: Только опубликованные новости (`status='published'`)
4. **Адаптивность**: Стили уже адаптированы под мобильные устройства
