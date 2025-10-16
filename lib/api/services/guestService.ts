import { apiClient } from '../client';
import { API_CONFIG, API_ENDPOINTS } from '../config';
import { ApiResponse } from '../client';
import { userServiceAdapter } from '../adapters/apiAdapter';

export interface GuestFilters {
  nationality?: string[];
  searchTerm?: string;
}

export interface GuestDocument {
  id: number;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
  url?: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  nationality?: string;
  dateOfBirth?: string;
  age?: number;
  reservationCount: number;
  unit?: string;
  comments?: string;
  customCategories?: string[];
  starGuest?: boolean;
  primaryGuest?: boolean;
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  preferredLanguage?: string;
  specialRequests?: string;
  documents?: GuestDocument[];
  createdBy?: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  _count?: {
    properties: number;
    reservations: number;
    transactions: number;
    documents: number;
    activity_log: number;
  };
  // Include related data from API
  transactions?: any[];
  documents?: any[];
  activity_log?: any[];
  reservations?: any[];
  // New fields for real data
  guestReservations?: any[];
  auditLogs?: any[];
}

export interface GuestStats {
  totalGuests: number;
  starGuests: number;
  primaryGuests: number;
  birthdaysThisMonth: number;
  averageReservations: number;
}

export interface GuestDetailStats {
  totalReservations: number;
  totalNights: number;
  lifetimeValue: number;
  averageBookingValue: number;
  completedReservations: number;
  upcomingReservations: number;
  cancelledReservations: number;
  lastActivity: string;
}

export interface GuestActivity {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  type: string;
}

