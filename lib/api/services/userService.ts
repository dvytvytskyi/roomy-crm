import { apiClient } from '../client';
import { API_ENDPOINTS, ApiResponse, PaginationParams, FilterParams } from '../config';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'OWNER' | 'GUEST' | 'CLEANER' | 'MAINTENANCE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  usersByRole: Array<{
    role: string;
    count: number;
  }>;
  activeUsers: number;
  inactiveUsers: number;
}

export interface OwnerStats {
  totalProperties: number;
  totalReservations: number;
  totalRevenue: number;
}

export interface AgentStats {
  managedProperties: number;
  totalReservations: number;
  totalRevenue: number;
}

export interface GuestStats {
  totalReservations: number;
  totalSpent: number;
  favoriteProperties: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class UserService {
  // Get all users with filtering
  async getUsers(filters: FilterParams & PaginationParams = {}): Promise<ApiResponse<UsersResponse>> {
    return apiClient.get<UsersResponse>(API_ENDPOINTS.USERS.BASE, filters);
  }

  // Create new user
  async createUser(userData: Partial<User> & {
    nationality?: string;
    dateOfBirth?: string;
    whatsapp?: string;
    telegram?: string;
    comments?: string;
    status?: string;
    paymentPreferences?: string;
    personalStayDays?: number;
  }): Promise<ApiResponse<User>> {
    return apiClient.post<User>(API_ENDPOINTS.USERS.BASE, userData);
  }

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
  }

  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_ENDPOINTS.USERS.BY_ID(id), userData);
  }

  // Activate user
  async activateUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_ENDPOINTS.USERS.ACTIVATE(id));
  }

  // Deactivate user
  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_ENDPOINTS.USERS.DEACTIVATE(id));
  }

  // Get owners
  async getOwners(filters: FilterParams & PaginationParams = {}): Promise<ApiResponse<UsersResponse>> {
    return apiClient.get<UsersResponse>(API_ENDPOINTS.USERS.OWNERS, filters);
  }

  // Get agents
  async getAgents(filters: FilterParams & PaginationParams = {}): Promise<ApiResponse<UsersResponse>> {
    return apiClient.get<UsersResponse>(API_ENDPOINTS.USERS.AGENTS, filters);
  }

  // Get guests
  async getGuests(filters: FilterParams & PaginationParams = {}): Promise<ApiResponse<UsersResponse>> {
    return apiClient.get<UsersResponse>(API_ENDPOINTS.USERS.GUESTS, filters);
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiClient.get<UserStats>(API_ENDPOINTS.USERS.STATS);
  }

  // Get owner statistics
  async getOwnerStats(ownerId: string): Promise<ApiResponse<OwnerStats>> {
    return apiClient.get<OwnerStats>(API_ENDPOINTS.USERS.OWNER_STATS(ownerId));
  }

  // Get agent statistics
  async getAgentStats(agentId: string): Promise<ApiResponse<AgentStats>> {
    return apiClient.get<AgentStats>(API_ENDPOINTS.USERS.AGENT_STATS(agentId));
  }

  // Get guest statistics
  async getGuestStats(guestId: string): Promise<ApiResponse<GuestStats>> {
    return apiClient.get<GuestStats>(API_ENDPOINTS.USERS.GUEST_STATS(guestId));
  }

  // Get owner by ID
  async getOwnerById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.USERS.OWNER_BY_ID(id));
  }

  // Update owner
  async updateOwner(id: string, ownerData: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_ENDPOINTS.USERS.OWNER_BY_ID(id), ownerData);
  }

  // Delete owner
  async deleteOwner(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.USERS.OWNER_BY_ID(id));
  }
}

export const userService = new UserService();
