# 🛡️ PRISMA SCHEMA PROTECTION

## ⚠️ КРИТИЧНО ВАЖЛИВО!

**НЕ ЗМІНЮВАТИ `prisma/schema.prisma` БЕЗ КРАЙНЬОЇ НЕОБХІДНОСТІ!**

Ця схема використовується як CRM, так і публічним сайтом. Будь-які зміни можуть зламати існуючий функціонал.

---

## 📋 Правила роботи з Prisma

### ✅ ЩО МОЖНА:
1. **Додавати НОВІ поля** до існуючих моделей (з опціональними полями або значеннями за замовчуванням)
2. **Створювати НОВІ моделі** (які не впливають на існуючі)
3. **Додавати індекси** для оптимізації

### ❌ ЩО ЗАБОРОНЕНО:
1. ❌ **Видаляти поля** - зламає CRM
2. ❌ **Змінювати назви полів** - зламає існуючі запити
3. ❌ **Змінювати типи полів** - може призвести до втрати даних
4. ❌ **Видаляти моделі** - зламає всю систему
5. ❌ **Змінювати назви моделей** - зламає всі сервіси
6. ❌ **Змінювати зв'язки між моделями** - зламає relations

---

## 🔍 Перед будь-якою зміною:

### 1. Перевірте використання
```bash
# Знайдіть всі використання моделі
grep -r "prisma.modelName" backend-v2/src/

# Знайдіть всі використання поля
grep -r "fieldName" backend-v2/src/
```

### 2. Перевірте залежності
- CRM frontend (localhost:3000)
- Public website (localhost:5173)
- Всі сервіси в `backend-v2/src/services/`
- Всі контролери в `backend-v2/src/controllers/`

### 3. Тестування
```bash
# Запустіть всі тести
npm test

# Перевірте CRM
curl http://localhost:3002/api/v2/properties

# Перевірте публічний API
curl http://localhost:3002/api/v2/public/properties
```

---

## 📊 Актуальна структура (НЕ МІНЯТИ!)

### Основні моделі:
- **`users`** - користувачі (гості, власники, агенти, адміни)
- **`properties`** - нерухомість
- **`reservations`** - бронювання
- **`tasks`** - задачі (обслуговування, прибирання)
- **`transactions`** - фінансові транзакції
- **`bank_accounts`** - банківські рахунки

### Критичні поля:

#### `properties` (model: properties)
- `id` - String (ID)
- `name` - String (назва)
- `is_active` - Boolean (активна)
- `is_published` - Boolean (опублікована для сайту)
- `price_per_night` - Float (ціна за ніч)
- `bedrooms` - Int (кількість спалень)
- `bathrooms` - Float (кількість ванних)
- `capacity` - Int (місткість)

#### `reservations` (model: reservations)
- `id` - String (ID)
- `property_id` - String (ID нерухомості)
- `guest_id` - String (ID гостя)
- **`check_in`** - DateTime (заїзд) ⚠️ НЕ check_in_date!
- **`check_out`** - DateTime (виїзд) ⚠️ НЕ check_out_date!
- `status` - ReservationStatus (статус)
- `total_amount` - Float (сума)

#### `users` (model: users)
- `id` - String (ID)
- `email` - String (email)
- `role` - UserRole (роль)
- `is_active` - Boolean (активний)
- `first_name` - String (ім'я)
- `last_name` - String (прізвище)

---

## 🚨 Якщо потрібна зміна:

### Процедура:
1. **Обговоріть з командою**
2. **Створіть backup бази даних**
3. **Створіть міграцію**
4. **Протестуйте на dev оточенні**
5. **Перевірте всі залежності**
6. **Оновіть документацію**
7. **Deploy на production**

### Backup команда:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 📝 Changelog

### 2025-10-15
- Створено систему захисту Prisma Schema
- Додано публічні ендпоінти (БЕЗ змін в схемі)
- Підтверджено сумісність з існуючою CRM

---

## 🆘 У разі проблем:

1. **Перевірте логи**: `tail -f backend-v2/logs/error-*.log`
2. **Перевірте Prisma**: `cd backend-v2 && npx prisma validate`
3. **Згенеруйте клієнт**: `cd backend-v2 && npx prisma generate`
4. **Відкатіть зміни**: `git checkout prisma/schema.prisma`

---

## ⚡ Швидка довідка

### Правильні назви моделей (множина):
- `prisma.users` ✅
- `prisma.properties` ✅
- `prisma.reservations` ✅
- `prisma.tasks` ✅

### Неправильні назви (однина):
- `prisma.user` ❌
- `prisma.property` ❌
- `prisma.reservation` ❌
- `prisma.task` ❌

### Правильні назви полів:
- `check_in` / `check_out` ✅
- `is_active` / `is_published` ✅
- `first_name` / `last_name` ✅

### Неправильні назви полів:
- `check_in_date` / `check_out_date` ❌
- `checkIn` / `checkOut` ❌
- `firstName` / `lastName` ❌

---

## 📚 Додаткові ресурси

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- CRM Services: `backend-v2/src/services/`
- Public API: `backend-v2/src/controllers/public.controller.ts`

---

**Пам'ятайте: Краще запитати двічі, ніж зламати один раз!** 🛡️

