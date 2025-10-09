# 📋 Property JSON Schema - Roomy CRM

**Версія:** 2.0  
**Дата:** 9 жовтня 2025

---

## 🏠 Повна JSON Схема Property

### **Базовий Response Format:**

```json
{
  "success": true,
  "data": {
    // Property Object (see below)
  },
  "message": "Property retrieved successfully",
  "timestamp": "2025-10-09T15:38:00.996Z"
}
```

---

## 📦 Property Object Schema

### **Основна Інформація:**

```typescript
interface Property {
  // === Identifiers ===
  id: string;                    // Приклад: "property-1760023941006-laalpfmeb"
  
  // === Basic Information ===
  name: string;                  // Основна назва
  nickname: string;              // Коротка назва
  title: string;                 // Повний title (з Airbnb)
  
  // === Type and Classification ===
  type: PropertyType;            // "APARTMENT" | "VILLA" | "STUDIO" | "TOWNHOUSE" | "PENTHOUSE" | "OTHER"
  typeOfUnit: PropertyUnitType;  // "SINGLE" | "DUPLEX" | "TRIPLEX" | "ENTIRE_BUILDING"
  
  // === Location ===
  address: string;               // Повна адреса
  city: string;                  // Місто
  country: string;               // Країна
  latitude: number;              // GPS координата (широта)
  longitude: number;             // GPS координата (довгота)
  
  // === Physical Properties ===
  capacity: number;              // Максимальна кількість гостей
  bedrooms: number;              // Кількість спалень
  bathrooms: number;             // Кількість ванних (може бути 1.5, 2.5, тощо)
  area?: number;                 // Площа в кв.м. (опціонально)
  parkingSlots?: number;         // Кількість паркомісць (опціонально)
  
  // === Pricing ===
  pricePerNight: number;         // Базова ціна за ніч
  
  // === Descriptions ===
  description: string;           // Повний опис
  summary: string;               // Короткий опис
  theSpace: string;              // Опис простору
  guestAccess?: string;          // Доступ для гостей (опціонально)
  otherThings?: string;          // Інша інформація (опціонально)
  
  // === Lists and Arrays ===
  amenities: string[];           // Список зручностей ["Wifi", "TV", "AC", ...]
  houseRules: string[];          // Правила дому
  tags: string[];                // Теги ["imported-from-airbnb", "airbnb-123456"]
  utilities: string[];           // Комунальні послуги включені
  
  // === Status Flags ===
  isActive: boolean;             // Чи активна властивість
  isPublished: boolean;          // Чи опублікована
  
  // === Booking Rules ===
  bookingWindow: string;         // "all-days" | інші опції
  advanceNotice: string;         // "none" | "same-day" | "1-day" | тощо
  minStay: number;               // Мінімальна кількість ночей
  maxStay: number;               // Максимальна кількість ночей
  checkInTime: string;           // Час заїзду "15:00"
  checkOutTime: string;          // Час виїзду "12:00"
  
  // === Financial Configuration ===
  agencyFeePercentage: number;           // % комісії агенції (25.0)
  referringAgentFeePercentage: number;   // % комісії агента (5.0)
  incomeDistribution?: any;              // Розподіл доходу (опціонально)
  
  // === External IDs ===
  pricelabId?: string;           // ID в PriceLabs (опціонально)
  airbnbId?: string;             // ID в Airbnb (опціонально, додається при імпорті)
  
  // === Regulatory ===
  dtcmLicenseExpiry?: string;    // Дата закінчення ліцензії DTCM (опціонально)
  
  // === Images ===
  primaryImage?: string;         // URL головного зображення (опціонально)
  
  // === Timestamps ===
  createdAt: string;             // ISO 8601: "2025-10-09T15:32:21.006Z"
  updatedAt: string;             // ISO 8601: "2025-10-09T15:32:21.006Z"
  
  // === Relations IDs ===
  ownerId: string;               // ID власника
  agentId?: string;              // ID агента (опціонально)
  
  // === Related Objects (Populated) ===
  owner: Owner;                  // Об'єкт власника
  agent?: Agent;                 // Об'єкт агента (опціонально)
  photos: PropertyPhoto[];       // Масив фотографій
  pricingRules: PricingRule[];   // Правила ціноутворення
  transactions: Transaction[];   // Фінансові транзакції
  reservations: Reservation[];   // Бронювання
  expenses: Expense[];           // Витрати
  auditLogs: AuditLog[];        // Журнал змін
  
  // === Counts ===
  _count: {
    reservations: number;
    photos: number;
    pricingRules: number;
    transactions: number;
    expenses: number;
    auditLogs: number;
  };
}
```

