import { useAuth } from '@/hooks/useAuth';

export interface PropertyFinancialData {
  // Revenue
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  
  // Expenses
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  
  // Profit
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  
  // Distribution
  ownerPayout: number;
  agencyFee: number;
  platformFees: number;
  
  // Metrics
  occupancyRate: number;
  adr: number;
  revpar: number;
  totalBookings: number;
  cancellationRate: number;
  
  // Period
  period: {
    from: string;
    to: string;
    type: 'month' | 'quarter' | 'year' | 'custom';
  };
  
  // Recent data
  recentReservations: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: string;
    guestName?: string;
  }>;
  
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description?: string;
    createdAt: string;
  }>;
}

export interface FinancialFilters {
  dateFrom?: string;
  dateTo?: string;
  propertyId?: string;
  transactionType?: string[];
  paymentMethod?: string[];
  status?: string[];
  platform?: string[];
}

export class FinancialService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get property-specific financial data
   */
  static async getPropertyFinancialData(
    propertyId: string, 
    filters: FinancialFilters = {}
  ): Promise<PropertyFinancialData> {
    const queryParams = new URLSearchParams();
    
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.transactionType) {
      filters.transactionType.forEach(type => queryParams.append('transactionType', type));
    }
    if (filters.paymentMethod) {
      filters.paymentMethod.forEach(method => queryParams.append('paymentMethod', method));
    }
    if (filters.status) {
      filters.status.forEach(status => queryParams.append('status', status));
    }
    if (filters.platform) {
      filters.platform.forEach(platform => queryParams.append('platform', platform));
    }

    const url = `/api/v2/financials/property/${propertyId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

      if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch property financial data');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get financial overview (all properties)
   */
  static async getFinancialOverview(filters: FinancialFilters = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.propertyId) queryParams.append('propertyId', filters.propertyId);
    if (filters.transactionType) {
      filters.transactionType.forEach(type => queryParams.append('transactionType', type));
    }
    if (filters.paymentMethod) {
      filters.paymentMethod.forEach(method => queryParams.append('paymentMethod', method));
    }
    if (filters.status) {
      filters.status.forEach(status => queryParams.append('status', status));
    }
    if (filters.platform) {
      filters.platform.forEach(platform => queryParams.append('platform', platform));
    }

    const url = `/api/v2/financials/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch financial overview');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get KPI overview
   */
  static async getKPIOverview(filters: FinancialFilters = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.propertyId) queryParams.append('propertyId', filters.propertyId);

    const url = `/api/v2/financials/analytics/kpi-overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch KPI overview');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get units analytics
   */
  static async getUnitsAnalytics(filters: FinancialFilters = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.propertyId) queryParams.append('propertyId', filters.propertyId);

    const url = `/api/v2/financials/analytics/units${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch units analytics');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Helper function to get date range for different periods
   */
  static getDateRange(period: 'current-month' | 'last-month' | 'current-quarter' | 'last-quarter' | 'current-year' | 'last-year' | 'custom', customFrom?: string, customTo?: string) {
    const now = new Date();
    
    switch (period) {
      case 'current-month':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
        };
      
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return {
          from: lastMonth.toISOString(),
          to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()
        };
      
      case 'current-quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        return {
          from: new Date(now.getFullYear(), currentQuarter * 3, 1).toISOString(),
          to: new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59).toISOString()
        };
      
      case 'last-quarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const lastQuarterYear = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const lastQuarterMonth = lastQuarter < 0 ? 9 : lastQuarter * 3;
        return {
          from: new Date(lastQuarterYear, lastQuarterMonth, 1).toISOString(),
          to: new Date(lastQuarterYear, lastQuarterMonth + 3, 0, 23, 59, 59).toISOString()
        };
      
      case 'current-year':
        return {
          from: new Date(now.getFullYear(), 0, 1).toISOString(),
          to: new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString()
        };
      
      case 'last-year':
        return {
          from: new Date(now.getFullYear() - 1, 0, 1).toISOString(),
          to: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59).toISOString()
        };
      
      case 'custom':
        return {
          from: customFrom || new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          to: customTo || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
        };
      
      default:
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
        };
    }
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'AED'): string {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Get category color for expenses
   */
  static getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Utilities': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Cleaning': 'bg-green-100 text-green-800',
      'Repairs': 'bg-red-100 text-red-800',
      'Supplies': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Insurance': 'bg-indigo-100 text-indigo-800',
      'Taxes': 'bg-gray-100 text-gray-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  }
}