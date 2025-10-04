import { apiClientV2 } from '../client-v2';
import { API_V2_ENDPOINTS, ApiResponse } from '../config-v2';

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
  company?: string;
  role?: 'ADMIN' | 'MANAGER' | 'AGENT' | 'OWNER' | 'GUEST' | 'CLEANER' | 'MAINTENANCE_STAFF';
}

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

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export class AuthServiceV2 {
  // Login
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClientV2.login(credentials.email, credentials.password);
  }

  // Register
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    // Note: V2 API doesn't have register endpoint yet, but we can prepare for it
    throw new Error('Registration not implemented in V2 API yet');
  }

  // Logout
  async logout(): Promise<void> {
    return apiClientV2.logout();
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClientV2.getProfile();
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string; expiresIn: string }>> {
    return apiClientV2.refreshToken();
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return apiClientV2.put(API_V2_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  }

  // Verify token
  async verifyToken(): Promise<ApiResponse> {
    return apiClientV2.get(API_V2_ENDPOINTS.AUTH.VERIFY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return apiClientV2.isAuthenticated();
  }
}

export const authServiceV2 = new AuthServiceV2();
