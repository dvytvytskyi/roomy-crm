# Перевірка та доповнення сутностей бази даних

## 1. 👥 USER MANAGEMENT - Детальна перевірка

### ✅ Що є:
- `users` - основна інформація
- `user_roles` - ролі та права
- `user_sessions` - сесії

### ❌ Що не вистачає:

#### User Permissions (Дозволи користувачів)
```sql
user_permissions
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── permission_name (VARCHAR) -- 'manage_properties', 'view_financials'
├── resource_type (VARCHAR) -- 'property', 'reservation', 'user'
├── resource_id (UUID) -- Specific resource or NULL for all
├── granted_by (UUID, FK → users.id)
├── expires_at (TIMESTAMP) -- For temporary permissions
└── created_at (TIMESTAMP)
```

#### User Preferences (Налаштування користувачів)
```sql
user_preferences
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── timezone (VARCHAR) -- 'Europe/Kiev', 'America/New_York'
├── language (VARCHAR) -- 'en', 'uk', 'ru'
├── date_format (VARCHAR) -- 'DD/MM/YYYY', 'MM/DD/YYYY'
├── currency (VARCHAR) -- 'USD', 'EUR', 'UAH'
├── email_notifications (BOOLEAN)
├── sms_notifications (BOOLEAN)
├── push_notifications (BOOLEAN)
├── dashboard_layout (JSONB) -- Custom dashboard configuration
└── updated_at (TIMESTAMP)
```

#### User Teams (Команди користувачів)
```sql
user_teams
├── id (UUID, PK)
├── name (VARCHAR)
├── description (TEXT)
├── team_lead_id (UUID, FK → users.id)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)

team_members
├── id (UUID, PK)
├── team_id (UUID, FK → user_teams.id)
├── user_id (UUID, FK → users.id)
├── role (ENUM: member, lead, admin)
├── joined_at (TIMESTAMP)
└── left_at (TIMESTAMP)
```

## 2. 🏠 PROPERTY MANAGEMENT - Детальна перевірка

### ✅ Що є:
- `properties` - основна інформація
- `property_images` - зображення
- `property_documents` - документи

### ❌ Що не вистачає:

#### Property Amenities (Зручності об'єктів)
```sql
property_amenities
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── amenity_name (VARCHAR) -- 'WiFi', 'Pool', 'Gym'
├── amenity_type (ENUM: basic, luxury, safety, accessibility)
├── is_included (BOOLEAN) -- Free or paid
├── additional_cost (DECIMAL) -- If paid amenity
├── description (TEXT)
└── created_at (TIMESTAMP)
```

#### Property Rules (Правила об'єктів)
```sql
property_rules
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── rule_type (ENUM: house_rules, check_in, check_out, cancellation, pets, smoking)
├── title (VARCHAR)
├── description (TEXT)
├── is_mandatory (BOOLEAN)
├── penalty_amount (DECIMAL) -- If rule violation
└── created_at (TIMESTAMP)
```

#### Property Insurance (Страхування об'єктів)
```sql
property_insurance
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── insurance_company (VARCHAR)
├── policy_number (VARCHAR)
├── coverage_type (ENUM: liability, property_damage, theft, natural_disaster)
├── coverage_amount (DECIMAL)
├── premium_amount (DECIMAL)
├── renewal_date (DATE)
├── policy_documents (TEXT[]) -- URLs to policy documents
└── created_at (TIMESTAMP)
```

#### Property Utilities (Комунальні послуги)
```sql
property_utilities
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── utility_type (ENUM: electricity, water, gas, internet, cable, trash)
├── provider_name (VARCHAR)
├── account_number (VARCHAR)
├── monthly_cost (DECIMAL)
├── is_included_in_rent (BOOLEAN)
├── contact_info (JSONB)
└── created_at (TIMESTAMP)
```

## 3. 💰 PRICING & AVAILABILITY - Детальна перевірка

### ✅ Що є:
- `pricing_rules` - правила цін
- `availability` - доступність
- `seasonal_pricing` - сезонні ціни

### ❌ Що не вистачає:

#### Dynamic Pricing (Динамічне ціноутворення)
```sql
dynamic_pricing_rules
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── algorithm_type (ENUM: demand_based, competitor_based, event_based, weather_based)
├── base_multiplier (DECIMAL) -- Base price multiplier
├── demand_threshold (INTEGER) -- Occupancy percentage threshold
├── price_increase_percentage (DECIMAL) -- How much to increase when demand is high
├── competitor_check_radius (INTEGER) -- Miles/km to check competitors
├── event_calendar_url (TEXT) -- For event-based pricing
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)
```

