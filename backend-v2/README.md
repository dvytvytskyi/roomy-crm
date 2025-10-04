# Roomy Backend V2

Next Generation Backend Service for Roomy Property Management System

## 🚀 Features

- **Modern Architecture**: Built with TypeScript, Express.js, and Prisma
- **Production Ready**: Comprehensive logging, error handling, and security
- **Scalable**: Modular design with clean separation of concerns
- **Well Tested**: Full test coverage with Jest
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication system
- **Logging**: Winston with daily rotation
- **Security**: Helmet, CORS, rate limiting, and input validation

## 📁 Project Structure

```
backend-v2/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── __tests__/       # Test files
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── logs/                # Log files (auto-created)
├── dist/                # Compiled JavaScript (auto-created)
└── coverage/            # Test coverage reports (auto-created)
```

## 🛠️ Installation

1. **Clone and navigate to the project:**
   ```bash
   cd backend-v2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Production with PM2
```bash
npm run build
npm run production
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

## 📊 Database Management

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3002` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | Database connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

### Port Configuration

- **Backend V1**: Port 3001 (legacy)
- **Backend V2**: Port 3002 (new)
- **Frontend**: Port 3000

## 📝 API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api/v2` - API information

### Authentication
- `POST /api/v2/auth/login` - User login
- `POST /api/v2/auth/register` - User registration
- `POST /api/v2/auth/refresh` - Refresh token
- `POST /api/v2/auth/logout` - User logout

### Users
- `GET /api/v2/users` - List users
- `GET /api/v2/users/:id` - Get user by ID
- `POST /api/v2/users` - Create user
- `PUT /api/v2/users/:id` - Update user
- `DELETE /api/v2/users/:id` - Delete user

### Properties
- `GET /api/v2/properties` - List properties
- `GET /api/v2/properties/:id` - Get property by ID
- `POST /api/v2/properties` - Create property
- `PUT /api/v2/properties/:id` - Update property
- `DELETE /api/v2/properties/:id` - Delete property

### Reservations
- `GET /api/v2/reservations` - List reservations
- `GET /api/v2/reservations/:id` - Get reservation by ID
- `POST /api/v2/reservations` - Create reservation
- `PUT /api/v2/reservations/:id` - Update reservation
- `DELETE /api/v2/reservations/:id` - Delete reservation

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Request validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt password hashing

## 📈 Monitoring & Logging

- **Winston**: Structured logging
- **Daily Rotation**: Automatic log rotation
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Request timing
- **Health Checks**: System health monitoring

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t roomy-backend-v2 .

# Run container
docker run -p 3002:3002 roomy-backend-v2
```

### PM2
```bash
# Start with PM2
pm2 start dist/index.js --name "roomy-backend-v2"

# Monitor
pm2 monit
```

## 🔄 Migration from V1

This backend is designed to run alongside the existing V1 backend:

1. **V1 Backend**: Continues running on port 3001
2. **V2 Backend**: Runs on port 3002
3. **Gradual Migration**: Migrate endpoints one by one
4. **Database**: Can use the same database or separate schema

## 📚 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Write comprehensive tests
- Document all public APIs

### Git Workflow
- Feature branches for new features
- Pull requests for code review
- Automated testing on CI/CD

### Error Handling
- Use custom error classes
- Log all errors appropriately
- Return consistent error responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This is Backend V2 - the next generation of the Roomy backend service. It runs on port 3002 and is designed to eventually replace Backend V1 (port 3001) after thorough testing and migration.
