# Сутності бази даних - Property Management System

## 1. 👥 USER MANAGEMENT (Управління користувачами)

### Users (Користувачі)
```sql
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── phone (VARCHAR)
├── avatar_url (TEXT)
├── role (ENUM: admin, property_manager, cleaner, maintenance, accountant)
├── is_active (BOOLEAN)
├── email_verified (BOOLEAN)
├── last_login_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### User Roles (Ролі користувачів)
```sql
user_roles
├── id (UUID, PK)
├── name (VARCHAR) -- 'admin', 'property_manager', 'cleaner'
├── description (TEXT)
├── permissions (JSONB) -- Array of permissions
└── created_at (TIMESTAMP)
```

### User Sessions (Сесії користувачів)
```sql
user_sessions
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── refresh_token (VARCHAR, UNIQUE)
├── expires_at (TIMESTAMP)
├── ip_address (INET)
├── user_agent (TEXT)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)
```

## 2. 🏠 PROPERTY MANAGEMENT (Управління нерухомістю)

### Properties (Об'єкти нерухомості)
```sql
properties
├── id (UUID, PK)
├── name (VARCHAR) -- 'Apartment 1A', 'Villa Sunset'
├── description (TEXT)
├── property_type (ENUM: apartment, house, villa, penthouse, studio, cottage, beach_house)
├── address (JSONB) -- {street, city, state, zip, country, coordinates}
├── amenities (TEXT[]) -- ['wifi', 'pool', 'gym', 'parking']
├── capacity (INTEGER) -- Maximum guests
├── bedrooms (INTEGER)
├── bathrooms (INTEGER)
├── size_sqm (DECIMAL)
├── floor_number (INTEGER)
├── has_elevator (BOOLEAN)
├── pet_friendly (BOOLEAN)
├── smoking_allowed (BOOLEAN)
├── base_price_per_night (DECIMAL)
├── cleaning_fee (DECIMAL)
├── security_deposit (DECIMAL)
├── check_in_time (TIME) -- Default 15:00
├── check_out_time (TIME) -- Default 11:00
├── minimum_nights (INTEGER) -- Default 1
├── maximum_nights (INTEGER)
├── advance_booking_days (INTEGER) -- How far in advance can book
├── is_active (BOOLEAN)
├── owner_id (UUID, FK → users.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Property Images (Зображення об'єктів)
```sql
property_images
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── image_url (TEXT)
├── thumbnail_url (TEXT)
├── image_type (ENUM: exterior, interior, amenities, floor_plan, virtual_tour)
├── sort_order (INTEGER)
├── alt_text (VARCHAR)
├── file_size (INTEGER)
├── width (INTEGER)
├── height (INTEGER)
└── created_at (TIMESTAMP)
```

### Property Documents (Документи об'єктів)
```sql
property_documents
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── document_url (TEXT)
├── document_type (ENUM: contract, insurance, certificate, manual, other)
├── title (VARCHAR)
├── description (TEXT)
├── file_size (INTEGER)
├── uploaded_by (UUID, FK → users.id)
└── created_at (TIMESTAMP)
```

## 3. 💰 PRICING & AVAILABILITY (Ціноутворення та доступність)

### Pricing Rules (Правила ціноутворення)
```sql
pricing_rules
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── name (VARCHAR) -- 'Summer High Season', 'Weekend Rate'
├── rule_type (ENUM: percentage, fixed_amount, seasonal, weekend, holiday, length_of_stay)
├── date_from (DATE)
├── date_to (DATE)
├── day_of_week (INTEGER) -- 1=Monday, 7=Sunday (for weekly rules)
├── price_modifier (DECIMAL) -- Percentage or fixed amount
├── minimum_nights (INTEGER)
├── maximum_nights (INTEGER)
├── minimum_guests (INTEGER)
├── maximum_guests (INTEGER)
├── is_active (BOOLEAN)
├── priority (INTEGER) -- Higher number = higher priority
└── created_at (TIMESTAMP)
```

### Availability Calendar (Календар доступності)
```sql
availability
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── date (DATE)
├── is_available (BOOLEAN)
├── minimum_nights (INTEGER)
├── maximum_nights (INTEGER)
├── price (DECIMAL)
├── notes (TEXT)
├── block_reason (ENUM: maintenance, owner_use, other)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Seasonal Pricing (Сезонне ціноутворення)
```sql
seasonal_pricing
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── season_name (VARCHAR) -- 'Summer 2024', 'Holiday Season'
├── start_date (DATE)
├── end_date (DATE)
├── price_multiplier (DECIMAL) -- 1.5 = 50% increase
├── minimum_nights (INTEGER)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)
```

## 4. 🛏️ RESERVATIONS (Бронювання)

### Reservations (Резервації)
```sql
reservations
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── guest_id (UUID, FK → guests.id)
├── confirmation_code (VARCHAR, UNIQUE) -- 'ROOMY-2024-001'
├── status (ENUM: confirmed, owner_confirmed, reserved, block, cancelled)
├── source (ENUM: direct, airbnb, booking, vrbo, manual)
├── external_booking_id (VARCHAR) -- ID from external platform
├── external_confirmation_code (VARCHAR) -- Confirmation from platform
├── check_in_date (DATE)
├── check_out_date (DATE)
├── nights (INTEGER)
├── adults (INTEGER)
├── children (INTEGER)
├── infants (INTEGER)
├── pets (INTEGER)
├── base_price (DECIMAL)
├── cleaning_fee (DECIMAL)
├── security_deposit (DECIMAL)
├── taxes (DECIMAL)
├── platform_fees (DECIMAL)
├── service_fees (DECIMAL)
├── total_amount (DECIMAL)
├── currency (VARCHAR) -- 'USD', 'EUR'
├── payment_status (ENUM: unpaid, partially_paid, fully_paid, refunded)
├── paid_amount (DECIMAL)
├── guest_status (ENUM: upcoming, checked_in, checked_out, no_show)
├── check_in_time (TIMESTAMP)
├── check_out_time (TIMESTAMP)
├── guest_notes (TEXT)
├── internal_notes (TEXT)
├── cancellation_reason (TEXT)
├── cancelled_at (TIMESTAMP)
├── cancelled_by (UUID, FK → users.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Guests (Гості)
```sql
guests
├── id (UUID, PK)
├── first_name (VARCHAR)
├── last_name (VARCHAR)
├── email (VARCHAR)
├── phone (VARCHAR)
├── date_of_birth (DATE)
├── nationality (VARCHAR) -- ISO country code
├── passport_number (VARCHAR)
├── address (JSONB) -- Guest's home address
├── emergency_contact (JSONB) -- {name, phone, relationship}
├── preferences (JSONB) -- {smoking, pets, accessibility}
├── vip_status (BOOLEAN)
├── notes (TEXT)
└── created_at (TIMESTAMP)
```

### Guest Reviews (Відгуки гостей)
```sql
guest_reviews
├── id (UUID, PK)
├── reservation_id (UUID, FK → reservations.id)
├── property_id (UUID, FK → properties.id)
├── guest_id (UUID, FK → guests.id)
├── rating (INTEGER) -- 1-5 stars
├── cleanliness_rating (INTEGER)
├── location_rating (INTEGER)
├── value_rating (INTEGER)
├── communication_rating (INTEGER)
├── review_text (TEXT)
├── is_public (BOOLEAN)
├── response_text (TEXT) -- Owner response
├── response_date (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 5. 🔗 INTEGRATIONS (Інтеграції)

### Integration Accounts (Акаунти інтеграцій)
```sql
integration_accounts
├── id (UUID, PK)
├── platform (ENUM: airbnb, booking, vrbo, expedia)
├── property_id (UUID, FK → properties.id)
├── external_property_id (VARCHAR) -- ID on external platform
├── account_name (VARCHAR) -- User-friendly name
├── access_token (TEXT)
├── refresh_token (TEXT)
├── token_expires_at (TIMESTAMP)
├── webhook_url (TEXT)
├── webhook_secret (VARCHAR)
├── is_active (BOOLEAN)
├── sync_settings (JSONB) -- Platform-specific settings
├── last_sync_at (TIMESTAMP)
├── sync_frequency (INTEGER) -- Minutes between syncs
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Sync Logs (Логи синхронізації)
```sql
sync_logs
├── id (UUID, PK)
├── integration_account_id (UUID, FK → integration_accounts.id)
├── sync_type (ENUM: reservations, pricing, availability, property_info, reviews)
├── status (ENUM: running, completed, failed, partial)
├── records_processed (INTEGER)
├── records_updated (INTEGER)
├── records_created (INTEGER)
├── records_failed (INTEGER)
├── error_message (TEXT)
├── error_details (JSONB)
├── started_at (TIMESTAMP)
├── completed_at (TIMESTAMP)
├── duration_seconds (INTEGER)
└── created_at (TIMESTAMP)
```

### Webhook Events (Webhook події)
```sql
webhook_events
├── id (UUID, PK)
├── integration_account_id (UUID, FK → integration_accounts.id)
├── event_type (VARCHAR) -- 'reservation.created', 'reservation.cancelled'
├── external_event_id (VARCHAR) -- ID from external platform
├── payload (JSONB) -- Raw webhook data
├── processed (BOOLEAN)
├── processed_at (TIMESTAMP)
├── error_message (TEXT)
├── retry_count (INTEGER)
└── created_at (TIMESTAMP)
```

## 6. 🔧 MAINTENANCE & CLEANING (Обслуговування та прибирання)

### Maintenance Tasks (Завдання обслуговування)
```sql
maintenance_tasks
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── reservation_id (UUID, FK → reservations.id) -- If related to reservation
├── title (VARCHAR)
├── description (TEXT)
├── category (ENUM: plumbing, electrical, hvac, appliance, structural, cosmetic, safety)
├── priority (ENUM: low, medium, high, urgent)
├── status (ENUM: pending, in_progress, completed, cancelled, on_hold)
├── assigned_to (UUID, FK → users.id)
├── reported_by (UUID, FK → users.id)
├── scheduled_date (DATE)
├── completed_date (DATE)
├── estimated_duration_hours (DECIMAL)
├── actual_duration_hours (DECIMAL)
├── estimated_cost (DECIMAL)
├── actual_cost (DECIMAL)
├── contractor_name (VARCHAR)
├── contractor_contact (VARCHAR)
├── before_photos (TEXT[])
├── after_photos (TEXT[])
├── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Cleaning Tasks (Завдання прибирання)
```sql
cleaning_tasks
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── reservation_id (UUID, FK → reservations.id)
├── scheduled_date (DATE)
├── status (ENUM: pending, in_progress, completed, skipped, rescheduled)
├── assigned_to (UUID, FK → users.id)
├── check_in_time (TIME)
├── check_out_time (TIME)
├── cleaning_type (ENUM: checkout, maintenance, deep_clean, inspection)
├── estimated_duration_hours (DECIMAL)
├── actual_duration_hours (DECIMAL)
├── cost (DECIMAL)
├── checklist_items (JSONB) -- Array of checklist items with status
├── photos (TEXT[]) -- Before/after photos
├── notes (TEXT)
├── quality_score (INTEGER) -- 1-5 rating
├── completed_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Cleaning Checklists (Чек-листи прибирання)
```sql
cleaning_checklists
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── name (VARCHAR) -- 'Standard Checkout', 'Deep Clean'
├── items (JSONB) -- Array of checklist items
├── estimated_duration_hours (DECIMAL)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)
```

## 7. 💳 FINANCIAL MANAGEMENT (Фінансове управління)

### Transactions (Транзакції)
```sql
transactions
├── id (UUID, PK)
├── reservation_id (UUID, FK → reservations.id)
├── property_id (UUID, FK → properties.id)
├── transaction_type (ENUM: booking_revenue, cleaning_fee, security_deposit, refund, owner_payout, platform_commission, maintenance_cost)
├── amount (DECIMAL)
├── currency (VARCHAR)
├── description (TEXT)
├── payment_method (ENUM: credit_card, bank_transfer, paypal, stripe, platform_payment, cash)
├── external_transaction_id (VARCHAR) -- From payment gateway
├── gateway_fee (DECIMAL)
├── net_amount (DECIMAL) -- Amount after fees
├── status (ENUM: pending, completed, failed, refunded)
├── processed_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Owner Payouts (Виплати власникам)
```sql
owner_payouts
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── owner_id (UUID, FK → users.id)
├── payout_period_start (DATE)
├── payout_period_end (DATE)
├── total_revenue (DECIMAL)
├── platform_commissions (DECIMAL)
├── cleaning_fees (DECIMAL)
├── maintenance_costs (DECIMAL)
├── net_payout (DECIMAL)
├── currency (VARCHAR)
├── status (ENUM: pending, processing, completed, failed)
├── payment_method (VARCHAR)
├── bank_details (JSONB) -- Encrypted bank account info
├── processed_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Financial Reports (Фінансові звіти)
```sql
financial_reports
├── id (UUID, PK)
├── report_type (ENUM: monthly, quarterly, yearly, custom)
├── property_id (UUID, FK → properties.id)
├── period_start (DATE)
├── period_end (DATE)
├── total_revenue (DECIMAL)
├── total_expenses (DECIMAL)
├── net_profit (DECIMAL)
├── occupancy_rate (DECIMAL) -- Percentage
├── average_daily_rate (DECIMAL)
├── revenue_per_available_room (DECIMAL)
├── report_data (JSONB) -- Detailed breakdown
├── generated_by (UUID, FK → users.id)
├── generated_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

## 8. 📧 COMMUNICATION & NOTIFICATIONS (Комунікація та сповіщення)

### Messages (Повідомлення)
```sql
messages
├── id (UUID, PK)
├── reservation_id (UUID, FK → reservations.id)
├── sender_id (UUID, FK → users.id)
├── recipient_id (UUID, FK → users.id)
├── message_type (ENUM: text, email, sms, push)
├── subject (VARCHAR)
├── content (TEXT)
├── is_read (BOOLEAN)
├── read_at (TIMESTAMP)
├── sent_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

### Notification Templates (Шаблони сповіщень)
```sql
notification_templates
├── id (UUID, PK)
├── name (VARCHAR) -- 'reservation_confirmation', 'check_in_reminder'
├── type (ENUM: email, sms, push)
├── subject (VARCHAR)
├── content (TEXT)
├── variables (JSONB) -- Available template variables
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Email Logs (Логи електронної пошти)
```sql
email_logs
├── id (UUID, PK)
├── to_email (VARCHAR)
├── from_email (VARCHAR)
├── subject (VARCHAR)
├── template_name (VARCHAR)
├── content (TEXT)
├── status (ENUM: sent, delivered, failed, bounced)
├── external_id (VARCHAR) -- From email service provider
├── error_message (TEXT)
├── sent_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

## 9. 📊 ANALYTICS & REPORTING (Аналітика та звітність)

### Property Analytics (Аналітика об'єктів)
```sql
property_analytics
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── date (DATE)
├── views_count (INTEGER)
├── inquiries_count (INTEGER)
├── bookings_count (INTEGER)
├── revenue (DECIMAL)
├── occupancy_rate (DECIMAL)
├── average_rating (DECIMAL)
├── cancellation_rate (DECIMAL)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### User Activity Logs (Логи активності користувачів)
```sql
user_activity_logs
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── action (VARCHAR) -- 'login', 'create_reservation', 'update_property'
├── resource_type (VARCHAR) -- 'property', 'reservation', 'user'
├── resource_id (UUID)
├── ip_address (INET)
├── user_agent (TEXT)
├── details (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 10. ⚙️ SYSTEM CONFIGURATION (Системна конфігурація)

### System Settings (Системні налаштування)
```sql
system_settings
├── id (UUID, PK)
├── key (VARCHAR, UNIQUE) -- 'default_cleaning_fee', 'max_advance_booking_days'
├── value (TEXT)
├── data_type (ENUM: string, number, boolean, json)
├── description (TEXT)
├── is_public (BOOLEAN) -- Can be accessed by frontend
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Audit Logs (Логи аудиту)
```sql
audit_logs
├── id (UUID, PK)
├── table_name (VARCHAR)
├── record_id (UUID)
├── action (ENUM: create, update, delete)
├── old_values (JSONB)
├── new_values (JSONB)
├── changed_by (UUID, FK → users.id)
├── ip_address (INET)
├── user_agent (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 📋 Підсумок сутностей

### Основні групи:
1. **User Management** (3 сутності) - Користувачі, ролі, сесії
2. **Property Management** (3 сутності) - Об'єкти, зображення, документи
3. **Pricing & Availability** (3 сутності) - Ціни, доступність, сезонність
4. **Reservations** (3 сутності) - Бронювання, гості, відгуки
5. **Integrations** (3 сутності) - Акаунти, логи, webhook
6. **Maintenance & Cleaning** (3 сутності) - Завдання, чек-листи
7. **Financial** (3 сутності) - Транзакції, виплати, звіти
8. **Communication** (3 сутності) - Повідомлення, шаблони, логи
9. **Analytics** (2 сутності) - Аналітика, активність
10. **System** (2 сутності) - Налаштування, аудит

### **Загалом: 30 основних сутностей**

Ця структура забезпечить повнофункціональну систему управління нерухомістю з усіма необхідними можливостями! 🏗️
