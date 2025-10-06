'use client'

import { useState } from 'react'
import { X, CreditCard, FileText, Banknote, DollarSign } from 'lucide-react'

interface BankAccount {
  id: number
  bankName: string
  accountNumber: string
  iban: string
}

interface BankPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (paymentData: {
    amount: number
    currency: string
    description: string
    platform?: string
    platform_fee?: number
    transaction_fee?: number
    reference?: string
  }) => void
  bankAccounts: BankAccount[]
}

export default function BankPaymentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  bankAccounts 
}: BankPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'AED',
    description: '',
    platform: '',
    platform_fee: '',
    transaction_fee: '',
    reference: ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave({
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description.trim(),
        platform: formData.platform || undefined,
        platform_fee: formData.platform_fee ? parseFloat(formData.platform_fee) : undefined,
        transaction_fee: formData.transaction_fee ? parseFloat(formData.transaction_fee) : undefined,
        reference: formData.reference || undefined
      })
      
      // Reset form
      setFormData({
        amount: '',
        currency: 'AED',
        description: '',
        platform: '',
        platform_fee: '',
        transaction_fee: '',
        reference: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-500 rounded-xl">
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bank Payment</h2>
              <p className="text-sm text-gray-600">Record a bank transfer transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Amount *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 text-sm font-medium">{formData.currency}</span>
              </div>
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.amount}
              </p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors hover:border-gray-400"
            >
              <option value="AED">AED - UAE Dirham</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="e.g., Monthly rental income - Burj Khalifa Studio"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.description}
              </p>
            )}
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Banknote size={16} className="inline mr-2" />
              Platform (Optional)
            </label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => handleInputChange('platform', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors hover:border-gray-400"
              placeholder="e.g., Stripe, PayPal, Bank Transfer"
            />
          </div>

          {/* Fees */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Fee
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.platform_fee}
                onChange={(e) => handleInputChange('platform_fee', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors hover:border-gray-400"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Fee
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.transaction_fee}
                onChange={(e) => handleInputChange('transaction_fee', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors hover:border-gray-400"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference (Optional)
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors hover:border-gray-400"
              placeholder="e.g., TXN-2024-001"
            />
          </div>

          {/* Preview */}
          {formData.amount && formData.description && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <h4 className="text-sm font-medium text-orange-800 mb-3 flex items-center">
                <CreditCard size={16} className="mr-2" />
                Transaction Preview
              </h4>
              <div className="text-sm text-orange-700 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold">{parseFloat(formData.amount || '0').toLocaleString()} {formData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">BANK TRANSFER</span>
                </div>
                {formData.platform && (
                  <div className="flex justify-between">
                    <span className="font-medium">Platform:</span>
                    <span>{formData.platform}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-orange-600">{formData.description}</p>
                </div>
                {(formData.platform_fee || formData.transaction_fee) && (
                  <div className="pt-2 border-t border-orange-200">
                    <div className="flex justify-between text-xs">
                      <span>Platform Fee:</span>
                      <span>{formData.platform_fee || '0'} {formData.currency}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Transaction Fee:</span>
                      <span>{formData.transaction_fee || '0'} {formData.currency}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
            >
              <CreditCard size={18} />
              <span>Create Bank Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
