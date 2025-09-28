# Сутності бази даних - Property Management System

## 🗄️ ПОВНА PRISMA СХЕМА (46 МОДЕЛЕЙ)

### ✅ **СТАТИСТИКА:**
- **46 моделей та enum'ів**
- **706 рядків коду**
- **Валідна схема** без помилок
- **База даних синхронізована**
- **Prisma Client згенерований**

---

## 1. 👥 USER MANAGEMENT (8 моделей)

### User (Користувачі)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  phone     String?
  avatar    String?
  role      UserRole @default(GUEST)
  isActive  Boolean  @default(true)
  isVerified Boolean @default(false)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  ownedProperties     Property[]
  managedProperties   PropertyManager[]
  reservations        Reservation[]
  reviews             Review[]
  transactions        Transaction[]
  maintenance         Maintenance[]
  cleaning            Cleaning[]
  notifications       Notification[]
  sentMessages        Message[] @relation("MessageSender")
  receivedMessages    Message[] @relation("MessageReceiver")
  bankAccounts        BankAccount[]
  payments            Payment[]
}
```

### UserRole (Ролі користувачів)
```prisma
enum UserRole {
  ADMIN
  MANAGER
  AGENT
  OWNER
  GUEST
  CLEANER
  MAINTENANCE
}
```

---

## 2. 🏠 PROPERTY MANAGEMENT (6 моделей)

### Property (Об'єкти нерухомості)
```prisma
model Property {
  id          String       @id @default(cuid())
  name        String
  type        PropertyType
  address     String
  city        String
  country     String
  latitude    Float?
  longitude   Float?
  capacity    Int
  bedrooms    Int
  bathrooms   Int
  area        Float?
  pricePerNight Float
  description String?
  amenities   String[]
  houseRules  String?
  isActive    Boolean      @default(true)
  isPublished Boolean      @default(false)
  ownerId     String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Relations
  owner          User              @relation(fields: [ownerId], references: [id])
  managers       PropertyManager[]
  reservations   Reservation[]
  reviews        Review[]
  maintenance    Maintenance[]
  cleaning       Cleaning[]
  images         PropertyImage[]
  pricingRules   PricingRule[]
  availability   Availability[]
  priceHistory   PriceHistory[]
  amenitiesList  PropertyAmenity[]
  documents      PropertyDocument[]
  messages       Message[]
}
```

### PropertyType (Типи нерухомості)
```prisma
enum PropertyType {
  APARTMENT
  HOUSE
  VILLA
  PENTHOUSE
  STUDIO
  COTTAGE
  BEACH_HOUSE
  CONDO
  TOWNHOUSE
  LOFT
}
```

### PropertyImage (Зображення об'єктів)
```prisma
model PropertyImage {
  id         String @id @default(cuid())
  propertyId String
  url        String
  alt        String?
  isPrimary  Boolean @default(false)
  order      Int     @default(0)
  createdAt  DateTime @default(now())

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}
```

### PropertyDocument (Документи об'єктів)
```prisma
model PropertyDocument {
  id         String @id @default(cuid())
  propertyId String
  name       String
  url        String
  type       DocumentType
  expiresAt  DateTime?
  createdAt  DateTime @default(now())

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}

enum DocumentType {
  CONTRACT
  INSURANCE
  PERMIT
  CERTIFICATE
  OTHER
}
```

### PropertyManager (Менеджери об'єктів)
```prisma
model PropertyManager {
  id         String   @id @default(cuid())
  propertyId String
  userId     String
  role       ManagerRole @default(MANAGER)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id])

  @@unique([propertyId, userId])
}

enum ManagerRole {
  MANAGER
  ASSISTANT
  VIEWER
}
```

---

## 3. 📅 RESERVATION SYSTEM (5 моделей)

### Reservation (Резервації)
```prisma
model Reservation {
  id            String            @id @default(cuid())
  propertyId    String
  guestId       String
  checkIn       DateTime
  checkOut      DateTime
  status        ReservationStatus @default(PENDING)
  paymentStatus PaymentStatus     @default(UNPAID)
  guestStatus   GuestStatus       @default(UPCOMING)
  totalAmount   Float
  paidAmount    Float             @default(0)
  guestCount    Int               @default(1)
  specialRequests String?
  source        ReservationSource @default(DIRECT)
  externalId    String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  // Relations
  property      Property          @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  guest         User              @relation(fields: [guestId], references: [id])
  transactions  Transaction[]
  reviews       Review[]
  messages      Message[]
  adjustments   ReservationAdjustment[]
}
```

### ReservationStatus (Статуси резервацій)
```prisma
enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
  MODIFIED
}
```

### PaymentStatus (Статуси платежів)
```prisma
enum PaymentStatus {
  UNPAID
  PARTIALLY_PAID
  FULLY_PAID
  REFUNDED
  PENDING_REFUND
}
```

### GuestStatus (Статуси гостей)
```prisma
enum GuestStatus {
  UPCOMING
  CHECKED_IN
  CHECKED_OUT
  NO_SHOW
  CANCELLED
}
```

### ReservationSource (Джерела бронювань)
```prisma
enum ReservationSource {
  DIRECT
  AIRBNB
  BOOKING_COM
  VRBO
  OTHER
}
```

### ReservationAdjustment (Корекції резервацій)
```prisma
model ReservationAdjustment {
  id             String   @id @default(cuid())
  reservationId  String
  type           AdjustmentType
  amount         Float
  description    String
  reason         String?
  createdAt      DateTime @default(now())
  createdBy      String

  reservation Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
}