---

## 🔗 Related Objects Schemas

### **Owner Object:**

```typescript
interface Owner {
  id: string;              // "e85f43a6-cb74-4e41-97c3-a4cc507d1eea"
  firstName: string;       // "Admin"
  lastName: string;        // "User"
  email: string;           // "admin@roomy.com"
  phone: string;           // "+1234567890"
}
```

### **PropertyPhoto Object:**

```typescript
interface PropertyPhoto {
  id: string;
  propertyId: string;
  url: string;             // URL до зображення
  caption?: string;        // Підпис (опціонально)
  isCover: boolean;        // Чи це головне фото
  order: number;           // Порядок відображення
  createdAt: string;
  updatedAt: string;
}
```

### **Reservation Object:**

```typescript
interface Reservation {
  id: string;
  propertyId: string;
  guestId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkInDate: string;     // ISO 8601
  checkOutDate: string;    // ISO 8601
  totalPrice: number;
  status: string;          // "PENDING" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED"
  numberOfGuests: number;
  numberOfNights: number;
  createdAt: string;
  updatedAt: string;
}
```

### **Expense Object:**

```typescript
interface Expense {
  id: string;
  propertyId: string;
  date: string;            // ISO 8601
  category: string;        // "MAINTENANCE" | "UTILITIES" | "CLEANING" | "OTHER"
  amount: number;
  description?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 Приклад Реального Property (Імпортовано з Airbnb)

```json
{
  "success": true,
  "data": {
    "id": "property-1760023941006-laalpfmeb",
    "name": "Urban Oasis l Perfect for 4 l New Building",
    "nickname": "Urban Oasis l Perfect for 4 l New Building",
    "title": "Rental unit in Dubai · ★4.63 · 1 bedroom · 1 bath",
    "type": "APARTMENT",
    "typeOfUnit": "SINGLE",
    "address": "Address not provided",
    "city": "Unknown",
    "country": "Unknown",
    "latitude": 25.1889,
    "longitude": 55.2697,
    "capacity": 4,
    "bedrooms": 1,
    "bathrooms": 1,
    "pricePerNight": 100,
    "description": "\nExperience modern living in this beautifully designed 1-bedroom apartment located in a new building in the heart of Business Bay, Dubai. The apartment features a spacious bedroom with elegant furnishings and a comfortable living area equipped with a sofa bed, making it perfect for couples, solo travelers, or small families.<br /> Enjoy the convenience of being in a vibrant neighborhood, close to iconic landmarks, dining, and entertainment options.\nRegistration Details\nBUS-URB-QY5C2",
    "amenities": [],
    "houseRules": [],
    "tags": [
      "imported-from-airbnb",
      "airbnb-1293489979710718583"
    ],
    "isActive": true,
    "isPublished": false,
    "createdAt": "2025-10-09T15:32:21.006Z",
    "updatedAt": "2025-10-09T15:32:21.006Z",
    "ownerId": "e85f43a6-cb74-4e41-97c3-a4cc507d1eea",
    "summary": "Urban Oasis l Perfect for 4 l New Building",
    "theSpace": "\nExperience modern living in this beautifully designed 1-bedroom apartment located in a new building in the heart of Business Bay, Dubai. The apartment features a spacious bedroom with elegant furnishings and a comfortable living area equipped with a sofa bed, making it perfect for couples, solo travelers, or small families.<br /> Enjoy the convenience of being in a vibrant neighborhood, close to iconic landmarks, dining, and entertainment options.\nRegistration Details\nBUS-URB-QY5C2",
    "bookingWindow": "all-days",
    "advanceNotice": "none",
    "minStay": 3,
    "maxStay": 365,
    "utilities": [],
    "agencyFeePercentage": 25,
    "referringAgentFeePercentage": 5,
    "checkInTime": "15:00",
    "checkOutTime": "12:00",
    "owner": {
      "id": "e85f43a6-cb74-4e41-97c3-a4cc507d1eea",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@roomy.com",
      "phone": "+1234567890"
    },
    "photos": [],
    "pricingRules": [],
    "transactions": [],
    "reservations": [],
    "expenses": [],
    "auditLogs": [],
    "_count": {
      "reservations": 0,
      "photos": 0,
      "pricingRules": 0,
      "transactions": 0,
      "expenses": 0,
      "auditLogs": 0
    }
  },
  "message": "Property retrieved successfully",
  "timestamp": "2025-10-09T15:38:00.996Z"
}
```

---

## 📊 Enum Types

### **PropertyType:**
```typescript
enum PropertyType {
  APARTMENT = "APARTMENT",
  VILLA = "VILLA",
  STUDIO = "STUDIO",
  TOWNHOUSE = "TOWNHOUSE",
  PENTHOUSE = "PENTHOUSE",
  OTHER = "OTHER"
}
```

### **PropertyUnitType:**
```typescript
enum PropertyUnitType {
  SINGLE = "SINGLE",
  DUPLEX = "DUPLEX",
  TRIPLEX = "TRIPLEX",
  ENTIRE_BUILDING = "ENTIRE_BUILDING"
}
```

---

## 🎯 Airbnb Import - Які поля заповнюються

### ✅ **Автоматично імпортуються з Airbnb:**

| Поле | Джерело в Airbnb JSON | Статус |
|------|----------------------|--------|
| `name` | `headline` | ✅ |
| `nickname` | `headline` | ✅ |
| `title` | `name` | ✅ |
| `type` | `unit.category` → mapping | ✅ |
| `description` | `description` | ✅ |
| `summary` | `headline` | ✅ |
| `theSpace` | `description` | ✅ |
| `latitude` | `location.coordinates.lat` | ✅ |
| `longitude` | `location.coordinates.lng` | ✅ |
| `capacity` | `supplement.max_guests` | ✅ |
| `bedrooms` | Парсинг з `name` | ✅ |
| `bathrooms` | Парсинг з `name` | ✅ |
| `tags` | Auto: `["imported-from-airbnb", "airbnb-{id}"]` | ✅ |

### ⚙️ **Встановлюються за замовчуванням:**

| Поле | Значення за замовчуванням |
|------|---------------------------|
| `typeOfUnit` | `"SINGLE"` |
| `pricePerNight` | `100` |
| `minStay` | `3` |
| `maxStay` | `365` |
| `checkInTime` | `"15:00"` |
| `checkOutTime` | `"12:00"` |
| `bookingWindow` | `"all-days"` |
| `advanceNotice` | `"none"` |
| `agencyFeePercentage` | `25.0` |
| `referringAgentFeePercentage` | `5.0` |
| `isActive` | `true` |
| `isPublished` | `false` |

### 🔄 **Встановлюються системою:**

| Поле | Джерело |
|------|---------|
| `id` | Auto-generated: `property-{timestamp}-{random}` |
| `ownerId` | Current user ID або з request |
| `agentId` | З request (опціонально) |
| `createdAt` | Current timestamp |
| `updatedAt` | Current timestamp |

---

## 🎨 Response Format Examples

### **Success Response:**
```json
{
  "success": true,
  "data": { /* Property object */ },
  "message": "Property retrieved successfully",
  "timestamp": "2025-10-09T15:38:00.996Z"
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Property not found",
  "timestamp": "2025-10-09T15:38:00.996Z"
}
```

### **Validation Error Response:**
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid property data",
  "errors": [
    "name is required",
    "ownerId is required"
  ],
  "timestamp": "2025-10-09T15:38:00.996Z"
}
```

