'use client'

import { useState } from 'react'
import { X, Calendar, User, CreditCard, DollarSign, FileText, MessageSquare } from 'lucide-react'

interface AddPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentAdded: (payment: any) => void
}

export default function AddPaymentModal({ isOpen, onClose, onPaymentAdded }: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    property: '',
    reservationId: '',
    amount: '',
    currency: 'AED',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Completed',
    platform: 'Direct',
    platformFee: '',
    transactionFee: '',
    paymentCategory: 'Reservation Payment',
    remarks: '',
    adminUser: 'Current User'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const properties = [
    'Apartment Burj Khalifa 2',
    'Marina View Studio',
    'Downtown Loft 2BR',
    'JBR Beach Apartment',
    'Business Bay Office',
    'DIFC Penthouse'
  ]

  const paymentMethods = ['Credit Card', 'Bank Transfer', 'PayPal', 'Cash/Other']
  const paymentStatuses = ['Completed', 'Pending', 'Failed']
  const platforms = ['Direct', 'Airbnb', 'Booking.com', 'Expedia']
  const paymentCategories = [
    'Reservation Payment',
    'Deposit',
    'Balance Payment',
    'Cleaning Fee',
    'Security Deposit',
    'Service Fee',
    'Tax Payment',
    'Refund',
    'Maintenance Fee',
    'Utility Payment',
    'Insurance Payment',
    'Other'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required'
    }
    if (!formData.property) {
      newErrors.property = 'Property is required'
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required'
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required'
    }
    if (!formData.paymentCategory) {
      newErrors.paymentCategory = 'Payment category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const payment = {
      id: Date.now(),
      transactionId: `TXN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      ...formData,
      amount: parseFloat(formData.amount),
      platformFee: parseFloat(formData.platformFee) || 0,
      transactionFee: parseFloat(formData.transactionFee) || 0,
      netAmount: parseFloat(formData.amount) - (parseFloat(formData.platformFee) || 0) - (parseFloat(formData.transactionFee) || 0),
      date: formData.date,
      time: formData.time,
      type: 'Payment',
      paymentCount: 1,
      totalPayments: 1,
      remainingBalance: 0
    }

    onPaymentAdded(payment)
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      property: '',
      reservationId: '',
      amount: '',
      currency: 'AED',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Completed',
      platform: 'Direct',
      platformFee: '',
      transactionFee: '',
      paymentCategory: 'Reservation Payment',
      remarks: '',
      adminUser: 'Current User'
    })
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-slate-900">Add New Payment</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    value={formData.guestName}
                    onChange={(e) => handleInputChange('guestName', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.guestName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter guest name"
                  />
                  {errors.guestName && (
                    <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.guestEmail}
                    onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="guest@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.guestPhone}
                    onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+971 50 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reservation ID
                  </label>
                  <input
                    type="text"
                    value={formData.reservationId}
                    onChange={(e) => handleInputChange('reservationId', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="RES-001"
                  />
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Property Information</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Property *
                </label>
                <select
                  value={formData.property}
                  onChange={(e) => handleInputChange('property', e.target.value)}
                  className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.property ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a property</option>
                  {properties.map(property => (
                    <option key={property} value={property}>
                      {property}
                    </option>
                  ))}
                </select>
                {errors.property && (
                  <p className="text-red-500 text-sm mt-1">{errors.property}</p>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    Payment Method *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.paymentMethod ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {paymentStatuses.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Category *
                  </label>
                  <select
                    value={formData.paymentCategory}
                    onChange={(e) => handleInputChange('paymentCategory', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.paymentCategory ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {paymentCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.paymentCategory && (
                    <p className="text-red-500 text-sm mt-1">{errors.paymentCategory}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Platform & Fees */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Platform & Fees</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {platforms.map(platform => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Platform Fee
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.platformFee}
                    onChange={(e) => handleInputChange('platformFee', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Transaction Fee
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.transactionFee}
                    onChange={(e) => handleInputChange('transactionFee', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Additional Information</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Add any additional notes or remarks..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
            >
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
