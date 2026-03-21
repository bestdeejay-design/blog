# 🚀 СЛЕДУЮЩИЕ ШАГИ

## ✅ Что уже готово

Полная система управления новостями создана и находится в репозитории:
https://github.com/bestdeejay-design/blog

**Включает:**
- ✅ Next.js приложение с TypeScript
- ✅ Supabase схема базы данных
- ✅ Админ-панель с авторизацией
- ✅ Ролевая модель (супер-админ, админ, редактор)
- ✅ CRUD новостей
- ✅ Управление каналами
- ✅ Публичный API для интеграции
- ✅ Готовые React компоненты
- ✅ Полная документация

---

## 📋 ЧТО НУЖНО СДЕЛАТЬ

### 1. Настроить Supabase (10 минут)

#### A. Создайте проект
1. https://supabase.com → New Project
2. Выберите организацию
3. Придумайте название
4. Сгенерируйте пароль для базы данных
5. Выберите регион (ближе к вашей аудитории)
6. Нажмите **Create new project**

#### B. Выполните SQL скрипт
1. Откройте ваш проект
2. Перейдите в **SQL Editor** (в меню слева)
3. Нажмите **New query**
4. Скопируйте содержимое файла `supabase-schema.sql` из репозитория
5. Вставьте в редактор
6. Нажмите **Run** (или Ctrl+Enter)

✅ Должны создаться 5 таблиц: `channels`, `user_profiles`, `channel_editors`, `news`, `news_channels`

#### C. Получите API ключи
1. **Settings** → **API**
2. Скопируйте 3 значения:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbG...
   service_role: eyJhbG... (секретный!)
   ```

---

### 2. Настроить проект (5 минут)

#### A. Клонировать репозиторий
```bash
git clone https://github.com/bestdeejay-design/blog.git
cd blog
npm install
```

#### B. Создать файл окружения
```bash
cp .env.local.example .env.local
```

#### C. Заполнить .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (ваш anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (ваш service role)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 3. Запустить локально (1 минута)

```bash
npm run dev
```

Откройте http://localhost:3000

---

### 4. Зарегистрироваться и стать супер-админом (3 минуты)

#### A. Регистрация
1. Откройте http://localhost:3000/login
2. Введите ваш email и пароль
3. Нажмите **Войти**

⚠️ **Важно:** Используйте тот же email, что указывали при создании Supabase проекта (если настраивали SMTP)

#### B. Назначить роль супер-админа
1. Вернитесь в Supabase
2. **Table Editor** → таблица `user_profiles`
3. Найдите вашу запись (последняя)
4. Кликните на поле `role` (сейчас там `editor`)
5. Измените на `super_admin`
6. Нажмите **Save**

✅ Теперь вы супер-админ!

---

### 5. Протестировать систему (5 минут)

#### A. Обновите страницу
http://localhost:3000/dashboard

Теперь в меню должны быть пункты:
- Новости
- Каналы
- Редакторы

#### B. Создайте первый канал
1. **Каналы** → **+ Добавить канал**
2. Название: `Мой сайт`
3. Slug: `my-site`
4. URL: `https://mysite.com`
5. Описание: `Тестовый канал`
6. **Создать**

#### C. Создайте первую новость
1. **Новости** → **+ Добавить новость**
2. Заголовок: `Привет, мир!`
3. Текст: `Это первая тестовая новость`
4. Краткое описание: `Тест системы`
5. Канал: выберите созданный канал
6. **Сохранить**

✅ Система работает!

---

### 6. Интегрировать на сайты (10 минут)

#### Вариант 1: Готовый компонент (React/Next.js)

Скопируйте файл `components/news-feed.tsx` в ваш проект:

```tsx
import NewsFeed from '@/components/news-feed'

export default function HomePage() {
  return (
    <div>
      <h1>Главная страница</h1>
      <NewsFeed 
        baseUrl="http://localhost:3000"
        channelSlug="my-site"
        limit={5}
      />
    </div>
  )
}
```

#### Вариант 2: Через Fetch API (любой сайт)

```html
<div id="news-container"></div>

<script>
  fetch('http://localhost:3000/api/public/news?channel=my-site&limit=5')
    .then(res => res.json())
    .then(news => {
      const container = document.getElementById('news-container');
      container.innerHTML = news.map(item => `
        <article>
          <h3>${item.title}</h3>
          <time>${new Date(item.published_at).toLocaleDateString('ru-RU')}</time>
          <p>${item.excerpt}</p>
          <a href="http://localhost:3000/news/${item.id}">Читать</a>
        </article>
      `).join('');
    });
</script>
```

