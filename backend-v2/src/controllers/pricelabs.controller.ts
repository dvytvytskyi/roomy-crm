import { Request, Response, NextFunction } from 'express';
import { PricelabsService } from '../services/pricelabs.service';
import logger from '../utils/logger';
import { CurrentUser } from '../types/dto';

export class PricelabsController {
  /**
   * Test endpoint to verify service is working
   * @route GET /api/v2/integrations/pricelabs/test
   * @access Private (JWT required)
   */
  public static test = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        PricelabsController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      console.log('[PricelabsController] Test endpoint called');
      const testResult = PricelabsService.test();
      console.log('[PricelabsController] Test result:', testResult);

      // Test getCurrentPrice method
      console.log('[PricelabsController] Testing getCurrentPrice method...');
      const priceResult = await PricelabsService.getCurrentPrice('test-id');
      console.log('[PricelabsController] getCurrentPrice result:', priceResult);

      PricelabsController.success(res, { 
        result: testResult,
        priceResult: priceResult
      }, 'Test completed');

    } catch (error: any) {
      logger.error('[PricelabsController] Test error:', error);
      PricelabsController.error(res, error, 500, 'Test failed');
    }
  };

  /**
   * Get all listings from PriceLabs
   * @route GET /api/v2/integrations/pricelabs/listings
   * @access Private (JWT required)
   */
  public static getAllListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        PricelabsController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      console.log(`[PricelabsController] Getting all PriceLabs listings, user: ${currentUser.email}`);
      logger.info(`[PricelabsController] Getting all PriceLabs listings, user: ${currentUser.email}`);

      // Отримуємо optional query параметри
      const skipHidden = req.query.skip_hidden === 'true';
      const onlySyncing = req.query.only_syncing_listings === 'true';

      console.log(`[PricelabsController] Query params - skipHidden: ${skipHidden}, onlySyncing: ${onlySyncing}`);

      // Викликаємо service method
      const result = await PricelabsService.getAllListings(skipHidden, onlySyncing);

      if (!result.success) {
        PricelabsController.error(res, result.error, 500, result.error || 'Failed to fetch listings from PriceLabs');
        return;
      }

      console.log(`[PricelabsController] Successfully retrieved ${result.data?.listings.length || 0} listings`);
      logger.info(`[PricelabsController] Successfully retrieved ${result.data?.listings.length || 0} listings`);

      PricelabsController.success(res, result.data, 'Listings retrieved successfully');

    } catch (error: any) {
      logger.error('[PricelabsController] Error getting listings:', error);
      PricelabsController.error(res, error, 500, 'Failed to get listings from PriceLabs');
    }
  };

  /**
   * Debug endpoint to check API key configuration
   * @route GET /api/v2/integrations/pricelabs/debug
   * @access Private (JWT required)
   */
  public static debug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        PricelabsController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const apiKey = process.env.PRICELABS_API_KEY;
      console.log(`[PricelabsController] Debug - API Key configured: ${apiKey ? 'YES' : 'NO'}`);
      console.log(`[PricelabsController] Debug - API Key length: ${apiKey ? apiKey.length : 0}`);
      console.log(`[PricelabsController] Debug - API Key preview: ${apiKey ? apiKey.substring(0, 10) + '...' : 'N/A'}`);

      PricelabsController.success(res, {
        apiKeyConfigured: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A'
      }, 'Debug information retrieved');

    } catch (error: any) {
      logger.error('[PricelabsController] Debug error:', error);
      PricelabsController.error(res, error, 500, 'Debug failed');
    }
  };

  /**
   * Get current price for a property from PriceLabs
   * @route GET /api/v2/integrations/pricelabs/prices/:id
   * @access Private (JWT required)
   * @param id - PriceLabs listing ID (pricelabId)
   */
  public static getCurrentPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        PricelabsController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      if (!id) {
        PricelabsController.validationError(res, [], 'PriceLabs ID is required');
        return;
      }

      console.log(`[PricelabsController] Getting price for PriceLabs ID: ${id}, user: ${currentUser.email}`);
      logger.info(`[PricelabsController] Getting price for PriceLabs ID: ${id}, user: ${currentUser.email}`);

      // Try to get price from PriceLabs using the pricelabId
      let priceResponse;
      try {
        console.log(`[PricelabsController] Calling PricelabsService.getCurrentPrice with ID: ${id}`);
        logger.info(`[PricelabsController] Calling PricelabsService.getCurrentPrice with ID: ${id}`);
        priceResponse = await PricelabsService.getCurrentPrice(id);
        console.log(`[PricelabsController] Price response type:`, typeof priceResponse);
        console.log(`[PricelabsController] Price response:`, priceResponse);
        logger.info(`[PricelabsController] Price response:`, priceResponse);
      } catch (serviceError: any) {
        console.log(`[PricelabsController] Service error caught:`, serviceError);
        logger.error(`[PricelabsController] Service error:`, serviceError);
        priceResponse = { success: false, error: serviceError.message };
      }

      if (priceResponse && priceResponse.success) {
        console.log(`[PricelabsController] Successfully retrieved price for property: ${id}`);
        PricelabsController.success(res, priceResponse.data, 'Price retrieved successfully');
      } else {
        const errorMessage = priceResponse?.error || 'Unknown error';
        console.log(`[PricelabsController] PriceLabs failed for property: ${id}, using fallback. Error: ${errorMessage}`);
        
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