#### Price History (Історія цін)
```sql
price_history
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── date (DATE)
├── base_price (DECIMAL)
├── final_price (DECIMAL)
├── occupancy_rate (DECIMAL)
├── demand_factor (DECIMAL)
├── competitor_avg_price (DECIMAL)
├── booking_count (INTEGER)
└── created_at (TIMESTAMP)
```

#### Discounts & Promotions (Знижки та акції)
```sql
discounts
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── name (VARCHAR) -- 'Early Bird Discount', 'Last Minute Deal'
├── discount_type (ENUM: percentage, fixed_amount, free_nights)
├── discount_value (DECIMAL)
├── min_nights (INTEGER)
├── max_nights (INTEGER)
├── advance_booking_days (INTEGER) -- How many days in advance
├── valid_from (DATE)
├── valid_to (DATE)
├── usage_limit (INTEGER) -- How many times can be used
├── usage_count (INTEGER)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)
```

## 4. 🛏️ RESERVATIONS - Детальна перевірка

### ✅ Що є:
- `reservations` - бронювання
- `guests` - гості
- `guest_reviews` - відгуки

### ❌ Що не вистачає:

#### Guest Communication History (Історія спілкування з гостями)
```sql
guest_communications
├── id (UUID, PK)
├── reservation_id (UUID, FK → reservations.id)
├── guest_id (UUID, FK → guests.id)
├── communication_type (ENUM: email, sms, phone, chat, in_person)
├── direction (ENUM: incoming, outgoing)
├── subject (VARCHAR)
├── content (TEXT)
├── sent_by (UUID, FK → users.id)
├── is_automated (BOOLEAN)
├── sent_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

#### Guest Check-in/Check-out Process (Процес заселення/виселення)
```sql
guest_checkin_process
├── id (UUID, PK)
├── reservation_id (UUID, FK → reservations.id)
├── step_name (VARCHAR) -- 'key_handover', 'property_tour', 'rules_explanation'
├── completed (BOOLEAN)
├── completed_by (UUID, FK → users.id)
├── completed_at (TIMESTAMP)
├── notes (TEXT)
└── photos (TEXT[]) -- Photos during check-in
```

#### Guest Preferences (Побажання гостей)
```sql
guest_preferences
├── id (UUID, PK)
├── guest_id (UUID, FK → guests.id)
├── preference_type (ENUM: dietary, accessibility, entertainment, temperature)
├── preference_name (VARCHAR) -- 'Vegetarian', 'Wheelchair Access', 'Quiet Area'
├── priority (ENUM: low, medium, high, must_have)
├── notes (TEXT)
└── created_at (TIMESTAMP)
```

#### Reservation Modifications (Модифікації бронювань)
```sql
reservation_modifications
├── id (UUID, PK)
├── reservation_id (UUID, FK → reservations.id)
├── modification_type (ENUM: date_change, guest_count_change, duration_change, cancellation)
├── old_value (JSONB)
├── new_value (JSONB)
├── reason (TEXT)
├── approved_by (UUID, FK → users.id)
├── fee_applied (DECIMAL)
├── created_at (TIMESTAMP)
└── processed_at (TIMESTAMP)
```

## 5. 🔗 INTEGRATIONS - Детальна перевірка

### ✅ Що є:
- `integration_accounts` - акаунти
- `sync_logs` - логи синхронізації
- `webhook_events` - webhook події

### ❌ Що не вистачає:

#### Integration Field Mappings (Маппінг полів інтеграцій)
```sql
integration_field_mappings
├── id (UUID, PK)
├── integration_account_id (UUID, FK → integration_accounts.id)
├── local_field (VARCHAR) -- 'check_in_date', 'total_amount'
├── external_field (VARCHAR) -- 'start_date', 'total_price'
├── data_type (ENUM: string, number, date, boolean, json)
├── transformation_rule (TEXT) -- JavaScript function for data transformation
├── is_required (BOOLEAN)
└── created_at (TIMESTAMP)
```

#### Integration Rate Limits (Обмеження швидкості API)
```sql
integration_rate_limits
├── id (UUID, PK)
├── integration_account_id (UUID, FK → integration_accounts.id)
├── endpoint (VARCHAR) -- '/v2/listings', '/v2/reservations'
├── requests_per_minute (INTEGER)
├── requests_per_hour (INTEGER)
├── requests_per_day (INTEGER)
├── current_usage (JSONB) -- Current usage counters
├── reset_time (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### Integration Error Codes (Коди помилок інтеграцій)
```sql
integration_error_codes
├── id (UUID, PK)
├── platform (ENUM: airbnb, booking, vrbo, expedia)
├── error_code (VARCHAR) -- 'INVALID_PROPERTY_ID', 'RATE_LIMIT_EXCEEDED'
├── error_message (TEXT)
├── severity (ENUM: low, medium, high, critical)
├── auto_retry (BOOLEAN)
├── retry_after_minutes (INTEGER)
├── resolution_steps (TEXT)
└── created_at (TIMESTAMP)
```

## 6. 🔧 MAINTENANCE & CLEANING - Детальна перевірка

### ✅ Що є:
- `maintenance_tasks` - завдання обслуговування
- `cleaning_tasks` - завдання прибирання
- `cleaning_checklists` - чек-листи

### ❌ Що не вистачає:

#### Maintenance Contracts (Контракти обслуговування)
```sql
maintenance_contracts
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── contractor_name (VARCHAR)
├── contractor_contact (JSONB) -- {phone, email, address}
├── service_type (ENUM: plumbing, electrical, hvac, general, emergency)
├── contract_start_date (DATE)
├── contract_end_date (DATE)
├── monthly_fee (DECIMAL)
├── emergency_rate (DECIMAL) -- Hourly rate for emergency calls
├── response_time_hours (INTEGER) -- SLA response time
├── contract_documents (TEXT[])
└── created_at (TIMESTAMP)
```

#### Maintenance Supplies (Матеріали для обслуговування)
```sql
maintenance_supplies
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── supply_name (VARCHAR) -- 'Light Bulbs', 'Air Filters', 'Cleaning Supplies'
├── category (ENUM: electrical, plumbing, cleaning, safety, general)
├── current_stock (INTEGER)
├── min_stock_level (INTEGER) -- Reorder threshold
├── unit_cost (DECIMAL)
├── supplier_name (VARCHAR)
├── supplier_contact (JSONB)
├── last_restocked (DATE)
└── updated_at (TIMESTAMP)
```

#### Equipment Registry (Реєстр обладнання)
```sql
property_equipment
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── equipment_name (VARCHAR) -- 'Air Conditioner', 'Water Heater', 'Dishwasher'
├── brand (VARCHAR)
├── model (VARCHAR)
├── serial_number (VARCHAR)
├── purchase_date (DATE)
├── warranty_expiry (DATE)
├── last_service_date (DATE)
├── next_service_date (DATE)
├── service_interval_months (INTEGER)
├── current_condition (ENUM: excellent, good, fair, poor, needs_replacement)
├── location (VARCHAR) -- 'Kitchen', 'Living Room', 'Master Bedroom'
├── photos (TEXT[])
└── created_at (TIMESTAMP)
```

## 7. 💳 FINANCIAL MANAGEMENT - Детальна перевірка

### ✅ Що є:
- `transactions` - транзакції
- `owner_payouts` - виплати власникам
- `financial_reports` - фінансові звіти

### ❌ Що не вистачає:

#### Tax Management (Управління податками)
```sql
tax_rates
├── id (UUID, PK)
├── property_id (UUID, FK → properties.id)
├── tax_type (ENUM: occupancy_tax, sales_tax, vat, city_tax, tourism_tax)
├── tax_name (VARCHAR) -- 'Tourism Tax', 'City Tax', 'VAT'
├── tax_rate (DECIMAL) -- Percentage rate
├── tax_amount (DECIMAL) -- Fixed amount if applicable
├── calculation_method (ENUM: percentage_of_total, fixed_per_night, percentage_of_base)
├── is_mandatory (BOOLEAN)
├── valid_from (DATE)
├── valid_to (DATE)
└── created_at (TIMESTAMP)
```

#### Invoice Management (Управління рахунками)
```sql
invoices
├── id (UUID, PK)
├── reservation_id (UUID, FK → reservations.id)
├── invoice_number (VARCHAR, UNIQUE)
├── invoice_type (ENUM: booking, maintenance, cleaning, penalty, refund)
├── issued_to (VARCHAR) -- Guest name or company
├── issued_to_email (VARCHAR)
├── issued_to_address (JSONB)
├── subtotal (DECIMAL)
├── tax_amount (DECIMAL)
├── total_amount (DECIMAL)
├── currency (VARCHAR)
├── due_date (DATE)
├── status (ENUM: draft, sent, paid, overdue, cancelled)
├── payment_method (VARCHAR)
├── paid_at (TIMESTAMP)
├── pdf_url (TEXT)
└── created_at (TIMESTAMP)
```

#### Expense Categories (Категорії витрат)
```sql
expense_categories
├── id (UUID, PK)
├── category_name (VARCHAR) -- 'Cleaning', 'Maintenance', 'Utilities', 'Marketing'
├── parent_category_id (UUID, FK → expense_categories.id)
├── description (TEXT)
├── is_tax_deductible (BOOLEAN)
├── default_account_code (VARCHAR) -- For accounting integration
└── created_at (TIMESTAMP)
```

## 8. 📧 COMMUNICATION - Детальна перевірка

### ✅ Що є:
- `messages` - повідомлення
- `notification_templates` - шаблони сповіщень
- `email_logs` - логи електронної пошти

### ❌ Що не вистачає:

#### Communication Channels (Канали комунікації)
```sql
communication_channels
├── id (UUID, PK)
├── channel_name (VARCHAR) -- 'WhatsApp', 'Telegram', 'Airbnb Messages'
├── channel_type (ENUM: email, sms, whatsapp, telegram, platform_messaging)
├── is_enabled (BOOLEAN)
├── api_credentials (JSONB) -- Encrypted API keys
├── webhook_url (TEXT)
├── rate_limit_per_hour (INTEGER)
└── created_at (TIMESTAMP)
```

#### Automated Workflows (Автоматизовані робочі процеси)
```sql
automated_workflows
├── id (UUID, PK)
├── workflow_name (VARCHAR) -- 'New Booking Welcome', 'Check-in Reminder'
├── trigger_event (VARCHAR) -- 'reservation.created', 'check_in_day_minus_1'
├── trigger_conditions (JSONB) -- Conditions for triggering
├── actions (JSONB) -- Array of actions to perform
├── is_active (BOOLEAN)
├── execution_count (INTEGER)
├── last_executed_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

## 9. 📊 ANALYTICS - Детальна перевірка

### ✅ Що є:
- `property_analytics` - аналітика об'єктів
- `user_activity_logs` - логи активності

### ❌ Що не вистачає:

#### Competitor Analysis (Аналіз конкурентів)
```sql
competitor_properties
├── id (UUID, PK)
├── competitor_name (VARCHAR) -- 'Airbnb Property', 'Booking.com Listing'
├── external_property_id (VARCHAR)
├── property_name (VARCHAR)
├── address (JSONB)
├── property_type (VARCHAR)
├── bedrooms (INTEGER)
├── bathrooms (INTEGER)
├── capacity (INTEGER)
├── current_price (DECIMAL)
├── availability_percentage (DECIMAL)
├── rating (DECIMAL)
├── review_count (INTEGER)
├── last_updated (TIMESTAMP)
└── created_at (TIMESTAMP)
```

#### Market Trends (Ринкові тренди)
```sql
market_trends
├── id (UUID, PK)
├── location (VARCHAR) -- City or region
├── date (DATE)
├── average_daily_rate (DECIMAL)
├── occupancy_rate (DECIMAL)
├── revenue_per_available_room (DECIMAL)
├── booking_lead_time_days (DECIMAL)
├── cancellation_rate (DECIMAL)
├── competitor_count (INTEGER)
└── created_at (TIMESTAMP)
```

## 10. ⚙️ SYSTEM CONFIGURATION - Детальна перевірка

### ✅ Що є:
- `system_settings` - системні налаштування
- `audit_logs` - логи аудиту

### ❌ Що не вистачає:

#### API Keys Management (Управління API ключами)
```sql
api_keys
├── id (UUID, PK)
├── key_name (VARCHAR) -- 'Stripe Live', 'SendGrid Production'
├── service_name (VARCHAR) -- 'stripe', 'sendgrid', 'twilio'
├── environment (ENUM: development, staging, production)
├── encrypted_key (TEXT) -- Encrypted API key
├── permissions (JSONB) -- What this key can do
├── last_used_at (TIMESTAMP)
├── usage_count (INTEGER)
├── is_active (BOOLEAN)
├── expires_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

#### System Health Monitoring (Моніторинг здоров'я системи)
```sql
system_health_metrics
├── id (UUID, PK)
├── metric_name (VARCHAR) -- 'api_response_time', 'database_connections'
├── metric_value (DECIMAL)
├── metric_unit (VARCHAR) -- 'ms', 'count', 'percentage'
├── threshold_warning (DECIMAL)
├── threshold_critical (DECIMAL)
├── status (ENUM: healthy, warning, critical)
├── recorded_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

## 📋 Підсумок доповнень

### Додано **25 нових сутностей** до існуючих **30**:

1. **User Management** +3 сутності
2. **Property Management** +4 сутності  
3. **Pricing & Availability** +3 сутності
4. **Reservations** +4 сутності
5. **Integrations** +3 сутності
6. **Maintenance & Cleaning** +3 сутності
7. **Financial Management** +3 сутності
8. **Communication** +2 сутності
9. **Analytics** +2 сутності
10. **System Configuration** +2 сутності

### **Загалом: 55 сутностей** для повнофункціональної системи! 🚀

Ці доповнення забезпечать:
- ✅ Детальне управління правами доступу
- ✅ Повний цикл обслуговування та прибирання
- ✅ Динамічне ціноутворення та аналіз конкурентів
- ✅ Автоматизовані робочі процеси
- ✅ Комплексне податкове управління
- ✅ Моніторинг здоров'я системи
