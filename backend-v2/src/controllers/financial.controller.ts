import { Request, Response } from 'express';
import { FinancialService, FinancialFilters } from '../services/financial.service';
import { AuthenticatedRequest, CurrentUser } from '../types';
import logger from '../utils/logger';

export class FinancialController {
  /**
   * Get financial overview
   */
  public static async getFinancialOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const filters: FinancialFilters = {
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
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
}