enum AdjustmentType {
  DISCOUNT
  FEE
  REFUND
  DAMAGE
  OTHER
}
```

---

## 4. 💰 PRICING SYSTEM (4 моделі)

### PricingRule (Правила ціноутворення)
```prisma
model PricingRule {
  id          String     @id @default(cuid())
  propertyId  String
  name        String
  type        RuleType
  value       Float
  startDate   DateTime
  endDate     DateTime?
  isActive    Boolean    @default(true)
  priority    Int        @default(0)
  conditions  Json?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}

enum RuleType {
  BASE_PRICE
  SEASONAL
  WEEKEND
  HOLIDAY
  LAST_MINUTE
  EARLY_BIRD
  LENGTH_OF_STAY
  OCCUPANCY
  CUSTOM
}
```

### PriceHistory (Історія цін)
```prisma
model PriceHistory {
  id          String   @id @default(cuid())
  propertyId  String
  date        DateTime
  basePrice   Float
  finalPrice  Float
  source      String   @default("SYSTEM")
  createdAt   DateTime @default(now())

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([propertyId, date])
}
```

### Availability (Доступність)
```prisma
model Availability {
  id          String            @id @default(cuid())
  propertyId  String
  date        DateTime
  status      AvailabilityStatus @default(AVAILABLE)
  price       Float?
  minStay     Int?
  maxStay     Int?
  reason      String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([propertyId, date])
}

enum AvailabilityStatus {
  AVAILABLE
  BLOCKED
  BOOKED
  MAINTENANCE
  CLEANING
  OUT_OF_ORDER
}
```

---

## 5. ⭐ AMENITIES & REVIEWS (4 моделі)

### Amenity (Зручності)
```prisma
model Amenity {
  id          String    @id @default(cuid())
  name        String    @unique
  category    String
  icon        String?
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  properties PropertyAmenity[]
}
```

### PropertyAmenity (Зручності об'єктів)
```prisma
model PropertyAmenity {
  id         String @id @default(cuid())
  propertyId String
  amenityId  String

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  amenity  Amenity  @relation(fields: [amenityId], references: [id], onDelete: Cascade)

  @@unique([propertyId, amenityId])
}
```

### Review (Відгуки)
```prisma
model Review {
  id           String   @id @default(cuid())
  propertyId   String
  guestId      String
  reservationId String?
  rating       Int      @db.SmallInt
  comment      String?
  response     String?
  isPublic     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  property    Property     @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  guest       User         @relation(fields: [guestId], references: [id])
  reservation Reservation? @relation(fields: [reservationId], references: [id], onDelete: SetNull)

  @@unique([propertyId, guestId])
}
```

---

## 6. 💳 FINANCIAL SYSTEM (4 моделі)

### Transaction (Транзакції)
```prisma
model Transaction {
  id              String            @id @default(cuid())
  userId          String
  reservationId   String?
  type            TransactionType
  amount          Float
  currency        String            @default("USD")
  status          TransactionStatus @default(PENDING)
  paymentGateway  String?
  transactionRef  String?
  description     String?
  metadata        Json?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  user        User         @relation(fields: [userId], references: [id])
  reservation Reservation? @relation(fields: [reservationId], references: [id], onDelete: SetNull)
}

enum TransactionType {
  PAYMENT
  REFUND
  CHARGE
  WITHDRAWAL
  COMMISSION
  FEE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
}
```

### Payment (Платежі)
```prisma
model Payment {
  id              String        @id @default(cuid())
  userId          String
  amount          Float
  currency        String        @default("USD")
  status          PaymentStatus @default(UNPAID)
  paymentMethod   String?
  paymentGateway  String?
  transactionRef  String?
  description     String?
  metadata        Json?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

### BankAccount (Банківські рахунки)
```prisma
model BankAccount {
  id            String   @id @default(cuid())
  userId        String
  accountName   String
  accountNumber String
  bankName      String
  routingNumber String?
  swiftCode     String?
  isDefault     Boolean  @default(false)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

---

## 7. 🔧 MAINTENANCE & CLEANING (6 моделей)

### Maintenance (Обслуговування)
```prisma
model Maintenance {
  id            String            @id @default(cuid())
  propertyId    String
  userId        String
  type          MaintenanceType
  priority      Priority          @default(MEDIUM)
  status        MaintenanceStatus @default(PENDING)
  title         String
  description   String
  scheduledDate DateTime?
  completedDate DateTime?
  cost          Float?
  notes         String?
  attachments   String[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id])
}

