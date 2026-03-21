# Система управления новостями

Централизованная система управления новостями для нескольких сайтов с разграничением прав доступа.

## 🚀 Возможности

- ✅ Единая админ-панель для управления новостями
- ✅ Поддержка множества каналов (сайтов)
- ✅ Ролевая модель (Супер-админ, Админ, Редактор)
- ✅ Публикация новостей на нескольких каналах одновременно
- ✅ Готовые компоненты для встраивания на сайты
- ✅ REST API для интеграции
- ✅ Адаптивный дизайн
- ✅ Темная тема

## 📋 Требования

- Node.js 18+
- Supabase аккаунт
- npm или yarn

## ⚙️ Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/bestdeejay-design/blog.git
cd blog
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка Supabase

#### Создайте проект на [Supabase](https://supabase.com)

#### Выполните SQL скрипт

В панели управления Supabase перейдите в **SQL Editor** и выполните скрипт из файла `supabase-schema.sql`

Этот скрипт создаст:
- Таблицы: `channels`, `user_profiles`, `channel_editors`, `news`, `news_channels`
- Индексы для оптимизации
- Triggers для автоматического обновления `updated_at`
- Row Level Security (RLS) политики
- Политики доступа

#### Настройте аутентификацию

В разделе **Authentication** → **Providers** включите Email/Password

#### Создайте первого супер-админа

После выполнения SQL скрипта, вам нужно создать первого супер-админа:

1. Зарегистрируйтесь через форму входа (`/login`)
2. В Supabase перейдите в **Authentication** → **Users**
3. Скопируйте ID вашего пользователя
4. В таблице `user_profiles` обновите роль:

```sql
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';
```

### 4. Настройка переменных окружения

Создайте файл `.env.local`:

```bash
cp .env.local.example .env.local
```

Заполните его данными из вашего проекта Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Где взять ключи:**
- `NEXT_PUBLIC_SUPABASE_URL`: Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Settings → API → anon public
- `SUPABASE_SERVICE_ROLE_KEY`: Settings → API → service_role

### 5. Запуск проекта

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 👥 Роли пользователей

### Супер-админ (super_admin)
- Создание и управление каналами
- Добавление и удаление редакторов
- Назначение редакторов на каналы
- Управление правами доступа
- Полный доступ ко всем новостям

### Админ (admin)
- Управление назначенными каналами
- Добавление и редактирование новостей
- Публикация новостей

### Редактор (editor)
- Создание черновиков
- Редактирование своих новостей
- Просмотр новостей своих каналов

## 📱 Использование

### Добавление канала

1. Войдите как супер-админ
2. Перейдите в раздел **Каналы**
3. Нажмите **+ Добавить канал**
4. Заполните информацию:
   - Название
   - Slug (уникальный идентификатор)
   - URL сайта
   - Описание

### Добавление новости

1. Перейдите в раздел **Новости**
2. Нажмите **+ Добавить новость**
3. Заполните:
   - Заголовок
   - Краткое описание (для превью)
   - Полный текст
   - URL изображения (опционально)
   - Выберите канал для публикации
4. Сохраните

### Публикация на нескольких каналах

При создании новости вы можете выбрать несколько каналов для публикации. Новость появится на всех выбранных сайтах.

## 🔌 Интеграция на сайты

### Вариант 1: React/Next.js компоненты

#### Установка компонентов

Скопируйте компоненты из папки `components/` в ваш проект:

- `NewsFeed` - полная лента новостей
- `NewsWidget` - компактный виджет

#### Пример использования NewsFeed

```tsx
import NewsFeed from '@/components/news-feed'

export default function HomePage() {
  return (
    <div>
      <h1>Главная страница</h1>
      
      <NewsFeed 
        baseUrl="https://your-news-app.com"
        channelSlug="my-channel"
        limit={5}
        showImages={true}
        showExcerpt={true}
      />
    </div>
  )
}
```

#### Пример использования NewsWidget

