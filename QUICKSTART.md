# Быстрый старт

## 1. Настройка Supabase

### Создайте проект
1. Зайдите на https://supabase.com
2. Создайте новый проект
3. Дождитесь завершения создания (2-3 минуты)

### Выполните SQL скрипт
1. Откройте **SQL Editor** в панели управления Supabase
2. Скопируйте содержимое файла `supabase-schema.sql`
3. Вставьте и выполните (кнопка **Run**)

### Настройте аутентификацию
1. Перейдите в **Authentication** → **Providers**
2. Включите **Email** provider
3. При желании настройте SMTP для подтверждения email

### Получите ключи API
1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Настройка проекта

### Установите зависимости
```bash
npm install
```

### Создайте файл окружения
```bash
cp .env.local.example .env.local
```

### Заполните .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Запуск

### Режим разработки
```bash
npm run dev
```

Откройте http://localhost:3000

### Продакшн сборка
```bash
npm run build
npm start
```

## 4. Первый вход

### Зарегистрируйтесь
1. Откройте http://localhost:3000/login
2. Введите email и пароль
3. Нажмите **Войти**

### Назначьте себе роль супер-админа
1. В Supabase перейдите в **Table Editor**
2. Откройте таблицу `user_profiles`
3. Найдите свою запись
4. Измените `role` на `super_admin`
5. Сохраните

Теперь у вас есть доступ ко всем функциям!

## 5. Добавление канала

1. Войдите как супер-админ
2. Перейдите в **Каналы**
3. Нажмите **+ Добавить канал**
4. Заполните:
   - Название: `Мой сайт`
   - Slug: `my-site`
   - URL: `https://mysite.com`
   - Описание: (опционально)

## 6. Создание новости

1. Перейдите в **Новости**
2. Нажмите **+ Добавить новость**
3. Заполните:
   - Заголовок
   - Текст
   - Краткое описание (для превью)
   - URL изображения (можно с unsplash.com)
   - Выберите канал
4. Сохраните

## 7. Интеграция на сайт

### Вариант A: Готовый компонент

Скопируйте `components/news-feed.tsx` в ваш проект:

```tsx
import NewsFeed from '@/components/news-feed'

export default function HomePage() {
  return (
    <NewsFeed 
      baseUrl="http://localhost:3000"
      channelSlug="my-site"
      limit={5}
    />
  )
}
```

### Вариант B: Через API

```javascript
fetch('http://localhost:3000/api/public/news?channel=my-site&limit=5')
  .then(res => res.json())
  .then(news => {
    // Отобразите новости на странице
    console.log(news)
  })
```

## 8. Деплой на Vercel

```bash
# Установите Vercel CLI
npm install -g vercel

# Залогиньтесь
vercel login

# Задеплойте
vercel
```

Не забудьте добавить переменные окружения в настройках Vercel!

## Готово! 🎉

Теперь у вас есть:
- ✅ Админ-панель для управления новостями
- ✅ Поддержка нескольких каналов
- ✅ Ролевая модель
- ✅ Публичный API для интеграции
- ✅ Готовые компоненты

Следующие шаги:
- Добавьте редакторов через SQL
- Настройте права доступа
- Интегрируйте на свои сайты
- Настройте SMTP для уведомлений

---

**Нужна помощь?** Читайте полную документацию в `README.md`
