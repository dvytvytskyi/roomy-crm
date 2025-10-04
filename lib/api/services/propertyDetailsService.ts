import { apiClient } from '../client';

export interface PropertyDetails {
  id: string;
  name: string;
  nickname?: string;
  title?: string;
  type: string;
  type_of_unit?: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  description?: string;
  amenities: string[];
  rules: string[];
  tags: string[];
  status: string;
  createdAt: string;
  lastModifiedAt: string;
  primaryImage?: string;
  pricelabId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    flag: string;
    status: string;
  };
  ownerId?: string;
  agentId?: string;
  agentName?: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  status: string;
  firstName?: string;
  lastName?: string;
}

export interface IncomeDistribution {
  ownerIncome: number;
  roomyAgencyFee: number;
  referringAgent: number;
}

export interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  ownerPayout: number;
  companyRevenue: number;
  agentProfit: number;
  roomyAgencyFee: number;
}

class PropertyDetailsService {
  /**
   * Get property details by ID
   */
  async getPropertyDetails(propertyId: string): Promise<PropertyDetails | null> {
    try {
      const response = await apiClient.get(`/api/properties/${propertyId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Failed to fetch property details:', response.message);
      return null;
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  }

  /**
   * Update property details
   */
  async updatePropertyDetails(propertyId: string, updates: Partial<PropertyDetails>): Promise<boolean> {
    try {
      const response = await apiClient.put(`/api/properties/${propertyId}`, updates);
      
      if (response.success) {
        console.log('Property updated successfully');
        return true;
      }
      
      console.error('Failed to update property:', response.message);
      return false;
    } catch (error) {
      console.error('Error updating property:', error);
      return false;
    }
  }

  /**
   * Get all owners
   */
  async getOwners(): Promise<Owner[]> {
    try {
      const response = await apiClient.get('/api/users/owners');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Failed to fetch owners:', response.message);
      return [];
    } catch (error) {
      console.error('Error fetching owners:', error);
      return [];
    }
  }

  /**
   * Get owner by ID
   */
  async getOwner(ownerId: string): Promise<Owner | null> {
    try {
      const response = await apiClient.get(`/api/users/owners/${ownerId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Failed to fetch owner:', response.message);
      return null;
    } catch (error) {
      console.error('Error fetching owner:', error);
      return null;
    }
  }

  /**
   * Assign owner to property
   */
  async assignOwner(propertyId: string, ownerId: string): Promise<boolean> {
    try {
      const response = await apiClient.put(`/api/properties/${propertyId}`, {
        ownerId: ownerId
      });
      
      if (response.success) {
        console.log('Owner assigned successfully');
        return true;
      }
      
      console.error('Failed to assign owner:', response.message);
      return false;
    } catch (error) {
      console.error('Error assigning owner:', error);
      return false;
    }
  }

  /**
   * Get income distribution settings
   */
  async getIncomeDistribution(): Promise<IncomeDistribution> {
    try {
      const response = await apiClient.get('/api/settings/automation');
      
      if (response.success && response.data?.incomeDistribution) {
        return response.data.incomeDistribution;
      }
      
      // Return default values if not configured
      return {
        ownerIncome: 70,
        roomyAgencyFee: 25,
        referringAgent: 5
      };
    } catch (error) {
      console.error('Error fetching income distribution:', error);
      return {
        ownerIncome: 70,
        roomyAgencyFee: 25,
        referringAgent: 5
      };
    }
  }

  /**
   * Get financial data for property
   */
  async getFinancialData(propertyId: string, dateRange?: { start: string; end: string }): Promise<FinancialData | null> {
    try {
      const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
      const response = await apiClient.get(`/api/financial/${propertyId}${params}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Failed to fetch financial data:', response.message);
      return null;
    } catch (error) {
      console.error('Error fetching financial data:', error);
      return null;
    }
  }

  /**
   * Get current price from PriceLab
   */
  async getCurrentPrice(propertyId: string): Promise<number | null> {
    try {
      const response = await apiClient.get(`/api/properties/${propertyId}/price`);
      
      if (response.success && response.data?.currentPrice) {
        return response.data.currentPrice;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current price:', error);
      return null;
    }
  }
}

export const propertyDetailsService = new PropertyDetailsService();
