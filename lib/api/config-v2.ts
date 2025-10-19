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
  // Temporarily always use V2 API for testing
  return true;
  // return process.env.NEXT_PUBLIC_USE_V2_API === 'true';
};

// Get the appropriate API URL
export const getApiUrl = () => {
  if (shouldUseV2API()) {
    return API_V2_CONFIG.BASE_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
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
    MARKETING: (id: string) => `/properties/${id}/marketing`,
    AVAILABILITY: (id: string) => `/properties/${id}/availability`,
    AMENITIES: (id: string) => `/properties/${id}/amenities`,
  },

  // Reservations
  RESERVATIONS: {
    BASE: '/reservations',
    BY_ID: (id: string) => `/reservations/${id}`,
    DATES: (id: string) => `/reservations/${id}/dates`,
  },

  // Orchestrator
  ORCHESTRATOR: {
    CONFIRM_RESERVATION: (id: string) => `/orchestrator/reservations/${id}/confirm`,
    CANCEL_RESERVATION: (id: string) => `/orchestrator/reservations/${id}/cancel`,
    CHECKIN_RESERVATION: (id: string) => `/orchestrator/reservations/${id}/checkin`,
    GET_STATUS: (id: string) => `/orchestrator/reservations/${id}/status`,
  },

  // Integrations
  INTEGRATIONS: {
    PRICELABS: {
      PRICES: (id: string) => `/integrations/pricelabs/prices/${id}`,
    },
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

// Create axios instance for V2 API
import axios from 'axios';

export const apiClientV2 = axios.create({
  baseURL: API_V2_CONFIG.BASE_URL,
  timeout: API_V2_CONFIG.TIMEOUT,
  headers: API_V2_CONFIG.HEADERS,
});

// Add request interceptor to include auth token
apiClientV2.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClientV2.interceptors.response.use(
  (response) => response.data, // Return only data, not full Axios response
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
