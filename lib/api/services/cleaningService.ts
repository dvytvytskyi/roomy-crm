import { apiClient } from '../config'

export interface CleaningTask {
  id: number
  unit: string
  unitId: string
  type: 'Regular Clean' | 'Deep Clean' | 'Office Clean' | 'Post-Checkout' | 'Pre-Arrival' | 'Mid-Stay'
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  scheduledDate: string
  scheduledTime: string
  duration: string
  cleaner: string
  cleanerId: string
  cost: number
  notes?: string
  createdAt: string
  createdBy: string
  lastModifiedAt: string
  lastModifiedBy: string
}

export interface CleaningStats {
  totalTasks: number
  scheduledTasks: number
  completedTasks: number
  cancelledTasks: number
}

export interface CleaningFilters {
  search?: string
  status?: string[]
  type?: string[]
  cleaner?: string[]
  page?: number
  limit?: number
}

export interface CleaningResponse {
  success: boolean
  data: CleaningTask[]
  total: number
  page: number
  limit: number
}

export interface CleaningStatsResponse {
  success: boolean
  data: CleaningStats
}

export interface CleaningSingleResponse {
  success: boolean
  data: CleaningTask
}

export interface CleaningCreateRequest {
  unit: string
  unitId: string
  type: string
  status: string
  scheduledDate: string
  scheduledTime: string
  duration: string
  cleaner: string
  cleanerId: string
  cost: number
  notes?: string
}

export interface CleaningUpdateRequest {
  unit?: string
  unitId?: string
  type?: string
  status?: string
  scheduledDate?: string
  scheduledTime?: string
  duration?: string
  cleaner?: string
  cleanerId?: string
  cost?: number
  notes?: string
}

export interface CleaningDeleteResponse {
  success: boolean
  message: string
}

class CleaningService {
  // Get all cleaning tasks with filters
  async getCleaningTasks(filters: CleaningFilters = {}): Promise<CleaningResponse> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.status) {
      filters.status.forEach(status => params.append('status', status))
    }
    if (filters.type) {
      filters.type.forEach(type => params.append('type', type))
    }
    if (filters.cleaner) {
      filters.cleaner.forEach(cleaner => params.append('cleaner', cleaner))
    }
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`/cleaning?${params.toString()}`)
    return response.data
  }

  // Get cleaning statistics
  async getCleaningStats(): Promise<CleaningStatsResponse> {
    const response = await apiClient.get('/cleaning/stats')
    return response.data
  }

  // Get single cleaning task
  async getCleaningTask(id: number): Promise<CleaningSingleResponse> {
    const response = await apiClient.get(`/cleaning/${id}`)
    return response.data
  }

  // Create cleaning task
  async createCleaningTask(taskData: CleaningCreateRequest): Promise<CleaningSingleResponse> {
    const response = await apiClient.post('/cleaning', taskData)
    return response.data
  }

  // Update cleaning task
  async updateCleaningTask(id: number, data: CleaningUpdateRequest): Promise<CleaningSingleResponse> {
    const response = await apiClient.put(`/cleaning/${id}`, data)
    return response.data
  }

  // Delete cleaning task
  async deleteCleaningTask(id: number): Promise<CleaningDeleteResponse> {
    const response = await apiClient.delete(`/cleaning/${id}`)
    return response.data
  }
}

export const cleaningService = new CleaningService()
