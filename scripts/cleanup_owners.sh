#!/bin/bash

# Configuration
API_BASE_URL="http://localhost:3001/api"
AUTH_TOKEN="test"
KEEP_OWNER_PROPERTY_ID="prop_1"

echo "🚀 Starting owners cleanup process..."
echo "📌 Keeping owner only for property: $KEEP_OWNER_PROPERTY_ID"
echo ""

# Function to make API calls
make_api_call() {
    local method=$1
    local url=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $AUTH_TOKEN" \
             -d "$data" \
             "$url"
    else
        curl -s -X "$method" \
             -H "Authorization: Bearer $AUTH_TOKEN" \
             "$url"
    fi
}

# Get all properties
echo "📖 Fetching all properties..."
PROPERTIES_RESPONSE=$(make_api_call "GET" "$API_BASE_URL/properties?limit=100")

if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch properties"
    exit 1
fi

# Extract property IDs (excluding the one we want to keep)
PROPERTY_IDS=$(echo "$PROPERTIES_RESPONSE" | grep -o '"id":"[^"]*"' | grep -v "prop_1" | cut -d'"' -f4)

echo "🗑️  Removing owners from properties..."

SUCCESS_COUNT=0
FAIL_COUNT=0

for property_id in $PROPERTY_IDS; do
    echo "Processing property: $property_id"
    
    # Update property to remove owner
    UPDATE_DATA='{
        "owner": null,
        "ownerId": null,
        "selectedOwnerId": null,
        "owner_name": null,
        "owner_email": null,
        "owner_phone": null
    }'
    
    RESPONSE=$(make_api_call "PUT" "$API_BASE_URL/properties/$property_id" "$UPDATE_DATA")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "✅ Successfully removed owner from property: $property_id"
        ((SUCCESS_COUNT++))
    else
        echo "❌ Failed to remove owner from property: $property_id"
        ((FAIL_COUNT++))
    fi
    
    # Small delay
    sleep 0.1
done

echo ""
echo "📊 Cleanup summary:"
echo "✅ Successfully updated: $SUCCESS_COUNT properties"
echo "❌ Failed to update: $FAIL_COUNT properties"
echo "📌 Property $KEEP_OWNER_PROPERTY_ID kept its owner"

echo ""
echo "🎉 Cleanup process completed!"
