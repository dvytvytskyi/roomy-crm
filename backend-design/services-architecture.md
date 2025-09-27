# Services Architecture

## 1. Core Services

### Authentication Service
```typescript
class AuthService {
  // JWT token management
  generateTokens(user: User): { accessToken: string, refreshToken: string }
  verifyToken(token: string): UserPayload
  refreshToken(refreshToken: string): { accessToken: string }
  
  // User management
  authenticate(email: string, password: string): Promise<User>
  register(userData: RegisterDto): Promise<User>
  resetPassword(email: string): Promise<void>
  changePassword(userId: string, newPassword: string): Promise<void>
  
  // Role-based access control
  hasPermission(user: User, resource: string, action: string): boolean
}
```

### Property Service
```typescript
class PropertyService {
  // CRUD operations
  createProperty(data: CreatePropertyDto): Promise<Property>
  updateProperty(id: string, data: UpdatePropertyDto): Promise<Property>
  deleteProperty(id: string): Promise<void>
  getProperty(id: string): Promise<Property>
  getProperties(filters: PropertyFilters): Promise<Property[]>
  
  // Pricing management
  updatePricing(propertyId: string, pricing: PricingRule[]): Promise<void>
  calculatePrice(propertyId: string, dates: DateRange): Promise<number>
  
  // Availability management
  updateAvailability(propertyId: string, availability: AvailabilityUpdate[]): Promise<void>
  checkAvailability(propertyId: string, dates: DateRange): Promise<boolean>
}
```

### Reservation Service
```typescript
class ReservationService {
  // CRUD operations
  createReservation(data: CreateReservationDto): Promise<Reservation>
  updateReservation(id: string, data: UpdateReservationDto): Promise<Reservation>
  cancelReservation(id: string, reason: string): Promise<Reservation>
  getReservation(id: string): Promise<Reservation>
  getReservations(filters: ReservationFilters): Promise<Reservation[]>
  
  // Status management
  checkIn(reservationId: string, checkInTime?: Date): Promise<Reservation>
  checkOut(reservationId: string, checkOutTime?: Date): Promise<Reservation>
  markNoShow(reservationId: string): Promise<Reservation>
  
  // Conflict resolution
  detectConflicts(propertyId: string, dates: DateRange): Promise<Conflict[]>
  resolveConflicts(conflicts: Conflict[]): Promise<Resolution[]>
}
```

### Payment Service
```typescript
class PaymentService {
  // Payment processing
  processPayment(reservationId: string, amount: number, method: PaymentMethod): Promise<PaymentResult>
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>
  
  // Payment gateway integration
  createStripePaymentIntent(amount: number, currency: string): Promise<PaymentIntent>
  handleStripeWebhook(payload: any): Promise<void>
  
  // Financial reporting
  getRevenueReport(dateRange: DateRange): Promise<RevenueReport>
  getOwnerPayouts(ownerId: string): Promise<Payout[]>
}
```

## 2. Integration Services

### Airbnb Integration Service
```typescript
class AirbnbIntegrationService {
  // Authentication
  authenticate(authCode: string): Promise<IntegrationAccount>
  refreshToken(accountId: string): Promise<void>
  
  // Data synchronization
  syncProperties(accountId: string): Promise<SyncResult>
  syncReservations(accountId: string): Promise<SyncResult>
  syncPricing(accountId: string): Promise<SyncResult>
  syncAvailability(accountId: string): Promise<SyncResult>
  
  // Webhook handling
  handleWebhook(payload: AirbnbWebhook): Promise<void>
  
  // API calls
  private callAirbnbAPI(endpoint: string, method: string, data?: any): Promise<any>
}
```

### Booking.com Integration Service
```typescript
class BookingIntegrationService {
  // Authentication
  authenticate(credentials: BookingCredentials): Promise<IntegrationAccount>
  
  // Data synchronization
  syncProperties(accountId: string): Promise<SyncResult>
  syncReservations(accountId: string): Promise<SyncResult>
  updateAvailability(accountId: string, updates: AvailabilityUpdate[]): Promise<void>
  updatePricing(accountId: string, updates: PricingUpdate[]): Promise<void>
  
  // XML processing
  private parseBookingXML(xml: string): Promise<any>
  private generateBookingXML(data: any): string
}
```

## 3. Background Services

