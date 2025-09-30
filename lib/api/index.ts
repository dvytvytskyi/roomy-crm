// Export all API services and utilities
export { apiClient, tokenManager } from './client';
export { API_CONFIG, API_ENDPOINTS } from './config';
export type { ApiResponse, PaginationParams, FilterParams } from './config';

// Services
export { userService } from './services/userService';
export { settingsService } from './services/settingsService';
export { authService } from './services/authService';
export { propertyService } from './services/propertyService';

// Types
export type { User, UserStats, OwnerStats, AgentStats, GuestStats, UsersResponse } from './services/userService';
export type { 
  AutomationSettings, 
  PlatformConnectionSettings, 
  InvoiceSettings, 
  AutoSenderSettings, 
  ReminderSettings, 
  GeneralSettings, 
  AllSettings 
} from './services/settingsService';
export type { LoginRequest, RegisterRequest, AuthResponse } from './services/authService';
export type { 
  Property, 
  CreatePropertyRequest, 
  UpdatePropertyRequest, 
  PropertyFilters, 
  PropertiesResponse 
} from './services/propertyService';
