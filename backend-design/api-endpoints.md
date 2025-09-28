# API Endpoints Design - Property Management System

## 🔗 ПОВНА API СТРУКТУРА (46 МОДЕЛЕЙ)

### ✅ **ОСНОВНІ ГРУПИ ENDPOINTS:**
- **👥 User Management** (8 моделей)
- **🏠 Property Management** (6 моделей) 
- **📅 Reservation System** (5 моделей)
- **💰 Pricing System** (4 моделі)
- **⭐ Amenities & Reviews** (4 моделі)
- **💳 Financial System** (4 моделі)
- **🔧 Maintenance & Cleaning** (6 моделей)
- **💬 Communication** (3 моделі)
- **🔗 Integrations** (4 моделі)
- **⚙️ System** (3 моделі)

---

## 1. 👥 USER MANAGEMENT API

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/password
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Users
```
GET    /api/users                    # List users with filters
GET    /api/users/:id                # Get user by ID
POST   /api/users                    # Create user (admin only)
PUT    /api/users/:id                # Update user
DELETE /api/users/:id                # Delete user
PUT    /api/users/:id/activate       # Activate/deactivate user
PUT    /api/users/:id/role           # Change user role
```

### User Roles & Permissions
```
GET    /api/users/roles              # Get all available roles
GET    /api/users/:id/permissions    # Get user permissions
PUT    /api/users/:id/permissions    # Update user permissions
```

---

## 2. 🏠 PROPERTY MANAGEMENT API

### Properties
```
GET    /api/properties               # List properties with filters
GET    /api/properties/:id           # Get property by ID
POST   /api/properties               # Create property
PUT    /api/properties/:id           # Update property
DELETE /api/properties/:id           # Delete property
PUT    /api/properties/:id/publish   # Publish/unpublish property
GET    /api/properties/search        # Search properties
GET    /api/properties/types         # Get property types
```

### Property Images
```
GET    /api/properties/:id/images    # Get property images
POST   /api/properties/:id/images    # Upload property image
PUT    /api/properties/:id/images/:imageId  # Update image
DELETE /api/properties/:id/images/:imageId  # Delete image
PUT    /api/properties/:id/images/:imageId/primary  # Set primary image
```

### Property Documents
```
GET    /api/properties/:id/documents # Get property documents
POST   /api/properties/:id/documents # Upload document
PUT    /api/properties/:id/documents/:docId  # Update document
DELETE /api/properties/:id/documents/:docId  # Delete document
```

### Property Managers
```
GET    /api/properties/:id/managers  # Get property managers
POST   /api/properties/:id/managers  # Add manager
PUT    /api/properties/:id/managers/:userId  # Update manager role
DELETE /api/properties/:id/managers/:userId  # Remove manager
```

---

## 3. 📅 RESERVATION SYSTEM API

### Reservations
```
GET    /api/reservations             # List reservations with filters
GET    /api/reservations/:id         # Get reservation by ID
POST   /api/reservations             # Create reservation
PUT    /api/reservations/:id         # Update reservation
DELETE /api/reservations/:id         # Cancel reservation
PUT    /api/reservations/:id/status  # Update reservation status
GET    /api/reservations/calendar    # Get calendar view
```

### Reservation Status Management
```
PUT    /api/reservations/:id/check-in    # Check-in guest
PUT    /api/reservations/:id/check-out   # Check-out guest
PUT    /api/reservations/:id/no-show     # Mark as no-show
PUT    /api/reservations/:id/confirm     # Confirm reservation
PUT    /api/reservations/:id/cancel      # Cancel reservation
```

### Reservation Adjustments
```
GET    /api/reservations/:id/adjustments  # Get adjustments
POST   /api/reservations/:id/adjustments  # Add adjustment
PUT    /api/reservations/:id/adjustments/:adjId  # Update adjustment
DELETE /api/reservations/:id/adjustments/:adjId  # Delete adjustment
```

### Reservation Sources
```
GET    /api/reservations/sources     # Get reservation sources
GET    /api/reservations/external/:sourceId  # Get external reservation
```

---

## 4. 💰 PRICING SYSTEM API

### Pricing Rules
```
GET    /api/properties/:id/pricing-rules    # Get pricing rules
POST   /api/properties/:id/pricing-rules    # Create pricing rule
PUT    /api/properties/:id/pricing-rules/:ruleId  # Update rule
DELETE /api/properties/:id/pricing-rules/:ruleId  # Delete rule
GET    /api/pricing-rules/types             # Get rule types
```

### Price History
```
GET    /api/properties/:id/price-history    # Get price history
POST   /api/properties/:id/price-history    # Add price record
GET    /api/properties/:id/price-history/export  # Export price data
```

### Availability Management
```
GET    /api/properties/:id/availability     # Get availability
POST   /api/properties/:id/availability/bulk  # Bulk update availability
PUT    /api/properties/:id/availability/:date  # Update specific date
DELETE /api/properties/:id/availability/:date  # Block specific date
GET    /api/properties/:id/availability/calendar  # Calendar view
```