---

### 7. Задеплоить на Vercel (5 минут)

#### A. Установите Vercel CLI
```bash
npm install -g vercel
```

#### B. Залогиньтесь
```bash
vercel login
```

#### C. Задеплойте
```bash
vercel
```

Следуйте инструкциям в терминале.

#### D. Добавьте переменные окружения
1. Зайдите в проект на Vercel
2. **Settings** → **Environment Variables**
3. Добавьте все переменные из `.env.local`

✅ Готово! Ваш сайт доступен по HTTPS!

---

## 👥 Как добавить редакторов

### Через SQL (рекомендуется)

1. Узнайте ID пользователя:
   - Supabase → **Authentication** → **Users**
   - Скопируйте UUID нужного пользователя

2. Узнайте ID канала:
   - Supabase → **Table Editor** → `channels`
   - Скопируйте UUID канала

3. Выполните SQL:
   ```sql
   INSERT INTO channel_editors (channel_id, user_id, permissions, granted_by)
   VALUES (
     'UUID-КАНАЛА',
     'UUID-ПОЛЬЗОВАТЕЛЯ',
     '{"can_create": true, "can_edit": true, "can_delete": false, "can_publish": true}'::jsonb,
     'ВАШ-UUID' -- ID супер-админа
   );
   ```

Теперь пользователь может управлять этим каналом!

---

## 📊 Структура проекта

```
blog/
├── app/                          # Next.js приложение
│   ├── (auth)/                   # Страницы авторизации
│   │   └── login/page.tsx
│   ├── (dashboard)/              # Админ-панель
│   │   └── dashboard/
│   │       ├── page.tsx          # Лента новостей
│   │       ├── channels/page.tsx # Управление каналами
│   │       └── news/             # Управление новостями
│   ├── api/                      # API endpoints
│   │   ├── news/                 # CRUD новостей
│   │   ├── channels/             # CRUD каналов
│   │   └── public/               # Публичный API
│   └── page.tsx                  # Главная
├── components/                   # React компоненты
│   ├── news-feed.tsx             # Лента новостей
│   └── news-widget.tsx           # Виджет новостей
├── lib/                          # Утилиты
│   ├── supabase/                 # Supabase клиенты
│   ├── data.ts                   # Функции для работы с БД
│   └── types.ts                  # TypeScript типы
├── .env.local.example            # Пример переменных окружения
├── QUICKSTART.md                 # Быстрый старт
├── README.md                     # Полная документация
└── supabase-schema.sql           # Схема базы данных
```

---

## 🔐 Роли и права

| Роль | Права |
|------|-------|
| **super_admin** | Полный доступ: создание каналов, управление редакторами, все новости |
| **admin** | Управление назначенными каналами, публикация новостей |
| **editor** | Создание черновиков, редактирование своих новостей |

---

## 📞 Если что-то пойдет не так

### Ошибка подключения к Supabase
- Проверьте переменные окружения в `.env.local`
- Убедитесь, что проект в Supabase активен
- Проверьте ключи API (особенно `service_role`)

### Не получается войти
- Проверьте таблицу `user_profiles` — есть ли там ваша запись
- Убедитесь, что `is_active = true`
- Попробуйте сбросить пароль через Supabase

### Новости не отображаются на сайте
- Проверьте CORS настройки в Supabase
- Убедитесь, что статус новости `published`
- Проверьте консоль браузера на ошибки

---

## 🎯 План работ на будущее

### Можно добавить:
- [ ] Загрузка изображений через drag-n-drop
- [ ] WYSIWYG редактор для форматирования текста
- [ ] Теги и категории для новостей
- [ ] Поиск и фильтрация
- [ ] Аналитика просмотров
- [ ] Email уведомления о новых новостях
- [ ] RSS фиды
- [ ] Экспорт в социальные сети
- [ ] Планирование публикации
- [ ] Версионность новостей
- [ ] Комментарии к новостям
- [ ] Мультиязычность

---

## 📚 Полезные ссылки

- **Документация Next.js**: https://nextjs.org/docs
- **Документация Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel деплой**: https://vercel.com/docs

---

**Готово!** 🎉

Теперь у вас есть полноценная система управления новостями для всех ваших сайтов!

Если остались вопросы — смотрите полную документацию в `README.md` или `QUICKSTART.md`.
