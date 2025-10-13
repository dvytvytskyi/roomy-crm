import { Request, Response, NextFunction } from 'express';
import { PricingCalendarService } from '../services/pricing-calendar.service';
import { PropertyService } from '../services/property.service';
import logger from '../utils/logger';

export class PricingCalendarController {
  /**
   * Отримати ціни для всіх квартир для календаря
   * @route GET /api/v2/calendar/pricing
   * @query startDate - Початкова дата (YYYY-MM-DD)
   * @query endDate - Кінцева дата (YYYY-MM-DD)
   * @access Private (JWT required)
   */
  public static getBulkPricing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'startDate and endDate are required'
        });
        return;
      }

      logger.info(`[PricingCalendarController] Fetching bulk pricing for ${startDate} to ${endDate}`);
      logger.info(`[PricingCalendarController] Current user:`, { id: currentUser.id, email: currentUser.email, role: currentUser.role });

      // Тимчасово використовуємо прямий виклик API
      const axios = require('axios');
      const propertiesResponse = await axios.get('http://localhost:3002/api/v2/properties?page=1&limit=1000', {
        headers: {
          'Authorization': req.headers.authorization
        }
      });
      
      logger.info(`[PricingCalendarController] Direct API call response:`, { 
        status: propertiesResponse.status, 
        dataLength: propertiesResponse.data?.data?.length || 0 
      });

      if (propertiesResponse.status !== 200 || !propertiesResponse.data.success) {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch properties',
          message: 'Could not retrieve properties list'
        });
        return;
      }

      // Витягуємо потрібні поля
      const propertiesList = propertiesResponse.data.data || [];
        
      // Фільтруємо тільки активні properties
      const activeProperties = propertiesList.filter((p: any) => p.isActive === true);
        
      const properties = activeProperties.map((p: any) => ({
        id: p.id,
        pricelab_id: p.pricelabId || null,
        price_per_night: p.pricePerNight
      }));

      logger.info(`[PricingCalendarController] Found ${propertiesList.length} total properties, ${activeProperties.length} active properties`);
      logger.info(`[PricingCalendarController] Properties data:`, propertiesList.map((p: any) => ({ id: p.id, isActive: p.isActive, pricelabId: p.pricelabId, pricePerNight: p.pricePerNight })));
      logger.info(`[PricingCalendarController] Processing ${properties.length} properties`);

      // Отримуємо ціни для всіх квартир
      const pricingMaps = await PricingCalendarService.getBulkPricing(
        properties,
        startDate as string,
        endDate as string
      );

      logger.info(`[PricingCalendarController] Successfully fetched pricing for ${pricingMaps.length} properties`);

      res.status(200).json({
        success: true,
        data: pricingMaps,
        message: 'Pricing data retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('[PricingCalendarController] Error getting bulk pricing:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to get pricing data',
        timestamp: new Date().toISOString()
      });
    }
  };
}

