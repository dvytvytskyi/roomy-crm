import { apiClient } from '../client';
import { API_ENDPOINTS, ApiResponse } from '../config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'OWNER' | 'GUEST' | 'CLEANER' | 'MAINTENANCE';
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // Login
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.login(credentials.email, credentials.password);
  }

  // Register
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.register(userData);
  }

  // Logout
  async logout(): Promise<void> {
    return apiClient.logout();
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }
}

export const authService = new AuthService();
