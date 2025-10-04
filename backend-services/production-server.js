#!/usr/bin/env node

/**
 * Production Server for Roomy CRM
 * 
 * This server implements the production-ready architecture with:
 * - Unified User system with roles
 * - Property-Location relationships
 * - Reservation as core entity
 * - Unified Task management
 * - Immutable Transaction system
 * - Proper error handling and logging
 * - Rate limiting and security
 * - No hardcoded data
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Import middleware and utilities
const logger = require('./utils/logger');
const { generalLimiter, authLimiter, speedLimiter } = require('./middleware/rateLimiter');
const s3Service = require('./s3-service');

// Import business services
const reservationService = require('./src/services/ReservationService');
const financialService = require('./src/services/FinancialService');
const notificationService = require('./src/services/NotificationService');
const taskOrchestrator = require('./src/services/TaskOrchestrator');
const sagaOrchestrator = require('./src/services/SagaOrchestrator');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Environment validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT',
  'NODE_ENV'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);
app.use(speedLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isVerified: true,
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or inactive user' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'A record with this information already exists',
          error: { code: err.code, field: err.meta?.target }
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Record not found',
          error: { code: err.code }
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Database operation failed',
          error: { code: err.code }
        });
    }
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const paginate = (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  return { skip, take: parseInt(limit) };
};

const createSuccessResponse = (data, message = 'Success', pagination = null) => {
  const response = {
    success: true,
    data,
    message
  };
  
  if (pagination) {
    response.pagination = pagination;
  }
  
  return response;
};

const createErrorResponse = (message, statusCode = 500, error = null) => {
  return {
    success: false,
    message,
    error: error ? { ...error, statusCode } : { statusCode }
  };
};

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Login endpoint
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createErrorResponse(
        'Email and password are required', 
        400
      ));
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json(createErrorResponse(
        'Invalid email or password', 
        401
      ));
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json(createErrorResponse(
        'Invalid email or password', 
        401
      ));
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json(createErrorResponse(
        'Account is inactive', 
        401
      ));
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data without password
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified
    };

    res.json(createSuccessResponse({
      user: userData,
      token
    }, 'Login successful'));

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(createErrorResponse('Login failed'));
  }
});

// Register endpoint
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'GUEST' } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json(createErrorResponse(
        'Email, password, first name, and last name are required', 
        400
      ));
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json(createErrorResponse(
        'Password must be at least 8 characters long', 
        400
      ));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json(createErrorResponse(
        'User with this email already exists', 
        409
      ));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        role: role.toUpperCase(),
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json(createSuccessResponse({
      user,
      token
    }, 'Registration successful'));

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json(createErrorResponse('Registration failed'));
  }
});

// ============================================================================
// PRODUCTION API ROUTES
// ============================================================================

// Health check
app.get('/api/production/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json(createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    }, 'Service is healthy'));
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json(createErrorResponse('Service unhealthy', 503));
  }
});

// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================

// Get all users
app.get('/api/production/users', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, search } = req.query;
    const { skip, take } = paginate(page, limit);

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    res.json(createSuccessResponse(users, 'Users retrieved successfully', pagination));

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve users'));
  }
});

// Get user by ID
app.get('/api/production/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can access this data
    if (req.user.id !== id && !['ADMIN', 'MANAGER'].includes(req.user.role)) {
      return res.status(403).json(createErrorResponse('Access denied', 403));
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        country: true,
        flag: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json(createErrorResponse('User not found', 404));
    }

    res.json(createSuccessResponse(user, 'User retrieved successfully'));

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve user'));
  }
});

// Create user
app.post('/api/production/users', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'GUEST', status = 'ACTIVE' } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json(createErrorResponse(
        'Email, password, first name, and last name are required', 
        400
      ));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json(createErrorResponse(
        'User with this email already exists', 
        409
      ));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        role: role.toUpperCase(),
        status: status.toUpperCase()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        country: true,
        flag: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json(createSuccessResponse(user, 'User created successfully'));

  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json(createErrorResponse('Failed to create user'));
  }
});

// Update user
app.put('/api/production/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check permissions
    if (req.user.id !== id && !['ADMIN', 'MANAGER'].includes(req.user.role)) {
      return res.status(403).json(createErrorResponse('Access denied', 403));
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.passwordHash;
    delete updateData.id;
    delete updateData.createdAt;

    // If updating password, hash it
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 12);
      delete updateData.password;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        country: true,
        flag: true,
        isVerified: true,
        lastLoginAt: true,
        updatedAt: true
      }
    });

    res.json(createSuccessResponse(user, 'User updated successfully'));

  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json(createErrorResponse('Failed to update user'));
  }
});

// Delete user
app.delete('/api/production/users/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json(createErrorResponse('Cannot delete your own account', 400));
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json(createErrorResponse('User not found', 404));
    }

    // Soft delete by setting status to INACTIVE
    await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });

    res.json(createSuccessResponse(true, 'User deactivated successfully'));

  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json(createErrorResponse('Failed to delete user'));
  }
});

  // ============================================================================
  // BUSINESS PROCESS ORCHESTRATION ROUTES
  // ============================================================================

  // Confirm reservation (complex business process)
  app.post('/api/production/reservations/:id/confirm', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const confirmData = req.body;

      const result = await reservationService.confirmReservation(id, confirmData);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Confirm reservation error:', error);
      res.status(500).json(createErrorResponse('Failed to confirm reservation'));
    }
  });

  // Check-in reservation
  app.post('/api/production/reservations/:id/check-in', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const checkInData = req.body;

      const result = await reservationService.checkInReservation(id, checkInData);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Check-in reservation error:', error);
      res.status(500).json(createErrorResponse('Failed to check-in reservation'));
    }
  });

  // Cancel reservation
  app.post('/api/production/reservations/:id/cancel', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const cancelData = req.body;

      const result = await reservationService.cancelReservation(id, cancelData);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Cancel reservation error:', error);
      res.status(500).json(createErrorResponse('Failed to cancel reservation'));
    }
  });

  // Process guest payment
  app.post('/api/production/reservations/:id/payment', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const paymentData = req.body;

      const result = await financialService.processGuestPayment(id, paymentData);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Process payment error:', error);
      res.status(500).json(createErrorResponse('Failed to process payment'));
    }
  });

  // Process owner payout
  app.post('/api/production/transactions/:id/payout', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
      const { id } = req.params;
      const payoutData = req.body;

      const result = await financialService.processOwnerPayout(id, payoutData);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Process payout error:', error);
      res.status(500).json(createErrorResponse('Failed to process payout'));
    }
  });

  // Complete task
  app.post('/api/production/tasks/:id/complete', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const completionData = req.body;

      const result = await taskOrchestrator.completeTask(id, completionData);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Complete task error:', error);
      res.status(500).json(createErrorResponse('Failed to complete task'));
    }
  });

  // Get financial summary
  app.get('/api/production/financial/summary', authenticateToken, async (req, res) => {
    try {
      const { propertyId, startDate, endDate } = req.query;
      const dateRange = { startDate, endDate };

      const result = await financialService.getPropertyFinancialSummary(propertyId, dateRange);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Get financial summary error:', error);
      res.status(500).json(createErrorResponse('Failed to get financial summary'));
    }
  });

  // Get income distribution settings
  app.get('/api/production/financial/income-distribution', authenticateToken, async (req, res) => {
    try {
      const result = await financialService.getIncomeDistributionSettings();

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Get income distribution error:', error);
      res.status(500).json(createErrorResponse('Failed to get income distribution'));
    }
  });

  // Update income distribution settings
  app.put('/api/production/financial/income-distribution', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
      const settings = req.body;

      const result = await financialService.updateIncomeDistributionSettings(settings);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Update income distribution error:', error);
      res.status(500).json(createErrorResponse('Failed to update income distribution'));
    }
  });

  // Get task statistics
  app.get('/api/production/tasks/statistics', authenticateToken, async (req, res) => {
    try {
      const { propertyId, startDate, endDate } = req.query;
      const dateRange = { startDate, endDate };

      const result = await taskOrchestrator.getTaskStatistics(propertyId, dateRange);

      if (result.success) {
        res.json(createSuccessResponse(result.data, result.message));
      } else {
        res.status(400).json(createErrorResponse(result.error, 400));
      }
    } catch (error) {
      logger.error('Get task statistics error:', error);
      res.status(500).json(createErrorResponse('Failed to get task statistics'));
    }
  });

  // Get saga status
  app.get('/api/production/sagas/:name/status', authenticateToken, async (req, res) => {
    try {
      const { name } = req.params;
      const status = sagaOrchestrator.getSagaStatus(name);

      if (status) {
        res.json(createSuccessResponse(status, 'Saga status retrieved successfully'));
      } else {
        res.status(404).json(createErrorResponse('Saga not found', 404));
      }
    } catch (error) {
      logger.error('Get saga status error:', error);
      res.status(500).json(createErrorResponse('Failed to get saga status'));
    }
  });

  // List all sagas
  app.get('/api/production/sagas', authenticateToken, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
      const sagas = sagaOrchestrator.listSagas();
      res.json(createSuccessResponse(sagas, 'Sagas retrieved successfully'));
    } catch (error) {
      logger.error('List sagas error:', error);
      res.status(500).json(createErrorResponse('Failed to list sagas'));
    }
  });

  // ============================================================================
  // PROPERTY MANAGEMENT ROUTES
  // ============================================================================

// Get all properties
app.get('/api/production/properties', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, ownerId, locationId, search } = req.query;
    const { skip, take } = paginate(page, limit);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (ownerId) where.ownerId = ownerId;
    if (locationId) where.locationId = locationId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true
            }
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          photos: {
            select: {
              id: true,
              url: true,
              isCover: true
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.property.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    res.json(createSuccessResponse(properties, 'Properties retrieved successfully', pagination));

  } catch (error) {
    logger.error('Get properties error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve properties'));
  }
});

// Get property by ID
app.get('/api/production/properties/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            country: true,
            flag: true
          }
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        },
        reservations: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            totalAmount: true,
            guestName: true
          },
          orderBy: { checkInDate: 'desc' },
          take: 10
        }
      }
    });

    if (!property) {
      return res.status(404).json(createErrorResponse('Property not found', 404));
    }

    // Check if user can access this property
    if (property.ownerId !== req.user.id && 
        property.agentId !== req.user.id && 
        !['ADMIN', 'MANAGER'].includes(req.user.role)) {
      return res.status(403).json(createErrorResponse('Access denied', 403));
    }

    res.json(createSuccessResponse(property, 'Property retrieved successfully'));

  } catch (error) {
    logger.error('Get property error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve property'));
  }
});

// ============================================================================
// LOCATION MANAGEMENT ROUTES
// ============================================================================

// Get all locations
app.get('/api/production/locations', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 100, city, country, search } = req.query;
    const { skip, take } = paginate(page, limit);

    // Build where clause
    const where = { isActive: true };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' }
      }),
      prisma.location.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    res.json(createSuccessResponse(locations, 'Locations retrieved successfully', pagination));

  } catch (error) {
    logger.error('Get locations error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve locations'));
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(createErrorResponse('Endpoint not found', 404));
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close Prisma connection
    await prisma.$disconnect();
    logger.info('Database connection closed');
    
    // Close server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  logger.info(`🚀 Production server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  logger.info(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
