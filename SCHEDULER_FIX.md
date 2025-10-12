# 🔧 Scheduler Fix - GET /api/v2/reservations

## 🎯 Проблема

Scheduler не міг завантажити резервації через **два критичних баги** в endpoint `GET /api/v2/reservations`:

### Баг #1: Недостатній Limit
```typescript
// ❌ БУЛО:
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
// Default limit = 10, scheduler отримував тільки 10 резервацій!

// ✅ ВИПРАВЛЕНО:
const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit as string) || 100));
// Default limit = 100, max = 1000
```

**Проблема:** Scheduler потребує **всі резервації** за період (2025-2027), а не тільки 10 штук!

---

### Баг #2: Неправильна Фільтрація Дат
```typescript
// ❌ БУЛО:
if (dateFrom) where.check_in = { gte: new Date(dateFrom) };
if (dateTo) where.check_out = { lte: new Date(dateTo) };
```

**Проблема:** Цей код показував тільки резервації, які:
- Починаються >= dateFrom
- Закінчуються <= dateTo

Але scheduler потребує **всі резервації що ПЕРЕТИНАЮТЬСЯ з періодом**!

**Приклад:**
```
Період календаря: 1 вересня 2025 - 30 вересня 2027
Резервація: 15 серпня 2025 - 5 вересня 2025

Стара логіка: ❌ НЕ показує (check_in < dateFrom)
Правильна логіка: ✅ Показує (резервація перетинається з періодом)
```

**Виправлення:**
```typescript
// ✅ ВИПРАВЛЕНО:
// Date filtering: Show all reservations that OVERLAP with the period
// A reservation overlaps if: check_in < dateTo AND check_out > dateFrom
if (dateFrom && dateTo) {
  where.AND = [
    { check_in: { lt: new Date(dateTo) } },
    { check_out: { gt: new Date(dateFrom) } }
  ];
} else if (dateFrom) {
  // Only dateFrom provided - show all reservations that end after dateFrom
  where.check_out = { gte: new Date(dateFrom) };
} else if (dateTo) {
  // Only dateTo provided - show all reservations that start before dateTo
  where.check_in = { lte: new Date(dateTo) };
}
```

---

### Баг #3: Frontend не обробляв пагінований формат
```typescript
// ❌ БУЛО:
if (response.success && response.data) {
  console.log('✅ Reservations loaded from API:', response.data.length);
  return response.data;
}
```

**Проблема:** Backend V2 повертає пагінований формат:
```json
{
  "success": true,
  "data": {
    "data": [...],  // тут резервації!
    "pagination": {...}
  }
}
```

Frontend намагався отримати `.length` на об'єкті замість масиву!

**Виправлення:**
```typescript
// ✅ ВИПРАВЛЕНО:
if (response.success && response.data) {
  // Handle both V1 and V2 response formats
  let reservationsData = [];
  if (Array.isArray(response.data)) {
    // V1 format: direct array
    reservationsData = response.data;
  } else if (response.data.data && Array.isArray(response.data.data)) {
    // V2 format: paginated response
    reservationsData = response.data.data;
  }
  
  console.log('✅ Reservations loaded from API:', reservationsData.length);
  console.log('✅ First reservation sample:', reservationsData[0]);
  return reservationsData;
}
```

---

## 📊 Змінені файли

### 1. `/backend-v2/src/controllers/reservation.controller.ts`
```diff
- const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
+ const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit as string) || 100));
```

### 2. `/backend-v2/src/services/reservation.service.ts`
```diff
- if (dateFrom) where.check_in = { gte: new Date(dateFrom) };
- if (dateTo) where.check_out = { lte: new Date(dateTo) };
+ // Date filtering: Show all reservations that OVERLAP with the period
+ if (dateFrom && dateTo) {
+   where.AND = [
+     { check_in: { lt: new Date(dateTo) } },
+     { check_out: { gt: new Date(dateFrom) } }
+   ];
+ } else if (dateFrom) {
+   where.check_out = { gte: new Date(dateFrom) };
+ } else if (dateTo) {
+   where.check_in = { lte: new Date(dateTo) };
+ }
```

