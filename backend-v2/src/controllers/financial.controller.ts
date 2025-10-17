import { Request, Response } from 'express';
import { FinancialService, FinancialFilters } from '../services/financial.service';
import { AuthenticatedRequest, CurrentUser } from '../types';
import logger from '../utils/logger';

export class FinancialController {
  /**
   * Get date range for period
   */
  private static getPeriodDates(period: string): { from: string; to: string } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (period) {
      case 'today':
        return {
          from: startOfDay.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        };
      
      case 'week':
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return {
          from: startOfWeek.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        };
      
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          from: startOfMonth.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        };
      
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        return {
          from: startOfQuarter.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        };
      
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return {
          from: startOfYear.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        };
      
      default:
        // Default to current month
        const defaultStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          from: defaultStartOfMonth.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        };
    }
  }

  /**
   * Get financial overview
   */
  public static async getFinancialOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      
      // Handle period parameter for quick date ranges
      let dateFrom = req.query.dateFrom as string;
      let dateTo = req.query.dateTo as string;
      const period = req.query.period as string;
      
      if (period && !dateFrom && !dateTo) {
        const dates = FinancialController.getPeriodDates(period);
        dateFrom = dates.from;
        dateTo = dates.to;
      }
      
      const filters: FinancialFilters = {
        dateFrom,
        dateTo,
        propertyId: req.query.propertyId as string,
        transactionType: req.query.transactionType ? (Array.isArray(req.query.transactionType) ? req.query.transactionType as string[] : [req.query.transactionType as string]) : undefined,
        paymentMethod: req.query.paymentMethod ? (Array.isArray(req.query.paymentMethod) ? req.query.paymentMethod as string[] : [req.query.paymentMethod as string]) : undefined,
        status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status as string[] : [req.query.status as string]) : undefined,
        platform: req.query.platform ? (Array.isArray(req.query.platform) ? req.query.platform as string[] : [req.query.platform as string]) : undefined,
      };

      logger.info(`Getting financial overview for user ${currentUser.email} with filters:`, filters);

      const result = await FinancialService.getFinancialOverview(currentUser, filters);

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
      logger.error('Error in getFinancialOverview controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving financial overview',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get KPI overview
   */
  public static async getKPIOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const filters: FinancialFilters = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        propertyId: req.query.propertyId as string,
      };

      logger.info(`Getting KPI overview for user ${currentUser.email} with filters:`, filters);

      const result = await FinancialService.getKPIOverview(currentUser, filters);

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
      logger.error('Error in getKPIOverview controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving KPI overview',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get units analytics
   */
  public static async getUnitsAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const filters: FinancialFilters = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        propertyId: req.query.propertyId as string,
      };

      logger.info(`Getting units analytics for user ${currentUser.email} with filters:`, filters);

      const result = await FinancialService.getUnitsAnalytics(currentUser, filters);

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
      logger.error('Error in getUnitsAnalytics controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving units analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get property-specific financial data
   */
  public static async getPropertyFinancialData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const propertyId = req.params.propertyId;
      const filters: FinancialFilters = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        propertyId: propertyId,
        transactionType: req.query.transactionType ? (Array.isArray(req.query.transactionType) ? req.query.transactionType as string[] : [req.query.transactionType as string]) : undefined,
        paymentMethod: req.query.paymentMethod ? (Array.isArray(req.query.paymentMethod) ? req.query.paymentMethod as string[] : [req.query.paymentMethod as string]) : undefined,
        status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status as string[] : [req.query.status as string]) : undefined,
        platform: req.query.platform ? (Array.isArray(req.query.platform) ? req.query.platform as string[] : [req.query.platform as string]) : undefined,
      };

      logger.info(`Getting property financial data for property ${propertyId} and user ${currentUser.email} with filters:`, filters);

      const result = await FinancialService.getPropertyFinancialData(currentUser, propertyId, filters);

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
      logger.error('Error in getPropertyFinancialData controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving property financial data',
        timestamp: new Date().toISOString()
      });
    }
  }
}
