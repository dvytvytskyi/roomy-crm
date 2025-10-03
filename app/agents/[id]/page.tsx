'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNavigation from '../../../components/TopNavigation'
import { 
  Edit, Trash2, Plus, Download, Eye, Flag, Home, Percent, Calendar, DollarSign, FileText,
  ArrowLeft, Star, Crown, User, Mail, Phone, Building, TrendingUp, Clock
} from 'lucide-react'
import { agentService, Agent, AgentUnit, AgentPayout, AgentDocument } from '../../../lib/api/services/agentService'
import { propertyService, Property } from '../../../lib/api/services/propertyService'

export default function AgentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [editModal, setEditModal] = useState<{ isOpen: boolean; field: string; value: any }>({
    isOpen: false,
    field: '',
    value: ''
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddUnitModal, setShowAddUnitModal] = useState(false)
  const [showAddPayoutModal, setShowAddPayoutModal] = useState(false)
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [units, setUnits] = useState<AgentUnit[]>([])
  const [payouts, setPayouts] = useState<AgentPayout[]>([])
  const [documents, setDocuments] = useState<AgentDocument[]>([])
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])

  // Load agent data
  useEffect(() => {
    const loadAgentData = async () => {
      try {
        setLoading(true)
        const agentId = parseInt(params.id)
        
        // Load agent details
        const agentResponse = await agentService.getAgentById(agentId)
        if (agentResponse.success) {
          setAgent(agentResponse.data)
        }

        // Load agent units
        const unitsResponse = await agentService.getAgentUnits(agentId)
        if (unitsResponse.success) {
          setUnits(unitsResponse.data)
        }

        // Load agent payouts
        const payoutsResponse = await agentService.getAgentPayouts(agentId)
        if (payoutsResponse.success) {
          setPayouts(payoutsResponse.data)
        }

        // Load agent documents
        const documentsResponse = await agentService.getAgentDocuments(agentId)
        if (documentsResponse.success) {
          setDocuments(documentsResponse.data)
        }
        
        // Load available properties (unassigned)
        const propertiesResponse = await propertyService.getProperties()
        if (propertiesResponse.success) {
          const unassignedProperties = propertiesResponse.data.filter(p => !p.agentId)
          setAvailableProperties(unassignedProperties)
        }
      } catch (error) {
        console.error('Error loading agent data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAgentData()
  }, [params.id])

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'UAE': '🇦🇪',
      'UK': '🇬🇧',
      'Egypt': '🇪🇬',
      'Australia': '🇦🇺',
      'USA': '🇺🇸'
    }
    return flags[nationality] || '🌍'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEditField = (field: string, currentValue: any) => {
    setEditModal({
      isOpen: true,
      field,
      value: currentValue
    })
  }

  const handleSaveEdit = async () => {
    if (!agent) return
    
    try {
      const updateData = { [editModal.field]: editModal.value }
      const response = await agentService.updateAgent(agent.id, updateData)
      
      if (response.success) {
        setAgent(response.data)
        setEditModal({ isOpen: false, field: '', value: '' })
      }
    } catch (error) {
      console.error('Error updating agent:', error)
    }
  }

  const handleCloseEdit = () => {
    setEditModal({ isOpen: false, field: '', value: '' })
  }

  const handleDeleteAgent = async () => {
    if (!agent) return
    
    try {
      const response = await agentService.deleteAgent(agent.id)
      if (response.success) {
        setShowDeleteModal(false)
        router.push('/agents')
      }
    } catch (error) {
      console.error('Error deleting agent:', error)
    }
  }

  const handleAddUnit = async (unitData: Omit<AgentUnit, 'id'>) => {
    if (!agent) return
    
    try {
      const response = await agentService.addAgentUnit(agent.id, unitData)
      if (response.success) {
        setUnits([...units, response.data])
        // Update agent stats
        if (agent) {
          setAgent({ ...agent, unitsAttracted: agent.unitsAttracted + 1 })
        }
      }
    } catch (error) {
      console.error('Error adding unit:', error)
    }
  }

  const handleRemoveUnit = async (unitId: number) => {
    if (!agent) return
    
    try {
      const response = await agentService.removeAgentUnit(agent.id, unitId)
      if (response.success) {
        setUnits(units.filter(unit => unit.id !== unitId))
        // Update agent stats
        if (agent) {
          setAgent({ ...agent, unitsAttracted: Math.max(0, agent.unitsAttracted - 1) })
        }
      }
    } catch (error) {
      console.error('Error removing unit:', error)
    }
  }

  const handleAddPayout = async (payoutData: Omit<AgentPayout, 'id'>) => {
    if (!agent) return
    
    try {
      const response = await agentService.addAgentPayout(agent.id, payoutData)
      if (response.success) {
        setPayouts([...payouts, response.data])
        // Update agent stats
        if (agent) {
          setAgent({ 
            ...agent, 
            totalPayouts: agent.totalPayouts + payoutData.amount,
            lastPayoutDate: payoutData.date
          })
        }
      }
    } catch (error) {
      console.error('Error adding payout:', error)
    }
  }

  const handleRemovePayout = async (payoutId: number) => {
    if (!agent) return
    
    try {
      const payout = payouts.find(p => p.id === payoutId)
      const response = await agentService.removeAgentPayout(agent.id, payoutId)
      if (response.success) {
        setPayouts(payouts.filter(p => p.id !== payoutId))
        // Update agent stats
        if (agent && payout) {
          setAgent({ 
            ...agent, 
            totalPayouts: Math.max(0, agent.totalPayouts - payout.amount)
          })
        }
      }
    } catch (error) {
      console.error('Error removing payout:', error)
    }
  }

  const handleAddDocument = async (documentData: Omit<AgentDocument, 'id'>) => {
    if (!agent) return
    
    try {
      const response = await agentService.addAgentDocument(agent.id, documentData)
      if (response.success) {
        setDocuments([...documents, response.data])
      }
    } catch (error) {
      console.error('Error adding document:', error)
    }
  }

  const handleRemoveDocument = async (documentId: number) => {
    if (!agent) return
    
    try {
      const response = await agentService.removeAgentDocument(agent.id, documentId)
      if (response.success) {
        setDocuments(documents.filter(doc => doc.id !== documentId))
      }
    } catch (error) {
      console.error('Error removing document:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNavigation />
        <div style={{ marginTop: '52px' }} className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading agent details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNavigation />
        <div style={{ marginTop: '52px' }} className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-slate-600">Agent not found</p>
            <button
              onClick={() => router.push('/agents')}
              className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Back to Agents
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      
      <div style={{ marginTop: '52px' }}>
        {/* Header */}
        <div className="sticky top-[3.3rem] z-10 bg-white border border-gray-200 px-4 py-4 shadow-sm" style={{ marginTop: '0px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                data-testid="back-btn"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-medium text-slate-900">{agent.name || 'n/a'}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-slate-600">{agent.nationality || 'n/a'}</span>
                  <span className="text-sm text-slate-500">•</span>
                  <span className="text-sm text-slate-600">
                    {agent.birthday ? `${new Date().getFullYear() - new Date(agent.birthday).getFullYear()} years old` : 'n/a'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Star size={12} className="mr-1" />
                {agent.status || 'n/a'}
              </span>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Building className="w-5 h-5 text-orange-500" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-600 mb-1">Units Attracted</p>
                  <p className="text-2xl font-medium text-slate-900">{agent.unitsAttracted || 'n/a'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-600 mb-1">Total Payouts</p>
                  <p className="text-2xl font-medium text-slate-900">{agent.totalPayouts ? formatCurrency(agent.totalPayouts) : 'n/a'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-600 mb-1">Last Payout</p>
                  <p className="text-2xl font-medium text-slate-900">{agent.lastPayoutDate ? formatDate(agent.lastPayoutDate) : 'n/a'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-4 px-4 py-3">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Agent Details */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-slate-900">Agent Details</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Email:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{agent.email || 'n/a'}</span>
                      <button
                        onClick={() => handleEditField('email', agent.email)}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{agent.phone || 'n/a'}</span>
                      <button
                        onClick={() => handleEditField('phone', agent.phone)}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Nationality:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900 flex items-center space-x-1">
                        <span>{getCountryFlag(agent.nationality)}</span>
                        <span>{agent.nationality || 'n/a'}</span>
                      </span>
                      <button
                        onClick={() => handleEditField('nationality', agent.nationality)}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Birth Date:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-900">{agent.birthday ? formatDate(agent.birthday) : 'n/a'}</span>
                      <button
                        onClick={() => handleEditField('birthday', agent.birthday)}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Age:</span>
                    <span className="text-sm text-slate-900">{agent.birthday ? `${new Date().getFullYear() - new Date(agent.birthday).getFullYear()} years` : 'n/a'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Join Date:</span>
                    <span className="text-sm text-slate-900">{agent.joinDate ? formatDate(agent.joinDate) : 'n/a'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4">
                {/* Description */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-slate-900">Description</h3>
                    <button
                      onClick={() => handleEditField('comments', agent.comments)}
                      className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 min-h-[60px]">
                    {agent.comments || 'n/a'}
                  </div>
                </div>

                {/* Units Attracted */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-slate-900">Units Attracted</h3>
                    <button 
                      onClick={() => setShowAddUnitModal(true)}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center"
                    >
                      <Plus size={14} className="mr-1" />
                      Add Unit
                    </button>
                  </div>
                  <div className="space-y-3">
                    {units.map((unit) => (
                      <div key={unit.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{unit.name}</h4>
                            <p className="text-sm text-slate-500">{unit.location}</p>
                            <p className="text-xs text-slate-400">Referred: {formatDate(unit.referralDate)}</p>
                          </div>
                          <div className="text-right mr-4">
                            <p className="font-medium text-slate-900">{formatCurrency(unit.revenue)}</p>
                            <p className="text-sm text-orange-600 font-medium">{unit.commission}% commission</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(unit.status)}`}>
                              {unit.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleRemoveUnit(unit.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payout History */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-slate-900">Payout History</h3>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setShowAddPayoutModal(true)}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Payout
                      </button>
                      <button className="px-3 py-1 text-slate-600 hover:text-slate-800 cursor-pointer flex items-center">
                        <Download size={14} className="mr-1" />
                        Export
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{formatCurrency(payout.amount)}</h4>
                            <p className="text-sm text-slate-500">{payout.description}</p>
                            <p className="text-xs text-slate-400">Date: {formatDate(payout.date)}</p>
                            <p className="text-xs text-slate-400">Units: {payout.units.join(', ')}</p>
                          </div>
                          <div className="text-right mr-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded">
                              <Download size={16} />
                            </button>
                            <button 
                              onClick={() => handleRemovePayout(payout.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-slate-900">Documents</h3>
                    <button 
                      onClick={() => setShowAddDocumentModal(true)}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center"
                    >
                      <Plus size={14} className="mr-1" />
                      Upload
                    </button>
                  </div>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                              <FileText size={16} className="text-slate-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{doc.name}</h4>
                              <p className="text-sm text-slate-500">{doc.type} • {doc.size}</p>
                              <p className="text-xs text-slate-400">Uploaded: {formatDate(doc.uploadDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => doc.s3Url && window.open(doc.s3Url, '_blank')}
                              className="p-1 text-slate-600 hover:bg-gray-100 rounded"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => doc.s3Url && window.open(doc.s3Url, '_blank')}
                              className="p-1 text-slate-600 hover:bg-gray-100 rounded"
                            >
                              <Download size={16} />
                            </button>
                            <button 
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Edit {editModal.field}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {editModal.field.charAt(0).toUpperCase() + editModal.field.slice(1)}
                </label>
                {editModal.field === 'comments' ? (
                  <textarea
                    value={editModal.value}
                    onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={4}
                  />
                ) : (
                  <input
                    type={editModal.field === 'birthday' ? 'date' : 'text'}
                    value={editModal.value}
                    onChange={(e) => setEditModal({ ...editModal, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Delete Agent</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete {agent?.name || 'this agent'}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAgent}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Add Unit</h3>
            
            {availableProperties.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Property</label>
                <select
                  id="propertySelect"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-4"
                >
                  <option value="">Choose a property...</option>
                  {availableProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} - {property.address} (AED {property.pricePerNight}/night)
                    </option>
                  ))}
                </select>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUnitModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const selectElement = document.getElementById('propertySelect') as HTMLSelectElement
                      const selectedPropertyId = selectElement.value
                      
                      if (!selectedPropertyId) {
                        alert('Please select a property')
                        return
                      }
                      
                      try {
                        await propertyService.assignToAgent(selectedPropertyId, parseInt(params.id))
                        // Reload data
                        const unitsResponse = await agentService.getAgentUnits(parseInt(params.id))
                        if (unitsResponse.success) {
                          setUnits(unitsResponse.data)
                        }
                        const propertiesResponse = await propertyService.getProperties()
                        if (propertiesResponse.success) {
                          const unassignedProperties = propertiesResponse.data.filter(p => !p.agentId)
                          setAvailableProperties(unassignedProperties)
                        }
                        setShowAddUnitModal(false)
                      } catch (error) {
                        console.error('Error assigning property:', error)
                      }
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    Assign Property
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-500 mb-4">No available properties to assign</div>
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Payout Modal */}
      {showAddPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Add Payout</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const payoutData = {
                date: formData.get('date') as string,
                amount: parseInt(formData.get('amount') as string),
                units: (formData.get('units') as string).split(',').map(u => u.trim()).filter(u => u),
                status: 'Completed' as const,
                description: formData.get('description') as string,
                paymentMethod: formData.get('paymentMethod') as string
              }
              await handleAddPayout(payoutData)
              setShowAddPayoutModal(false)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount (AED)</label>
                  <input
                    name="amount"
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Units (comma-separated)</label>
                  <input
                    name="units"
                    type="text"
                    placeholder="Unit 1, Unit 2, Unit 3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <input
                    name="description"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                  <select
                    name="paymentMethod"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddPayoutModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    Add Payout
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Upload Document</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const file = formData.get('file') as File
              
              if (!file) return
              
              try {
                // Upload file to S3
                const uploadFormData = new FormData()
                uploadFormData.append('file', file)
                uploadFormData.append('folder', `agent_${agent?.id}`)
                
                const uploadResponse = await fetch('http://localhost:3001/api/upload', {
                  method: 'POST',
                  body: uploadFormData
                })
                
                if (uploadResponse.ok) {
                  const uploadResult = await uploadResponse.json()
                  
                  const documentData = {
                    name: formData.get('name') as string,
                    type: formData.get('type') as string,
                    size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                    s3Key: uploadResult.key,
                    s3Url: uploadResult.url,
                    filename: file.name
                  }
                  
                  await handleAddDocument(documentData)
                  setShowAddDocumentModal(false)
                }
              } catch (error) {
                console.error('Error uploading document:', error)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Document Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Contract">Contract</option>
                    <option value="Agreement">Agreement</option>
                    <option value="Identification">Identification</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">File</label>
                  <input
                    name="file"
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddDocumentModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
