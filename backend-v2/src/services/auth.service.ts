import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { LoginDto, UserResponseDto, AuthResponseDto, JwtPayload } from '../types/dto';
import { UserService } from './user.service';
import { config } from '../config';
import logger from '../utils/logger';

export class AuthService extends BaseService {
  private static instance: AuthService;

  private constructor() {
    super();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Validate user credentials
   */
  public static async validateUser(email: string, password: string): Promise<ServiceResponse<UserResponseDto | null>> {
    try {
      // Find user by email
      const userResult = await UserService.findByEmail(email);
      
      if (!userResult.success || !userResult.data) {
        logger.warn(`Login attempt with non-existent email: ${email}`);
        return AuthService.prototype.success(null, 'Invalid credentials');
      }

      const user = userResult.data;

      // Get the full user with password hash from database
      const prisma = new PrismaClient();
      const fullUser = await prisma.user.findUnique({
        where: { email },
      });
      await prisma.$disconnect();

      if (!fullUser) {
        return AuthService.prototype.success(null, 'Invalid credentials');
      }

      // Check if user account is active
      if (!fullUser.is_active) {
        logger.warn(`Login attempt with inactive account: ${email}`);
        return AuthService.prototype.error(
          'Account is not active',
          'Your account is currently inactive. Please contact support.'
        );
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, fullUser.password);
      
      if (!isPasswordValid) {
        logger.warn(`Invalid password attempt for user: ${email}`);
        return AuthService.prototype.success(null, 'Invalid credentials');
      }

      // Update last login time
      await UserService.updateLastLogin(user.id);

      logger.info(`User logged in successfully: ${email}`);
      return AuthService.prototype.success(user, 'User validated successfully');
    } catch (error) {
      logger.error('Error validating user:', error);
      return AuthService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Login user and generate JWT token
   */
  public static async login(user: UserResponseDto): Promise<ServiceResponse<AuthResponseDto>> {
    try {
      // Generate JWT token
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      });

      const authResponse: AuthResponseDto = {
        user,
        token,
        expiresIn: config.jwt.expiresIn,
      };

      logger.info(`JWT token generated for user: ${user.email}`);
      return AuthService.prototype.success(authResponse, 'Login successful');
    } catch (error) {
      logger.error('Error generating JWT token:', error);
      return AuthService.prototype.error(
        'Token generation failed',
        'Failed to generate authentication token'
      );
    }
  }

  /**
   * Complete login process (validate + generate token)
   */
  public static async loginWithCredentials(loginData: LoginDto): Promise<ServiceResponse<AuthResponseDto>> {
    try {
      // Validate user credentials
      const validationResult = await AuthService.validateUser(loginData.email, loginData.password);
      
      if (!validationResult.success || !validationResult.data) {
        return AuthService.prototype.error(
          'Authentication failed',
          validationResult.message || 'Invalid email or password'
        );
      }

      // Generate JWT token
      const loginResult = await AuthService.login(validationResult.data);
      
      if (!loginResult.success || !loginResult.data) {
        return AuthService.prototype.error(
          'Token generation failed',
          'Failed to generate authentication token'
        );
      }

      logger.info(`User login completed successfully: ${loginData.email}`);
      return AuthService.prototype.success(loginResult.data, 'Login successful');
    } catch (error) {
      logger.error('Error in login process:', error);
      return AuthService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Verify JWT token
   */
  public static async verifyToken(token: string): Promise<ServiceResponse<JwtPayload>> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      // Verify user still exists and is active
      const userResult = await UserService.findById(decoded.userId);
      
      if (!userResult.success || !userResult.data) {
        return AuthService.prototype.error(
          'User not found',
          'User associated with token no longer exists'
        );
      }

      const user = userResult.data;
      
      if (user.status !== 'ACTIVE') {
        return AuthService.prototype.error(
          'Account inactive',
          'User account is no longer active'
        );
      }

      // Update token payload with current user data
      const updatedPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      return AuthService.prototype.success(updatedPayload, 'Token verified successfully');
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return AuthService.prototype.error(
          'Invalid token',
          'The provided token is invalid or expired'
        );
      }
      
      logger.error('Error verifying token:', error);
      return AuthService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Refresh JWT token
   */
  public static async refreshToken(token: string): Promise<ServiceResponse<AuthResponseDto>> {
    try {
      // Verify current token
      const verificationResult = await AuthService.verifyToken(token);
      
      if (!verificationResult.success || !verificationResult.data) {
        return AuthService.prototype.error(
          'Token refresh failed',
          verificationResult.message || 'Invalid token'
        );
      }

      const payload = verificationResult.data;

      // Get current user data
      const userResult = await UserService.findById(payload.userId);
      
      if (!userResult.success || !userResult.data) {
        return AuthService.prototype.error(
          'User not found',
          'User associated with token no longer exists'
        );
      }

      // Generate new token
      const loginResult = await AuthService.login(userResult.data);
      
      if (!loginResult.success || !loginResult.data) {
        return AuthService.prototype.error(
          'Token refresh failed',
          'Failed to generate new authentication token'
        );
      }

      logger.info(`Token refreshed for user: ${userResult.data.email}`);
      return AuthService.prototype.success(loginResult.data, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return AuthService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Logout user (invalidate token on client side)
   */
  public static async logout(userId: string): Promise<ServiceResponse<boolean>> {
    try {
      // In a real application, you might want to:
      // 1. Add the token to a blacklist
      // 2. Update user's last logout time
      // 3. Log the logout event
      
      logger.info(`User logged out: ${userId}`);
      return AuthService.prototype.success(true, 'Logout successful');
    } catch (error) {
      logger.error('Error during logout:', error);
      return AuthService.prototype.error(
        'Logout failed',
        'An error occurred during logout'
      );
    }
  }

  /**
   * Change user password
   */
  public static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      // Get user with password hash
      const prisma = new PrismaClient();
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      await prisma.$disconnect();

      if (!user) {
        return AuthService.prototype.error('User not found', 'User does not exist');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      
      if (!isCurrentPasswordValid) {
        return AuthService.prototype.error(
          'Invalid current password',
          'The current password is incorrect'
        );
      }

      // Update password
      const updateResult = await UserService.updatePassword(userId, newPassword);
      
      if (!updateResult.success) {
        return AuthService.prototype.error(
          'Password update failed',
          updateResult.message || 'Failed to update password'
        );
      }

      logger.info(`Password changed for user: ${user.email}`);
      return AuthService.prototype.success(true, 'Password changed successfully');
    } catch (error) {
      logger.error('Error changing password:', error);
      return AuthService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Generate password reset token (for future implementation)
   */
  public static async generatePasswordResetToken(email: string): Promise<ServiceResponse<string>> {
    try {
      // Check if user exists
      const userResult = await UserService.findByEmail(email);
      
      if (!userResult.success || !userResult.data) {
        // Don't reveal if user exists or not for security
        return AuthService.prototype.error(
          'Reset token generation failed',
          'If the email exists, a reset token has been generated'
        );
      }

      // Generate reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { email, type: 'password_reset' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      logger.info(`Password reset token generated for: ${email}`);
      return AuthService.prototype.success(resetToken, 'Password reset token generated');
    } catch (error) {
      logger.error('Error generating password reset token:', error);
      return AuthService.prototype.handleDatabaseError(error);
    }
  }
}
