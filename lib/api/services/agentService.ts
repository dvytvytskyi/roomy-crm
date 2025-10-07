import { userServiceAdapter } from '../adapters/apiAdapter'

// Agent interfaces - using the same structure as backend User model
export interface Agent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  nationality?: string
  dateOfBirth?: string
  role: 'AGENT'
  status: 'ACTIVE' | 'INACTIVE'
  avatar?: string
  country?: string
  flag?: string
  isVerified: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  
  // Calculated fields from backend
  unitsAttracted?: number
  totalPayouts?: number
  lastPayoutDate?: string
  
  // Related data
  units?: AgentUnit[]
  payouts?: AgentPayout[]
  documents?: AgentDocument[]
  auditLogs?: any[]
}

export interface AgentUnit {
  id: string
  name: string
  location?: string
  referralDate?: string
  revenue?: number
  commission?: number
  status?: 'Active' | 'Inactive'
  propertyId?: string
  // Real API fields
  address?: string
  city?: string
  country?: string
  price?: number
  createdAt?: string
  updatedAt?: string
}

export interface AgentPayout {
  id: string
  date?: string
  amount: number
  units?: string[]
  status?: 'Completed' | 'Pending' | 'Failed'
  description?: string
  paymentMethod?: string
  // Real API fields
  type?: string
  createdAt?: string
  updatedAt?: string
  userId?: string
}

export interface AgentDocument {
  id: string
  name: string
  type: string
  uploadDate: string
  size: string
  s3Key?: string
  s3Url?: string
  filename?: string
}

export interface AgentStats {
  totalAgents: number
  activeAgents: number
  totalUnits: number
  totalPayouts: number
}

