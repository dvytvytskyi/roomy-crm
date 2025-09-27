'use client'

import { useState } from 'react'
import { X, Edit, Phone, Mail, MapPin, Calendar, DollarSign, CreditCard, MessageSquare, History, FileText, ExternalLink } from 'lucide-react'

interface ReservationDetailsModalProps {
  reservation: any
  onClose: () => void
  onEdit: () => void
}

export default function ReservationDetailsModal({ reservation, onClose, onEdit }: ReservationDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      canceled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Canceled' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`px-3 py-1 text-sm ${config.bg} ${config.text} rounded-full`}>
        {config.label}
      </span>
    )
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'financial', label: 'Financial' },
    { id: 'history', label: 'History' },
    { id: 'communication', label: 'Communication' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Reservation Details</h2>
            <p className="text-sm text-gray-600 mt-1">{reservation?.reservation_id} • {reservation?.guest_name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Guest Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{reservation?.guest_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{reservation?.guest_name?.toLowerCase().replace(' ', '.')}@example.com</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">+1 (555) 123-4567</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                      <p className="mt-1 text-sm text-gray-900">{reservation?.notes || 'No special requests'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {reservation?.tags?.map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Property</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{reservation?.unit_property}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(reservation?.check_in)}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(reservation?.check_out)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(reservation?.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nights</label>
                      <span className="text-sm text-gray-900">{reservation?.nights} nights</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <ExternalLink size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{reservation?.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Financial Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="text-2xl font-bold text-gray-900">${reservation?.total_amount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                      <p className="text-xl font-semibold text-green-600">${reservation?.paid_amount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Outstanding</label>
                      <p className={`text-xl font-semibold ${reservation?.outstanding_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${reservation?.outstanding_balance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Base Rate ({reservation?.nights} nights)</span>
                    <span className="text-sm font-medium">${Math.round(reservation?.total_amount * 0.8)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Cleaning Fee</span>
                    <span className="text-sm font-medium">${Math.round(reservation?.total_amount * 0.1)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Service Fee</span>
                    <span className="text-sm font-medium">${Math.round(reservation?.total_amount * 0.05)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Taxes</span>
                    <span className="text-sm font-medium">${Math.round(reservation?.total_amount * 0.05)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 font-semibold">
                    <span className="text-base">Total</span>
                    <span className="text-base">${reservation?.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Credit Card ending in 1234</p>
                        <p className="text-xs text-gray-500">Paid ${reservation?.paid_amount} on {formatDate(reservation?.check_in)}</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Paid</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation History</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reservation created</p>
                    <p className="text-xs text-gray-500">August 1, 2024 at 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment received</p>
                    <p className="text-xs text-gray-500">August 2, 2024 at 9:15 AM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Check-in reminder sent</p>
                    <p className="text-xs text-gray-500">August 13, 2024 at 10:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Communication History</h3>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                  <MessageSquare size={16} />
                  <span>Send Message</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">S</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">System</span>
                        <span className="text-xs text-gray-500">August 13, 2024 at 10:00 AM</span>
                      </div>
                      <p className="text-sm text-gray-700">Welcome! Your check-in is tomorrow. Here are the details for your stay...</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">G</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">Guest</span>
                        <span className="text-xs text-gray-500">August 12, 2024 at 3:45 PM</span>
                      </div>
                      <p className="text-sm text-gray-700">Thank you for the information. What time can we check in?</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
