#!/bin/bash

# Test Apify Actor directly
echo "====================================="
echo "  Testing Apify Actor Directly"
echo "====================================="

APIFY_API_TOKEN="${APIFY_API_TOKEN:-your_apify_token_here}"
ACTOR_ID="rigelbytes/airbnb-listing"
TEST_URL="https://www.airbnb.com/rooms/1528180770610140527"

echo ""
echo "[1/3] Testing Actor availability..."
ACTOR_INFO=$(curl -s -H "Authorization: Bearer $APIFY_API_TOKEN" \
  "https://api.apify.com/v2/acts/$ACTOR_ID")

if echo "$ACTOR_INFO" | jq -e '.data' > /dev/null; then
    echo "✅ Actor found: $(echo "$ACTOR_INFO" | jq -r '.data.name')"
    echo "   Username: $(echo "$ACTOR_INFO" | jq -r '.data.username')"
    echo "   Public: $(echo "$ACTOR_INFO" | jq -r '.data.isPublic')"
else
    echo "❌ Actor not found or not accessible"
    echo "Response: $ACTOR_INFO"
    exit 1
fi

echo ""
echo "[2/3] Testing Actor run..."
ACTOR_INPUT='{
  "startUrls": [{"url": "'$TEST_URL'"}],
  "maxListings": 1
}'

RUN_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $APIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ACTOR_INPUT" \
  "https://api.apify.com/v2/acts/$ACTOR_ID/runs")

if echo "$RUN_RESPONSE" | jq -e '.data.id' > /dev/null; then
    RUN_ID=$(echo "$RUN_RESPONSE" | jq -r '.data.id')
    echo "✅ Actor run started successfully"
    echo "   Run ID: $RUN_ID"
else
    echo "❌ Failed to start actor run"
    echo "Response: $RUN_RESPONSE"
    exit 1
fi

echo ""
echo "[3/3] Checking run status (waiting 30 seconds)..."
sleep 30

STATUS_RESPONSE=$(curl -s -H "Authorization: Bearer $APIFY_API_TOKEN" \
  "https://api.apify.com/v2/actor-runs/$RUN_ID")

STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.data.status')
echo "Run status: $STATUS"

if [ "$STATUS" = "SUCCEEDED" ]; then
    echo "✅ Actor run completed successfully!"
    
    # Get results
    RESULTS=$(curl -s -H "Authorization: Bearer $APIFY_API_TOKEN" \
      "https://api.apify.com/v2/actor-runs/$RUN_ID/dataset/items")
    
    echo "Results preview:"
    echo "$RESULTS" | jq '.[0] | {identifier, headline, name, location}' 2>/dev/null || echo "No results or invalid format"
    
elif [ "$STATUS" = "FAILED" ]; then
    echo "❌ Actor run failed"
    echo "Error details:"
    echo "$STATUS_RESPONSE" | jq '.data.meta'
else
    echo "⏳ Actor run still in progress (status: $STATUS)"
fi

echo ""
echo "====================================="
echo "  Test Complete"
echo "====================================="
