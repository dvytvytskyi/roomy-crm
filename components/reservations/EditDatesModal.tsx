'use client'

import { useState } from 'react'
import { X, Calendar, AlertCircle, CheckCircle } from 'lucide-react'

interface EditDatesModalProps {
  reservation: any
  onClose: () => void
  onSave: (dates: { check_in: string; check_out: string }) => void
}

export default function EditDatesModal({ reservation, onClose, onSave }: EditDatesModalProps) {
  const [formData, setFormData] = useState({
    check_in: reservation.check_in,
    check_out: reservation.check_out
  })
  const [errors, setErrors] = useState<any>({})
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    status: 'checking' | 'available' | 'conflict' | null
    message: string
  }>({ status: null, message: '' })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }

    // Check availability when dates change
    if (field === 'check_in' || field === 'check_out') {
      checkAvailability()
    }
  }

  const checkAvailability = () => {
    setAvailabilityCheck({ status: 'checking', message: 'Checking availability...' })
    
    // Simulate availability check
    setTimeout(() => {
      const isAvailable = Math.random() > 0.3 // 70% chance of being available
      if (isAvailable) {
        setAvailabilityCheck({ 
          status: 'available', 
          message: 'Dates are available for this property' 
        })
      } else {
        setAvailabilityCheck({ 
          status: 'conflict', 
          message: 'Warning: These dates may conflict with existing reservations' 
        })
      }
    }, 1000)
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.check_in) {
      newErrors.check_in = 'Check-in date is required'
    }
    if (!formData.check_out) {
      newErrors.check_out = 'Check-out date is required'
    }
    if (formData.check_in && formData.check_out && new Date(formData.check_in) >= new Date(formData.check_out)) {
      newErrors.check_out = 'Check-out must be after check-in'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateNights = () => {
    if (formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Modify Dates</h2>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Check-in Date
              </label>
              <input
                type="date"
                value={formData.check_in}
                onChange={(e) => handleChange('check_in', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.check_in ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.check_in && <p className="text-red-500 text-sm mt-1">{errors.check_in}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Check-out Date
              </label>
              <input
                type="date"
                value={formData.check_out}
                onChange={(e) => handleChange('check_out', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.check_out ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.check_out && <p className="text-red-500 text-sm mt-1">{errors.check_out}</p>}
              {calculateNights() > 0 && (
                <p className="text-sm text-gray-500 mt-1">{calculateNights()} nights</p>
              )}
            </div>

            {/* Availability Check */}
            {availabilityCheck.status && (
              <div className={`p-3 rounded-lg ${
                availabilityCheck.status === 'checking' ? 'bg-yellow-50 border border-yellow-200' :
                availabilityCheck.status === 'available' ? 'bg-green-50 border border-green-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {availabilityCheck.status === 'checking' && (
                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {availabilityCheck.status === 'available' && (
                    <CheckCircle size={16} className="text-green-600" />
                  )}
                  {availabilityCheck.status === 'conflict' && (
                    <AlertCircle size={16} className="text-red-600" />
                  )}
                  <span className={`text-sm ${
                    availabilityCheck.status === 'checking' ? 'text-yellow-700' :
                    availabilityCheck.status === 'available' ? 'text-green-700' :
                    'text-red-700'
                  }`}>
                    {availabilityCheck.message}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Reservation</h4>
              <div className="text-sm text-gray-600">
                <p>Property: {reservation.unit_property}</p>
                <p>Original dates: {reservation.check_in} to {reservation.check_out}</p>
                <p>Nights: {reservation.nights}</p>
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
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
