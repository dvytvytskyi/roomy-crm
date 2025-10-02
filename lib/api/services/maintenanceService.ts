import { apiClient } from '../config'

export interface MaintenanceTask {
  id: number
  title: string
  unit: string
  unitId: string
  technician: string
  technicianId: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold'
  priority: 'Low' | 'Normal' | 'High' | 'Urgent'
  type: 'Plumbing' | 'Electrical' | 'HVAC' | 'General' | 'Emergency' | 'Preventive'
  scheduledDate: string
  estimatedDuration: string
  description: string
  cost?: number
  notes?: string
  createdAt: string
  createdBy: string
  lastModifiedAt: string
  lastModifiedBy: string
  // Additional fields for detail page
  category?: string
  date?: string
  contractor?: string
  inspector?: string
  price?: number
  comments?: MaintenanceComment[]
  attachments?: MaintenanceAttachment[]
  beforePhotos?: MaintenancePhoto[]
  afterPhotos?: MaintenancePhoto[]
}

export interface MaintenanceStats {
  totalTasks: number
  scheduledTasks: number
  inProgressTasks: number
  completedTasks: number
}

export interface MaintenanceFilters {
  search?: string
  status?: string[]
  priority?: string[]
  type?: string[]
  scheduledDateFrom?: string
  scheduledDateTo?: string
  page?: number
  limit?: number
}

export interface MaintenanceResponse {
  success: boolean
  data: MaintenanceTask[]
  total: number
  page: number
  limit: number
}

export interface MaintenanceStatsResponse {
  success: boolean
  data: MaintenanceStats
}

export interface MaintenanceSingleResponse {
  success: boolean
  data: MaintenanceTask
}

export interface MaintenanceCreateRequest {
  title: string
  unit: string
  unitId: string
  technician: string
  technicianId: string
  status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold'
  priority: 'Low' | 'Normal' | 'High' | 'Urgent'
  type: 'Plumbing' | 'Electrical' | 'HVAC' | 'General' | 'Emergency' | 'Preventive'
  scheduledDate: string
  estimatedDuration: string
  description: string
  cost?: number
  notes?: string
}

export interface MaintenanceUpdateRequest {
  title?: string
  unit?: string
  unitId?: string
  technician?: string
  technicianId?: string
  status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold'
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent'
  type?: 'Plumbing' | 'Electrical' | 'HVAC' | 'General' | 'Emergency' | 'Preventive'
  scheduledDate?: string
  estimatedDuration?: string
  description?: string
  cost?: number
  notes?: string
}

export interface MaintenanceDeleteResponse {
  success: boolean
  message: string
}

export interface MaintenanceComment {
  id: number
  author: string
  date: string
  text: string
  type: 'inspection' | 'contractor' | 'approval' | 'user'
}

export interface MaintenanceAttachment {
  id: number
  name: string
  size: string
  type: string
  s3Key?: string
  s3Url?: string
}

export interface MaintenancePhoto {
  id: number
  name: string
  size: string
  s3Key?: string
  s3Url?: string
}

export interface MaintenanceCommentsResponse {
  success: boolean
  data: MaintenanceComment[]
}

export interface MaintenanceAttachmentsResponse {
  success: boolean
  data: MaintenanceAttachment[]
}

export interface MaintenancePhotosResponse {
  success: boolean
  data: MaintenancePhoto[]
}

export interface MaintenanceCommentCreateRequest {
  text: string
  type?: 'inspection' | 'contractor' | 'approval' | 'user'
}

export interface MaintenanceAttachmentCreateRequest {
  name: string
  size: string
  type: string
  s3Key?: string
  s3Url?: string
}

export interface MaintenancePhotoCreateRequest {
  name: string
  size: string
  type: 'before' | 'after'
  s3Key?: string
  s3Url?: string
}

class MaintenanceService {
  // Get all maintenance tasks with filters
  async getMaintenanceTasks(filters: MaintenanceFilters = {}): Promise<MaintenanceResponse> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status?.length) filters.status.forEach(s => params.append('status', s))
    if (filters.priority?.length) filters.priority.forEach(p => params.append('priority', p))
    if (filters.type?.length) filters.type.forEach(t => params.append('type', t))
    if (filters.scheduledDateFrom) params.append('scheduledDateFrom', filters.scheduledDateFrom)
    if (filters.scheduledDateTo) params.append('scheduledDateTo', filters.scheduledDateTo)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`/maintenance?${params.toString()}`)
    return response.data
  }

  // Get maintenance statistics
  async getMaintenanceStats(): Promise<MaintenanceStatsResponse> {
    const response = await apiClient.get('/maintenance/stats')
    return response.data
  }

  // Get maintenance task by ID
  async getMaintenanceTask(id: number): Promise<MaintenanceSingleResponse> {
    const response = await apiClient.get(`/maintenance/${id}`)
    return response.data
  }

  // Create new maintenance task
  async createMaintenanceTask(data: MaintenanceCreateRequest): Promise<MaintenanceSingleResponse> {
    const response = await apiClient.post('/maintenance', data)
    return response.data
  }

  // Update maintenance task
  async updateMaintenanceTask(id: number, data: MaintenanceUpdateRequest): Promise<MaintenanceSingleResponse> {
    const response = await apiClient.put(`/maintenance/${id}`, data)
    return response.data
  }

  // Delete maintenance task
  async deleteMaintenanceTask(id: number): Promise<MaintenanceDeleteResponse> {
    const response = await apiClient.delete(`/maintenance/${id}`)
    return response.data
  }

  // ==================== COMMENTS ====================

  // Get comments for maintenance task
  async getMaintenanceComments(id: number): Promise<MaintenanceCommentsResponse> {
    const response = await apiClient.get(`/maintenance/${id}/comments`)
    return response.data
  }

  // Add comment to maintenance task
  async addMaintenanceComment(id: number, data: MaintenanceCommentCreateRequest): Promise<{ success: boolean; data: MaintenanceComment; message: string }> {
    const response = await apiClient.post(`/maintenance/${id}/comments`, data)
    return response.data
  }

  // ==================== ATTACHMENTS ====================

  // Get attachments for maintenance task
  async getMaintenanceAttachments(id: number): Promise<MaintenanceAttachmentsResponse> {
    const response = await apiClient.get(`/maintenance/${id}/attachments`)
    return response.data
  }

  // Add attachment to maintenance task
  async addMaintenanceAttachment(id: number, data: MaintenanceAttachmentCreateRequest): Promise<{ success: boolean; data: MaintenanceAttachment; message: string }> {
    const response = await apiClient.post(`/maintenance/${id}/attachments`, data)
    return response.data
  }

  // ==================== PHOTOS ====================

  // Get photos for maintenance task
  async getMaintenancePhotos(id: number, type?: 'before' | 'after'): Promise<MaintenancePhotosResponse> {
    const params = type ? `?type=${type}` : ''
    const response = await apiClient.get(`/maintenance/${id}/photos${params}`)
    return response.data
  }

  // Add photo to maintenance task
  async addMaintenancePhoto(id: number, data: MaintenancePhotoCreateRequest): Promise<{ success: boolean; data: MaintenancePhoto; message: string }> {
    const response = await apiClient.post(`/maintenance/${id}/photos`, data)
    return response.data
  }
}

export const maintenanceService = new MaintenanceService()
