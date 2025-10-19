import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { BaseController } from './BaseController';
import { CreateUserDto, UpdateUserDto, UserQueryParams, CreateBankAccountDto, UpdateBankAccountDto, CreateTransactionDto, UpdateTransactionDto, CreateDocumentDto, UpdateDocumentDto, CreateActivityLogDto } from '../types/dto';
import { UserRole, PrismaClient } from '@prisma/client';
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
        country,
        flag,
        nationality,
        dateOfBirth,
        whatsapp,
        telegram,
        comments,
        paymentPreferences,
        personalStayDays
      } = req.body;
      
      // Validate required fields (password is optional - will be auto-generated if not provided)
      if (!firstName || !lastName || !email) {
        UserController.validationError(res, [], 'First name, last name, and email are required');
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
        country,
        flag,
        nationality,
        dateOfBirth,
        whatsapp,
        telegram,
        comments,
        paymentPreferences,
        personalStayDays
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
      const status = req.query.status as string;
      const search = req.query.search as string;

      // Validate role if provided
      if (role && !Object.values(UserRole).includes(role)) {
        UserController.validationError(res, [], `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`);
        return;
      }

      // Validate status if provided
      if (status && !['ACTIVE', 'INACTIVE', 'SUSPENDED', 'VIP'].includes(status)) {
        UserController.validationError(res, [], `Invalid status. Must be one of: ACTIVE, INACTIVE, SUSPENDED, VIP`);
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

      logger.info(`[Get All Users] Query params:`, queryParams);


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
      
      console.log('🔍 updateUser: Received update data:', updateData);
      console.log('🔍 updateUser: Units in request:', updateData.units);

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
      if (updateData.status && !['ACTIVE', 'INACTIVE', 'SUSPENDED', 'VIP'].includes(updateData.status)) {
        UserController.validationError(res, [], `Invalid status. Must be one of: ACTIVE, INACTIVE, SUSPENDED, VIP`);
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

      // Validate date format if provided
      if (updateData.dateOfBirth) {
        const date = new Date(updateData.dateOfBirth);
        if (isNaN(date.getTime())) {
          UserController.validationError(res, [], 'Invalid date format');
          return;
        }
      }

      // Validate units if provided
      if (updateData.units !== undefined) {
        if (!Array.isArray(updateData.units)) {
          UserController.validationError(res, [], 'Units must be an array');
          return;
        }
        
        // Validate each unit
        for (const unit of updateData.units) {
          if (!unit.id || !unit.name || !unit.propertyId) {
            UserController.validationError(res, [], 'Each unit must have id, name, and propertyId');
            return;
          }
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
  public static deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      if (!currentUser) {
        UserController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      if (!id) {
        UserController.validationError(res, [], 'User ID is required');
        return;
      }

      // Deactivate user (soft delete)
      const deleteResult = await UserService.delete(currentUser, id);

      if (!deleteResult.success || !deleteResult.data) {
        UserController.error(res, deleteResult.error || 'User deactivation failed', 400, deleteResult.message);
        return;
      }

      // Log user deactivation
      logger.info(`User deactivated: ${deleteResult.data.email}`);

      // Return deactivated user
      UserController.success(res, deleteResult.data, 'User deactivated successfully');
    } catch (error) {
      logger.error('Delete user error:', error);
      UserController.error(res, error, 500, 'User deactivation failed');
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

  /**
   * Get user statistics
   * @route GET /api/v2/users/stats
   */
  public static async getUserStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;

      logger.info(`Getting user statistics for user ${currentUser.email}`);

      const result = await UserService.getStats(currentUser);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to retrieve user statistics', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`User statistics retrieved for user ${currentUser.email}`);
      UserController.success(res, result.data, 'User statistics retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserStats controller:', error);
      UserController.error(res, error, 500, 'An error occurred while retrieving user statistics');
    }
  }

  /**
   * Get user properties endpoint
   * GET /api/v2/users/:id/properties
   */
  public static getUserProperties = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;

      logger.info(`Getting properties for user ${userId} by ${currentUser.email}`);

      const result = await UserService.getUserProperties(currentUser, userId);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to retrieve user properties', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`User properties retrieved for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'User properties retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserProperties controller:', error);
      UserController.error(res, error, 500, 'An error occurred while retrieving user properties');
    }
  }

  /**
   * Link property to user endpoint
   * POST /api/v2/users/:id/properties
   */
  public static linkPropertyToUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const { propertyId } = req.body;

      if (!propertyId) {
        UserController.error(res, 'Property ID is required', 400, 'Property ID is required');
        return;
      }

      logger.info(`Linking property ${propertyId} to user ${userId} by ${currentUser.email}`);

      const result = await UserService.linkPropertyToUser(currentUser, userId, propertyId);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to link property to user', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Property ${propertyId} linked to user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Property linked to user successfully');
    } catch (error) {
      logger.error('Error in linkPropertyToUser controller:', error);
      UserController.error(res, error, 500, 'An error occurred while linking property to user');
    }
  }

  /**
   * Unlink property from user endpoint
   * DELETE /api/v2/users/:id/properties/:propertyId
   */
  public static unlinkPropertyFromUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const propertyId = req.params.propertyId;

      logger.info(`Unlinking property ${propertyId} from user ${userId} by ${currentUser.email}`);

      const result = await UserService.unlinkPropertyFromUser(currentUser, userId, propertyId);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to unlink property from user', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Property ${propertyId} unlinked from user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Property unlinked from user successfully');
    } catch (error) {
      logger.error('Error in unlinkPropertyFromUser controller:', error);
      UserController.error(res, error, 500, 'An error occurred while unlinking property from user');
    }
  }

  /**
   * Get user bank accounts endpoint
   * GET /api/v2/users/:id/bank-accounts
   */
  public static getUserBankAccounts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;

      logger.info(`Getting bank accounts for user ${userId} by ${currentUser.email}`);

      const result = await UserService.getUserBankAccounts(currentUser, userId);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to retrieve user bank accounts', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`User bank accounts retrieved for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'User bank accounts retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserBankAccounts controller:', error);
      UserController.error(res, error, 500, 'An error occurred while retrieving user bank accounts');
    }
  }

  /**
   * Create user bank account endpoint
   * POST /api/v2/users/:id/bank-accounts
   */
  public static createUserBankAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const bankAccountData: CreateBankAccountDto = req.body;

      logger.info(`Creating bank account for user ${userId} by ${currentUser.email}`);

      const result = await UserService.createUserBankAccount(currentUser, userId, bankAccountData);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to create user bank account', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Bank account created for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Bank account created successfully');
    } catch (error) {
      logger.error('Error in createUserBankAccount controller:', error);
      UserController.error(res, error, 500, 'An error occurred while creating user bank account');
    }
  }

  /**
   * Update user bank account endpoint
   * PUT /api/v2/users/:id/bank-accounts/:accountId
   */
  public static updateUserBankAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const accountId = req.params.accountId;
      const bankAccountData: UpdateBankAccountDto = req.body;

      logger.info(`Updating bank account ${accountId} for user ${userId} by ${currentUser.email}`);

      const result = await UserService.updateUserBankAccount(currentUser, userId, accountId, bankAccountData);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to update user bank account', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Bank account ${accountId} updated for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Bank account updated successfully');
    } catch (error) {
      logger.error('Error in updateUserBankAccount controller:', error);
      UserController.error(res, error, 500, 'An error occurred while updating user bank account');
    }
  }

  /**
   * Delete user bank account endpoint
   * DELETE /api/v2/users/:id/bank-accounts/:accountId
   */
  public static deleteUserBankAccount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const accountId = req.params.accountId;

      logger.info(`Deleting bank account ${accountId} for user ${userId} by ${currentUser.email}`);

      const result = await UserService.deleteUserBankAccount(currentUser, userId, accountId);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to delete user bank account', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Bank account ${accountId} deleted for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Bank account deleted successfully');
    } catch (error) {
      logger.error('Error in deleteUserBankAccount controller:', error);
      UserController.error(res, error, 500, 'An error occurred while deleting user bank account');
    }
  }

  /**
   * Get user transactions endpoint
   * GET /api/v2/users/:id/transactions
   */
  public static getUserTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;

      logger.info(`Getting transactions for user ${userId} by ${currentUser.email}`);

      const result = await UserService.getUserTransactions(currentUser, userId);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to retrieve user transactions', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`User transactions retrieved for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'User transactions retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserTransactions controller:', error);
      UserController.error(res, error, 500, 'An error occurred while retrieving user transactions');
    }
  }

  /**
   * Create user transaction endpoint
   * POST /api/v2/users/:id/transactions
   */
  public static createUserTransaction = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const transactionData: CreateTransactionDto = req.body;

      logger.info(`Creating transaction for user ${userId} by ${currentUser.email}`);

      const result = await UserService.createUserTransaction(currentUser, userId, transactionData);

      if (!result.success) {
        UserController.error(res, result.error || 'Failed to create user transaction', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Transaction created for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Transaction created successfully');
    } catch (error) {
      logger.error('Error in createUserTransaction controller:', error);
      UserController.error(res, error, 500, 'An error occurred while creating user transaction');
    }
  }

  /**
   * Get user documents endpoint
   * GET /api/v2/users/:id/documents
   */
  public static getUserDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      logger.info(`Getting documents for user ${userId} by ${currentUser.email}`);
      
      const result = await UserService.getUserDocuments(currentUser, userId);
      
      if (!result.success) {
        UserController.error(res, result.error || 'Failed to retrieve user documents', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`User documents retrieved for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'User documents retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserDocuments controller:', error);
      UserController.error(res, error, 500, 'An error occurred while retrieving user documents');
    }
  }

  /**
   * Create user document endpoint
   * POST /api/v2/users/:id/documents
   */
  public static createUserDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const documentData: CreateDocumentDto = req.body;
      logger.info(`Creating document for user ${userId} by ${currentUser.email}`);
      
      const result = await UserService.createUserDocument(currentUser, userId, documentData);
      
      if (!result.success) {
        UserController.error(res, result.error || 'Failed to create user document', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Document created for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Document created successfully');
    } catch (error) {
      logger.error('Error in createUserDocument controller:', error);
      UserController.error(res, error, 500, 'An error occurred while creating user document');
    }
  }

  /**
   * Update user document endpoint
   * PUT /api/v2/users/:id/documents/:documentId
   */
  public static updateUserDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const documentId = req.params.documentId;
      const documentData: UpdateDocumentDto = req.body;
      logger.info(`Updating document ${documentId} for user ${userId} by ${currentUser.email}`);
      
      const result = await UserService.updateUserDocument(currentUser, userId, documentId, documentData);
      
      if (!result.success) {
        UserController.error(res, result.error || 'Failed to update user document', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Document updated for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Document updated successfully');
    } catch (error) {
      logger.error('Error in updateUserDocument controller:', error);
      UserController.error(res, error, 500, 'An error occurred while updating user document');
    }
  }

  /**
   * Delete user document endpoint
   * DELETE /api/v2/users/:id/documents/:documentId
   */
  public static deleteUserDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const documentId = req.params.documentId;
      logger.info(`Deleting document ${documentId} for user ${userId} by ${currentUser.email}`);
      
      const result = await UserService.deleteUserDocument(currentUser, userId, documentId);
      
      if (!result.success) {
        UserController.error(res, result.error || 'Failed to delete user document', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Document deleted for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Document deleted successfully');
    } catch (error) {
      logger.error('Error in deleteUserDocument controller:', error);
      UserController.error(res, error, 500, 'An error occurred while deleting user document');
    }
  }

  /**
   * Get user activity log endpoint
   * GET /api/v2/users/:id/activity-log
   */
  public static getUserActivityLog = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      logger.info(`Getting activity log for user ${userId} by ${currentUser.email}`);
      
      const result = await UserService.getUserActivityLog(currentUser, userId);
      
      if (!result.success) {
        UserController.error(res, result.error || 'Failed to retrieve user activity log', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`User activity log retrieved for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'User activity log retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserActivityLog controller:', error);
      UserController.error(res, error, 500, 'An error occurred while retrieving user activity log');
    }
  }

  /**
   * Create user activity log entry endpoint
   * POST /api/v2/users/:id/activity-log
   */
  public static createUserActivityLog = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      const userId = req.params.id;
      const activityData: CreateActivityLogDto = req.body;
      logger.info(`Creating activity log entry for user ${userId} by ${currentUser.email}`);
      
      const result = await UserService.createUserActivityLog(currentUser, userId, activityData);
      
      if (!result.success) {
        UserController.error(res, result.error || 'Failed to create user activity log entry', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Activity log entry created for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'Activity log entry created successfully');
    } catch (error) {
      logger.error('Error in createUserActivityLog controller:', error);
      UserController.error(res, error, 500, 'An error occurred while creating user activity log entry');
    }
  }

  /**
   * Get user statistics endpoint
   * GET /api/v2/users/stats
   */
  public static getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        UserController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { role } = req.query;
      logger.info(`Getting user statistics for role: ${role} by ${currentUser.email}`);
      
      const result = await UserService.getUserStats(currentUser, role as any);
      
      if (!result.success) {
        UserController.error(res, result.error || 'Failed to get user statistics', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`User statistics retrieved for role: ${role} by ${currentUser.email}`);
      UserController.success(res, result.data, 'User statistics retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserStats controller:', error);
      UserController.error(res, error, 500, 'An error occurred while getting user statistics');
    }
  }

  /**
   * Get user detail statistics endpoint
   * GET /api/v2/users/{id}/stats
   */
  public static getUserDetailStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        UserController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const userId = req.params.id;
      logger.info(`Getting user detail statistics for user ${userId} by ${currentUser.email}`);
      
      const result = await UserService.getUserDetailStats(currentUser, userId);
      
      if (!result.success) {
        UserController.error(res, result.error || 'Failed to get user detail statistics', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`User detail statistics retrieved for user ${userId} by ${currentUser.email}`);
      UserController.success(res, result.data, 'User detail statistics retrieved successfully');
    } catch (error) {
      logger.error('Error in getUserDetailStats controller:', error);
      UserController.error(res, error, 500, 'An error occurred while getting user detail statistics');
    }
  }
}
