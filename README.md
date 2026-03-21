# Простая система управления новостями

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Откройте https://supabase.com/dashboard/project/mtxhzvxetxcppzwgrrsu
2. Перейдите в SQL Editor
3. Выполните SQL для создания таблиц (если еще не созданы):

```sql
-- Добавим поле username в user_profiles если его нет
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password TEXT;
```

### 3. Настройка переменных окружения

Скопируйте `.env.local.example` в `.env.local`:

```bash
cp .env.local.example .env.local
```

Заполните `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - ваш URL из Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - ваш Service Role ключ из Supabase

### 4. Запуск локально

```bash
npm run dev
```

Сайт доступен: http://localhost:3000

### 5. Вход в систему

**Используйте ваши учетные данные:**
- Логин: `dj@li.ru` (или ваш email)
- Пароль: ваш пароль

**Тестовый вход (если работаете локально):**
- Логин: `admin`
- Пароль: `admin123`

---

## 📊 База данных

Все данные хранятся в **Supabase PostgreSQL**:

- ✅ **users** (user_profiles) - пользователи
- ✅ **channels** - каналы
- ✅ **channel_editors** - привязки редакторов
- ✅ **news** - новости (будет добавлено)

---

## 🔧 Как использовать

### 1️⃣ Войти в админку

1. Откройте https://blog-three-opal-85.vercel.app/login
2. Введите логин/пароль
3. Попадаете в дашборд

### 2️⃣ Создать пользователя

1. В дашборде форма "Создать пользователя"
2. Заполните:
   - Логин (уникальный)
   - Пароль (мин 6 символов)
   - Имя
   - Роль (редактор/админ/супер-админ)
3. Нажмите "Создать"

### 3️⃣ Создать канал

1. В дашборде форма "Создать канал"
2. Название и ключ (slug)
3. Нажмите "Создать канал"

---

## 🌐 Деплой на Vercel

Автоматически при push в GitHub:

```bash
git add .
git commit -m "Update"
git push
```

Vercel сам обновит сайт.

**ВАЖНО:** Добавьте переменные окружения в Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 📝 API

### POST /api/auth/signin
Вход в систему
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### POST /api/users/create
Создать пользователя (FormData)

### POST /api/channels/create
Создать канал (FormData)

---

## 🔐 Безопасность

- Пароли хешируются через bcrypt
- JWT токены для сессий (24 часа)
- HttpOnly cookies
- Supabase RLS (настраивается отдельно)

---

## 🎯 Что дальше?

1. ✅ Авторизация работает
2. ✅ Создание пользователей работает
3. ✅ Создание каналов работает
4. ⏳ Добавление новостей (следующий шаг)
5. ⏳ Редактирование новостей
6. ⏳ Публикация/скрытие
7. ⏳ Вывод новостей на сайтах
