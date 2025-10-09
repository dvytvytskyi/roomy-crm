#!/bin/bash

# Test real Apify import
echo "====================================="
echo "  Real Apify Import Test"
echo "====================================="

BACKEND_URL="http://localhost:3002"
TEST_URL="https://www.airbnb.com/rooms/1293489979710718583"

echo ""
echo "[1/3] Checking backend health..."
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    echo "✅ Backend is running on port 3002"
else
    echo "❌ Backend is not responding"
    exit 1
fi

echo ""
echo "[2/3] Getting JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v2/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@roomy.com","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "❌ Failed to get JWT token"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo "✅ JWT token obtained"

echo ""
echo "[3/3] Testing REAL Apify import (this will take 1-3 minutes)..."
echo "   URL: $TEST_URL"
echo "   Waiting for Apify Actor to run..."

IMPORT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v2/integrations/airbnb/import-from-url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"url\":\"$TEST_URL\"}" \
    --max-time 240)

echo ""
echo "Import Response:"
echo "$IMPORT_RESPONSE" | jq '.'

if echo "$IMPORT_RESPONSE" | jq -e '.success' > /dev/null; then
    PROPERTY_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.data.property.id')
    PROPERTY_NAME=$(echo "$IMPORT_RESPONSE" | jq -r '.data.property.name')
    
    echo ""
    echo "====================================="
    echo "  ✅ SUCCESS!"
    echo "====================================="
    echo "Property created:"
    echo "  ID: $PROPERTY_ID"
    echo "  Name: $PROPERTY_NAME"
    echo ""
    echo "Open in browser:"
    echo "  http://localhost:3000/properties/$PROPERTY_ID"
else
    ERROR_MSG=$(echo "$IMPORT_RESPONSE" | jq -r '.error // .message // "Unknown error"')
    echo ""
    echo "====================================="
    echo "  ❌ FAILED"
    echo "====================================="
    echo "Error: $ERROR_MSG"
fi
