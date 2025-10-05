import { Request, Response } from 'express';
import { getSentryHealth } from '../config/sentry';
import { config } from '../config';
import logger from '../utils/logger';

export class HealthController {
  /**
   * Basic health check endpoint
   */
  public static async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: config.version,
        memory: process.memoryUsage(),
        sentry: getSentryHealth(),
      };

      res.status(200).json(health);
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  }

  /**
   * Detailed health check with database connectivity
   */
  public static async getDetailedHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: config.version,
        memory: process.memoryUsage(),
        sentry: getSentryHealth(),
        database: {
          status: 'connected',
          // Add database health checks here if needed
        },
        services: {
          logger: 'operational',
          sentry: getSentryHealth().enabled ? 'operational' : 'disabled',
        },
      };

      res.status(200).json(health);
    } catch (error) {
      logger.error('Detailed health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
      });
    }
  }

  /**
   * Sentry test endpoint (for testing error reporting)
   */
  public static async testSentry(req: Request, res: Response): Promise<void> {
    try {
      const { captureError, captureMessage } = await import('../config/sentry');
      
      // Test error capture
      const testError = new Error('This is a test error from Sentry test endpoint');
      captureError(testError, {
        test: true,
        endpoint: '/health/sentry-test',
        timestamp: new Date().toISOString(),
      });

      // Test message capture
      captureMessage('Sentry test message', 'info', {
        test: true,
        endpoint: '/health/sentry-test',
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'Sentry test completed - check your Sentry dashboard',
        timestamp: new Date().toISOString(),
        sentry: getSentryHealth(),
      });
    } catch (error) {
      logger.error('Sentry test error:', error);
      res.status(500).json({
        success: false,
        error: 'Sentry test failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
