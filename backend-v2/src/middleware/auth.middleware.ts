import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to req.user
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authorization header with Bearer token is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verify token
    const verifyResult = await AuthService.verifyToken(token);

    if (!verifyResult.success || !verifyResult.data) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: verifyResult.message || 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const payload = verifyResult.data;

    // Get fresh user data from database
    const userResult = await UserService.findById(payload.userId);

    if (!userResult.success || !userResult.data) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const user = userResult.data;

    // Check if user account is still active
    if (user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Account is not active',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    // Log successful authentication
    logger.info(`User authenticated: ${user.email} (${user.role})`);

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication failed',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if the authenticated user has one of the required roles
 */
export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(`Access denied for user ${req.user.email} with role ${req.user.role}. Required roles: ${allowedRoles.join(', ')}`);
        
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Log successful authorization
      logger.info(`User authorized: ${req.user.email} with role ${req.user.role}`);

      next();
    } catch (error) {
      logger.error('Role check middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Authorization check failed',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * Admin-only Middleware
 * Shortcut for admin role check
 */
export const requireAdmin = checkRole([UserRole.ADMIN]);

/**
 * Manager and Admin Middleware
 * Allows access for MANAGER and ADMIN roles
 */
export const requireManagerOrAdmin = checkRole([UserRole.ADMIN, UserRole.MANAGER]);

/**
 * Agent and above Middleware
 * Allows access for AGENT, MANAGER, and ADMIN roles
 */
export const requireAgentOrAbove = checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT]);

/**
 * Optional Authentication Middleware
 * Authenticates if token is provided, but doesn't fail if missing
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      // Empty token, continue without authentication
      next();
      return;
    }

    // Verify token
    const verifyResult = await AuthService.verifyToken(token);

    if (!verifyResult.success || !verifyResult.data) {
      // Invalid token, continue without authentication
      next();
      return;
    }

    const payload = verifyResult.data;

    // Get user data
    const userResult = await UserService.findById(payload.userId);

    if (!userResult.success || !userResult.data) {
      // User not found, continue without authentication
      next();
      return;
    }

    const user = userResult.data;

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    logger.info(`Optional auth - User authenticated: ${user.email} (${user.role})`);

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    // On error, continue without authentication
    next();
  }
};

/**
 * Self or Admin Middleware
 * Allows access if user is accessing their own data or is admin
 */
export const requireSelfOrAdmin = (userIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const targetUserId = req.params[userIdParam];
      const currentUserId = req.user.id;
      const isAdmin = req.user.role === UserRole.ADMIN;

      if (currentUserId !== targetUserId && !isAdmin) {
        logger.warn(`Access denied for user ${req.user.email} trying to access user ${targetUserId}`);
        
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied. You can only access your own data',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info(`Self or admin access granted for user ${req.user.email} to user ${targetUserId}`);

      next();
    } catch (error) {
      logger.error('Self or admin middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Authorization check failed',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * Rate Limiting Middleware for Auth Endpoints
 * Prevents brute force attacks on login endpoints
 */
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const clientId = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();

      // Clean up expired entries
      for (const [key, value] of attempts.entries()) {
        if (now > value.resetTime) {
          attempts.delete(key);
        }
      }

      const clientAttempts = attempts.get(clientId);

      if (!clientAttempts) {
        // First attempt
        attempts.set(clientId, {
          count: 1,
          resetTime: now + windowMs,
        });
        next();
        return;
      }

      if (now > clientAttempts.resetTime) {
        // Reset window
        attempts.set(clientId, {
          count: 1,
          resetTime: now + windowMs,
        });
        next();
        return;
      }

      if (clientAttempts.count >= maxAttempts) {
        logger.warn(`Rate limit exceeded for IP: ${clientId}`);
        
        res.status(429).json({
          success: false,
          error: 'Too Many Requests',
          message: `Too many authentication attempts. Please try again in ${Math.ceil((clientAttempts.resetTime - now) / 1000)} seconds`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Increment attempt count
      clientAttempts.count++;

      next();
    } catch (error) {
      logger.error('Rate limiting middleware error:', error);
      next(); // Continue on error
    }
  };
};
