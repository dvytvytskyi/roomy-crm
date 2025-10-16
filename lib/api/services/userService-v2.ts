import { apiClientV2 } from '../client-v2';
import { API_V2_ENDPOINTS, ApiResponse, PaginationParams, FilterParams } from '../config-v2';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string;
  country?: string;
  flag?: string;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  status?: string;
  avatar?: string;
  country?: string;
  flag?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  avatar?: string;
  country?: string;
  flag?: string;
  isVerified?: boolean;
}

export interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class UserServiceV2 {
  // Get all users with pagination and filtering
  async getUsers(params?: PaginationParams & FilterParams): Promise<ApiResponse<UsersResponse>> {
    console.log('👥 UserServiceV2: Fetching users from V2 API...');
    console.log('👥 UserServiceV2: Query params:', params);
    
    try {
      const response = await apiClientV2.get<any>(API_V2_ENDPOINTS.USERS.BASE, params);
      console.log('👥 UserServiceV2: Raw API Response:', response);
      
      // Handle the response structure - API returns { success, data: [], pagination: {} }
      const usersData = response.data || [];
      const paginationData = response.pagination || {
        page: 1,
        limit: 10,
        total: usersData.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
      
      console.log('👥 UserServiceV2: Users count:', usersData.length);
      console.log('👥 UserServiceV2: Users data:', usersData);
      
      const usersResponse: UsersResponse = {
        data: usersData,
        pagination: paginationData
      };
      
      return {
        success: response.success,
        data: usersResponse,
        message: response.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('👥 UserServiceV2: Error fetching users:', error);
      throw error;
    }
  }

  // Get users by role (e.g., OWNER)
  async getUsersByRole(role: string, params?: PaginationParams & FilterParams): Promise<ApiResponse<UsersResponse>> {
    return apiClientV2.get(API_V2_ENDPOINTS.USERS.BASE, { ...params, role });
  }

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClientV2.get(API_V2_ENDPOINTS.USERS.BY_ID(id));
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    console.log('--- USER SERVICE V2: CREATE USER ---');
    console.log('Endpoint:', API_V2_ENDPOINTS.USERS.BASE);
    console.log('User data:', userData);
    console.log('API Client V2:', apiClientV2);
    
    try {
      const response = await apiClientV2.post(API_V2_ENDPOINTS.USERS.BASE, userData);
      console.log('--- USER SERVICE V2: SUCCESS ---');
      console.log('Response:', response);
      return response;
    } catch (error) {
      console.log('--- USER SERVICE V2: ERROR ---');
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClientV2.put(API_V2_ENDPOINTS.USERS.BY_ID(id), userData);
  }

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<User>> {
    return apiClientV2.delete(API_V2_ENDPOINTS.USERS.BY_ID(id));
  }

  // Update user password
  async updateUserPassword(id: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClientV2.put(API_V2_ENDPOINTS.USERS.UPDATE_PASSWORD(id), { newPassword });
  }

  // Legacy methods for compatibility with existing code
  async getOwners(params?: PaginationParams & FilterParams): Promise<ApiResponse<UsersResponse>> {
    return this.getUsersByRole('OWNER', params);
  }

  async getAgents(params?: PaginationParams & FilterParams): Promise<ApiResponse<UsersResponse>> {
    return this.getUsersByRole('AGENT', params);
  }

  async getGuests(params?: PaginationParams & FilterParams): Promise<ApiResponse<UsersResponse>> {
    return this.getUsersByRole('GUEST', params);
  }

  /**
   * Get properties owned by user
   */
  async getUserProperties(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClientV2.get(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/properties`);
      return response;
    } catch (error) {
      console.error('Error getting user properties:', error);
      throw error;
    }
  }

  /**
   * Link property to user
   */
  async linkPropertyToUser(userId: string, propertyId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.post(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/properties`, {
        propertyId
      });
      return response;
    } catch (error) {
      console.error('Error linking property to user:', error);
      throw error;
    }
  }

  /**
   * Unlink property from user
   */
  async unlinkPropertyFromUser(userId: string, propertyId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.delete(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/properties/${propertyId}`);
      return response;
    } catch (error) {
      console.error('Error unlinking property from user:', error);
      throw error;
    }
  }

  /**
   * Get user bank accounts
   */
  async getUserBankAccounts(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClientV2.get(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/bank-accounts`);
      return response;
    } catch (error) {
      console.error('Error getting user bank accounts:', error);
      throw error;
    }
  }

  /**
   * Create user bank account
   */
  async createUserBankAccount(userId: string, bankAccountData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.post(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/bank-accounts`, bankAccountData);
      return response;
    } catch (error) {
      console.error('Error creating user bank account:', error);
      throw error;
    }
  }

  /**
   * Update user bank account
   */
  async updateUserBankAccount(userId: string, accountId: string, bankAccountData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.put(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/bank-accounts/${accountId}`, bankAccountData);
      return response;
    } catch (error) {
      console.error('Error updating user bank account:', error);
      throw error;
    }
  }

  /**
   * Delete user bank account
   */
  async deleteUserBankAccount(userId: string, accountId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.delete(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/bank-accounts/${accountId}`);
      return response;
    } catch (error) {
      console.error('Error deleting user bank account:', error);
      throw error;
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClientV2.get(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/transactions`);
      return response;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  /**
   * Create user transaction
   */
  async createUserTransaction(userId: string, transactionData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.post(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/transactions`, transactionData);
      return response;
    } catch (error) {
      console.error('Error creating user transaction:', error);
      throw error;
    }
  }

  /**
   * Get user documents
   */
  async getUserDocuments(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClientV2.get(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/documents`);
      return response;
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  /**
   * Create user document
   */
  async createUserDocument(userId: string, documentData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.post(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/documents`, documentData);
      return response;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  /**
   * Update user document
   */
  async updateUserDocument(userId: string, documentId: string, documentData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.put(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/documents/${documentId}`, documentData);
      return response;
    } catch (error) {
      console.error('Error updating user document:', error);
      throw error;
    }
  }

  /**
   * Delete user document
   */
  async deleteUserDocument(userId: string, documentId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.delete(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/documents/${documentId}`);
      return response;
    } catch (error) {
      console.error('Error deleting user document:', error);
      throw error;
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivityLog(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClientV2.get(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/activity-log`);
      return response;
    } catch (error) {
      console.error('Error getting user activity log:', error);
      throw error;
    }
  }

  /**
   * Create user activity log entry
   */
  async createUserActivityLog(userId: string, activityData: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.post(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/activity-log`, activityData);
      return response;
    } catch (error) {
      console.error('Error creating user activity log:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(role?: string): Promise<ApiResponse<any>> {
    try {
      const params = role ? `?role=${role}` : '';
      const response = await apiClientV2.get(`${API_V2_ENDPOINTS.USERS.BASE}/stats${params}`);
      return response;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  /**
   * Get user detail statistics
   */
  async getUserDetailStats(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClientV2.get(`${API_V2_ENDPOINTS.USERS.BASE}/${userId}/stats`);
      return response;
    } catch (error) {
      console.error('Error getting user detail statistics:', error);
      throw error;
    }
  }
}

export const userServiceV2 = new UserServiceV2();
