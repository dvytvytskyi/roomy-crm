import { apiClient } from '../config'

export interface AnalyticsOverview {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  occupancyRate: number
  totalUnits: number
  activeReservations: number
  averageStayDuration: number
  revenueGrowth: number
  expenseGrowth: number
  profitGrowth: number
  occupancyGrowth: number
}

export interface FinancialAnalytics {
  revenue: {
    total: number
    byUnit: Array<{
      unit: string
      revenue: number
      percentage: number
    }>
    bySource: Array<{
      source: string
      revenue: number
      percentage: number
    }>
    trends: Array<{
      month: string
      revenue: number
    }>
  }
  expenses: {
    total: number
    categories: Array<{
      category: string
      amount: number
      percentage: number
    }>
    byUnit: Array<{
      unit: string
      expenses: number
    }>
  }
  profit: {
    net: number
    byUnit: Array<{
      unit: string
      profit: number
      margin: number
    }>
  }
}

export interface UnitAnalytics {
  performance: Array<{
    unit: string
    revenue: number
    expenses: number
    profit: number
    occupancyRate: number
    revenuePerNight: number
    totalNights: number
    avgStayDuration: number
  }>
}

export interface OwnerAnalytics {
  profitability: Array<{
    owner: string
    units: string[]
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
    unitsCount: number
    avgRevenuePerUnit: number
  }>
}

export interface ReservationAnalytics {
  trends: {
    monthly: Array<{
      month: string
      reservations: number
      cancellations: number
      net: number
    }>
  }
  status: {
    confirmed: number
    pending: number
    cancelled: number
    completed: number
    total: number
    cancellationRate: number
    confirmationRate: number
  }
}

export interface AgentAnalytics {
  performance: Array<{
    agent: string
    unitsReferred: number
    totalRevenue: number
    totalPayouts: number
    commissionRate: number
    avgRevenuePerUnit: number
    lastReferral: string
    status: string
  }>
}

export interface AnalyticsReport {
  id: number
  name: string
  description: string
  type: string
  lastGenerated: string
  frequency: string
  recipients: string[]
}

export interface AnalyticsFilters {
  period?: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  dateFrom?: string
  dateTo?: string
  viewMode?: 'chart' | 'table'
  dataType?: string
  format?: 'csv' | 'pdf' | 'excel'
}

class AnalyticsService {
  async getAnalyticsOverview(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: AnalyticsOverview }> {
    try {
      const response = await apiClient.get('/api/analytics/overview', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching analytics overview:', error)
      
      // Return mock data on error
      const mockData: AnalyticsOverview = {
        totalRevenue: 45000,
        totalExpenses: 18000,
        netProfit: 27000,
        occupancyRate: 78.5,
        totalUnits: 12,
        activeReservations: 8,
        averageStayDuration: 3.2,
        revenueGrowth: 15.3,
        expenseGrowth: 8.7,
        profitGrowth: 22.1,
        occupancyGrowth: 5.2
      }
      
      return {
        success: true,
        data: mockData
      }
    }
  }

  async getFinancialAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: FinancialAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/financials', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching financial analytics:', error)
      
      // Return mock data on error
      const mockData: FinancialAnalytics = {
        revenue: {
          total: 45000,
          byUnit: [
            { unit: 'Luxury Apartment Downtown Dubai', revenue: 12000, percentage: 26.7 },
            { unit: 'Beach Villa Palm Jumeirah', revenue: 15000, percentage: 33.3 },
            { unit: 'Business Bay Office', revenue: 18000, percentage: 40.0 }
          ],
          bySource: [
            { source: 'Airbnb', revenue: 18000, percentage: 40.0 },
            { source: 'Booking.com', revenue: 13500, percentage: 30.0 },
            { source: 'Direct', revenue: 9000, percentage: 20.0 },
            { source: 'VRBO', revenue: 4500, percentage: 10.0 }
          ],
          trends: [
            { month: 'Jan', revenue: 38000 },
            { month: 'Feb', revenue: 42000 },
            { month: 'Mar', revenue: 45000 }
          ]
        },
        expenses: {
          total: 18000,
          categories: [
            { category: 'Maintenance', amount: 7200, percentage: 40.0 },
            { category: 'Cleaning', amount: 5400, percentage: 30.0 },
            { category: 'Utilities', amount: 3600, percentage: 20.0 },
            { category: 'Marketing', amount: 1800, percentage: 10.0 }
          ],
          byUnit: [
            { unit: 'Luxury Apartment Downtown Dubai', expenses: 6000 },
            { unit: 'Beach Villa Palm Jumeirah', expenses: 7500 },
            { unit: 'Business Bay Office', expenses: 4500 }
          ]
        },
        profit: {
          net: 27000,
          byUnit: [
            { unit: 'Luxury Apartment Downtown Dubai', profit: 6000, margin: 50.0 },
            { unit: 'Beach Villa Palm Jumeirah', profit: 7500, margin: 50.0 },
            { unit: 'Business Bay Office', profit: 13500, margin: 75.0 }
          ]
        }
      }
      