### Sync Worker Service
```typescript
class SyncWorkerService {
  // Queue management
  addSyncJob(accountId: string, syncType: SyncType): Promise<void>
  processSyncJob(job: SyncJob): Promise<void>
  
  // Sync orchestration
  private async syncAccount(accountId: string): Promise<void> {
    const account = await this.getIntegrationAccount(accountId)
    
    try {
      await this.validateAccount(account)
      
      switch (account.platform) {
        case 'airbnb':
          await this.airbnbService.syncAccount(accountId)
          break
        case 'booking':
          await this.bookingService.syncAccount(accountId)
          break
      }
      
      await this.updateLastSyncTime(accountId)
    } catch (error) {
      await this.handleSyncError(accountId, error)
    }
  }
  
  // Error handling
  private async handleSyncError(accountId: string, error: Error): Promise<void> {
    await this.logSyncError(accountId, error)
    
    if (error instanceof RetryableError) {
      await this.scheduleRetry(accountId, error.retryAfter)
    }
  }
}
```

### Notification Service
```typescript
class NotificationService {
  // Email notifications
  sendReservationConfirmation(reservation: Reservation): Promise<void>
  sendCheckInReminder(reservation: Reservation): Promise<void>
  sendPaymentReminder(reservation: Reservation): Promise<void>
  sendMaintenanceAlert(task: MaintenanceTask): Promise<void>
  
  // SMS notifications
  sendSMSCheckInInstructions(reservation: Reservation): Promise<void>
  sendSMSEmergencyAlert(propertyId: string, message: string): Promise<void>
  
  // Push notifications
  sendPushNotification(userId: string, notification: PushNotification): Promise<void>
  
  // Template management
  private renderEmailTemplate(template: string, data: any): string
  private renderSMSTemplate(template: string, data: any): string
}
```

### Calendar Service
```typescript
class CalendarService {
  // Availability calculation
  calculateAvailability(propertyId: string, dateRange: DateRange): Promise<Availability[]>
  updateAvailability(propertyId: string, updates: AvailabilityUpdate[]): Promise<void>
  
  // Conflict detection
  detectConflicts(propertyId: string, newReservation: Reservation): Promise<Conflict[]>
  
  // Calendar sync
  syncWithIntegrations(propertyId: string): Promise<void>
  
  // Real-time updates
  broadcastAvailabilityUpdate(propertyId: string, availability: Availability[]): void
}
```

## 4. Utility Services

### Cache Service
```typescript
class CacheService {
  // Redis operations
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  
  // Cache patterns
  cachePropertyData(propertyId: string, data: any): Promise<void>
  cacheAvailability(propertyId: string, availability: Availability[]): Promise<void>
  invalidatePropertyCache(propertyId: string): Promise<void>
}
```

### File Service
```typescript
class FileService {
  // File upload
  uploadImage(file: Buffer, filename: string, folder: string): Promise<string>
  uploadDocument(file: Buffer, filename: string, folder: string): Promise<string>
  
  // File management
  deleteFile(url: string): Promise<void>
  generateSignedUrl(url: string, expiresIn: number): Promise<string>
  
  // Image processing
  resizeImage(imageBuffer: Buffer, width: number, height: number): Promise<Buffer>
  generateThumbnail(imageBuffer: Buffer): Promise<Buffer>
}
```

### Audit Service
```typescript
class AuditService {
  // Activity logging
  logActivity(userId: string, action: string, resource: string, details?: any): Promise<void>
  
  // Data changes
  logDataChange(table: string, recordId: string, changes: any, userId: string): Promise<void>
  
  // Security events
  logSecurityEvent(event: SecurityEvent): Promise<void>
  
  // Audit queries
  getAuditLog(filters: AuditFilters): Promise<AuditLog[]>
  getDataChanges(table: string, recordId: string): Promise<DataChange[]>
}
```

## 5. Service Communication

### Event Bus
```typescript
class EventBus {
  // Event publishing
  publish(event: DomainEvent): Promise<void>
  
  // Event subscription
  subscribe(eventType: string, handler: EventHandler): void
  
  // Event handlers
  private handleReservationCreated(event: ReservationCreatedEvent): Promise<void>
  private handlePaymentProcessed(event: PaymentProcessedEvent): Promise<void>
  private handleSyncCompleted(event: SyncCompletedEvent): Promise<void>
}
```

### API Gateway
```typescript
class APIGateway {
  // Request routing
  route(request: Request): Promise<Response>
  
  // Authentication middleware
  authenticate(request: Request): Promise<User>
  
  // Rate limiting
  checkRateLimit(userId: string, endpoint: string): Promise<boolean>
  
  // Request/Response transformation
  transformRequest(request: Request): Request
  transformResponse(response: Response): Response
}
```
