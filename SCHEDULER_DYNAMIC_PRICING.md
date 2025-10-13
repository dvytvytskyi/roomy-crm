# Динамічне ціноутворення в календарі

## Огляд

Календар підтримує відображення унікальних цін для кожної дати. Ціни відображаються як текст в клітинках календаря і автоматично ховаються під бронюваннями.

## Як це працює

### 1. Базова ціна (за замовчуванням)

Якщо у квартири немає динамічного ціноутворення, використовується базова ціна з поля `pricePerNight`:

```typescript
{
  id: "prop_123",
  name: "Квартира на Хрещатику",
  pricePerNight: 50,  // Ця ціна буде показуватись для всіх днів
  type: "project",
  // ...
}
```

### 2. Динамічне ціноутворення через об'єкт (pricingMap)

Найпростіший спосіб - використовувати об'єкт `pricingMap`, де ключ - це дата в форматі `YYYY-MM-DD`, а значення - ціна:

```typescript
{
  id: "prop_123",
  name: "Квартира на Хрещатику",
  pricePerNight: 50,  // Базова ціна (fallback)
  pricingMap: {
    "2025-10-15": 80,   // 15 жовтня - $80
    "2025-10-16": 80,   // 16 жовтня - $80
    "2025-10-17": 100,  // 17 жовтня - $100 (вихідні)
    "2025-12-31": 200,  // Новий рік - $200
    "2026-01-01": 200,  // 1 січня - $200
  },
  type: "project",
  // ...
}
```

### 3. Динамічне ціноутворення через масив (pricing)

Альтернативний спосіб - масив з об'єктами:

```typescript
{
  id: "prop_123",
  name: "Квартира на Хрещатику",
  pricePerNight: 50,  // Базова ціна (fallback)
  pricing: [
    { date: "2025-10-15", price: 80 },
    { date: "2025-10-16", price: 80 },
    { date: "2025-10-17", price: 100 },
    { date: "2025-12-31", price: 200 },
    { date: "2026-01-01", price: 200 },
  ],
  type: "project",
  // ...
}
```

## Пріоритет цін

Система використовує наступний пріоритет:

1. **pricingMap[date]** - якщо є ціна для конкретної дати в pricingMap
2. **pricing[].price** - якщо є ціна для конкретної дати в масиві pricing
3. **pricePerNight** - базова ціна (fallback)

## Приклад використання

### Модифікація даних перед відправкою в Gantt

У файлі `GanttScheduler.tsx` в функції `convertPropertiesToGanttTasks`:

```typescript
const convertPropertiesToGanttTasks = (properties: PropertyV2[]): GanttTask[] => {
  return properties.map(property => ({
    id: `${ID_PREFIXES.PROPERTY}${property.id}`,
    text: `${property.name} - ${property.address}, ${property.city}`,
    start_date: new Date(2025, 9, 1),
    duration: 365,
    type: "project",
    progress: 0,
    open: true,
    parent: 0,
    render: "split",
    
    // Базова ціна
    pricePerNight: property.pricePerNight,
    
    // ДОДАТИ: Динамічне ціноутворення
    pricingMap: property.pricingMap || {},
    // АБО
    pricing: property.pricing || [],
    
    // Інші поля...
  }));
};
```

### Завантаження цін з API

Якщо ціни зберігаються в базі даних, потрібно додати endpoint для їх отримання:

```typescript
// У backend API
GET /api/v2/properties/:id/pricing?from=2025-10-01&to=2026-10-31

// Відповідь:
{
  "success": true,
  "data": {
    "2025-10-15": 80,
    "2025-10-16": 80,
    "2025-10-17": 100,
    // ...
  }
}
```

Потім в `GanttScheduler.tsx` завантажувати ціни для кожної квартири:

```typescript
const loadPropertyWithPricing = async (property: PropertyV2) => {
  const pricingResponse = await fetch(
    `/api/v2/properties/${property.id}/pricing?from=2025-09-01&to=2027-09-30`
  );
  const pricingData = await pricingResponse.json();
  
  return {
    ...property,
    pricingMap: pricingData.data
  };
};
```

## Візуальне відображення

- Ціни відображаються чорним текстом (11px)
- `z-index: 0` - ціни завжди позаду бронювань
- `pointer-events: none` - ціни не блокують drag & drop
- Автоматичне оновлення при зміні даних

## Приклад повної інтеграції

```typescript
// 1. Додати поле в інтерфейс PropertyV2
interface PropertyV2 {
  id: string;
  name: string;
  pricePerNight: number;
  pricingMap?: Record<string, number>;  // ✅ Додати
  // ...
}

// 2. Завантажити ціни з API
const loadAllProperties = async () => {
  const properties = await propertyServiceAdapted.getAll();
  
  // Завантажуємо ціни для кожної квартири паралельно
  const propertiesWithPricing = await Promise.all(
    properties.map(async (property) => {
      const pricing = await loadPricingForProperty(property.id);
      return {
        ...property,
        pricingMap: pricing
      };
    })
  );
  
  return propertiesWithPricing;
};

// 3. Передати дані в Gantt
const ganttTasks = convertPropertiesToGanttTasks(propertiesWithPricing);
```

## Тестування

Щоб перевірити роботу динамічного ціноутворення, додайте в mock дані:

```typescript
const mockProperty = {
  id: "test_1",
  name: "Test Apartment",
  pricePerNight: 50,
  pricingMap: {
    "2025-10-13": 100,  // Сьогодні
    "2025-10-14": 120,  // Завтра
    "2025-10-15": 80,
  },
  type: "project",
  // ...
};
```

Після цього в календарі ви побачите різні ціни для різних дат.

