import { Request, Response, NextFunction } from 'express';
import { AirbnbService } from '../services/airbnb.service';
import { PropertyService } from '../services/property.service';
import logger from '../utils/logger';
import { CurrentUser } from '../types/dto';

export class AirbnbController {
  /**
   * Import property from Airbnb URL
   * @route POST /api/v2/integrations/airbnb/import-from-url
   * @access Private (JWT required)
   * @body { "url": "https://www.airbnb.com/rooms/...", "ownerId": "user-id", "agentId": "agent-id" (optional) }
   */
  public static importFromUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUser = (req as any).user as CurrentUser;
      if (!currentUser) {
        AirbnbController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      console.log('[AirbnbController] ===== IMPORT FROM URL START =====');
      logger.info(`[AirbnbController] Import from URL request by user: ${currentUser.email}`);

      // Validate request body
      const { url, ownerId: requestedOwnerId, agentId: requestedAgentId } = req.body;

      if (!url) {
        AirbnbController.validationError(res, ['url is required'], 'Missing required field: url');
        return;
      }

      // Set owner and agent IDs based on user role
      let ownerId = currentUser.id; // Default to current user
      let agentId: string | undefined = undefined;

      // If user is ADMIN or MANAGER, they can specify ownerId in request body
      if ((currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') && requestedOwnerId) {
        ownerId = requestedOwnerId;
      }

      // If user is ADMIN or MANAGER, they can specify agentId in request body
      if ((currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') && requestedAgentId) {
        agentId = requestedAgentId;
      }

      console.log(`[AirbnbController] Request data:`, { url, ownerId, agentId });
      logger.info(`[AirbnbController] Import request - URL: ${url}, Owner: ${ownerId}, Agent: ${agentId || 'none'}`);

      // Step 1: Validate Airbnb URL
      console.log(`[AirbnbController] Step 1: Validating Airbnb URL...`);
      if (!AirbnbService.validateAirbnbUrl(url)) {
        console.log(`[AirbnbController] Invalid Airbnb URL: ${url}`);
        AirbnbController.validationError(
          res,
          ['url must be a valid Airbnb listing URL'],
          'Invalid Airbnb URL. Please provide a valid URL like: https://www.airbnb.com/rooms/123456'
        );
        return;
      }

      console.log(`[AirbnbController] URL validated successfully`);
      logger.info(`[AirbnbController] URL validation passed: ${url}`);

      // Step 2: Check permissions - only ADMIN, MANAGER, and OWNER can import properties
      console.log(`[AirbnbController] Step 2: Checking permissions...`);
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.role !== 'OWNER') {
        console.log(`[AirbnbController] Permission denied for user role: ${currentUser.role}`);
        AirbnbController.error(
          res,
          'Forbidden',
          403,
          'Only ADMIN, MANAGER, and OWNER roles can import properties'
        );
        return;
      }

      // If user is OWNER, they can only import for themselves
      if (currentUser.role === 'OWNER' && ownerId !== currentUser.id) {
        console.log(`[AirbnbController] OWNER ${currentUser.id} tried to import for different owner ${ownerId}`);
        AirbnbController.error(
          res,
          'Forbidden',
          403,
          'OWNER role can only import properties for themselves'
        );
        return;
      }

      console.log(`[AirbnbController] Permission check passed`);
      logger.info(`[AirbnbController] Permission check passed for user: ${currentUser.email}`);

      // Step 3: Scrape Airbnb listing data
      console.log(`[AirbnbController] Step 3: Scraping Airbnb listing...`);
      logger.info(`[AirbnbController] Starting Airbnb scraping for URL: ${url}`);
      
      const scrapingResult = await AirbnbService.scrapeListing(url);

      if (!scrapingResult.success || !scrapingResult.data) {
        console.log(`[AirbnbController] Scraping failed:`, scrapingResult.error);
        logger.error(`[AirbnbController] Scraping failed: ${scrapingResult.error}`);
        AirbnbController.error(
          res,
          'Scraping Failed',
          500,
          scrapingResult.error || 'Failed to scrape Airbnb listing'
        );
        return;
      }

      console.log(`[AirbnbController] Scraping successful:`, scrapingResult.data.headline);
      logger.info(`[AirbnbController] Successfully scraped listing: ${scrapingResult.data.headline}`);

      // Step 4: Map Airbnb data to Property format
      console.log(`[AirbnbController] Step 4: Mapping Airbnb data to Property format...`);
      logger.info(`[AirbnbController] Mapping Airbnb data to Property format`);
      
      const propertyData = AirbnbService.mapAirbnbToProperty(
        scrapingResult.data,
        ownerId,
        agentId
      );

      console.log(`[AirbnbController] Property data mapped successfully`);
      logger.info(`[AirbnbController] Property data mapped for: ${propertyData.name}`);

      // Step 5: Create property using PropertyService
      console.log(`[AirbnbController] Step 5: Creating property in database...`);
      logger.info(`[AirbnbController] Creating property: ${propertyData.name}`);
      
      const createResult = await PropertyService.create(currentUser, propertyData);

      if (!createResult.success || !createResult.data) {
        console.log(`[AirbnbController] Property creation failed:`, createResult.error);
        logger.error(`[AirbnbController] Property creation failed: ${createResult.error}`);
        AirbnbController.error(
          res,
          'Creation Failed',
          500,
          createResult.error || 'Failed to create property'
        );
        return;
      }

      console.log(`[AirbnbController] Property created successfully:`, createResult.data.id);
      logger.info(`[AirbnbController] Property created successfully: ${createResult.data.id}`);

      // Step 6: Return success response
      console.log(`[AirbnbController] ===== IMPORT SUCCESSFUL =====`);
      logger.info(`[AirbnbController] Import completed successfully for property: ${createResult.data.id}`);

      AirbnbController.success(
        res,
        {
          property: createResult.data,
          airbnbData: {
            url: scrapingResult.data.url,
            airbnbId: scrapingResult.data.identifier,
            headline: scrapingResult.data.headline,
            host: scrapingResult.data.host.host.name
          }
        },
        'Property imported successfully from Airbnb'
      );

    } catch (error: any) {
      console.log(`[AirbnbController] ===== ERROR =====`);
      console.log(`[AirbnbController] Error:`, error);
      logger.error('[AirbnbController] Error importing from Airbnb:', error);
      AirbnbController.error(res, error, 500, 'Failed to import property from Airbnb');
    }
  };

