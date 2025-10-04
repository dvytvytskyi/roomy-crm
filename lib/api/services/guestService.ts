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
    // Always return mock data for now
    console.log('👥 GuestService: Using mock guests data');
    
    const mockGuests: Guest[] = [
      {
        id: 'guest_1',
        name: 'John Smith',
        nationality: 'American',
        dateOfBirth: '1985-03-15',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        whatsapp: '+1 (555) 123-4567',
        telegram: '@johnsmith',
        reservationCount: 5,
        unit: 'Apartment Burj Khalifa 1A',
        comments: 'VIP guest, prefers high floors. Excellent communication.',
        customCategories: ['Star Guest', 'VIP'],
        starGuest: true,
        primaryGuest: true,
        loyaltyTier: 'Gold',
        preferredLanguage: 'English',
        specialRequests: 'Ground floor units preferred, late checkout',
        documents: [],
        createdBy: 'Admin',
        createdAt: '2024-01-15T10:30:00Z',
        lastModifiedBy: 'Manager',
        lastModifiedAt: '2024-07-20T14:20:00Z'
      },
      {
        id: 'guest_2',
        name: 'Maria Garcia',
        nationality: 'Spanish',
        dateOfBirth: '1990-07-22',
        email: 'maria.garcia@example.com',
        phone: '+34 612 345 678',
        whatsapp: '+34 612 345 678',
        telegram: '@mariag',
        reservationCount: 3,
        unit: 'Apartment Marina 2B',
        comments: 'Family with children, needs baby crib. Very friendly.',
        customCategories: ['Family Guest'],
        starGuest: false,
        primaryGuest: true,
        loyaltyTier: 'Silver',
        preferredLanguage: 'Spanish',
        specialRequests: 'Baby crib and high chair needed',
        documents: [],
        createdBy: 'Admin',
        createdAt: '2024-02-10T09:15:00Z',
        lastModifiedBy: 'Admin',
        lastModifiedAt: '2024-06-15T11:45:00Z'
      },
      {
        id: 'guest_3',
        name: 'Ahmed Hassan',
        nationality: 'Egyptian',
        dateOfBirth: '1988-12-03',
        email: 'ahmed.hassan@example.com',
        phone: '+20 123 456 7890',
        whatsapp: '+20 123 456 7890',
        telegram: '',
        reservationCount: 1,
        unit: 'Studio Downtown 3C',
        comments: 'Business traveler, needs quiet room. Professional.',
        customCategories: ['Business Guest'],
        starGuest: false,
        primaryGuest: false,
        loyaltyTier: 'Bronze',
        preferredLanguage: 'Arabic',
        specialRequests: 'Quiet room, late checkout',
        documents: [],
        createdBy: 'Manager',
        createdAt: '2024-03-05T16:20:00Z',
        lastModifiedBy: 'Manager',
        lastModifiedAt: '2024-03-05T16:20:00Z'
      },
      {
        id: 'guest_4',
        name: 'Sarah Johnson',
        nationality: 'British',
        dateOfBirth: '1992-05-18',
        email: 'sarah.johnson@example.com',
        phone: '+44 7700 900123',
        whatsapp: '+44 7700 900123',
        telegram: '@sarahj',
        reservationCount: 8,
        unit: 'Penthouse Skyline 5A',
        comments: 'Loyalty program member, frequent visitor. VIP status.',
        customCategories: ['Star Guest', 'Loyalty Program'],
        starGuest: true,
        primaryGuest: true,
        loyaltyTier: 'Platinum',
        preferredLanguage: 'English',
        specialRequests: 'City view preferred, early check-in',
        documents: [],
        createdBy: 'Admin',
        createdAt: '2023-11-20T08:30:00Z',
        lastModifiedBy: 'Admin',
        lastModifiedAt: '2024-08-10T12:15:00Z'
      },
      {
        id: 'guest_5',
        name: 'Chen Wei',
        nationality: 'Chinese',
        dateOfBirth: '1987-09-12',
        email: 'chen.wei@example.com',
        phone: '+86 138 0013 8000',
        whatsapp: '+86 138 0013 8000',
        telegram: '@chenwei',
        reservationCount: 2,
        unit: 'Apartment Business 4D',
        comments: 'Corporate booking, group leader. Business focused.',
        customCategories: ['Corporate Guest'],
        starGuest: false,
        primaryGuest: true,
        loyaltyTier: 'Silver',
        preferredLanguage: 'Chinese',
        specialRequests: 'Meeting room access, group discounts',
        documents: [],
        createdBy: 'Manager',
        createdAt: '2024-04-12T13:45:00Z',
        lastModifiedBy: 'Manager',
        lastModifiedAt: '2024-07-25T10:30:00Z'
      },
      {
        id: 'guest_6',
        name: 'Emma Thompson',
        nationality: 'Australian',
        dateOfBirth: '1995-11-28',
        email: 'emma.thompson@example.com',
        phone: '+61 412 345 678',
        whatsapp: '+61 412 345 678',
        telegram: '@emmat',
        reservationCount: 4,
        unit: 'Beach Villa Palm Jumeirah',
        comments: 'Young professional, loves beach views. Very active.',
        customCategories: ['Young Professional'],
        starGuest: true,
        primaryGuest: true,
        loyaltyTier: 'Gold',
        preferredLanguage: 'English',
        specialRequests: 'Beach view, gym access',
        documents: [],
        createdBy: 'Agent',
        createdAt: '2024-05-20T15:10:00Z',
        lastModifiedBy: 'Agent',
        lastModifiedAt: '2024-08-15T09:20:00Z'
      }
    ];

    // Apply basic filtering
    let filteredGuests = [...mockGuests];

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredGuests = filteredGuests.filter(guest => 
        guest.name.toLowerCase().includes(searchTerm) ||
        guest.email.toLowerCase().includes(searchTerm) ||
        guest.nationality.toLowerCase().includes(searchTerm)
      );
    }

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
  }

  async getGuestById(id: string): Promise<ApiResponse<Guest>> {
    // Always return mock data for now
    console.log('👤 GuestService: Using mock guest data for ID:', id);
    
    const mockGuests: Guest[] = [
      {
        id: 'guest_1',
        name: 'John Smith',
        nationality: 'American',
        dateOfBirth: '1985-03-15',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        whatsapp: '+1 (555) 123-4567',
        telegram: '@johnsmith',
        reservationCount: 5,
        unit: 'Apartment Burj Khalifa 1A',
        comments: 'VIP guest, prefers high floors. Excellent communication.',
        customCategories: ['Star Guest', 'VIP'],
        starGuest: true,
        primaryGuest: true,
        loyaltyTier: 'Gold',
        preferredLanguage: 'English',
        specialRequests: 'Ground floor units preferred, late checkout',
        documents: [],
        createdBy: 'Admin',
        createdAt: '2024-01-15T10:30:00Z',
        lastModifiedBy: 'Manager',
        lastModifiedAt: '2024-07-20T14:20:00Z'
      },
      {
        id: 'guest_2',
        name: 'Maria Garcia',
        nationality: 'Spanish',
        dateOfBirth: '1990-07-22',
        email: 'maria.garcia@example.com',
        phone: '+34 612 345 678',
        whatsapp: '+34 612 345 678',
        telegram: '@mariag',
        reservationCount: 3,
        unit: 'Apartment Marina 2B',
        comments: 'Family with children, needs baby crib. Very friendly.',
        customCategories: ['Family Guest'],
        starGuest: false,
        primaryGuest: true,
        loyaltyTier: 'Silver',
        preferredLanguage: 'Spanish',
        specialRequests: 'Baby crib and high chair needed',
        documents: [],
        createdBy: 'Admin',
        createdAt: '2024-02-10T09:15:00Z',
        lastModifiedBy: 'Admin',
        lastModifiedAt: '2024-06-15T11:45:00Z'
      },
      {
        id: 'guest_3',
        name: 'Ahmed Hassan',
        nationality: 'Egyptian',
        dateOfBirth: '1988-12-03',
        email: 'ahmed.hassan@example.com',
        phone: '+20 123 456 7890',
        whatsapp: '+20 123 456 7890',
        telegram: '',
        reservationCount: 1,
        unit: 'Studio Downtown 3C',
        comments: 'Business traveler, needs quiet room. Professional.',
        customCategories: ['Business Guest'],
        starGuest: false,
        primaryGuest: false,
        loyaltyTier: 'Bronze',
        preferredLanguage: 'Arabic',
        specialRequests: 'Quiet room, late checkout',
        documents: [],
        createdBy: 'Manager',
        createdAt: '2024-03-05T16:20:00Z',
        lastModifiedBy: 'Manager',
        lastModifiedAt: '2024-03-05T16:20:00Z'
      },
      {
        id: 'guest_4',
        name: 'Sarah Johnson',
        nationality: 'British',
        dateOfBirth: '1992-05-18',
        email: 'sarah.johnson@example.com',
        phone: '+44 7700 900123',
        whatsapp: '+44 7700 900123',
        telegram: '@sarahj',
        reservationCount: 8,
        unit: 'Penthouse Skyline 5A',
        comments: 'Loyalty program member, frequent visitor. VIP status.',
        customCategories: ['Star Guest', 'Loyalty Program'],
        starGuest: true,
        primaryGuest: true,
        loyaltyTier: 'Platinum',
        preferredLanguage: 'English',
        specialRequests: 'City view preferred, early check-in',
        documents: [],
        createdBy: 'Admin',
        createdAt: '2023-11-20T08:30:00Z',
        lastModifiedBy: 'Admin',
        lastModifiedAt: '2024-08-10T12:15:00Z'
      },
      {
        id: 'guest_5',
        name: 'Chen Wei',
        nationality: 'Chinese',
        dateOfBirth: '1987-09-12',
        email: 'chen.wei@example.com',
        phone: '+86 138 0013 8000',
        whatsapp: '+86 138 0013 8000',
        telegram: '@chenwei',
        reservationCount: 2,
        unit: 'Apartment Business 4D',
        comments: 'Corporate booking, group leader. Business focused.',
        customCategories: ['Corporate Guest'],
        starGuest: false,
        primaryGuest: true,
        loyaltyTier: 'Silver',
        preferredLanguage: 'Chinese',
        specialRequests: 'Meeting room access, group discounts',
        documents: [],
        createdBy: 'Manager',
        createdAt: '2024-04-12T13:45:00Z',
        lastModifiedBy: 'Manager',
        lastModifiedAt: '2024-07-25T10:30:00Z'
      },
      {
        id: 'guest_6',
        name: 'Emma Thompson',
        nationality: 'Australian',
        dateOfBirth: '1995-11-28',
        email: 'emma.thompson@example.com',
        phone: '+61 412 345 678',
        whatsapp: '+61 412 345 678',
        telegram: '@emmat',
        reservationCount: 4,
        unit: 'Beach Villa Palm Jumeirah',
        comments: 'Young professional, loves beach views. Very active.',
        customCategories: ['Young Professional'],
        starGuest: true,
        primaryGuest: true,
        loyaltyTier: 'Gold',
        preferredLanguage: 'English',
        specialRequests: 'Beach view, gym access',
        documents: [],
        createdBy: 'Agent',
        createdAt: '2024-05-20T15:10:00Z',
        lastModifiedBy: 'Agent',
        lastModifiedAt: '2024-08-15T09:20:00Z'
      }
    ];

    const guest = mockGuests.find(g => g.id === id);
    
    if (!guest) {
      return {
        success: false,
        error: 'Guest not found'
      };
    }

    return {
      success: true,
      data: guest
    };
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
    // Always return mock stats for now
    console.log('👥 GuestService: Using mock guest stats');
    
    const mockStats: GuestStats = {
      totalGuests: 6,
      starGuests: 3,
      primaryGuests: 5,
      birthdaysThisMonth: 2,
      averageReservations: 3.8
    };

    return {
      success: true,
      data: mockStats
    };
  }

  async getGuestDetailStats(id: string): Promise<ApiResponse<GuestDetailStats>> {
    // Always return mock stats for now
    console.log('👤 GuestService: Using mock guest detail stats for ID:', id);
    
    const mockStats: GuestDetailStats = {
      totalReservations: 1,
      totalNights: 5,
      lifetimeValue: 2500,
      averageBookingValue: 2500,
      completedReservations: 1,
      upcomingReservations: 0,
      cancelledReservations: 0,
      lastActivity: '2024-03-05T16:20:00Z'
    };

    return {
      success: true,
      data: mockStats
    };
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


