# 🗺️ ВИЗУАЛЬНАЯ СХЕМА ПРОЕКТА

## Архитектура системы

```
┌──────────────────────────────────────────────────────────────────┐
│                          ВАШИ САЙТЫ                              │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐             │
│  │  Site 1    │    │  Site 2    │    │  Site N    │             │
│  │            │    │            │    │            │             │
│  │ [Widget]   │    │ [Feed]     │    │ [Custom]   │             │
│  └─────┬──────┘    └─────┬──────┘    └─────┬──────┘             │
│        │                 │                 │                     │
│        └─────────────────┴─────────────────┘                     │
│                          │                                        │
│                    REST API                                       │
└──────────────────────────┼────────────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────────────┐
│              NEWS MANAGEMENT SYSTEM (Next.js)                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    PUBLIC API LAYER                         │ │
│  │                                                             │ │
│  │  GET /api/public/news           → Список новостей          │ │
│  │  GET /api/public/news/:id       → Детали новости           │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  ADMIN DASHBOARD                            │ │
│  │                                                             │ │
│  │  /dashboard              → Лента новостей                   │ │
│  │  /dashboard/news/new     → Создать новость                  │ │
│  │  /dashboard/news/:id     → Просмотр/Редактирование         │ │
│  │  /dashboard/channels     → Управление каналами             │ │
│  │  /dashboard/editors      → Управление редакторами          │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                COMPONENTS LIBRARY                           │ │
│  │                                                             │ │
│  │  <NewsFeed />         → Полная лента новостей              │ │
│  │  <NewsWidget />       → Компактный виджет                   │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬────────────────────────────────────────┘
                           │
                    Supabase Client
                           │
┌──────────────────────────▼────────────────────────────────────────┐
│                  SUPABASE (PostgreSQL + Auth)                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    AUTHENTICATION                           │ │
│  │                                                             │ │
│  │  • Email/Password                                           │ │
│  │  • JWT Tokens                                               │ │
│  │  • Session Management                                       │ │
│  │  • RLS Integration                                          │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      DATABASE                               │ │
│  │                                                             │ │
│  │  ┌──────────────┐                                          │ │
│  │  │   channels   │  → Каналы/сайты                          │ │
│  │  └──────────────┘                                          │ │
│  │         │                                                   │ │
│  │         ▼                                                   │ │
│  │  ┌──────────────┐                                          │ │
│  │  │channel_editors│ → Связь редакторов с каналами           │ │
│  │  └──────────────┘                                          │ │
│  │         │                                                   │ │
│  │         ▼                                                   │ │
│  │  ┌──────────────┐                                          │ │
│  │  │user_profiles │ → Редакторы и админы                     │ │
│  │  └──────────────┘                                          │ │
│  │                                                             │ │
│  │  ┌──────────────┐                                          │ │
│  │  │     news     │  → Новости                               │ │
│  │  └──────────────┘                                          │ │
│  │         │                                                   │ │
│  │         ▼                                                   │ │
│  │  ┌──────────────┐                                          │ │
│  │  │news_channels │ → Мульти-канальная публикация            │ │
│  │  └──────────────┘                                          │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │          ROW LEVEL SECURITY (RLS)                    │  │ │
│  │  │                                                       │  │ │
│  │  │  • Public channels visible to all                    │  │ │
│  │  │  • Published news visible to all                     │  │ │
│  │  │  • Editors can manage assigned channels              │  │ │
│  │  │  • Super admins have full access                     │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## Поток данных

### 1️⃣ Создание новости

```
Редактор
   │
   ▼
[Dashboard] → Ввод данных (title, content, image, channels)
   │
   ▼
[POST /api/news]
   │
   ▼
[Supabase] → INSERT INTO news
   │
   ├─→ news (draft)
   ├─→ news_channels (selected channels)
   └─→ Return news object
   │
   ▼
[Redirect to Dashboard]
```

### 2️⃣ Публикация на сайтах

```
Админ
   │
   ▼
[Dashboard] → Выбрать новость → Publish
   │
   ▼
