# 📋 SQL СХЕМА ДЛЯ SUPABASE

## ✅ Исправленная версия

Этот SQL скрипт гарантированно работает с Supabase и включает:

- ✅ Все таблицы без ошибок зависимостей
- ✅ Автоматическое создание профиля пользователя при регистрации
- ✅ Авто-повышение первого пользователя до super_admin
- ✅ Индексы для производительности
- ✅ RLS политики безопасности
- ✅ Triggers для updated_at

---

## 🚀 Как использовать

### Шаг 1: Откройте SQL Editor в Supabase

Перейдите по ссылке:
**https://mtxhzvxetxcppzwgrrsu.supabase.co/admin/sql**

### Шаг 2: Скопируйте весь SQL код ниже

Выделите весь код из файла `supabase-schema.sql` и скопируйте.

### Шаг 3: Вставьте и выполните

1. Вставьте код в SQL Editor
2. Нажмите **Run** (или Ctrl+Enter)
3. Дождитесь выполнения

✅ Должны создаться 5 таблиц + функции + триггеры

---

## 📦 Что будет создано

### Таблицы

1. **channels** - каналы/сайты
2. **user_profiles** - профили пользователей
3. **channel_editors** - связь редакторов с каналами
4. **news** - новости
5. **news_channels** - мульти-канальная публикация

### Функции

- `handle_new_user()` - создает профиль при регистрации
- `auto_promote_first_user()` - повышает первого пользователя до super_admin

### Triggers

- `on_auth_user_created` - вызывает handle_new_user
- `on_user_profile_created` - вызывает auto_promote_first_user
- `update_*_updated_at` - авто-обновление timestamp

### Индексы

Все необходимые индексы для производительности

### RLS Политики

Политики безопасности для всех таблиц

---

## 🔍 Проверка успешного выполнения

После выполнения SQL, проверьте:

1. **Table Editor** → должны быть 5 таблиц
2. **SQL Editor** → история выполненных запросов
3. Попробуйте зарегистрироваться → должен создаться профиль

---

## ⚠️ Возможные ошибки и решения

### Ошибка: "relation already exists"

**Решение:** Удалите существующие таблицы и выполните заново

```sql
DROP TABLE IF EXISTS news_channels CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS channel_editors CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.auto_promote_first_user() CASCADE;
```

Затем выполните `supabase-schema.sql` заново.

### Ошибка: "permission denied"

**Решение:** Убедитесь, что вы используете service_role key или у вас есть права на создание таблиц

### Ошибка: "auth.users не существует"

**Решение:** Эта ошибка была исправлена в новой версии скрипта. Используйте обновленный `supabase-schema.sql`

---

## 🎯 Быстрая проверка

После выполнения SQL, выполните этот запрос для проверки:

```sql
-- Проверка таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Проверка функций
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

-- Проверка триггеров
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

Должны вернуться:
- 5 таблиц
- 2 функции
- 7+ триггеров

---

## 📞 Если что-то пошло не так

1. Проверьте консоль ошибок в SQL Editor
2. Убедитесь, что все предыдущие объекты удалены
3. Попробуйте выполнить по частям (сначала таблицы, потом функции)
4. Проверьте логи в Supabase Dashboard

---

**Готово!** После успешного выполнения можно регистрироваться в системе! 🎉

Следуйте инструкции в файле `START_HERE.md` для дальнейших шагов.
