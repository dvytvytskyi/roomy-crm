'use client'

import { useState } from 'react'
import { X, Save, DollarSign, AlertCircle, Calculator } from 'lucide-react'

interface EditPricingModalProps {
  reservation: any
  onClose: () => void
  onSave: (pricing: any) => void
}

export default function EditPricingModal({ reservation, onClose, onSave }: EditPricingModalProps) {
  const [formData, setFormData] = useState({
    total_amount: reservation.total_amount.toString(),
    reason: '',
    notes: ''
  })
  const [errors, setErrors] = useState<any>({})
  const [isCalculating, setIsCalculating] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const calculateBreakdown = () => {
    const newTotal = parseFloat(formData.total_amount)
    const nights = reservation.nights
    const baseRate = newTotal / nights
    const cleaningFee = 50 // Default cleaning fee
    const taxes = newTotal * 0.1 // 10% tax
    
    return {
      base_rate: baseRate,
      cleaning_fee: cleaningFee,
      taxes: taxes,
      total: newTotal
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.total_amount || isNaN(parseFloat(formData.total_amount))) {
      newErrors.total_amount = 'Please enter a valid amount'
    } else if (parseFloat(formData.total_amount) <= 0) {
      newErrors.total_amount = 'Amount must be greater than 0'
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for the price change'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const newAmount = parseFloat(formData.total_amount)
      const oldAmount = reservation.total_amount
      const difference = newAmount - oldAmount
      
      const pricingUpdate = {
        old_amount: oldAmount,
        new_amount: newAmount,
        difference: difference,
        reason: formData.reason,
        notes: formData.notes,
        updated_at: new Date().toISOString(),
        updated_by: 'Current User'
      }
      
      onSave(pricingUpdate)
    }
  }

  const breakdown = calculateBreakdown()
  const difference = parseFloat(formData.total_amount) - reservation.total_amount

  const priceReasons = [
    'Guest requested discount',
    'Seasonal rate adjustment',
    'Last minute booking discount',
    'Extended stay discount',
    'Platform fee adjustment',
    'Tax correction',
    'Cleaning fee adjustment',
    'Other'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Pricing</h2>
            <p className="text-sm text-gray-600 mt-1">{reservation.reservation_id} • {reservation.guest_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Current vs New Price */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Price Change Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p className="text-xl font-bold text-gray-900">${reservation.total_amount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">New Price</p>
                  <p className="text-xl font-bold text-blue-600">${formData.total_amount || '0'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Difference</p>
                  <p className={`text-xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* New Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                New Total Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_amount}
                  onChange={(e) => handleChange('total_amount', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.total_amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.total_amount && <p className="text-red-500 text-sm mt-1">{errors.total_amount}</p>}
            </div>

            {/* Reason for Change */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle size={16} className="inline mr-2" />
                Reason for Change *
              </label>
              <select
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a reason...</option>
                {priceReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Add any additional details about this price change..."
              />
            </div>

            {/* Price Breakdown Preview */}
            {formData.total_amount && !isNaN(parseFloat(formData.total_amount)) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                  <Calculator size={16} className="mr-2" />
                  New Price Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Base Rate ({reservation.nights} nights):</span>
                    <span className="font-medium">${breakdown.base_rate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Cleaning Fee:</span>
                    <span className="font-medium">${breakdown.cleaning_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Taxes:</span>
                    <span className="font-medium">${breakdown.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 font-semibold">
                    <span className="text-blue-800">Total:</span>
                    <span className="text-blue-800">${breakdown.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for significant changes */}
            {Math.abs(difference) > 100 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <AlertCircle size={16} className="text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This is a significant price change (${Math.abs(difference).toFixed(2)}). 
                    Please ensure this change is communicated to the guest.
                  </p>
                </div>
              </div>
            )}
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
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Update Price</span>
          </button>
        </div>
      </div>
    </div>
  )
}
