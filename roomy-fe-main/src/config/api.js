// API Configuration for roomy-fe-main

// Backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v2';

// Use public API endpoints (no authentication required)
export const API_ENDPOINTS = {
  // Properties
  PROPERTIES: {
    LIST: `${API_BASE_URL}/public/properties`,
    DETAILS: (id) => `${API_BASE_URL}/public/properties/${id}`,
    AVAILABILITY: (id) => `${API_BASE_URL}/public/properties/${id}/availability`,
  },
  
  // Reservations
  RESERVATIONS: {
    CREATE: `${API_BASE_URL}/public/reservations`,
    CHECK_AVAILABILITY: `${API_BASE_URL}/public/reservations/check-availability`,
  },
};

// Helper function to format dates for API
export const formatDateForAPI = (date) => {
  if (!date) return null;
  
  // Handle dayjs objects
  if (date.$d) {
    return new Date(date.$d).toISOString().split('T')[0];
  }
  
  // Handle Date objects
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  return date;
};

// Helper function to build query string
export const buildQueryString = (params) => {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  return new URLSearchParams(filteredParams).toString();
};

