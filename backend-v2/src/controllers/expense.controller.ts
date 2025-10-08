import { Request, Response } from 'express';
import { ExpenseService, CreateExpenseDto, UpdateExpenseDto } from '../services/expense.service';
import { CurrentUser } from '../types/dto';
import logger from '../utils/logger';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: CurrentUser;
}

export class ExpenseController {
  /**
   * Get all expenses for a property
   * @route GET /api/v2/properties/:propertyId/expenses
   * @access Private (JWT required)
   */
  public static async getExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { propertyId } = req.params;

      if (!propertyId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Property ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Getting expenses for property: ${propertyId}, user: ${currentUser.email}`);

      const service = ExpenseService.getInstance();
      const result = await service.getExpensesByProperty(propertyId, currentUser);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getExpenses controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving expenses',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create a new expense
   * @route POST /api/v2/properties/:propertyId/expenses
   * @access Private (JWT required)
   */
  public static async createExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { propertyId } = req.params;
      const expenseData: CreateExpenseDto = {
        ...req.body,
        property_id: propertyId
      };

      logger.info(`Creating expense for property: ${propertyId}, user: ${currentUser.email}`);

      const service = ExpenseService.getInstance();
      const result = await service.createExpense(expenseData, currentUser);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Expense created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in createExpense controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while creating expense',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update an expense
   * @route PUT /api/v2/properties/:propertyId/expenses/:id
   * @access Private (JWT required)
   */
  public static async updateExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateExpenseDto = req.body;

      logger.info(`Updating expense: ${id}, user: ${currentUser.email}`);

      const service = ExpenseService.getInstance();
      const result = await service.updateExpense(id, updateData, currentUser);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Expense updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in updateExpense controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while updating expense',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete an expense
   * @route DELETE /api/v2/properties/:propertyId/expenses/:id
   * @access Private (JWT required)
   */
  public static async deleteExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { id } = req.params;

      logger.info(`Deleting expense: ${id}, user: ${currentUser.email}`);

      const service = ExpenseService.getInstance();
      const result = await service.deleteExpense(id, currentUser);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Expense deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in deleteExpense controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while deleting expense',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get total expenses for a property
   * @route GET /api/v2/properties/:propertyId/expenses/total
   * @access Private (JWT required)
   */
  public static async getTotalExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { propertyId } = req.params;
      const { dateFrom, dateTo } = req.query;

      logger.info(`Getting total expenses for property: ${propertyId}, user: ${currentUser.email}`);

      const service = ExpenseService.getInstance();
      const result = await service.getTotalExpenses(
        propertyId,
        dateFrom as string,
        dateTo as string
      );

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getTotalExpenses controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while calculating total expenses',
        timestamp: new Date().toISOString()
      });
    }
  }
}
