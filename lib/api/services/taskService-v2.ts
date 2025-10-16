import { apiClientV2 } from '../config-v2';
import { ApiResponseV2 } from '../types';

// Task types
export interface TaskV2 {
  id: string;
  title: string;
  description?: string;
  type: 'CLEANING' | 'MAINTENANCE';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  propertyId: string;
  assignedTo?: string;
  createdBy: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  cost?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskWithDetailsV2 extends TaskV2 {
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
  };
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  checklistItems?: TaskChecklistItemV2[];
  comments?: TaskCommentV2[];
  attachments?: TaskAttachmentV2[];
  _count?: {
    comments?: number;
    checklistItems?: number;
    attachments?: number;
  };
}

export interface TaskChecklistItemV2 {
  id: string;
  item: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface TaskCommentV2 {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TaskAttachmentV2 {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TaskStatsV2 {
  totalTasks: number;
  scheduledTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  onHoldTasks: number;
  overdueTasks: number;
}

export interface CreateTaskDtoV2 {
  title: string;
  description?: string;
  type: 'CLEANING' | 'MAINTENANCE';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  propertyId: string;
  assignedTo?: string;
  scheduledDate?: string;
  estimatedDuration?: string;
  cost?: number;
  notes?: string;
  checklistItems?: string[];
}

export interface UpdateTaskDtoV2 {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  cost?: number;
  notes?: string;
}

export interface UpdateTaskStatusDtoV2 {
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  notes?: string;
}

export interface TaskQueryParamsV2 {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string[];
  priority?: string[];
  propertyId?: string;
  assignedTo?: string;
  createdBy?: string;
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
}

export interface PaginatedTasksV2 {
  data: TaskWithDetailsV2[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class TaskServiceV2 {
  /**
   * Get all tasks with pagination and filters
   */
  async getAll(params: TaskQueryParamsV2 = {}): Promise<ApiResponseV2<PaginatedTasksV2>> {
    try {
      const response = await apiClientV2.get('/tasks', { params });
      
      return {
        success: true,
        data: response.data.data!,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to retrieve tasks',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get task by ID
   */
  async getById(id: string): Promise<ApiResponseV2<TaskWithDetailsV2>> {
    try {
      const response = await apiClientV2.get(`/tasks/${id}`);
      
      return {
        success: true,
        data: response.data.data!,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to retrieve task',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create new task
   */
  async create(data: CreateTaskDtoV2): Promise<ApiResponseV2<TaskWithDetailsV2>> {
    try {
      const response = await apiClientV2.post('/tasks', data);
      
      return {
        success: true,
        data: response.data.data!,
        message: response.data.message || 'Task created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to create task',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update task
   */
  async update(id: string, data: UpdateTaskDtoV2): Promise<ApiResponseV2<TaskWithDetailsV2>> {
    try {
      const response = await apiClientV2.put(`/tasks/${id}`, data);
      
      return {
        success: true,
        data: response.data.data!,
        message: response.data.message || 'Task updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to update task',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Delete task (soft delete)
   */
  async delete(id: string): Promise<ApiResponseV2<TaskV2>> {
    try {
      const response = await apiClientV2.delete(`/tasks/${id}`);
      
      return {
        success: true,
        data: response.data.data!,
        message: response.data.message || 'Task deleted successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to delete task',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update task status
   */
  async updateStatus(id: string, data: UpdateTaskStatusDtoV2): Promise<ApiResponseV2<TaskWithDetailsV2>> {
    try {
      console.log('🔄 TaskServiceV2: Updating task status...');
      console.log('🔄 TaskServiceV2: Task ID:', id);
      console.log('🔄 TaskServiceV2: Status data:', data);
      
      const response = await apiClientV2.put(`/tasks/${id}/status`, data);
      console.log('🔄 TaskServiceV2: Raw API Response:', response);
      
      // The response.data contains the actual API response from backend
      // Backend returns: { success: true, data: TaskWithDetailsV2, message: string }
      const apiResponse = response.data;
      console.log('🔄 TaskServiceV2: API Response data:', apiResponse);
      
      return {
        success: apiResponse.success,
        data: apiResponse.data,
        message: apiResponse.message || 'Task status updated successfully',
        timestamp: apiResponse.timestamp || new Date().toISOString()
      };
    } catch (error: any) {
      console.error('🔄 TaskServiceV2: Error updating task status:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
        message: error.response?.data?.message || 'Failed to update task status',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get task statistics
   */
  async getStats(): Promise<ApiResponseV2<TaskStatsV2>> {
    try {
      const response = await apiClientV2.get('/tasks/stats');
      
      return {
        success: true,
        data: response.data.data!,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to retrieve task statistics',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Add comment to task
   */
  async addComment(id: string, content: string, type: string = 'user'): Promise<ApiResponseV2<TaskCommentV2>> {
    try {
      const response = await apiClientV2.post(`/tasks/${id}/comments`, {
        content,
        type
      });
      
      return {
        success: true,
        data: response.data.data!,
        message: response.data.message || 'Comment added successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to add comment',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(id: string, itemId: string, completed: boolean): Promise<ApiResponseV2<TaskChecklistItemV2>> {
    try {
      const response = await apiClientV2.put(`/tasks/${id}/checklist/${itemId}`, {
        completed
      });
      
      return {
        success: true,
        data: response.data.data!,
        message: response.data.message || 'Checklist item updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to update checklist item',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Upload attachment to task
   */
  async uploadAttachment(id: string, file: File): Promise<ApiResponseV2<TaskAttachmentV2>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClientV2.post(`/tasks/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data.data!,
        message: response.data.message || 'Attachment uploaded successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to upload attachment',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const taskServiceV2 = new TaskServiceV2();
export default taskServiceV2;
