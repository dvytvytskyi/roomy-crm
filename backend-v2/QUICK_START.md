# 🚀 Backend V2 Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend-v2
npm install
```

### 2. Setup Environment
```bash
# Copy environment template
cp env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/roomy_db_v2"
# JWT_SECRET="your-super-secret-jwt-key-for-v2-here"
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

### 4. Start Development Server
```bash
# Option 1: Use startup script
./start-v2.sh

# Option 2: Manual start
npm run dev
```

### 5. Verify Installation
- Health check: http://localhost:3002/health
- API info: http://localhost:3002/api/v2

## 🎯 What's Running

- **Backend V1**: Port 3001 (legacy, frozen)
- **Backend V2**: Port 3002 (new, active development)
- **Frontend**: Port 3000

## 📊 Expected Output

```
🚀 Roomy Backend V2 Server started on port 3002
📊 Environment: development
🌐 Frontend URL: http://localhost:3000
📝 Logs level: info
🔗 Health check: http://localhost:3002/health
🔗 API endpoint: http://localhost:3002/api/v2
```

## 🧪 Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Development Workflow

1. **Make changes** in `src/` directory
2. **Run tests** to ensure nothing breaks
3. **Check logs** in `logs/` directory
4. **Test endpoints** using the health check

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start               # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio

# Testing
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
```

## 🚨 Troubleshooting

### Port 3002 Already in Use
```bash
# Find process using port 3002
lsof -i :3002

# Kill the process
kill -9 <PID>
```

### Database Connection Issues
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### Permission Issues
```bash
# Make startup script executable
chmod +x start-v2.sh
```

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Read the full README.md** for detailed documentation
2. **Check BACKEND_V2_MIGRATION_PLAN.md** for migration strategy
3. **Explore the codebase** in `src/` directory
4. **Add your first feature** following the established patterns

## 🆘 Need Help?

- Check the logs in `logs/` directory
- Run tests to verify setup
- Read the full README.md
- Create an issue if problems persist

---

**🎉 Congratulations!** You now have Backend V2 running alongside Backend V1. All new development should happen in Backend V2.