class GuestService {
  async getGuests(filters?: GuestFilters): Promise<ApiResponse<Guest[]>> {
    console.log('👥 GuestService: Fetching real guests data from API');
    
    try {
      // Build query parameters as object
      const queryParams: any = {
        role: 'GUEST'
      };
      
      if (filters?.searchTerm) {
        queryParams.search = filters.searchTerm;
      }
      
      // Use the userServiceAdapter to get guests
      const response = await userServiceAdapter.getUsers(queryParams);
      
      if (response.success && response.data) {
        // Transform the API response to match our Guest interface
        const guests: Guest[] = response.data.map((user: any) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          nationality: user.nationality || 'N/A',
          dateOfBirth: user.dateOfBirth || 'N/A',
          reservationCount: user._count?.reservations || 0,
          unit: 'N/A', // This would need to be fetched separately
          comments: user.comments || '',
          customCategories: [],
          starGuest: false, // This would need business logic
          primaryGuest: false, // This would need business logic
          loyaltyTier: 'Bronze', // Default tier
          preferredLanguage: 'English', // Default language
          specialRequests: '',
          documents: [],
          createdBy: 'System',
          createdAt: user.createdAt,
          lastModifiedBy: 'System',
          lastModifiedAt: user.updatedAt,
          _count: user._count
        }));

        // Apply client-side filtering for fields not supported by backend
        let filteredGuests = [...guests];

        if (filters?.nationality && filters.nationality.length > 0) {
          filteredGuests = filteredGuests.filter(guest => 
            filters.nationality!.includes(guest.nationality)
          );
        }

        if (filters?.reservationCount) {
          if (filters.reservationCount.min) {
            const min = parseInt(filters.reservationCount.min);
            filteredGuests = filteredGuests.filter(guest => guest.reservationCount >= min);
          }
          if (filters.reservationCount.max) {
            const max = parseInt(filters.reservationCount.max);
            filteredGuests = filteredGuests.filter(guest => guest.reservationCount <= max);
          }
        }

        return {
          success: true,
          data: filteredGuests
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch guests'
        };
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      return {
        success: false,
        error: 'Failed to fetch guests'
      };
    }
  }

  async getGuestById(id: string): Promise<ApiResponse<Guest>> {
    console.log('👤 GuestService: Fetching real guest data for ID:', id);
    
    try {
      const response = await userServiceAdapter.getUserById(id);
      
      if (response.success && response.data) {
        const user = response.data;
        console.log('👤 Raw user data from API:', user);
        console.log('👤 User guestReservations:', user.guestReservations);
        
        // Transform the API response to match our Guest interface
        const guest: Guest = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          nationality: user.nationality || 'N/A',
          dateOfBirth: user.dateOfBirth || 'N/A',
          reservationCount: user._count?.reservations || 0,
          unit: user.guestReservations?.[0]?.properties?.name || 'N/A',
          comments: user.comments || '',
          customCategories: [],
          starGuest: (user._count?.reservations || 0) > 5, // Business logic for star guest
          primaryGuest: (user._count?.reservations || 0) > 0, // Business logic for primary guest
          loyaltyTier: 'Bronze', // Default tier
          preferredLanguage: 'English', // Default language
          specialRequests: '',
          documents: user.documents || [],
          createdBy: 'System',
          createdAt: user.createdAt,
          lastModifiedBy: 'System',
          lastModifiedAt: user.updatedAt,
          _count: user._count,
          // Include related data from API
          transactions: user.transactions || [],
          documents: user.documents || [],
          activity_log: user.activity_log || [],
          reservations: user.reservations || [],
          // New fields for real data
          guestReservations: user.guestReservations || [],
          auditLogs: user.auditLogs || []
        };

        return {
          success: true,
          data: guest
        };
      } else {
        return {
          success: false,
          error: response.error || 'Guest not found'
        };
      }
    } catch (error) {
      console.error('Error fetching guest:', error);
      return {
        success: false,
        error: 'Failed to fetch guest'
      };
    }
  }

  async createGuest(guestData: Partial<Guest>): Promise<ApiResponse<Guest>> {
    const response = await apiClient.post<Guest>('/guests', guestData);
    return response;
  }

  async updateGuest(id: string, updateData: Partial<Guest>): Promise<ApiResponse<Guest>> {
    const response = await apiClient.put<Guest>(`/guests/${id}`, updateData);
    return response;
  }

  async deleteGuest(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/guests/${id}`);
    return response;
  }

  async getGuestStats(): Promise<ApiResponse<GuestStats>> {
    console.log('👥 GuestService: Fetching real guest stats from API');
    
    try {
      // Use the new statistics endpoint
      const response = await userServiceAdapter.getUserStats('GUEST');
      
      if (response.success && response.data) {
        const apiStats = response.data;
        
        // Transform API stats to match our GuestStats interface
        const stats: GuestStats = {
          totalGuests: apiStats.totalUsers || 0,
          starGuests: apiStats.usersWithReservations || 0, // Using users with reservations as star guests
          primaryGuests: apiStats.activeUsers || 0, // Using active users as primary guests
          birthdaysThisMonth: apiStats.birthdaysThisMonth || 0,
          averageReservations: apiStats.averageReservations || 0
        };

        return {
          success: true,
          data: stats
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch guest stats'
        };
      }
    } catch (error) {
      console.error('Error fetching guest stats:', error);
      return {
        success: false,
        error: 'Failed to fetch guest stats'
      };
    }
  }

  async getGuestDetailStats(id: string): Promise<ApiResponse<GuestDetailStats>> {
    console.log('👤 GuestService: Fetching real guest detail stats for ID:', id);
    
    try {
      // Use the new user detail statistics endpoint
      const response = await userServiceAdapter.getUserDetailStats(id);
      
      if (response.success && response.data) {
        const apiStats = response.data;
        
        // Transform API stats to match our GuestDetailStats interface
        const stats: GuestDetailStats = {
          totalReservations: apiStats.totalReservations || 0,
          totalNights: apiStats.totalNights || 0,
          lifetimeValue: apiStats.lifetimeValue || 0,
          averageBookingValue: apiStats.averageBookingValue || 0,
          completedReservations: apiStats.completedReservations || 0,
          upcomingReservations: apiStats.upcomingReservations || 0,
          cancelledReservations: apiStats.cancelledReservations || 0,
          lastActivity: apiStats.lastActivity || 'N/A'
        };

        return {
          success: true,
          data: stats
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch guest detail stats'
        };
      }
    } catch (error) {
      console.error('Error fetching guest detail stats:', error);
      return {
        success: false,
        error: 'Failed to fetch guest detail stats'
      };
    }
  }

  async getGuestReservations(id: string): Promise<ApiResponse<any[]>> {
    const response = await apiClient.get<any[]>(`/guests/${id}/reservations`);
    return response;
  }

  async getGuestActivity(id: string): Promise<ApiResponse<GuestActivity[]>> {
    const response = await apiClient.get<GuestActivity[]>(`/guests/${id}/activity`);
    return response;
  }

  async uploadDocument(id: string, file: File): Promise<ApiResponse<GuestDocument>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('mimetype', file.type);
    formData.append('size', file.size.toString());

    const response = await apiClient.post<GuestDocument>(`/guests/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  async deleteDocument(guestId: string, docId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/guests/${guestId}/documents/${docId}`);
    return response;
  }
}

export const guestService = new GuestService();


