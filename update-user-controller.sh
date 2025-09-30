#!/bin/bash

# Simple script to update userController.ts on the server
# This removes role restrictions for user updates

SERVER_IP="5.223.55.121"
SERVER_USER="root"
BACKEND_PATH="/var/www/roomy-backend"

echo "🔧 Updating userController.ts to remove role restrictions..."

# Create backup
echo "💾 Creating backup..."
ssh $SERVER_USER@$SERVER_IP "cd $BACKEND_PATH && cp src/controllers/userController.ts src/controllers/userController.ts.backup"

# Upload modified file
echo "📤 Uploading modified userController.ts..."
scp backend-modifications/userController.ts $SERVER_USER@$SERVER_IP:$BACKEND_PATH/src/controllers/

# Restart backend
echo "🔄 Restarting backend..."
ssh $SERVER_USER@$SERVER_IP "pm2 restart roomy-backend"

# Check status
echo "📊 Checking backend status..."
ssh $SERVER_USER@$SERVER_IP "pm2 status roomy-backend"

echo "✅ Update completed!"
echo "🎯 Now any authenticated user can update owner data without role restrictions."
