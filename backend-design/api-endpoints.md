# API Endpoints Design

## Authentication & Users
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile

GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

## Properties
```
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id

GET    /api/properties/:id/images
POST   /api/properties/:id/images
DELETE /api/properties/:id/images/:imageId

GET    /api/properties/:id/pricing-rules
POST   /api/properties/:id/pricing-rules
PUT    /api/properties/:id/pricing-rules/:ruleId
DELETE /api/properties/:id/pricing-rules/:ruleId
```

## Reservations
```
GET    /api/reservations
GET    /api/reservations/:id
POST   /api/reservations
PUT    /api/reservations/:id
DELETE /api/reservations/:id

GET    /api/reservations/:id/payments
POST   /api/reservations/:id/payments

PUT    /api/reservations/:id/check-in
PUT    /api/reservations/:id/check-out
PUT    /api/reservations/:id/cancel
```

## Availability & Calendar
```
GET    /api/properties/:id/availability
POST   /api/properties/:id/availability/bulk
PUT    /api/properties/:id/availability/:date

GET    /api/calendar/:propertyId
GET    /api/calendar/sync/:propertyId
```

## Integrations
```
GET    /api/integrations/accounts
POST   /api/integrations/accounts
PUT    /api/integrations/accounts/:id
DELETE /api/integrations/accounts/:id

POST   /api/integrations/sync/:accountId
GET    /api/integrations/sync-logs

# Airbnb Integration
POST   /api/integrations/airbnb/auth
GET    /api/integrations/airbnb/properties
POST   /api/integrations/airbnb/sync

# Booking.com Integration  
POST   /api/integrations/booking/auth
GET    /api/integrations/booking/properties
POST   /api/integrations/booking/sync
```

## Maintenance & Cleaning
```
GET    /api/maintenance/tasks
POST   /api/maintenance/tasks
PUT    /api/maintenance/tasks/:id
DELETE /api/maintenance/tasks/:id

GET    /api/cleaning/tasks
POST   /api/cleaning/tasks
PUT    /api/cleaning/tasks/:id
```

## Financial & Reports
```
GET    /api/financial/transactions
GET    /api/financial/revenue
GET    /api/financial/owner-payouts

GET    /api/reports/occupancy
GET    /api/reports/revenue
GET    /api/reports/maintenance
```

## Webhooks (External)
```
POST   /webhooks/airbnb/reservations
POST   /webhooks/booking/reservations
POST   /webhooks/payments/stripe
POST   /webhooks/payments/paypal
```

## Real-time Events (WebSocket)
```
Connection: ws://localhost:3000/ws

Events:
- reservation:created
- reservation:updated
- reservation:cancelled
- maintenance:assigned
- cleaning:completed
- sync:started
- sync:completed
- sync:failed
```
