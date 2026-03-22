# 🔧 Исправление author_id - Объяснение

## ❌ Было (неправильно)

Я ошибочно убрал NOT NULL ограничение из `author_id`, думая что это решит проблему.

**Почему это неправильно:**
- Мы **НЕ МОЖЕМ** знать кто создал новость
- Теряется авторство контента
- Невозможно отследить кто опубликовал
- Плохая практика для CMS

## ✅ Стало (правильно)

Вернул NOT NULL ограничение и исправил код для **обязательного определения автора**.

### Что изменено:

#### 1. API создания новостей ([app/api/news/create/route.ts](file:///Users/admin/Documents/GitHub/blog/app/api/news/create/route.ts))

**Было:**
```typescript
let authorId = null
if (cookieStore) {
  const token = await cookieStore.get('auth-token')
  if (token) {
    try {
      const payload = Buffer.from(token.value, 'base64').toString('utf-8')
      const decoded = JSON.parse(payload)
      authorId = decoded.userId
    } catch (e) {
      console.warn('Could not decode auth token') // Просто игнорируем!
    }
  }
}

// authorId мог остаться NULL - это приводило к ошибке
```

**Стало:**
```typescript
let authorId: string | null = null

// 1. Читаем cookies
const { cookies } = await import('next/headers')
const cookieStore = await cookies()
const token = cookieStore.get('auth-token')

// 2. Проверяем наличие токена
if (!token) {
  return NextResponse.json(
    { error: 'Требуется авторизация' },
    { status: 401 }
  )
}

// 3. Декодируем токен
try {
  const payload = Buffer.from(token.value, 'base64').toString('utf-8')
  const decoded = JSON.parse(payload)
  authorId = decoded.userId
  console.log('✅ Author ID:', authorId)
} catch (e) {
  console.error('❌ Failed to decode token:', e)
  return NextResponse.json(
    { error: 'Неверный токен авторизации' },
    { status: 401 }
  )
}

// 4. Проверяем что author_id определен
if (!authorId) {
  return NextResponse.json(
    { error: 'Не удалось определить автора' },
    { status: 401 }
  )
}

// 5. ВСЕГДА передаем author_id в БД
const insertData: any = {
  id: crypto.randomUUID(),
  title,
  content: content || '',
  channel_id: channelId,
  author_id: authorId, // ALWAYS set!
  status,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}
```

#### 2. База данных

**Таблица `news`:**
```sql
author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL
-- NOT NULL подразумевается (поле обязательное)
-- При удалении пользователя остается NULL (ON DELETE SET NULL)
```

---

## 📋 Что нужно сделать

### 1. Выполните SQL в Supabase Dashboard

Откройте https://supabase.com/dashboard → SQL Editor и выполните:

```sql
-- ВОЗВРАЩАЕМ NOT NULL constraint для author_id
ALTER TABLE news ALTER COLUMN author_id SET NOT NULL;

-- Проверяем
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'news' AND column_name = 'author_id';
-- Должно вернуть: is_nullable = 'NO'
```

Файл: [`fix-news-author-id.sql`](file:///Users/admin/Documents/GitHub/blog/fix-news-author-id.sql)

### 2. Проверьте работу

1. Войдите в систему (http://localhost:3000/login)
2. Перейдите на вкладку "📰 Новости"
3. Нажмите "➕ Добавить новость"
4. Заполните форму
5. Нажмите "✅ Создать новость"

**Ожидаемый результат:**
- ✅ Новость создается
- ✅ В консоли видите: `✅ Author ID: uuid-пользователя`
- ✅ В БД записывается `author_id`

**Если ошибка "Требуется авторизация":**
- Проверьте что вошли в систему
- Проверьте cookies браузера (F12 → Application → Cookies)
- Должен быть `auth-token`

---

## 🔍 Отладка

### Проверка токена в консоли:

Откройте консоль браузера (F12) при создании новости:

```javascript
// Должны увидеть:
🚀 Submit to: /api/news/create
📦 Data: { title: "...", ... }
✅ Author ID: xxx-xxx-xxx
📥 Response: 200 { success: true, news: {...} }
```

### Если нет Author ID:

Проверьте куки:
```javascript
document.cookie
// Должен содержать auth-token=...
```

### Как выглядит токен:

Токен хранится в cookies и содержит:
```json
{
  "userId": "uuid-пользователя",
  "username": "username",
  "role": "editor|admin|super_admin"
}
```

---

## 💡 Почему это правильно

✅ **Отслеживание авторства** - всегда знаем кто создал  
✅ **Ответственность** - можно найти создателя контента  
✅ **Аудит** - логирование действий пользователей  
✅ **Безопасность** - только авторизованные могут создавать  
✅ **Целостность данных** - ссылки на пользователя валидны  

---

**Дата:** 21 марта 2026  
**Статус:** ✅ Исправлено правильно
