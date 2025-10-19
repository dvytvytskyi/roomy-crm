import { apiClientV2 } from '../config-v2';
import { ApiResponseV2 } from '../types';

// Dashboard types
export interface DashboardStatsV2 {
  occupancy: {
    totalUnits: number;
    emptyUnits: number;
    occupancyRate: number;
  };
  operations: {
    checkInsToday: number;
    checkOutsToday: number;
    maintenanceInProgress: number;
  };
  birthdays: {
    today: {
      count: number;
      details: BirthdayDetail[];
    };
    thisWeek: {
      count: number;
      details: BirthdayDetail[];
    };
  };
  alerts: {
    dtcmPermitsExpiring: number;
    utilitiesReminders: number;
    dtcmExpiringUnits: string[];
    utilitiesPaymentReminders: string[];
  };
}

export interface BirthdayDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  date_of_birth: string;
}

class DashboardServiceV2 {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponseV2<DashboardStatsV2>> {
    try {
      console.log('🔍 dashboardService: Fetching stats...');
      const response = await apiClientV2.get('/dashboard/stats');
      console.log('🔍 dashboardService: Raw response:', response);
      
      // Backend response structure: { success: true, data: {...}, timestamp: ... }
      // apiClientV2.get() already returns the full response
      const statsData = response.data || response;
      console.log('🔍 dashboardService: Extracted data:', statsData);
      
      return {
        success: true,
        data: statsData as DashboardStatsV2,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ dashboardService: Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to retrieve dashboard statistics',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const dashboardServiceV2 = new DashboardServiceV2();
export default dashboardServiceV2;
