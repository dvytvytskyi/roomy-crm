# Services Architecture - Property Management System

## 🏗️ ПОВНА АРХІТЕКТУРА СЕРВІСІВ (46 МОДЕЛЕЙ)

### ✅ **ОСНОВНІ ГРУПИ СЕРВІСІВ:**
- **👥 User Management Services** (8 моделей)
- **🏠 Property Management Services** (6 моделей) 
- **📅 Reservation System Services** (5 моделей)
- **💰 Pricing System Services** (4 моделі)
- **⭐ Amenities & Reviews Services** (4 моделі)
- **💳 Financial System Services** (4 моделі)
- **🔧 Maintenance & Cleaning Services** (6 моделей)
- **💬 Communication Services** (3 моделі)
- **🔗 Integration Services** (4 моделі)
- **⚙️ System Services** (3 моделі)

---

## 1. 👥 USER MANAGEMENT SERVICES

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
  verifyEmail(userId: string, token: string): Promise<void>
  
  // Role-based access control
  hasPermission(user: User, resource: string, action: string): boolean
  hasRole(user: User, role: UserRole): boolean
  canAccessProperty(user: User, propertyId: string): Promise<boolean>
}
```

### User Service
```typescript
class UserService {
  // CRUD operations
  createUser(data: CreateUserDto): Promise<User>
  updateUser(id: string, data: UpdateUserDto): Promise<User>
  deleteUser(id: string): Promise<void>
  getUser(id: string): Promise<User>
  getUsers(filters: UserFilters): Promise<User[]>
  
  // User management
  activateUser(userId: string): Promise<User>
  deactivateUser(userId: string): Promise<User>
  changeUserRole(userId: string, role: UserRole): Promise<User>
  updateUserProfile(userId: string, data: UpdateProfileDto): Promise<User>
  
  // User statistics
  getUserStats(userId: string): Promise<UserStats>
  getActiveUsers(): Promise<User[]>
  getUsersByRole(role: UserRole): Promise<User[]>
}
```

### Permission Service
```typescript
class PermissionService {
  // Permission management
  checkPermission(userId: string, resource: string, action: string): Promise<boolean>
  getUserPermissions(userId: string): Promise<Permission[]>
  updateUserPermissions(userId: string, permissions: Permission[]): Promise<void>
  
  // Role permissions
  getRolePermissions(role: UserRole): Promise<Permission[]>
  updateRolePermissions(role: UserRole, permissions: Permission[]): Promise<void>
  
  // Resource access
  canAccessResource(userId: string, resourceType: string, resourceId: string): Promise<boolean>
  canPerformAction(userId: string, action: string, context: any): Promise<boolean>
}
```

---

## 2. 🏠 PROPERTY MANAGEMENT SERVICES

### Property Service
```typescript
class PropertyService {
  // CRUD operations
  createProperty(data: CreatePropertyDto): Promise<Property>
  updateProperty(id: string, data: UpdatePropertyDto): Promise<Property>
  deleteProperty(id: string): Promise<void>
  getProperty(id: string): Promise<Property>
  getProperties(filters: PropertyFilters): Promise<Property[]>
  
  // Property management
  publishProperty(propertyId: string): Promise<Property>
  unpublishProperty(propertyId: string): Promise<Property>
  getPropertyTypes(): Promise<PropertyType[]>
  getPropertiesByOwner(ownerId: string): Promise<Property[]>
  
  // Property search
  searchProperties(criteria: SearchCriteria): Promise<Property[]>
  getFeaturedProperties(): Promise<Property[]>
  getPropertiesByLocation(location: LocationCriteria): Promise<Property[]>
}
```

### Property Image Service
```typescript
class PropertyImageService {
  // Image management
  uploadImage(propertyId: string, file: Buffer, metadata: ImageMetadata): Promise<PropertyImage>
  updateImage(imageId: string, data: UpdateImageDto): Promise<PropertyImage>
  deleteImage(imageId: string): Promise<void>
  getPropertyImages(propertyId: string): Promise<PropertyImage[]>
  
