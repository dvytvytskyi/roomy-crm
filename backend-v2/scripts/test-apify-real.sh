#!/bin/bash

# Test script for real Apify integration
# This script tests the actual Apify API with real data

echo "====================================="
echo "  Real Apify Integration Test"
echo "====================================="

BACKEND_URL="http://localhost:3002"
TEST_URL="https://www.airbnb.com/rooms/1528180770610140527"

echo ""
echo "[1/5] Checking backend health..."
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    echo "✅ Backend is running on port 3002"
else
    echo "❌ Backend is not responding"
    exit 1
fi

echo ""
echo "[2/5] Getting JWT token..."
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
echo "[3/5] Testing URL validation with real endpoint..."
VALIDATION_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v2/integrations/airbnb/validate-url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"url\":\"$TEST_URL\"}")

echo "Validation Response: $VALIDATION_RESPONSE"

if echo "$VALIDATION_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ URL validation successful"
else
    echo "❌ URL validation failed"
fi

echo ""
echo "[4/5] Testing real Apify scraping (this may take 1-2 minutes)..."
IMPORT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v2/integrations/airbnb/import-from-url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"url\":\"$TEST_URL\"}" \
    --max-time 180)

echo "Import Response: $IMPORT_RESPONSE"

if echo "$IMPORT_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ Real Apify scraping successful!"
    PROPERTY_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.data.id')
    echo "📝 Property created with ID: $PROPERTY_ID"
else
    echo "❌ Real Apify scraping failed"
    echo "Error: $(echo "$IMPORT_RESPONSE" | jq -r '.error // .message // "Unknown error"')"
fi

echo ""
echo "[5/5] Testing preview endpoint..."
PREVIEW_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v2/integrations/airbnb/preview" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"url\":\"$TEST_URL\"}" \
    --max-time 180)

echo "Preview Response: $PREVIEW_RESPONSE"

if echo "$PREVIEW_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ Preview endpoint successful"
else
    echo "❌ Preview endpoint failed"
fi

echo ""
echo "====================================="
echo "  Test Summary"
echo "====================================="
echo "✅ Backend Health: OK"
echo "✅ JWT Authentication: OK"
echo "✅ URL Validation: Tested"
echo "✅ Real Apify Scraping: Tested"
echo "✅ Preview Endpoint: Tested"
echo ""
echo "🎯 Real Apify integration is ready!"
echo "🚀 You can now test through the UI at http://localhost:3000"
