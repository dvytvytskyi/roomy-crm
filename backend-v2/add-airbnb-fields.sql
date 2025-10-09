-- Migration: Add Airbnb enrichment fields to properties table
-- Date: 2025-10-09

-- Add new columns for Airbnb import enrichment
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS beds_configuration JSONB,
ADD COLUMN IF NOT EXISTS external_rating FLOAT,
ADD COLUMN IF NOT EXISTS external_review_count INTEGER,
ADD COLUMN IF NOT EXISTS allows_pets BOOLEAN,
ADD COLUMN IF NOT EXISTS external_cancellation_policy VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN properties.beds_configuration IS 'Detailed bed configuration from Airbnb: [{"room": "Bedroom 1", "bedType": "King", "count": 1}]';
COMMENT ON COLUMN properties.external_rating IS 'Rating from external platforms like Airbnb (e.g., 4.84)';
COMMENT ON COLUMN properties.external_review_count IS 'Number of reviews from external platforms';
COMMENT ON COLUMN properties.allows_pets IS 'Whether pets are allowed in this property';
COMMENT ON COLUMN properties.external_cancellation_policy IS 'Cancellation policy from external platform (e.g., MODERATE, FIRM, FLEXIBLE)';
