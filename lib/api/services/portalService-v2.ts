import { apiClientV2 } from '../config-v2';
import { ApiResponseV2 } from '../types';

// ==================== TYPES ====================

export interface Property {
  id: string;
  name: string;
  nickname: string | null;
  title: string | null;
  type: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  price_per_night: number;
  is_active: boolean;
  is_published: boolean;
  owner_id: string | null;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
  users_properties_owner_idTousers?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  users_properties_agent_idTousers?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface Reservation {
  id: string;
  reservation_id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  paid_amount: number;
  outstanding_balance: number;
  status: string;
  source: string;
  created_at: string;
  properties?: {
    id: string;
    title: string | null;
    address: string;
  };
}

export interface FinancialSummary {
  revenue: {
    total: number;
    paid: number;
    outstanding: number;
  };
  expenses: {
    total: number;
    breakdown: Array<{
      amount: number;
      category: string;
    }>;
  };
  netIncome: number;
  reservationsCount: number;
}

export interface OwnerFinancialSummary {
  summary: {
    totalRevenue: number;
    totalPaid: number;
    totalOutstanding: number;
    totalExpenses: number;
    netIncome: number;
  };
  propertiesCount: number;
  reservationsCount: number;
  propertyBreakdown: Array<{
    propertyId: string;
    propertyTitle: string;
    revenue: number;
    paid: number;
    expenses: number;
    netIncome: number;
  }>;
}

// ==================== AGENT SERVICES ====================

export const agentPortalService = {
  /**
   * Get properties assigned to the agent
   */
  getProperties: async (): Promise<ApiResponseV2<Property[]>> => {
    return apiClientV2.get('/portal/agent/properties');
  },

  /**
   * Get reservations for agent's properties
   */
  getReservations: async (): Promise<ApiResponseV2<Reservation[]>> => {
    return apiClientV2.get('/portal/agent/reservations');
  },

  /**
   * Get financial summary for agent's properties
   */
  getFinances: async (): Promise<ApiResponseV2<FinancialSummary>> => {
    return apiClientV2.get('/portal/agent/finances');
  },
};

// ==================== OWNER SERVICES ====================

export const ownerPortalService = {
  /**
   * Get properties owned by the owner
   */
  getProperties: async (): Promise<ApiResponseV2<Property[]>> => {
    return apiClientV2.get('/portal/owner/properties');
  },

  /**
   * Get reservations for owner's properties
   */
  getReservations: async (): Promise<ApiResponseV2<Reservation[]>> => {
    return apiClientV2.get('/portal/owner/reservations');
  },

  /**
   * Get financial summary for owner's properties
   */
  getFinances: async (): Promise<ApiResponseV2<OwnerFinancialSummary>> => {
    return apiClientV2.get('/portal/owner/finances');
  },
};

// ==================== COMBINED PORTAL SERVICE ====================

/**
 * Portal Service
 * Provides access to agent and owner portal data
 */
export const portalService = {
  agent: agentPortalService,
  owner: ownerPortalService,
};

export default portalService;

