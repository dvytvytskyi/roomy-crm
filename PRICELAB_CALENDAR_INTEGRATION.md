# PriceLabs інтеграція з календарем

## 📊 Як працює PriceLabs

### Мапування з квартирами

```
Property (Database)              PriceLabs API
┌──────────────────────┐        ┌───────────────────────────┐
│ id: "prop_123"       │        │ listing_id: "pl_456"      │
│ pricelab_id: "pl_456"│───────>│                           │
│ price_per_night: 50  │        │ Pricing по датах:         │
│ (fallback)           │        │ - 2025-10-13: $80         │
└──────────────────────┘        │ - 2025-10-14: $90         │
                                │ - 2025-10-15: $100        │
                                └───────────────────────────┘
```

### Коли створюється зв'язок:

1. **Автоматично** при створенні квартири:
   - PropertyService викликає `PricelabsService.createListing()`
   - PriceLabs повертає `listing_id`
   - `listing_id` зберігається як `pricelab_id` в базі

2. **Вручну** через Marketing tab:
   - Поле `pricelabId` можна встановити вручну

3. **Синхронізація**:
   - При оновленні критичних полів (назва, адреса, bedrooms і т.д.)
   - Автоматично оновлюється в PriceLabs

---

## 🎯 Нова інтеграція для календаря

### Backend API

**Endpoint:**
```
GET /api/v2/calendar/pricing?startDate=2025-09-01&endDate=2027-09-30
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "propertyId": "prop_123",
      "pricelabId": "pl_456",
      "pricingMap": {
        "2025-10-13": 80,
        "2025-10-14": 90,
        "2025-10-15": 100,
        "2025-10-16": 85
      }
    },
    {
      "propertyId": "prop_789",
      "pricelabId": null,
      "pricingMap": {
        "2025-10-13": 50,
        "2025-10-14": 50,
        "2025-10-15": 50
      }
    }
  ],
  "message": "Pricing data retrieved successfully",
  "timestamp": "2025-10-13T10:00:00.000Z"
}
```

### Логіка роботи:

1. **Квартира з PriceLabs ID:**
   - Викликається `PricelabsService.getCurrentPrice(pricelabId)`
   - Отримується ціна з PriceLabs API
   - Заповнюється `pricingMap` для всього діапазону

2. **Квартира без PriceLabs ID:**
   - Використовується `price_per_night` (базова ціна)
   - Заповнюється `pricingMap` однаковою ціною

3. **Помилка PriceLabs API:**
   - Fallback на `price_per_night`
   - Логується warning, але квартира все одно відображається

---

## 💻 Використання в Scheduler

### Крок 1: Завантажити ціни при ініціалізації

В `GanttScheduler.tsx` додати:

```typescript
import { pricingCalendarService, PropertyPricingMap } from '@/lib/api/services/pricingCalendarService';

const [pricingMaps, setPricingMaps] = useState<PropertyPricingMap[]>([]);

// Завантажити ціни разом з квартирами
useEffect(() => {
  const loadAllData = async () => {
    try {
      setIsLoading(true);

      // 1. Завантажуємо квартири та бронювання (як зараз)
      const [propertiesData, reservationsData] = await Promise.all([
        loadAllProperties(),
        loadReservations()
      ]);

      setProperties(propertiesData);
      setReservations(reservationsData);

      // 2. НОВОЕ: Завантажуємо ціни для всіх квартир
      const pricingResponse = await pricingCalendarService.getBulkPricing(
        '2025-09-01',  // startDate
        '2027-09-30'   // endDate
      );

      if (pricingResponse.success) {
        setPricingMaps(pricingResponse.data);
        console.log('✅ Pricing maps loaded:', pricingResponse.data);
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  loadAllData();
}, []);
```

### Крок 2: Додати pricingMap в task data

