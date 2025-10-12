import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

import { config, validateConfig } from './config';
import { initSentry, sentryMiddleware, flushSentry } from './config/sentry';
import { sentryUserContext, sentryPerformanceContext } from './middleware/sentry.middleware';
import logger from './utils/logger';

// Initialize iCal importer service
import './services/ical-importer.service';

// Validate configuration on startup
validateConfig();

// Initialize Sentry before creating the Express app
initSentry();

const app = express();

// Sentry middleware (must be first)
app.use(sentryMiddleware.requestHandler);
app.use(sentryMiddleware.tracingHandler);
app.use(sentryUserContext);
app.use(sentryPerformanceContext);

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down middleware for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

// app.use(limiter); // Temporarily disabled for development
// app.use(speedLimiter); // Temporarily disabled for development

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.http(message.trim()),
  },
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: config.nodeEnv,
    port: config.port,
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import propertyRoutes from './routes/property.routes';
import reservationRoutes from './routes/reservation.routes';
import orchestratorRoutes from './routes/orchestrator.routes';
import taskRoutes from './routes/task.routes';
import financialRoutes from './routes/financial.routes';
import schedulerRoutes from './routes/scheduler.routes';
import settingsRoutes from './routes/settings.routes';
import webhookRoutes from './routes/webhook.routes';
import fileRoutes from './routes/file.routes';
import healthRoutes from './routes/health.routes';
import pricelabsRoutes from './routes/pricelabs.routes';
import airbnbRoutes from './routes/airbnb.routes';
import expenseRoutes from './routes/expense.routes';
import photoRoutes from './routes/photo.routes';
import documentRoutes from './routes/document.routes';
import amenityRoutes from './routes/amenity.routes';
import calendarRoutes from './routes/calendar.routes';

// API routes
app.get('/api/v2', (_req, res) => {
  res.status(200).json({
    message: 'Roomy Backend V2 API',
    version: '2.0.0',
    status: 'Active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/v2/auth',
      users: '/api/v2/users',
      properties: '/api/v2/properties',
      reservations: '/api/v2/reservations',
      orchestrator: '/api/v2/orchestrator',
      tasks: '/api/v2/tasks',
      financials: '/api/v2/financials',
      scheduler: '/api/v2/scheduler',
      webhooks: '/api/v2/webhooks',
      files: '/api/v2/files'
    },
  });
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Mount API routes
app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/users', userRoutes);
app.use('/api/v2/properties', propertyRoutes);
app.use('/api/v2/properties', expenseRoutes); // Expense routes nested under properties
app.use('/api/v2/properties', photoRoutes); // Photo routes nested under properties
app.use('/api/v2/properties', documentRoutes); // Document routes nested under properties
app.use('/api/v2/amenities', amenityRoutes);
app.use('/api/v2/reservations', reservationRoutes);
app.use('/api/v2/orchestrator', orchestratorRoutes);
app.use('/api/v2/tasks', taskRoutes);
app.use('/api/v2/financials', financialRoutes);
app.use('/api/v2/scheduler', schedulerRoutes);
app.use('/api/v2/settings', settingsRoutes);
app.use('/api/v2/webhooks', webhookRoutes);
app.use('/api/v2/files', fileRoutes);
app.use('/api/v2/integrations/pricelabs', pricelabsRoutes);
app.use('/api/v2/integrations/airbnb', airbnbRoutes);
app.use('/api/v2/calendar', calendarRoutes);
app.use('/health', healthRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
// Sentry error handler (must be before other error handlers)
app.use(sentryMiddleware.errorHandler);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`);
  
  // Don't leak error details in production
  const errorResponse: any = {
    error: 'Internal Server Error',
    message: config.isDevelopment ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  };

  if (config.isDevelopment) {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// Start server
const startServer = async () => {
  try {
    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    app.listen(config.port, () => {
      logger.info(`🚀 Roomy Backend V2 Server started on port ${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Frontend URL: ${config.frontendUrl}`);
      logger.info(`📝 Logs level: ${config.logging.level}`);
      logger.info(`🔗 Health check: http://localhost:${config.port}/health`);
      logger.info(`🔗 API endpoint: http://localhost:${config.port}/api/v2`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await flushSentry(2000);
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await flushSentry(2000);
  process.exit(0);
});

startServer();

export default app;