  // Image processing
  setPrimaryImage(propertyId: string, imageId: string): Promise<void>
  reorderImages(propertyId: string, imageIds: string[]): Promise<void>
  generateThumbnails(imageId: string): Promise<void>
  
  // Image optimization
  optimizeImage(imageBuffer: Buffer): Promise<Buffer>
  resizeImage(imageBuffer: Buffer, dimensions: ImageDimensions): Promise<Buffer>
}
```

### Property Document Service
```typescript
class PropertyDocumentService {
  // Document management
  uploadDocument(propertyId: string, file: Buffer, metadata: DocumentMetadata): Promise<PropertyDocument>
  updateDocument(documentId: string, data: UpdateDocumentDto): Promise<PropertyDocument>
  deleteDocument(documentId: string): Promise<void>
  getPropertyDocuments(propertyId: string): Promise<PropertyDocument[]>
  
  // Document processing
  validateDocument(file: Buffer, type: DocumentType): Promise<boolean>
  extractDocumentMetadata(file: Buffer): Promise<DocumentMetadata>
  checkDocumentExpiry(documentId: string): Promise<boolean>
  
  // Document types
  getDocumentTypes(): Promise<DocumentType[]>
  getExpiringDocuments(days: number): Promise<PropertyDocument[]>
}
```

### Property Manager Service
```typescript
class PropertyManagerService {
  // Manager management
  addManager(propertyId: string, userId: string, role: ManagerRole): Promise<PropertyManager>
  updateManagerRole(propertyId: string, userId: string, role: ManagerRole): Promise<PropertyManager>
  removeManager(propertyId: string, userId: string): Promise<void>
  getPropertyManagers(propertyId: string): Promise<PropertyManager[]>
  
  // Manager permissions
  canManageProperty(userId: string, propertyId: string): Promise<boolean>
  getManagerProperties(userId: string): Promise<Property[]>
  getManagerRole(userId: string, propertyId: string): Promise<ManagerRole>
}
```

---

## 3. 📅 RESERVATION SYSTEM SERVICES

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
  confirmReservation(reservationId: string): Promise<Reservation>
  
  // Conflict resolution
  detectConflicts(propertyId: string, dates: DateRange): Promise<Conflict[]>
  resolveConflicts(conflicts: Conflict[]): Promise<Resolution[]>
  
  // Reservation analytics
  getReservationStats(propertyId: string, dateRange: DateRange): Promise<ReservationStats>
  getOccupancyRate(propertyId: string, dateRange: DateRange): Promise<number>
}
```

### Reservation Adjustment Service
```typescript
class ReservationAdjustmentService {
  // Adjustment management
  addAdjustment(reservationId: string, data: CreateAdjustmentDto): Promise<ReservationAdjustment>
  updateAdjustment(adjustmentId: string, data: UpdateAdjustmentDto): Promise<ReservationAdjustment>
  deleteAdjustment(adjustmentId: string): Promise<void>
  getReservationAdjustments(reservationId: string): Promise<ReservationAdjustment[]>
  
  // Adjustment types
  getAdjustmentTypes(): Promise<AdjustmentType[]>
  calculateTotalAdjustments(reservationId: string): Promise<number>
  
  // Financial impact
  applyDiscount(reservationId: string, amount: number, reason: string): Promise<ReservationAdjustment>
  addFee(reservationId: string, amount: number, reason: string): Promise<ReservationAdjustment>
  processRefund(reservationId: string, amount: number, reason: string): Promise<ReservationAdjustment>
}
```

---

## 4. 💰 PRICING SYSTEM SERVICES

