import axios from 'axios';
import logger from '../utils/logger';
import { formatInTimeZone } from 'date-fns-tz';

export interface PricelabsPriceResponse {
  success: boolean;
  data?: {
    price: number;
    currency: string;
    date: string;
  };
  error?: string;
}

export interface PricelabsCreateListingResponse {
  success: boolean;
  data?: {
    listing_id: string;
    status: string;
  };
  error?: string;
}

export interface PricelabsUpdateListingResponse {
  success: boolean;
  data?: {
    listing_id: string;
    status: string;
  };
  error?: string;
}

export interface PricelabsDeleteListingResponse {
  success: boolean;
  data?: {
    listing_id: string;
    status: string;
  };
  error?: string;
}

export interface PropertyData {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  price_per_night: number;
  description?: string;
  amenities: string[];
  house_rules: string[];
}

export interface PropertyUpdateData {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  price_per_night?: number;
  description?: string;
  amenities?: string[];
  house_rules?: string[];
}

export class PricelabsService {
  private static readonly PRICELABS_API_URL = 'https://api.pricelabs.co/v1';
  private static readonly API_KEY = process.env['PRICELABS_API_KEY'];

  /**
   * Test method to verify service is working
   */
  public static test(): string {
    console.log('[PricelabsService] Test method called');
    return 'PricelabsService is working';
  }