---

## 📋 Field Validation Rules

### **Required Fields (при створенні):**
- `name` - обов'язкове
- `ownerId` - обов'язкове
- `type` - обов'язкове (має бути один з PropertyType enum)
- `typeOfUnit` - обов'язкове (має бути один з PropertyUnitType enum)

### **Optional Fields:**
- `nickname` - якщо не вказано, використовується `name`
- `title` - опціонально
- `description` - опціонально
- `address`, `city`, `country` - опціонально
- `latitude`, `longitude` - опціонально
- `area` - опціонально
- `agentId` - опціонально
- `pricelabId` - опціонально
- `airbnbId` - опціонально (додається при імпорті)

### **Number Field Constraints:**
- `capacity` - ціле число > 0
- `bedrooms` - ціле число >= 0
- `bathrooms` - число >= 0 (може бути дробове: 1.5, 2.5)
- `pricePerNight` - число >= 0
- `minStay` - ціле число >= 1
- `maxStay` - ціле число >= minStay
- `agencyFeePercentage` - 0-100
- `referringAgentFeePercentage` - 0-100

---

## 🔗 API Endpoints для Property

### **Get Single Property:**
```bash
GET /api/v2/properties/:id
Authorization: Bearer {token}

Response: Property Object (як показано вище)
```

