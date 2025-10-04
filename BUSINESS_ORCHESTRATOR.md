# Business Process Orchestrator - Roomy CRM

## Overview

The Business Process Orchestrator is the heart of Roomy CRM, managing complex workflows that involve multiple entities and services. It implements the Saga pattern for distributed transactions and ensures data consistency across the entire system.

## Architecture

### Core Components

1. **SagaOrchestrator** - Manages distributed transactions with compensation
2. **ReservationService** - Handles reservation lifecycle workflows
3. **FinancialService** - Manages financial calculations and transactions
4. **NotificationService** - Automated communication system
5. **TaskOrchestrator** - Automatic task creation and management

### Saga Pattern Implementation

The system uses the Saga pattern to manage complex business processes that span multiple services and entities. Each saga consists of:

- **Steps**: Individual operations that must succeed
- **Compensations**: Rollback actions if a step fails
- **Status Tracking**: Monitor saga execution state
- **Error Handling**: Graceful failure recovery

## Business Processes

### 1. Reservation Confirmation Workflow

**Trigger**: `POST /api/production/reservations/:id/confirm`

**Saga Steps**:
1. **validateReservation** - Check reservation status and property availability
2. **updateReservationStatus** - Set status to CONFIRMED
3. **createCleaningTask** - Schedule pre-arrival cleaning
4. **createCheckInTask** - Schedule guest check-in meeting
5. **createCheckOutTask** - Schedule guest check-out meeting
6. **createPostCleaningTask** - Schedule post-departure cleaning
7. **createFinancialTransaction** - Create payment transaction
8. **sendConfirmationNotification** - Notify guest and stakeholders

**Compensation Actions**:
- Revert reservation status to PENDING
- Delete created tasks
- Cancel financial transactions
- Send cancellation notifications

### 2. Check-in Workflow

**Trigger**: `POST /api/production/reservations/:id/check-in`

**Saga Steps**:
1. **validateCheckIn** - Verify reservation is confirmed
2. **updateReservationStatus** - Set status to CHECKED_IN
3. **createCheckOutTask** - Schedule check-out meeting
4. **createPostCheckOutCleaningTask** - Schedule post-departure cleaning
5. **activatePropertyAmenities** - Enable property features
6. **sendWelcomeNotification** - Welcome guest

### 3. Check-out Workflow

**Trigger**: `POST /api/production/reservations/:id/check-out`

**Saga Steps**:
1. **validateCheckOut** - Verify guest has checked in
2. **updateReservationStatus** - Set status to CHECKED_OUT
3. **createPostDepartureCleaningTask** - Schedule cleaning
4. **deactivatePropertyAmenities** - Disable property features
5. **generateCheckOutReport** - Create departure summary
6. **sendThankYouNotification** - Thank guest

### 4. Cancellation Workflow

**Trigger**: `POST /api/production/reservations/:id/cancel`

**Saga Steps**:
1. **validateCancellation** - Check cancellation eligibility
2. **cancelRelatedTasks** - Cancel all pending tasks
3. **calculateRefundAmount** - Determine refund based on policy
4. **createRefundTransaction** - Process refund if applicable
5. **updateReservationStatus** - Set status to CANCELLED
6. **sendCancellationNotification** - Notify stakeholders

### 5. Payment Processing Workflow

**Trigger**: `POST /api/production/reservations/:id/payment`

**Saga Steps**:
1. **validatePayment** - Verify payment details
2. **createGuestPaymentTransaction** - Record guest payment
3. **updateReservationPaymentStatus** - Update payment status
4. **calculateIncomeDistribution** - Determine payout amounts
5. **createOwnerPayoutTransaction** - Schedule owner payout
6. **createAgencyFeeTransaction** - Record platform commission
7. **sendPaymentConfirmation** - Notify guest
8. **sendPayoutNotification** - Notify owner

## Financial Calculations

### Income Distribution

The system automatically calculates income distribution based on configurable settings:

```javascript
// Default distribution
{
  ownerIncome: 70,      // 70% to property owner
  roomyAgencyFee: 25,   // 25% to Roomy platform
  referringAgent: 5     // 5% to referring agent
}
```

### Refund Calculation

Refund amounts are calculated based on cancellation policy:

- **7+ days before check-in**: 100% refund
- **3-6 days before check-in**: 50% refund
- **1-2 days before check-in**: 25% refund
- **Day of check-in or later**: 0% refund

### Payment Processing

1. **Guest Payment**: Record guest payment transaction
2. **Owner Payout**: Calculate and schedule owner payout
3. **Agency Fee**: Record platform commission
4. **Transaction Fees**: Handle payment gateway fees

## Task Management

### Automatic Task Creation

Tasks are automatically created based on business events:

