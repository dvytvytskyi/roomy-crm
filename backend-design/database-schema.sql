-- Property Management System Database Schema

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'property_manager',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('admin', 'property_manager', 'cleaner', 'maintenance', 'accountant');

-- Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    address JSONB NOT NULL, -- {street, city, state, zip, country, coordinates}
    amenities TEXT[], -- Array of amenities
    capacity INTEGER NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    size_sqm DECIMAL(10,2),
    base_price_per_night DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) DEFAULT 0,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    check_in_time TIME DEFAULT '15:00',
    check_out_time TIME DEFAULT '11:00',
    minimum_nights INTEGER DEFAULT 1,
    maximum_nights INTEGER,
    is_active BOOLEAN DEFAULT true,
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE property_type AS ENUM ('apartment', 'house', 'villa', 'penthouse', 'studio', 'cottage', 'beach_house');

-- Property Images
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type image_type DEFAULT 'interior',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE image_type AS ENUM ('exterior', 'interior', 'amenities', 'floor_plan');

-- Pricing Rules
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    rule_type pricing_rule_type NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    price_modifier DECIMAL(5,2) NOT NULL, -- Percentage or fixed amount
    minimum_nights INTEGER,
    maximum_nights INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE pricing_rule_type AS ENUM ('percentage', 'fixed_amount', 'seasonal', 'weekend', 'holiday');

-- Reservations
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    guest_id UUID REFERENCES users(id),
    confirmation_code VARCHAR(50) UNIQUE NOT NULL,
    status reservation_status DEFAULT 'confirmed',
    source booking_source NOT NULL,
    external_booking_id VARCHAR(255), -- ID from Airbnb/Booking.com
    
    -- Dates
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER NOT NULL,
    
    -- Guests
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER DEFAULT 0,
    infants INTEGER DEFAULT 0,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) DEFAULT 0,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    taxes DECIMAL(10,2) DEFAULT 0,
    fees DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment
    payment_status payment_status DEFAULT 'unpaid',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Guest Status
    guest_status guest_status DEFAULT 'upcoming',
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    
    -- Communication
    guest_notes TEXT,
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE reservation_status AS ENUM ('confirmed', 'owner_confirmed', 'reserved', 'block', 'cancelled');
CREATE TYPE booking_source AS ENUM ('direct', 'airbnb', 'booking', 'vrbo', 'manual');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partially_paid', 'fully_paid', 'refunded');
CREATE TYPE guest_status AS ENUM ('upcoming', 'checked_in', 'checked_out', 'no_show');

-- Guests (separate from users for external bookings)
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(3), -- ISO country code
    created_at TIMESTAMP DEFAULT NOW()
);

-- Integration Accounts
CREATE TABLE integration_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform integration_platform NOT NULL,
    property_id UUID REFERENCES properties(id),
    external_property_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    sync_settings JSONB, -- Platform-specific settings
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE integration_platform AS ENUM ('airbnb', 'booking', 'vrbo', 'expedia');

-- Sync Logs
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_account_id UUID REFERENCES integration_accounts(id),
    sync_type sync_type NOT NULL,
    status sync_status NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TYPE sync_type AS ENUM ('reservations', 'pricing', 'availability', 'property_info');
CREATE TYPE sync_status AS ENUM ('running', 'completed', 'failed', 'partial');

-- Availability Calendar
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    minimum_nights INTEGER,
    maximum_nights INTEGER,
    price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(property_id, date)
);

-- Maintenance Tasks
CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id),
    scheduled_date DATE,
    completed_date DATE,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Cleaning Tasks
CREATE TABLE cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    reservation_id UUID REFERENCES reservations(id),
    scheduled_date DATE NOT NULL,
    status cleaning_status DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id),
    check_in_time TIME,
    check_out_time TIME,
    notes TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE cleaning_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

-- Financial Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES reservations(id),
    property_id UUID REFERENCES properties(id),
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    payment_method payment_method,
    external_transaction_id VARCHAR(255),
    processed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE transaction_type AS ENUM ('booking_revenue', 'cleaning_fee', 'security_deposit', 'refund', 'owner_payout', 'platform_commission');
CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer', 'paypal', 'stripe', 'platform_payment');

-- Indexes for performance
CREATE INDEX idx_reservations_property_id ON reservations(property_id);
CREATE INDEX idx_reservations_check_in_date ON reservations(check_in_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_availability_property_date ON availability(property_id, date);
CREATE INDEX idx_integration_accounts_property ON integration_accounts(property_id);
CREATE INDEX idx_sync_logs_account_id ON sync_logs(integration_account_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_accounts_updated_at BEFORE UPDATE ON integration_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