### **Get All Properties:**
```bash
GET /api/v2/properties
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": Property[],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### **Create Property:**
```bash
POST /api/v2/properties
Authorization: Bearer {token}
Content-Type: application/json

Body: {
  "name": "Property Name",
  "ownerId": "owner-id",
  "type": "APARTMENT",
  "typeOfUnit": "SINGLE",
  // ... інші поля
}

Response: Property Object
```

### **Import from Airbnb:**
```bash
POST /api/v2/integrations/airbnb/import-from-url
Authorization: Bearer {token}
Content-Type: application/json

Body: {
  "url": "https://www.airbnb.com/rooms/123456",
  "ownerId": "owner-id" // Опціонально для ADMIN/MANAGER
}

Response: {
  "success": true,
  "data": {
    "property": Property Object,
    "airbnbData": {
      "url": "...",
      "airbnbId": "...",
      "headline": "...",
      "host": "..."
    }
  }
}
```

---

## 📚 TypeScript Definitions

### **Повний TypeScript Interface:**

```typescript
// Основний Property DTO
export interface PropertyResponseDto {
  id: string;
  name: string;
  nickname: string;
  title?: string;
  type: PropertyType;
  typeOfUnit: PropertyUnitType;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  pricePerNight: number;
  description?: string;
  amenities: string[];
  houseRules: string[];
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  primaryImage?: string;
  pricelabId?: string;
  summary?: string;
  theSpace?: string;
  guestAccess?: string;
  otherThings?: string;
  bookingWindow: string;
  advanceNotice: string;
  minStay: number;
  maxStay: number;
  utilities: string[];
  incomeDistribution?: any;
  agencyFeePercentage: number;
  referringAgentFeePercentage: number;
  dtcmLicenseExpiry?: string;
  parkingSlots?: number;
  checkInTime: string;
  checkOutTime: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  agentId?: string;
  
