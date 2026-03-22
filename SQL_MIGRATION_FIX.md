# 📝 История изменений SQL миграции

## Проблема
При повторном выполнении миграции возникала ошибка:
```
ERROR: 42710: trigger "update_channels_updated_at" for relation "channels" already exists
```

## Решение
Сделана миграция **идемпотентной** - можно выполнять многократно без ошибок.

### Что изменено:

#### 1. Триггеры (строки 157-186)
**Было:**
```sql
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Стало:**
```sql
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_channels_updated_at'
    ) THEN
        CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
```

#### 2. Политики RLS (строки 86-146)
Добавлено удаление существующих политик перед созданием:
```sql
DROP POLICY IF EXISTS "Public read access for active channels" ON channels;
DROP POLICY IF EXISTS "Public read access for user profiles" ON user_profiles;
-- ... и так далее для всех политик
```

#### 3. Индексы (строки 70-77)
Использован `CREATE INDEX IF NOT EXISTS`:
```sql
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
```

#### 4. Таблицы (строки 8-68)
Уже использовали `CREATE TABLE IF NOT EXISTS` - без изменений.

---

## Как использовать

### Первый запуск (создание с нуля):
```sql
-- Просто выполните весь файл миграции
-- supabase/migrations/20260321_create_database_schema.sql
```

### Повторный запуск (исправление/обновление):
```sql
-- Выполните тот же файл - ошибок не будет
-- Все объекты будут проверены и созданы/обновлены при необходимости
```

### Проверка результата:
```sql
-- Проверить таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Проверить триггеры
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Проверить политики RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Проверить индексы
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## Преимущества

✅ **Идемпотентность** - можно выполнять многократно  
✅ **Безопасность** - не ломает существующие данные  
✅ **Атомарность** - все или ничего (транзакция)  
✅ **Проверка объектов** - создает только если нет  
✅ **Обновление политик** - пересоздает политики RLS  

---

## Структура миграции

1. **Таблицы** (IF NOT EXISTS)
   - channels
   - user_profiles
   - channel_editors
   - news
   - news_channels

2. **Индексы** (IF NOT EXISTS)
   - 7 индексов для производительности

3. **RLS** (ENABLE + DROP + CREATE)
   - Включение RLS для всех таблиц
   - Удаление старых политик
   - Создание новых политик

4. **Функции** (CREATE OR REPLACE)
   - update_updated_at_column()

5. **Триггеры** (IF NOT EXISTS)
   - 3 триггера для авто-обновления timestamps

---

**Дата обновления:** 21 марта 2026  
**Статус:** ✅ Готова к многократному использованию
