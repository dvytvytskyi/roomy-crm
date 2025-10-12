'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, User, MapPin, Users, Phone, Mail, Search, Check, Plus } from 'lucide-react'
import { reservationServiceAdapter, propertyServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'

interface NewReservationModalProps {
  onClose: () => void
  onSave: (reservation: any) => void
}

interface Guest {
  id: string
  name: string
  email: string
  phone: string
  firstName: string
  lastName: string
}

interface Property {
  id: string
  name: string
  type: string
  city: string
  address: string
  capacity: number
  pricePerNight: number
}

export default function NewReservationModal({ onClose, onSave }: NewReservationModalProps) {
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    total_amount: '',
    property_id: '',
    guests_count: 1,
    source: 'DIRECT',
    notes: ''
  })

  const [guests, setGuests] = useState<Guest[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isGuestSelectorOpen, setIsGuestSelectorOpen] = useState(false)
  const [guestSearchTerm, setGuestSearchTerm] = useState('')
  const [errors, setErrors] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        console.log('🔄 Loading guests and properties...')

        const [guestsResponse, propertiesResponse] = await Promise.all([
          userServiceAdapter.getUsers(`role=GUEST&search=${guestSearchTerm}`),
          propertyServiceAdapter.getAll()
        ])

        // Handle guests
        if (guestsResponse.success && guestsResponse.data) {
          // Handle both API formats
          let guestsData: any[] = []
          if (Array.isArray(guestsResponse.data)) {
            guestsData = guestsResponse.data
          } else if ((guestsResponse.data as any).data && Array.isArray((guestsResponse.data as any).data)) {
            guestsData = (guestsResponse.data as any).data
          }
          
          const transformedGuests = guestsData.map((guest: any) => ({
            id: guest.id,
            name: `${guest.firstName} ${guest.lastName}`.trim(),
            email: guest.email,
            phone: guest.phone,
            firstName: guest.firstName,
            lastName: guest.lastName
          }))
          setGuests(transformedGuests)
          console.log('✅ Loaded guests:', transformedGuests.length)
        }

        // Handle properties
        if (propertiesResponse.success && propertiesResponse.data) {
          let propertiesData: any[] = []
          if (Array.isArray(propertiesResponse.data)) {
            propertiesData = propertiesResponse.data
          } else if ((propertiesResponse.data as any).data && Array.isArray((propertiesResponse.data as any).data)) {
            propertiesData = (propertiesResponse.data as any).data
          }
          setProperties(propertiesData)
          console.log('✅ Loaded properties:', propertiesData.length)
        }
      } catch (error) {
        console.error('❌ Error loading data:', error)
        showToast.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [guestSearchTerm])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setFormData(prev => ({
      ...prev,
      guest_name: guest.name,
      guest_email: guest.email,
      guest_phone: guest.phone
    }))
    setIsGuestSelectorOpen(false)
  }

  const calculateNights = () => {
    if (formData.check_in && formData.check_out) {
      const checkIn = new Date(formData.check_in)
      const checkOut = new Date(formData.check_out)
      return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!selectedGuest && !formData.guest_name.trim()) {
      newErrors.guest_name = 'Please select a guest or enter guest name'
    }
    if (!formData.guest_email.trim()) {
      newErrors.guest_email = 'Email is required'
    }
    if (!formData.check_in) {
      newErrors.check_in = 'Check-in date is required'
    }
    if (!formData.check_out) {
      newErrors.check_out = 'Check-out date is required'
    }
    if (formData.check_in && formData.check_out && new Date(formData.check_out) <= new Date(formData.check_in)) {
      newErrors.check_out = 'Check-out date must be after check-in date'
    }
    if (!formData.property_id) {
      newErrors.property_id = 'Please select a property'
    }
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      newErrors.total_amount = 'Total amount must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    const loadingToast = showToast.loading('Creating reservation...')

    try {
      const selectedProperty = properties.find(p => p.id === formData.property_id)
      if (!selectedProperty) {
        throw new Error('Selected property not found')
      }

      const reservationData = {
        propertyId: selectedProperty.id,
        guestId: selectedGuest?.id,
        checkIn: formData.check_in,
        checkOut: formData.check_out,
        guests: formData.guests_count,
        totalAmount: parseFloat(formData.total_amount),
        paidAmount: 0,
        source: formData.source,
        guestName: formData.guest_name,
        guestEmail: formData.guest_email,
        guestPhone: formData.guest_phone,
        specialRequests: formData.notes,
        notes: formData.notes
      }

      console.log('📤 Creating reservation:', reservationData)
      const response = await reservationServiceAdapter.create(reservationData)
      
      if (response.success && response.data) {
        showToast.dismiss(loadingToast)
        showToast.success('Reservation created successfully!')
        
        const transformedReservation = {
          ...response.data,
          nights: calculateNights(),
          reservation_id: (response.data as any).reservationId || response.data.id,
          outstanding_balance: (response.data as any).outstandingBalance || response.data.totalAmount,
          created_at: (response.data as any).createdAt || new Date().toISOString()
        }

        onSave(transformedReservation)
        onClose()
      } else {
        throw new Error('Failed to create reservation')
      }
    } catch (error: any) {
      console.error('❌ Error creating reservation:', error)
      showToast.dismiss(loadingToast)
      showToast.error(error.message || 'Failed to create reservation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.phone.includes(guestSearchTerm)
  )

  const sourceOptions = [
    { value: 'DIRECT', label: 'Direct Booking' },
    { value: 'AIRBNB', label: 'Airbnb' },
    { value: 'BOOKING_COM', label: 'Booking.com' },
    { value: 'VRBO', label: 'Vrbo' },
    { value: 'EXPEDIA', label: 'Expedia' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Create New Reservation</h2>
            <p className="text-sm text-slate-600 mt-1">Smart booking with real-time availability check</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Guest Information */}
            <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Guest Information
            </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guest Selector */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          type="button"
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
                      type="button"
                      onClick={() => setIsGuestSelectorOpen(true)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      Select guest...
                    </button>
                  )}
                  {errors.guest_name && <p className="text-red-500 text-sm mt-1">{errors.guest_name}</p>}
                </div>

                {/* Guest Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    value={formData.guest_name}
                    onChange={(e) => handleInputChange('guest_name', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.guest_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Guest name"
                  />
                  {errors.guest_name && <p className="text-red-500 text-sm mt-1">{errors.guest_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.guest_email}
                    onChange={(e) => handleInputChange('guest_email', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.guest_email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="guest@example.com"
                  />
                  {errors.guest_email && <p className="text-red-500 text-sm mt-1">{errors.guest_email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.guest_phone}
                    onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

            {/* Property & Dates */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Property & Dates
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property *
                  </label>
                  <select
                    value={formData.property_id}
                    onChange={(e) => handleInputChange('property_id', e.target.value)}
                    disabled={isLoading}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.property_id ? 'border-red-300' : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {isLoading ? 'Loading properties...' : 'Select property'}
                    </option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.type} ({property.city})
                      </option>
                    ))}
                  </select>
                  {errors.property_id && <p className="text-red-500 text-sm mt-1">{errors.property_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.guests_count}
                    onChange={(e) => handleInputChange('guests_count', parseInt(e.target.value) || 1)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    value={formData.check_in}
                    onChange={(e) => handleInputChange('check_in', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.check_in ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.check_in && <p className="text-red-500 text-sm mt-1">{errors.check_in}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    value={formData.check_out}
                    onChange={(e) => handleInputChange('check_out', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
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

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Pricing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (AED) *
                  </label>
                  <input
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) => handleInputChange('total_amount', e.target.value)}
                    className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Add any special notes or requests..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              'Creating...'
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Reservation
              </>
            )}
          </button>
        </div>

        {/* Guest Selector Modal */}
        {isGuestSelectorOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Select Guest</h3>
                <button
                  onClick={() => setIsGuestSelectorOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search guests by name, email, or phone..."
                    value={guestSearchTerm}
                    onChange={(e) => setGuestSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Guests List */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="ml-2 text-gray-500">Loading guests...</span>
                    </div>
                  ) : filteredGuests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User size={48} className="mx-auto mb-2 text-gray-300" />
                      <p>No guests found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </div>
                  ) : (
                    filteredGuests.map((guest) => (
                      <div
                        key={guest.id}
                        onClick={() => handleSelectGuest(guest)}
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{guest.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Mail size={14} />
                                <span>{guest.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone size={14} />
                                <span>{guest.phone}</span>
                              </div>
                            </div>
                          </div>
                          <Check size={16} className="text-orange-500" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
