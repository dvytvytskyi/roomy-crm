import { apiClientV2 } from '../config-v2';
import { SettingDto, SettingsResponseDto, UpdateSettingDto } from '@/types/dto';

// Settings API V2 Service
export const settingsServiceV2 = {
  /**
   * Get all settings
   */
  async getAll(): Promise<ApiResponseV2<SettingsResponseDto>> {
    try {
      const response = await apiClientV2.get('/settings');
      
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error: any) {
      console.error('Error getting all settings:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to get settings',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get setting by key
   */
  async get(key: string): Promise<ApiResponseV2<SettingDto>> {
    try {
      const response = await apiClientV2.get(`/settings/${key}`);
      
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error: any) {
      console.error(`Error getting setting ${key}:`, error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to get setting',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Update setting by key
   */
  async update(key: string, data: UpdateSettingDto): Promise<ApiResponseV2<SettingDto>> {
    try {
      const response = await apiClientV2.put(`/settings/${key}`, data);
      
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error: any) {
      console.error(`Error updating setting ${key}:`, error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update setting',
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Initialize default settings
   */
  async initialize(): Promise<ApiResponseV2<null>> {
    try {
      const response = await apiClientV2.post('/settings/initialize');
      
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error: any) {
      console.error('Error initializing settings:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to initialize settings',
        timestamp: new Date().toISOString()
      };
    }
  }
};

export default settingsServiceV2;