### Pricing Rule Service
```typescript
class PricingRuleService {
  // Rule management
  createRule(propertyId: string, data: CreatePricingRuleDto): Promise<PricingRule>
  updateRule(ruleId: string, data: UpdatePricingRuleDto): Promise<PricingRule>
  deleteRule(ruleId: string): Promise<void>
  getPropertyRules(propertyId: string): Promise<PricingRule[]>
  
  // Rule types
  getRuleTypes(): Promise<RuleType[]>
  getActiveRules(propertyId: string, date: Date): Promise<PricingRule[]>
  
  // Price calculation
  calculatePrice(propertyId: string, dates: DateRange, guests: number): Promise<number>
  applyRules(basePrice: number, rules: PricingRule[], context: PricingContext): Promise<number>
  
  // Rule validation
  validateRuleOverlap(propertyId: string, rule: PricingRule): Promise<boolean>
  getConflictingRules(propertyId: string, rule: PricingRule): Promise<PricingRule[]>
}
```

### Price History Service
```typescript
class PriceHistoryService {
  // History management
  recordPrice(propertyId: string, date: Date, basePrice: number, finalPrice: number, source: string): Promise<PriceHistory>
  getPriceHistory(propertyId: string, dateRange: DateRange): Promise<PriceHistory[]>
  getPriceTrend(propertyId: string, period: string): Promise<PriceTrend>
  
  // Price analytics
  getAveragePrice(propertyId: string, dateRange: DateRange): Promise<number>
  getPriceVolatility(propertyId: string, dateRange: DateRange): Promise<number>
  getPriceComparison(propertyId: string, competitorProperties: string[]): Promise<PriceComparison>
  
  // Export functionality
  exportPriceHistory(propertyId: string, format: 'csv' | 'json'): Promise<Buffer>
}
```

### Availability Service
```typescript
class AvailabilityService {
  // Availability management
  updateAvailability(propertyId: string, date: Date, status: AvailabilityStatus, price?: number): Promise<Availability>
  bulkUpdateAvailability(propertyId: string, updates: AvailabilityUpdate[]): Promise<void>
  getAvailability(propertyId: string, dateRange: DateRange): Promise<Availability[]>
  
  // Availability calculation
  calculateAvailability(propertyId: string, dateRange: DateRange): Promise<Availability[]>
  checkAvailability(propertyId: string, dates: DateRange): Promise<boolean>
  
  // Block management
  blockDates(propertyId: string, dates: DateRange, reason: string): Promise<void>
  unblockDates(propertyId: string, dates: DateRange): Promise<void>
  getBlockedDates(propertyId: string, dateRange: DateRange): Promise<Availability[]>
}
```

### PriceLab Integration Service
```typescript
class PriceLabService {
  // API integration
  authenticate(apiKey: string): Promise<boolean>
  getPriceRecommendations(propertyId: string, dates: DateRange): Promise<PriceRecommendation[]>
  applyPriceRecommendations(propertyId: string, recommendations: PriceRecommendation[]): Promise<void>
  
  // Data synchronization
  syncPropertyData(propertyId: string): Promise<void>
  syncMarketData(location: string): Promise<MarketData>
  
  // Price optimization
  optimizePrices(propertyId: string, strategy: PricingStrategy): Promise<OptimizedPrices>
  getMarketInsights(propertyId: string): Promise<MarketInsights>
}
```

---

## 5. ⭐ AMENITIES & REVIEWS SERVICES

### Amenity Service
```typescript
class AmenityService {
  // Amenity management
  createAmenity(data: CreateAmenityDto): Promise<Amenity>
  updateAmenity(id: string, data: UpdateAmenityDto): Promise<Amenity>
  deleteAmenity(id: string): Promise<void>
  getAmenities(filters: AmenityFilters): Promise<Amenity[]>
  
  // Categories
  getAmenityCategories(): Promise<string[]>
  getAmenitiesByCategory(category: string): Promise<Amenity[]>
  
  // Property amenities
  addAmenityToProperty(propertyId: string, amenityId: string): Promise<PropertyAmenity>
  removeAmenityFromProperty(propertyId: string, amenityId: string): Promise<void>
  getPropertyAmenities(propertyId: string): Promise<Amenity[]>
}
```

