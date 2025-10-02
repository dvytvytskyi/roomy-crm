#!/bin/bash

# Script to start backend server and keep it running forever
# This script will restart the server if it crashes

cd /Users/vytvytskyi/Desktop/roomy/backend-services

echo "🚀 Starting backend server in forever mode..."

while true; do
    echo "📅 $(date): Starting backend server..."
    
    # Start the server
    node simple-server.js
    
    # If we get here, the server crashed
    echo "❌ $(date): Server crashed, restarting in 5 seconds..."
    sleep 5
done
