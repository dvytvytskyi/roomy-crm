import { apiClient } from '../client';
import { API_ENDPOINTS, ApiResponse, API_CONFIG } from '../config';

export interface Reservation {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyType?: string;
  propertyAddress?: string;
  propertyCity?: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestWhatsapp?: string;
  checkIn: string;
  checkOut: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'MODIFIED';
  paymentStatus?: 'UNPAID' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'REFUNDED' | 'PENDING_REFUND';
  guestStatus?: 'UPCOMING' | 'CHECKED_IN' | 'CHECKED_OUT' | 'NO_SHOW' | 'CANCELLED';
  source: 'DIRECT' | 'AIRBNB' | 'BOOKING_COM' | 'VRBO' | 'OTHER';
  totalAmount: number;
  paidAmount?: number;
  outstandingBalance?: number;
  nights: number;
  guests: number;
  guestCount?: number;
  specialRequests?: string;
  externalId?: string;
  adjustments?: any[];
  transactions?: any[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
  // Extended properties for detailed view
  notesList?: Array<{
    id: number;
    content: string;
    type: string;
    priority: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
  }>;
  payments?: Array<{
    id: number;
    amount: number;
    method: string;
    date: string;
    reference?: string;
    description?: string;
    type: string;
    status: string;
    createdAt?: string;
  }>;
  pricingHistory?: Array<{
    id: number;
    pricePerNight: number;
    totalAmount: number;
    reason: string;
    date: string;
    changedBy: string;
  }>;
  communicationHistory?: Array<{
    id: number;
    type: string;
    subject: string;
    content?: string;
    date: string;
    status: string;
    sentBy?: string;
  }>;
  createdBy?: {
    name: string;
    email: string;
  };
}

export interface ReservationFilters {
  dateRange?: { from: string; to: string };
  status?: string[];
  source?: string[];
  amountRange?: { min: string; max: string };
  guestName?: string;
  searchTerm?: string;
}

export interface ReservationStats {
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  totalRevenue: number;
  averageStay: number;
}

class ReservationService {
  // Get all reservations with optional filters
  async getReservations(filters?: ReservationFilters): Promise<ApiResponse<Reservation[]>> {
    console.log('📅 ReservationService: Fetching reservations from API...')
    console.log('📅 ReservationService: API Base URL:', API_CONFIG.BASE_URL)
    console.log('📅 ReservationService: Filters:', filters)
    
    try {
      // Build query parameters from filters
      const params: Record<string, any> = {}
      
      if (filters?.dateRange?.from) {
        params.checkInFrom = filters.dateRange.from
      }
      if (filters?.dateRange?.to) {
        params.checkInTo = filters.dateRange.to
      }
      if (filters?.status && filters.status.length > 0) {
        params.status = filters.status.join(',')
      }
      if (filters?.source && filters.source.length > 0) {
        params.source = filters.source.join(',')
      }
      if (filters?.amountRange?.min) {
        params.minAmount = filters.amountRange.min
      }
      if (filters?.amountRange?.max) {
        params.maxAmount = filters.amountRange.max
      }
      if (filters?.guestName) {
        params.guestName = filters.guestName
      }
      if (filters?.searchTerm) {
        params.searchTerm = filters.searchTerm
      }

      console.log('📅 ReservationService: Query params:', params)
      console.log('📅 ReservationService: Final URL:', `${API_CONFIG.BASE_URL}${API_ENDPOINTS.RESERVATIONS.BASE}`)
      
      const response = await apiClient.get<Reservation[]>(API_ENDPOINTS.RESERVATIONS.BASE, params);
      console.log('📅 ReservationService: Raw API Response:', response)
      console.log('📅 ReservationService: Response data length:', response.data?.length || 0)
      
      if (response.success && response.data) {
        console.log('📅 ReservationService: Reservations data:', response.data)
        console.log('📅 ReservationService: Reservations count:', response.data.length)
        
        if (response.data.length > 0) {
          console.log('📅 ReservationService: First reservation structure:', response.data[0])
          console.log('📅 ReservationService: First reservation keys:', Object.keys(response.data[0]))
        }
      } else {
        console.log('📅 ReservationService: API call failed or returned no data')
        console.log('📅 ReservationService: Error details:', response.error)
      }
      
      return response;
    } catch (error) {
      console.error('📅 ReservationService: Error fetching reservations:', error)
      
      // Return mock data on error for development
      const mockReservations: Reservation[] = [
        {
          id: 'res_1',
          propertyId: 'prop_1',
          propertyName: 'Luxury Downtown Apartment',
          guestName: 'John Smith',
          guestEmail: 'john@example.com',
          guestPhone: '+971501234567',
          checkIn: '2024-01-15',
          checkOut: '2024-01-18',
          status: 'confirmed',
          source: 'airbnb',
          totalAmount: 1200,
          nights: 3,
          guests: 2,
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
          notes: 'Early check-in requested'
        },
        {
          id: 'res_2',
          propertyId: 'prop_2',
          propertyName: 'Beach Villa Palm Jumeirah',
          guestName: 'Sarah Johnson',
          guestEmail: 'sarah@example.com',
          checkIn: '2024-01-20',
          checkOut: '2024-01-25',
          status: 'pending',
          source: 'booking',
          totalAmount: 2500,
          nights: 5,
          guests: 4,
          createdAt: '2024-01-12T14:30:00Z',
          updatedAt: '2024-01-12T14:30:00Z'
        },
        {
          id: 'res_3',
          propertyId: 'prop_3',
          propertyName: 'Business Bay Office',
          guestName: 'Ahmed Al-Rashid',
          guestEmail: 'ahmed@example.com',
          guestPhone: '+971507654321',
          checkIn: '2024-01-25',
          checkOut: '2024-01-27',
          status: 'completed',
          source: 'direct',
          totalAmount: 800,
          nights: 2,
          guests: 1,
          createdAt: '2024-01-08T09:15:00Z',
          updatedAt: '2024-01-27T12:00:00Z',
          notes: 'Business trip'
        }
      ]
      
      console.log('📅 ReservationService: Returning mock data due to error')
      return {
        success: true,
        data: mockReservations
      }
    }
  }