```tsx
import NewsWidget from '@/components/news-widget'

export default function Sidebar() {
  return (
    <aside>
      <NewsWidget 
        baseUrl="https://your-news-app.com"
        limit={3}
        variant="list"
      />
    </aside>
  )
}
```

### Вариант 2: REST API

#### Получить последние новости

```bash
GET https://your-news-app.com/api/public/news?limit=10&channel=my-channel
```

**Ответ:**

```json
[
  {
    "id": "uuid",
    "title": "Заголовок новости",
    "slug": "zagolovok-novosti",
    "excerpt": "Краткое описание",
    "image_url": "https://...",
    "published_at": "2024-01-01T12:00:00Z",
    "channel": {
      "name": "Мой канал",
      "slug": "my-channel"
    },
    "author": {
      "full_name": "Автор",
      "avatar_url": "https://..."
    }
  }
]
```

#### Получить конкретную новость

```bash
GET https://your-news-app.com/api/public/news/{news-id}
```

### Вариант 3: Fetch API в браузере

```javascript
async function fetchNews() {
  const response = await fetch(
    'https://your-news-app.com/api/public/news?limit=5'
  )
  const news = await response.json()
  
  // Отобразить новости на странице
  const container = document.getElementById('news-container')
  news.forEach(item => {
    const article = document.createElement('article')
    article.innerHTML = `
      <h3>${item.title}</h3>
      <time>${new Date(item.published_at).toLocaleDateString('ru-RU')}</time>
      <p>${item.excerpt}</p>
      <a href="https://your-news-app.com/news/${item.id}">Читать далее</a>
    `
    container.appendChild(article)
  })
}
```

## 🎨 Кастомизация компонентов

### NewsFeed Props

```typescript
interface NewsFeedProps {
  baseUrl: string          // Обязательный: URL приложения
  channelSlug?: string     // Опционально: фильтр по каналу
  limit?: number           // Опционально: количество новостей (по умолчанию 5)
  showImages?: boolean     // Опционально: показывать изображения (по умолчанию true)
  showExcerpt?: boolean    // Опционально: показывать краткое описание (по умолчанию true)
  className?: string       // Опционально: дополнительные CSS классы
}
```

### NewsWidget Props

```typescript
interface NewsWidgetProps {
  baseUrl: string      // Обязательный: URL приложения
  limit?: number       // Опционально: количество новостей (по умолчанию 3)
  variant?: 'list' | 'grid' | 'carousel'  // Опционально: стиль отображения
  className?: string   // Опционально: дополнительные CSS классы
}
```

## 🔐 Безопасность

### Row Level Security (RLS)

Все таблицы защищены с помощью RLS политик:

- **channels**: публичные каналы видны всем, управлять могут только супер-админы
- **user_profiles**: профили видны всем, редактировать можно только свой
- **news**: опубликованные новости видны всем, управлять могут авторы и редакторы
- **channel_editors**: видны всем, управлять могут только супер-админы

### Авторизация

- Используется Supabase Auth
- JWT токены автоматически обновляются
- Сессионные cookie защищают от CSRF

## 📊 Структура базы данных

```
channels
├── id (UUID)
├── name (VARCHAR)
├── slug (VARCHAR, unique)
├── url (TEXT)
├── description (TEXT)
├── logo_url (TEXT)
├── is_active (BOOLEAN)
└── timestamps

user_profiles
├── id (UUID, FK to auth.users)
├── email (VARCHAR)
├── full_name (VARCHAR)
├── avatar_url (TEXT)
├── role (ENUM: super_admin, admin, editor)
├── is_active (BOOLEAN)
└── timestamps

channel_editors
├── id (UUID)
├── channel_id (UUID, FK to channels)
├── user_id (UUID, FK to user_profiles)
├── permissions (JSONB)
│   ├── can_create: boolean
│   ├── can_edit: boolean
│   ├── can_delete: boolean
│   └── can_publish: boolean
├── granted_by (UUID, FK to user_profiles)
└── granted_at (TIMESTAMP)

news
├── id (UUID)
├── channel_id (UUID, FK to channels)
├── author_id (UUID, FK to user_profiles)
├── title (VARCHAR)
├── slug (VARCHAR)
├── content (TEXT)
├── excerpt (TEXT)
├── image_url (TEXT)
├── status (ENUM: draft, published, hidden, archived)
├── published_at (TIMESTAMP)
├── views_count (INTEGER)
└── timestamps

news_channels
├── id (UUID)
├── news_id (UUID, FK to news)
├── channel_id (UUID, FK to channels)
└── published_at (TIMESTAMP)
```

