import { apiClient } from '../config'

export interface FinancialTransaction {
  id: number
  transactionId: string
  guestName: string
  property: string
  reservationId: string
  paymentStatus: 'Completed' | 'Pending' | 'Failed'
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Cash/Other'
  amount: number
  currency: 'AED' | 'USD' | 'EUR'
  date: string
  time?: string
  type: 'Payment' | 'Refund' | 'Expense'
  platform: 'Direct' | 'Airbnb' | 'Booking.com' | 'Expedia'
  platformFee: number
  transactionFee?: number
  adminUser: string
  remarks?: string
  paymentCount: number
  paymentCategory: string
  guestEmail?: string
  guestPhone?: string
  netAmount?: number
  createdAt?: string
  createdBy?: string
  lastModifiedAt?: string
  lastModifiedBy?: string
}

export interface FinancialStats {
  totalRevenue: number
  pendingPayments: number
  totalExpenses: number
  netIncome: number
  transactionsCount: number
  averageTransaction: number
  refundsAmount: number
  platformFees: number
}

export interface FinancialFilters {
  search?: string
  paymentStatus?: string[]
  paymentMethod?: string[]
  transactionType?: string[]
  paymentCategory?: string[]
  platform?: string[]
  property?: string[]
  guest?: string
  amountMin?: number
  amountMax?: number
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface FinancialResponse {
  success: boolean
  data: FinancialTransaction[]
  total: number
  page: number
  limit: number
}

export interface FinancialStatsResponse {
  success: boolean
  data: FinancialStats
}

export interface FinancialSingleResponse {
  success: boolean
  data: FinancialTransaction
}

export interface FinancialCreateRequest {
  guestName: string
  property: string
  reservationId?: string
  paymentStatus: 'Completed' | 'Pending' | 'Failed'
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Cash/Other'
  amount: number
  currency: 'AED' | 'USD' | 'EUR'
  date: string
  time?: string
  type: 'Payment' | 'Refund' | 'Expense'
  platform: 'Direct' | 'Airbnb' | 'Booking.com' | 'Expedia'
  platformFee?: number
  transactionFee?: number
  paymentCategory: string
  guestEmail?: string
  guestPhone?: string
  remarks?: string
  adminUser?: string
}

export interface FinancialUpdateRequest {
  guestName?: string
  property?: string
  reservationId?: string
  paymentStatus?: 'Completed' | 'Pending' | 'Failed'
  paymentMethod?: 'Credit Card' | 'Bank Transfer' | 'PayPal' | 'Cash/Other'
  amount?: number
  currency?: 'AED' | 'USD' | 'EUR'
  date?: string
  time?: string
  type?: 'Payment' | 'Refund' | 'Expense'
  platform?: 'Direct' | 'Airbnb' | 'Booking.com' | 'Expedia'
  platformFee?: number
  transactionFee?: number
  paymentCategory?: string
  guestEmail?: string
  guestPhone?: string
  remarks?: string
  adminUser?: string
}

export interface FinancialDeleteResponse {
  success: boolean
  message: string
}

class FinanceService {
  async getFinancialTransactions(filters: FinancialFilters = {}): Promise<FinancialResponse> {
    try {
      const response = await apiClient.get('/api/finances', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching financial transactions:', error)
      throw error
    }
  }

  async getFinancialStats(filters?: { dateFrom?: string; dateTo?: string }): Promise<FinancialStatsResponse> {
    try {
      const response = await apiClient.get('/api/finances/stats', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching financial stats:', error)
      throw error
    }
  }

  async getFinancialTransactionById(id: number): Promise<FinancialSingleResponse> {
    try {
      const response = await apiClient.get(`/api/finances/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching financial transaction:', error)
      throw error
    }
  }

  async createFinancialTransaction(transactionData: FinancialCreateRequest): Promise<FinancialSingleResponse> {
    try {
      const response = await apiClient.post('/api/finances', transactionData)
      return response.data
    } catch (error) {
      console.error('Error creating financial transaction:', error)
      throw error
    }
  }

  async updateFinancialTransaction(id: number, updateData: FinancialUpdateRequest): Promise<FinancialSingleResponse> {
    try {
      const response = await apiClient.put(`/api/finances/${id}`, updateData)
      return response.data
    } catch (error) {
      console.error('Error updating financial transaction:', error)
      throw error
    }
  }

  async deleteFinancialTransaction(id: number): Promise<FinancialDeleteResponse> {
    try {
      const response = await apiClient.delete(`/api/finances/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting financial transaction:', error)
      throw error
    }
  }

  // Bulk operations
  async markTransactionsAsPaid(transactionIds: number[]): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/api/finances/bulk/mark-paid', { transactionIds })
      return response.data
    } catch (error) {
      console.error('Error marking transactions as paid:', error)
      throw error
    }
  }

  async exportTransactions(transactionIds: number[], format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.post('/api/finances/export', 
        { transactionIds, format },
        { responseType: 'blob' }
      )
      return response.data
    } catch (error) {
      console.error('Error exporting transactions:', error)
      throw error
    }
  }

  async generateInvoices(transactionIds: number[]): Promise<{ success: boolean; message: string; invoiceIds: number[] }> {
    try {
      const response = await apiClient.post('/api/finances/generate-invoices', { transactionIds })
      return response.data
    } catch (error) {
      console.error('Error generating invoices:', error)
      throw error
    }
  }
}

export const financeService = new FinanceService()
