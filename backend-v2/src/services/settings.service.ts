import { PrismaClient } from '@prisma/client';
import { ServiceResponse } from '../types';
import { SettingDto, SettingsResponseDto, UpdateSettingDto } from '../types/dto';
import logger from '../utils/logger';

export class SettingsService {
  private static instance: SettingsService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Get all settings
   */
  public async getAll(): Promise<ServiceResponse<SettingsResponseDto>> {
    try {
      logger.info('[Settings] Getting all settings');

      const settings = await this.prisma.settings.findMany({
        orderBy: {
          category: 'asc'
        }
      });

      await this.prisma.$disconnect();

      const settingsDto: SettingDto[] = settings.map(setting => ({
        key: setting.key,
        value: setting.value,
        description: setting.description || '',
        category: setting.category,
        type: setting.type as 'string' | 'number' | 'boolean' | 'json',
        isEditable: setting.is_editable,
        createdAt: setting.created_at.toISOString(),
        updatedAt: setting.updated_at.toISOString()
      }));

      const response: SettingsResponseDto = {
        settings: settingsDto,
        total: settingsDto.length
      };

      logger.info(`[Settings] Retrieved ${settingsDto.length} settings`);
      return { success: true, data: response };
    } catch (error) {
      await this.prisma.$disconnect();
      logger.error('[Settings] Error getting all settings:', error);
      return { success: false, error: 'Database operation failed' };
    }
  }

  /**
   * Get setting by key
   */
  public async get(key: string): Promise<ServiceResponse<SettingDto>> {
    try {
      logger.info(`[Settings] Getting setting: ${key}`);

      const setting = await this.prisma.settings.findUnique({
        where: { key }
      });

      await this.prisma.$disconnect();

      if (!setting) {
        logger.warn(`[Settings] Setting not found: ${key}`);
        return { success: false, error: 'Setting not found' };
      }

      const settingDto: SettingDto = {
        key: setting.key,
        value: setting.value,
        description: setting.description || '',
        category: setting.category,
        type: setting.type as 'string' | 'number' | 'boolean' | 'json',
        isEditable: setting.is_editable,
        createdAt: setting.created_at.toISOString(),
        updatedAt: setting.updated_at.toISOString()
      };

      logger.info(`[Settings] Retrieved setting: ${key}`);
      return { success: true, data: settingDto };
    } catch (error) {
      await this.prisma.$disconnect();
      logger.error(`[Settings] Error getting setting ${key}:`, error);
      return { success: false, error: 'Database operation failed' };
    }
  }

  /**
   * Update setting by key
   */
  public async update(key: string, updateData: UpdateSettingDto): Promise<ServiceResponse<SettingDto>> {
    try {
      logger.info(`[Settings] Updating setting: ${key}`);

      // Check if setting exists and is editable
      const existingSetting = await this.prisma.settings.findUnique({
        where: { key }
      });

      if (!existingSetting) {
        await this.prisma.$disconnect();
        logger.warn(`[Settings] Setting not found: ${key}`);
        return { success: false, error: 'Setting not found' };
      }

      if (!existingSetting.is_editable) {
        await this.prisma.$disconnect();
        logger.warn(`[Settings] Setting is not editable: ${key}`);
        return { success: false, error: 'Setting is not editable' };
      }

      // Validate value based on type
      if (!this.validateValue(updateData.value, existingSetting.type)) {
        await this.prisma.$disconnect();
        logger.warn(`[Settings] Invalid value for type ${existingSetting.type}: ${updateData.value}`);
        return { success: false, error: `Invalid value for type ${existingSetting.type}` };
      }

      const updatedSetting = await this.prisma.settings.update({
        where: { key },
        data: {
          value: updateData.value,
          updated_at: new Date()
        }
      });

      // Create audit log
      const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await this.prisma.audit_logs.create({
        data: {
          id: auditId,
          entity_type: 'SETTING',
          entity_id: key,
          action: 'UPDATE',
          user_id: '1', // Use admin user ID for settings updates
          changes: {
            key: key,
            oldValue: existingSetting.value,
            newValue: updateData.value,
            type: existingSetting.type
          },
          ip_address: '127.0.0.1',
          user_agent: 'Settings API'
        }
      });

      await this.prisma.$disconnect();

      const settingDto: SettingDto = {
        key: updatedSetting.key,
        value: updatedSetting.value,
        description: updatedSetting.description || '',
        category: updatedSetting.category,
        type: updatedSetting.type as 'string' | 'number' | 'boolean' | 'json',
        isEditable: updatedSetting.is_editable,
        createdAt: updatedSetting.created_at.toISOString(),
        updatedAt: updatedSetting.updated_at.toISOString()
      };

      logger.info(`[Settings] Updated setting: ${key}`);
      return { success: true, data: settingDto };
    } catch (error) {
      await this.prisma.$disconnect();
      logger.error(`[Settings] Error updating setting ${key}:`, error);
      return { success: false, error: 'Database operation failed' };
    }
  }

  /**
   * Get setting value by key (for internal use)
   */
  public async getValue(key: string): Promise<string | null> {
    try {
      const setting = await this.prisma.settings.findUnique({
        where: { key },
        select: { value: true }
      });

      await this.prisma.$disconnect();
      return setting?.value || null;
    } catch (error) {
      await this.prisma.$disconnect();
      logger.error(`[Settings] Error getting value for ${key}:`, error);
      return null;
    }
  }

