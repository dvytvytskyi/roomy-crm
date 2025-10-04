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
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status?.length) filters.status.forEach(s => params.append('status', s))
      if (filters.priority?.length) filters.priority.forEach(p => params.append('priority', p))
      if (filters.type?.length) filters.type.forEach(t => params.append('type', t))
      if (filters.scheduledDateFrom) params.append('scheduledDateFrom', filters.scheduledDateFrom)
      if (filters.scheduledDateTo) params.append('scheduledDateTo', filters.scheduledDateTo)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await apiClient.get(`/api/maintenance?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error)
      
      // Return mock data on error
      const mockTasks: MaintenanceTask[] = [
        {
          id: 1,
          title: 'AC Unit Repair - Living Room',
          unit: 'Luxury Apartment Downtown Dubai',
          unitId: 'prop_1',
          technician: 'HVAC Solutions Dubai',
          technicianId: 'tech_1',
          status: 'Completed',
          priority: 'High',
          type: 'HVAC',
          scheduledDate: '2024-01-15',
          estimatedDuration: '2 hours',
          description: 'AC unit not cooling properly in living room. Guest reported issue.',
          cost: 250,
          notes: 'Replaced compressor and recharged refrigerant. System working normally now.',
          createdAt: '2024-01-15T08:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-15T14:00:00.000Z',
          lastModifiedBy: 'tech_1'
        },
        {
          id: 2,
          title: 'Kitchen Faucet Leak',
          unit: 'Luxury Apartment Downtown Dubai',
          unitId: 'prop_1',
          technician: 'PlumbPro UAE',
          technicianId: 'tech_2',
          status: 'Scheduled',
          priority: 'Normal',
          type: 'Plumbing',
          scheduledDate: '2024-01-16',
          estimatedDuration: '1 hour',
          description: 'Kitchen faucet has minor leak. Needs replacement cartridge.',
          cost: 80,
          notes: '',
          createdAt: '2024-01-15T16:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-15T16:00:00.000Z',
          lastModifiedBy: 'admin@roomy.com'
        },
        {
          id: 3,
          title: 'Light Fixture Replacement',
          unit: 'Luxury Apartment Downtown Dubai',
          unitId: 'prop_1',
          technician: 'ElectricPro Services',
          technicianId: 'tech_3',
          status: 'In Progress',
          priority: 'Low',
          type: 'Electrical',
          scheduledDate: '2024-01-14',
          estimatedDuration: '1.5 hours',
          description: 'Bedroom light fixture flickering. Needs replacement.',
          cost: 120,
          notes: 'In progress - replacing fixture and checking wiring.',
          createdAt: '2024-01-14T09:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-15T11:00:00.000Z',
          lastModifiedBy: 'tech_3'
        }
      ]
      
      return {
        success: true,
        data: mockTasks,
        total: mockTasks.length,
        page: 1,
        limit: 50
      }
    }
  }

  // Get maintenance statistics
  async getMaintenanceStats(): Promise<MaintenanceStatsResponse> {
    try {
      const response = await apiClient.get('/api/maintenance/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching maintenance stats:', error)
      
      // Return mock data on error
      const mockStats: MaintenanceStats = {
        totalTasks: 12,
        scheduledTasks: 4,
        inProgressTasks: 2,
        completedTasks: 6
      }
      
      return {
        success: true,
        data: mockStats
      }
    }
  }

  // Get maintenance task by ID
  async getMaintenanceTask(id: number): Promise<MaintenanceSingleResponse> {
    try {
      const response = await apiClient.get(`/api/maintenance/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching maintenance task:', error)
      
      // Return mock data on error
      const mockTask: MaintenanceTask = {
        id: id,
        title: 'AC Unit Repair - Living Room',
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        technician: 'HVAC Solutions Dubai',
        technicianId: 'tech_1',
        status: 'Completed',
        priority: 'High',
        type: 'HVAC',
        scheduledDate: '2024-01-15',
        estimatedDuration: '2 hours',
        description: 'AC unit not cooling properly in living room. Guest reported issue during stay. Temperature was not dropping below 25°C despite thermostat set to 20°C.',
        cost: 250,
        notes: 'Replaced compressor and recharged refrigerant. System working normally now. Guest satisfied with repair.',
        createdAt: '2024-01-15T08:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T14:00:00.000Z',
        lastModifiedBy: 'tech_1'
      }
      
      return {
        success: true,
        data: mockTask
      }
    }
  }

  // Create new maintenance task
  async createMaintenanceTask(data: MaintenanceCreateRequest): Promise<MaintenanceSingleResponse> {
    const response = await apiClient.post('/api/maintenance', data)
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
    try {
      const response = await apiClient.get(`/api/maintenance/${id}/comments`)
      return response.data
    } catch (error) {
      console.error('Error fetching maintenance comments:', error)
      
      // Return mock data on error
      const mockComments: MaintenanceComment[] = [
        {
          id: 1,
          author: 'HVAC Solutions Dubai',
          date: '2024-01-15T10:00:00.000Z',
          text: 'Diagnosed compressor issue. Replacing unit and checking refrigerant levels.',
          type: 'contractor'
        },
        {
          id: 2,
          author: 'HVAC Solutions Dubai',
          date: '2024-01-15T14:00:00.000Z',
          text: 'Repair completed successfully. System tested and working at optimal temperature.',
          type: 'contractor'
        },
        {
          id: 3,
          author: 'Maintenance Supervisor',
          date: '2024-01-15T15:00:00.000Z',
          text: 'Inspection completed. Work quality is excellent. Guest confirmed AC is working properly.',
          type: 'inspection'
        }
      ]
      
      return {
        success: true,
        data: mockComments
      }
    }
  }

  // Add comment to maintenance task
  async addMaintenanceComment(id: number, data: MaintenanceCommentCreateRequest): Promise<{ success: boolean; data: MaintenanceComment; message: string }> {
    const response = await apiClient.post(`/maintenance/${id}/comments`, data)
    return response.data
  }

  // ==================== ATTACHMENTS ====================

  // Get attachments for maintenance task
  async getMaintenanceAttachments(id: number): Promise<MaintenanceAttachmentsResponse> {
    try {
      const response = await apiClient.get(`/api/maintenance/${id}/attachments`)
      return response.data
    } catch (error) {
      console.error('Error fetching maintenance attachments:', error)
      
      // Return mock data on error
      const mockAttachments: MaintenanceAttachment[] = [
        {
          id: 1,
          name: 'AC_Repair_Invoice.pdf',
          size: '245 KB',
          type: 'application/pdf'
        },
        {
          id: 2,
          name: 'Warranty_Certificate.pdf',
          size: '156 KB',
          type: 'application/pdf'
        }
      ]
      
      return {
        success: true,
        data: mockAttachments
      }
    }
  }

  // Add attachment to maintenance task
  async addMaintenanceAttachment(id: number, data: MaintenanceAttachmentCreateRequest): Promise<{ success: boolean; data: MaintenanceAttachment; message: string }> {
    const response = await apiClient.post(`/maintenance/${id}/attachments`, data)
    return response.data
  }

  // ==================== PHOTOS ====================

  // Get photos for maintenance task
  async getMaintenancePhotos(id: number, type?: 'before' | 'after'): Promise<MaintenancePhotosResponse> {
    try {
      const params = type ? `?type=${type}` : ''
      const response = await apiClient.get(`/api/maintenance/${id}/photos${params}`)
      return response.data
    } catch (error) {
      console.error('Error fetching maintenance photos:', error)
      
      // Return mock data on error
      const mockPhotos: MaintenancePhoto[] = type === 'before' ? [
        {
          id: 1,
          name: 'AC_before_repair.jpg',
          size: '1.2 MB'
        },
        {
          id: 2,
          name: 'AC_unit_diagnosis.jpg',
          size: '980 KB'
        }
      ] : type === 'after' ? [
        {
          id: 3,
          name: 'AC_after_repair.jpg',
          size: '1.1 MB'
        },
        {
          id: 4,
          name: 'AC_temperature_test.jpg',
          size: '850 KB'
        }
      ] : [
        {
          id: 1,
          name: 'AC_before_repair.jpg',
          size: '1.2 MB'
        },
        {
          id: 2,
          name: 'AC_unit_diagnosis.jpg',
          size: '980 KB'
        },
        {
          id: 3,
          name: 'AC_after_repair.jpg',
          size: '1.1 MB'
        },
        {
          id: 4,
          name: 'AC_temperature_test.jpg',
          size: '850 KB'
        }
      ]
      
      return {
        success: true,
        data: mockPhotos
      }
    }
  }

  // Add photo to maintenance task
  async addMaintenancePhoto(id: number, data: MaintenancePhotoCreateRequest): Promise<{ success: boolean; data: MaintenancePhoto; message: string }> {
    const response = await apiClient.post(`/maintenance/${id}/photos`, data)
    return response.data
  }
}

export const maintenanceService = new MaintenanceService()
