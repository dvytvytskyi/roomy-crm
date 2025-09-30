import { apiClient } from '../client';
import { API_ENDPOINTS, ApiResponse, API_CONFIG } from '../config';

export interface Reservation {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  source: 'airbnb' | 'booking' | 'vrbo' | 'direct';
  totalAmount: number;
  nights: number;
  guests: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

export interface ReservationFilters {
  dateRange?: { from: string; to: string };
  status?: string[];
  source?: string[];
  property?: string[];
  amountRange?: { min: string; max: string };
  guestName?: string;
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
      if (filters?.property && filters.property.length > 0) {
        params.property = filters.property.join(',')
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

      console.log('📅 ReservationService: Query params:', params)
      
      const response = await apiClient.get<Reservation[]>('/reservations', params);
      console.log('📅 ReservationService: Raw API Response:', response)
      
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
    return apiClient.get<Reservation>(`/reservations/${id}`);
  }

  // Create new reservation
  async createReservation(data: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
    return apiClient.post<Reservation>('/reservations', data);
  }

  // Update reservation
  async updateReservation(id: string, data: Partial<Reservation>): Promise<ApiResponse<Reservation>> {
    return apiClient.put<Reservation>(`/reservations/${id}`, data);
  }

  // Delete reservation
  async deleteReservation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/reservations/${id}`);
  }

  // Get reservation statistics
  async getReservationStats(): Promise<ApiResponse<ReservationStats>> {
    return apiClient.get<ReservationStats>('/reservations/stats');
  }

  // Get available properties for filtering
  async getAvailableProperties(): Promise<ApiResponse<{id: string, name: string}[]>> {
    return apiClient.get<{id: string, name: string}[]>('/properties');
  }
}

export const reservationService = new ReservationService();
