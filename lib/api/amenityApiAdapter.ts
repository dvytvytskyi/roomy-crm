import { apiClient } from './client-v2';

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAmenityData {
  name: string;
  icon?: string;
  category?: string;
  description?: string;
}

export interface UpdateAmenityData {
  name?: string;
  icon?: string;
  category?: string;
  description?: string;
  is_active?: boolean;
}

export interface AmenityQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface PaginatedAmenitiesResponse {
  data: Amenity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AmenityApiAdapter {
  private baseUrl = '/amenities';

  /**
   * Get all amenities with pagination and filtering
   */
  async getAll(params: AmenityQueryParams = {}): Promise<PaginatedAmenitiesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.category) searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);

    const url = `${this.baseUrl}?${searchParams.toString()}`;
    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Get amenity by ID
   */
  async getById(id: string): Promise<Amenity> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create new amenity
   */
  async create(data: CreateAmenityData): Promise<Amenity> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Update amenity
   */
  async update(id: string, data: UpdateAmenityData): Promise<Amenity> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete amenity
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get amenity categories
   */
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get(`${this.baseUrl}/categories`);
    return response.data;
  }

  /**
   * Get amenities by category
   */
  async getByCategory(category: string, params: Omit<AmenityQueryParams, 'category'> = {}): Promise<PaginatedAmenitiesResponse> {
    return this.getAll({ ...params, category });
  }

  /**
   * Search amenities
   */
  async search(query: string, params: Omit<AmenityQueryParams, 'search'> = {}): Promise<PaginatedAmenitiesResponse> {
    return this.getAll({ ...params, search: query });
  }
}

export const amenityApiAdapter = new AmenityApiAdapter();
