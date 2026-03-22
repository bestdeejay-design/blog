# ⚠️ СРОЧНО: Нужен Supabase Anon Key для работы API

## 🎯 Проблема

API на Vercel не работает потому что нет переменной `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Результат:** На GitHub Pages ошибка "Unexpected token '<'" вместо новостей.

---

## 🔧 Решение (2 минуты)

### Шаг 1: Скопируйте Anon Key из Supabase

1. Откройте https://supabase.com/dashboard
2. Ваш проект → **Settings** (шестеренка) → **API**
3. Найдите **"Project API keys"**
4. Скопируйте значение **anon public** (длинная строка начинается с `eyJ...`)

### Шаг 2: Пришлите мне этот ключ

Напишите мне в чат что-то вроде:

```
Вот мой anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxx
```

### Шаг 3: Я добавлю его в Vercel

Я автоматически добавлю переменную через CLI и Vercel перезадеплоит API.

### Шаг 4: Проверяете GitHub Pages

Через 1-2 минуты откроете:
```
https://bestdeejay-design.github.io/blog/test-news-widget.html
```

И увидите новости! ✅

---

## 📝 Что происходит сейчас:

```
GitHub Pages (HTML файл)
    ↓ fetch()
Vercel API (/api/public/news)
    ↓ ошибка 500 - нет ключа
Результат: HTML вместо JSON ❌
```

## ✅ Что будет после фикса:

```
GitHub Pages (HTML файл)
    ↓ fetch()
Vercel API (/api/public/news) ✅
    ↓ JSON с новостями
Результат: Список новостей ✅
```

---

## 💡 Важно

- Ключ **публичный** (anon public) - безопасен для клиентского использования
- Не путать с `service_role` ключом (он секретный)
- Vercel использует его только для чтения опубликованных новостей

---

**Жду ваш anon key чтобы закончить настройку!** 🚀
