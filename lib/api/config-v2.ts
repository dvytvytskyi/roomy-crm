// API V2 Configuration
export const API_V2_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Check if V2 API should be used
export const shouldUseV2API = () => {
  return process.env.NEXT_PUBLIC_USE_V2_API === 'true';
};

// Get the appropriate API URL
export const getApiUrl = () => {
  if (shouldUseV2API()) {
    return API_V2_CONFIG.BASE_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

// API V2 Endpoints
export const API_V2_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    PROFILE: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY: '/auth/verify',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE_PASSWORD: (id: string) => `/users/${id}/password`,
  },

  // Properties
  PROPERTIES: {
    BASE: '/properties',
    BY_ID: (id: string) => `/properties/${id}`,
  },

  // Reservations
  RESERVATIONS: {
    BASE: '/reservations',
    BY_ID: (id: string) => `/reservations/${id}`,
  },
};

// Request types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    statusCode: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  search?: string;
  isActive?: boolean;
  role?: string;
  [key: string]: any;
}
