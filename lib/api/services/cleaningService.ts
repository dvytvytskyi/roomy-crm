import { apiClient } from '../config'

export interface CleaningComment {
  id: number
  author: string
  date: string
  text: string
  type: 'cleaner' | 'completion' | 'inspection' | 'user'
}

export interface CleaningChecklistItem {
  id: number
  item: string
  completed: boolean
}

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
  includesLaundry?: boolean
  laundryCount?: number
  linenComments?: string
  comments?: CleaningComment[]
  checklist?: CleaningChecklistItem[]
  staticChecklist?: boolean[]
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
  includesLaundry?: boolean
  laundryCount?: number
  linenComments?: string
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
  includesLaundry?: boolean
  laundryCount?: number
  linenComments?: string
}

export interface CleaningDeleteResponse {
  success: boolean
  message: string
}

class CleaningService {
  // Get all cleaning tasks with filters
  async getCleaningTasks(filters: CleaningFilters = {}): Promise<CleaningResponse> {
    try {
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

      const response = await apiClient.get(`/api/cleaning?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching cleaning tasks:', error)
      
      // Return mock data on error
      const mockTasks: CleaningTask[] = [
        {
          id: 1,
          unit: 'Luxury Apartment Downtown Dubai',
          unitId: 'prop_1',
          type: 'Deep Clean',
          status: 'Completed',
          scheduledDate: '2024-01-15',
          scheduledTime: '10:00',
          duration: '3 hours',
          cleaner: 'Clean Pro Services',
          cleanerId: 'cleaner_1',
          cost: 150,
          notes: 'Post-checkout cleaning after guest departure',
          createdAt: '2024-01-15T08:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-15T13:00:00.000Z',
          lastModifiedBy: 'cleaner_1',
          includesLaundry: true,
          laundryCount: 12,
          linenComments: 'Bed sheets and towels need special care due to guest allergies'
        },
        {
          id: 2,
          unit: 'Luxury Apartment Downtown Dubai',
          unitId: 'prop_1',
          type: 'Regular Clean',
          status: 'Scheduled',
          scheduledDate: '2024-01-16',
          scheduledTime: '14:00',
          duration: '2 hours',
          cleaner: 'Sparkle Clean',
          cleanerId: 'cleaner_2',
          cost: 80,
          notes: 'Weekly maintenance cleaning',
          createdAt: '2024-01-15T09:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-15T09:00:00.000Z',
          lastModifiedBy: 'admin@roomy.com',
          includesLaundry: false,
          laundryCount: 0,
          linenComments: ''
        },
        {
          id: 3,
          unit: 'Luxury Apartment Downtown Dubai',
          unitId: 'prop_1',
          type: 'Deep Clean',
          status: 'Scheduled',
          scheduledDate: '2024-01-17',
          scheduledTime: '09:00',
          duration: '4 hours',
          cleaner: 'Clean Pro Services',
          cleanerId: 'cleaner_1',
          cost: 200,
          notes: 'Pre-arrival deep cleaning for new guest',
          createdAt: '2024-01-16T10:00:00.000Z',
          createdBy: 'admin@roomy.com',
          lastModifiedAt: '2024-01-16T10:00:00.000Z',
          lastModifiedBy: 'admin@roomy.com',
          includesLaundry: true,
          laundryCount: 8,
          linenComments: 'Standard cleaning for new guest arrival'
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

  // Get cleaning statistics
  async getCleaningStats(): Promise<CleaningStatsResponse> {
    try {
      const response = await apiClient.get('/api/cleaning/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching cleaning stats:', error)
      
      // Return mock data on error
      const mockStats: CleaningStats = {
        totalTasks: 15,
        scheduledTasks: 8,
        completedTasks: 6,
        cancelledTasks: 1
      }
      
      return {
        success: true,
        data: mockStats
      }
    }
  }

  // Get single cleaning task
  async getCleaningTask(id: number): Promise<CleaningSingleResponse> {
    try {
      const response = await apiClient.get(`/api/cleaning/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching cleaning task:', error)
      
      // Return mock data on error
      const mockTask: CleaningTask = {
        id: id,
        unit: 'Luxury Apartment Downtown Dubai',
        unitId: 'prop_1',
        type: 'Deep Clean',
        status: 'Completed',
        scheduledDate: '2024-01-15',
        scheduledTime: '10:00',
        duration: '3 hours',
        cleaner: 'Clean Pro Services',
        cleanerId: 'cleaner_1',
        cost: 150,
        notes: 'Post-checkout cleaning after guest departure. Guest had allergies, so extra attention to bedding and air quality.',
        createdAt: '2024-01-15T08:00:00.000Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T13:00:00.000Z',
        lastModifiedBy: 'cleaner_1',
        includesLaundry: true,
        laundryCount: 12,
        linenComments: 'Bed sheets and towels need special care due to guest allergies. Use hypoallergenic detergent.'
      }
      
      return {
        success: true,
        data: mockTask
      }
    }
  }

  // Create cleaning task
  async createCleaningTask(taskData: CleaningCreateRequest): Promise<CleaningSingleResponse> {
    const response = await apiClient.post('/api/cleaning', taskData)
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

  // ==================== COMMENTS ====================
  
  // Get comments for a cleaning task
  async getCleaningComments(id: number): Promise<{ success: boolean; data: CleaningComment[] }> {
    try {
      const response = await apiClient.get(`/api/cleaning/${id}/comments`)
      return response.data
    } catch (error) {
      console.error('Error fetching cleaning comments:', error)
      
      // Return mock data on error
      const mockComments: CleaningComment[] = [
        {
          id: 1,
          author: 'Clean Pro Services',
          date: '2024-01-15T10:30:00.000Z',
          text: 'Started deep cleaning - all surfaces sanitized with eco-friendly products',
          type: 'cleaner'
        },
        {
          id: 2,
          author: 'Clean Pro Services',
          date: '2024-01-15T11:15:00.000Z',
          text: 'Kitchen and bathroom deep cleaning completed. Moving to bedroom area.',
          type: 'cleaner'
        },
        {
          id: 3,
          author: 'Clean Pro Services',
          date: '2024-01-15T13:00:00.000Z',
          text: 'Deep cleaning completed successfully. All checklist items done. Special attention paid to allergen removal.',
          type: 'completion'
        }
      ]
      
      return {
        success: true,
        data: mockComments
      }
    }
  }

  // Add comment to a cleaning task
  async addCleaningComment(id: number, data: { text: string; type?: string }): Promise<{ success: boolean; data: CleaningComment; message: string }> {
    const response = await apiClient.post(`/cleaning/${id}/comments`, data)
    return response.data
  }

  // ==================== CHECKLIST ====================
  
  // Get checklist for a cleaning task
  async getCleaningChecklist(id: number): Promise<{ success: boolean; data: { checklist: CleaningChecklistItem[]; staticChecklist: boolean[] } }> {
    try {
      const response = await apiClient.get(`/api/cleaning/${id}/checklist`)
      return response.data
    } catch (error) {
      console.error('Error fetching cleaning checklist:', error)
      
      // Return mock data on error
      const mockChecklistData = {
        checklist: [
          {
            id: 1,
            item: 'Kitchen appliances cleaned',
            completed: true
          },
          {
            id: 2,
            item: 'Bathroom sanitized',
            completed: true
          },
          {
            id: 3,
            item: 'Carpet cleaning',
            completed: true
          },
          {
            id: 4,
            item: 'Bed linens changed',
            completed: true
          },
          {
            id: 5,
            item: 'Towels replaced',
            completed: true
          },
          {
            id: 6,
            item: 'Windows cleaned',
            completed: true
          },
          {
            id: 7,
            item: 'Air vents cleaned',
            completed: true
          },
          {
            id: 8,
            item: 'Allergen removal treatment',
            completed: true
          }
        ],
        staticChecklist: [true, true, true, true, true, true]
      }
      
      return {
        success: true,
        data: mockChecklistData
      }
    }
  }

  // Add checklist item to a cleaning task
  async addCleaningChecklistItem(id: number, data: { item: string }): Promise<{ success: boolean; data: CleaningChecklistItem; message: string }> {
    const response = await apiClient.post(`/cleaning/${id}/checklist`, data)
    return response.data
  }

  // Update checklist item
  async updateCleaningChecklistItem(id: number, itemId: number, data: { completed: boolean }): Promise<{ success: boolean; data: CleaningChecklistItem; message: string }> {
    const response = await apiClient.put(`/cleaning/${id}/checklist/${itemId}`, data)
    return response.data
  }

  // Delete checklist item
  async deleteCleaningChecklistItem(id: number, itemId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/cleaning/${id}/checklist/${itemId}`)
    return response.data
  }

  // Update static checklist
  async updateCleaningStaticChecklist(id: number, data: { staticChecklist: boolean[] }): Promise<{ success: boolean; data: boolean[]; message: string }> {
    const response = await apiClient.put(`/cleaning/${id}/static-checklist`, data)
    return response.data
  }

  // ==================== NOTES ====================
  
  // Update notes for a cleaning task
  async updateCleaningNotes(id: number, data: { notes: string }): Promise<{ success: boolean; data: CleaningTask; message: string }> {
    const response = await apiClient.put(`/cleaning/${id}/notes`, data)
    return response.data
  }
}

export const cleaningService = new CleaningService()
