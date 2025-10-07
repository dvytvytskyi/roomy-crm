import axios from 'axios';
import { logger } from '../utils/logger';

export interface PricelabsPriceResponse {
  success: boolean;
  data?: {
    price: number;
    currency: string;
    date: string;
  };
  error?: string;
}

export class PricelabsService {
  private static readonly PRICELABS_API_URL = 'https://api.pricelabs.co/v1';
  private static readonly API_KEY = process.env.PRICELABS_API_KEY;

  /**
   * Get current price for a property from PriceLabs
   * @param propertyId - The property ID to get price for
   * @returns Promise with price data or error
   */
  public static async getCurrentPrice(propertyId: string): Promise<PricelabsPriceResponse> {
    try {
      if (!this.API_KEY) {
        logger.error('PRICELABS_API_KEY is not configured');
        return {
          success: false,
          error: 'PriceLabs API key not configured'
        };
      }

      logger.info(`[PricelabsService] Fetching price for property: ${propertyId}`);

      const response = await axios.get(`${this.PRICELABS_API_URL}/listing_prices`, {
        params: {
          id: propertyId
        },
        headers: {
          'X-ApiKey': this.API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      logger.info(`[PricelabsService] Successfully fetched price for property: ${propertyId}`);
      
      return {
        success: true,
        data: {
          price: response.data.price || 0,
          currency: response.data.currency || 'AED',
          date: new Date().toISOString()
        }
      };

    } catch (error: any) {
      logger.error(`[PricelabsService] Error fetching price for property ${propertyId}:`, error.message);
      
      // Handle different types of errors
      if (error.response) {
        // API returned an error response
        return {
          success: false,
          error: `PriceLabs API error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'Network error: Unable to reach PriceLabs API'
        };
      } else {
        // Other error
        return {
          success: false,
          error: `Unexpected error: ${error.message}`
        };
      }
    }
  }

  /**
   * Get fallback price when PriceLabs is unavailable
   * @param propertyId - The property ID
   * @returns Fallback price data
   */
  public static getFallbackPrice(propertyId: string): PricelabsPriceResponse {
    logger.info(`[PricelabsService] Using fallback price for property: ${propertyId}`);
    
    return {
      success: true,
      data: {
        price: 236, // Default fallback price
        currency: 'AED',
        date: new Date().toISOString()
      }
    };
  }
}
