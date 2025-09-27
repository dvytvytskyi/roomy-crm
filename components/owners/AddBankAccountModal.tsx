'use client'

import { useState } from 'react'
import { X, Plus, Building, User, Hash, MapPin } from 'lucide-react'

interface AddBankAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (bankData: {
    bankName: string
    accountHolderName: string
    accountNumber: string
    iban: string
    swiftCode: string
    bankAddress: string
  }) => void
}

export default function AddBankAccountModal({ isOpen, onClose, onSave }: AddBankAccountModalProps) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    bankAddress: ''
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

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required'
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required'
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required'
    }

    if (!formData.iban.trim()) {
      newErrors.iban = 'IBAN is required'
    }

    if (!formData.swiftCode.trim()) {
      newErrors.swiftCode = 'SWIFT code is required'
    }

    if (!formData.bankAddress.trim()) {
      newErrors.bankAddress = 'Bank address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave({
        bankName: formData.bankName.trim(),
        accountHolderName: formData.accountHolderName.trim(),
        accountNumber: formData.accountNumber.trim(),
        iban: formData.iban.trim(),
        swiftCode: formData.swiftCode.trim(),
        bankAddress: formData.bankAddress.trim()
      })
      
      // Reset form
      setFormData({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        iban: '',
        swiftCode: '',
        bankAddress: ''
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Plus size={20} className="text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Add Bank Account</h2>
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
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building size={16} className="inline mr-2" />
              Bank Name *
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                errors.bankName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Emirates NBD"
            />
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
            )}
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Account Holder Name *
            </label>
            <input
              type="text"
              value={formData.accountHolderName}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${
                errors.accountHolderName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Ahmed Al-Rashid"
            />
            {errors.accountHolderName && (
              <p className="mt-1 text-sm text-red-600">{errors.accountHolderName}</p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash size={16} className="inline mr-2" />
              Account Number *
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono ${
                errors.accountNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 1012345678901"
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
            )}
          </div>

          {/* IBAN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IBAN *
            </label>
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => handleInputChange('iban', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono ${
                errors.iban ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., AE070331234567890123456"
              maxLength={34}
            />
            {errors.iban && (
              <p className="mt-1 text-sm text-red-600">{errors.iban}</p>
            )}
          </div>

          {/* SWIFT Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SWIFT Code *
            </label>
            <input
              type="text"
              value={formData.swiftCode}
              onChange={(e) => handleInputChange('swiftCode', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono ${
                errors.swiftCode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., EBILAEAD"
              maxLength={11}
            />
            {errors.swiftCode && (
              <p className="mt-1 text-sm text-red-600">{errors.swiftCode}</p>
            )}
          </div>

          {/* Bank Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Bank Address *
            </label>
            <textarea
              value={formData.bankAddress}
              onChange={(e) => handleInputChange('bankAddress', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none ${
                errors.bankAddress ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Sheikh Zayed Road, Dubai, UAE"
            />
            {errors.bankAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.bankAddress}</p>
            )}
          </div>

          {/* Preview */}
          {formData.bankName && formData.accountHolderName && formData.accountNumber && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Bank:</span> {formData.bankName}</p>
                <p><span className="font-medium">Holder:</span> {formData.accountHolderName}</p>
                <p><span className="font-medium">Account:</span> {formData.accountNumber}</p>
                {formData.iban && <p><span className="font-medium">IBAN:</span> {formData.iban}</p>}
                {formData.swiftCode && <p><span className="font-medium">SWIFT:</span> {formData.swiftCode}</p>}
                {formData.bankAddress && <p><span className="font-medium">Address:</span> {formData.bankAddress}</p>}
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
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Bank Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
