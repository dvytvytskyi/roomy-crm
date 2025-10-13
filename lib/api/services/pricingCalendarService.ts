import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2';

export interface PropertyPricingMap {
  propertyId: string;
  pricelabId: string | null;
  pricingMap: Record<string, number>; // { "2025-10-13": 80, "2025-10-14": 90 }
}

export interface BulkPricingResponse {
  success: boolean;
  data: PropertyPricingMap[];
  message: string;
  timestamp: string;
}

class PricingCalendarService {
  /**
   * Отримати ціни для всіх квартир на діапазон дат
   * @param startDate - Початкова дата (YYYY-MM-DD)
   * @param endDate - Кінцева дата (YYYY-MM-DD)
   * @returns Promise з ціновими мапами для кожної квартири
   */
  async getBulkPricing(startDate: string, endDate: string): Promise<BulkPricingResponse> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/calendar/pricing`, {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching bulk pricing:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch pricing data',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Отримати ціну для конкретної квартири на конкретну дату
   * @param propertyId - ID квартири
   * @param date - Дата (YYYY-MM-DD)
   * @param pricingMaps - Масив ц інових мап (з getBulkPricing)
   * @returns Ціна або undefined
   */
  getPriceForPropertyAndDate(
    propertyId: string,
    date: Date | string,
    pricingMaps: PropertyPricingMap[]
  ): number | undefined {
    const propertyMap = pricingMaps.find(pm => pm.propertyId === propertyId);
    if (!propertyMap) return undefined;

    const dateStr = typeof date === 'string' 
      ? date 
      : date.toISOString().split('T')[0];

    return propertyMap.pricingMap[dateStr];
  }
}

export const pricingCalendarService = new PricingCalendarService();

