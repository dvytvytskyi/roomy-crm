import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { BaseController } from './BaseController';
import { CreateUserDto, UpdateUserDto, UserRole, UserStatus, UserQueryParams } from '../types/dto';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export class UserController extends BaseController {
  /**
   * Test endpoint
   * GET /api/v2/users/test
   */
  public static test = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      UserController.success(res, { message: 'Test endpoint works!' }, 'Test successful');
    } catch (error) {
      UserController.error(res, error instanceof Error ? error : String(error), 500, 'Test failed');
    }
  };


  /**
   * Create user endpoint
   * POST /api/v2/users
   */
  public static createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        UserController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        role,
        status,
        avatar,
        country,
        flag
      } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        UserController.validationError(res, [], 'First name, last name, email, and password are required');
        return;
      }
      
      // Create user data object
      const userData: CreateUserDto = {
        firstName,
        lastName,
        email,
        password,
        phone,
        role,
        status,
        avatar,
        country,
        flag
      };
      
      // Call UserService.create
      const createResult = await UserService.create(currentUser, userData);
      
      if (!createResult.success || !createResult.data) {
        UserController.error(res, createResult.error || 'User creation failed', 400, createResult.message);
        return;
      }
      
      UserController.success(res, createResult.data, 'User created successfully', 201);
      return;
    } catch (error) {
      logger.error('Create user error:', error);
      UserController.error(res, error instanceof Error ? error : String(error), 500, 'User creation failed');
    }
  };

  /**
   * Get all users endpoint with RBAC
   * GET /api/v2/users
   */
  public static getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        UserController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      // Parse query parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const role = req.query.role as UserRole;
      const status = req.query.status as UserStatus;
      const search = req.query.search as string;

      // Validate role if provided
      if (role && !Object.values(UserRole).includes(role)) {
        UserController.validationError(res, [], `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`);
        return;
      }

      // Validate status if provided
      if (status && !Object.values(UserStatus).includes(status)) {
        UserController.validationError(res, [], `Invalid status. Must be one of: ${Object.values(UserStatus).join(', ')}`);
        return;
      }

      // Prepare query parameters
      const queryParams: UserQueryParams = {
        page,
        limit,
        ...(role && { role }),
        ...(status && { status }),
        ...(search && { search })
      };

      // Get users with RBAC
      const usersResult = await UserService.findAll(currentUser, queryParams);

      if (!usersResult.success || !usersResult.data) {
        UserController.error(res, usersResult.error || 'Failed to retrieve users', 500, usersResult.message);
        return;
      }

      // Log users retrieval
      logger.info(`Users retrieved: ${usersResult.data.data.length} users, page ${page}`);

      // Return users with pagination
      UserController.paginated(
        res,
        usersResult.data.data,
        usersResult.data.pagination,
        'Users retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all users error:', error);
      UserController.error(res, error, 500, 'Failed to retrieve users');
    }
  };

  /**
   * Get user by ID endpoint with RBAC
   * GET /api/v2/users/:id
   */
  public static getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        UserController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;

      if (!id) {
        UserController.validationError(res, [], 'User ID is required');
        return;
      }

      // Get user with RBAC
      const userResult = await UserService.findByIdWithRBAC(currentUser, id);

      if (!userResult.success) {
        if (userResult.error === 'Access denied') {
          UserController.error(res, 'Forbidden', 403, userResult.message);
          return;
        }
        UserController.notFound(res, 'User', 'User not found');
        return;
      }

      if (!userResult.data) {
        UserController.notFound(res, 'User', 'User not found');
        return;
      }

      // Log user retrieval
      logger.info(`User retrieved: ${userResult.data.email}`);

      // Return user
      UserController.success(res, userResult.data, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get user by ID error:', error);
      UserController.error(res, error, 500, 'Failed to retrieve user');
    }
  };

  /**
   * Update user endpoint
   * PUT /api/v2/users/:id
   */
  public static updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        UserController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        UserController.validationError(res, [], 'User ID is required');
        return;
      }

      // Validate role if provided
      if (updateData.role && !Object.values(UserRole).includes(updateData.role)) {
        UserController.validationError(res, [], `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`);
        return;
      }

      // Validate status if provided
      if (updateData.status && !Object.values(UserStatus).includes(updateData.status)) {
        UserController.validationError(res, [], `Invalid status. Must be one of: ${Object.values(UserStatus).join(', ')}`);
        return;
      }

      // Validate email format if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          UserController.validationError(res, [], 'Invalid email format');
          return;
        }
      }

      const userUpdateData: UpdateUserDto = updateData;

      // Update user
      const updateResult = await UserService.update(currentUser, id, userUpdateData);

      if (!updateResult.success || !updateResult.data) {
        UserController.error(res, updateResult.error || 'User update failed', 400, updateResult.message);
        return;
      }

      // Log user update
      logger.info(`User updated: ${updateResult.data.email}`);

      // Return updated user
      UserController.success(res, updateResult.data, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);
      UserController.error(res, error, 500, 'User update failed');
    }
  };

  /**
   * Delete user endpoint
   * DELETE /api/v2/users/:id
   */
  public static deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        UserController.validationError(res, [], 'User ID is required');
        return;
      }

      // Prevent self-deletion
      const currentUser = (req as AuthenticatedRequest).user;
      if (currentUser && currentUser.id === id) {
        UserController.error(res, 'Cannot delete your own account', 400, 'Self-deletion is not allowed');
        return;
      }

      // Delete user
      const deleteResult = await UserService.delete(id);

      if (!deleteResult.success || !deleteResult.data) {
        UserController.error(res, deleteResult.error || 'User deletion failed', 400, deleteResult.message);
        return;
      }

      // Log user deletion
      logger.info(`User deleted: ${deleteResult.data.email}`);

      // Return deleted user
      UserController.success(res, deleteResult.data, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error:', error);
      UserController.error(res, error, 500, 'User deletion failed');
    }
  };

  /**
   * Update user password endpoint
   * PUT /api/v2/users/:id/password
   */
  public static updateUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!id) {
        UserController.validationError(res, [], 'User ID is required');
        return;
      }

      if (!newPassword) {
        UserController.validationError(res, [], 'New password is required');
        return;
      }

      // Validate password length
      if (newPassword.length < 6) {
        UserController.validationError(res, [], 'Password must be at least 6 characters long');
        return;
      }

      // Update password
      const updateResult = await UserService.updatePassword(id, newPassword);

      if (!updateResult.success) {
        UserController.error(res, updateResult.error || 'Password update failed', 400, updateResult.message);
        return;
      }

      // Log password update
      logger.info(`Password updated for user ID: ${id}`);

      // Return success
      UserController.success(res, { success: true }, 'Password updated successfully');
    } catch (error) {
      logger.error('Update user password error:', error);
      UserController.error(res, error, 500, 'Password update failed');
    }
  };
}