### Review Service
```typescript
class ReviewService {
  // Review management
  createReview(data: CreateReviewDto): Promise<Review>
  updateReview(id: string, data: UpdateReviewDto): Promise<Review>
  deleteReview(id: string): Promise<void>
  getPropertyReviews(propertyId: string): Promise<Review[]>
  
  // Review responses
  addResponse(reviewId: string, response: string): Promise<Review>
  updateResponse(reviewId: string, response: string): Promise<Review>
  
  // Review analytics
  getAverageRating(propertyId: string): Promise<number>
  getReviewStats(propertyId: string): Promise<ReviewStats>
  getRecentReviews(propertyId: string, limit: number): Promise<Review[]>
  
  // Review moderation
  moderateReview(reviewId: string, action: ModerationAction): Promise<Review>
  getPendingReviews(): Promise<Review[]>
}
```

---

## 6. 💳 FINANCIAL SYSTEM SERVICES

### Transaction Service
```typescript
class TransactionService {
  // Transaction management
  createTransaction(data: CreateTransactionDto): Promise<Transaction>
  updateTransaction(id: string, data: UpdateTransactionDto): Promise<Transaction>
  getTransaction(id: string): Promise<Transaction>
  getTransactions(filters: TransactionFilters): Promise<Transaction[]>
  
  // Transaction types
  getTransactionTypes(): Promise<TransactionType[]>
  getTransactionsByType(type: TransactionType, dateRange: DateRange): Promise<Transaction[]>
  
  // Financial reporting
  getRevenueReport(dateRange: DateRange): Promise<RevenueReport>
  getExpenseReport(dateRange: DateRange): Promise<ExpenseReport>
  getProfitLossReport(dateRange: DateRange): Promise<ProfitLossReport>
  
  // Transaction processing
  processPayment(transactionId: string): Promise<Transaction>
  processRefund(transactionId: string, amount: number): Promise<Transaction>
}
```

### Payment Service
```typescript
class PaymentService {
  // Payment processing
  processPayment(data: ProcessPaymentDto): Promise<Payment>
  refundPayment(paymentId: string, amount?: number): Promise<Payment>
  getPayment(id: string): Promise<Payment>
  getPayments(filters: PaymentFilters): Promise<Payment[]>
  
  // Payment methods
  getPaymentMethods(): Promise<PaymentMethod[]>
  validatePaymentMethod(method: PaymentMethod, data: any): Promise<boolean>
  
  // nomod.com integration
  processNomodPayment(paymentData: NomodPaymentData): Promise<PaymentResult>
  handleNomodWebhook(payload: any): Promise<void>
  getNomodPaymentStatus(transactionId: string): Promise<PaymentStatus>
}
```

### Bank Account Service
```typescript
class BankAccountService {
  // Account management
  addBankAccount(userId: string, data: CreateBankAccountDto): Promise<BankAccount>
  updateBankAccount(accountId: string, data: UpdateBankAccountDto): Promise<BankAccount>
  deleteBankAccount(accountId: string): Promise<void>
  getUserBankAccounts(userId: string): Promise<BankAccount[]>
  
  // Account operations
  setDefaultAccount(userId: string, accountId: string): Promise<void>
  validateBankAccount(accountData: BankAccountData): Promise<boolean>
  
  // Security
  encryptBankData(data: BankAccountData): Promise<string>
  decryptBankData(encryptedData: string): Promise<BankAccountData>
}
```

---

## 7. 🔧 MAINTENANCE & CLEANING SERVICES

### Maintenance Service
```typescript
class MaintenanceService {
  // Task management
  createTask(data: CreateMaintenanceDto): Promise<Maintenance>
  updateTask(id: string, data: UpdateMaintenanceDto): Promise<Maintenance>
  deleteTask(id: string): Promise<void>
  getTask(id: string): Promise<Maintenance>
  getTasks(filters: MaintenanceFilters): Promise<Maintenance[]>
  
  // Task assignment
  assignTask(taskId: string, userId: string): Promise<Maintenance>
  reassignTask(taskId: string, userId: string): Promise<Maintenance>
  
  // Task status
  startTask(taskId: string): Promise<Maintenance>
  completeTask(taskId: string, notes?: string): Promise<Maintenance>
  cancelTask(taskId: string, reason: string): Promise<Maintenance>
  
  // Task types and priorities
  getMaintenanceTypes(): Promise<MaintenanceType[]>
  getPriorityLevels(): Promise<Priority[]>
  
  // Scheduling
  scheduleTask(taskId: string, scheduledDate: Date): Promise<Maintenance>
  getScheduledTasks(date: Date): Promise<Maintenance[]>
  getOverdueTasks(): Promise<Maintenance[]>
}
```

