// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  PRODUCTION_URL: process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Check if we're in production mode
export const isProductionMode = () => {
  return process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_PRODUCTION_MODE === 'true';
};

// Get the appropriate API URL
export const getApiUrl = () => {
  return isProductionMode() ? API_CONFIG.PRODUCTION_URL : API_CONFIG.BASE_URL;
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh-token',
    PROFILE: '/auth/profile',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    STATS: '/users/stats',
    OWNERS: '/users/owners',
    AGENTS: '/users/agents',
    GUESTS: '/users/guests',
    BY_ID: (id: string) => `/users/${id}`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    OWNER_STATS: (id: string) => `/users/owners/${id}/stats`,
    AGENT_STATS: (id: string) => `/users/agents/${id}/stats`,
    GUEST_STATS: (id: string) => `/users/guests/${id}/stats`,
    OWNER_BY_ID: (id: string) => `/users/owners/${id}`,
  },
  
  // Settings
  SETTINGS: {
    BASE: '/settings',
    AUTOMATION: '/settings/automation',
    PLATFORM_CONNECTIONS: '/settings/platform-connections',
    INVOICES: '/settings/invoices',
    AUTO_SENDERS: '/settings/auto-senders',
    REMINDERS: '/settings/reminders',
    GENERAL: '/settings/general',
    TEST_EMAIL: '/settings/test-email',
    TEST_SMS: '/settings/test-sms',
    TEST_PLATFORM: (platform: string) => `/settings/test-platform/${platform}`,
  },
  
  // Properties
  PROPERTIES: {
    BASE: '/properties',
    LIST: '/properties',
    BY_ID: (id: string) => `/properties/${id}`,
    TYPES: '/properties/types',
    LOCATIONS: '/properties/dubai-locations',
    PRICING_RULES: (id: string) => `/properties/${id}/pricing-rules`,
    PRICE_HISTORY: (id: string) => `/properties/${id}/price-history`,
    PHOTOS: (id: string) => `/properties/${id}/photos`,
    UPLOAD_PHOTOS: (id: string) => `/properties/${id}/photos/upload`,
    SET_COVER_PHOTO: (id: string, photoId: string) => `/properties/${id}/photos/${photoId}/cover`,
    DELETE_PHOTO: (id: string, photoId: string) => `/properties/${id}/photos/${photoId}`,
  },
  
  // Reservations
  RESERVATIONS: {
    BASE: '/reservations',
    BY_ID: (id: string) => `/reservations/${id}`,
    CALENDAR: '/reservations/calendar',
    STATS: '/reservations/stats',
    SOURCES: '/reservations/sources',
    AVAILABLE_PROPERTIES: '/reservations/available-properties',
    STATUS: (id: string) => `/reservations/${id}/status`,
    CHECK_IN: (id: string) => `/reservations/${id}/check-in`,
    CHECK_OUT: (id: string) => `/reservations/${id}/check-out`,
    NO_SHOW: (id: string) => `/reservations/${id}/no-show`,
  },
  
  // Analytics
  ANALYTICS: {
    REVENUE: '/analytics/revenue',
    OCCUPANCY: '/analytics/occupancy',
    FINANCIAL: '/analytics/financial',
    MAINTENANCE: '/analytics/maintenance',
    CLEANING: '/analytics/cleaning',
    DASHBOARD: '/analytics/dashboard',
  },
  
  // Maintenance
  MAINTENANCE: {
    BASE: '/maintenance',
    BY_ID: (id: string) => `/maintenance/${id}`,
  },
  
  // Cleaning
  CLEANING: {
    BASE: '/cleaning',
    BY_ID: (id: string) => `/cleaning/${id}`,
  },
  
  // Communication
  COMMUNICATION: {
    SEND_EMAIL: '/communication/send-email',
    SEND_SMS: '/communication/send-sms',
    MESSAGES: '/communication/messages',
    NOTIFICATIONS: '/communication/notifications',
  },
  
  // Transactions
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id: string) => `/transactions/${id}`,
    STATS: '/transactions/stats',
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

