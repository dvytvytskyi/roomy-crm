import { apiClient } from '../config'

export interface Property {
  id: string
  name: string
  type: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'PENTHOUSE'
  address: string
  city: string
  capacity: number
  bedrooms: number
  bathrooms: number
  pricePerNight: number
  primaryImage: string
  agentId?: number
  agentName?: string
  status: 'Active' | 'Inactive'
  createdAt: string
  lastModifiedAt: string
}

export interface CreatePropertyRequest {
  name: string
  type: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'PENTHOUSE'
  address: string
  city: string
  country?: string
  capacity: number
  bedrooms: number
  bathrooms: number
  area?: number
  pricePerNight: number
  description?: string
  amenities?: string[]
  primaryImage?: string
  agentId?: number
  agentName?: string
  status?: 'Active' | 'Inactive'
}

export interface UpdatePropertyRequest {
  name?: string
  type?: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'PENTHOUSE'
  address?: string
  city?: string
  capacity?: number
  bedrooms?: number
  bathrooms?: number
  pricePerNight?: number
  primaryImage?: string
  agentId?: number
  agentName?: string
  status?: 'Active' | 'Inactive'
}

export interface PropertyFilters {
  search?: string
  type?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  minCapacity?: number
  status?: string
  page?: number
  limit?: number
}

export interface PropertiesResponse {
  success: boolean
  data: Property[]
  total: number
}

export interface PropertyResponse {
  success: boolean
  data: Property
}

export interface PropertyUpdateResponse {
  success: boolean
  data: Property
  message: string
}

class PropertyService {
  // Get all properties
  async getProperties(): Promise<PropertiesResponse> {
    const response = await apiClient.get('/properties')
    return response.data
  }

  // Get property by ID
  async getProperty(id: string): Promise<PropertyResponse> {
    const response = await apiClient.get(`/properties/${id}`)
    return response.data
  }

  // Create new property
  async createProperty(data: CreatePropertyRequest): Promise<PropertyResponse> {
    const response = await apiClient.post('/properties', data)
    return response.data
  }

  // Update property
  async updateProperty(id: string, data: UpdatePropertyRequest): Promise<PropertyUpdateResponse> {
    const response = await apiClient.put(`/properties/${id}`, data)
    return response.data
  }

  // Assign property to agent
  async assignToAgent(propertyId: string, agentId: number): Promise<PropertyUpdateResponse> {
    return this.updateProperty(propertyId, { agentId })
  }

  // Unassign property from agent
  async unassignFromAgent(propertyId: string): Promise<PropertyUpdateResponse> {
    return this.updateProperty(propertyId, { agentId: undefined, agentName: undefined })
  }

  // Delete property
  async deleteProperty(id: string): Promise<PropertyUpdateResponse> {
    const response = await apiClient.delete(`/properties/${id}`)
    return response.data
  }
}

export const propertyService = new PropertyService()