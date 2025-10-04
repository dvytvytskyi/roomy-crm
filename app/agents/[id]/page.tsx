'use client'

import { useState, useEffect } from 'react'
import { 
  User, Mail, Phone, Calendar, MapPin, Star, Award, MessageSquare, 
  Edit, Trash2, Plus, Eye, ArrowLeft, FileText, Download, Upload,
  TrendingUp, Clock, DollarSign, Building, Users, CreditCard,
  CheckCircle, XCircle, AlertCircle, ChevronRight
} from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import { agentService, Agent, AgentUnit, AgentPayout, AgentDocument } from '@/lib/api/services/agentService'

interface AgentDetailsPageProps {
  params: {
    id: string
  }
}

export default function AgentDetailsPage({ params }: AgentDetailsPageProps) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'payouts' | 'documents'>('overview')

  // Load agent data
  useEffect(() => {
    const loadAgent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('👥 Loading agent details from service...')
        
        // Use the agentService to get mock data
        const response = await agentService.getAgents()
        if (response.success && response.data) {
          const agentData = response.data.agents.find(a => a.id === parseInt(params.id))
          if (agentData) {
            console.log('👥 Agent details loaded:', agentData)
            setAgent(agentData)
          } else {
            setError('Agent not found')
          }
        } else {
          setError('Failed to load agent data')
        }
      } catch (err) {
        console.error('👥 Error loading agent:', err)
        setError('Failed to load agent data')
      } finally {
        setIsLoading(false)
      }
    }

    loadAgent()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAge = (birthday: string) => {
    const today = new Date()
    const birthDate = new Date(birthday)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'Emirati': '🇦🇪',
      'British': '🇬🇧',
      'Egyptian': '🇪🇬',
      'Indian': '🇮🇳',
      'American': '🇺🇸',
      'Spanish': '🇪🇸',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Chinese': '🇨🇳',
      'Australian': '🇦🇺',
      'Canadian': '🇨🇦',
      'Russian': '🇷🇺',
      'Japanese': '🇯🇵',
      'Korean': '🇰🇷',
      'Brazilian': '🇧🇷'
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
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
        <TopNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading agent</p>
            <p className="text-slate-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '52px' }}>
        {/* Header */}
        <div className="sticky top-[3.3rem] z-10 bg-white border border-gray-200 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-medium text-slate-900 flex items-center space-x-2">
                  <span>{agent.name}</span>
                  {agent.status === 'Active' && <Star size={20} className="text-green-500" />}
                </h1>
                <p className="text-sm text-slate-600 flex items-center space-x-2">
                  <span>{getCountryFlag(agent.nationality)}</span>
                  <span>{agent.nationality}</span>
                  <span>•</span>
                  <span>{getAge(agent.birthday)} years old</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2">
                <Edit size={16} />
                <span>Edit Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Building className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Units Attracted</p>
                  <p className="text-2xl font-medium text-slate-900">{agent.unitsAttracted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Total Payouts</p>
                  <p className="text-2xl font-medium text-slate-900">{formatCurrency(agent.totalPayouts)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Last Payout</p>
                  <p className="text-2xl font-medium text-slate-900">{formatDate(agent.lastPayoutDate)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-600 text-xs mb-1">Join Date</p>
                  <p className="text-2xl font-medium text-slate-900">{formatDate(agent.joinDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2">
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'units', label: 'Units', icon: Building },
                { id: 'payouts', label: 'Payouts', icon: CreditCard },
                { id: 'documents', label: 'Documents', icon: FileText }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 px-4 py-3 min-h-0 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full p-4">
              {/* Agent Details */}
              <h2 className="text-lg font-medium text-slate-900 mb-4">Agent Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Email:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-900">{agent.email}</span>
                    <button className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer">
                      <Mail size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Phone:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-900">{agent.phone}</span>
                    <button className="p-1 text-orange-600 hover:bg-orange-100 rounded cursor-pointer">
                      <Phone size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Birthday:</span>
                  <span className="text-sm text-slate-900">{formatDate(agent.birthday)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Age:</span>
                  <span className="text-sm text-slate-900">{getAge(agent.birthday)} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Join Date:</span>
                  <span className="text-sm text-slate-900">{formatDate(agent.joinDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Units Attracted:</span>
                    <span className="text-sm font-medium text-slate-900">{agent.unitsAttracted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total Payouts:</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(agent.totalPayouts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Last Payout:</span>
                    <span className="text-sm font-medium text-slate-900">{formatDate(agent.lastPayoutDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Avg Commission:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatCurrency(agent.totalPayouts / (agent.unitsAttracted || 1))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {agent.comments && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Comments</h3>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-600">{agent.comments}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto custom-scrollbar p-4">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-lg font-medium text-slate-900 mb-4">Overview</h2>
                  
                  {/* Recent Activity */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-slate-900 mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Building size={16} className="text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">Unit Added</h4>
                            <p className="text-sm text-slate-600">New unit referral added to portfolio</p>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span>by {agent.createdBy}</span>
                              <span>{formatDate(agent.lastModifiedAt || agent.createdAt || '')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CreditCard size={16} className="text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">Payout Processed</h4>
                            <p className="text-sm text-slate-600">Monthly commission payout completed</p>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span>{formatCurrency(agent.totalPayouts)}</span>
                              <span>{formatDate(agent.lastPayoutDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'units' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-slate-900">Units Attracted</h2>
                    <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2">
                      <Plus size={14} />
                      <span>Add Unit</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {agent.units && agent.units.length > 0 ? (
                      agent.units.map((unit) => (
                        <div key={unit.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-900 flex items-center space-x-2">
                                <Building size={16} className="text-orange-500" />
                                <span>{unit.name}</span>
                              </h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                <span>{unit.location}</span>
                                <span>•</span>
                                <span>Referral: {formatDate(unit.referralDate)}</span>
                                <span>•</span>
                                <span>Revenue: {formatCurrency(unit.revenue)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-medium text-slate-900">
                                {formatCurrency(unit.commission)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                                {unit.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No units attracted yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'payouts' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-slate-900">Payout History</h2>
                    <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2">
                      <Plus size={14} />
                      <span>Add Payout</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {agent.payouts && agent.payouts.length > 0 ? (
                      agent.payouts.map((payout) => (
                        <div key={payout.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-slate-900 flex items-center space-x-2">
                                <CreditCard size={16} className="text-green-500" />
                                <span>{payout.description}</span>
                              </h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                <span>{formatDate(payout.date)}</span>
                                <span>•</span>
                                <span>{payout.paymentMethod}</span>
                                <span>•</span>
                                <span>{payout.units.length} units</span>
                              </div>
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {payout.units.map((unit, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                      {unit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg font-medium text-slate-900">
                                {formatCurrency(payout.amount)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                                {payout.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No payouts yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-slate-900">Documents</h2>
                    <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2">
                      <Upload size={14} />
                      <span>Upload Document</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {agent.documents && agent.documents.length > 0 ? (
                      agent.documents.map((doc) => (
                        <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText size={16} className="text-gray-400" />
                              <div>
                                <h3 className="font-medium text-slate-900">{doc.name}</h3>
                                <div className="flex items-center space-x-3 text-sm text-gray-500">
                                  <span>{doc.type}</span>
                                  <span>{doc.size}</span>
                                  <span>{formatDate(doc.uploadDate)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer" title="View document">
                                <Eye size={14} />
                              </button>
                              <button className="p-1 text-slate-600 hover:bg-gray-100 rounded cursor-pointer" title="Download document">
                                <Download size={14} />
                              </button>
                              <button className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer" title="Delete document">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No documents uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}