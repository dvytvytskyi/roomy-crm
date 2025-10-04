# Production Architecture - Roomy CRM

## Overview

This document describes the production-ready architecture implemented for Roomy CRM, designed to eliminate hardcoded data and localhost dependencies while providing a scalable, maintainable system.

## Architecture Principles

### 1. Unified User System
- **Single User Table**: All actors in the system (owners, guests, agents, cleaners, etc.) are stored in one `User` table with role-based access
- **Role-Based Access Control**: Uses enum roles (ADMIN, MANAGER, AGENT, OWNER, GUEST, CLEANER, MAINTENANCE_STAFF)
- **Centralized Authentication**: One authentication system for all user types

### 2. Core Entity Relationships
- **Property ↔ Location**: Properties reference location entities for consistent data
- **Reservation as Core**: All business logic revolves around reservations
- **Unified Task System**: Single task table handles all operational activities
- **Immutable Transactions**: Financial records cannot be modified, only new compensating transactions

### 3. Production-Ready Features
- **No Hardcoded Data**: All data comes from database or environment variables
- **Proper Error Handling**: Comprehensive error handling with logging
- **Rate Limiting**: Protection against abuse and DDoS
- **Security Headers**: Helmet.js for security
- **Audit Logging**: Track all changes for compliance
- **Pagination**: Efficient data loading for large datasets

## Database Schema

### Core Tables

