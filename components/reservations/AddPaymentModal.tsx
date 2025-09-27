'use client'

import { useState } from 'react'
import { X, CreditCard, DollarSign, Calendar } from 'lucide-react'

interface AddPaymentModalProps {
  reservation: any
  onClose: () => void
  onSave: (payment: any) => void
}

export default function AddPaymentModal({ reservation, onClose, onSave }: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'credit_card',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    type: 'payment' // payment or refund
  })
  const [errors, setErrors] = useState<any>({})

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required'
    }
    if (formData.type === 'payment' && parseFloat(formData.amount) > reservation.outstanding_balance) {
      newErrors.amount = 'Payment amount cannot exceed outstanding balance'
    }
    if (!formData.method) {
      newErrors.method = 'Payment method is required'
    }
    if (!formData.date) {
      newErrors.date = 'Payment date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const payment = {
        id: Date.now(),
        reservation_id: reservation.id,
        amount: parseFloat(formData.amount),
        method: formData.method,
        date: formData.date,
        reference: formData.reference,
        description: formData.description,
        type: formData.type,
        status: 'completed'
      }
      onSave(payment)
    }
  }

  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.type === 'payment' ? 'Add Payment' : 'Process Refund'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{reservation.reservation_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleChange('type', 'payment')}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm ${
                    formData.type === 'payment'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign size={16} className="inline mr-2" />
                  Payment
                </button>
                <button
                  onClick={() => handleChange('type', 'refund')}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm ${
                    formData.type === 'refund'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard size={16} className="inline mr-2" />
                  Refund
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              <div className="mt-2 text-xs text-gray-500">
                Outstanding balance: ${reservation.outstanding_balance}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard size={16} className="inline mr-2" />
                Payment Method
              </label>
              <select
                value={formData.method}
                onChange={(e) => handleChange('method', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.method ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select method</option>
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              {errors.method && <p className="text-red-500 text-sm mt-1">{errors.method}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Transaction ID, check number, etc."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Add any notes about this payment..."
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>${reservation.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span>${reservation.paid_amount}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Outstanding:</span>
                  <span>${reservation.outstanding_balance}</span>
                </div>
                {formData.amount && (
                  <div className="flex justify-between text-blue-600 font-medium pt-2 border-t">
                    <span>
                      {formData.type === 'payment' ? 'After Payment:' : 'After Refund:'}
                    </span>
                    <span>
                      ${reservation.outstanding_balance - (formData.type === 'payment' ? parseFloat(formData.amount) : -parseFloat(formData.amount))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-sm text-white rounded-lg ${
              formData.type === 'payment' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {formData.type === 'payment' ? 'Process Payment' : 'Process Refund'}
          </button>
        </div>
      </div>
    </div>
  )
}