## 🛠 API Endpoints

### Публичные (без авторизации)

- `GET /api/public/news` - получить список новостей
  - Query params: `channel`, `limit`
- `GET /api/public/news/:id` - получить новость по ID

### Приватные (требуется авторизация)

- `POST /api/news` - создать новость
- `PUT /api/news/:id` - обновить новость
- `DELETE /api/news/:id` - удалить новость
- `GET /api/channels` - получить список каналов
- `POST /api/channels` - создать канал (только super_admin)

## 🚀 Деплой

### Vercel (рекомендуется)

1. Залейте код на GitHub
2. Импортируйте проект в [Vercel](https://vercel.com)
3. Добавьте переменные окружения
4. Deploy!

### Docker

```bash
docker build -t news-system .
docker run -p 3000:3000 --env-file .env.local news-system
```

### Традиционный хостинг

```bash
npm run build
npm start
```

## 📝 Примеры использования

### Пример 1: Простая вставка на сайт

```html
<!-- Добавьте это на любую страницу -->
<div id="news-feed"></div>

<script>
  fetch('https://your-news-app.com/api/public/news?limit=5')
    .then(res => res.json())
    .then(news => {
      const container = document.getElementById('news-feed')
      container.innerHTML = news.map(item => `
        <article style="margin-bottom: 20px;">
          <h3><a href="https://your-news-app.com/news/${item.id}">${item.title}</a></h3>
          <small>${new Date(item.published_at).toLocaleDateString('ru-RU')}</small>
          <p>${item.excerpt}</p>
        </article>
      `).join('')
    })
</script>
```

### Пример 2: Vue.js компонент

```vue
<template>
  <div class="news-section">
    <div v-if="loading">Загрузка...</div>
    <div v-else>
      <article v-for="item in news" :key="item.id">
        <h3>{{ item.title }}</h3>
        <time>{{ formatDate(item.published_at) }}</time>
        <p>{{ item.excerpt }}</p>
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
    const res = await fetch('https://your-news-app.com/api/public/news?limit=5')
    this.news = await res.json()
    this.loading = false
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU')
    }
  }
}
</script>
```

## ❓ FAQ

### Как добавить редактора?

Супер-админ может добавить редактора через SQL запрос:

```sql
INSERT INTO channel_editors (channel_id, user_id, permissions, granted_by)
VALUES (
  'channel-uuid',
  'user-uuid',
  '{"can_create": true, "can_edit": true, "can_delete": false, "can_publish": true}'::jsonb,
  'super-admin-user-uuid'
);
```

### Как изменить права редактора?

```sql
UPDATE channel_editors
SET permissions = '{"can_create": true, "can_edit": true, "can_delete": true, "can_publish": true}'::jsonb
WHERE channel_id = 'channel-uuid' AND user_id = 'user-uuid';
```

### Можно ли использовать разные дизайны для разных каналов?

Да! Используйте публичный API и создавайте свои компоненты отображения для каждого канала.

### Как экспортировать новости?

Используйте Supabase Dashboard или прямой SQL запрос:

```sql
SELECT n.*, c.name as channel_name, u.email as author_email
FROM news n
JOIN channels c ON n.channel_id = c.id
JOIN user_profiles u ON n.author_id = u.id
WHERE n.status = 'published'
ORDER BY n.published_at DESC;
```

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте документацию
2. Посмотрите примеры использования
3. Убедитесь, что все переменные окружения настроены правильно
4. Проверьте консоль на наличие ошибок

## 📄 Лицензия

MIT License - используйте свободно в ваших проектах!

---

**Создано с ❤️ для bestdeejay-design**
