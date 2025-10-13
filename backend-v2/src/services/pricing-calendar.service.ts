import { PricelabsService } from './pricelabs.service';
import logger from '../utils/logger';
import { formatInTimeZone } from 'date-fns-tz';

export interface PropertyPricingMap {
  propertyId: string;
  pricelabId: string | null;
  pricingMap: Record<string, number>; // { "2025-10-13": 80, "2025-10-14": 90 }
}

export class PricingCalendarService {
  /**
   * Отримати ціни для всіх квартир на діапазон дат
   * @param properties - Масив квартир з pricelab_id
   * @param startDate - Початкова дата (YYYY-MM-DD)
   * @param endDate - Кінцева дата (YYYY-MM-DD)
   * @returns Масив об'єктів з ціновими мапами для кожної квартири
   */
  public static async getBulkPricing(
    properties: Array<{ id: string; pricelab_id: string | null; price_per_night: number }>,
    startDate: string,
    endDate: string
  ): Promise<PropertyPricingMap[]> {
    logger.info(`[PricingCalendarService] Fetching bulk pricing from ${startDate} to ${endDate} for ${properties.length} properties`);
    logger.info(`[PricingCalendarService] Properties:`, properties.map(p => ({ id: p.id, pricelab_id: p.pricelab_id, price_per_night: p.price_per_night })));

    // Separate properties with and without PriceLabs IDs
    const pricelabsProperties = properties.filter(p => p.pricelab_id);
    const nonPricelabsProperties = properties.filter(p => !p.pricelab_id);
    
    logger.info(`[PricingCalendarService] Found ${pricelabsProperties.length} properties with PriceLabs ID, ${nonPricelabsProperties.length} without`);

    const results: PropertyPricingMap[] = [];

    // Step 1: Fetch prices from PriceLabs for properties with pricelab_id
    if (pricelabsProperties.length > 0) {
      try {
        const pricelabIds = pricelabsProperties.map(p => p.pricelab_id!);
        logger.info(`[PricingCalendarService] Fetching PriceLabs data for ${pricelabIds.length} listings`);
        
        const pricelabsResponse = await PricelabsService.getBulkPrices(pricelabIds, startDate, endDate);

        if (pricelabsResponse.success && pricelabsResponse.data) {
          // Process PriceLabs results
          for (const property of pricelabsProperties) {
            const pricelabData = pricelabsResponse.data.find(
              (plData) => plData.listing_id === property.pricelab_id
            );

            const pricingMap: Record<string, number> = {};
            
            if (pricelabData) {
              // Convert PriceLabs data to pricingMap
              for (const priceEntry of pricelabData.prices) {
                pricingMap[priceEntry.date] = priceEntry.price;
              }
            } else {
              // Fallback to base price if no PriceLabs data found
              this.fillWithBasePrice(pricingMap, startDate, endDate, property.price_per_night);
            }

            results.push({
              propertyId: property.id,
              pricelabId: property.pricelab_id,
              pricingMap
            });
          }
        } else {
          logger.warn(`[PricingCalendarService] Failed to fetch bulk prices from PriceLabs: ${pricelabsResponse.error}`);
          // Fallback to base price for all PriceLabs properties
          for (const property of pricelabsProperties) {
            const pricingMap: Record<string, number> = {};
            this.fillWithBasePrice(pricingMap, startDate, endDate, property.price_per_night);
            
            results.push({
              propertyId: property.id,
              pricelabId: property.pricelab_id,
              pricingMap
            });
          }
        }
      } catch (error) {
        logger.error(`[PricingCalendarService] Error fetching PriceLabs bulk prices:`, error);
        // Fallback to base price for all PriceLabs properties
        for (const property of pricelabsProperties) {
          const pricingMap: Record<string, number> = {};
          this.fillWithBasePrice(pricingMap, startDate, endDate, property.price_per_night);
          
          results.push({
            propertyId: property.id,
            pricelabId: property.pricelab_id,
            pricingMap
          });
        }
      }
    }

    // Step 2: Use base price for properties without PriceLabs ID
    for (const property of nonPricelabsProperties) {
      const pricingMap: Record<string, number> = {};
      this.fillWithBasePrice(pricingMap, startDate, endDate, property.price_per_night);
      
      results.push({
        propertyId: property.id,
        pricelabId: null,
        pricingMap
      });
    }

    logger.info(`[PricingCalendarService] Successfully processed ${results.length} properties`);
    return results;
  }

  /**
   * Заповнити мапу базовою ціною для всього діапазону
   */
  private static fillWithBasePrice(
    pricingMap: Record<string, number>,
    startDate: string,
    endDate: string,
    basePrice: number
  ): void {
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      const dateStr = formatInTimeZone(currentDate, 'UTC', 'yyyy-MM-dd');
      pricingMap[dateStr] = basePrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
}

