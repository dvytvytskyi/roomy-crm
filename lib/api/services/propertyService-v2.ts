import { apiClientV2 } from '../client-v2';
import { API_V2_ENDPOINTS } from '../config-v2';

// V2 Property interfaces based on backend-v2 API
export interface PropertyV2 {
  id: string;
  name: string;
  nickname?: string;
  title?: string;
  type: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'PENTHOUSE' | 'HOUSE' | 'CONDO';
  typeOfUnit: 'SINGLE' | 'DOUBLE' | 'FAMILY' | 'SHARED';
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
  amenities?: string[];
  houseRules?: string[];
  tags?: string[];
  isActive: boolean;
  isPublished: boolean;
  primaryImage?: string;
  pricelabId?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
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
  pricingRules?: Array<{
    id: string;
    name: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'MINIMUM_PRICE' | 'MAXIMUM_PRICE';
    value: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    conditions?: any;
  }>;
  _count?: {
    reservations: number;
    photos: number;
    pricingRules: number;
  };
}

export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  ownerId?: string;
  agentId?: string;
}

export interface CreatePropertyRequest {
  name: string;
  nickname?: string;
  title?: string;
  type: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'PENTHOUSE' | 'HOUSE' | 'CONDO';
  typeOfUnit: 'SINGLE' | 'DOUBLE' | 'FAMILY' | 'SHARED';
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
  amenities?: string[];
  houseRules?: string[];
  tags?: string[];
  primaryImage?: string;
  pricelabId?: string;
  ownerIds?: string[];
}

export interface UpdatePropertyRequest {
  name?: string;
  nickname?: string;
  title?: string;
  type?: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'PENTHOUSE' | 'HOUSE' | 'CONDO';
  typeOfUnit?: 'SINGLE' | 'DOUBLE' | 'FAMILY' | 'SHARED';
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  pricePerNight?: number;
  description?: string;
  amenities?: string[];
  houseRules?: string[];
  tags?: string[];
  isActive?: boolean;
  isPublished?: boolean;
  primaryImage?: string;
  pricelabId?: string;
  ownerIds?: string[];
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

class PropertyServiceV2 {
  // Get all properties with pagination and filtering
  async getAll(params: PropertyQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<PropertyV2>>> {
    console.log('🏠 PropertyServiceV2: Fetching properties from V2 API...');
    console.log('🏠 PropertyServiceV2: Query params:', params);
    
    try {
      const response = await apiClientV2.get<PaginatedResponse<PropertyV2>>(
        API_V2_ENDPOINTS.PROPERTIES.BASE,
        params
      );
      
      console.log('🏠 PropertyServiceV2: API Response:', response);
      console.log('🏠 PropertyServiceV2: Properties count:', response.data?.data?.length || 0);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🏠 PropertyServiceV2: Error fetching properties:', error);
      throw error;
    }
  }

  // Get property by ID with all related data
  async getById(id: string): Promise<ApiResponseV2<PropertyV2>> {
    console.log('🏠 PropertyServiceV2: Fetching property by ID:', id);
    
    try {
      const response = await apiClientV2.get<PropertyV2>(
        API_V2_ENDPOINTS.PROPERTIES.BY_ID(id)
      );
      
      console.log('🏠 PropertyServiceV2: Property details:', response.data);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🏠 PropertyServiceV2: Error fetching property:', error);
      throw error;
    }
  }

  // Get properties by owner ID
  async getByOwner(ownerId: string, params: PropertyQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<PropertyV2>>> {
    return this.getAll({ ...params, ownerId });
  }

  // Get properties by agent ID
  async getByAgent(agentId: string, params: PropertyQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<PropertyV2>>> {
    return this.getAll({ ...params, agentId });
  }

  // Search properties
  async search(searchTerm: string, params: PropertyQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<PropertyV2>>> {
    return this.getAll({ ...params, search: searchTerm });
  }

  // Get properties by type
  async getByType(type: string, params: PropertyQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<PropertyV2>>> {
    return this.getAll({ ...params, type });
  }

  // Get published properties (for public access)
  async getPublished(params: PropertyQueryParams = {}): Promise<ApiResponseV2<PaginatedResponse<PropertyV2>>> {
    return this.getAll({ ...params, status: 'ACTIVE' });
  }

  // Create new property
  async create(propertyData: CreatePropertyRequest): Promise<ApiResponseV2<PropertyV2>> {
    console.log('🏠 PropertyServiceV2: Creating property...');
    console.log('🏠 PropertyServiceV2: Property data:', propertyData);
    
    try {
      const response = await apiClientV2.post<PropertyV2>(
        API_V2_ENDPOINTS.PROPERTIES.BASE,
        propertyData
      );
      
      console.log('🏠 PropertyServiceV2: Property created:', response.data);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🏠 PropertyServiceV2: Error creating property:', error);
      throw error;
    }
  }

  // Update property
  async update(id: string, propertyData: UpdatePropertyRequest): Promise<ApiResponseV2<PropertyV2>> {
    console.log('🏠 PropertyServiceV2: Updating property:', id);
    console.log('🏠 PropertyServiceV2: Update data:', propertyData);
    
    try {
      const response = await apiClientV2.put<PropertyV2>(
        API_V2_ENDPOINTS.PROPERTIES.BY_ID(id),
        propertyData
      );
      
      console.log('🏠 PropertyServiceV2: Property updated:', response.data);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🏠 PropertyServiceV2: Error updating property:', error);
      throw error;
    }
  }

  async updateMarketing(id: string, marketingData: any): Promise<ApiResponseV2<PropertyV2>> {
    console.log('🏠 PropertyServiceV2: Updating property marketing:', id);
    console.log('🏠 PropertyServiceV2: Marketing data:', marketingData);
    
    try {
      const response = await apiClientV2.put<PropertyV2>(
        API_V2_ENDPOINTS.PROPERTIES.MARKETING(id),
        marketingData
      );
      
      console.log('🏠 PropertyServiceV2: Property marketing updated:', response.data);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🏠 PropertyServiceV2: Error updating property marketing:', error);
      throw error;
    }
  }

  async updateAvailability(id: string, availabilityData: any): Promise<ApiResponseV2<PropertyV2>> {
    console.log('🏠 PropertyServiceV2: Updating property availability:', id);
    console.log('🏠 PropertyServiceV2: Availability data:', availabilityData);
    
    try {
      const response = await apiClientV2.put<PropertyV2>(
        API_V2_ENDPOINTS.PROPERTIES.AVAILABILITY(id),
        availabilityData
      );
      
      console.log('🏠 PropertyServiceV2: Property availability updated:', response.data);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🏠 PropertyServiceV2: Error updating property availability:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<ApiResponseV2<PropertyV2>> {
    console.log('🏠 PropertyServiceV2: Deleting property:', id);
    
    try {
      const response = await apiClientV2.delete<PropertyV2>(
        API_V2_ENDPOINTS.PROPERTIES.BY_ID(id)
      );
      
      console.log('🏠 PropertyServiceV2: Property deleted:', response.data);
      
      return {
        success: response.success,
        data: response.data!,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🏠 PropertyServiceV2: Error deleting property:', error);
      throw error;
    }
  }
}

export const propertyServiceV2 = new PropertyServiceV2();
