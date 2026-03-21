# 🎯 НАЧАТЬ РАБОТУ (START HERE)

## 👋 Привет!

Вы открыли репозиторий системы управления новостями для нескольких сайтов.

**Репозиторий:** https://github.com/bestdeejay-design/blog

---

## ⚡ Быстрый старт за 35 минут

### Шаг 1: Supabase (10 мин)

1. **Создайте проект** на https://supabase.com
2. **Выполните SQL:** 
   - Откройте SQL Editor в Supabase
   - Скопируйте `supabase-schema.sql`
   - Вставьте и нажмите Run
3. **Получите ключи:**
   - Settings → API
   - Скопируйте Project URL, anon public, service_role

📄 **Подробности:** [QUICKSTART.md](QUICKSTART.md)

---

### Шаг 2: Настройка проекта (5 мин)

```bash
# Клонировать
git clone https://github.com/bestdeejay-design/blog.git
cd blog

# Установить зависимости
npm install

# Создать файл окружения
cp .env.local.example .env.local

# Заполнить .env.local (открыть в редакторе)
NEXT_PUBLIC_SUPABASE_URL=ваш-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-key
SUPABASE_SERVICE_ROLE_KEY=ваш-secret-key
```

---

### Шаг 3: Запуск (1 мин)

```bash
npm run dev
```

Откройте http://localhost:3000

---

### Шаг 4: Регистрация (3 мин)

1. Откройте http://localhost:3000/login
2. Введите email/пароль
3. Войдите

⚠️ **Важно:** Теперь нужно стать супер-админом!

В Supabase:
- Table Editor → user_profiles
- Найдите вашу запись
- Измените `role` на `super_admin`
- Сохраните

---

### Шаг 5: Тестирование (5 мин)

1. **Создайте канал:**
   - Каналы → + Добавить канал
   - Название: "Мой сайт"
   - Slug: "my-site"

2. **Создайте новость:**
   - Новости → + Добавить новость
   - Заголовок: "Привет!"
   - Текст: "Тест"
   - Выберите канал

✅ Система работает!

---

### Шаг 6: Интеграция (10 мин)

#### Вариант A: React компонент

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

#### Вариант B: Любой сайт

```html
<div id="news"></div>
<script>
  fetch('http://localhost:3000/api/public/news?limit=5')
    .then(r => r.json())
    .then(news => {
      document.getElementById('news').innerHTML = news
        .map(n => `<h3>${n.title}</h3>`)
        .join('');
    });
</script>
```

---

## 📚 Документация

| Файл | Для чего |
|------|----------|
| **[QUICKSTART.md](QUICKSTART.md)** | Подробный быстрый старт |
| **[README.md](README.md)** | Полная документация (EN/RU) |
| **[NEXT_STEPS.md](NEXT_STEPS.md)** | Что делать дальше |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | Описание проекта |

---

## 🚀 Деплой на Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Не забудьте добавить переменные окружения в настройках Vercel!

---

## 🎯 Что внутри

✅ Next.js 14 + TypeScript  
✅ Supabase (PostgreSQL + Auth)  
✅ Tailwind CSS 4  
✅ Ролевая модель (super_admin/admin/editor)  
✅ Мульти-канальность  
✅ Готовые компоненты  
✅ Публичный API  
✅ Полная документация  

---

## ❓ Вопросы?

1. Прочитайте [QUICKSTART.md](QUICKSTART.md)
2. Проверьте [README.md](README.md)
3. Посмотрите [NEXT_STEPS.md](NEXT_STEPS.md)

---

**Готово!** 🎉

Приятной работы с системой!

---

*P.S. Если что-то пойдет не так — проверьте консоль браузера и терминала. В 99% случаев проблема в переменных окружения или забытом npm install.*
