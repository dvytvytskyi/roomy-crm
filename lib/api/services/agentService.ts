import { apiClient } from '../config'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AgentUnit {
  id: number
  name: string
  location: string
  referralDate: string
  revenue: number
  commission: number
  status: 'Active' | 'Inactive'
  propertyId: string
}

export interface AgentPayout {
  id: number
  date: string
  amount: number
  units: string[]
  status: 'Completed' | 'Pending' | 'Failed'
  description: string
  paymentMethod: string
}

export interface AgentDocument {
  id: number
  name: string
  type: string
  uploadDate: string
  size: string
  s3Key?: string
  s3Url?: string
  filename?: string
}

export interface Agent {
  id: number
  name: string
  email: string
  phone: string
  nationality: string
  birthday: string
  unitsAttracted: number
  totalPayouts: number
  lastPayoutDate: string
  status: 'Active' | 'Inactive'
  joinDate: string
  comments?: string
  createdAt?: string
  createdBy?: string
  lastModifiedAt?: string
  lastModifiedBy?: string
  units?: AgentUnit[]
  payouts?: AgentPayout[]
  documents?: AgentDocument[]
}

export interface AgentStats {
  totalAgents: number
  activeAgents: number
  totalUnits: number
  totalPayouts: number
}

export interface AgentFilters {
  search?: string
  status?: string
  nationality?: string
  joinDateFrom?: string
  joinDateTo?: string
  page?: number
  limit?: number
}

export interface AgentsResponse {
  success: boolean
  data: Agent[]
  total: number
  page: number
  limit: number
}

export interface AgentStatsResponse {
  success: boolean
  data: AgentStats
}

