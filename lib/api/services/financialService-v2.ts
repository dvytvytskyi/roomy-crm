import { apiClientV2 } from '../config-v2';
import { ApiResponseV2 } from '../types';

// Financial types
export interface FinancialOverviewV2 {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingPayments: number;
  completedTransactions: number;
  averageTransactionAmount: number;
  monthlyGrowth: number;
  topPaymentMethods: Array<{
    method: string;
    count: number;
    totalAmount: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    expenses: number;
    net: number;
  }>;
}

export interface KPIOverviewV2 {
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  totalBookings: number;
  cancellationRate: number;
  guestSatisfaction: number;
  propertiesActive: number;
  propertiesOccupied: number;
}

export interface UnitAnalyticsV2 {
  id: string;
  name: string;
  address: string;
  revenue: number;
  occupancyRate: number;
  averageDailyRate: number;
  totalBookings: number;
  cancellationRate: number;
  guestSatisfaction: number;
  lastBookingDate?: string;
  nextBookingDate?: string;
}

export interface UnitsAnalyticsV2 {
  units: UnitAnalyticsV2[];
  totalUnits: number;
  activeUnits: number;
  totalRevenue: number;
  averageOccupancyRate: number;
  averageDailyRate: number;
}

export interface FinancialFiltersV2 {
  dateFrom?: string;
  dateTo?: string;
  period?: string;
  propertyId?: string;
  transactionType?: string[];
  paymentMethod?: string[];
  status?: string[];
  platform?: string[];
}

class FinancialServiceV2 {
  /**
   * Get financial overview
   */
  async getFinancialOverview(filters: FinancialFiltersV2 = {}): Promise<ApiResponseV2<FinancialOverviewV2>> {
    try {
      const response = await apiClientV2.get('/financials/overview', { params: filters });
      
      return {
        success: true,
        data: response.data.data!,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to retrieve financial overview',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get KPI overview
   */
  async getKPIOverview(filters: FinancialFiltersV2 = {}): Promise<ApiResponseV2<KPIOverviewV2>> {
    try {
      const response = await apiClientV2.get('/financials/analytics/kpi-overview', { params: filters });
      
      return {
        success: true,
        data: response.data.data!,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to retrieve KPI overview',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get units analytics
   */
  async getUnitsAnalytics(filters: FinancialFiltersV2 = {}): Promise<ApiResponseV2<UnitsAnalyticsV2>> {
    try {
      const response = await apiClientV2.get('/financials/analytics/units', { params: filters });
      
      return {
        success: true,
        data: response.data.data!,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to retrieve units analytics',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const financialServiceV2 = new FinancialServiceV2();
export default financialServiceV2;
