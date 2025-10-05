import { Request, Response, NextFunction } from 'express';
import { setUserContext, setTag, setContext } from '../config/sentry';
import { AuthenticatedRequest } from '../types';

/**
 * Sentry middleware for adding user context to error tracking
 */
export const sentryUserContext = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Add user context if user is authenticated
    if (req.user) {
      setUserContext({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      });

      // Add additional context
      setTag('user_role', req.user.role);
      setContext('user', {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.is_active,
        isVerified: req.user.isVerified,
      });
    }

    // Add request context
    setContext('request', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    // Add route context
    if (req.route) {
      setTag('route', req.route.path);
    }

    next();
  } catch (error) {
    // Don't let Sentry middleware errors break the request
    console.error('Sentry middleware error:', error);
    next();
  }
};

/**
 * Sentry middleware for adding performance context
 */
export const sentryPerformanceContext = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Add performance context
    setContext('performance', {
      startTime: Date.now(),
      memoryUsage: process.memoryUsage(),
    });

    // Track response time
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      setTag('response_time', duration.toString());
      setContext('response', {
        statusCode: res.statusCode,
        duration: duration,
        contentLength: res.get('Content-Length'),
      });
    });

    next();
  } catch (error) {
    console.error('Sentry performance middleware error:', error);
    next();
  }
};
