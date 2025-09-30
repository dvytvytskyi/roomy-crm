import { apiClient } from '../client';
import { API_ENDPOINTS, ApiResponse, API_CONFIG } from '../config';

export interface Property {
  id: string;
  name: string;
  nickname?: string;
  type: string;
  location: string;
  address: string;
  size: string;
  beds: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  checkIn: string;
  checkOut: string;
  description?: string;
  parkingSlots?: number;
  agencyFee?: number;
  dtcmLicenseExpiry?: string;
  referringAgent?: string;
  unitIntakeDate?: string;
  photos?: string[];
  amenities?: string[];
  rules?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyUpdateData {
  name?: string;
  nickname?: string;
  type?: string;
  location?: string;
  address?: string;
  size?: string;
  beds?: string;
  status?: 'Active' | 'Inactive' | 'Maintenance';
  checkIn?: string;
  checkOut?: string;
  description?: string;
  parkingSlots?: number;
  agencyFee?: number;
  dtcmLicenseExpiry?: string;
  referringAgent?: string;
  unitIntakeDate?: string;
}

export interface PropertyStats {
  occupancyRate: number;
  occupancyNights: number;
  totalNights: number;
  avgCostPerNight: number;
  monthlyPayout: number;
  pricePerNight: number;
}

export class PropertyService {
  // Get property by ID
  async getProperty(propertyId: string): Promise<ApiResponse<Property>> {
    return apiClient.get<Property>(`/properties/${propertyId}`);
  }

  // Update property
  async updateProperty(propertyId: string, data: PropertyUpdateData): Promise<ApiResponse<Property>> {
    return apiClient.put<Property>(`/properties/${propertyId}`, data);
  }

  // Get property statistics
  async getPropertyStats(propertyId: string): Promise<ApiResponse<PropertyStats>> {
    return apiClient.get<PropertyStats>(`/properties/${propertyId}/stats`);
  }

  // Get all properties
  async getProperties(): Promise<ApiResponse<Property[]>> {
    console.log('🏠 PropertyService: Fetching properties from API...')
    console.log('🏠 PropertyService: API Base URL:', API_CONFIG.BASE_URL)
    console.log('🏠 PropertyService: Full endpoint:', `${API_CONFIG.BASE_URL}/properties`)
    
    // Check if user is authenticated
    const isAuthenticated = apiClient.isAuthenticated()
    console.log('🏠 PropertyService: User authenticated:', isAuthenticated)
    
    if (!isAuthenticated) {
      console.log('🏠 PropertyService: User not authenticated, trying to get properties without auth...')
    }
    
    try {
      const response = await apiClient.get<Property[]>('/properties');
      console.log('🏠 PropertyService: Raw API Response:', response)
      console.log('🏠 PropertyService: Response success:', response.success)
      console.log('🏠 PropertyService: Response data type:', typeof response.data)
      console.log('🏠 PropertyService: Response data length:', response.data?.length)
      
      if (response.success && response.data) {
        console.log('🏠 PropertyService: Properties data:', response.data)
        if (response.data.length > 0) {
          console.log('🏠 PropertyService: First property structure:', response.data[0])
          console.log('🏠 PropertyService: First property keys:', Object.keys(response.data[0]))
          console.log('🏠 PropertyService: First property values:', Object.values(response.data[0]))
        } else {
          console.log('🏠 PropertyService: No properties returned from API')
        }
      } else {
        console.log('🏠 PropertyService: API call failed or returned no data')
        console.log('🏠 PropertyService: Error details:', response.error)
      }
      
      return response;
    } catch (error) {
      console.error('🏠 PropertyService: Error fetching properties:', error)
      console.error('🏠 PropertyService: Error type:', typeof error)
      console.error('🏠 PropertyService: Error message:', error instanceof Error ? error.message : 'Unknown error')
      
      // If it's a 401 error, try without authentication
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🏠 PropertyService: 401 error detected, trying without auth...')
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/properties`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('🏠 PropertyService: Success without auth:', data)
            return {
              success: true,
              data: data.data || data,
            }
          }
        } catch (noAuthError) {
          console.error('🏠 PropertyService: Even without auth failed:', noAuthError)
        }
      }
      
      // Return empty array on error to prevent crashes
      return {
        success: false,
        data: [],
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch properties',
          statusCode: 500
        }
      };
    }
  }

  // Create new property
  async createProperty(data: PropertyUpdateData): Promise<ApiResponse<Property>> {
    return apiClient.post<Property>('/properties', data);
  }

  // Delete property
  async deleteProperty(propertyId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/properties/${propertyId}`);
  }

  // Update property photos
  async updatePropertyPhotos(propertyId: string, photos: string[]): Promise<ApiResponse<Property>> {
    return apiClient.put<Property>(`/properties/${propertyId}/photos`, { photos });
  }

  // Update property amenities
  async updatePropertyAmenities(propertyId: string, amenities: string[]): Promise<ApiResponse<Property>> {
    return apiClient.put<Property>(`/properties/${propertyId}/amenities`, { amenities });
  }

  // Update property rules
  async updatePropertyRules(propertyId: string, rules: string[]): Promise<ApiResponse<Property>> {
    return apiClient.put<Property>(`/properties/${propertyId}/rules`, { rules });
  }

  // Validate property data
  validatePropertyData(data: PropertyUpdateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.name && data.name.trim().length < 3) {
      errors.push('Property name must be at least 3 characters long');
    }

    if (data.type && !['Apartment', 'Villa', 'Townhouse', 'Studio', 'Penthouse'].includes(data.type)) {
      errors.push('Property type must be one of: Apartment, Villa, Townhouse, Studio, Penthouse');
    }

    if (data.status && !['Active', 'Inactive', 'Maintenance'].includes(data.status)) {
      errors.push('Property status must be one of: Active, Inactive, Maintenance');
    }

    if (data.parkingSlots && data.parkingSlots < 0) {
      errors.push('Parking slots must be a positive number');
    }

    if (data.agencyFee && (data.agencyFee < 0 || data.agencyFee > 100)) {
      errors.push('Agency fee must be between 0% and 100%');
    }

    if (data.checkIn && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.checkIn)) {
      errors.push('Check-in time must be in HH:MM format');
    }

    if (data.checkOut && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.checkOut)) {
      errors.push('Check-out time must be in HH:MM format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format property data for display
  formatPropertyForDisplay(property: Property): Record<string, string> {
    return {
      name: property.name,
      nickname: property.nickname || '',
      status: property.status,
      type: property.type,
      location: property.location,
      address: property.address,
      size: property.size,
      beds: property.beds,
      parkingSlots: property.parkingSlots?.toString() || '0',
      agencyFee: property.agencyFee ? `${property.agencyFee}%` : '0%',
      dtcmLicenseExpiry: property.dtcmLicenseExpiry || '',
      referringAgent: property.referringAgent || '',
      checkIn: property.checkIn,
      checkOut: property.checkOut,
      unitIntakeDate: property.unitIntakeDate || ''
    };
  }
}

export const propertyService = new PropertyService();