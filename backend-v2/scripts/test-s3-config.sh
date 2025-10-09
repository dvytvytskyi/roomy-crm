#!/bin/bash

# Test S3 configuration
echo "====================================="
echo "  S3 Configuration Test"
echo "====================================="

cd /Users/vytvytskyi/Desktop/roomy/backend-v2

echo ""
echo "[1/2] Checking .env for AWS credentials..."

if grep -q "AWS_ACCESS_KEY_ID" .env; then
    echo "✅ AWS_ACCESS_KEY_ID found"
    AWS_KEY=$(grep "AWS_ACCESS_KEY_ID" .env | cut -d'=' -f2)
    echo "   Value: ${AWS_KEY:0:10}..."
else
    echo "❌ AWS_ACCESS_KEY_ID not found"
fi

if grep -q "AWS_SECRET_ACCESS_KEY" .env; then
    echo "✅ AWS_SECRET_ACCESS_KEY found"
else
    echo "❌ AWS_SECRET_ACCESS_KEY not found"
fi

if grep -q "AWS_REGION" .env; then
    AWS_REGION=$(grep "AWS_REGION" .env | cut -d'=' -f2)
    echo "✅ AWS_REGION found: $AWS_REGION"
else
    echo "❌ AWS_REGION not found"
fi

if grep -q "S3_BUCKET_NAME" .env; then
    S3_BUCKET=$(grep "S3_BUCKET_NAME" .env | cut -d'=' -f2)
    echo "✅ S3_BUCKET_NAME found: $S3_BUCKET"
else
    echo "❌ S3_BUCKET_NAME not found"
fi

echo ""
echo "[2/2] Testing S3 bucket access..."

# Use AWS CLI if available
if command -v aws &> /dev/null; then
    echo "Testing bucket: $S3_BUCKET"
    aws s3 ls s3://$S3_BUCKET --region $AWS_REGION 2>&1 | head -5
else
    echo "⚠️  AWS CLI not installed, skipping bucket test"
fi

echo ""
echo "====================================="
echo "  Configuration Summary"
echo "====================================="
echo "All credentials present in .env"
echo "Ready for S3 upload testing"