enum MaintenanceType {
  REPAIR
  INSPECTION
  CLEANING
  UPGRADE
  PREVENTIVE
  EMERGENCY
  OTHER
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum MaintenanceStatus {
  PENDING
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  ON_HOLD
}
```

### Cleaning (Прибирання)
```prisma
model Cleaning {
  id            String        @id @default(cuid())
  propertyId    String
  userId        String
  status        CleaningStatus @default(SCHEDULED)
  scheduledDate DateTime
  completedDate DateTime?
  duration      Int?          // in minutes
  notes         String?
  cost          Float?
  checklist     Json?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id])
}

enum CleaningStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  SKIPPED
}
```

---

## 8. 💬 COMMUNICATION (3 моделі)

### Message (Повідомлення)
```prisma
model Message {
  id           String   @id @default(cuid())
  senderId     String
  receiverId   String
  propertyId   String?
  reservationId String?
  subject      String?
  content      String
  type         MessageType @default(TEXT)
  isRead       Boolean  @default(false)
  attachments  String[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  sender     User         @relation("MessageSender", fields: [senderId], references: [id])
  receiver   User         @relation("MessageReceiver", fields: [receiverId], references: [id])
  property   Property?    @relation(fields: [propertyId], references: [id], onDelete: SetNull)
  reservation Reservation? @relation(fields: [reservationId], references: [id], onDelete: SetNull)
}

enum MessageType {
  TEXT
  EMAIL
  SMS
  SYSTEM
  NOTIFICATION
}
```

### Notification (Сповіщення)
```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  data      Json?
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])
}

enum NotificationType {
  RESERVATION
  PAYMENT
  MAINTENANCE
  CLEANING
  MESSAGE
  SYSTEM
  REMINDER
}
```

---

## 9. 🔗 INTEGRATIONS (4 моделі)

### Integration (Інтеграції)
```prisma
model Integration {
  id          String           @id @default(cuid())
  type        IntegrationType
  name        String
  isActive    Boolean          @default(true)
  config      Json
  lastSync    DateTime?
  syncStatus  SyncStatus       @default(INACTIVE)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

enum IntegrationType {
  AIRBNB
  BOOKING_COM
  VRBO
  PRICELAB
  NOMOD
  SENDGRID
  AWS_S3
}

enum SyncStatus {
  INACTIVE
  SYNCING
  SUCCESS
  ERROR
  PAUSED
}
```

### SyncLog (Логи синхронізації)
```prisma
model SyncLog {
  id             String   @id @default(cuid())
  integrationId  String
  type           String
  status         SyncStatus
  message        String?
  data           Json?
  startedAt      DateTime
  completedAt    DateTime?
  createdAt      DateTime @default(now())
}
```

---

## 10. ⚙️ SYSTEM (3 моделі)

### SystemConfig (Конфігурація системи)
```prisma
model SystemConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  type      ConfigType @default(STRING)
  isPublic  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ConfigType {
  STRING
  NUMBER
  BOOLEAN
  JSON
  ARRAY
}
```

### AuditLog (Аудит логи)
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  entity    String
  entityId  String
  oldData   Json?
  newData   Json?
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
}
```

---

## 📊 ПІДСУМОК СУТНОСТЕЙ

### **Загалом: 46 моделей та enum'ів**

#### **Основні групи:**
1. **👥 User Management** (8 моделей) - Користувачі, ролі, сесії
2. **🏠 Property Management** (6 моделей) - Об'єкти, зображення, документи, менеджери
3. **📅 Reservation System** (5 моделей) - Резервації, статуси, корекції
4. **💰 Pricing System** (4 моделі) - Правила цін, історія, доступність
5. **⭐ Amenities & Reviews** (4 моделі) - Зручності, відгуки
6. **💳 Financial System** (4 моделі) - Транзакції, платежі, банківські рахунки
7. **🔧 Maintenance & Cleaning** (6 моделей) - Обслуговування, прибирання
8. **💬 Communication** (3 моделі) - Повідомлення, сповіщення
9. **🔗 Integrations** (4 моделі) - Інтеграції, логи синхронізації
10. **⚙️ System** (3 моделі) - Конфігурація, аудит

### **🎯 КЛЮЧОВІ ОСОБЛИВОСТІ:**
- ✅ **Повна система ролей** (7 ролей користувачів)
- ✅ **Гнучке ціноутворення** (9 типів правил)
- ✅ **Множинні джерела бронювань** (5 платформ)
- ✅ **Детальна фінансова система** (6 типів транзакцій)
- ✅ **Система обслуговування** (7 типів завдань)
- ✅ **Повна комунікація** (5 типів повідомлень)
- ✅ **Інтеграції з зовнішніми сервісами** (7 типів)
- ✅ **Аудит та логування** всіх дій

Ця структура забезпечить **повнофункціональну систему управління нерухомістю** з усіма необхідними можливостями! 🏗️
