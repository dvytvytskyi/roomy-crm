import { apiClient } from '../client';
import { API_ENDPOINTS, ApiResponse } from '../config';

export interface IncomeDistribution {
  ownerIncome: number;
  roomyAgencyFee: number;
  referringAgent: number;
  totalProfit: number;
}

export interface IncomeSettings {
  id: string;
  propertyId: string;
  ownerIncome: number;
  roomyAgencyFee: number;
  referringAgent: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeCalculation {
  totalProfit: number;
  ownerPayout: number;
  companyRevenue: number;
  roomyRevenue: number;
  agentRevenue: number;
  profitFormula: string;
}

export class IncomeService {
  // Get income settings for a property
  async getIncomeSettings(propertyId: string): Promise<ApiResponse<IncomeSettings>> {
    return apiClient.get<IncomeSettings>(`/properties/${propertyId}/income-settings`);
  }

  // Update income settings for a property
  async updateIncomeSettings(propertyId: string, settings: Partial<IncomeDistribution>): Promise<ApiResponse<IncomeSettings>> {
    return apiClient.put<IncomeSettings>(`/properties/${propertyId}/income-settings`, settings);
  }

  // Get default income settings
  async getDefaultIncomeSettings(): Promise<ApiResponse<IncomeSettings>> {
    return apiClient.get<IncomeSettings>('/settings/income-distribution');
  }

  // Update default income settings
  async updateDefaultIncomeSettings(settings: Partial<IncomeDistribution>): Promise<ApiResponse<IncomeSettings>> {
    return apiClient.put<IncomeSettings>('/settings/income-distribution', settings);
  }

  // Calculate income distribution
  calculateIncomeDistribution(settings: IncomeDistribution): IncomeCalculation {
    const { ownerIncome, roomyAgencyFee, referringAgent, totalProfit } = settings;
    
    const ownerPayout = (totalProfit * ownerIncome) / 100;
    const roomyRevenue = (totalProfit * roomyAgencyFee) / 100;
    const agentRevenue = (totalProfit * referringAgent) / 100;
    const companyRevenue = roomyRevenue + agentRevenue;
    const profitFormula = `${ownerIncome}% Owner / ${100 - ownerIncome}% Company`;
    
    return {
      totalProfit,
      ownerPayout,
      companyRevenue,
      roomyRevenue,
      agentRevenue,
      profitFormula
    };
  }

  // Validate income distribution
  validateIncomeDistribution(settings: IncomeDistribution): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (settings.ownerIncome < 0 || settings.ownerIncome > 100) {
      errors.push('Owner income must be between 0% and 100%');
    }
    
    if (settings.roomyAgencyFee < 0 || settings.roomyAgencyFee > 100) {
      errors.push('Roomy Agency Fee must be between 0% and 100%');
    }
    
    if (settings.referringAgent < 0 || settings.referringAgent > 100) {
      errors.push('Referring Agent must be between 0% and 100%');
    }
    
    const total = settings.ownerIncome + settings.roomyAgencyFee + settings.referringAgent;
    if (Math.abs(total - 100) > 0.01) {
      errors.push(`Total percentage must equal 100%. Current: ${total.toFixed(1)}%`);
    }
    
    if (settings.totalProfit < 0) {
      errors.push('Total profit must be positive');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const incomeService = new IncomeService();
