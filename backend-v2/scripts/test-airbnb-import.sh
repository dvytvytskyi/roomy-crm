#!/bin/bash

# Test script for Airbnb Import Integration
# Usage: ./scripts/test-airbnb-import.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3002/api/v2"
AIRBNB_URL="https://www.airbnb.com/rooms/1528180770610140527"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}  Airbnb Import Integration Test${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Step 1: Check if backend is running
echo -e "${YELLOW}[1/6] Checking backend health...${NC}"
if curl -s -f "$API_URL/../health" > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running. Please start it with: npm run dev${NC}"
    exit 1
fi
echo ""

# Step 2: Login and get token
echo -e "${YELLOW}[2/6] Logging in...${NC}"
read -p "Enter admin email [admin@roomy.com]: " EMAIL
EMAIL=${EMAIL:-admin@roomy.com}

read -sp "Enter password: " PASSWORD
echo ""
PASSWORD=${PASSWORD:-admin123}

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}✗ Login failed. Please check your credentials.${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 3: Validate Airbnb URL
echo -e "${YELLOW}[3/6] Validating Airbnb URL...${NC}"
VALIDATE_RESPONSE=$(curl -s -X POST "$API_URL/integrations/airbnb/validate-url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"url\":\"$AIRBNB_URL\"}")

IS_VALID=$(echo $VALIDATE_RESPONSE | jq -r '.data.isValid')
LISTING_ID=$(echo $VALIDATE_RESPONSE | jq -r '.data.listingId')

if [ "$IS_VALID" == "true" ]; then
    echo -e "${GREEN}✓ URL is valid${NC}"
    echo "Listing ID: $LISTING_ID"
else
    echo -e "${RED}✗ URL is invalid${NC}"
    echo "Response: $VALIDATE_RESPONSE"
    exit 1
fi
echo ""

# Step 4: Preview listing (optional, for ADMIN/MANAGER only)
echo -e "${YELLOW}[4/6] Previewing listing data...${NC}"
PREVIEW_RESPONSE=$(curl -s -X POST "$API_URL/integrations/airbnb/preview" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"url\":\"$AIRBNB_URL\"}")

PREVIEW_SUCCESS=$(echo $PREVIEW_RESPONSE | jq -r '.success')

if [ "$PREVIEW_SUCCESS" == "true" ]; then
    echo -e "${GREEN}✓ Preview successful${NC}"
    HEADLINE=$(echo $PREVIEW_RESPONSE | jq -r '.data.headline')
    CITY=$(echo $PREVIEW_RESPONSE | jq -r '.data.location.address.city')
    MAX_GUESTS=$(echo $PREVIEW_RESPONSE | jq -r '.data.supplement.max_guests')
    FEATURES_COUNT=$(echo $PREVIEW_RESPONSE | jq -r '.data.features | length')
    IMAGES_COUNT=$(echo $PREVIEW_RESPONSE | jq -r '.data.images | length')
    
    echo "  Headline: $HEADLINE"
    echo "  City: $CITY"
    echo "  Max Guests: $MAX_GUESTS"
    echo "  Features: $FEATURES_COUNT"
    echo "  Images: $IMAGES_COUNT"
else
    echo -e "${YELLOW}⚠ Preview failed (might be permission issue, continuing...)${NC}"
fi
echo ""

# Step 5: Get owner ID
echo -e "${YELLOW}[5/6] Getting user info for owner ID...${NC}"
USER_INFO=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

OWNER_ID=$(echo $USER_INFO | jq -r '.data.id')

if [ -z "$OWNER_ID" ] || [ "$OWNER_ID" == "null" ]; then
    echo -e "${RED}✗ Failed to get owner ID${NC}"
    echo "Response: $USER_INFO"
    exit 1
fi

echo -e "${GREEN}✓ Owner ID: $OWNER_ID${NC}"
echo ""

# Step 6: Import property
echo -e "${YELLOW}[6/6] Importing property from Airbnb...${NC}"
echo "This may take a moment..."

IMPORT_RESPONSE=$(curl -s -X POST "$API_URL/integrations/airbnb/import-from-url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"url\":\"$AIRBNB_URL\",\"ownerId\":\"$OWNER_ID\"}")

IMPORT_SUCCESS=$(echo $IMPORT_RESPONSE | jq -r '.success')

if [ "$IMPORT_SUCCESS" == "true" ]; then
    echo -e "${GREEN}✓ Property imported successfully!${NC}"
    
    PROPERTY_ID=$(echo $IMPORT_RESPONSE | jq -r '.data.property.id')
    PROPERTY_NAME=$(echo $IMPORT_RESPONSE | jq -r '.data.property.name')
    PROPERTY_TYPE=$(echo $IMPORT_RESPONSE | jq -r '.data.property.type')
    PROPERTY_CITY=$(echo $IMPORT_RESPONSE | jq -r '.data.property.city')
    PROPERTY_BEDROOMS=$(echo $IMPORT_RESPONSE | jq -r '.data.property.bedrooms')
    PROPERTY_CAPACITY=$(echo $IMPORT_RESPONSE | jq -r '.data.property.capacity')
    AIRBNB_ID=$(echo $IMPORT_RESPONSE | jq -r '.data.airbnbData.airbnbId')
    
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}  Property Details${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo "Property ID: $PROPERTY_ID"
    echo "Name: $PROPERTY_NAME"
    echo "Type: $PROPERTY_TYPE"
    echo "City: $PROPERTY_CITY"
    echo "Bedrooms: $PROPERTY_BEDROOMS"
    echo "Capacity: $PROPERTY_CAPACITY"
    echo "Airbnb ID: $AIRBNB_ID"
    echo ""
    echo -e "${BLUE}View in browser:${NC}"
    echo "http://localhost:3000/properties/$PROPERTY_ID"
    echo ""
else
    echo -e "${RED}✗ Import failed${NC}"
    echo "Response: $IMPORT_RESPONSE"
    ERROR_MESSAGE=$(echo $IMPORT_RESPONSE | jq -r '.message')
    echo "Error: $ERROR_MESSAGE"
    exit 1
fi

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Test Completed Successfully!${NC}"
echo -e "${GREEN}=====================================${NC}"

