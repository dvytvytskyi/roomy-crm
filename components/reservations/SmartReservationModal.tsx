'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, User, MapPin, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { reservationServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'
import { usePropertyAvailability } from '@/hooks/usePropertyAvailability'
import { useReservationData } from '@/hooks/useReservationData'

interface SmartReservationModalProps {
  onClose: () => void
  onSave: (reservation: any) => void
  initialData?: {
    propertyId?: string
    checkIn?: string
    checkOut?: string
    guestName?: string
    guestEmail?: string
    guests?: number
    totalAmount?: number
  }
}

export default function SmartReservationModal({ onClose, onSave, initialData }: SmartReservationModalProps) {
  const [formData, setFormData] = useState({
    guestId: '',
    propertyId: initialData?.propertyId || '',
    checkIn: initialData?.checkIn || '',
    checkOut: initialData?.checkOut || '',
    guests: initialData?.guests || 1,
    totalAmount: initialData?.totalAmount?.toString() || '',
    source: 'MANUAL',
    guestName: initialData?.guestName || '',
    guestEmail: initialData?.guestEmail || '',
    guestPhone: '',
    notes: ''
  })

  const [errors, setErrors] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)

  // Load guests and properties
  const { guests, properties, loading: dataLoading, error: dataError } = useReservationData()

  // Check availability in real-time
  const { availability, loading: availabilityLoading, error: availabilityError, isAvailable } = usePropertyAvailability({
    propertyId: formData.propertyId,
    startDate: formData.checkIn,
    endDate: formData.checkOut,
    enabled: !!(formData.propertyId && formData.checkIn && formData.checkOut)
  })

  // Update guest info when guest is selected
  useEffect(() => {
    if (formData.guestId) {
      const selectedGuest = guests.find(g => g.id === formData.guestId)
      if (selectedGuest) {
        setFormData(prev => ({
          ...prev,
          guestName: selectedGuest.name,
          guestEmail: selectedGuest.email,
          guestPhone: selectedGuest.phone || ''
        }))
      }
    }
  }, [formData.guestId, guests])

  // Calculate nights and suggested amount
  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn)
      const checkOut = new Date(formData.checkOut)
      return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  // Auto-calculate total amount when property or dates change
  useEffect(() => {
    if (formData.propertyId && formData.checkIn && formData.checkOut) {
      const selectedProperty = properties.find(p => p.id === formData.propertyId)
      if (selectedProperty) {
        const nights = calculateNights()
        const suggestedAmount = selectedProperty.pricePerNight * nights
        setFormData(prev => ({
          ...prev,
          totalAmount: prev.totalAmount || suggestedAmount.toString()
        }))
      }
    }
  }, [formData.propertyId, formData.checkIn, formData.checkOut, properties])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.guestId) {
      newErrors.guestId = 'Please select a guest'
    }
    if (!formData.propertyId) {
      newErrors.propertyId = 'Please select a property'
    }
    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required'
    }
    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required'
    }
    if (formData.checkIn && formData.checkOut && new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      newErrors.checkOut = 'Check-out must be after check-in'
    }
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Valid amount is required'
    }
    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required'
    }
    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Guest email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.guestEmail)) {
        newErrors.guestEmail = 'Invalid email format'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    // Check availability one more time before submitting
    if (isAvailable === false) {
      showToast.error('Property is not available for the selected dates')
      return
    }

    setSubmitting(true)
    const loadingToast = showToast.loading('Creating reservation...')

    try {
      const reservationData = {
        propertyId: formData.propertyId,
        guestId: formData.guestId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        totalAmount: parseFloat(formData.totalAmount),
        source: formData.source,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        notes: formData.notes
      }

      const response = await reservationServiceAdapter.create(reservationData)
      
      if (response.success && response.data) {
        showToast.dismiss(loadingToast)
        showToast.success('Reservation created successfully!')
        
        // Transform API response to match expected format
        const transformedReservation = {
          ...response.data,
          nights: calculateNights(),
          reservation_id: response.data.reservationId,
          outstanding_balance: response.data.outstandingBalance || response.data.totalAmount,
          created_at: response.data.createdAt
        }

        onSave(transformedReservation)
        onClose()
      } else {
        throw new Error(response.error || 'Failed to create reservation')
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error)
      showToast.dismiss(loadingToast)
      showToast.error(error.message || 'Failed to create reservation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const sourceOptions = [
    { value: 'MANUAL', label: 'Manual Booking' },
    { value: 'AIRBNB', label: 'Airbnb' },
    { value: 'BOOKING_COM', label: 'Booking.com' },
    { value: 'VRBO', label: 'Vrbo' },
    { value: 'EXPEDIA', label: 'Expedia' },
    { value: 'DIRECT', label: 'Direct' }
  ]

  const selectedProperty = properties.find(p => p.id === formData.propertyId)
  const nights = calculateNights()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Reservation</h2>
            <p className="text-sm text-gray-600 mt-1">Smart booking with real-time availability check</p>
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
          {dataLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading data...</span>
            </div>
          ) : dataError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">Error loading data: {dataError}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Guest Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      Guest *
                    </label>
                    <select
                      value={formData.guestId}
                      onChange={(e) => handleChange('guestId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.guestId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select guest...</option>
                      {guests.map(guest => (
                        <option key={guest.id} value={guest.id}>
                          {guest.name} ({guest.email})
                        </option>
                      ))}
                    </select>
                    {errors.guestId && <p className="text-red-500 text-sm mt-1">{errors.guestId}</p>}
                  </div>

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

                {/* Guest Details (auto-filled) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => handleChange('guestName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.guestName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Guest name"
                    />
                    {errors.guestName && <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => handleChange('guestEmail', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.guestEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="guest@example.com"
                    />
                    {errors.guestEmail && <p className="text-red-500 text-sm mt-1">{errors.guestEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.guestPhone}
                      onChange={(e) => handleChange('guestPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Property Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Property & Dates</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Property *
                    </label>
                    <select
                      value={formData.propertyId}
                      onChange={(e) => handleChange('propertyId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.propertyId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select property...</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>
                          {property.name} - {property.city} (AED {property.pricePerNight}/night)
                        </option>
                      ))}
                    </select>
                    {errors.propertyId && <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProperty?.capacity || 10}
                      value={formData.guests}
                      onChange={(e) => handleChange('guests', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {selectedProperty && (
                      <p className="text-sm text-gray-500 mt-1">Max capacity: {selectedProperty.capacity}</p>
                    )}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      value={formData.checkIn}
                      onChange={(e) => handleChange('checkIn', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.checkIn ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => handleChange('checkOut', e.target.value)}
                      min={formData.checkIn || new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.checkOut ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
                    {nights > 0 && (
                      <p className="text-sm text-gray-500 mt-1">{nights} nights</p>
                    )}
                  </div>
                </div>

                {/* Availability Status */}
                {formData.propertyId && formData.checkIn && formData.checkOut && (
                  <div className="mt-4">
                    {availabilityLoading ? (
                      <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                        <span className="text-blue-700">Checking availability...</span>
                      </div>
                    ) : availabilityError ? (
                      <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-red-700">Error checking availability: {availabilityError}</span>
                      </div>
                    ) : isAvailable === true ? (
                      <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-green-700">Property is available for these dates!</span>
                      </div>
                    ) : isAvailable === false ? (
                      <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-red-700">Property is not available for these dates!</span>
                        {availability?.conflictingReservations && availability.conflictingReservations.length > 0 && (
                          <div className="mt-2 text-sm text-red-600">
                            Conflicting reservations: {availability.conflictingReservations.map(r => r.reservation_id).join(', ')}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-2" />
                      Total Amount (AED) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => handleChange('totalAmount', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.totalAmount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.totalAmount && <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>}
                  </div>

                  {selectedProperty && nights > 0 && (
                    <div className="flex items-end">
                      <div className="bg-gray-50 p-3 rounded-lg w-full">
                        <p className="text-sm text-gray-600">Suggested Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          AED {(selectedProperty.pricePerNight * nights).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {nights} nights × AED {selectedProperty.pricePerNight}
                        </p>
                      </div>
                    </div>
                  )}
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
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || isAvailable === false || dataLoading}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Create Reservation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