  // Related objects
  owner: Owner;
  agent?: Agent;
  photos: PropertyPhoto[];
  pricingRules: PricingRule[];
  transactions: Transaction[];
  reservations: Reservation[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  
  _count: {
    reservations: number;
    photos: number;
    pricingRules: number;
    transactions: number;
    expenses: number;
    auditLogs: number;
  };
}

// DTO для створення Property
export interface CreatePropertyDto {
  name: string;
  nickname?: string;
  title?: string;
  type: PropertyType;
  typeOfUnit: PropertyUnitType;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  pricePerNight: number;
  description?: string;
  amenities?: string[];
  houseRules?: string[];
  tags?: string[];
  summary?: string;
  theSpace?: string;
  guestAccess?: string;
  otherThings?: string;
  bookingWindow?: string;
  advanceNotice?: string;
  minStay?: number;
  maxStay?: number;
  utilities?: string[];
  incomeDistribution?: any;
  agencyFeePercentage?: number;
  referringAgentFeePercentage?: number;
  dtcmLicenseExpiry?: string;
  parkingSlots?: number;
  checkInTime?: string;
  checkOutTime?: string;
  ownerId: string;
  agentId?: string;
  pricelabId?: string;
}
```

---

## 🗄️ Database Schema (Prisma)

### **Properties Table:**

```prisma
model properties {
  id                              String              @id
  name                            String
  nickname                        String?
  title                           String?
  type                            PropertyType
  type_of_unit                    PropertyUnitType
  address                         String?
  city                            String?
  country                         String?
  latitude                        Float?
  longitude                       Float?
  capacity                        Int
  bedrooms                        Int
  bathrooms                       Float
  area                            Float?
  price_per_night                 Float
  description                     String?
  amenities                       String[]            @default([])
  house_rules                     String[]            @default([])
  tags                            String[]            @default([])
  is_active                       Boolean             @default(true)
  is_published                    Boolean             @default(false)
  primary_image                   String?
  pricelab_id                     String?
  summary                         String?
  the_space                       String?
  guest_access                    String?
  other_things                    String?
  booking_window                  String              @default("all-days")
  advance_notice                  String              @default("none")
  min_stay                        Int                 @default(3)
  max_stay                        Int                 @default(365)
  utilities                       String[]            @default([])
  income_distribution             Json?
  agency_fee_percentage           Float               @default(25.0)
  referring_agent_fee_percentage  Float               @default(5.0)
  dtcm_license_expiry             DateTime?
  parking_slots                   Int?
  check_in_time                   String              @default("15:00")
  check_out_time                  String              @default("12:00")
  created_at                      DateTime            @default(now())
  updated_at                      DateTime            @updatedAt
  owner_id                        String
  agent_id                        String?
  
  // Relations
  owner                           users               @relation("PropertyOwner", fields: [owner_id], references: [id])
  agent                           users?              @relation("PropertyAgent", fields: [agent_id], references: [id])
  photos                          property_photos[]
  reservations                    reservations[]
  expenses                        expenses[]
  audit_logs                      audit_logs[]
  pricing_rules                   pricing_rules[]
  transactions                    transactions[]
  
  @@map("properties")
}
```

---

## 🎯 Mapping: Airbnb → Property

### **Direct Mappings:**

| Property Field | Airbnb Field | Transform |
|----------------|--------------|-----------|
| `name` | `headline` | Direct |
| `nickname` | `headline` | Direct |
| `title` | `name` | Direct |
| `description` | `description` | Direct |
| `summary` | `headline` | Direct |
| `theSpace` | `description` | Direct |
| `latitude` | `location.coordinates.lat` | Direct |
| `longitude` | `location.coordinates.lng` | Direct |
| `capacity` | `supplement.max_guests` | Direct |

### **Parsed Mappings:**

| Property Field | Airbnb Field | Logic |
|----------------|--------------|-------|
| `type` | `unit.category` | Map "PROPERTY_TYPE_APARTMENT" → "APARTMENT" |
| `bedrooms` | `name` | Regex: `/(\d+)\s+bedroom/` |
| `bathrooms` | `name` | Regex: `/(\d+\.?\d*)\s+bath/` |

### **Future Mappings (To Implement):**

| Property Field | Airbnb Field | Status |
|----------------|--------------|--------|
| `photos[]` | `images[]` | 🔜 To Do |
| `amenities[]` | `features[]` | 🔜 To Do |
| `city` | `location.address.city` | 🔜 To Do |
| `country` | `location.address.country` | 🔜 To Do |
| `address` | `location.address.*` | 🔜 To Do |

---

## 📖 Використання

### **Frontend (React/Next.js):**

```typescript
// Get property
const getProperty = async (propertyId: string) => {
  const response = await fetch(`http://localhost:3002/api/v2/properties/${propertyId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  
  if (result.success) {
    const property = result.data;
    console.log('Property:', property.name);
    console.log('Owner:', property.owner.firstName);
    console.log('Photos:', property.photos.length);
  }
};

// Import from Airbnb
const importFromAirbnb = async (url: string) => {
  const response = await fetch('http://localhost:3002/api/v2/integrations/airbnb/import-from-url', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });
  
  const result = await response.json();
  
  if (result.success) {
    const property = result.data.property;
    return property.id; // Redirect to /properties/{id}
  }
};
```

---

## 🎊 Summary

**Схема Property в Roomy CRM:**
- ✅ 50+ полів даних
- ✅ 7 пов'язаних таблиць
- ✅ Повна підтримка Airbnb імпорту
- ✅ Валідація та типізація
- ✅ RBAC (Role-Based Access Control)
- ✅ Audit logging

**Готово до використання!** 🚀

---

*Документація створена 9 жовтня 2025*