#### Reservation Confirmation
- **Pre-arrival Cleaning** - 1 day before check-in
- **Check-in Meeting** - At check-in time
- **Check-out Meeting** - At check-out time
- **Post-departure Cleaning** - 2 hours after check-out

#### Maintenance Tasks
- **Property Inspection** - Monthly/quarterly
- **Scheduled Maintenance** - Based on property needs
- **Emergency Repairs** - As needed

### Task Assignment

Tasks are assigned based on:
- **Role**: CLEANER, AGENT, MAINTENANCE_STAFF
- **Availability**: Check assignee schedule
- **Workload**: Balance task distribution
- **Proximity**: Consider location proximity

### Task Completion

When tasks are completed:
1. **Update Status** - Mark as COMPLETED
2. **Record Completion** - Log completion details
3. **Trigger Next Actions** - Start dependent processes
4. **Send Notifications** - Notify stakeholders

## Notification System

### Automated Notifications

The system sends automated notifications for:

#### Guest Notifications
- **Reservation Confirmed** - Email + SMS
- **Payment Confirmed** - Email + SMS
- **Check-in Reminder** - Email + SMS
- **Check-out Reminder** - Email + SMS
- **Thank You** - Email

#### Owner Notifications
- **Payout Processed** - Email
- **Property Inspection** - Email
- **Maintenance Required** - Email
- **New Reservation** - Email

#### Staff Notifications
- **Task Assigned** - Email
- **Task Completed** - Email
- **Maintenance Alert** - Email
- **System Alert** - Email

### Notification Templates

Templates support variable substitution:

```javascript
{
  subject: 'Reservation Confirmed - {propertyName}',
  message: 'Dear {guestName}, your reservation for {propertyName} is confirmed for {checkInDate}.'
}
```

## API Endpoints

### Business Process Endpoints

```bash
# Reservation Management
POST /api/production/reservations/:id/confirm
POST /api/production/reservations/:id/check-in
POST /api/production/reservations/:id/check-out
POST /api/production/reservations/:id/cancel

# Payment Processing
POST /api/production/reservations/:id/payment
POST /api/production/transactions/:id/payout

# Task Management
POST /api/production/tasks/:id/complete
GET /api/production/tasks/statistics

# Financial Management
GET /api/production/financial/summary
GET /api/production/financial/income-distribution
PUT /api/production/financial/income-distribution

# Saga Management
GET /api/production/sagas
GET /api/production/sagas/:name/status
```

### Request/Response Examples

#### Confirm Reservation
```bash
POST /api/production/reservations/reservation-1/confirm
Content-Type: application/json

{
  "confirmedBy": "agent-1",
  "notes": "Confirmed after availability check"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reservation": { "id": "reservation-1", "status": "CONFIRMED" },
    "tasks": [
      { "id": "task-1", "type": "CLEANING", "title": "Pre-arrival cleaning" },
      { "id": "task-2", "type": "CHECK_IN", "title": "Check-in for John Doe" }
    ],
    "transaction": { "id": "transaction-1", "type": "GUEST_PAYMENT" }
  },
  "message": "Reservation confirmed successfully"
}
```

#### Process Payment
```bash
POST /api/production/reservations/reservation-1/payment
Content-Type: application/json

{
  "amount": 1000,
  "currency": "AED",
  "paymentMethod": "Credit Card",
  "gatewayId": "gateway-123",
  "gatewayReference": "ref-456"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "guestPayment": { "id": "transaction-1", "amount": 1000 },
    "ownerPayout": { "id": "transaction-2", "amount": 700 },
    "agencyFee": { "id": "transaction-3", "amount": 250 },
    "incomeDistribution": {
      "ownerIncome": 70,
      "roomyAgencyFee": 25,
      "referringAgent": 5
    }
  },
  "message": "Payment processed successfully"
}
```

## Error Handling

### Saga Failure Recovery

When a saga step fails:

1. **Stop Execution** - Halt remaining steps
2. **Execute Compensations** - Run rollback actions in reverse order
3. **Log Error** - Record failure details
4. **Notify Stakeholders** - Alert relevant parties
5. **Return Error** - Provide detailed error information

### Common Error Scenarios

#### Reservation Conflicts
```json
{
  "success": false,
  "error": "Property is not available for the selected dates",
  "details": {
    "conflictingReservation": "reservation-2",
    "checkInDate": "2024-02-01",
    "checkOutDate": "2024-02-03"
  }
}
```

#### Payment Failures
```json
{
  "success": false,
  "error": "Payment gateway error",
  "details": {
    "gatewayError": "INSUFFICIENT_FUNDS",
    "retryAfter": "2024-01-15T10:00:00Z"
  }
}
```

#### Task Assignment Failures
```json
{
  "success": false,
  "error": "No available staff for task assignment",
  "details": {
    "taskType": "CLEANING",
    "scheduledDate": "2024-02-01T09:00:00Z",
    "suggestedAlternatives": ["2024-02-01T14:00:00Z", "2024-02-02T09:00:00Z"]
  }
}
```