  /**
   * Get current price for a property from PriceLabs
   * @param pricelabId - The PriceLabs listing ID to get price for
   * @returns Promise with price data or error
   */
  public static async getCurrentPrice(pricelabId: string): Promise<PricelabsPriceResponse> {
    console.log(`[PricelabsService] ===== METHOD START =====`);
    console.log(`[PricelabsService] getCurrentPrice called with pricelabId: ${pricelabId}`);
    logger.info(`[PricelabsService] getCurrentPrice method started with ID: ${pricelabId}`);
    
    try {
      if (!this.API_KEY) {
        console.log('PRICELABS_API_KEY is not configured');
        logger.error('PRICELABS_API_KEY is not configured');
        return {
          success: false,
          error: 'PriceLabs API key not configured'
        };
      }

      console.log(`[PricelabsService] ===== STARTING PRICE FETCH =====`);
      console.log(`[PricelabsService] Fetching price for PriceLabs ID: ${pricelabId}`);
      console.log(`[PricelabsService] API Key configured: ${this.API_KEY ? 'YES' : 'NO'}`);
      console.log(`[PricelabsService] API Key length: ${this.API_KEY ? this.API_KEY.length : 0}`);
      console.log(`[PricelabsService] API Key preview: ${this.API_KEY ? this.API_KEY.substring(0, 10) + '...' : 'N/A'}`);
      console.log(`[PricelabsService] API URL: ${this.PRICELABS_API_URL}/listing_prices`);
      
      // Додаємо логування через logger для запису в файл
      logger.info(`[PricelabsService] Starting price fetch for ID: ${pricelabId}`);

              // ✅ 1. Формуємо правильне тіло запиту згідно з документацією PriceLabs
              const requestBody = {
                listings: [
                  {
                    id: pricelabId,
                    pms: 'guesty' // Виправлено: використовуємо правильне значення PMS
                  }
                ]
              };

      const requestConfig = {
        headers: {
          'X-API-Key': this.API_KEY, // Правильна назва заголовка
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      };

      console.log(`[PricelabsService] Request body:`, JSON.stringify(requestBody, null, 2));
      console.log(`[PricelabsService] Request config:`, JSON.stringify(requestConfig, null, 2));

      // ✅ 2. Робимо POST запит згідно з документацією PriceLabs
      const response = await axios.post(`${this.PRICELABS_API_URL}/listing_prices`, requestBody, requestConfig);

      console.log(`[PricelabsService] ===== SUCCESS RESPONSE =====`);
      console.log(`[PricelabsService] Response status: ${response.status}`);
      console.log(`[PricelabsService] Response headers:`, response.headers);
      console.log(`[PricelabsService] Response data:`, JSON.stringify(response.data, null, 2));
      console.log(`[PricelabsService] Successfully fetched price for PriceLabs ID: ${pricelabId}`);
      
      // Додаємо логування через logger
      logger.info(`[PricelabsService] Success response from PriceLabs:`, {
        status: response.status,
        data: response.data
      });
      
      // Додаткове логування для діагностики
      logger.info(`[PricelabsService] Response data type: ${typeof response.data}`);
      logger.info(`[PricelabsService] Response data length: ${Array.isArray(response.data) ? response.data.length : 'not array'}`);
      logger.info(`[PricelabsService] Response data keys: ${Object.keys(response.data || {}).join(', ')}`);
      
      // Додаємо console.log для діагностики
      console.log(`[PricelabsService] Response data type: ${typeof response.data}`);
      console.log(`[PricelabsService] Response data length: ${Array.isArray(response.data) ? response.data.length : 'not array'}`);
      console.log(`[PricelabsService] Response data keys: ${Object.keys(response.data || {}).join(', ')}`);
      
      // ✅ 3. Парсимо відповідь, щоб знайти ціну на СЬОГОДНІ
      console.log(`[PricelabsService] ===== PARSING RESPONSE =====`);
      console.log(`[PricelabsService] Full response.data:`, JSON.stringify(response.data, null, 2));
      console.log(`[PricelabsService] response.data type:`, typeof response.data);
      console.log(`[PricelabsService] response.data length:`, Array.isArray(response.data) ? response.data.length : 'not array');
      
      // PriceLabs повертає масив з одним елементом
      const listingData = response.data?.[0];
      console.log(`[PricelabsService] listingData:`, JSON.stringify(listingData, null, 2));
      
      // ✅ Отримуємо поточну дату в часовій зоні Дубаю
      const timeZone = 'Asia/Dubai';
      const todayInDubai = formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
      console.log(`[PricelabsService] Today date in Dubai timezone:`, todayInDubai);
      
      // Структура відповіді PriceLabs може бути різною, давайте спробуємо різні варіанти
      let priceData = null;
      let currency = 'AED';
      
      // Варіант 1: listingData.data - масив цін
      if (listingData?.data && Array.isArray(listingData.data)) {
        console.log(`[PricelabsService] Found data array with ${listingData.data.length} entries`);
        console.log(`[PricelabsService] Searching for price on date: ${todayInDubai}`);
        priceData = listingData.data.find((d: any) => d.date === todayInDubai);
        currency = listingData.currency || 'AED';
        
        // Додаткове логування для діагностики
        if (priceData) {
          console.log(`[PricelabsService] Found price data:`, JSON.stringify(priceData, null, 2));
        } else {
          console.log(`[PricelabsService] No price found for date ${todayInDubai}`);
          console.log(`[PricelabsService] Available dates in data:`, listingData.data.slice(0, 5).map((d: any) => d.date));
        }
      }
      
      // Варіант 2: listingData - прямий об'єкт з ціною
      if (!priceData && listingData?.price) {
        console.log(`[PricelabsService] Found direct price in listingData`);
        priceData = { price: listingData.price, date: todayInDubai };
        currency = listingData.currency || 'AED';
      }
      
      // Варіант 3: listingData.prices - альтернативна структура
      if (!priceData && listingData?.prices && Array.isArray(listingData.prices)) {
        console.log(`[PricelabsService] Found prices array with ${listingData.prices.length} entries`);
        priceData = listingData.prices.find((d: any) => d.date === todayInDubai);
        currency = listingData.currency || 'AED';
      }
      
      console.log(`[PricelabsService] Final priceData:`, JSON.stringify(priceData, null, 2));

      if (priceData && priceData.price) {
        console.log(`[PricelabsService] Found price:`, priceData.price);
        return {
          success: true,
          data: {
            price: priceData.price,
            currency: currency,
            date: priceData.date || todayInDubai,
          }
        };
      } else {
        console.log(`[PricelabsService] No price data found in any expected format!`);
        throw new Error('No price data found in PriceLabs response');
      }

    } catch (error: any) {
      console.log(`[PricelabsService] ===== ERROR OCCURRED =====`);
      console.log(`[PricelabsService] Error type: ${typeof error}`);
      console.log(`[PricelabsService] Error message: ${error.message}`);
      console.log(`[PricelabsService] Error stack: ${error.stack}`);
      
      // Handle different types of errors
      if (error.response) {
        // API returned an error response
        console.log(`[PricelabsService] ===== API ERROR RESPONSE =====`);
        console.log(`[PricelabsService] Status: ${error.response.status}`);
        console.log(`[PricelabsService] Status Text: ${error.response.statusText}`);
        console.log(`[PricelabsService] Headers:`, error.response.headers);
        console.log(`[PricelabsService] Data:`, JSON.stringify(error.response.data, null, 2));
        
        return {
          success: false,
          error: `PriceLabs API error: ${error.response.status} - ${error.response.data?.error?.message || error.response.data?.message || 'Unknown error'}`
        };
      } else if (error.request) {
        // Network error
        console.log(`[PricelabsService] ===== NETWORK ERROR =====`);
        console.log(`[PricelabsService] Request object:`, error.request);
        console.log(`[PricelabsService] Request config:`, error.config);
        
        return {
          success: false,
          error: 'Network error: Unable to reach PriceLabs API'
        };
      } else {
        // Other error
        console.log(`[PricelabsService] ===== UNEXPECTED ERROR =====`);
        console.log(`[PricelabsService] Error object:`, error);
        
        return {
          success: false,
          error: `Unexpected error: ${error.message}`
        };
      }
    } finally {
      console.log(`[PricelabsService] ===== ENDING PRICE FETCH =====`);
    }
  }

  /**
   * Create a new listing in PriceLabs
   * @param propertyData - The property data to create listing for
   * @returns Promise with listing creation result
   */
  public static async createListing(propertyData: PropertyData): Promise<PricelabsCreateListingResponse> {
    try {
      if (!this.API_KEY) {
        console.log('PRICELABS_API_KEY is not configured');
        return {
          success: false,
          error: 'PriceLabs API key not configured'
        };
      }

      logger.info(`[PricelabsService] Creating listing for property: ${propertyData.id}`);

      // Prepare the listing data for PriceLabs API
      const listingData = {
        name: propertyData.name,
        address: propertyData.address,
        city: propertyData.city,
        country: propertyData.country,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        capacity: propertyData.capacity,
        area: propertyData.area,
        base_price: propertyData.price_per_night,
        currency: 'AED',
        description: propertyData.description,
        amenities: propertyData.amenities,
        house_rules: propertyData.house_rules,
        // Additional fields that PriceLabs might need
        property_type: 'apartment', // Default to apartment, can be made configurable
        listing_type: 'entire_place', // Default to entire place
        instant_book: false, // Default to false, can be made configurable
        minimum_nights: 1,
        maximum_nights: 365
      };

      const response = await axios.post(`${this.PRICELABS_API_URL}/listings`, listingData, {
        headers: {
          'X-ApiKey': this.API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 seconds timeout for creation
      });

      logger.info(`[PricelabsService] Successfully created listing for property: ${propertyData.id}`);
      
      return {
        success: true,
        data: {
          listing_id: response.data.listing_id || response.data.id,
          status: response.data.status || 'created'
        }
      };

    } catch (error: any) {
      logger.error(`[PricelabsService] Error creating listing for property ${propertyData.id}:`, error.message);
      
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
   * @param pricelabId - The PriceLabs listing ID
   * @returns Fallback price data
   */
  public static getFallbackPrice(pricelabId: string): PricelabsPriceResponse {
    console.log(`[PricelabsService] Using fallback price for PriceLabs ID: ${pricelabId}`);
    
    return {
      success: true,
      data: {
        price: 236, // Default fallback price
        currency: 'AED',
        date: new Date().toISOString()
      }
    };
  }

  /**
   * Update an existing listing in PriceLabs
   */
  public static async updateListing(pricelabId: string, updateData: PropertyUpdateData): Promise<PricelabsUpdateListingResponse> {
    try {
      if (!this.API_KEY) {
        console.log('PRICELABS_API_KEY is not configured');
        return {
          success: false,
          error: 'PriceLabs API key not configured'
        };
      }

      logger.info(`[PricelabsService] Updating listing: ${pricelabId}`);

      // Prepare update data for PriceLabs
      const listingUpdateData: any = {};
      
      if (updateData.name !== undefined) listingUpdateData.name = updateData.name;
      if (updateData.address !== undefined) listingUpdateData.address = updateData.address;
      if (updateData.city !== undefined) listingUpdateData.city = updateData.city;
      if (updateData.country !== undefined) listingUpdateData.country = updateData.country;
      if (updateData.latitude !== undefined) listingUpdateData.latitude = updateData.latitude;
      if (updateData.longitude !== undefined) listingUpdateData.longitude = updateData.longitude;
      if (updateData.bedrooms !== undefined) listingUpdateData.bedrooms = updateData.bedrooms;
      if (updateData.bathrooms !== undefined) listingUpdateData.bathrooms = updateData.bathrooms;
      if (updateData.capacity !== undefined) listingUpdateData.capacity = updateData.capacity;
      if (updateData.area !== undefined) listingUpdateData.area = updateData.area;
      if (updateData.price_per_night !== undefined) listingUpdateData.base_price = updateData.price_per_night;
      if (updateData.description !== undefined) listingUpdateData.description = updateData.description;
      if (updateData.amenities !== undefined) listingUpdateData.amenities = updateData.amenities;
      if (updateData.house_rules !== undefined) listingUpdateData.house_rules = updateData.house_rules;

      const response = await axios.put(`${this.PRICELABS_API_URL}/listings/${pricelabId}`, listingUpdateData, {
        headers: {
          'X-ApiKey': this.API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      logger.info(`[PricelabsService] Successfully updated listing: ${pricelabId}`);
      
      return {
        success: true,
        data: {
          listing_id: pricelabId,
          status: response.data.status || 'updated'
        }
      };

    } catch (error: any) {
      logger.error(`[PricelabsService] Error updating listing ${pricelabId}:`, error.message);
      
      if (error.response) {
        return {
          success: false,
          error: `PriceLabs API error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error: Unable to reach PriceLabs API'
        };
      } else {
        return {
          success: false,
          error: `Unexpected error: ${error.message}`
        };
      }
    }
  }

  /**
   * Delete/Archive a listing in PriceLabs
   */
  public static async deleteListing(pricelabId: string): Promise<PricelabsDeleteListingResponse> {
    try {
      if (!this.API_KEY) {
        console.log('PRICELABS_API_KEY is not configured');
        return {
          success: false,
          error: 'PriceLabs API key not configured'
        };
      }

      logger.info(`[PricelabsService] Deleting listing: ${pricelabId}`);

      const response = await axios.delete(`${this.PRICELABS_API_URL}/listings/${pricelabId}`, {
        headers: {
          'X-ApiKey': this.API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      logger.info(`[PricelabsService] Successfully deleted listing: ${pricelabId}`);
      
      return {
        success: true,
        data: {
          listing_id: pricelabId,
          status: response.data.status || 'deleted'
        }
      };

    } catch (error: any) {
      logger.error(`[PricelabsService] Error deleting listing ${pricelabId}:`, error.message);
      
      if (error.response) {
        return {
          success: false,
          error: `PriceLabs API error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error: Unable to reach PriceLabs API'
        };
      } else {
        return {
          success: false,
          error: `Unexpected error: ${error.message}`
        };
      }
    }
  }
}
