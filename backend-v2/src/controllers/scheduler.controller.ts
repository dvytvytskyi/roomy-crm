import { Request, Response } from 'express';
import { SchedulerService } from '../services/scheduler.service';
import { AuthenticatedRequest, CurrentUser } from '../types';
import { CreateManualBlockDto } from '../types/dto';
import logger from '../utils/logger';

export class SchedulerController {
  /**
   * Get scheduler events (reservations and manual blocks)
   */
  public static async getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const filters = {
        propertyId: req.query.propertyId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        type: req.query.type ? (Array.isArray(req.query.type) ? req.query.type as string[] : [req.query.type as string]) : undefined,
      };

      logger.info(`Getting scheduler events for user ${currentUser.email} with filters:`, filters);

      const result = await SchedulerService.getEvents(currentUser, filters);

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
      logger.error('Error in getEvents controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving scheduler events',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create a manual block
   */
  public static async createBlock(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const { propertyId, startDate, endDate, title, notes } = req.body;

      // Validate required fields
      if (!propertyId || !startDate || !endDate || !title) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Missing required fields: propertyId, startDate, endDate, title',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Invalid date format',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'End date must be after start date',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const blockData: CreateManualBlockDto = {
        propertyId,
        startDate,
        endDate,
        title,
        notes
      };

      logger.info(`Creating manual block for user ${currentUser.email}:`, blockData);

      const result = await SchedulerService.createBlock(currentUser, blockData);

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
        message: 'Manual block created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in createBlock controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while creating manual block',
        timestamp: new Date().toISOString()
      });
    }
  }
}
