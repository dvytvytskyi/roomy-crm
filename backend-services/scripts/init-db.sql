-- Initialize database with basic setup
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS roomy_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples of what Prisma will create

-- Performance indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_property_id ON reservations(property_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_property_id ON transactions(property_id);

-- Full-text search indexes
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_search ON properties USING gin(to_tsvector('english', name || ' ' || description));
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search ON users USING gin(to_tsvector('english', "firstName" || ' ' || "lastName"));

-- Log initialization
INSERT INTO system_settings (key, value, description, category) 
VALUES (
    'database_initialized', 
    '{"timestamp": "' || NOW() || '", "version": "1.0.0"}',
    'Database initialization timestamp',
    'system'
) ON CONFLICT (key) DO NOTHING;