### Cleaning Service
```typescript
class CleaningService {
  // Task management
  createTask(data: CreateCleaningDto): Promise<Cleaning>
  updateTask(id: string, data: UpdateCleaningDto): Promise<Cleaning>
  deleteTask(id: string): Promise<void>
  getTask(id: string): Promise<Cleaning>
  getTasks(filters: CleaningFilters): Promise<Cleaning[]>
  
  // Task assignment
  assignTask(taskId: string, userId: string): Promise<Cleaning>
  getAssignedTasks(userId: string): Promise<Cleaning[]>
  
  // Task execution
  startCleaning(taskId: string): Promise<Cleaning>
  completeCleaning(taskId: string, checklist: CleaningChecklist): Promise<Cleaning>
  skipCleaning(taskId: string, reason: string): Promise<Cleaning>
  
  // Checklist management
  getCleaningChecklist(propertyId: string): Promise<CleaningChecklist>
  updateChecklist(taskId: string, checklist: CleaningChecklist): Promise<Cleaning>
  
  // Scheduling
  scheduleCleaning(propertyId: string, date: Date, type: CleaningType): Promise<Cleaning>
  getCleaningSchedule(propertyId: string, dateRange: DateRange): Promise<Cleaning[]>
}
```

---

## 8. 💬 COMMUNICATION SERVICES

### Message Service
```typescript
class MessageService {
  // Message management
  sendMessage(data: CreateMessageDto): Promise<Message>
  updateMessage(id: string, data: UpdateMessageDto): Promise<Message>
  deleteMessage(id: string): Promise<void>
  getMessage(id: string): Promise<Message>
  getMessages(filters: MessageFilters): Promise<Message[]>
  
  // Conversation management
  getConversation(userId1: string, userId2: string): Promise<Message[]>
  getConversations(userId: string): Promise<Conversation[]>
  markAsRead(messageId: string): Promise<Message>
  markConversationAsRead(userId: string, otherUserId: string): Promise<void>
  
  // Message types
  getMessageTypes(): Promise<MessageType[]>
  sendBulkMessage(recipients: string[], message: CreateMessageDto): Promise<Message[]>
  
  // Attachments
  addAttachment(messageId: string, file: Buffer, filename: string): Promise<string>
  removeAttachment(messageId: string, attachmentId: string): Promise<void>
}
```

### Notification Service
```typescript
class NotificationService {
  // Notification management
  createNotification(data: CreateNotificationDto): Promise<Notification>
  markAsRead(notificationId: string): Promise<Notification>
  markAllAsRead(userId: string): Promise<void>
  deleteNotification(notificationId: string): Promise<void>
  getUserNotifications(userId: string): Promise<Notification[]>
  
  // Notification types
  getNotificationTypes(): Promise<NotificationType[]>
  sendReservationNotification(reservationId: string, type: NotificationType): Promise<void>
  sendPaymentNotification(paymentId: string, type: NotificationType): Promise<void>
  sendMaintenanceNotification(maintenanceId: string, type: NotificationType): Promise<void>
  
  // Push notifications
  sendPushNotification(userId: string, notification: PushNotification): Promise<void>
  registerDeviceToken(userId: string, token: string): Promise<void>
  unregisterDeviceToken(userId: string, token: string): Promise<void>
}
```

---

## 9. 🔗 INTEGRATION SERVICES

