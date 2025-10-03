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
      throw error
    }
  }

  async getFinancialAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: FinancialAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/financials', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching financial analytics:', error)
      throw error
    }
  }

  async getUnitsAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: UnitAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/units', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching units analytics:', error)
      throw error
    }
  }

  async getOwnersAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: OwnerAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/owners', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching owners analytics:', error)
      throw error
    }
  }

  async getReservationsAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: ReservationAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/reservations', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching reservations analytics:', error)
      throw error
    }
  }

  async getAgentsAnalytics(filters: AnalyticsFilters = {}): Promise<{ success: boolean; data: AgentAnalytics }> {
    try {
      const response = await apiClient.get('/api/analytics/agents', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching agents analytics:', error)
      throw error
    }
  }

  async getReports(): Promise<{ success: boolean; data: AnalyticsReport[] }> {
    try {
      const response = await apiClient.get('/api/analytics/reports')
      return response.data
    } catch (error) {
      console.error('Error fetching reports:', error)
      throw error
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
