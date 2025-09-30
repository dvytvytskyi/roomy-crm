import { apiClient } from '../client';
import { API_ENDPOINTS, ApiResponse } from '../config';

export interface AutomationSettings {
  autoConfirmReservations: boolean;
  autoSendWelcomeEmail: boolean;
  autoSendCheckoutReminder: boolean;
  autoCreateCleaningTask: boolean;
  autoCreateMaintenanceTask: boolean;
  autoUpdatePricing: boolean;
  autoSyncWithExternalPlatforms: boolean;
}

export interface PlatformConnectionSettings {
  airbnb: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string;
    autoSync: boolean;
  };
  booking: {
    enabled: boolean;
    apiKey: string;
    apiSecret: string;
    autoSync: boolean;
  };
  pricelab: {
    enabled: boolean;
    apiKey: string;
    autoUpdate: boolean;
  };
}

export interface InvoiceSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxNumber: string;
  logoUrl: string;
  defaultCurrency: string;
  paymentTerms: string;
  footerText: string;
}

export interface AutoSenderSettings {
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  sms: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    apiSecret: string;
    fromNumber: string;
  };
}

export interface ReminderSettings {
  checkInReminder: {
    enabled: boolean;
    hoursBefore: number;
    message: string;
  };
  checkOutReminder: {
    enabled: boolean;
    hoursBefore: number;
    message: string;
  };
  paymentReminder: {
    enabled: boolean;
    daysAfter: number;
    message: string;
  };
  maintenanceReminder: {
    enabled: boolean;
    daysBefore: number;
    message: string;
  };
}

export interface GeneralSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  twoFactorAuth: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface AllSettings {
  automation: AutomationSettings;
  platform: PlatformConnectionSettings;
  invoice: InvoiceSettings;
  autoSender: AutoSenderSettings;
  reminder: ReminderSettings;
  general: GeneralSettings;
}

export class SettingsService {
  // Get all settings
  async getAllSettings(): Promise<ApiResponse<AllSettings>> {
    return apiClient.get<AllSettings>(API_ENDPOINTS.SETTINGS.BASE);
  }

  // Automation settings
  async getAutomationSettings(): Promise<ApiResponse<AutomationSettings>> {
    return apiClient.get<AutomationSettings>(API_ENDPOINTS.SETTINGS.AUTOMATION);
  }

  async updateAutomationSettings(settings: Partial<AutomationSettings>): Promise<ApiResponse> {
    return apiClient.put(API_ENDPOINTS.SETTINGS.AUTOMATION, settings);
  }

  // Platform connection settings
  async getPlatformConnectionSettings(): Promise<ApiResponse<PlatformConnectionSettings>> {
    return apiClient.get<PlatformConnectionSettings>(API_ENDPOINTS.SETTINGS.PLATFORM_CONNECTIONS);
  }

  async updatePlatformConnectionSettings(settings: Partial<PlatformConnectionSettings>): Promise<ApiResponse> {
    return apiClient.put(API_ENDPOINTS.SETTINGS.PLATFORM_CONNECTIONS, settings);
  }

  // Invoice settings
  async getInvoiceSettings(): Promise<ApiResponse<InvoiceSettings>> {
    return apiClient.get<InvoiceSettings>(API_ENDPOINTS.SETTINGS.INVOICES);
  }

  async updateInvoiceSettings(settings: Partial<InvoiceSettings>): Promise<ApiResponse> {
    return apiClient.put(API_ENDPOINTS.SETTINGS.INVOICES, settings);
  }

  // Auto-sender settings
  async getAutoSenderSettings(): Promise<ApiResponse<AutoSenderSettings>> {
    return apiClient.get<AutoSenderSettings>(API_ENDPOINTS.SETTINGS.AUTO_SENDERS);
  }

  async updateAutoSenderSettings(settings: Partial<AutoSenderSettings>): Promise<ApiResponse> {
    return apiClient.put(API_ENDPOINTS.SETTINGS.AUTO_SENDERS, settings);
  }

  // Reminder settings
  async getReminderSettings(): Promise<ApiResponse<ReminderSettings>> {
    return apiClient.get<ReminderSettings>(API_ENDPOINTS.SETTINGS.REMINDERS);
  }

  async updateReminderSettings(settings: Partial<ReminderSettings>): Promise<ApiResponse> {
    return apiClient.put(API_ENDPOINTS.SETTINGS.REMINDERS, settings);
  }

  // General settings
  async getGeneralSettings(): Promise<ApiResponse<GeneralSettings>> {
    return apiClient.get<GeneralSettings>(API_ENDPOINTS.SETTINGS.GENERAL);
  }

  async updateGeneralSettings(settings: Partial<GeneralSettings>): Promise<ApiResponse> {
    return apiClient.put(API_ENDPOINTS.SETTINGS.GENERAL, settings);
  }

  // Test connections
  async testEmailConnection(emailSettings: any): Promise<ApiResponse> {
    return apiClient.post(API_ENDPOINTS.SETTINGS.TEST_EMAIL, emailSettings);
  }

  async testSMSConnection(smsSettings: any): Promise<ApiResponse> {
    return apiClient.post(API_ENDPOINTS.SETTINGS.TEST_SMS, smsSettings);
  }

  async testPlatformConnection(platform: string, settings: any): Promise<ApiResponse> {
    return apiClient.post(API_ENDPOINTS.SETTINGS.TEST_PLATFORM(platform), settings);
  }
}

export const settingsService = new SettingsService();