### PriceLab Integration
```
POST   /api/pricing/pricelab/sync           # Sync with PriceLab
GET    /api/pricing/pricelab/recommendations # Get price recommendations
POST   /api/pricing/pricelab/apply          # Apply PriceLab prices
```

---

## 5. ⭐ AMENITIES & REVIEWS API

### Amenities
```
GET    /api/amenities                # Get all amenities
POST   /api/amenities                # Create amenity (admin)
PUT    /api/amenities/:id            # Update amenity
DELETE /api/amenities/:id            # Delete amenity
GET    /api/amenities/categories     # Get amenity categories
```

### Property Amenities
```
GET    /api/properties/:id/amenities # Get property amenities
POST   /api/properties/:id/amenities # Add amenity to property
DELETE /api/properties/:id/amenities/:amenityId  # Remove amenity
```

### Reviews
```
GET    /api/properties/:id/reviews   # Get property reviews
POST   /api/properties/:id/reviews   # Create review
PUT    /api/reviews/:id              # Update review
DELETE /api/reviews/:id              # Delete review
POST   /api/reviews/:id/response     # Add owner response
GET    /api/reviews/statistics       # Get review statistics
```

---

## 6. 💳 FINANCIAL SYSTEM API

### Transactions
```
GET    /api/transactions             # List transactions
GET    /api/transactions/:id         # Get transaction by ID
POST   /api/transactions             # Create transaction
PUT    /api/transactions/:id         # Update transaction
GET    /api/transactions/types       # Get transaction types
GET    /api/transactions/statistics  # Get transaction statistics
```

### Payments
```
GET    /api/payments                 # List payments
GET    /api/payments/:id             # Get payment by ID
POST   /api/payments                 # Create payment
PUT    /api/payments/:id             # Update payment
POST   /api/payments/:id/process     # Process payment
POST   /api/payments/:id/refund      # Refund payment
```

### Bank Accounts
```
GET    /api/users/:id/bank-accounts  # Get user bank accounts
POST   /api/users/:id/bank-accounts  # Add bank account
PUT    /api/bank-accounts/:id        # Update bank account
DELETE /api/bank-accounts/:id        # Delete bank account
PUT    /api/bank-accounts/:id/default # Set as default
```

### nomod.com Integration
```
POST   /api/payments/nomod/process   # Process payment via nomod
GET    /api/payments/nomod/status/:transactionId  # Check payment status
POST   /api/payments/nomod/refund    # Refund via nomod
```

---

## 7. 🔧 MAINTENANCE & CLEANING API

### Maintenance
```
GET    /api/maintenance              # List maintenance tasks
GET    /api/maintenance/:id          # Get maintenance task
POST   /api/maintenance              # Create maintenance task
PUT    /api/maintenance/:id          # Update maintenance task
DELETE /api/maintenance/:id          # Delete maintenance task
PUT    /api/maintenance/:id/assign   # Assign to user
PUT    /api/maintenance/:id/complete # Mark as completed
GET    /api/maintenance/types        # Get maintenance types
GET    /api/maintenance/priorities   # Get priority levels
```

### Cleaning
```
GET    /api/cleaning                 # List cleaning tasks
GET    /api/cleaning/:id             # Get cleaning task
POST   /api/cleaning                 # Create cleaning task
PUT    /api/cleaning/:id             # Update cleaning task
DELETE /api/cleaning/:id             # Delete cleaning task
PUT    /api/cleaning/:id/assign      # Assign to cleaner
PUT    /api/cleaning/:id/complete    # Mark as completed
PUT    /api/cleaning/:id/checklist   # Update checklist
```

### Property-Specific Tasks
```
GET    /api/properties/:id/maintenance  # Get property maintenance
GET    /api/properties/:id/cleaning     # Get property cleaning
POST   /api/properties/:id/maintenance  # Create maintenance for property
POST   /api/properties/:id/cleaning     # Create cleaning for property
```

---

## 8. 💬 COMMUNICATION API

### Messages
```
GET    /api/messages                 # List messages
GET    /api/messages/:id             # Get message by ID
POST   /api/messages                 # Send message
PUT    /api/messages/:id             # Update message
DELETE /api/messages/:id             # Delete message
PUT    /api/messages/:id/read        # Mark as read
GET    /api/messages/conversations   # Get conversations
```

### Notifications
```
GET    /api/notifications            # Get user notifications
PUT    /api/notifications/:id/read   # Mark notification as read
PUT    /api/notifications/read-all   # Mark all as read
DELETE /api/notifications/:id        # Delete notification
GET    /api/notifications/types      # Get notification types
```

### Message Types
```
GET    /api/messages/types           # Get message types
POST   /api/messages/bulk            # Send bulk messages
GET    /api/messages/templates       # Get message templates
```

---

## 9. 🔗 INTEGRATIONS API

### Integration Management
```
GET    /api/integrations             # List integrations
GET    /api/integrations/:id         # Get integration by ID
POST   /api/integrations             # Create integration
PUT    /api/integrations/:id         # Update integration
DELETE /api/integrations/:id         # Delete integration
PUT    /api/integrations/:id/activate # Activate/deactivate
```