## Monitoring and Observability

### Saga Status Tracking

Monitor saga execution in real-time:

```bash
GET /api/production/sagas/confirmReservation/status
```

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "confirmReservation",
    "status": "running",
    "currentStep": 3,
    "totalSteps": 8,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:05:00Z",
    "data": {
      "reservationId": "reservation-1",
      "cleaningTaskId": "task-1",
      "checkInTaskId": "task-2"
    }
  }
}
```

### Business Metrics

Track key business metrics:

- **Reservation Conversion Rate** - Pending to Confirmed
- **Payment Success Rate** - Successful payments
- **Task Completion Rate** - On-time task completion
- **Guest Satisfaction** - Post-stay ratings
- **Owner Payout Time** - Time to process payouts

### Audit Trail

All business processes are logged for compliance:

```json
{
  "timestamp": "2024-01-15T10:00:00Z",
  "event": "RESERVATION_CONFIRMED",
  "saga": "confirmReservation",
  "reservationId": "reservation-1",
  "userId": "agent-1",
  "details": {
    "stepsCompleted": 8,
    "tasksCreated": 4,
    "transactionsCreated": 1,
    "notificationsSent": 2
  }
}
```

## Testing Strategy

### Unit Tests

Test individual service methods:

```javascript
describe('FinancialService', () => {
  it('should calculate income distribution correctly', () => {
    const reservation = { totalAmount: 1000 };
    const result = financialService.calculateIncomeDistribution(reservation);
    
    expect(result.ownerPayout).toBe(700);
    expect(result.roomyAgencyFee).toBe(250);
    expect(result.referringAgentFee).toBe(50);
  });
});
```

### Integration Tests

Test complete workflows:

```javascript
describe('Reservation Workflow', () => {
  it('should execute complete reservation confirmation workflow', async () => {
    const result = await reservationService.confirmReservation('reservation-1');
    
    expect(result.success).toBe(true);
    expect(result.data.tasks).toHaveLength(4);
    expect(result.data.transaction).toBeDefined();
  });
});
```

### Test Coverage

- **Business Logic**: 95%+ coverage
- **Error Handling**: 90%+ coverage
- **Integration Flows**: 85%+ coverage
- **API Endpoints**: 90%+ coverage

## Deployment and Scaling

### Production Deployment

1. **Database Migration** - Apply schema changes
2. **Service Deployment** - Deploy business services
3. **API Gateway** - Configure routing
4. **Monitoring Setup** - Enable observability
5. **Health Checks** - Verify system health

### Horizontal Scaling

- **Stateless Services** - Scale independently
- **Database Sharding** - Partition by region/property
- **Message Queues** - Async task processing
- **Load Balancing** - Distribute API requests
- **Caching** - Redis for frequently accessed data

### Performance Optimization

- **Connection Pooling** - Database connections
- **Query Optimization** - Efficient database queries
- **Caching Strategy** - Cache expensive calculations
- **Async Processing** - Background task execution
- **Rate Limiting** - Protect against abuse

## Security Considerations

### Authentication and Authorization

- **JWT Tokens** - Secure API access
- **Role-Based Access** - Granular permissions
- **API Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize all inputs
- **Audit Logging** - Track all operations

### Data Protection

- **Encryption at Rest** - Database encryption
- **Encryption in Transit** - TLS/SSL
- **PII Protection** - Mask sensitive data
- **GDPR Compliance** - Data privacy
- **Backup Encryption** - Secure backups

### Financial Security

- **Payment Tokenization** - Secure payment data
- **PCI Compliance** - Payment card standards
- **Fraud Detection** - Monitor suspicious activity
- **Reconciliation** - Verify financial transactions
- **Audit Trail** - Complete transaction history

## Future Enhancements

### Planned Features

1. **Real-time Updates** - WebSocket notifications
2. **Advanced Analytics** - Business intelligence
3. **Mobile App** - React Native application
4. **API Versioning** - Backward compatibility
5. **Microservices** - Service decomposition
6. **Event Sourcing** - Complete audit trail
7. **CQRS** - Command Query separation
8. **GraphQL** - Flexible data querying

### Scalability Improvements

1. **Event-Driven Architecture** - Loose coupling
2. **Message Queues** - Reliable messaging
3. **Distributed Caching** - Performance optimization
4. **Database Read Replicas** - Read scaling
5. **CDN Integration** - Global content delivery
6. **Auto-scaling** - Dynamic resource allocation
7. **Circuit Breakers** - Fault tolerance
8. **Bulk Operations** - Batch processing

This Business Process Orchestrator provides a robust foundation for managing complex workflows in Roomy CRM while ensuring data consistency, reliability, and scalability.
