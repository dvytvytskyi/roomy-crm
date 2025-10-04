// Export all API services and utilities
export { apiClient, tokenManager } from './client';
export { API_CONFIG, API_ENDPOINTS } from './config';
export type { ApiResponse, PaginationParams, FilterParams } from './config';

// V2 API exports
export { apiClientV2, tokenManagerV2 } from './client-v2';
export { API_V2_CONFIG, API_V2_ENDPOINTS, shouldUseV2API, getApiUrl } from './config-v2';

// Services
export { userService } from './services/userService';
export { settingsService } from './services/settingsService';
export { authService } from './services/authService';
export { propertyService } from './services/propertyService';

// V2 Services
export { userServiceV2 } from './services/userService-v2';
export { authServiceV2 } from './services/authService-v2';

// Adapters (automatically choose V1 or V2)
export { authServiceAdapted, userServiceAdapted } from './adapters/apiAdapter';

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