```typescript
const convertPropertiesToGanttTasks = (
  properties: PropertyV2[], 
  pricingMaps: PropertyPricingMap[]
): GanttTask[] => {
  return properties.map(property => {
    // Знаходимо pricing map для цієї квартири
    const propertyPricing = pricingMaps.find(pm => pm.propertyId === property.id);
    
    return {
      id: `${ID_PREFIXES.PROPERTY}${property.id}`,
      text: `${property.name} - ${property.address}, ${property.city}`,
      start_date: new Date(2025, 8, 1),
      duration: 365,
      type: "project",
      progress: 0,
      open: true,
      parent: 0,
      render: "split",
      
      // Базова ціна (fallback)
      pricePerNight: property.pricePerNight,
      
      // ✨ НОВОЕ: Додаємо pricing map з PriceLabs
      pricingMap: propertyPricing?.pricingMap || {},
      
      // Інші поля...
      propertyId: property.id,
      propertyType: property.type,
      capacity: property.capacity,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      ownerName: property.owner ? `${property.owner.firstName} ${property.owner.lastName}` : 'Не призначено',
      isActive: property.isActive
    };
  });
};
```

### Крок 3: Використати в getPriceForDate

Функція `getPriceForDate()` **вже готова** і підтримує `pricingMap`:

```typescript
const getPriceForDate = (task: any, date: Date): number => {
  // 1. Перевіряємо pricingMap (з PriceLabs)
  if (task.pricingMap && typeof task.pricingMap === 'object') {
    const dateStr = date.toISOString().split('T')[0];
    if (task.pricingMap[dateStr]) {
      return task.pricingMap[dateStr]; // ✅ Ціна з PriceLabs!
    }
  }
  
  // 2. Fallback до базової ціни
  return task.pricePerNight || 0;
};
```

---

## 🚀 Повний приклад інтеграції

### В `GanttScheduler.tsx`:

```typescript
// 1. Додати state для pricing maps
const [pricingMaps, setPricingMaps] = useState<PropertyPricingMap[]>([]);

// 2. Завантажити ціни
useEffect(() => {
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [propertiesData, reservationsData, pricingResponse] = await Promise.all([
        loadAllProperties(),
        loadReservations(),
        pricingCalendarService.getBulkPricing('2025-09-01', '2027-09-30')
      ]);

      setProperties(propertiesData);
      setReservations(reservationsData);
      
      if (pricingResponse.success) {
        setPricingMaps(pricingResponse.data);
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
      handleApiError(error, 'Data loading');
    } finally {
      setIsLoading(false);
    }
  };

  loadAllData();
}, []);

// 3. Передати pricingMaps в конвертацію
const ganttTasks = useMemo(() => {
  if (properties.length > 0 || reservations.length > 0) {
    const combined = combinePropertiesAndReservations(
      properties, 
      reservations,
      pricingMaps // ✅ Передаємо pricing maps
    );
    return combined;
  } else {
    return tasks?.data || [];
  }
}, [properties, reservations, pricingMaps, tasks]);
```

---

## 🎨 Результат

После інтеграції:

✅ **Квартири з PriceLabs ID** - показують динамічні ціни з PriceLabs  
✅ **Квартири без PriceLabs ID** - показують базову ціну  
✅ **Fallback на базову ціну** - якщо PriceLabs недоступний  
✅ **Автоматичне оновлення** - при зміні діапазону дат  

---

## 🔧 Налагодження

### Перевірити чи працює PriceLabs:

```bash
# 1. Перевірити API ключ
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/v2/integrations/pricelabs/debug

# 2. Отримати всі лістинги з PriceLabs
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/v2/integrations/pricelabs/listings

# 3. Отримати ціну для конкретного лістингу
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/v2/integrations/pricelabs/prices/YOUR_PRICELAB_ID

# 4. Отримати bulk pricing для календаря
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3002/api/v2/calendar/pricing?startDate=2025-10-01&endDate=2025-10-31"
```

### Логи для відладки:

```typescript
// В GanttScheduler.tsx
console.log('📊 Pricing Maps:', pricingMaps);
console.log('💰 Price for date:', getPriceForDate(task, new Date()));
```

---

## 📝 TODO для покращення

1. **Кешування цін** - зберігати в localStorage для швидшого завантаження
2. **Автоматичне оновлення** - оновлювати ціни раз на добу
3. **Розширений діапазон** - PriceLabs API може повертати ціни на весь рік
4. **Індикатор джерела** - показувати звідки взята ціна (PriceLabs vs Base Price)

---

## ✅ Готово!

Тепер календар автоматично завантажує ціни з PriceLabs і відображає їх в кожній клітинці!

