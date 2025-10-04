#!/bin/bash

# Roomy Backend V2 Startup Script
# This script starts the Backend V2 service on port 3002

echo "🚀 Starting Roomy Backend V2..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to the backend-v2 directory
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the backend-v2 directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file from env.example"
        echo "⚠️  Please update .env with your actual configuration before running the server."
    else
        echo "❌ env.example file not found. Please create a .env file manually."
        exit 1
    fi
fi

# Generate Prisma client if needed
echo "🔧 Generating Prisma client..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Set environment variables
export NODE_ENV=development
export PORT=3002

echo "🎯 Starting Backend V2 on port 3002..."
echo "📊 Environment: development"
echo "🔗 Health check: http://localhost:3002/health"
echo "🔗 API endpoint: http://localhost:3002/api/v2"
echo "📝 Logs: ./logs/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
