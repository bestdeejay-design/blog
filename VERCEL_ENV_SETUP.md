# 🔧 Настройка переменных окружения для Vercel

## ⚠️ Важно!

Для работы API необходимо добавить переменные окружения в настройках Vercel.

---

## 📋 Какие переменные нужны:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎯 Как добавить в Vercel:

### Шаг 1: Откройте проект на Vercel

Перейдите по ссылке:
```
https://vercel.com/dashboard
```

Найдите ваш проект `blog` и откройте его.

### Шаг 2: Перейдите в настройки

Кликните на вкладку **"Settings"** → **"Environment Variables"**

### Шаг 3: Добавьте переменные

#### Переменная 1:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://your-project.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Переменная 2:
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ваш anon ключ из Supabase)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## 📍 Где взять значения:

1. Откройте https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Скопируйте:
   - **Project URL** → для `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → для `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🔄 После добавления:

1. Сохраните переменные в Vercel
2. Vercel автоматически перезадеплоит проект (30-60 секунд)
3. Проверьте что API работает:
   ```
   https://blog-three-opal-85.vercel.app/api/public/news
   ```

---

## ✅ Проверка:

Откройте в браузере:
```
https://blog-three-opal-85.vercel.app/api/public/news
```

**Правильный ответ:**
```json
{
  "success": true,
  "news": [...],
  "timestamp": "2026-03-22T..."
}
```

**Если видите 404 или HTML:** переменные окружения не добавлены или неверные.

---

## 🐛 Debugging:

### Логи Vercel:

1. Откройте https://vercel.com/dashboard
2. Ваш проект → **Deployments**
3. Кликните на последний деплой
4. Нажмите **"View Build Logs"**
5. Ищите ошибки связанные с `NEXT_PUBLIC_SUPABASE`

### Логи функции:

1. Проект → **Functions**
2. Найдите `/api/public/news/route.ts`
3. Кликните → **Logs**
4. Смотрите ошибки выполнения

---

## 💡 Советы:

- ✅ Используйте `NEXT_PUBLIC_` префикс для клиентских переменных
- ✅ Добавляйте переменные во все environment (Production, Preview, Development)
- ✅ Не забывайте пересоздавать деплой после добавления переменных
- ✅ Проверяйте что URL Supabase правильный (без слэша в конце)

---

## 🔗 Полезные ссылки:

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api)
