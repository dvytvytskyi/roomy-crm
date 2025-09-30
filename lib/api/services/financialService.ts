import { API_CONFIG } from '../config'

export interface FinancialData {
  totalPayout: number
  agencyFee: number
  cleaning: number
  ownersPayout: number
  referralAgentsFee: number
  vat: number
  dtcm: number
  totalRevenue: number
  occupancyRate: number
  avgCostPerNight: number
}

export interface Payment {
  id: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  totalAmount: number
  status: 'completed' | 'pending' | 'cancelled'
  channel: string
  method: string
  date: string
}

export interface DateRange {
  from: string
  to: string
}

export const financialService = {
  // Отримати фінансові дані для властивості
  getFinancialData: async (propertyId: string, dateRange?: DateRange): Promise<FinancialData> => {
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Fetching financial data for property ${propertyId}`, dateRange)
      
      // Повертаємо дані з localStorage або значення за замовчуванням
      return financialService.loadFromLocalStorage(propertyId)
    } catch (error) {
      console.error('Error fetching financial data:', error)
      // Повертаємо з localStorage як fallback
      return financialService.loadFromLocalStorage(propertyId)
    }
  },

  // Отримати список платежів
  getPayments: async (propertyId: string, dateRange?: DateRange): Promise<Payment[]> => {
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Fetching payments for property ${propertyId}`, dateRange)
      
      // Повертаємо дані з localStorage або значення за замовчуванням
      return financialService.loadPaymentsFromLocalStorage(propertyId)
    } catch (error) {
      console.error('Error fetching payments:', error)
      // Повертаємо з localStorage як fallback
      return financialService.loadPaymentsFromLocalStorage(propertyId)
    }
  },

  // Додати новий платіж
  addPayment: async (propertyId: string, payment: Omit<Payment, 'id'>): Promise<Payment> => {
    try {
      // Симуляція API виклику
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log(`API: Adding payment for property ${propertyId}:`, payment)
      
      // Повертаємо платіж з ID
      const newPayment: Payment = {
        ...payment,
        id: `payment_${Date.now()}`
      }
      
      return newPayment
    } catch (error) {
      console.error('Error adding payment:', error)
      throw error
    }
  },

  // Оновити платіж
  updatePayment: async (propertyId: string, paymentId: string, payment: Partial<Payment>): Promise<Payment> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payment)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.payment
    } catch (error) {
      console.error('Error updating payment:', error)
      throw error
    }
  },

  // Видалити платіж
  deletePayment: async (propertyId: string, paymentId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/properties/${propertyId}/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    }
  },

  // Зберегти фінансові дані в localStorage
  saveToLocalStorage: (propertyId: string, financialData: FinancialData) => {
    localStorage.setItem(`financialData_${propertyId}`, JSON.stringify(financialData))
  },

  // Завантажити фінансові дані з localStorage
  loadFromLocalStorage: (propertyId: string): FinancialData => {
    const saved = localStorage.getItem(`financialData_${propertyId}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing saved financial data:', error)
      }
    }
    
    // Значення за замовчуванням
    return {
      totalPayout: 75970,
      agencyFee: 1580,
      cleaning: 1580,
      ownersPayout: 67990,
      referralAgentsFee: 1580,
      vat: 1580,
      dtcm: 1580,
      totalRevenue: 87500,
      occupancyRate: 80,
      avgCostPerNight: 2680
    }
  },

  // Зберегти платежі в localStorage
  savePaymentsToLocalStorage: (propertyId: string, payments: Payment[]) => {
    localStorage.setItem(`payments_${propertyId}`, JSON.stringify(payments))
  },

  // Завантажити платежі з localStorage
  loadPaymentsFromLocalStorage: (propertyId: string): Payment[] => {
    const saved = localStorage.getItem(`payments_${propertyId}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing saved payments:', error)
      }
    }
    
    // Значення за замовчуванням
    return [
      {
        id: 'payment_1',
        guestName: 'John Smith',
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        nights: 3,
        totalAmount: 3500,
        status: 'completed',
        channel: 'Booking.com',
        method: 'Credit Card',
        date: '2024-01-15'
      },
      {
        id: 'payment_2',
        guestName: 'Sarah Johnson',
        checkIn: '2024-01-22',
        checkOut: '2024-01-25',
        nights: 3,
        totalAmount: 3500,
        status: 'completed',
        channel: 'Airbnb',
        method: 'Credit Card',
        date: '2024-01-22'
      },
      {
        id: 'payment_3',
        guestName: 'Mike Wilson',
        checkIn: '2024-02-05',
        checkOut: '2024-02-08',
        nights: 3,
        totalAmount: 3500,
        status: 'completed',
        channel: 'Direct',
        method: 'Bank Transfer',
        date: '2024-02-05'
      }
    ]
  },

  // Обчислити дати для різних періодів
  calculateDateRange: (range: string): DateRange => {
    const today = new Date()
    let fromDate = new Date()
    let toDate = new Date()

    switch (range) {
      case 'lastweek':
        fromDate.setDate(today.getDate() - 7)
        break
      case 'lastmonth':
        fromDate.setMonth(today.getMonth() - 1)
        break
      case 'last3month':
        fromDate.setMonth(today.getMonth() - 3)
        break
      case 'last6month':
        fromDate.setMonth(today.getMonth() - 6)
        break
      case 'lastyear':
        fromDate.setFullYear(today.getFullYear() - 1)
        break
      default:
        // Custom range - повертаємо поточні дати
        return {
          from: fromDate.toISOString().split('T')[0],
          to: toDate.toISOString().split('T')[0]
        }
    }

    return {
      from: fromDate.toISOString().split('T')[0],
      to: toDate.toISOString().split('T')[0]
    }
  }
}