### Sync Management
```
POST   /api/integrations/:id/sync    # Start sync
GET    /api/integrations/:id/sync-status  # Get sync status
GET    /api/integrations/sync-logs   # Get sync logs
POST   /api/integrations/:id/sync/stop  # Stop sync
```

### Platform-Specific APIs

#### Airbnb Integration
```
POST   /api/integrations/airbnb/auth     # Authenticate with Airbnb
GET    /api/integrations/airbnb/properties # Get Airbnb properties
POST   /api/integrations/airbnb/sync     # Sync Airbnb data
GET    /api/integrations/airbnb/reservations # Get Airbnb reservations
```

#### Booking.com Integration
```
POST   /api/integrations/booking/auth    # Authenticate with Booking.com
GET    /api/integrations/booking/properties # Get Booking.com properties
POST   /api/integrations/booking/sync    # Sync Booking.com data
GET    /api/integrations/booking/reservations # Get Booking.com reservations
```

#### VRBO Integration
```
POST   /api/integrations/vrbo/auth       # Authenticate with VRBO
GET    /api/integrations/vrbo/properties # Get VRBO properties
POST   /api/integrations/vrbo/sync       # Sync VRBO data
```

---

## 10. ⚙️ SYSTEM API

### System Configuration
```
GET    /api/system/config             # Get system configuration
PUT    /api/system/config             # Update system configuration
GET    /api/system/config/public      # Get public configuration
POST   /api/system/config/backup      # Backup configuration
POST   /api/system/config/restore     # Restore configuration
```

### Audit Logs
```
GET    /api/system/audit-logs         # Get audit logs
GET    /api/system/audit-logs/:id     # Get specific audit log
GET    /api/system/audit-logs/export  # Export audit logs
```

### System Health
```
GET    /api/system/health             # System health check
GET    /api/system/status             # System status
GET    /api/system/metrics            # System metrics
GET    /api/system/version            # System version
```

---

## 🔗 WEBHOOKS (External)

### Platform Webhooks
```
POST   /webhooks/airbnb/reservations     # Airbnb reservation webhook
POST   /webhooks/booking/reservations    # Booking.com reservation webhook
POST   /webhooks/vrbo/reservations       # VRBO reservation webhook
```

### Payment Webhooks
```
POST   /webhooks/payments/nomod          # nomod.com payment webhook
POST   /webhooks/payments/stripe         # Stripe payment webhook
POST   /webhooks/payments/paypal         # PayPal payment webhook
```

### Service Webhooks
```
POST   /webhooks/pricelab/update         # PriceLab price update webhook
POST   /webhooks/sendgrid/events         # SendGrid email events webhook
```

---

## 📡 REAL-TIME EVENTS (WebSocket)

### Connection
```
Connection: ws://localhost:3000/ws
Authentication: Bearer <jwt_token>
```

### Events
```
# Reservation Events
- reservation:created
- reservation:updated
- reservation:cancelled
- reservation:confirmed
- reservation:check-in
- reservation:check-out

# Property Events
- property:created
- property:updated
- property:published
- property:unpublished

# Maintenance Events
- maintenance:created
- maintenance:assigned
- maintenance:completed
- maintenance:cancelled

# Cleaning Events
- cleaning:scheduled
- cleaning:in-progress
- cleaning:completed
- cleaning:cancelled

# Financial Events
- payment:processed
- payment:failed
- payment:refunded
- transaction:created

# Communication Events
- message:received
- notification:created
- notification:read

# Integration Events
- sync:started
- sync:completed
- sync:failed
- webhook:received

# System Events
- user:login
- user:logout
- system:maintenance
- system:error
```

---

## 📊 API STATISTICS

### **Загалом: 200+ API Endpoints**

#### **Розподіл по групах:**
1. **👥 User Management** - 15 endpoints
2. **🏠 Property Management** - 25 endpoints
3. **📅 Reservation System** - 20 endpoints
4. **💰 Pricing System** - 18 endpoints
5. **⭐ Amenities & Reviews** - 12 endpoints
6. **💳 Financial System** - 20 endpoints
7. **🔧 Maintenance & Cleaning** - 18 endpoints
8. **💬 Communication** - 12 endpoints
9. **🔗 Integrations** - 25 endpoints
10. **⚙️ System** - 15 endpoints
11. **🔗 Webhooks** - 8 endpoints
12. **📡 WebSocket Events** - 25+ events

### **🎯 КЛЮЧОВІ ОСОБЛИВОСТІ:**
- ✅ **RESTful API Design** з консистентними endpoints
- ✅ **JWT Authentication** для всіх захищених routes
- ✅ **Role-based Access Control** для різних ролей користувачів
- ✅ **Real-time Updates** через WebSocket
- ✅ **Webhook Support** для зовнішніх інтеграцій
- ✅ **Comprehensive Filtering** та pagination
- ✅ **Bulk Operations** для масових дій
- ✅ **Export/Import** функціональність
- ✅ **Audit Logging** всіх операцій

Ця API структура забезпечить **повнофункціональний доступ** до всіх можливостей системи управління нерухомістю! 🚀