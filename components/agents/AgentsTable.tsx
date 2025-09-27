'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Eye, Star, Flag, ChevronUp, ChevronDown } from 'lucide-react'

interface Agent {
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

interface AgentsTableProps {
  agents: Agent[]
  onEditAgent: (agent: any) => void
  selectedAgents: number[]
  onSelectionChange: (selected: number[]) => void
}

export default function AgentsTable({ agents, onEditAgent, selectedAgents, onSelectionChange }: AgentsTableProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'UAE': '🇦🇪',
      'UK': '🇬🇧',
      'Egypt': '🇪🇬',
      'Australia': '🇦🇺',
      'USA': '🇺🇸',
      'India': '🇮🇳',
      'Pakistan': '🇵🇰',
      'Philippines': '🇵🇭'
    }
    return flags[nationality] || '🌍'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedAgents = [...agents].sort((a, b) => {
    if (!sortField) return 0
    
    let aValue = a[sortField as keyof Agent]
    let bValue = b[sortField as keyof Agent]
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(sortedAgents.map(agent => agent.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectAgent = (agentId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedAgents, agentId])
    } else {
      onSelectionChange(selectedAgents.filter(id => id !== agentId))
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp size={14} className="text-gray-300" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="text-orange-600" />
      : <ChevronDown size={14} className="text-orange-600" />
  }

  const handleViewAgent = (agentId: number) => {
    router.push(`/agents/${agentId}`)
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedAgents.length === sortedAgents.length && sortedAgents.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center space-x-1">
                <span>Agent</span>
                {getSortIcon('name')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Nationality
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('unitsAttracted')}
            >
              <div className="flex items-center space-x-1">
                <span>Units Attracted</span>
                {getSortIcon('unitsAttracted')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('totalPayouts')}
            >
              <div className="flex items-center space-x-1">
                <span>Total Payouts</span>
                {getSortIcon('totalPayouts')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('lastPayoutDate')}
            >
              <div className="flex items-center space-x-1">
                <span>Last Payout Date</span>
                {getSortIcon('lastPayoutDate')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {getSortIcon('status')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAgents.map((agent) => (
            <tr key={agent.id} className={`hover:bg-gray-50 transition-colors ${selectedAgents.includes(agent.id) ? 'bg-orange-50' : ''}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent.id)}
                  onChange={(e) => handleSelectAgent(agent.id, e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleViewAgent(agent.id)}
                      className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline cursor-pointer text-left"
                    >
                      {agent.name}
                    </button>
                    <div className="text-sm text-slate-500">{agent.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCountryFlag(agent.nationality)}</span>
                  <span className="text-sm text-slate-900">{agent.nationality}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{agent.unitsAttracted} units</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900 font-medium">{formatCurrency(agent.totalPayouts)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">
                  {new Date(agent.lastPayoutDate).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
                  {agent.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2 transition-opacity opacity-70 hover:opacity-100">
                  <button
                    onClick={() => handleViewAgent(agent.id)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onEditAgent(agent)}
                    className="text-slate-400 hover:text-orange-600 transition-colors"
                    title="Edit Agent"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Agent"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {sortedAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No agents found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}
