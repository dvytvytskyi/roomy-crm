import { apiClient } from '../config'

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
  async getAgents(filters: AgentFilters = {}): Promise<AgentsResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await apiClient.get(`/agents?${params.toString()}`)
    return response.data
  },

  // Get agent by ID
  async getAgentById(id: number): Promise<{ success: boolean; data: Agent }> {
    const response = await apiClient.get(`/agents/${id}`)
    return response.data
  },

  // Get agent statistics
  async getAgentStats(): Promise<AgentStatsResponse> {
    const response = await apiClient.get('/api/agents/stats')
    return response.data
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