  /**
   * Get setting value as number
   */
  public async getNumberValue(key: string): Promise<number | null> {
    const value = await this.getValue(key);
    if (value === null) return null;
    
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Get setting value as boolean
   */
  public async getBooleanValue(key: string): Promise<boolean | null> {
    const value = await this.getValue(key);
    if (value === null) return null;
    
    return value.toLowerCase() === 'true';
  }

  /**
   * Get setting value as JSON
   */
  public async getJsonValue(key: string): Promise<any | null> {
    const value = await this.getValue(key);
    if (value === null) return null;
    
    try {
      return JSON.parse(value);
    } catch (error) {
      logger.error(`[Settings] Error parsing JSON for ${key}:`, error);
      return null;
    }
  }

  /**
   * Initialize default settings
   */
  public async initializeDefaults(): Promise<void> {
    try {
      logger.info('[Settings] Initializing default settings');

      const defaultSettings = [
        // Commission settings
        { key: 'commission_rate', value: '0.10', description: 'Default commission rate (10%)', category: 'financial', type: 'number' },
        { key: 'platform_fee_rate', value: '0.03', description: 'Platform fee rate (3%)', category: 'financial', type: 'number' },
        
        // Cancellation policies
        { key: 'cancellation_policy_strict', value: '14', description: 'Strict cancellation policy (days)', category: 'policies', type: 'number' },
        { key: 'cancellation_policy_moderate', value: '7', description: 'Moderate cancellation policy (days)', category: 'policies', type: 'number' },
        { key: 'cancellation_policy_flexible', value: '1', description: 'Flexible cancellation policy (days)', category: 'policies', type: 'number' },
        
        // Booking settings
        { key: 'min_booking_duration', value: '1', description: 'Minimum booking duration (nights)', category: 'booking', type: 'number' },
        { key: 'max_booking_duration', value: '30', description: 'Maximum booking duration (nights)', category: 'booking', type: 'number' },
        { key: 'advance_booking_limit', value: '365', description: 'Maximum days in advance for booking', category: 'booking', type: 'number' },
        
        // Property settings
        { key: 'default_property_status', value: 'active', description: 'Default status for new properties', category: 'properties', type: 'string' },
        { key: 'auto_approve_bookings', value: 'false', description: 'Automatically approve bookings', category: 'properties', type: 'boolean' },
        
        // Notification settings
        { key: 'email_notifications_enabled', value: 'true', description: 'Enable email notifications', category: 'notifications', type: 'boolean' },
        { key: 'sms_notifications_enabled', value: 'false', description: 'Enable SMS notifications', category: 'notifications', type: 'boolean' },
        
        // System settings
        { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode', category: 'system', type: 'boolean' },
        { key: 'debug_mode', value: 'false', description: 'Enable debug mode', category: 'system', type: 'boolean' },
        { key: 'max_file_upload_size', value: '10485760', description: 'Maximum file upload size (bytes)', category: 'system', type: 'number' },
        
        // Currency and localization
        { key: 'default_currency', value: 'USD', description: 'Default currency', category: 'localization', type: 'string' },
        { key: 'default_timezone', value: 'UTC', description: 'Default timezone', category: 'localization', type: 'string' },
        { key: 'date_format', value: 'MM/DD/YYYY', description: 'Default date format', category: 'localization', type: 'string' },
        
        // Analytics and KPIs
        { key: 'guest_satisfaction_target', value: '4.2', description: 'Target guest satisfaction rating', category: 'analytics', type: 'number' },
        { key: 'default_occupancy_rate', value: '75', description: 'Default occupancy rate percentage', category: 'analytics', type: 'number' },
        { key: 'default_cleaning_fee', value: '50', description: 'Default cleaning fee amount', category: 'financial', type: 'number' },
        { key: 'default_tax_rate', value: '0.10', description: 'Default tax rate (10%)', category: 'financial', type: 'number' },
        
        // Payment gateway settings
        { key: 'stripe_fee_percentage', value: '2.9', description: 'Stripe processing fee percentage', category: 'payments', type: 'number' },
        { key: 'stripe_fee_fixed', value: '1.00', description: 'Stripe fixed fee amount', category: 'payments', type: 'number' },
        { key: 'paypal_fee_percentage', value: '3.4', description: 'PayPal processing fee percentage', category: 'payments', type: 'number' },
        { key: 'paypal_fee_fixed', value: '0.50', description: 'PayPal fixed fee amount', category: 'payments', type: 'number' },
        
        // Invoice settings
        { key: 'default_vat_rate', value: '5.0', description: 'Default VAT rate percentage', category: 'financial', type: 'number' },
        { key: 'tourism_tax_rate', value: '2.0', description: 'Tourism tax rate percentage', category: 'financial', type: 'number' },
        { key: 'service_fee_rate', value: '3.0', description: 'Service fee rate percentage', category: 'financial', type: 'number' },
        { key: 'city_tax_fixed', value: '15.0', description: 'Fixed city tax amount', category: 'financial', type: 'number' },
      ];

      for (const setting of defaultSettings) {
        await this.prisma.settings.upsert({
          where: { key: setting.key },
          update: {},
          create: {
            key: setting.key,
            value: setting.value,
            description: setting.description,
            category: setting.category,
            type: setting.type,
            is_editable: true
          }
        });
      }

      await this.prisma.$disconnect();
      logger.info(`[Settings] Initialized ${defaultSettings.length} default settings`);
    } catch (error) {
      await this.prisma.$disconnect();
      logger.error('[Settings] Error initializing default settings:', error);
    }
  }

  /**
   * Validate value based on type
   */
  private validateValue(value: string, type: string): boolean {
    switch (type) {
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
      case 'json':
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      case 'string':
      default:
        return true;
    }
  }
}

export default SettingsService.getInstance();