  /**
   * Test endpoint to validate Airbnb URL
   * @route POST /api/v2/integrations/airbnb/validate-url
   * @access Private (JWT required)
   * @body { "url": "https://www.airbnb.com/rooms/..." }
   */
  public static validateUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        AirbnbController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { url } = req.body;

      if (!url) {
        AirbnbController.validationError(res, ['url is required'], 'Missing required field: url');
        return;
      }

      console.log(`[AirbnbController] Validating URL: ${url}`);
      logger.info(`[AirbnbController] URL validation request: ${url}`);

      const isValid = AirbnbService.validateAirbnbUrl(url);
      const listingId = AirbnbService.extractListingId(url);

      console.log(`[AirbnbController] Validation result - Valid: ${isValid}, Listing ID: ${listingId}`);

      AirbnbController.success(
        res,
        {
          isValid,
          listingId,
          url
        },
        isValid ? 'URL is valid' : 'URL is not a valid Airbnb listing URL'
      );

    } catch (error: any) {
      logger.error('[AirbnbController] Error validating URL:', error);
      AirbnbController.error(res, error, 500, 'Failed to validate URL');
    }
  };

  /**
   * Test endpoint to scrape without creating property
   * @route POST /api/v2/integrations/airbnb/preview
   * @access Private (JWT required - ADMIN/MANAGER only)
   * @body { "url": "https://www.airbnb.com/rooms/..." }
   */
  public static preview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUser = (req as any).user as CurrentUser;
      if (!currentUser) {
        AirbnbController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      // Only ADMIN and MANAGER can preview
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        AirbnbController.error(
          res,
          'Forbidden',
          403,
          'Only ADMIN and MANAGER roles can preview listings'
        );
        return;
      }

      const { url } = req.body;

      if (!url) {
        AirbnbController.validationError(res, ['url is required'], 'Missing required field: url');
        return;
      }

      console.log(`[AirbnbController] Preview request for URL: ${url}`);
      logger.info(`[AirbnbController] Preview request by ${currentUser.email} for URL: ${url}`);

      // Validate URL
      if (!AirbnbService.validateAirbnbUrl(url)) {
        AirbnbController.validationError(
          res,
          ['url must be a valid Airbnb listing URL'],
          'Invalid Airbnb URL'
        );
        return;
      }

      // Scrape listing data
      const scrapingResult = await AirbnbService.scrapeListing(url);

      if (!scrapingResult.success || !scrapingResult.data) {
        logger.error(`[AirbnbController] Preview scraping failed: ${scrapingResult.error}`);
        AirbnbController.error(
          res,
          'Scraping Failed',
          500,
          scrapingResult.error || 'Failed to scrape Airbnb listing'
        );
        return;
      }

      console.log(`[AirbnbController] Preview successful for: ${scrapingResult.data.headline}`);
      logger.info(`[AirbnbController] Preview successful: ${scrapingResult.data.headline}`);

      // Return scraped data without creating property
      AirbnbController.success(
        res,
        scrapingResult.data,
        'Listing data retrieved successfully (preview only, not imported)'
      );

    } catch (error: any) {
      logger.error('[AirbnbController] Error previewing listing:', error);
      AirbnbController.error(res, error, 500, 'Failed to preview listing');
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
    logger.error(`[AirbnbController] Error: ${message}`, error);
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

