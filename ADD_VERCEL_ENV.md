# 🎯 Добавление Anon Key в Vercel (через Dashboard)

## ✅ Ключ готов к добавлению:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eGh6dnhldHhjcHB6d2dycnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzM4OTUsImV4cCI6MjA4OTY0OTg5NX0.XdG1XFNFEycGc3du5AW-qgJM2Qvq0_X4-__vg-d2ZxA
```

---

## 📋 Пошаговая инструкция:

### Шаг 1: Откройте Vercel Dashboard

Перейдите по ссылке:
```
https://vercel.com/dashboard
```

### Шаг 2: Найдите проект "blog"

Кликните на проект чтобы открыть его страницу.

### Шаг 3: Перейдите в Settings

В верхней вкладке нажмите **"Settings"**.

### Шаг 4: Откройте Environment Variables

В левом меню выберите **"Environment Variables"**.

### Шаг 5: Добавьте новую переменную

Нажмите кнопку **"Add New"** или **"+ Add Variable"**.

### Шаг 6: Заполните форму:

**Field 1 - Name:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Field 2 - Value:**
Скопируйте и вставьте этот ключ (полностью!):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eGh6dnhldHhjcHB6d2dycnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzM4OTUsImV4cCI6MjA4OTY0OTg5NX0.XdG1XFNFEycGc3du5AW-qgJM2Qvq0_X4-__vg-d2ZxA
```

**Field 3 - Environments:**

Отметьте ВСЕ три галочки:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Шаг 7: Сохраните

Нажмите кнопку **"Save"** или **"Add Variable"**.

---

## 🔄 После сохранения:

1. Vercel автоматически начнет новый деплой (увидите "Building..." или "Deploying...")
2. Подождите **1-2 минуты** пока завершится деплой
3. Деплой завершится успешно ✅

---

## ✅ Проверка:

### Тест 1: Проверите что API работает

Откройте в браузере:
```
https://blog-three-opal-85.vercel.app/api/public/news
```

**Должен быть JSON:**
```json
{
  "success": true,
  "news": [...],
  "timestamp": "2026-03-23T..."
}
```

### Тест 2: Проверите GitHub Pages

Откройте:
```
https://bestdeejay-design.github.io/blog/test-news-widget.html
```

**Должны увидеть новости!** ✅

---

## 🐛 Если что-то не так:

### API все еще возвращает 404 или HTML?

1. Проверьте что деплой завершился (смотрите Deployments на Vercel)
2. Проверьте что переменная добавлена правильно (Settings → Environment Variables)
3. Попробуйте очистить кэш браузера

### GitHub Pages показывает ошибку?

1. Откройте консоль браузера (F12)
2. Посмотрите текст ошибки
3. Пришлите скриншот или текст ошибки

---

## 💡 Важно:

- ✅ Переменная должна называться точно `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ Значение должно быть скопировано полностью (без пробелов в начале/конце)
- ✅ Должно быть отмечено во всех трех environment
- ✅ Vercel должен перезадеплоить проект после добавления переменной

---

## 🔗 Ссылки:

- Проект на Vercel: https://vercel.com/dashboard
- API endpoint: https://blog-three-opal-85.vercel.app/api/public/news
- GitHub Pages тест: https://bestdeejay-design.github.io/blog/test-news-widget.html

---

**Успехов! После добавления переменной новости заработают!** 🚀
