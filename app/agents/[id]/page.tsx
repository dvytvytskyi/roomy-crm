'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNavigation from '../../../components/TopNavigation'
import { 
  Edit, Trash2, Plus, Download, Eye, Flag, Home, Percent, Calendar, DollarSign, FileText,
  ArrowLeft, Star, Crown, User, Mail, Phone, Building, TrendingUp, Clock
} from 'lucide-react'

export default function AgentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [editModal, setEditModal] = useState<{ isOpen: boolean; field: string; value: any }>({
    isOpen: false,
    field: '',
    value: ''
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Mock data for the specific agent
  const agent = {
    id: parseInt(params.id),
    name: 'Ahmed Al-Mansouri',
    email: 'ahmed.almansouri@email.com',
    phone: '+971 50 123 4567',
    nationality: 'UAE',
    birthday: '1985-03-15',
    unitsAttracted: 12,
    totalPayouts: 45000,
    lastPayoutDate: '2024-01-15',
    status: 'Active',
    joinDate: '2023-03-15',
    comments: 'Excellent performance, consistently brings high-value properties. Strong relationships with property owners in Downtown Dubai area.'
  }

  const units = [
    {
      id: 1,
      name: 'Downtown Loft 1BR',
      location: 'Downtown Dubai',
      referralDate: '2023-04-10',
      revenue: 85000,
      commission: 8,
      status: 'Active'
    },
    {
      id: 2,
      name: 'Marina View Studio',
      location: 'Dubai Marina',
      referralDate: '2023-05-15',
      revenue: 65000,
      commission: 10,
      status: 'Active'
    },
    {
      id: 3,
      name: 'Burj Khalifa 2BR',
      location: 'Downtown Dubai',
      referralDate: '2023-06-20',
      revenue: 120000,
      commission: 7,
      status: 'Active'
    },
    {
      id: 4,
      name: 'JBR Beachfront 3BR',
      location: 'JBR',
      referralDate: '2023-07-05',
      revenue: 95000,
      commission: 9,
      status: 'Active'
    }
  ]

  const payouts = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 8500,
      units: ['Downtown Loft 1BR', 'Marina View Studio'],
      status: 'Completed',
      description: 'Monthly commission payout'
    },
    {
      id: 2,
      date: '2023-12-15',
      amount: 7200,
      units: ['Burj Khalifa 2BR', 'JBR Beachfront 3BR'],
      status: 'Completed',
      description: 'Monthly commission payout'
    },
    {
      id: 3,
      date: '2023-11-15',
      amount: 6800,
      units: ['Downtown Loft 1BR', 'Marina View Studio'],
      status: 'Completed',
      description: 'Monthly commission payout'
    }
  ]

  const documents = [
    {
      id: 1,
      name: 'Agent Contract.pdf',
      type: 'Contract',
      uploadDate: '2023-03-15',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Commission Agreement.pdf',
      type: 'Agreement',
      uploadDate: '2023-03-20',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'ID Copy.jpg',
      type: 'Identification',
      uploadDate: '2023-03-15',
      size: '1.2 MB'
    }
  ]

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

  const handleSaveEdit = () => {
    // Here you would typically save the changes to your backend
    console.log(`Saving ${editModal.field}:`, editModal.value)
    setEditModal({ isOpen: false, field: '', value: '' })
  }

  const handleCloseEdit = () => {
    setEditModal({ isOpen: false, field: '', value: '' })
  }

  const handleDeleteAgent = () => {
    // Here you would typically delete the agent from your backend
    console.log('Deleting agent:', agent.id)
    setShowDeleteModal(false)
    router.push('/agents')
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
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-xl font-medium text-slate-900">{agent.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-slate-600">{agent.nationality}</span>
                  <span className="text-sm text-slate-500">•</span>
                  <span className="text-sm text-slate-600">{new Date().getFullYear() - new Date(agent.birthday).getFullYear()} years old</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Star size={12} className="mr-1" />
                {agent.status}
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
                  <p className="text-2xl font-medium text-slate-900">{agent.unitsAttracted}</p>
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
                  <p className="text-2xl font-medium text-slate-900">{formatCurrency(agent.totalPayouts)}</p>
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
                  <p className="text-2xl font-medium text-slate-900">{formatDate(agent.lastPayoutDate)}</p>
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
                      <span className="text-sm text-slate-900">{agent.email}</span>
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
                      <span className="text-sm text-slate-900">{agent.phone}</span>
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
                        <span>{agent.nationality}</span>
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
                      <span className="text-sm text-slate-900">{formatDate(agent.birthday)}</span>
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
                    <span className="text-sm text-slate-900">{new Date().getFullYear() - new Date(agent.birthday).getFullYear()} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Join Date:</span>
                    <span className="text-sm text-slate-900">{formatDate(agent.joinDate)}</span>
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
                    {agent.comments}
                  </div>
                </div>

                {/* Units Attracted */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-slate-900">Units Attracted</h3>
                    <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center">
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
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded">
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
                      <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center">
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
                    <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center">
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
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded">
                              <Eye size={16} />
                            </button>
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded">
                              <Download size={16} />
                            </button>
                            <button className="p-1 text-slate-600 hover:bg-gray-100 rounded">
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
              Are you sure you want to delete {agent.name}? This action cannot be undone.
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
    </div>
  )
}
