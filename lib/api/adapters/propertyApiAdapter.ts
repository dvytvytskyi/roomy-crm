/**
 * Property API Adapter for Super Endpoint
 * Handles all property-related API calls with unified interface
 */

export interface PropertyDetailed {
  id: string;
  name: string;
  nickname?: string;
  title?: string;
  type: string;
  typeOfUnit: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  pricePerNight: number;
  description?: string;
  amenities: string[];
  houseRules: string[];
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  primaryImage?: string;
  pricelabId?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;
  agentId?: string;
  
  // Extended fields
  summary?: string;
  theSpace?: string;
  guestAccess?: string;
  otherThings?: string;
  
  // Availability settings
  bookingWindow?: string;
  advanceNotice?: string;
  minStay?: number;
  maxStay?: number;
  
  // Utilities and additional settings
  utilities: string[];
  incomeDistribution?: any;
  
  // Financial settings
  agencyFeePercentage?: number;
  referringAgentFeePercentage?: number;
  dtcmLicenseExpiry?: Date;
  
  // Additional property details
  parkingSlots?: number;
  checkInTime?: string;
  checkOutTime?: string;
  
  // Related data
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    country?: string;
    flag?: string;
  };
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    country?: string;
    flag?: string;
  };
  photos?: Array<{
    id: string;
    url: string;
    isCover: boolean;
    alt?: string;
    order: number;
    createdAt: Date;
  }>;
  pricingRules?: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    conditions?: any;
    createdAt: Date;
    updatedAt: Date;
  }>;
  transactions?: Array<{
    id: string;
    transactionId: string;
    type: string;
    category: string;
    amount: number;
    currency: string;
    description?: string;
    platform?: string;
    status: string;
    paymentMethod?: string;
    createdAt: Date;
  }>;
  reservations?: Array<{
    id: string;
    reservationId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalAmount: number;
    status: string;
    guestName?: string;
    guestEmail?: string;
    createdAt: Date;
  }>;
  expenses?: Array<{
    id: string;
    date: Date;
    category: string;
    amount: number;
    description?: string;
    receiptUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  auditLogs?: Array<{
    id: string;
    action: string;
    entityType: string;
    changes?: any;
    userId?: string;
    createdAt: Date;
  }>;
  _count?: {
    reservations?: number;
    photos?: number;
    pricingRules?: number;
    transactions?: number;
    expenses?: number;
    auditLogs?: number;
  };
}

export interface PropertyApiResponse {
  success: boolean;
  data?: PropertyDetailed;
  error?: string;
  message?: string;
}

class PropertyApiAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get property by ID with ALL related data (Super Endpoint)
   */
  async getById(id: string): Promise<PropertyApiResponse> {
    try {
      const response = await this.makeRequest<PropertyApiResponse>(`/properties/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching property:', error);
      return {
        success: false,
        error: 'Failed to fetch property data',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update property with partial data
   */
  async update(id: string, data: Partial<PropertyDetailed>): Promise<PropertyApiResponse> {
    try {
      const response = await this.makeRequest<PropertyApiResponse>(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error updating property:', error);
      return {
        success: false,
        error: 'Failed to update property',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update property amenities
   */
  async updateAmenities(id: string, amenityIds: string[]): Promise<PropertyApiResponse> {
    try {
      const response = await this.makeRequest<PropertyApiResponse>(`/properties/${id}/amenities`, {
        method: 'PUT',
        body: JSON.stringify({ amenityIds }),
      });
      return response;
    } catch (error) {
      console.error('Error updating amenities:', error);
      return {
        success: false,
        error: 'Failed to update amenities',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update property owner
   */
  async updateOwner(id: string, ownerIds: string[]): Promise<PropertyApiResponse> {
    try {
      const response = await this.makeRequest<PropertyApiResponse>(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ownerIds }),
      });
      return response;
    } catch (error) {
      console.error('Error updating owner:', error);
      return {
        success: false,
        error: 'Failed to update owner',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete property
   */
  async delete(id: string): Promise<PropertyApiResponse> {
    try {
      const response = await this.makeRequest<PropertyApiResponse>(`/properties/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting property:', error);
      return {
        success: false,
        error: 'Failed to delete property',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all owners for selection
   */
  async getOwners(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: any[]; error?: string }>('/users?role=OWNER');
      return response;
    } catch (error) {
      console.error('Error fetching owners:', error);
      return {
        success: false,
        error: 'Failed to fetch owners',
      };
    }
  }

  /**
   * Get all amenities for selection
   */
  async getAmenities(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: any[]; error?: string }>('/amenities');
      return response;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      return {
        success: false,
        error: 'Failed to fetch amenities',
      };
    }
  }

  /**
   * Get locations for selection
   */
  async getLocations(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: any[]; error?: string }>('/locations');
      return response;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return {
        success: false,
        error: 'Failed to fetch locations',
      };
    }
  }

  /**
   * Get agents for selection
   */
  async getAgents(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; data?: any[]; error?: string }>('/users?role=AGENT');
      return response;
    } catch (error) {
      console.error('Error fetching agents:', error);
      return {
        success: false,
        error: 'Failed to fetch agents',
      };
    }
  }
}

export const propertyApiAdapter = new PropertyApiAdapter();
