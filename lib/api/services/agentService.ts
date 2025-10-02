import { apiClient } from '../config'

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
    const response = await apiClient.get('/agents/stats')
    return response.data
  },

  // Create new agent
  async createAgent(agentData: Omit<Agent, 'id'>): Promise<{ success: boolean; data: Agent }> {
    const response = await apiClient.post('/agents', agentData)
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
    const response = await apiClient.delete('/agents/bulk', { data: { agentIds } })
    return response.data
  }
}