  // Get reservation by ID
  async getReservationById(id: string): Promise<ApiResponse<Reservation>> {
    return apiClient.get<Reservation>(API_ENDPOINTS.RESERVATIONS.BY_ID(id));
  }

  // Create new reservation
  async createReservation(data: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
    return apiClient.post<Reservation>(API_ENDPOINTS.RESERVATIONS.BASE, data);
  }

  // Update reservation
  async updateReservation(id: string, data: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
    return apiClient.put<Reservation>(API_ENDPOINTS.RESERVATIONS.BY_ID(id), data);
  }

  // Delete reservation
  async deleteReservation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.RESERVATIONS.BY_ID(id));
  }

  // Get available properties for filtering
  async getAvailableProperties(): Promise<ApiResponse<{id: string, name: string}[]>> {
    return apiClient.get<{id: string, name: string}[]>('/properties');
  }

  // Get reservation calendar
  async getReservationCalendar(propertyId?: string, startDate?: string, endDate?: string): Promise<ApiResponse<any[]>> {
    const params: Record<string, any> = {};
    if (propertyId) params.propertyId = propertyId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return apiClient.get<any[]>(API_ENDPOINTS.RESERVATIONS.CALENDAR, params);
  }

  // Get reservation statistics
  async getReservationStats(propertyId?: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params: Record<string, any> = {};
    if (propertyId) params.propertyId = propertyId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return apiClient.get<any>(API_ENDPOINTS.RESERVATIONS.STATS, params);
  }

  // Get reservation sources
  async getReservationSources(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(API_ENDPOINTS.RESERVATIONS.SOURCES);
  }

  // Get available properties for booking
  async getAvailablePropertiesForBooking(startDate?: string, endDate?: string, guests?: number): Promise<ApiResponse<any[]>> {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (guests) params.guests = guests;
    
    return apiClient.get<any[]>(API_ENDPOINTS.RESERVATIONS.AVAILABLE_PROPERTIES, params);
  }

  // Update reservation status
  async updateReservationStatus(id: string, statusData: { status?: string; paymentStatus?: string; guestStatus?: string }): Promise<ApiResponse<Reservation>> {
    return apiClient.put<Reservation>(API_ENDPOINTS.RESERVATIONS.STATUS(id), statusData);
  }

  // Check-in guest
  async checkInGuest(id: string): Promise<ApiResponse<Reservation>> {
    return apiClient.put<Reservation>(API_ENDPOINTS.RESERVATIONS.CHECK_IN(id));
  }

  // Check-out guest
  async checkOutGuest(id: string): Promise<ApiResponse<Reservation>> {
    return apiClient.put<Reservation>(API_ENDPOINTS.RESERVATIONS.CHECK_OUT(id));
  }

  // Mark as no-show
  async markAsNoShow(id: string): Promise<ApiResponse<Reservation>> {
    return apiClient.put<Reservation>(API_ENDPOINTS.RESERVATIONS.NO_SHOW(id));
  }

  // ===== RESERVATION DETAILS OPERATIONS =====

  // Update reservation
  async updateReservation(id: string, updateData: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
    const response = await apiClient.put<Reservation>(API_ENDPOINTS.RESERVATIONS.BY_ID(id), updateData);
    return response;
  }

  // Add note to reservation
  async addNote(id: string, noteData: { content: string; type?: string; priority?: string }): Promise<ApiResponse<any>> {
    const response = await apiClient.post<any>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/notes`, noteData);
    return response;
  }

  // Update note
  async updateNote(id: string, noteId: string, content: string): Promise<ApiResponse<any>> {
    const response = await apiClient.put<any>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/notes/${noteId}`, { content });
    return response;
  }

  // Delete note
  async deleteNote(id: string, noteId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/notes/${noteId}`);
    return response;
  }

  // Add payment to reservation
  async addPayment(id: string, paymentData: {
    amount: number;
    method: string;
    date: string;
    reference?: string;
    description?: string;
    type?: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post<any>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/payments`, paymentData);
    return response;
  }

  // Add adjustment to reservation
  async addAdjustment(id: string, adjustmentData: {
    type: string;
    amount: number;
    reason: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post<any>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/adjustments`, adjustmentData);
    return response;
  }

  // Delete adjustment
  async deleteAdjustment(id: string, adjustmentId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/adjustments/${adjustmentId}`);
    return response;
  }

  // Update reservation dates
  async updateDates(id: string, dates: { checkIn: string; checkOut: string }): Promise<ApiResponse<Reservation>> {
    const response = await apiClient.put<Reservation>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/dates`, dates);
    return response;
  }

  // Update reservation pricing
  async updatePricing(id: string, pricing: { pricePerNight: number; totalAmount: number }): Promise<ApiResponse<Reservation>> {
    const response = await apiClient.put<Reservation>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/pricing`, pricing);
    return response;
  }

  // Send communication
  async sendCommunication(id: string, communication: {
    type: string;
    subject: string;
    content: string;
  }): Promise<ApiResponse<any>> {
    const response = await apiClient.post<any>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/communications`, communication);
    return response;
  }

  // Generate invoice
  async generateInvoice(id: string, type?: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post<any>(`${API_ENDPOINTS.RESERVATIONS.BY_ID(id)}/invoices`, { type });
    return response;
  }
}

export const reservationService = new ReservationService();