#### 1. User Table
```sql
- id (String, Primary Key)
- email (String, Unique)
- phone (String, Optional)
- firstName (String)
- lastName (String)
- passwordHash (String)
- role (Enum: ADMIN, MANAGER, AGENT, OWNER, GUEST, CLEANER, MAINTENANCE_STAFF)
- status (Enum: ACTIVE, INACTIVE, SUSPENDED, VIP)
- avatar (String, Optional)
- country (String, Optional)
- flag (String, Optional)
- isVerified (Boolean)
- lastLoginAt (DateTime, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### 2. Location Table
```sql
- id (String, Primary Key)
- name (String, Unique)
- city (String)
- country (String)
- region (String, Optional)
- coordinates (JSON, Optional)
- isActive (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### 3. Property Table
```sql
- id (String, Primary Key)
- name (String)
- nickname (String, Optional, Unique)
- title (String, Optional)
- status (Enum: ACTIVE, INACTIVE, MAINTENANCE, SUSPENDED)
- type (Enum: APARTMENT, VILLA, STUDIO, PENTHOUSE, HOUSE, CONDO)
- address (String)
- locationId (String, Foreign Key)
- ownerId (String, Optional, Foreign Key)
- agentId (String, Optional, Foreign Key)
- capacity (Integer)
- bedrooms (Integer)
- bathrooms (Float)
- area (Float, Optional)
- pricePerNight (Float)
- description (String, Optional)
- pricelabId (String, Optional)
- airbnbId (String, Optional)
- bookingId (String, Optional)
- primaryImage (String, Optional)
- tags (String[])
- amenities (String[])
- houseRules (String[])
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### 4. Reservation Table
```sql
- id (String, Primary Key)
- propertyId (String, Foreign Key)
- guestId (String, Foreign Key)
- agentId (String, Optional, Foreign Key)
- checkInDate (DateTime)
- checkOutDate (DateTime)
- guests (Integer)
- status (Enum: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW)
- paymentStatus (Enum: PENDING, PAID, PARTIAL, OVERDUE, REFUNDED)
- totalAmount (Float)
- paidAmount (Float)
- outstandingBalance (Float)
- guestName (String)
- guestEmail (String)
- guestPhone (String, Optional)
- source (String)
- sourceId (String, Optional)
- specialRequests (String, Optional)
- notes (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### 5. Task Table
```sql
- id (String, Primary Key)
- propertyId (String, Foreign Key)
- reservationId (String, Optional, Foreign Key)
- assigneeId (String, Optional, Foreign Key)
- type (Enum: CLEANING, MAINTENANCE, INSPECTION, DELIVERY, GUEST_MEETING, CHECK_IN, CHECK_OUT, PHOTOGRAPHY, MARKETING)
- title (String)
- description (String, Optional)
- status (Enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD)
- priority (Enum: LOW, MEDIUM, HIGH, URGENT)
- scheduledDate (DateTime, Optional)
- completedDate (DateTime, Optional)
- dueDate (DateTime, Optional)
- cost (Float, Optional)
- estimatedCost (Float, Optional)
- tags (String[])
- notes (String, Optional)
- attachments (String[])
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### 6. Transaction Table
```sql
- id (String, Primary Key)
- userId (String, Foreign Key)
- propertyId (String, Optional, Foreign Key)
- reservationId (String, Optional, Foreign Key)
- taskId (String, Optional, Foreign Key)
- type (Enum: GUEST_PAYMENT, OWNER_PAYOUT, REFUND, TASK_COST, AGENCY_FEE, PLATFORM_FEE, MAINTENANCE_COST, CLEANING_COST, MARKETING_COST)
- category (String)
- amount (Float)
- currency (String)
- description (String, Optional)
- paymentMethod (String, Optional)
- paymentGatewayId (String, Optional)
- gatewayReference (String, Optional)
- platformFee (Float, Optional)
- transactionFee (Float, Optional)
- netAmount (Float)
- status (Enum: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED)
- processedAt (DateTime, Optional)
- metadata (JSON, Optional)
- notes (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

## API Architecture

### Production Server (`production-server.js`)
- **Express.js** with TypeScript support
- **Prisma ORM** for database operations
- **JWT Authentication** with role-based access
- **Rate Limiting** with express-rate-limit
- **Security Headers** with Helmet.js
- **Error Handling** with custom middleware
- **Audit Logging** for all operations
- **Graceful Shutdown** handling

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Production API (`/api/production/`)
- `GET /api/production/health` - Health check
- `GET /api/production/users` - List users (paginated)
- `GET /api/production/users/:id` - Get user by ID
- `POST /api/production/users` - Create user
- `PUT /api/production/users/:id` - Update user
- `DELETE /api/production/users/:id` - Delete user
- `GET /api/production/properties` - List properties (paginated)
- `GET /api/production/properties/:id` - Get property by ID
- `POST /api/production/properties` - Create property
- `PUT /api/production/properties/:id` - Update property
- `DELETE /api/production/properties/:id` - Delete property
- `GET /api/production/locations` - List locations
- `GET /api/production/locations/:id` - Get location by ID
- `POST /api/production/locations` - Create location
- `GET /api/production/financial/summary` - Financial summary
- `GET /api/production/financial/income-distribution` - Income distribution

## Frontend Architecture

### Production Hooks (`useProductionApi.ts`)
- **Generic API Hook**: `useProductionApi<T>()`
- **Specialized Hooks**: `useUsers()`, `useProperties()`, `useReservations()`, etc.
- **Mutation Hooks**: `useCreateUser()`, `useUpdateProperty()`, etc.
- **Error Handling**: Consistent error handling across all hooks
- **Loading States**: Proper loading state management
- **Caching**: Built-in caching for better performance

### Production Components
- **ProductionPropertyOverview**: Property details with real API data
- **Production Properties Page**: Property listing with search and filters
- **Production Property Details**: Full property management interface

### Production Service (`productionService.ts`)
- **TypeScript Interface**: Strongly typed API responses
- **Error Handling**: Comprehensive error handling
- **Pagination Support**: Built-in pagination parameters
- **Filter Support**: Flexible filtering options
- **Response Standardization**: Consistent response format

## Environment Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/roomy_db"

# JWT
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret"

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
S3_BUCKET="your-bucket"
S3_REGION="your-region"
```

## Deployment

### Docker Support
- **Dockerfile**: Multi-stage build for production
- **docker-compose.yml**: Full stack with PostgreSQL, Redis, Nginx
- **Nginx Configuration**: SSL termination and load balancing
- **SSL Certificates**: Self-signed for development, Let's Encrypt for production

### Production Setup
1. **Database Migration**: `npx prisma migrate deploy`
2. **Data Migration**: `node scripts/migrate-data.js`
3. **SSL Setup**: `node scripts/generate-ssl.js`
4. **Docker Deployment**: `docker-compose up --build -d`

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Granular permissions system
- **Password Hashing**: bcrypt with configurable rounds
- **Session Management**: Secure session handling

### API Security
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Comprehensive input validation
- **SQL Injection Protection**: Prisma ORM protection

### Data Security
- **Audit Logging**: Track all data changes
- **Immutable Transactions**: Financial data integrity
- **Encrypted Sensitive Data**: Environment variables for secrets
- **Backup Strategy**: Regular database backups

## Performance Optimizations

### Database
- **Indexes**: Optimized indexes for common queries
- **Pagination**: Efficient data loading
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient Prisma queries

### API
- **Compression**: Gzip compression for responses
- **Caching**: Redis caching for frequently accessed data
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **Error Handling**: Graceful error handling

### Frontend
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized image loading
- **Caching**: Browser and CDN caching
- **Bundle Optimization**: Minimized bundle sizes

## Monitoring & Logging

### Logging
- **Winston Logger**: Structured logging with daily rotation
- **Log Levels**: Configurable log levels
- **Error Tracking**: Comprehensive error logging
- **Audit Trail**: Complete audit trail for compliance

### Health Checks
- **Database Health**: Connection status monitoring
- **API Health**: Endpoint health monitoring
- **Service Health**: Overall service health
- **Metrics**: Performance metrics collection

## Migration Strategy

### From Development to Production
1. **Schema Migration**: Deploy Prisma schema to production database
2. **Data Migration**: Migrate existing JSON data to PostgreSQL
3. **Environment Setup**: Configure production environment variables
4. **SSL Configuration**: Set up SSL certificates
5. **DNS Configuration**: Point domain to production server
6. **Monitoring Setup**: Configure logging and monitoring
7. **Backup Strategy**: Implement backup and recovery procedures

### Data Migration
- **JSON to PostgreSQL**: Automated migration script
- **Data Validation**: Ensure data integrity
- **Rollback Strategy**: Ability to rollback if needed
- **Testing**: Comprehensive testing of migrated data

## Best Practices

### Code Quality
- **TypeScript**: Strong typing for better code quality
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Testing**: Unit and integration tests

### Database
- **Normalization**: Proper database normalization
- **Constraints**: Database constraints for data integrity
- **Indexes**: Optimized indexes for performance
- **Backups**: Regular backup procedures

### API Design
- **RESTful**: RESTful API design principles
- **Consistent Responses**: Standardized response format
- **Error Handling**: Comprehensive error handling
- **Documentation**: API documentation with examples

### Security
- **Least Privilege**: Minimum required permissions
- **Input Validation**: Validate all inputs
- **Output Encoding**: Prevent XSS attacks
- **Regular Updates**: Keep dependencies updated

## Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL configuration
2. **JWT Issues**: Verify JWT_SECRET configuration
3. **CORS Errors**: Check CORS_ORIGIN configuration
4. **Rate Limiting**: Adjust rate limit settings if needed
5. **SSL Issues**: Verify SSL certificate configuration

### Debug Mode
- Set `NODE_ENV=development` for detailed error messages
- Enable debug logging with `LOG_LEVEL=debug`
- Use Prisma Studio for database inspection
- Check application logs for detailed error information

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket support for real-time data
- **Advanced Analytics**: Enhanced analytics and reporting
- **Mobile App**: React Native mobile application
- **API Versioning**: API versioning for backward compatibility
- **Microservices**: Split into microservices architecture
- **Event Sourcing**: Event sourcing for audit trail
- **CQRS**: Command Query Responsibility Segregation
- **GraphQL**: GraphQL API for flexible data querying

### Scalability
- **Horizontal Scaling**: Load balancer configuration
- **Database Sharding**: Database sharding for large datasets
- **CDN Integration**: Content delivery network for static assets
- **Caching Strategy**: Advanced caching strategies
- **Queue System**: Background job processing
- **Monitoring**: Advanced monitoring and alerting

This production architecture provides a solid foundation for scaling Roomy CRM while maintaining security, performance, and maintainability.
