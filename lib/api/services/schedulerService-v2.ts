import { apiClientV2 } from '../config-v2';
import { ApiResponseV2 } from '../types';

// Scheduler types
export interface SchedulerEventV2 {
  id: string;
  type: 'reservation' | 'block';
  title: string;
  startDate: string;
  endDate: string;
  propertyId: string;
  property: {
    id: string;
    name: string;
  };
  // Additional fields for reservations
  status?: string;
  guestName?: string;
  totalAmount?: number;
  guestsCount?: number;
  // Additional fields for blocks
  notes?: string;
  createdBy?: string;
}

export interface SchedulerEventsResponseV2 {
  events: SchedulerEventV2[];
  total: number;
}

export interface CreateManualBlockV2 {
  propertyId: string;
  startDate: string;
  endDate: string;
  title: string;
  notes?: string;
}

export interface ManualBlockResponseV2 {
  id: string;
  propertyId: string;
  property: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  title: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface SchedulerFiltersV2 {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  type?: string[];
}

class SchedulerServiceV2 {
  /**
   * Get scheduler events (reservations and manual blocks)
   */
  async getEvents(filters: SchedulerFiltersV2 = {}): Promise<ApiResponseV2<SchedulerEventsResponseV2>> {
    try {
      const response = await apiClientV2.get('/scheduler/events', { params: filters });
      
      return {
        success: true,
        data: response.data.data!,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to retrieve scheduler events',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create a manual block
   */
  async createBlock(data: CreateManualBlockV2): Promise<ApiResponseV2<ManualBlockResponseV2>> {
    try {
      const response = await apiClientV2.post('/scheduler/blocks', data);
      
      return {
        success: true,
        data: response.data.data!,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Unknown error',
        message: error.response?.data?.message || 'Failed to create manual block',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const schedulerServiceV2 = new SchedulerServiceV2();
export default schedulerServiceV2;
