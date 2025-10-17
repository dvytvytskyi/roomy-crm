import { Request, Response } from 'express';
import { AnalyticsService, AnalyticsFilters } from '../services/analytics-mock.service';
import { AuthenticatedRequest, CurrentUser } from '../types';
import logger from '../utils/logger';

export class AnalyticsController {
  /**
   * Get date range for period
   */
  private static getPeriodDates(period: string): { from: string; to: string } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (period) {
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
   * Get analytics overview
   */
  public static async getAnalyticsOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      
      // Handle period parameter for quick date ranges
      let dateFrom = req.query.dateFrom as string;
      let dateTo = req.query.dateTo as string;
      const period = req.query.period as string;
      
      if (period && !dateFrom && !dateTo) {
        const dates = AnalyticsController.getPeriodDates(period);
        dateFrom = dates.from;
        dateTo = dates.to;
      }
      
      const filters: AnalyticsFilters = {
        dateFrom,
        dateTo,
        period: period as any,
        propertyId: req.query.propertyId as string,
        viewMode: req.query.viewMode as 'chart' | 'table',
      };

      logger.info(`Getting analytics overview for user ${currentUser.email} with filters:`, filters);

      const result = await AnalyticsService.getAnalyticsOverview(currentUser, filters);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting analytics overview:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get analytics overview',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get financial analytics
   */
  public static async getFinancialAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      
      let dateFrom = req.query.dateFrom as string;
      let dateTo = req.query.dateTo as string;
      const period = req.query.period as string;
      
      if (period && !dateFrom && !dateTo) {
        const dates = AnalyticsController.getPeriodDates(period);
        dateFrom = dates.from;
        dateTo = dates.to;
      }
      
      const filters: AnalyticsFilters = {
        dateFrom,
        dateTo,
        period: period as any,
        propertyId: req.query.propertyId as string,
        viewMode: req.query.viewMode as 'chart' | 'table',
      };

      logger.info(`Getting financial analytics for user ${currentUser.email} with filters:`, filters);

      const result = await AnalyticsService.getFinancialAnalytics(currentUser, filters);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting financial analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get financial analytics',
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
      
      let dateFrom = req.query.dateFrom as string;
      let dateTo = req.query.dateTo as string;
      const period = req.query.period as string;
      
      if (period && !dateFrom && !dateTo) {
        const dates = AnalyticsController.getPeriodDates(period);
        dateFrom = dates.from;
        dateTo = dates.to;
      }
      
      const filters: AnalyticsFilters = {
        dateFrom,
        dateTo,
        period: period as any,
        propertyId: req.query.propertyId as string,
        viewMode: req.query.viewMode as 'chart' | 'table',
      };

      logger.info(`Getting units analytics for user ${currentUser.email} with filters:`, filters);

      const result = await AnalyticsService.getUnitsAnalytics(currentUser, filters);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting units analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get units analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get owners analytics
   */
  public static async getOwnersAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      
      let dateFrom = req.query.dateFrom as string;
      let dateTo = req.query.dateTo as string;
      const period = req.query.period as string;
      
      if (period && !dateFrom && !dateTo) {
        const dates = AnalyticsController.getPeriodDates(period);
        dateFrom = dates.from;
        dateTo = dates.to;
      }
      
      const filters: AnalyticsFilters = {
        dateFrom,
        dateTo,
        period: period as any,
        propertyId: req.query.propertyId as string,
        viewMode: req.query.viewMode as 'chart' | 'table',
      };

      logger.info(`Getting owners analytics for user ${currentUser.email} with filters:`, filters);

      const result = await AnalyticsService.getOwnersAnalytics(currentUser, filters);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting owners analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get owners analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get reservations analytics
   */
  public static async getReservationsAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      
      let dateFrom = req.query.dateFrom as string;
      let dateTo = req.query.dateTo as string;
      const period = req.query.period as string;
      
      if (period && !dateFrom && !dateTo) {
        const dates = AnalyticsController.getPeriodDates(period);
        dateFrom = dates.from;
        dateTo = dates.to;
      }
      
      const filters: AnalyticsFilters = {
        dateFrom,
        dateTo,
        period: period as any,
        propertyId: req.query.propertyId as string,
        viewMode: req.query.viewMode as 'chart' | 'table',
      };

      logger.info(`Getting reservations analytics for user ${currentUser.email} with filters:`, filters);

      const result = await AnalyticsService.getReservationsAnalytics(currentUser, filters);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting reservations analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get reservations analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get agents analytics
   */
  public static async getAgentsAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      
      let dateFrom = req.query.dateFrom as string;
      let dateTo = req.query.dateTo as string;
      const period = req.query.period as string;
      
      if (period && !dateFrom && !dateTo) {
        const dates = AnalyticsController.getPeriodDates(period);
        dateFrom = dates.from;
        dateTo = dates.to;
      }
      
      const filters: AnalyticsFilters = {
        dateFrom,
        dateTo,
        period: period as any,
        propertyId: req.query.propertyId as string,
        viewMode: req.query.viewMode as 'chart' | 'table',
      };

      logger.info(`Getting agents analytics for user ${currentUser.email} with filters:`, filters);

      const result = await AnalyticsService.getAgentsAnalytics(currentUser, filters);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting agents analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get agents analytics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get reports
   */
  public static async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;

      logger.info(`Getting reports for user ${currentUser.email}`);

      const result = await AnalyticsService.getReports(currentUser);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting reports:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get reports',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate report
   */
  public static async generateReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const reportData = req.body;

      logger.info(`Generating report for user ${currentUser.email}:`, reportData);

      const result = await AnalyticsService.generateReport(currentUser, reportData);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Report generated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate report',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Export analytics
   */
  public static async exportAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const exportData = req.body;

      logger.info(`Exporting analytics for user ${currentUser.email}:`, exportData);

      const result = await AnalyticsService.exportAnalytics(currentUser, exportData);

      if (exportData.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${Date.now()}.csv"`);
        res.send(result);
      } else {
        res.status(200).json({
          success: true,
          data: result,
          message: 'Analytics exported successfully',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      logger.error('Error exporting analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to export analytics',
        timestamp: new Date().toISOString()
      });
    }
  }
}
