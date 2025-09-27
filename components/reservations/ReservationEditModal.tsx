'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, User, MapPin, Save, AlertCircle } from 'lucide-react'

interface ReservationEditModalProps {
  reservation: any
  onClose: () => void
  onSave: (reservation: any) => void
}

export default function ReservationEditModal({ reservation, onClose, onSave }: ReservationEditModalProps) {
  const [formData, setFormData] = useState({
    guest_name: '',
    check_in: '',
    check_out: '',
    total_amount: '',
    unit_property: '',
    status: 'confirmed',
    notes: '',
    tags: [] as string[]
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<any>({})
  const [showAvailabilityWarning, setShowAvailabilityWarning] = useState(false)

  useEffect(() => {
    if (reservation) {
      setFormData({
        guest_name: reservation.guest_name || '',
        check_in: reservation.check_in || '',
        check_out: reservation.check_out || '',
        total_amount: reservation.total_amount?.toString() || '',
        unit_property: reservation.unit_property || '',
        status: reservation.status || 'confirmed',
        notes: reservation.notes || '',
        tags: reservation.tags || []
      })
    }
  }, [reservation])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }

    // Check availability when dates or property change
    if (['check_in', 'check_out', 'unit_property'].includes(field)) {
      checkAvailability()
    }
  }

  const checkAvailability = () => {
    // Simulate availability check
    setTimeout(() => {
      const isAvailable = Math.random() > 0.3 // 70% chance of being available
      setShowAvailabilityWarning(!isAvailable)
    }, 500)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'Guest name is required'
    }
    if (!formData.check_in) {
      newErrors.check_in = 'Check-in date is required'
    }
    if (!formData.check_out) {
      newErrors.check_out = 'Check-out date is required'
    }
    if (formData.check_in && formData.check_out && new Date(formData.check_in) >= new Date(formData.check_out)) {
      newErrors.check_out = 'Check-out must be after check-in'
    }
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      newErrors.total_amount = 'Valid amount is required'
    }
    if (!formData.unit_property.trim()) {
      newErrors.unit_property = 'Property is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const updatedReservation = {
        ...reservation,
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        nights: Math.ceil((new Date(formData.check_out).getTime() - new Date(formData.check_in).getTime()) / (1000 * 60 * 60 * 24))
      }
      onSave(updatedReservation)
    }
  }

  const availableProperties = [
    'Apartment Burj Khalifa 1A',
    'Apartment Burj Khalifa 1B',
    'Villa Dubai Marina 1',
    'Villa Dubai Marina 2',
    'Studio Downtown 1',
    'Beach Villa Palm Jumeirah 1'
  ]

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'completed', label: 'Completed' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Reservation</h2>
            <p className="text-sm text-gray-600 mt-1">{reservation?.reservation_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Availability Warning */}
          {showAvailabilityWarning && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Availability Warning</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    The selected dates may conflict with existing reservations. Please verify availability before saving.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Guest Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={formData.guest_name}
                    onChange={(e) => handleChange('guest_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.guest_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter guest name"
                  />
                  {errors.guest_name && <p className="text-red-500 text-sm mt-1">{errors.guest_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>
            </div>

            {/* Property and Amount */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Property/Unit
                  </label>
                  <select
                    value={formData.unit_property}
                    onChange={(e) => handleChange('unit_property', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.unit_property ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select property</option>
                    {availableProperties.map(property => (
                      <option key={property} value={property}>
                        {property}
                      </option>
                    ))}
                  </select>
                  {errors.unit_property && <p className="text-red-500 text-sm mt-1">{errors.unit_property}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) => handleChange('total_amount', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.total_amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.total_amount && <p className="text-red-500 text-sm mt-1">{errors.total_amount}</p>}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Add any special notes or requests..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Add
                </button>
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
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  )
}