[PUT /api/news/:id]
   │
   ├─→ UPDATE news SET status='published'
   └─→ INSERT INTO news_channels
   │
   ▼
[Кэши invalidated]
   │
   ▼
[Сайты получают обновления через API]
```

### 3️⃣ Отображение на сайте

```
Посетитель сайта
   │
   ▼
[Site Page]
   │
   ▼
[Component: NewsFeed/NewsWidget]
   │
   ▼
[fetch('/api/public/news?channel=...')]
   │
   ▼
[GET /api/public/news]
   │
   ▼
[Supabase] → SELECT * FROM news WHERE status='published'
   │
   ▼
[Return JSON]
   │
   ▼
[Render components]
   │
   ▼
[HTML displayed to user]
```

---

## Диаграмма базы данных

```
┌─────────────────────────────────────────────────────────────┐
│                         CHANNELS                            │
├─────────────────────────────────────────────────────────────┤
│ PK  id            UUID                                      │
│     name          VARCHAR(255)                              │
│     slug          VARCHAR(255) UNIQUE                       │
│     url           TEXT                                      │
│     description   TEXT                                      │
│     logo_url      TEXT                                      │
│     is_active     BOOLEAN DEFAULT true                      │
│     created_at    TIMESTAMP                                 │
│     updated_at    TIMESTAMP                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      CHANNEL_EDITORS                        │
├─────────────────────────────────────────────────────────────┤
│ PK  id            UUID                                      │
│ FK  channel_id    UUID → channels(id)                       │
│ FK  user_id       UUID → user_profiles(id)                  │
│     permissions   JSONB {can_create, can_edit,              │
│                          can_delete, can_publish}           │
│     granted_by    UUID → user_profiles(id)                  │
│     granted_at    TIMESTAMP                                 │
│     UNIQUE(channel_id, user_id)                             │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ N:M
                            │
┌─────────────────────────────────────────────────────────────┐
│                      USER_PROFILES                          │
├─────────────────────────────────────────────────────────────┤
│ PK  id            UUID → auth.users(id)                     │
│     email         VARCHAR(255)                              │
│     full_name   VARCHAR(255)                                │
│     avatar_url    TEXT                                      │
│     role          ENUM ('super_admin', 'admin', 'editor')   │
│     is_active     BOOLEAN DEFAULT true                      │
│     created_at    TIMESTAMP                                 │
│     updated_at    TIMESTAMP                                 │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                          NEWS                               │
├─────────────────────────────────────────────────────────────┤
│ PK  id            UUID                                      │
│ FK  channel_id    UUID → channels(id)                       │
│ FK  author_id     UUID → user_profiles(id)                  │
│     title         VARCHAR(500)                              │
│     slug          VARCHAR(500) UNIQUE                       │
│     content       TEXT                                      │
│     excerpt       TEXT                                      │
│     image_url     TEXT                                      │
│     status        ENUM ('draft', 'published',               │
│                         'hidden', 'archived')               │
│     published_at  TIMESTAMP                                 │
│     views_count   INTEGER DEFAULT 0                         │
│     created_at    TIMESTAMP                                 │
│     updated_at    TIMESTAMP                                 │
│     UNIQUE(channel_id, slug)                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1:N
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      NEWS_CHANNELS                          │
├─────────────────────────────────────────────────────────────┤
│ PK  id            UUID                                      │
│ FK  news_id       UUID → news(id)                           │
│ FK  channel_id    UUID → channels(id)                       │
│     published_at  TIMESTAMP                                 │
│     UNIQUE(news_id, channel_id)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Схема авторизации

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN PAGE                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Email: ________________                             │  │
│  │  Password: _____________                             │  │
│  │  [Login Button]                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST /auth/signin
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE AUTH                             │
│                                                             │
│  1. Validate credentials                                    │
│  2. Generate JWT token                                      │
│  3. Set session cookie                                      │
│  4. Return user object                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Redirect
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD                                │
│                                                             │
│  Check user role from user_profiles table                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Role: super_admin                                   │  │
│  │  - Access to all features                            │  │
│  │  - Manage channels                                   │  │
│  │  - Manage editors                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Role: admin                                         │  │
│  │  - Manage assigned channels                          │  │
│  │  - Create/edit news                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Role: editor                                        │  │
│  │  - Create drafts                                     │  │
│  │  - Edit own news                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Интеграция компонентов