### Integration Service
```typescript
class IntegrationService {
  // Integration management
  createIntegration(data: CreateIntegrationDto): Promise<Integration>
  updateIntegration(id: string, data: UpdateIntegrationDto): Promise<Integration>
  deleteIntegration(id: string): Promise<void>
  getIntegration(id: string): Promise<Integration>
  getIntegrations(filters: IntegrationFilters): Promise<Integration[]>
  
  // Integration types
  getIntegrationTypes(): Promise<IntegrationType[]>
  getActiveIntegrations(): Promise<Integration[]>
  
  // Configuration
  updateIntegrationConfig(integrationId: string, config: any): Promise<Integration>
  testIntegration(integrationId: string): Promise<boolean>
  validateIntegrationConfig(type: IntegrationType, config: any): Promise<boolean>
}
```

### Sync Service
```typescript
class SyncService {
  // Sync management
  startSync(integrationId: string, syncType: string): Promise<SyncLog>
  stopSync(integrationId: string): Promise<void>
  getSyncStatus(integrationId: string): Promise<SyncStatus>
  getSyncLogs(filters: SyncLogFilters): Promise<SyncLog[]>
  
  // Sync orchestration
  syncAllIntegrations(): Promise<void>
  syncIntegration(integrationId: string): Promise<SyncResult>
  
  // Error handling
  handleSyncError(integrationId: string, error: Error): Promise<void>
  retryFailedSync(integrationId: string): Promise<void>
  getFailedSyncs(): Promise<SyncLog[]>
}
```

### Airbnb Integration Service
```typescript
class AirbnbIntegrationService {
  // Authentication
  authenticate(authCode: string): Promise<Integration>
  refreshToken(integrationId: string): Promise<void>
  
  // Data synchronization
  syncProperties(integrationId: string): Promise<SyncResult>
  syncReservations(integrationId: string): Promise<SyncResult>
  syncPricing(integrationId: string): Promise<SyncResult>
  syncAvailability(integrationId: string): Promise<SyncResult>
  
  // Webhook handling
  handleWebhook(payload: AirbnbWebhook): Promise<void>
  validateWebhookSignature(payload: string, signature: string): Promise<boolean>
  
  // API calls
  private callAirbnbAPI(endpoint: string, method: string, data?: any): Promise<any>
}
```

### Booking.com Integration Service
```typescript
class BookingIntegrationService {
  // Authentication
  authenticate(credentials: BookingCredentials): Promise<Integration>
  
  // Data synchronization
  syncProperties(integrationId: string): Promise<SyncResult>
  syncReservations(integrationId: string): Promise<SyncResult>
  updateAvailability(integrationId: string, updates: AvailabilityUpdate[]): Promise<void>
  updatePricing(integrationId: string, updates: PricingUpdate[]): Promise<void>
  
  // XML processing
  private parseBookingXML(xml: string): Promise<any>
  private generateBookingXML(data: any): string
  private validateBookingXML(xml: string): Promise<boolean>
}
```

---

## 10. ⚙️ SYSTEM SERVICES

### System Config Service
```typescript
class SystemConfigService {
  // Configuration management
  getConfig(key: string): Promise<SystemConfig>
  setConfig(key: string, value: any, type: ConfigType): Promise<SystemConfig>
  deleteConfig(key: string): Promise<void>
  getAllConfigs(): Promise<SystemConfig[]>
  
  // Public configuration
  getPublicConfigs(): Promise<SystemConfig[]>
  isConfigPublic(key: string): Promise<boolean>
  
  // Configuration validation
  validateConfigValue(key: string, value: any): Promise<boolean>
  getConfigType(key: string): Promise<ConfigType>
  
  // Configuration backup
  backupConfigs(): Promise<Buffer>
  restoreConfigs(backup: Buffer): Promise<void>
}
```

