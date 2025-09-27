'use client'

import { useState } from 'react'
import { X, Save, DollarSign, Plus, Minus } from 'lucide-react'

interface AddAdjustmentModalProps {
  onClose: () => void
  onSave: (adjustment: any) => void
}

export default function AddAdjustmentModal({ onClose, onSave }: AddAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    type: 'discount',
    amount: '',
    description: '',
    reason: ''
  })
  const [errors, setErrors] = useState<any>({})

  const adjustmentTypes = [
    { value: 'discount', label: 'Discount', color: 'bg-green-100 text-green-800' },
    { value: 'extra_service', label: 'Extra Service', color: 'bg-blue-100 text-blue-800' },
    { value: 'refund', label: 'Refund', color: 'bg-red-100 text-red-800' },
    { value: 'deposit_return', label: 'Deposit Return', color: 'bg-yellow-100 text-yellow-800' }
  ]

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Please enter a valid amount'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const amount = parseFloat(formData.amount)
      const adjustment = {
        type: formData.type,
        amount: amount,
        description: formData.description.trim(),
        reason: formData.reason.trim()
      }
      onSave(adjustment)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Minus size={16} className="text-green-600" />
      case 'extra_service':
        return <Plus size={16} className="text-blue-600" />
      case 'refund':
        return <Minus size={16} className="text-red-600" />
      case 'deposit_return':
        return <Minus size={16} className="text-yellow-600" />
      default:
        return <DollarSign size={16} className="text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Adjustment</h2>
            <p className="text-sm text-gray-600 mt-1">Add discount, refund, extra service, or other adjustment</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {adjustmentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {getTypeIcon(formData.type)}
              </div>
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === 'discount' || formData.type === 'refund' || formData.type === 'deposit_return' 
                ? 'Enter positive amount (will be subtracted from total)' 
                : 'Enter positive amount (will be added to total)'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Loyalty discount, Airport pickup, Cleaning fee refund"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Explain why this adjustment is being made..."
            />
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
          </div>

          {/* Preview */}
          {formData.amount && formData.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    adjustmentTypes.find(t => t.value === formData.type)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {adjustmentTypes.find(t => t.value === formData.type)?.label.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-900">{formData.description}</span>
                </div>
                <span className={`text-sm font-medium ${
                  parseFloat(formData.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {parseFloat(formData.amount) >= 0 ? '+' : ''}${formData.amount}
                </span>
              </div>
            </div>
          )}
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
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Add Adjustment</span>
          </button>
        </div>
      </div>
    </div>
  )
}
