// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://5.223.55.121:3001/api',
  TIMEOUT: 30000, // Збільшуємо timeout до 30 секунд
  HEADERS: {
    'Content-Type': 'application/json',
  },
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
    TEST_EMAIL: '/settings/test/email',
    TEST_SMS: '/settings/test/sms',
    TEST_PLATFORM: (platform: string) => `/settings/test/platform/${platform}`,
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
  },
  
  // Reservations
  RESERVATIONS: {
    BASE: '/reservations',
    BY_ID: (id: string) => `/reservations/${id}`,
    AVAILABILITY: '/reservations/availability',
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