export interface AgentFilters {
  search?: string
  status?: 'ACTIVE' | 'INACTIVE'
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

// Main agent service using real API
export const agentService = {
  // Get all agents with optional filters
  async getAgents(filters: AgentFilters = {}): Promise<{ success: boolean; data: Agent[] }> {
    console.log('👥 AgentService: Fetching agents from API with filters:', filters)
    
    try {
      // Use userServiceAdapter to get users with role=AGENT
      const response = await userServiceAdapter.getUsers({
        role: 'AGENT',
        page: filters.page || 1,
        limit: filters.limit || 50,
        search: filters.search,
        status: filters.status,
        nationality: filters.nationality
      })

      console.log('👥 AgentService: API response received:', response)

      if (response.success && response.data) {
        // Transform User[] to Agent[]
        const agents: Agent[] = response.data.map((user: any) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          nationality: user.nationality,
          dateOfBirth: user.dateOfBirth,
          role: 'AGENT' as const,
          status: user.status,
          avatar: user.avatar,
          country: user.country,
          flag: user.flag,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Calculated fields from backend
          unitsAttracted: user.unitsAttracted || 0,
          totalPayouts: user.totalPayouts || 0,
          lastPayoutDate: user.lastPayoutDate,
          // Related data
          units: user.units || [],
          payouts: user.payouts || [],
          documents: user.documents || [],
          auditLogs: user.auditLogs || []
        }))

        console.log('👥 AgentService: Transformed agents:', agents)
        
        return {
          success: true,
          data: agents
        }
      } else {
        console.error('👥 AgentService: API response failed:', response)
        return {
          success: false,
          data: []
        }
      }
    } catch (error) {
      console.error('👥 AgentService: Error fetching agents:', error)
      return {
        success: false,
        data: []
      }
    }
  },

  // Get agent by ID
  async getAgentById(id: string): Promise<{ success: boolean; data: Agent | null }> {
    console.log('👥 AgentService: Fetching agent by ID:', id)
    
    try {
      const response = await userServiceAdapter.getUserById(id)
      
      if (response.success && response.data) {
        const user = response.data
        const agent: Agent = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          nationality: user.nationality,
          dateOfBirth: user.dateOfBirth,
          role: 'AGENT' as const,
          status: user.status,
          avatar: user.avatar,
          country: user.country,
          flag: user.flag,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Calculated fields from API response
          unitsAttracted: user._count?.properties || 0,
          totalPayouts: user.transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0,
          lastPayoutDate: user.transactions?.[0]?.createdAt || null,
          // Related data from API
          units: user.properties || [],
          payouts: user.transactions || [],
          documents: user.documents || [],
          auditLogs: user.activity_log || []
    }

    return {
      success: true,
          data: agent
        }
      } else {
        return {
          success: false,
          data: null
        }
      }
    } catch (error) {
      console.error('👥 AgentService: Error fetching agent by ID:', error)
      return {
        success: false,
        data: null
      }
    }
  },

  // Get agent statistics
  async getAgentStats(): Promise<{ success: boolean; data: AgentStats }> {
    console.log('👥 AgentService: Fetching agent statistics')
    
    try {
      const response = await userServiceAdapter.getUserStats('AGENT')
      
      if (response.success && response.data) {
        const stats: AgentStats = {
          totalAgents: response.data.totalUsers || 0,
          activeAgents: response.data.activeUsers || 0,
          totalUnits: response.data.totalUnits || 0, // This will be calculated from individual agents
          totalPayouts: response.data.totalPayouts || 0 // This will be calculated from individual agents
        }

        return {
          success: true,
          data: stats
        }
      } else {
        // Return default stats if API fails
        return {
          success: true,
          data: {
            totalAgents: 0,
            activeAgents: 0,
            totalUnits: 0,
            totalPayouts: 0
          }
        }
      }
    } catch (error) {
      console.error('👥 AgentService: Error fetching agent stats:', error)
    return {
      success: true,
        data: {
          totalAgents: 0,
          activeAgents: 0,
          totalUnits: 0,
          totalPayouts: 0
        }
      }
    }
  },

  // Create new agent
  async createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: Agent | null }> {
    console.log('👥 AgentService: Creating new agent:', agentData)
    
    try {
      const userData = {
        firstName: agentData.firstName,
        lastName: agentData.lastName,
        email: agentData.email,
        phone: agentData.phone,
        nationality: agentData.nationality,
        dateOfBirth: agentData.dateOfBirth,
        role: 'AGENT' as const,
        status: agentData.status,
        avatar: agentData.avatar,
        country: agentData.country,
        flag: agentData.flag,
        isVerified: agentData.isVerified
      }

      const response = await userServiceAdapter.createUser(userData)
      
      if (response.success && response.data) {
        const user = response.data
        const agent: Agent = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          nationality: user.nationality,
          dateOfBirth: user.dateOfBirth,
          role: 'AGENT' as const,
          status: user.status,
          avatar: user.avatar,
          country: user.country,
          flag: user.flag,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          unitsAttracted: 0,
          totalPayouts: 0,
          units: [],
          payouts: [],
          documents: [],
          auditLogs: []
        }

        return {
          success: true,
          data: agent
        }
      } else {
        return {
          success: false,
          data: null
        }
      }
    } catch (error) {
      console.error('👥 AgentService: Error creating agent:', error)
      return {
        success: false,
        data: null
      }
    }
  },

  // Update agent
  async updateAgent(id: string, agentData: Partial<Agent>): Promise<{ success: boolean; data: Agent | null }> {
    console.log('👥 AgentService: Updating agent:', id, agentData)
    
    try {
      const userData = {
        firstName: agentData.firstName,
        lastName: agentData.lastName,
        email: agentData.email,
        phone: agentData.phone,
        nationality: agentData.nationality,
        dateOfBirth: agentData.dateOfBirth,
        status: agentData.status,
        avatar: agentData.avatar,
        country: agentData.country,
        flag: agentData.flag,
        isVerified: agentData.isVerified
      }

      const response = await userServiceAdapter.updateUser(id, userData)
      
      if (response.success && response.data) {
        const user = response.data
        const agent: Agent = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          nationality: user.nationality,
          dateOfBirth: user.dateOfBirth,
          role: 'AGENT' as const,
          status: user.status,
          avatar: user.avatar,
          country: user.country,
          flag: user.flag,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          unitsAttracted: user.unitsAttracted || 0,
          totalPayouts: user.totalPayouts || 0,
          lastPayoutDate: user.lastPayoutDate,
          units: user.units || [],
          payouts: user.payouts || [],
          documents: user.documents || [],
          auditLogs: user.auditLogs || []
        }

        return {
          success: true,
          data: agent
        }
      } else {
        return {
          success: false,
          data: null
        }
      }
    } catch (error) {
      console.error('👥 AgentService: Error updating agent:', error)
      return {
        success: false,
        data: null
      }
    }
  },

  // Delete agent
  async deleteAgent(id: string): Promise<{ success: boolean; message: string }> {
    console.log('👥 AgentService: Deleting agent:', id)
    
    try {
      const response = await userServiceAdapter.deleteUser(id)
      return {
        success: response.success,
        message: response.message || 'Agent deleted successfully'
      }
    } catch (error) {
      console.error('👥 AgentService: Error deleting agent:', error)
      return {
        success: false,
        message: 'Failed to delete agent'
      }
    }
  }
}