### Audit Service
```typescript
class AuditService {
  // Activity logging
  logActivity(userId: string, action: string, entity: string, entityId: string, details?: any): Promise<AuditLog>
  logDataChange(entity: string, entityId: string, oldData: any, newData: any, userId: string): Promise<AuditLog>
  logSecurityEvent(event: SecurityEvent): Promise<AuditLog>
  
  // Audit queries
  getAuditLogs(filters: AuditLogFilters): Promise<AuditLog[]>
  getEntityHistory(entity: string, entityId: string): Promise<AuditLog[]>
  getUserActivity(userId: string, dateRange: DateRange): Promise<AuditLog[]>
  
  // Audit export
  exportAuditLogs(filters: AuditLogFilters, format: 'csv' | 'json'): Promise<Buffer>
  generateAuditReport(dateRange: DateRange): Promise<AuditReport>
}
```

---

## 🔄 SERVICE COMMUNICATION

### Event Bus Service
```typescript
class EventBusService {
  // Event publishing
  publish(event: DomainEvent): Promise<void>
  publishAsync(event: DomainEvent): void
  
  // Event subscription
  subscribe(eventType: string, handler: EventHandler): void
  unsubscribe(eventType: string, handler: EventHandler): void
  
  // Event handlers for all 46 models
  private handleUserCreated(event: UserCreatedEvent): Promise<void>
  private handlePropertyCreated(event: PropertyCreatedEvent): Promise<void>
  private handleReservationCreated(event: ReservationCreatedEvent): Promise<void>
  private handlePaymentProcessed(event: PaymentProcessedEvent): Promise<void>
  private handleMaintenanceCompleted(event: MaintenanceCompletedEvent): Promise<void>
  private handleCleaningScheduled(event: CleaningScheduledEvent): Promise<void>
  private handleMessageSent(event: MessageSentEvent): Promise<void>
  private handleNotificationCreated(event: NotificationCreatedEvent): Promise<void>
  private handleSyncCompleted(event: SyncCompletedEvent): Promise<void>
  private handleConfigUpdated(event: ConfigUpdatedEvent): Promise<void>
}
```

### Cache Service
```typescript
class CacheService {
  // Redis operations
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  
  // Cache patterns for all models
  cacheUserData(userId: string, data: any): Promise<void>
  cachePropertyData(propertyId: string, data: any): Promise<void>
  cacheReservationData(reservationId: string, data: any): Promise<void>
  cacheAvailability(propertyId: string, availability: Availability[]): Promise<void>
  cachePricingRules(propertyId: string, rules: PricingRule[]): Promise<void>
  
  // Cache invalidation
  invalidateUserCache(userId: string): Promise<void>
  invalidatePropertyCache(propertyId: string): Promise<void>
  invalidateReservationCache(reservationId: string): Promise<void>
}
```

---

## 📊 SERVICE STATISTICS

### **Загалом: 30+ СЕРВІСІВ**

#### **Розподіл по групах:**
1. **👥 User Management** - 3 сервіси
2. **🏠 Property Management** - 4 сервіси
3. **📅 Reservation System** - 2 сервіси
4. **💰 Pricing System** - 4 сервіси
5. **⭐ Amenities & Reviews** - 2 сервіси
6. **💳 Financial System** - 3 сервіси
7. **🔧 Maintenance & Cleaning** - 2 сервіси
8. **💬 Communication** - 2 сервіси
9. **🔗 Integrations** - 4 сервіси
10. **⚙️ System** - 2 сервіси
11. **🔄 Communication** - 2 сервіси

### **🎯 КЛЮЧОВІ ОСОБЛИВОСТІ:**
- ✅ **Модульна архітектура** з чіткими межами відповідальності
- ✅ **Dependency Injection** для легкого тестування
- ✅ **Event-driven architecture** для асинхронної комунікації
- ✅ **Caching layer** для оптимізації продуктивності
- ✅ **Error handling** та retry логіка
- ✅ **Audit logging** всіх операцій
- ✅ **Integration patterns** для зовнішніх сервісів
- ✅ **Real-time updates** через WebSocket
- ✅ **Background processing** для важких операцій

Ця архітектура сервісів забезпечить **масштабовану та підтримувану** систему управління нерухомістю! 🚀