'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import TopNavigation from '../../components/TopNavigation'
import AgentsTable from '../../components/agents/AgentsTable'
import AgentsFilters from '../../components/agents/AgentsFilters'
import AddAgentModal from '../../components/agents/AddAgentModal'

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    nationality: '',
    minUnits: '',
    maxUnits: '',
    minPayouts: '',
    maxPayouts: '',
    lastPayoutDate: ''
  })
  const [selectedAgents, setSelectedAgents] = useState<number[]>([])
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleCreateAgent = () => {
    setSelectedAgent(null)
    setIsAgentModalOpen(true)
  }

  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent)
    setIsAgentModalOpen(true)
  }

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete' | 'export') => {
    if (selectedAgents.length === 0) return
    
    switch (action) {
      case 'activate':
        console.log('Activating agents:', selectedAgents)
        break
      case 'deactivate':
        console.log('Deactivating agents:', selectedAgents)
        break
      case 'delete':
        console.log('Deleting agents:', selectedAgents)
        break
      case 'export':
        console.log('Exporting agents:', selectedAgents)
        break
    }
  }

  // Mock data for agents (same as in AgentsTable)
  const agents = [
    {
      id: 1,
      name: 'Ahmed Al-Mansouri',
      email: 'ahmed.almansouri@email.com',
      phone: '+971 50 123 4567',
      nationality: 'UAE',
      birthday: '1985-03-15',
      unitsAttracted: 12,
      totalPayouts: 45000,
      lastPayoutDate: '2024-01-15',
      status: 'Active' as const,
      joinDate: '2023-03-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+44 20 1234 5678',
      nationality: 'UK',
      birthday: '1988-07-22',
      unitsAttracted: 8,
      totalPayouts: 32000,
      lastPayoutDate: '2024-01-10',
      status: 'Active' as const,
      joinDate: '2023-05-10'
    },
    {
      id: 3,
      name: 'Mohammed Hassan',
      email: 'mohammed.hassan@email.com',
      phone: '+20 2 1234 5678',
      nationality: 'Egypt',
      birthday: '1990-11-08',
      unitsAttracted: 15,
      totalPayouts: 68000,
      lastPayoutDate: '2024-01-20',
      status: 'Active' as const,
      joinDate: '2023-02-28'
    },
    {
      id: 4,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+61 2 1234 5678',
      nationality: 'Australia',
      birthday: '1987-04-14',
      unitsAttracted: 6,
      totalPayouts: 18000,
      lastPayoutDate: '2023-12-15',
      status: 'Inactive' as const,
      joinDate: '2023-08-15'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 555 123 4567',
      nationality: 'USA',
      birthday: '1983-09-30',
      unitsAttracted: 10,
      totalPayouts: 42000,
      lastPayoutDate: '2024-01-18',
      status: 'Active' as const,
      joinDate: '2023-04-20'
    },
    {
      id: 6,
      name: 'Fatima Al-Zahra',
      email: 'fatima.alzahra@email.com',
      phone: '+971 50 678 9012',
      nationality: 'UAE',
      birthday: '1991-12-05',
      unitsAttracted: 9,
      totalPayouts: 35000,
      lastPayoutDate: '2024-01-12',
      status: 'Active' as const,
      joinDate: '2023-06-18'
    }
  ]

  // Filter agents based on search and filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilters = 
      (!filters.status || agent.status === filters.status) &&
      (!filters.nationality || agent.nationality === filters.nationality) &&
      (!filters.minUnits || agent.unitsAttracted >= parseInt(filters.minUnits)) &&
      (!filters.maxUnits || agent.unitsAttracted <= parseInt(filters.maxUnits)) &&
      (!filters.minPayouts || agent.totalPayouts >= parseInt(filters.minPayouts)) &&
      (!filters.maxPayouts || agent.totalPayouts <= parseInt(filters.maxPayouts))

    return matchesSearch && matchesFilters
  })

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        {/* Header */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">Agents</h1>
                </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                  />
                </div>
                <button
                  onClick={handleCreateAgent}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Agent</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Total Agents</p>
                  <p className="text-2xl font-semibold text-slate-900">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Active Agents</p>
                  <p className="text-2xl font-semibold text-slate-900">18</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Total Units</p>
                  <p className="text-2xl font-semibold text-slate-900">156</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Total Payouts</p>
                  <p className="text-2xl font-semibold text-slate-900">AED 2.4M</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAgents.length > 0 && (
          <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-700">
                    {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedAgents([])}
                    className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex gap-8 px-2 sm:px-3 lg:px-4 py-1.5 min-h-0 overflow-hidden">
          {/* Left Sidebar - Filters */}
          <div className="w-64 flex-shrink-0">
            <AgentsFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              isSidebar={true}
            />
          </div>

          {/* Right Content - Table */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full overflow-hidden">
              <AgentsTable
                agents={filteredAgents}
                onEditAgent={handleEditAgent}
                selectedAgents={selectedAgents}
                onSelectionChange={setSelectedAgents}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        agent={selectedAgent}
      />
    </div>
  )
}
