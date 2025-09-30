#!/bin/bash

# Backend Deployment Script
# This script deploys the modified backend files to the server

set -e  # Exit on any error

SERVER_IP="5.223.55.121"
SERVER_USER="root"
BACKEND_PATH="/var/www/roomy-backend"
LOCAL_MODIFICATIONS="backend-modifications"

echo "🚀 Starting backend deployment..."

# Check if local modifications directory exists
if [ ! -d "$LOCAL_MODIFICATIONS" ]; then
    echo "❌ Error: $LOCAL_MODIFICATIONS directory not found!"
    exit 1
fi

echo "📁 Local modifications directory found: $LOCAL_MODIFICATIONS"

# Create backup of current backend
echo "💾 Creating backup of current backend..."
ssh $SERVER_USER@$SERVER_IP "cd $BACKEND_PATH && cp -r src src_backup_\$(date +%Y%m%d_%H%M%S)"

# Deploy modified files
echo "📤 Deploying modified files..."

# Deploy controllers
echo "  📄 Deploying authController.ts..."
scp $LOCAL_MODIFICATIONS/authController.ts $SERVER_USER@$SERVER_IP:$BACKEND_PATH/src/controllers/

echo "  📄 Deploying userController.ts..."
scp $LOCAL_MODIFICATIONS/userController.ts $SERVER_USER@$SERVER_IP:$BACKEND_PATH/src/controllers/

# Deploy routes
echo "  📄 Deploying authRoutes.ts..."
scp $LOCAL_MODIFICATIONS/authRoutes.ts $SERVER_USER@$SERVER_IP:$BACKEND_PATH/src/routes/

echo "  📄 Deploying userRoutes.ts..."
scp $LOCAL_MODIFICATIONS/userRoutes.ts $SERVER_USER@$SERVER_IP:$BACKEND_PATH/src/routes/

# Deploy validation schemas
echo "  📄 Deploying validationSchemas.ts..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $BACKEND_PATH/src/validation"
scp $LOCAL_MODIFICATIONS/validationSchemas.ts $SERVER_USER@$SERVER_IP:$BACKEND_PATH/src/validation/

# Deploy seed script
echo "  📄 Deploying seed-admin.ts..."
scp $LOCAL_MODIFICATIONS/seed-admin.ts $SERVER_USER@$SERVER_IP:$BACKEND_PATH/

# Install dependencies if needed
echo "📦 Installing dependencies..."
ssh $SERVER_USER@$SERVER_IP "cd $BACKEND_PATH && npm install"

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
ssh $SERVER_USER@$SERVER_IP "cd $BACKEND_PATH && npm run build"

# Create admin user
echo "👑 Creating admin user..."
ssh $SERVER_USER@$SERVER_IP "cd $BACKEND_PATH && npx ts-node seed-admin.ts"

# Restart backend
echo "🔄 Restarting backend..."
ssh $SERVER_USER@$SERVER_IP "pm2 restart roomy-backend"

# Check status
echo "📊 Checking backend status..."
ssh $SERVER_USER@$SERVER_IP "pm2 status roomy-backend"

echo "✅ Backend deployment completed successfully!"
echo ""
echo "🧪 Testing deployment..."

# Test admin login
echo "🔐 Testing admin login..."
ADMIN_RESPONSE=$(curl -s -X POST http://$SERVER_IP:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@roomy.com", "password": "admin123"}')

if echo "$ADMIN_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Admin login successful!"
    ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "🎫 Admin token: ${ADMIN_TOKEN:0:50}..."
else
    echo "❌ Admin login failed!"
    echo "Response: $ADMIN_RESPONSE"
fi

echo ""
echo "🎉 Deployment completed!"
echo "📋 Available accounts:"
echo "👑 Admin: admin@roomy.com / admin123"
echo "👨‍💼 Manager: manager@roomy.com / manager123"
echo "👨‍💻 Agent: agent@roomy.com / agent123"
echo "🏠 Owner: owner@roomy.com / owner123"
echo ""
echo "🌐 Backend URL: http://$SERVER_IP:3001"
echo "📚 API Documentation: http://$SERVER_IP:3001/api-docs"