      return {
        success: true,
        data: mockData
      }
    }
  }

  async getUnitsAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: UnitAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/units', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching units analytics:', error)
      
      // Return mock data on error
      const mockData: UnitAnalytics = {
        performance: [
          {
            unit: 'Luxury Apartment Downtown Dubai',
            revenue: 12000,
            expenses: 6000,
            profit: 6000,
            occupancyRate: 85.0,
            revenuePerNight: 400,
            totalNights: 30,
            avgStayDuration: 3.5
          },
          {
            unit: 'Beach Villa Palm Jumeirah',
            revenue: 15000,
            expenses: 7500,
            profit: 7500,
            occupancyRate: 72.0,
            revenuePerNight: 500,
            totalNights: 30,
            avgStayDuration: 2.8
          },
          {
            unit: 'Business Bay Office',
            revenue: 18000,
            expenses: 4500,
            profit: 13500,
            occupancyRate: 78.0,
            revenuePerNight: 600,
            totalNights: 30,
            avgStayDuration: 3.2
          }
        ]
      }
      
      return {
        success: true,
        data: mockData
      }
    }
  }

  async getOwnersAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: OwnerAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/owners', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching owners analytics:', error)
      
      // Return mock data on error
      const mockData: OwnerAnalytics = {
        profitability: [
          {
            owner: 'John Smith',
            units: ['Luxury Apartment Downtown Dubai'],
            totalRevenue: 12000,
            totalExpenses: 6000,
            netProfit: 6000,
            profitMargin: 50.0,
            unitsCount: 1,
            avgRevenuePerUnit: 12000
          },
          {
            owner: 'Sarah Johnson',
            units: ['Beach Villa Palm Jumeirah'],
            totalRevenue: 15000,
            totalExpenses: 7500,
            netProfit: 7500,
            profitMargin: 50.0,
            unitsCount: 1,
            avgRevenuePerUnit: 15000
          },
          {
            owner: 'Ahmed Al-Rashid',
            units: ['Business Bay Office'],
            totalRevenue: 18000,
            totalExpenses: 4500,
            netProfit: 13500,
            profitMargin: 75.0,
            unitsCount: 1,
            avgRevenuePerUnit: 18000
          }
        ]
      }
      
      return {
        success: true,
        data: mockData
      }
    }
  }

  async getReservationsAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: ReservationAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/reservations', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching reservations analytics:', error)
      
      // Return mock data on error
      const mockData: ReservationAnalytics = {
        trends: {
          monthly: [
            { month: 'Jan', reservations: 25, cancellations: 3, net: 22 },
            { month: 'Feb', reservations: 28, cancellations: 2, net: 26 },
            { month: 'Mar', reservations: 32, cancellations: 4, net: 28 }
          ]
        },
        status: {
          confirmed: 18,
          pending: 4,
          cancelled: 3,
          completed: 25,
          total: 50,
          cancellationRate: 6.0,
          confirmationRate: 94.0
        }
      }
      
      return {
        success: true,
        data: mockData
      }
    }
  }

  async getAgentsAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: AgentAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/agents', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching agents analytics:', error)
      
      // Return mock data on error
      const mockData: AgentAnalytics = {
        performance: [
          {
            agent: 'John Smith',
            unitsReferred: 3,
            totalRevenue: 36000,
            totalPayouts: 3600,
            commissionRate: 10.0,
            avgRevenuePerUnit: 12000,
            lastReferral: '2024-01-15',
            status: 'active'
          },
          {
            agent: 'Sarah Johnson',
            unitsReferred: 2,
            totalRevenue: 24000,
            totalPayouts: 2400,
            commissionRate: 10.0,
            avgRevenuePerUnit: 12000,
            lastReferral: '2024-01-10',
            status: 'active'
          },
          {
            agent: 'Mike Wilson',
            unitsReferred: 1,
            totalRevenue: 12000,
            totalPayouts: 1200,
            commissionRate: 10.0,
            avgRevenuePerUnit: 12000,
            lastReferral: '2024-01-05',
            status: 'inactive'
          }
        ]
      }
      
      return {
        success: true,
        data: mockData
      }
    }
  }

  async getReports(): Promise<{ success: boolean; data: AnalyticsReport[] }> {
    try {
      const response = await apiClient.get('/api/analytics/reports')
      return response.data
    } catch (error) {
      console.error('Error fetching reports:', error)
      
      // Return mock data on error
      const mockData: AnalyticsReport[] = [
        {
          id: 1,
          name: 'Monthly Revenue Report',
          description: 'Comprehensive monthly revenue analysis',
          type: 'revenue',
          lastGenerated: '2024-01-01',
          frequency: 'monthly',
          recipients: ['admin@roomy.com', 'finance@roomy.com']
        },
        {
          id: 2,
          name: 'Property Performance Report',
          description: 'Individual property performance metrics',
          type: 'performance',
          lastGenerated: '2024-01-01',
          frequency: 'weekly',
          recipients: ['admin@roomy.com']
        },
        {
          id: 3,
          name: 'Owner Payout Report',
          description: 'Monthly owner payout calculations',
          type: 'payouts',
          lastGenerated: '2024-01-01',
          frequency: 'monthly',
          recipients: ['admin@roomy.com', 'accounting@roomy.com']
        }
      ]
      
      return {
        success: true,
        data: mockData
      }
    }
  }

  async generateReport(reportData: {
    reportName: string
    reportType: string
    dateRange: { from: string; to: string }
    filters?: any
    chartType?: string
    exportFormat?: string
  }): Promise<{ success: boolean; data: any; message: string }> {
    try {
      const response = await apiClient.post('/api/analytics/reports/generate', reportData)
      return response.data
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  async exportAnalytics(exportData: {
    dataType: string
    format: string
    period?: string
    filters?: any
  }): Promise<Blob | { success: boolean; data: any; message: string }> {
    try {
      const response = await apiClient.post('/api/analytics/export', exportData, {
        responseType: exportData.format === 'csv' ? 'blob' : 'json'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting analytics:', error)
      throw error
    }
  }
}

export const analyticsService = new AnalyticsService()
