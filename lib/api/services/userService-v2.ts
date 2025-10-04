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
    return apiClientV2.get(API_V2_ENDPOINTS.USERS.BASE, params);
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
    return apiClientV2.post(API_V2_ENDPOINTS.USERS.BASE, userData);
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
}

export const userServiceV2 = new UserServiceV2();
