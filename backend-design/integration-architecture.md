# Integration Architecture

## 1. Airbnb Integration

### Authentication Flow
```
1. OAuth 2.0 Authorization Code Flow
2. Store access_token + refresh_token
3. Auto-refresh tokens before expiration
4. Handle token revocation
```

### Data Synchronization
```typescript
interface AirbnbSync {
  // Property Sync
  syncProperties(): Promise<void>
  
  // Reservation Sync (Real-time + Batch)
  syncReservations(): Promise<void>
  handleWebhook(payload: AirbnbWebhook): Promise<void>
  
  // Pricing Sync
  syncPricing(): Promise<void>
  
  // Availability Sync
  syncAvailability(): Promise<void>
}

// Webhook Events
interface AirbnbWebhook {
  type: 'reservation.created' | 'reservation.updated' | 'reservation.cancelled'
  data: {
    listing_id: string
    reservation_id: string
    start_date: string
    end_date: string
    guest: {
      first_name: string
      last_name: string
      email: string
    }
  }
}
```

### API Endpoints
```
GET    /v2/listings
GET    /v2/listings/:id
GET    /v2/reservations
GET    /v2/reservations/:id
POST   /v2/calendar/:id/availability
PUT    /v2/listing/:id/pricing
```

## 2. Booking.com Integration

### Connection API
```typescript
interface BookingSync {
  // XML-based API
  syncProperties(): Promise<void>
  syncReservations(): Promise<void>
  updateAvailability(): Promise<void>
  updatePricing(): Promise<void>
}

// XML Response Format
interface BookingReservation {
  reservation_id: string
  property_id: string
  arrival_date: string
  departure_date: string
  guest_name: string
  guest_email: string
  total_amount: number
  currency: string
}
```

### Data Mapping
```typescript
// Airbnb → Internal
const mapAirbnbReservation = (airbnb: AirbnbReservation): Reservation => ({
  external_booking_id: airbnb.id,
  source: 'airbnb',
  check_in_date: airbnb.start_date,
  check_out_date: airbnb.end_date,
  guest_name: `${airbnb.guest.first_name} ${airbnb.guest.last_name}`,
  total_amount: airbnb.total_price,
  // ... other mappings
})

// Booking.com → Internal  
const mapBookingReservation = (booking: BookingReservation): Reservation => ({
  external_booking_id: booking.reservation_id,
  source: 'booking',
  check_in_date: booking.arrival_date,
  check_out_date: booking.departure_date,
  guest_name: booking.guest_name,
  total_amount: booking.total_amount,
  // ... other mappings
})
```

## 3. Sync Strategy

### Real-time Sync
```typescript
class RealtimeSync {
  // Webhook handlers
  async handleAirbnbWebhook(payload: any) {
    await this.processReservation(payload.data)
    await this.updateAvailability(payload.data.listing_id)
  }
  
  async handleBookingWebhook(payload: any) {
    await this.processReservation(payload.data)
    await this.updateAvailability(payload.data.property_id)
  }
}
```

### Batch Sync (Every 15 minutes)
```typescript
class BatchSync {
  async syncAllAccounts() {
    const accounts = await this.getActiveIntegrationAccounts()
    
    for (const account of accounts) {
      try {
        await this.syncAccount(account)
      } catch (error) {
        await this.logSyncError(account.id, error)
      }
    }
  }
  
  private async syncAccount(account: IntegrationAccount) {
    switch (account.platform) {
      case 'airbnb':
        await this.syncAirbnbAccount(account)
        break
      case 'booking':
        await this.syncBookingAccount(account)
        break
    }
  }
}
```

## 4. Conflict Resolution

### Reservation Conflicts
```typescript
class ConflictResolver {
  async resolveDoubleBooking(
    existingReservation: Reservation,
    newReservation: Reservation
  ): Promise<ReservationConflictResolution> {
    
    // Priority rules:
    // 1. Earlier booking wins
    // 2. Higher price wins
    // 3. Direct booking > Platform booking
    
    const priority = this.calculatePriority(newReservation)
    const existingPriority = this.calculatePriority(existingReservation)
    
    if (priority > existingPriority) {
      return {
        action: 'replace',
        newReservation,
        cancelledReservation: existingReservation
      }
    }
    
    return {
      action: 'reject',
      reason: 'Double booking conflict'
    }
  }
}
```

### Pricing Conflicts
```typescript
class PricingSync {
  async syncPricing(propertyId: string, platformPricing: any) {
    const localPricing = await this.getLocalPricing(propertyId)
    
    // Check for conflicts
    if (this.hasPricingConflict(localPricing, platformPricing)) {
      await this.notifyPricingConflict(propertyId, {
        local: localPricing,
        platform: platformPricing
      })
    }
    
    // Apply platform pricing if no conflicts
    await this.updatePricing(propertyId, platformPricing)
  }
}
```

## 5. Error Handling & Retry Logic

```typescript
class SyncErrorHandler {
  async handleSyncError(error: SyncError, account: IntegrationAccount) {
    // Log error
    await this.logError(error, account)
    
    // Retry logic
    if (error.isRetryable) {
      await this.scheduleRetry(account.id, error.retryAfter)
    }
    
    // Notify administrators
    if (error.isCritical) {
      await this.notifyAdmins(error, account)
    }
  }
  
  private async scheduleRetry(accountId: string, retryAfter: number) {
    await this.queue.add('sync-account', { accountId }, {
      delay: retryAfter,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    })
  }
}
```

## 6. Data Validation

```typescript
class IntegrationValidator {
  validateAirbnbReservation(data: any): ValidationResult {
    const errors: string[] = []
    
    if (!data.id) errors.push('Missing reservation ID')
    if (!data.start_date) errors.push('Missing start date')
    if (!data.end_date) errors.push('Missing end date')
    if (!data.guest) errors.push('Missing guest information')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  validateBookingReservation(data: any): ValidationResult {
    // Similar validation for Booking.com data
  }
}
```
