'use client'

import { useState } from 'react'
import { X, Calendar, DollarSign, User, MapPin, Save, Plus, ChevronDown } from 'lucide-react'
import GuestSelectorModal from './GuestSelectorModal'

interface NewReservationModalProps {
  onClose: () => void
  onSave: (reservation: any) => void
}

export default function NewReservationModal({ onClose, onSave }: NewReservationModalProps) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    total_amount: '',
    unit_property: '',
    source: 'Direct',
    notes: ''
  })

  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const handleSelectGuest = (guest: any) => {
    setSelectedGuest(guest)
    setFormData(prev => ({
      ...prev,
      guest_name: guest.name,
      guest_email: guest.email,
      guest_phone: guest.phone
    }))
    setIsGuestSelectorOpen(false)
  }

  const handleCreateGuest = (guestData: any) => {
    // Simulate creating new guest
    const newGuest = {
      id: Date.now(),
      ...guestData
    }
    setSelectedGuest(newGuest)
    setFormData(prev => ({
      ...prev,
      guest_name: guestData.name,
      guest_email: guestData.email,
      guest_phone: guestData.phone
    }))
    setIsGuestSelectorOpen(false)
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!selectedGuest && !formData.guest_name.trim()) {
      newErrors.guest = 'Please select or create a guest'
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
      const newReservation = {
        id: Date.now(), // Temporary ID
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        nights: calculateNights(),
        status: 'confirmed',
        reservation_id: `RES-${Date.now().toString().slice(-6)}`,
        paid_amount: 0,
        outstanding_balance: parseFloat(formData.total_amount),
        created_at: new Date().toISOString()
      }
      onSave(newReservation)
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

  const sourceOptions = [
    { value: 'Direct', label: 'Direct Booking' },
    { value: 'Airbnb', label: 'Airbnb' },
    { value: 'Booking.com', label: 'Booking.com' },
    { value: 'Vrbo', label: 'Vrbo' },
    { value: 'Expedia', label: 'Expedia' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Reservation</h2>
            <p className="text-sm text-gray-600 mt-1">Add a new booking to the system</p>
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
          <div className="space-y-6">
            {/* Guest Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
              
              {/* Guest Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Guest *
                </label>
                
                {selectedGuest ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900">{selectedGuest.name}</p>
                        <p className="text-sm text-green-700">{selectedGuest.email}</p>
                        <p className="text-sm text-green-700">{selectedGuest.phone}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedGuest(null)
                          setFormData(prev => ({
                            ...prev,
                            guest_name: '',
                            guest_email: '',
                            guest_phone: ''
                          }))
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsGuestSelectorOpen(true)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between"
                  >
                    <span className="text-gray-500">Select guest or create new one</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                )}
                
                {errors.guest && <p className="text-red-500 text-sm mt-1">{errors.guest}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => handleChange('source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sourceOptions.map(option => (
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
                    Check-in Date *
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
                    Check-out Date *
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
              </div>
            </div>

            {/* Property and Amount */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Property/Unit *
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
                    Total Amount *
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
            <span>Create Reservation</span>
          </button>
        </div>
      </div>

      {/* Guest Selector Modal */}
      {isGuestSelectorOpen && (
        <GuestSelectorModal
          onClose={() => setIsGuestSelectorOpen(false)}
          onSelectGuest={handleSelectGuest}
          onCreateGuest={handleCreateGuest}
        />
      )}
    </div>
  )
}
