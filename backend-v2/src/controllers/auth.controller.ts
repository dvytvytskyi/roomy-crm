import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { BaseController } from './BaseController';
import { LoginDto, UserResponseDto } from '../types/dto';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export class AuthController extends BaseController {
  /**
   * User login endpoint
   * POST /api/v2/auth/login
   */
  public static login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      const { email, password } = req.body;

      if (!email || !password) {
        AuthController.prototype.validationError(res, [], 'Email and password are required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        AuthController.prototype.validationError(res, [], 'Invalid email format');
        return;
      }

      // Validate password length
      if (password.length < 6) {
        AuthController.prototype.validationError(res, [], 'Password must be at least 6 characters long');
        return;
      }

      const loginData: LoginDto = { email, password };

      // Authenticate user
      const authResult = await AuthService.loginWithCredentials(loginData);

      if (!authResult.success || !authResult.data) {
        AuthController.prototype.unauthorized(res, authResult.message || 'Invalid email or password');
        return;
      }

      // Log successful login
      logger.info(`User logged in successfully: ${email}`);

      // Return success response
      AuthController.prototype.success(res, authResult.data, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      AuthController.prototype.error(res, error, 500, 'Login failed');
    }
  };

  /**
   * Get user profile endpoint
   * GET /api/v2/auth/me
   */
  public static getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User should be attached by auth middleware
      if (!req.user) {
        AuthController.prototype.unauthorized(res, 'User not authenticated');
        return;
      }

      // Get fresh user data from database
      const userResult = await UserService.findById(req.user.id);

      if (!userResult.success || !userResult.data) {
        AuthController.prototype.notFound(res, 'User', 'User profile not found');
        return;
      }

      // Log profile access
      logger.info(`User profile accessed: ${req.user.email}`);

      // Return user profile
      AuthController.prototype.success(res, userResult.data, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile error:', error);
      AuthController.prototype.error(res, error, 500, 'Failed to retrieve profile');
    }
  };

  /**
   * Refresh token endpoint
   * POST /api/v2/auth/refresh
   */
  public static refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        AuthController.prototype.validationError(res, [], 'Token is required');
        return;
      }

      // Refresh the token
      const refreshResult = await AuthService.refreshToken(token);

      if (!refreshResult.success || !refreshResult.data) {
        AuthController.prototype.unauthorized(res, refreshResult.message || 'Invalid token');
        return;
      }

      // Log token refresh
      logger.info(`Token refreshed for user: ${refreshResult.data.user.email}`);

      // Return new token
      AuthController.prototype.success(res, refreshResult.data, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Refresh token error:', error);
      AuthController.prototype.error(res, error, 500, 'Token refresh failed');
    }
  };

  /**
   * Logout endpoint
   * POST /api/v2/auth/logout
   */
  public static logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        AuthController.prototype.unauthorized(res, 'User not authenticated');
        return;
      }

      // Perform logout
      const logoutResult = await AuthService.logout(req.user.id);

      if (!logoutResult.success) {
        AuthController.prototype.error(res, logoutResult.error || 'Logout failed', 500);
        return;
      }

      // Log logout
      logger.info(`User logged out: ${req.user.email}`);

      // Return success response
      AuthController.prototype.success(res, { success: true }, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      AuthController.prototype.error(res, error, 500, 'Logout failed');
    }
  };

  /**
   * Change password endpoint
   * PUT /api/v2/auth/change-password
   */
  public static changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        AuthController.prototype.unauthorized(res, 'User not authenticated');
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        AuthController.prototype.validationError(res, [], 'Current password and new password are required');
        return;
      }

      // Validate new password
      if (newPassword.length < 6) {
        AuthController.prototype.validationError(res, [], 'New password must be at least 6 characters long');
        return;
      }

      // Change password
      const changeResult = await AuthService.changePassword(req.user.id, currentPassword, newPassword);

      if (!changeResult.success) {
        AuthController.prototype.error(res, changeResult.error || 'Password change failed', 400);
        return;
      }

      // Log password change
      logger.info(`Password changed for user: ${req.user.email}`);

      // Return success response
      AuthController.prototype.success(res, { success: true }, 'Password changed successfully');
    } catch (error) {
      logger.error('Change password error:', error);
      AuthController.prototype.error(res, error, 500, 'Password change failed');
    }
  };

  /**
   * Verify token endpoint
   * GET /api/v2/auth/verify
   */
  public static verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        AuthController.prototype.unauthorized(res, 'Authorization header with Bearer token is required');
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const verifyResult = await AuthService.verifyToken(token);

      if (!verifyResult.success || !verifyResult.data) {
        AuthController.prototype.unauthorized(res, verifyResult.message || 'Invalid token');
        return;
      }

      // Return token payload
      AuthController.prototype.success(res, verifyResult.data, 'Token is valid');
    } catch (error) {
      logger.error('Verify token error:', error);
      AuthController.prototype.error(res, error, 500, 'Token verification failed');
    }
  };
}
