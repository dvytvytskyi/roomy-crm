#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏨 Starting Roomy Reservations System...${NC}\n"

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if ports are available
echo -e "${YELLOW}🔍 Checking ports...${NC}"

if check_port 3000; then
    echo -e "${RED}❌ Port 3000 is already in use (Frontend)${NC}"
    echo -e "${YELLOW}💡 Please stop the process using port 3000 or change the port${NC}"
    exit 1
fi

if check_port 3001; then
    echo -e "${RED}❌ Port 3001 is already in use (Backend)${NC}"
    echo -e "${YELLOW}💡 Please stop the process using port 3001 or change the port${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ports 3000 and 3001 are available${NC}\n"

# Start Backend
echo -e "${BLUE}🚀 Starting Backend Services...${NC}"
cd backend-services

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from example...${NC}"
    cp env.example .env
    echo -e "${YELLOW}📝 Please update .env file with your configuration${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Build if needed
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}🔨 Building backend...${NC}"
    npm run build
fi

# Start backend in background
echo -e "${GREEN}✅ Starting backend server on port 3001...${NC}"
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Go back to root directory
cd ..

# Start Frontend
echo -e "${BLUE}🚀 Starting Frontend...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend
echo -e "${GREEN}✅ Starting frontend server on port 3000...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait for both servers to start
echo -e "${YELLOW}⏳ Waiting for servers to start...${NC}"
sleep 5

# Test connection
echo -e "${BLUE}🧪 Testing connection...${NC}"
node test-reservation-connection.js

echo -e "\n${GREEN}🎉 Reservations System Started Successfully!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:3001${NC}"
echo -e "${BLUE}📊 API: http://localhost:3001/api${NC}"
echo -e "${BLUE}❤️  Health: http://localhost:3001/health${NC}"

echo -e "\n${YELLOW}📝 To stop the servers:${NC}"
echo -e "   kill $BACKEND_PID $FRONTEND_PID"
echo -e "   or press Ctrl+C"

# Keep script running
wait
