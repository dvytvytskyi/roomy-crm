'use client'

import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, Calendar, MapPin, Star, Crown, MessageSquare, 
  Edit, Trash2, Plus, Eye, ArrowLeft, FileText, Download, Upload,
  TrendingUp, Clock, DollarSign, Building, Users, Award
} from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import AddAgentModal from '@/components/agents/AddAgentModal'
import { agentService, Agent, AgentStats } from '@/lib/api/services/agentService'
import { useAgentEvents } from '@/hooks/useEventBus'

interface AgentDetailsPageProps {
  params: {
    id: string
  }
}

export default function AgentDetailsPage({ params }: AgentDetailsPageProps) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { emitAgentUpdated } = useAgentEvents()

  // Load agent data
  useEffect(() => {
    const loadAgent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('👤 Loading agent:', params.id)
        
        const response = await agentService.getAgentById(params.id)
        
        if (response.success && response.data) {
          console.log('👤 Agent loaded:', response.data)
          setAgent(response.data)
        } else {
          setError('Failed to load agent')
        }
      } catch (err) {
        console.error('👤 Error loading agent:', err)
        setError('Error loading agent')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadAgent()
    }
  }, [params.id])

  // Load agent stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await agentService.getAgentStats()
        if (response.success && response.data) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('👤 Error loading agent stats:', error)
      }
    }
    loadStats()
  }, [])

  const handleEditAgent = () => {
    setIsEditModalOpen(true)
  }

  const handleAgentUpdated = (updatedAgent: any) => {
    // Update the agent state with the new data
    setAgent(prevAgent => ({
      ...prevAgent,
      ...updatedAgent,
      firstName: updatedAgent.firstName,
      lastName: updatedAgent.lastName,
      email: updatedAgent.email,
      phone: updatedAgent.phone,
      nationality: updatedAgent.nationality,
      dateOfBirth: updatedAgent.dateOfBirth,
      status: updatedAgent.status
    }))
    
    // Emit event to notify other components about the update
    if (agent?.id) {
      emitAgentUpdated(agent.id, updatedAgent)
      console.log('📡 Agent updated event emitted for agent:', agent.id)
    }
    
    setIsEditModalOpen(false)
  }

  const handleActivateAgent = async () => {
    if (!agent) return
    
    try {
      console.log('Activating agent:', agent.id)
      const response = await agentService.updateAgent(agent.id, { status: 'ACTIVE' })
      
      if (response.success && response.data) {
        setAgent(prevAgent => ({ ...prevAgent, status: 'ACTIVE' }))
        emitAgentUpdated(agent.id, { status: 'ACTIVE' })
        console.log('📡 Agent activated event emitted for agent:', agent.id)
        // Show success message
        alert('Agent activated successfully!')
      } else {
        alert('Failed to activate agent')
      }
    } catch (error) {
      console.error('Error activating agent:', error)
      alert('Error activating agent')
    }
  }

  const handleDeactivateAgent = async () => {
    if (!agent) return
    
    const confirmed = confirm(`Are you sure you want to deactivate ${agent.firstName} ${agent.lastName}?`)
    if (!confirmed) return
    
    try {
      console.log('Deactivating agent:', agent.id)
      const response = await agentService.updateAgent(agent.id, { status: 'INACTIVE' })
      
      if (response.success && response.data) {
        setAgent(prevAgent => ({ ...prevAgent, status: 'INACTIVE' }))
        emitAgentUpdated(agent.id, { status: 'INACTIVE' })
        console.log('📡 Agent deactivated event emitted for agent:', agent.id)
        // Show success message
        alert('Agent deactivated successfully!')
      } else {
        alert('Failed to deactivate agent')
      }
    } catch (error) {
      console.error('Error deactivating agent:', error)
      alert('Error deactivating agent')
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `AED ${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `AED ${(amount / 1000).toFixed(0)}K`
    }
    return `AED ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
        <TopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading agent details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
        <TopNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Agent Not Found</h2>
            <p className="text-slate-600 mb-4">{error || 'The requested agent could not be found.'}</p>
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors mx-auto"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        {/* Header */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                      {agent.firstName} {agent.lastName}
                    </h1>
                    <p className="text-slate-600">{agent.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        agent.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {agent.status}
                      </span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        AGENT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEditAgent}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit Agent</span>
                </button>
                {agent.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleDeactivateAgent()}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Deactivate</span>
                  </button>
                )}
                {agent.status === 'INACTIVE' && (
                  <button
                    onClick={() => handleActivateAgent()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
                  >
                    <User size={16} />
                    <span>Activate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Units Attracted</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {agent.unitsAttracted || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Payouts</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {formatCurrency(agent.totalPayouts || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Join Date</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {formatDate(agent.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Last Login</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {agent.lastLoginAt ? formatDate(agent.lastLoginAt) : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Details */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <User size={20} className="text-orange-600" />
                <span>Personal Information</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium">{agent.email}</p>
                  </div>
                </div>
                {agent.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone size={16} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-medium">{agent.phone}</p>
                    </div>
                  </div>
                )}
                {agent.nationality && (
                  <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Nationality</p>
                      <p className="font-medium">{agent.nationality}</p>
                    </div>
                  </div>
                )}
                {agent.dateOfBirth && (
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-600">Date of Birth</p>
                      <p className="font-medium">{formatDate(agent.dateOfBirth)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <TrendingUp size={20} className="text-green-600" />
                <span>Performance Metrics</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Units Attracted</span>
                  <span className="font-semibold text-slate-900">{agent.unitsAttracted || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Payouts</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(agent.totalPayouts || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Average per Unit</span>
                  <span className="font-semibold text-slate-900">
                    {agent.unitsAttracted && agent.unitsAttracted > 0 
                      ? formatCurrency((agent.totalPayouts || 0) / agent.unitsAttracted)
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Last Payout</span>
                  <span className="font-semibold text-slate-900">
                    {agent.lastPayoutDate ? formatDate(agent.lastPayoutDate) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Units Attracted */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <Building size={20} className="text-blue-600" />
              <span>Units Attracted ({agent.units?.length || 0})</span>
            </h3>
            {agent.units && agent.units.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Property</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Date Added</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agent.units.map((unit) => (
                      <tr key={unit.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{unit.name}</p>
                            <p className="text-sm text-slate-500">{unit.address}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {unit.city && unit.country ? `${unit.city}, ${unit.country}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {unit.price ? formatCurrency(unit.price) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {unit.createdAt ? formatDate(unit.createdAt) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            unit.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {unit.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Building size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No units attracted yet</p>
                <p className="text-sm text-slate-400">This agent hasn't attracted any properties yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payout History */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <DollarSign size={20} className="text-green-600" />
              <span>Payout History ({agent.payouts?.length || 0})</span>
            </h3>
            {agent.payouts && agent.payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agent.payouts.map((payout) => (
                      <tr key={payout.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-slate-700">
                          {payout.createdAt ? formatDate(payout.createdAt) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900">
                            {formatCurrency(payout.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {payout.type || 'Commission'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {payout.description || 'Agent commission'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payout.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : payout.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payout.status || 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No payouts yet</p>
                <p className="text-sm text-slate-400">This agent hasn't received any payouts yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          {agent.documents && agent.documents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <FileText size={20} className="text-blue-600" />
                <span>Documents ({agent.documents.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agent.documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FileText size={16} className="text-slate-400" />
                      <div className="flex space-x-2">
                        {doc.s3Url && (
                          <>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Eye size={14} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Download size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <h4 className="font-medium text-slate-900 text-sm mb-1">{doc.name}</h4>
                    <p className="text-xs text-slate-600">{doc.type}</p>
                    <p className="text-xs text-slate-500">{doc.size}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          {agent.auditLogs && agent.auditLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <Clock size={20} className="text-purple-600" />
                <span>Activity Log ({agent.auditLogs.length})</span>
              </h3>
              <div className="space-y-3">
                {agent.auditLogs.slice(0, 10).map((log, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{log.action || 'System activity'}</p>
                      <p className="text-xs text-slate-600">
                        {log.createdAt ? formatDate(log.createdAt) : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Agent Modal */}
      <AddAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        agent={agent}
        onAgentUpdated={handleAgentUpdated}
      />
    </div>
  )
}