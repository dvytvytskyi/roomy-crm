import { apiClient } from '../client';
import { API_CONFIG, API_ENDPOINTS } from '../config';
import { ApiResponse } from '../client';

export interface GuestFilters {
  nationality?: string[];
  dateOfBirth?: { from?: string; to?: string };
  reservationCount?: { min?: string; max?: string };
  unit?: string[];
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
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  telegram?: string;
  nationality: string;
  dateOfBirth: string;
  age?: number;
  reservationCount: number;
  unit?: string;
  comments?: string;
  customCategories: string[];
  starGuest: boolean;
  primaryGuest: boolean;
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  preferredLanguage?: string;
  specialRequests?: string;
  documents?: GuestDocument[];
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
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
    const params: any = {};

    if (filters?.nationality && filters.nationality.length > 0) {
      params.nationality = filters.nationality.join(',');
    }

    if (filters?.dateOfBirth) {
      if (filters.dateOfBirth.from) {
        params.dateOfBirthFrom = filters.dateOfBirth.from;
      }
      if (filters.dateOfBirth.to) {
        params.dateOfBirthTo = filters.dateOfBirth.to;
      }
    }

    if (filters?.reservationCount) {
      if (filters.reservationCount.min) {
        params.minReservations = filters.reservationCount.min;
      }
      if (filters.reservationCount.max) {
        params.maxReservations = filters.reservationCount.max;
      }
    }

    if (filters?.unit && filters.unit.length > 0) {
      params.unit = filters.unit.join(',');
    }

    if (filters?.searchTerm) {
      params.searchTerm = filters.searchTerm;
    }

    console.log('👥 GuestService: Query params:', params);

    const response = await apiClient.get<Guest[]>('/guests', params);
    console.log('👥 GuestService: Response:', response);

    return response;
  }

  async getGuestById(id: string): Promise<ApiResponse<Guest>> {
    const response = await apiClient.get<Guest>(`/guests/${id}`);
    return response;
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
    const response = await apiClient.get<GuestStats>('/guests/stats');
    return response;
  }

  async getGuestDetailStats(id: string): Promise<ApiResponse<GuestDetailStats>> {
    const response = await apiClient.get<GuestDetailStats>(`/guests/${id}/stats`);
    return response;
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

