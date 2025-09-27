'use client'

import { useState } from 'react'
import { X, CreditCard, Calendar, FileText, Banknote } from 'lucide-react'

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
    date: string
    description: string
    bankAccountId: number
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
    date: new Date().toISOString().split('T')[0],
    description: '',
    bankAccountId: bankAccounts.length > 0 ? bankAccounts[0].id : ''
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

    if (!formData.bankAccountId) {
      newErrors.bankAccountId = 'Bank account is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave({
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description.trim(),
        bankAccountId: parseInt(String(formData.bankAccountId))
      })
      
      // Reset form
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        bankAccountId: bankAccounts.length > 0 ? bankAccounts[0].id : ''
      })
      setErrors({})
      onClose()
    }
  }

  const selectedBankAccount = bankAccounts.find(account => account.id === parseInt(String(formData.bankAccountId)))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard size={20} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Bank Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (AED) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Bank Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Banknote size={16} className="inline mr-2" />
              Bank Account *
            </label>
            <select
              value={formData.bankAccountId}
              onChange={(e) => handleInputChange('bankAccountId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.bankAccountId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select bank account</option>
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - {account.accountNumber}
                </option>
              ))}
            </select>
            {errors.bankAccountId && (
              <p className="mt-1 text-sm text-red-600">{errors.bankAccountId}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Monthly rental income - Burj Khalifa Studio"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Preview */}
          {formData.amount && formData.description && selectedBankAccount && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Amount:</span> {parseFloat(formData.amount || '0').toLocaleString()} AED</p>
                <p><span className="font-medium">Description:</span> {formData.description}</p>
                <p><span className="font-medium">Bank:</span> {selectedBankAccount.bankName}</p>
                <p><span className="font-medium">Account:</span> {selectedBankAccount.accountNumber}</p>
                <p><span className="font-medium">Date:</span> {new Date(formData.date).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <CreditCard size={16} />
              <span>Send Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
