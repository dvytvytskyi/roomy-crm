import { apiClientV2 } from '../client-v2';
import { API_V2_ENDPOINTS } from '../config-v2';

// V2 Reservation interfaces based on backend-v2 API
export interface ReservationV2 {
  id: string;
  reservationId: string;
  propertyId: string;
  guestId?: string;
  agentId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paidAmount?: number;
  outstandingBalance?: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'MODIFIED';
  source: 'DIRECT' | 'AIRBNB' | 'BOOKING_COM' | 'VRBO' | 'EXPEDIA' | 'OTHER';
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    primaryImage?: string;
    owner?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      role: string;
    };
    agent?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      role: string;
    };
    photos?: Array<{
      id: string;
      url: string;
      isCover: boolean;
      alt?: string;
      order: number;
    }>;
  };
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
  };
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
  };
  _count?: {
    transactions: number;
  };
}

export interface ReservationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  propertyId?: string;
  guestId?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateReservationRequest {
  propertyId: string;
  guestId?: string;
  agentId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paidAmount?: number;
  source?: 'DIRECT' | 'AIRBNB' | 'BOOKING_COM' | 'VRBO' | 'EXPEDIA' | 'OTHER';
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  notes?: string;
}

export interface UpdateReservationRequest {
  propertyId?: string;
  guestId?: string;
  agentId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  totalAmount?: number;
  paidAmount?: number;
  outstandingBalance?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'MODIFIED';
  source?: 'DIRECT' | 'AIRBNB' | 'BOOKING_COM' | 'VRBO' | 'EXPEDIA' | 'OTHER';
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponseV2<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

class ReservationServiceV2 {
  // Get all reservations with pagination and filtering
  async getAll(params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    console.log('📅 ReservationServiceV2: Fetching reservations from V2 API...');
    console.log('📅 ReservationServiceV2: Query params:', params);
    
    try {
      const response = await apiClientV2.get<PaginatedResponse<ReservationV2>>(
        API_V2_ENDPOINTS.RESERVATIONS.BASE,
        params
      );
      
      console.log('📅 ReservationServiceV2: API Response:', response);
      console.log('📅 ReservationServiceV2: Reservations count:', response.data?.data?.length || 0);
      
      return response;
    } catch (error) {
      console.error('📅 ReservationServiceV2: Error fetching reservations:', error);
      throw error;
    }
  }

  // Get reservation by ID with all related data
  async getById(id: string): Promise<ApiResponseV2<ReservationV2>> {
    console.log('📅 ReservationServiceV2: Fetching reservation by ID:', id);
    
    try {
      const response = await apiClientV2.get<ReservationV2>(
        API_V2_ENDPOINTS.RESERVATIONS.BY_ID(id)
      );
      
      console.log('📅 ReservationServiceV2: Reservation details:', response.data);
      
      return response;
    } catch (error) {
      console.error('📅 ReservationServiceV2: Error fetching reservation:', error);
      throw error;
    }
  }

  // Get reservations by property ID
  async getByProperty(propertyId: string, params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    return this.getAll({ ...params, propertyId });
  }

  // Get reservations by guest ID
  async getByGuest(guestId: string, params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    return this.getAll({ ...params, guestId });
  }

  // Get reservations by agent ID
  async getByAgent(agentId: string, params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    return this.getAll({ ...params, agentId });
  }

  // Get reservations by status
  async getByStatus(status: string, params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    return this.getAll({ ...params, status });
  }

  // Get reservations by date range
  async getByDateRange(dateFrom: string, dateTo: string, params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    return this.getAll({ ...params, dateFrom, dateTo });
  }

  // Search reservations
  async search(searchTerm: string, params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    return this.getAll({ ...params, search: searchTerm });
  }

  // Get upcoming reservations
  async getUpcoming(params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll({ ...params, dateFrom: today, status: 'CONFIRMED' });
  }

  // Get current reservations (check-in today or earlier, check-out today or later)
  async getCurrent(params: ReservationQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<ReservationV2>>> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll({ 
      ...params, 
      dateFrom: today, 
      dateTo: today,
      status: 'CONFIRMED' 
    });
  }

  // Create new reservation
  async create(reservationData: CreateReservationRequest): Promise<ApiResponseV2<ReservationV2>> {
    console.log('📅 ReservationServiceV2: Creating reservation...');
    console.log('📅 ReservationServiceV2: Reservation data:', reservationData);
    
    try {
      const response = await apiClientV2.post<ReservationV2>(
        API_V2_ENDPOINTS.RESERVATIONS.BASE,
        reservationData
      );
      
      console.log('📅 ReservationServiceV2: Reservation created:', response.data);
      
      return response;
    } catch (error) {
      console.error('📅 ReservationServiceV2: Error creating reservation:', error);
      throw error;
    }
  }

  // Update reservation
  async update(id: string, reservationData: UpdateReservationRequest): Promise<ApiResponseV2<ReservationV2>> {
    console.log('📅 ReservationServiceV2: Updating reservation:', id);
    console.log('📅 ReservationServiceV2: Update data:', reservationData);
    
    try {
      const response = await apiClientV2.put<ReservationV2>(
        API_V2_ENDPOINTS.RESERVATIONS.BY_ID(id),
        reservationData
      );
      
      console.log('📅 ReservationServiceV2: Reservation updated:', response.data);
      
      return response;
    } catch (error) {
      console.error('📅 ReservationServiceV2: Error updating reservation:', error);
      throw error;
    }
  }
}

export const reservationServiceV2 = new ReservationServiceV2();