### 3. `/components/scheduler/GanttScheduler.tsx`
```diff
  const response = await reservationServiceAdapted.getAll({
    dateFrom: '2025-09-01',
    dateTo: '2027-09-30',
+   limit: 1000,
+   page: 1,
  });

  if (response.success && response.data) {
+   // Handle both V1 and V2 response formats
+   let reservationsData = [];
+   if (Array.isArray(response.data)) {
+     reservationsData = response.data;
+   } else if (response.data.data && Array.isArray(response.data.data)) {
+     reservationsData = response.data.data;
+   }
    
-   console.log('✅ Reservations loaded from API:', response.data.length);
+   console.log('✅ Reservations loaded from API:', reservationsData.length);
+   console.log('✅ First reservation sample:', reservationsData[0]);
-   return response.data;
+   return reservationsData;
  }
```

---

## 🧪 Як тестувати

### 1. Запустити backend:
```bash
cd backend-v2
npm run dev
```

### 2. Запустити frontend:
```bash
npm run dev
```

### 3. Відкрити scheduler:
```
http://localhost:3000/scheduler
```

### 4. Перевірити console:
Має бути:
```
✅ Reservations loaded from API: 25
✅ First reservation sample: {id: "...", propertyId: "...", ...}
🎯 Gantt loaded with 25 tasks from API
```

### 5. Перевірити UI:
- ✅ Properties відображаються як рядки
- ✅ Reservations відображаються як блоки на properties
- ✅ Можна створити нову резервацію через drag&drop
- ✅ Можна редагувати існуючу резервацію
- ✅ Зміни зберігаються в БД

---

## 🎯 Формат API Response

### Request:
```http
GET /api/v2/reservations?dateFrom=2025-09-01&dateTo=2027-09-30&limit=1000&page=1
Authorization: Bearer {token}
```

### Response:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "res_123",
        "reservationId": "RES-2025-001",
        "propertyId": "prop_456",
        "guestName": "John Doe",
        "guestEmail": "john@example.com",
        "checkIn": "2025-10-15T00:00:00.000Z",
        "checkOut": "2025-10-18T00:00:00.000Z",
        "guests": 2,
        "totalAmount": 450,
        "paidAmount": 200,
        "outstandingBalance": 250,
        "status": "CONFIRMED",
        "source": "AIRBNB",
        "property": {
          "id": "prop_456",
          "name": "Luxury Apartment Downtown",
          "address": "123 Main St",
          "city": "Dubai",
          "country": "UAE"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 1000,
      "total": 25,
      "totalPages": 1
    }
  },
  "message": "Reservations retrieved successfully"
}
```

---

## 📊 Критерії перетину резервацій

Резервація **перетинається** з періодом календаря, якщо:

```
check_in < calendar_end_date AND check_out > calendar_start_date
```

### Приклади:

| Календар | Резервація | Перетин? | Причина |
|----------|------------|----------|---------|
| 01.09 - 30.09 | 15.09 - 20.09 | ✅ Так | Повністю всередині |
| 01.09 - 30.09 | 25.08 - 05.09 | ✅ Так | Починається раніше |
| 01.09 - 30.09 | 28.09 - 05.10 | ✅ Так | Закінчується пізніше |
| 01.09 - 30.09 | 20.08 - 10.10 | ✅ Так | Охоплює весь період |
| 01.09 - 30.09 | 20.10 - 25.10 | ❌ Ні | Після періоду |
| 01.09 - 30.09 | 20.08 - 25.08 | ❌ Ні | До періоду |

---

## ✅ Результат

Після цих виправлень:

✅ Scheduler завантажує **всі резервації** за період  
✅ Показує резервації що **перетинаються** з календарем  
✅ Обробляє **пагінований формат** V2 API  
✅ Створення/оновлення/видалення працює через DataProcessor  
✅ RBAC працює коректно  

**Scheduler готовий до використання! 🎉**

---

**Created:** October 11, 2025  
**Status:** ✅ FIXED  
**Critical Bugs Fixed:** 3

