import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { CurrentUser } from '../types/dto';
import SettingsService from '../services/settings.service';
import logger from '../utils/logger';

export class SettingsController {
  /**
   * Get all settings
   * GET /api/v2/settings
   */
  public static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;

      logger.info(`[Settings Controller] Getting all settings for user ${currentUser.id}`);

      // Check permissions - only ADMIN and MANAGER can view settings
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only ADMIN and MANAGER can view settings',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await SettingsService.getAll();

      if (!result.success) {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: result.error || 'An error occurred while retrieving settings',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`[Settings Controller] Retrieved ${result.data!.settings.length} settings`);

      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Settings retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error(`[Settings Controller] Error getting all settings: ${error.message}`, error);

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving settings',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get setting by key
   * GET /api/v2/settings/{key}
   */
  public static async getByKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      const key = req.params['key'];

      logger.info(`[Settings Controller] Getting setting ${key} for user ${currentUser.id}`);

      // Check permissions - only ADMIN and MANAGER can view settings
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only ADMIN and MANAGER can view settings',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate input
      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Setting key is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await SettingsService.get(key);

      if (!result.success) {
        const statusCode = result.error === 'Setting not found' ? 404 : 500;
        res.status(statusCode).json({
          success: false,
          error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
          message: result.error || 'An error occurred while retrieving setting',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`[Settings Controller] Retrieved setting: ${key}`);

      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Setting retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error(`[Settings Controller] Error getting setting: ${error.message}`, error);

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving setting',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update setting by key
   * PUT /api/v2/settings/{key}
   */
  public static async updateByKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;
      const key = req.params['key'];
      const { value } = req.body;

      logger.info(`[Settings Controller] Updating setting ${key} for user ${currentUser.id}`);

      // Check permissions - only ADMIN can update settings
      if (currentUser.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only ADMIN can update settings',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate input
      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Setting key is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (value === undefined || value === null) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Setting value is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await SettingsService.update(key, { value: String(value) });

      if (!result.success) {
        let statusCode = 500;
        let errorMessage = 'Internal Server Error';

        if (result.error === 'Setting not found') {
          statusCode = 404;
          errorMessage = 'Setting not found';
        } else if (result.error === 'Setting is not editable') {
          statusCode = 400;
          errorMessage = 'Setting is not editable';
        } else if (result.error?.startsWith('Invalid value')) {
          statusCode = 400;
          errorMessage = result.error;
        }

        res.status(statusCode).json({
          success: false,
          error: statusCode === 404 ? 'Not Found' : statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
          message: errorMessage,
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`[Settings Controller] Updated setting: ${key}`);

      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Setting updated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error(`[Settings Controller] Error updating setting: ${error.message}`, error);

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while updating setting',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Initialize default settings (Admin only)
   * POST /api/v2/settings/initialize
   */
  public static async initialize(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;

      logger.info(`[Settings Controller] Initializing settings for user ${currentUser.id}`);

      // Check permissions - only ADMIN can initialize settings
      if (currentUser.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only ADMIN can initialize settings',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await SettingsService.initializeDefaults();

      logger.info(`[Settings Controller] Settings initialized successfully`);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Default settings initialized successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error(`[Settings Controller] Error initializing settings: ${error.message}`, error);

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while initializing settings',
        timestamp: new Date().toISOString()
      });
    }
  }
}
