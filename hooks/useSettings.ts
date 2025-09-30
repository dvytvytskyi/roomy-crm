import { useApi, useApiMutation } from './useApi';
import { 
  settingsService, 
  AutomationSettings, 
  PlatformConnectionSettings, 
  InvoiceSettings, 
  AutoSenderSettings, 
  ReminderSettings, 
  GeneralSettings, 
  AllSettings 
} from '@/lib/api';

export function useAllSettings() {
  return useApi<AllSettings>(
    () => settingsService.getAllSettings(),
    { immediate: true }
  );
}

export function useAutomationSettings() {
  return useApi<AutomationSettings>(
    () => settingsService.getAutomationSettings(),
    { immediate: true }
  );
}

export function usePlatformConnectionSettings() {
  return useApi<PlatformConnectionSettings>(
    () => settingsService.getPlatformConnectionSettings(),
    { immediate: true }
  );
}

export function useInvoiceSettings() {
  return useApi<InvoiceSettings>(
    () => settingsService.getInvoiceSettings(),
    { immediate: true }
  );
}

export function useAutoSenderSettings() {
  return useApi<AutoSenderSettings>(
    () => settingsService.getAutoSenderSettings(),
    { immediate: true }
  );
}

export function useReminderSettings() {
  return useApi<ReminderSettings>(
    () => settingsService.getReminderSettings(),
    { immediate: true }
  );
}

export function useGeneralSettings() {
  return useApi<GeneralSettings>(
    () => settingsService.getGeneralSettings(),
    { immediate: true }
  );
}

export function useUpdateAutomationSettings() {
  return useApiMutation<any, Partial<AutomationSettings>>(
    (settings) => settingsService.updateAutomationSettings(settings)
  );
}

export function useUpdatePlatformConnectionSettings() {
  return useApiMutation<any, Partial<PlatformConnectionSettings>>(
    (settings) => settingsService.updatePlatformConnectionSettings(settings)
  );
}

export function useUpdateInvoiceSettings() {
  return useApiMutation<any, Partial<InvoiceSettings>>(
    (settings) => settingsService.updateInvoiceSettings(settings)
  );
}

export function useUpdateAutoSenderSettings() {
  return useApiMutation<any, Partial<AutoSenderSettings>>(
    (settings) => settingsService.updateAutoSenderSettings(settings)
  );
}

export function useUpdateReminderSettings() {
  return useApiMutation<any, Partial<ReminderSettings>>(
    (settings) => settingsService.updateReminderSettings(settings)
  );
}

export function useUpdateGeneralSettings() {
  return useApiMutation<any, Partial<GeneralSettings>>(
    (settings) => settingsService.updateGeneralSettings(settings)
  );
}

export function useTestEmailConnection() {
  return useApiMutation<any, any>(
    (emailSettings) => settingsService.testEmailConnection(emailSettings)
  );
}

export function useTestSMSConnection() {
  return useApiMutation<any, any>(
    (smsSettings) => settingsService.testSMSConnection(smsSettings)
  );
}

export function useTestPlatformConnection() {
  return useApiMutation<any, { platform: string; settings: any }>(
    ({ platform, settings }) => settingsService.testPlatformConnection(platform, settings)
  );
}