export const agentService = {
  // Get all agents with optional filters
  async getAgents(filters: AgentFilters = {}): Promise<ApiResponse<{ agents: Agent[] }>> {
    // Always return mock data for now
    console.log('👥 AgentService: Using mock agents data');
    
    const mockAgents: Agent[] = [
      {
        id: 1,
        name: 'Ahmed Al-Zahra',
        email: 'ahmed.zahra@example.com',
        phone: '+971 50 123 4567',
        nationality: 'Emirati',
        birthday: '1985-03-15',
        unitsAttracted: 12,
        totalPayouts: 45000,
        lastPayoutDate: '2024-01-15',
        status: 'Active',
        joinDate: '2023-06-01',
        comments: 'Top performer, excellent relationship with property owners',
        createdAt: '2023-06-01T09:00:00Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-15T14:30:00Z',
        lastModifiedBy: 'manager@roomy.com',
        units: [
          {
            id: 1,
            name: 'Luxury Apartment Downtown',
            location: 'Downtown Dubai',
            referralDate: '2023-06-15',
            revenue: 125000,
            commission: 6250,
            status: 'Active',
            propertyId: 'prop_1'
          },
          {
            id: 2,
            name: 'Beach Villa Palm Jumeirah',
            location: 'Palm Jumeirah',
            referralDate: '2023-07-20',
            revenue: 98000,
            commission: 4900,
            status: 'Active',
            propertyId: 'prop_2'
          }
        ],
        payouts: [
          {
            id: 1,
            date: '2024-01-15',
            amount: 45000,
            units: ['Luxury Apartment Downtown', 'Beach Villa Palm Jumeirah'],
            status: 'Completed',
            description: 'Monthly commission payout',
            paymentMethod: 'Bank Transfer'
          }
        ],
        documents: [
          {
            id: 1,
            name: 'Emirates_ID_Ahmed_Zahra.pdf',
            type: 'Emirates ID',
            uploadDate: '2023-06-01',
            size: '1.2 MB',
            s3Key: 'documents/agents/1/emirates_id.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/agents/1/emirates_id.pdf'
          },
          {
            id: 2,
            name: 'Agent_Contract_Ahmed.pdf',
            type: 'Contract',
            uploadDate: '2023-06-01',
            size: '2.5 MB',
            s3Key: 'documents/agents/1/contract.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/agents/1/contract.pdf'
          }
        ]
      },
      {
        id: 2,
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@example.com',
        phone: '+971 50 987 6543',
        nationality: 'British',
        birthday: '1990-07-22',
        unitsAttracted: 8,
        totalPayouts: 32000,
        lastPayoutDate: '2024-01-10',
        status: 'Active',
        joinDate: '2023-08-15',
        comments: 'Specializes in luxury properties, great with international clients',
        createdAt: '2023-08-15T10:30:00Z',
        createdBy: 'manager@roomy.com',
        lastModifiedAt: '2024-01-10T11:20:00Z',
        lastModifiedBy: 'admin@roomy.com',
        units: [
          {
            id: 3,
            name: 'Marina View Studio',
            location: 'Dubai Marina',
            referralDate: '2023-09-01',
            revenue: 85000,
            commission: 4250,
            status: 'Active',
            propertyId: 'prop_3'
          }
        ],
        payouts: [
          {
            id: 2,
            date: '2024-01-10',
            amount: 32000,
            units: ['Marina View Studio'],
            status: 'Completed',
            description: 'Monthly commission payout',
            paymentMethod: 'Bank Transfer'
          }
        ],
        documents: [
          {
            id: 3,
            name: 'Passport_Sarah_Mitchell.pdf',
            type: 'Passport',
            uploadDate: '2023-08-15',
            size: '1.8 MB',
            s3Key: 'documents/agents/2/passport.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/agents/2/passport.pdf'
          }
        ]
      },
      {
        id: 3,
        name: 'Omar Hassan',
        email: 'omar.hassan@example.com',
        phone: '+971 50 555 1234',
        nationality: 'Egyptian',
        birthday: '1988-12-03',
        unitsAttracted: 15,
        totalPayouts: 58000,
        lastPayoutDate: '2024-01-20',
        status: 'Active',
        joinDate: '2023-05-10',
        comments: 'Very active agent, strong local network',
        createdAt: '2023-05-10T08:45:00Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-20T16:15:00Z',
        lastModifiedBy: 'manager@roomy.com',
        units: [
          {
            id: 4,
            name: 'Business Bay Office',
            location: 'Business Bay',
            referralDate: '2023-05-25',
            revenue: 150000,
            commission: 7500,
            status: 'Active',
            propertyId: 'prop_4'
          },
          {
            id: 5,
            name: 'JBR Beach Apartment',
            location: 'Jumeirah Beach Residence',
            referralDate: '2023-11-10',
            revenue: 110000,
            commission: 5500,
            status: 'Active',
            propertyId: 'prop_5'
          }
        ],
        payouts: [
          {
            id: 3,
            date: '2024-01-20',
            amount: 58000,
            units: ['Business Bay Office', 'JBR Beach Apartment'],
            status: 'Completed',
            description: 'Monthly commission payout',
            paymentMethod: 'Bank Transfer'
          }
        ],
        documents: [
          {
            id: 4,
            name: 'Emirates_ID_Omar_Hassan.pdf',
            type: 'Emirates ID',
            uploadDate: '2023-05-10',
            size: '1.1 MB',
            s3Key: 'documents/agents/3/emirates_id.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/agents/3/emirates_id.pdf'
          }
        ]
      },
      {
        id: 4,
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+971 50 777 8888',
        nationality: 'Indian',
        birthday: '1992-05-14',
        unitsAttracted: 6,
        totalPayouts: 28000,
        lastPayoutDate: '2024-01-05',
        status: 'Inactive',
        joinDate: '2023-09-01',
        comments: 'On leave, will return next month',
        createdAt: '2023-09-01T12:00:00Z',
        createdBy: 'manager@roomy.com',
        lastModifiedAt: '2024-01-05T09:30:00Z',
        lastModifiedBy: 'admin@roomy.com',
        units: [
          {
            id: 6,
            name: 'Downtown Loft 2BR',
            location: 'Downtown Dubai',
            referralDate: '2023-10-15',
            revenue: 75000,
            commission: 3750,
            status: 'Active',
            propertyId: 'prop_6'
          }
        ],
        payouts: [
          {
            id: 4,
            date: '2024-01-05',
            amount: 28000,
            units: ['Downtown Loft 2BR'],
            status: 'Completed',
            description: 'Monthly commission payout',
            paymentMethod: 'Bank Transfer'
          }
        ],
        documents: [
          {
            id: 5,
            name: 'Passport_Priya_Sharma.pdf',
            type: 'Passport',
            uploadDate: '2023-09-01',
            size: '1.6 MB',
            s3Key: 'documents/agents/4/passport.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/agents/4/passport.pdf'
          }
        ]
      },
      {
        id: 5,
        name: 'James Wilson',
        email: 'james.wilson@example.com',
        phone: '+971 50 333 4444',
        nationality: 'American',
        birthday: '1985-11-28',
        unitsAttracted: 10,
        totalPayouts: 42000,
        lastPayoutDate: '2024-01-25',
        status: 'Active',
        joinDate: '2023-07-01',
        comments: 'Corporate client specialist, excellent communication skills',
        createdAt: '2023-07-01T14:20:00Z',
        createdBy: 'admin@roomy.com',
        lastModifiedAt: '2024-01-25T13:45:00Z',
        lastModifiedBy: 'manager@roomy.com',
        units: [
          {
            id: 7,
            name: 'DIFC Executive Suite',
            location: 'DIFC',
            referralDate: '2023-08-10',
            revenue: 130000,
            commission: 6500,
            status: 'Active',
            propertyId: 'prop_7'
          },
          {
            id: 8,
            name: 'Jumeirah Hills Villa',
            location: 'Jumeirah Hills',
            referralDate: '2023-12-05',
            revenue: 95000,
            commission: 4750,
            status: 'Active',
            propertyId: 'prop_8'
          }
        ],
        payouts: [
          {
            id: 5,
            date: '2024-01-25',
            amount: 42000,
            units: ['DIFC Executive Suite', 'Jumeirah Hills Villa'],
            status: 'Completed',
            description: 'Monthly commission payout',
            paymentMethod: 'Bank Transfer'
          }
        ],
        documents: [
          {
            id: 6,
            name: 'Passport_James_Wilson.pdf',
            type: 'Passport',
            uploadDate: '2023-07-01',
            size: '2.0 MB',
            s3Key: 'documents/agents/5/passport.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/agents/5/passport.pdf'
          },
          {
            id: 7,
            name: 'Visa_James_Wilson.pdf',
            type: 'Visa',
            uploadDate: '2023-07-01',
            size: '1.4 MB',
            s3Key: 'documents/agents/5/visa.pdf',
            s3Url: 'https://s3.amazonaws.com/roomy-ae/documents/agents/5/visa.pdf'
          }
        ]
      }
    ];

    // Apply filters
    let filteredAgents = mockAgents;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredAgents = filteredAgents.filter(agent => 
        agent.name.toLowerCase().includes(searchLower) ||
        agent.email.toLowerCase().includes(searchLower) ||
        agent.nationality.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filteredAgents = filteredAgents.filter(agent => agent.status === filters.status);
    }

    if (filters.nationality) {
      filteredAgents = filteredAgents.filter(agent => agent.nationality === filters.nationality);
    }

    return {
      success: true,
      data: { agents: filteredAgents }
    };
  },

  // Get agent by ID
  async getAgentById(id: number): Promise<{ success: boolean; data: Agent }> {
    const response = await apiClient.get(`/agents/${id}`)
    return response.data
  },

  // Get agent statistics
  async getAgentStats(): Promise<ApiResponse<AgentStats>> {
    // Always return mock stats for now
    console.log('👥 AgentService: Using mock agent stats');
    
    const mockStats: AgentStats = {
      totalAgents: 5,
      activeAgents: 4,
      totalUnits: 51,
      totalPayouts: 205000
    };

    return {
      success: true,
      data: mockStats
    };
  },

  // Create new agent
  async createAgent(agentData: Omit<Agent, 'id'>): Promise<{ success: boolean; data: Agent }> {
    const response = await apiClient.post('/api/agents', agentData)
    return response.data
  },

  // Update agent
  async updateAgent(id: number, agentData: Partial<Agent>): Promise<{ success: boolean; data: Agent }> {
    const response = await apiClient.put(`/agents/${id}`, agentData)
    return response.data
  },

  // Delete agent
  async deleteAgent(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/agents/${id}`)
    return response.data
  },

  // Bulk operations
  async bulkUpdateAgents(agentIds: number[], updates: Partial<Agent>): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch('/agents/bulk', { agentIds, updates })
    return response.data
  },

  async bulkDeleteAgents(agentIds: number[]): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete('/api/agents/bulk', { data: { agentIds } })
    return response.data
  },

  // Agent Units operations
  async getAgentUnits(agentId: number): Promise<{ success: boolean; data: AgentUnit[] }> {
    const response = await apiClient.get(`/agents/${agentId}/units`)
    return response.data
  },

  async addAgentUnit(agentId: number, unitData: Omit<AgentUnit, 'id'>): Promise<{ success: boolean; data: AgentUnit }> {
    const response = await apiClient.post(`/agents/${agentId}/units`, unitData)
    return response.data
  },

  async removeAgentUnit(agentId: number, unitId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/agents/${agentId}/units/${unitId}`)
    return response.data
  },

  // Agent Payouts operations
  async getAgentPayouts(agentId: number): Promise<{ success: boolean; data: AgentPayout[] }> {
    const response = await apiClient.get(`/agents/${agentId}/payouts`)
    return response.data
  },

  async addAgentPayout(agentId: number, payoutData: Omit<AgentPayout, 'id'>): Promise<{ success: boolean; data: AgentPayout }> {
    const response = await apiClient.post(`/agents/${agentId}/payouts`, payoutData)
    return response.data
  },

  async removeAgentPayout(agentId: number, payoutId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/agents/${agentId}/payouts/${payoutId}`)
    return response.data
  },

  // Agent Documents operations
  async getAgentDocuments(agentId: number): Promise<{ success: boolean; data: AgentDocument[] }> {
    const response = await apiClient.get(`/agents/${agentId}/documents`)
    return response.data
  },

  async addAgentDocument(agentId: number, documentData: Omit<AgentDocument, 'id'>): Promise<{ success: boolean; data: AgentDocument }> {
    const response = await apiClient.post(`/agents/${agentId}/documents`, documentData)
    return response.data
  },

  async removeAgentDocument(agentId: number, documentId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/agents/${agentId}/documents/${documentId}`)
    return response.data
  }
}