### Вариант 1: Next.js приложение

```tsx
// app/page.tsx
import NewsFeed from '@/components/news-feed'

export default function HomePage() {
  return (
    <div>
      <header>Мой сайт</header>
      
      <main>
        <NewsFeed 
          baseUrl="https://news.yoursite.com"
          channelSlug="my-channel"
          limit={5}
          showImages={true}
        />
      </main>
      
      <footer>© 2024</footer>
    </div>
  )
}
```

### Вариант 2: HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Мой сайт</title>
</head>
<body>
  <h1>Главная страница</h1>
  
  <div id="news-container"></div>
  
  <script>
    fetch('https://news.yoursite.com/api/public/news?limit=5')
      .then(response => response.json())
      .then(news => {
        const container = document.getElementById('news-container');
        container.innerHTML = news.map(item => `
          <article>
            <h2>${item.title}</h2>
            <time>${new Date(item.published_at).toLocaleDateString('ru-RU')}</time>
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}">` : ''}
            <p>${item.excerpt}</p>
            <a href="https://news.yoursite.com/news/${item.id}">Читать далее</a>
          </article>
        `).join('');
      });
  </script>
</body>
</html>
```

### Вариант 3: Vue.js компонент

```vue
<template>
  <div class="home-page">
    <h1>Мой сайт</h1>
    
    <div v-if="loading">Загрузка...</div>
    <div v-else>
      <article v-for="item in news" :key="item.id" class="news-item">
        <h2>{{ item.title }}</h2>
        <time>{{ formatDate(item.published_at) }}</time>
        <img v-if="item.image_url" :src="item.image_url" :alt="item.title">
        <p>{{ item.excerpt }}</p>
        <router-link :to="`/news/${item.id}`">Читать далее</router-link>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      news: [],
      loading: true
    }
  },
  async mounted() {
    const res = await fetch('https://news.yoursite.com/api/public/news?limit=5')
    this.news = await res.json()
    this.loading = false
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }
  }
}
</script>
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                        │
│                                                             │
│  git push origin main                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Trigger
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB                                 │
│                                                             │
│  Repository: bestdeejay-design/blog                         │
│  Branch: main                                               │
│                                                             │
│  Webhook → Vercel                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Auto Deploy
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       VERCEL                                │
│                                                             │
│  1. Install dependencies (npm install)                      │
│  2. Build (npm run build)                                   │
│  3. Deploy to CDN                                           │
│  4. Update environment variables                            │
│                                                             │
│  ✓ Production: https://your-app.vercel.app                  │
│  ✓ Preview: https://git-branch-your-app.vercel.app          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Global CDN
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      USERS                                  │
│                                                             │
│  Access via: https://your-domain.com                        │
│                                                             │
│  • Fast loading (Edge Network)                              │
│  • HTTPS by default                                         │
│  • Automatic SSL                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Authentication                                    │
│  • Supabase Auth (JWT)                                      │
│  • Secure cookies                                           │
│  • Session management                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Authorization                                     │
│  • Role-based access control (RBAC)                         │
│  • Channel-specific permissions                             │
│  • Granular rights (create, edit, delete, publish)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Row Level Security (RLS)                          │
│  • Database-level security                                  │
│  • Policy-based access                                      │
│  • Applied to every query                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: API Security                                      │
│  • CORS configuration                                       │
│  • Rate limiting                                            │
│  • Input validation                                         │
│  • SQL injection prevention                                 │
└─────────────────────────────────────────────────────────────┘
```

---

**Эта схема помогает понять архитектуру системы и поток данных.**

Для начала работы см. [START_HERE.md](START_HERE.md)
