import { Request, Response, NextFunction } from 'express';
import { PricelabsService } from '../services/pricelabs.service';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth';

export class PricelabsController {
  /**
   * Get current price for a property from PriceLabs
   * @route GET /api/v2/integrations/pricelabs/prices/:id
   * @access Private (JWT required)
   */
  public static getCurrentPrice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        PricelabsController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      if (!id) {
        PricelabsController.validationError(res, [], 'Property ID is required');
        return;
      }

      logger.info(`[PricelabsController] Getting price for property: ${id}, user: ${currentUser.email}`);

      // Try to get price from PriceLabs
      const priceResponse = await PricelabsService.getCurrentPrice(id);

      if (priceResponse.success) {
        logger.info(`[PricelabsController] Successfully retrieved price for property: ${id}`);
        PricelabsController.success(res, priceResponse.data, 'Price retrieved successfully');
      } else {
        logger.warn(`[PricelabsController] PriceLabs failed for property: ${id}, using fallback. Error: ${priceResponse.error}`);
        
        // Use fallback price if PriceLabs fails
        const fallbackResponse = PricelabsService.getFallbackPrice(id);
        PricelabsController.success(res, fallbackResponse.data, 'Fallback price retrieved');
      }

    } catch (error) {
      logger.error('[PricelabsController] Error getting price:', error);
      PricelabsController.error(res, error, 500, 'Failed to get price');
    }
  };

  /**
   * Success response helper
   */
  private static success(res: Response, data: any, message: string): void {
    res.status(200).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Error response helper
   */
  private static error(res: Response, error: any, statusCode: number, message: string): void {
    logger.error(`[PricelabsController] Error: ${message}`, error);
    res.status(statusCode).json({
      success: false,
      error: message,
      message: typeof error === 'string' ? error : error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Validation error response helper
   */
  private static validationError(res: Response, errors: string[], message: string): void {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }
}
