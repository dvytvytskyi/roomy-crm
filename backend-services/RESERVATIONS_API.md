# 🏨 Reservations API Documentation

## 📋 Overview

Повнофункціональний API для управління резерваціями в системі управління нерухомістю. Підтримує всі CRUD операції, фільтрацію, статистику та календарний вигляд.

## 🚀 Features

- ✅ **CRUD Operations** - Створення, читання, оновлення та видалення резервацій
- ✅ **Advanced Filtering** - Фільтрація за датами, статусом, джерелом, сумою
- ✅ **Status Management** - Управління статусами резервацій та гостей
- ✅ **Calendar View** - Календарний вигляд резервацій
- ✅ **Statistics** - Детальна статистика резервацій
- ✅ **Availability Check** - Перевірка доступності нерухомості
- ✅ **Audit Logging** - Логування всіх операцій
- ✅ **Role-based Access** - Контроль доступу на основі ролей

## 📡 API Endpoints

### 🔍 **GET Operations**

#### Get All Reservations
```http
GET /api/reservations
```

**Query Parameters:**
- `page` - Номер сторінки (default: 1)
- `limit` - Кількість записів на сторінку (default: 50, max: 100)
- `status` - Фільтр за статусом (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW, MODIFIED)
- `source` - Фільтр за джерелом (DIRECT, AIRBNB, BOOKING_COM, VRBO, OTHER)
- `property` - Фільтр за ID нерухомості
- `checkInFrom` - Дата заїзду від (ISO 8601)
- `checkInTo` - Дата заїзду до (ISO 8601)
- `minAmount` - Мінімальна сума
- `maxAmount` - Максимальна сума
- `guestName` - Пошук за ім'ям гостя

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "res_123",
      "propertyId": "prop_456",
      "propertyName": "Luxury Apartment",
      "guestName": "John Smith",
      "checkIn": "2024-02-01T00:00:00.000Z",
      "checkOut": "2024-02-05T00:00:00.000Z",
      "status": "CONFIRMED",
      "totalAmount": 1200,
      "nights": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Get Reservation by ID
```http
GET /api/reservations/:id
```

#### Get Reservation Calendar
```http
GET /api/reservations/calendar?propertyId=prop_123&startDate=2024-02-01&endDate=2024-02-28
```

#### Get Reservation Statistics
```http
GET /api/reservations/stats?propertyId=prop_123&startDate=2024-01-01&endDate=2024-12-31
```

#### Get Reservation Sources
```http
GET /api/reservations/sources
```

#### Get Available Properties
```http
GET /api/reservations/available-properties?startDate=2024-02-01&endDate=2024-02-05&guests=2
```

### ✏️ **POST Operations**

#### Create New Reservation
```http
POST /api/reservations
```

**Request Body:**
```json
{
  "propertyId": "prop_123",
  "guestId": "guest_456",
  "checkIn": "2024-02-01T00:00:00.000Z",
  "checkOut": "2024-02-05T00:00:00.000Z",
  "guestCount": 2,
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "guestStatus": "UPCOMING",
  "specialRequests": "Late check-in requested",
  "source": "DIRECT"
}
```

### 🔄 **PUT Operations**

#### Update Reservation
```http
PUT /api/reservations/:id
```

#### Update Reservation Status
```http
PUT /api/reservations/:id/status
```

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "paymentStatus": "PARTIALLY_PAID",
  "guestStatus": "UPCOMING"
}
```

#### Check-in Guest
```http
PUT /api/reservations/:id/check-in
```

#### Check-out Guest
```http
PUT /api/reservations/:id/check-out
```

#### Mark as No-show
```http
PUT /api/reservations/:id/no-show
```

### 🗑️ **DELETE Operations**

#### Delete/Cancel Reservation
```http
DELETE /api/reservations/:id
```

## 🔐 Authentication & Authorization

### Required Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Role-based Access Control

| Endpoint | ADMIN | MANAGER | AGENT | OWNER |
|----------|-------|---------|-------|-------|
| GET /reservations | ✅ | ✅ | ✅ | ❌ |
| GET /reservations/:id | ✅ | ✅ | ✅ | ✅* |
| POST /reservations | ✅ | ✅ | ✅ | ❌ |
| PUT /reservations/:id | ✅ | ✅ | ✅ | ❌ |
| DELETE /reservations/:id | ✅ | ✅ | ✅ | ❌ |

*OWNER може переглядати тільки резервації своїх об'єктів нерухомості

## 📊 Data Models

### Reservation Status
- `PENDING` - Очікує підтвердження
- `CONFIRMED` - Підтверджена
- `CANCELLED` - Скасована
- `COMPLETED` - Завершена
- `NO_SHOW` - Гість не прийшов
- `MODIFIED` - Модифікована

### Payment Status
- `UNPAID` - Не оплачена
- `PARTIALLY_PAID` - Частково оплачена
- `FULLY_PAID` - Повністю оплачена
- `REFUNDED` - Повернена
- `PENDING_REFUND` - Очікує повернення

### Guest Status
- `UPCOMING` - Майбутня
- `CHECKED_IN` - Заселена
- `CHECKED_OUT` - Виселена
- `NO_SHOW` - Не прийшов
- `CANCELLED` - Скасована

### Reservation Source
- `DIRECT` - Пряма бронь
- `AIRBNB` - Airbnb
- `BOOKING_COM` - Booking.com
- `VRBO` - VRBO
- `OTHER` - Інше

## 🧪 Testing

### Run Tests
```bash
# Install dependencies
npm install

# Start the server
npm start

# Run tests (in another terminal)
node test-reservations.js
```

### Test Coverage
- ✅ GET operations (list, by ID, calendar, stats, sources, available properties)
- ✅ POST operations (create reservation)
- ✅ PUT operations (update, status, check-in/out, no-show)
- ✅ DELETE operations (cancel reservation)
- ✅ Validation and error handling
- ✅ Authentication and authorization

## 🔧 Configuration

### Environment Variables
```env
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:password@localhost:5432/database
NODE_ENV=development
PORT=3000
```

### Database Schema
API використовує Prisma ORM з PostgreSQL. Основні таблиці:
- `reservations` - Резервації
- `properties` - Нерухомість
- `users` - Користувачі
- `reservation_adjustments` - Коригування резервацій
- `transactions` - Транзакції
- `availability` - Доступність

## 📝 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "checkIn",
      "message": "Check-in date is required"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Reservation not found"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "Property is not available for the selected dates"
}
```

## 🚀 Deployment

### Production Setup
1. Налаштуйте змінні середовища
2. Запустіть міграції бази даних
3. Запустіть сервер: `npm start`
4. Налаштуйте reverse proxy (nginx)
5. Налаштуйте SSL сертифікат

### Health Check
```http
GET /health
```

## 📞 Support

Для підтримки або питань звертайтеся до команди розробки.

---

**Версія API:** 1.0.0  
**Останнє оновлення:** 2024-01-15
