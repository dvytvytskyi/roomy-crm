import { PrismaClient } from '@prisma/client';
import { apiClient } from '../client';

// Production Prisma Client instance
const prisma = new PrismaClient();

// ============================================================================
// PRODUCTION API SERVICE
// ============================================================================

export interface ProductionApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    statusCode: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

class ProductionService {
  /**
   * Generic method for handling API responses
   */
  private handleResponse<T>(response: any): ProductionApiResponse<T> {
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message,
        pagination: response.pagination
      };
    }

    return {
      success: false,
      error: {
        message: response.message || 'Unknown error',
        statusCode: response.statusCode || 500
      }
    };
  }

  /**
   * Generic method for making API requests
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<ProductionApiResponse<T>> {
    try {
      let response;
      
      switch (method) {
        case 'GET':
          response = await apiClient.get(endpoint, { params });
          break;
        case 'POST':
          response = await apiClient.post(endpoint, data);
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return this.handleResponse<T>(response);
    } catch (error: any) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      return {
        success: false,
        error: {
          message: error.message || 'Network error',
          statusCode: error.status || 500
        }
      };
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(params?: PaginationParams & FilterParams): Promise<ProductionApiResponse<any[]>> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 50,
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc',
      ...params
    };

    return this.makeRequest('GET', '/api/production/users', undefined, queryParams);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', `/api/production/users/${userId}`);
  }

  /**
   * Create new user
   */
  async createUser(userData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('POST', '/api/production/users', userData);
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('PUT', `/api/production/users/${userId}`, userData);
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<ProductionApiResponse<boolean>> {
    return this.makeRequest('DELETE', `/api/production/users/${userId}`);
  }

  // ============================================================================
  // PROPERTY MANAGEMENT
  // ============================================================================

  /**
   * Get all properties with pagination and filtering
   */
  async getProperties(params?: PaginationParams & FilterParams): Promise<ProductionApiResponse<any[]>> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 50,
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc',
      ...params
    };

    return this.makeRequest('GET', '/api/production/properties', undefined, queryParams);
  }

  /**
   * Get property by ID
   */
  async getProperty(propertyId: string): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', `/api/production/properties/${propertyId}`);
  }

  /**
   * Create new property
   */
  async createProperty(propertyData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('POST', '/api/production/properties', propertyData);
  }

  /**
   * Update property
   */
  async updateProperty(propertyId: string, propertyData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('PUT', `/api/production/properties/${propertyId}`, propertyData);
  }

  /**
   * Delete property
   */
  async deleteProperty(propertyId: string): Promise<ProductionApiResponse<boolean>> {
    return this.makeRequest('DELETE', `/api/production/properties/${propertyId}`);
  }

  // ============================================================================
  // RESERVATION MANAGEMENT
  // ============================================================================

  /**
   * Get all reservations with pagination and filtering
   */
  async getReservations(params?: PaginationParams & FilterParams): Promise<ProductionApiResponse<any[]>> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 50,
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc',
      ...params
    };

    return this.makeRequest('GET', '/api/production/reservations', undefined, queryParams);
  }

  /**
   * Get reservation by ID
   */
  async getReservation(reservationId: string): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', `/api/production/reservations/${reservationId}`);
  }

  /**
   * Create new reservation
   */
  async createReservation(reservationData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('POST', '/api/production/reservations', reservationData);
  }

  /**
   * Update reservation
   */
  async updateReservation(reservationId: string, reservationData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('PUT', `/api/production/reservations/${reservationId}`, reservationData);
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(reservationId: string, reason?: string): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('PUT', `/api/production/reservations/${reservationId}/cancel`, { reason });
  }

  // ============================================================================
  // TASK MANAGEMENT
  // ============================================================================

  /**
   * Get all tasks with pagination and filtering
   */
  async getTasks(params?: PaginationParams & FilterParams): Promise<ProductionApiResponse<any[]>> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 50,
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc',
      ...params
    };

    return this.makeRequest('GET', '/api/production/tasks', undefined, queryParams);
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', `/api/production/tasks/${taskId}`);
  }

  /**
   * Create new task
   */
  async createTask(taskData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('POST', '/api/production/tasks', taskData);
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, taskData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('PUT', `/api/production/tasks/${taskId}`, taskData);
  }

  /**
   * Assign task to user
   */
  async assignTask(taskId: string, userId: string): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('PUT', `/api/production/tasks/${taskId}/assign`, { assigneeId: userId });
  }

  /**
   * Complete task
   */
  async completeTask(taskId: string, completionData?: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('PUT', `/api/production/tasks/${taskId}/complete`, completionData);
  }

  // ============================================================================
  // FINANCIAL MANAGEMENT
  // ============================================================================

  /**
   * Get all transactions with pagination and filtering
   */
  async getTransactions(params?: PaginationParams & FilterParams): Promise<ProductionApiResponse<any[]>> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 50,
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc',
      ...params
    };

    return this.makeRequest('GET', '/api/production/transactions', undefined, queryParams);
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', `/api/production/transactions/${transactionId}`);
  }

  /**
   * Create new transaction
   */
  async createTransaction(transactionData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('POST', '/api/production/transactions', transactionData);
  }

  /**
   * Get financial summary
   */
  async getFinancialSummary(params?: FilterParams): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', '/api/production/financial/summary', undefined, params);
  }

  /**
   * Get income distribution
   */
  async getIncomeDistribution(params?: FilterParams): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', '/api/production/financial/income-distribution', undefined, params);
  }

  // ============================================================================
  // LOCATION MANAGEMENT
  // ============================================================================

  /**
   * Get all locations
   */
  async getLocations(params?: PaginationParams & FilterParams): Promise<ProductionApiResponse<any[]>> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 100,
      sortBy: params?.sortBy || 'name',
      sortOrder: params?.sortOrder || 'asc',
      ...params
    };

    return this.makeRequest('GET', '/api/production/locations', undefined, queryParams);
  }

  /**
   * Get location by ID
   */
  async getLocation(locationId: string): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', `/api/production/locations/${locationId}`);
  }

  /**
   * Create new location
   */
  async createLocation(locationData: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('POST', '/api/production/locations', locationData);
  }

  // ============================================================================
  // SYSTEM MANAGEMENT
  // ============================================================================

  /**
   * Get system settings
   */
  async getSystemSettings(category?: string): Promise<ProductionApiResponse<any[]>> {
    const params = category ? { category } : undefined;
    return this.makeRequest('GET', '/api/production/settings', undefined, params);
  }

  /**
   * Update system setting
   */
  async updateSystemSetting(key: string, value: any): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('PUT', `/api/production/settings/${key}`, { value });
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(params?: PaginationParams & FilterParams): Promise<ProductionApiResponse<any[]>> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 50,
      sortBy: params?.sortBy || 'createdAt',
      sortOrder: params?.sortOrder || 'desc',
      ...params
    };

    return this.makeRequest('GET', '/api/production/audit-logs', undefined, queryParams);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ProductionApiResponse<any>> {
    return this.makeRequest('GET', '/api/production/health');
  }
}

// Export singleton instance
export const productionService = new ProductionService();

// Export types
export type {
  ProductionApiResponse,
  PaginationParams,
  FilterParams
};
