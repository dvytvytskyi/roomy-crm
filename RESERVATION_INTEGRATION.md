# 🔗 Reservation Frontend-Backend Integration

## 📋 Overview

Повне підключення між фронтендом та бекендом для сторінки reservations з підтримкою всіх CRUD операцій, фільтрації та аналітики.

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend-services

# Install dependencies
npm install

# Copy environment configuration
cp env.example .env

# Update .env with your configuration
# - DATABASE_URL
# - JWT_SECRET
# - PORT=3001

# Build and start
npm run build
npm start
```

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies (if not already done)
npm install

# Start frontend
npm run dev
```

### 3. Test Connection

```bash
# Run connection test
node test-reservation-connection.js
```

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/roomy_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration

API конфігурація вже налаштована в `lib/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api', // Updated for local development
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

## 📡 API Endpoints

### ✅ **Implemented Endpoints:**

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/api/reservations` | List reservations with filters | ✅ |
| GET | `/api/reservations/:id` | Get reservation by ID | ✅ |
| GET | `/api/reservations/calendar` | Calendar view | ✅ |
| GET | `/api/reservations/stats` | Statistics | ✅ |
| GET | `/api/reservations/sources` | Reservation sources | ✅ |
| GET | `/api/reservations/available-properties` | Available properties | ✅ |
| POST | `/api/reservations` | Create reservation | ✅ |
| PUT | `/api/reservations/:id` | Update reservation | ✅ |
| PUT | `/api/reservations/:id/status` | Update status | ✅ |
| PUT | `/api/reservations/:id/check-in` | Check-in guest | ✅ |
| PUT | `/api/reservations/:id/check-out` | Check-out guest | ✅ |
| PUT | `/api/reservations/:id/no-show` | Mark no-show | ✅ |
| DELETE | `/api/reservations/:id` | Delete reservation | ✅ |

## 🔐 Authentication

### JWT Token Flow

1. **Login** → Get access token
2. **API Requests** → Include `Authorization: Bearer <token>`
3. **Token Refresh** → Automatic refresh on 401
4. **Logout** → Clear tokens

### Role-based Access

| Role | Permissions |
|------|-------------|
| ADMIN | Full access to all operations |
| MANAGER | Full access to all operations |
| AGENT | Full access to all operations |
| OWNER | Read-only access to own properties |

## 🧪 Testing

### Manual Testing

1. **Start Backend:**
   ```bash
   cd backend-services
   npm start
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test API:**
   ```bash
   node test-reservation-connection.js
   ```

### Automated Testing

```bash
# Backend tests
cd backend-services
npm test

# Frontend tests
npm test
```

## 🔄 Data Flow

### 1. Frontend → Backend

```typescript
// Frontend service call
const reservations = await reservationService.getReservations(filters);

// Backend processing
app.get('/api/reservations', authenticate, authorize(['ADMIN', 'MANAGER', 'AGENT']), getReservations);
```

### 2. Backend → Database

```typescript
// Service layer
const result = await reservationService.getReservations(filters);

// Database query with Prisma
const reservations = await prisma.reservation.findMany({
  where: buildWhereClause(filters),
  include: { property: true, guest: true }
});
```

### 3. Response Format

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
    "totalPages": 1
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Access to fetch at 'http://localhost:3001/api/reservations' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
- Check CORS configuration in backend
- Verify FRONTEND_URL in .env
- Ensure both servers are running

#### 2. Authentication Errors
```
401 Unauthorized
```

**Solution:**
- Check JWT token in localStorage
- Verify JWT_SECRET in backend .env
- Test login flow

#### 3. Database Connection
```
Database connection failed
```

**Solution:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Run database migrations

#### 4. Port Conflicts
```
Port 3001 is already in use
```

**Solution:**
- Change PORT in .env
- Kill existing process: `lsof -ti:3001 | xargs kill -9`
- Update API_CONFIG.BASE_URL in frontend

### Debug Mode

Enable debug logging:

```bash
# Backend
NODE_ENV=development npm start

# Frontend
NEXT_PUBLIC_DEBUG=true npm run dev
```

## 📊 Monitoring

### Health Checks

- **Backend:** `GET /health`
- **Frontend:** Check browser console
- **Database:** Connection test in backend

### Logs

- **Backend:** Console output with timestamps
- **Frontend:** Browser DevTools Network tab
- **API:** Request/response logging

## 🚀 Production Deployment

### Backend Deployment

1. **Environment Setup:**
   ```bash
   NODE_ENV=production
   DATABASE_URL=production_database_url
   JWT_SECRET=production_jwt_secret
   ```

2. **Build & Deploy:**
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment

1. **Update API URL:**
   ```typescript
   BASE_URL: 'https://your-backend-domain.com/api'
   ```

2. **Build & Deploy:**
   ```bash
   npm run build
   npm start
   ```

## 📝 Next Steps

1. **Database Setup** - Configure PostgreSQL and run migrations
2. **Authentication** - Implement login/logout flow
3. **Testing** - Add comprehensive test coverage
4. **Monitoring** - Set up logging and error tracking
5. **Performance** - Optimize queries and caching

## 🆘 Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Test with connection script
4. Contact development team

---

**Status:** ✅ Ready for Integration  
**Last Updated:** 2024-01-15  
**Version:** 1.0.0
