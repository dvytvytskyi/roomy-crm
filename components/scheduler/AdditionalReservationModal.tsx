'use client'

import React, { useState, useEffect } from 'react'
import { X, User, Users, Dog, Baby, DollarSign, MessageSquare, Plus, Search } from 'lucide-react'
import { useGuests } from '../../hooks/useUsers'
import { useApi } from '../../hooks/useApi'
import { userService } from '../../lib/api'

interface Guest {
  id: string
  name: string
  email: string
  phone: string
}

interface AdditionalReservationData {
  pricePerNight: number
  numberOfGuests: number
  numberOfDogs: number
  numberOfChildren: number
  comments: string
  selectedGuestId?: string
  guestData?: Guest
}

interface AdditionalReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AdditionalReservationData) => void
  reservationData?: {
    name: string
    resourceId: string
    startDate: Date
    endDate: Date
    amount?: number
    [key: string]: any
  }
}

export default function AdditionalReservationModal({
  isOpen,
  onClose,
  onSave,
  reservationData
}: AdditionalReservationModalProps) {
  const [formData, setFormData] = useState<AdditionalReservationData>({
    pricePerNight: 0,
    numberOfGuests: 1,
    numberOfDogs: 0,
    numberOfChildren: 0,
    comments: '',
    selectedGuestId: '',
    guestData: undefined
  })

  const [showGuestSearch, setShowGuestSearch] = useState(false)
  const [guestSearchTerm, setGuestSearchTerm] = useState('')
  
  // Load guests data only when modal is open and guest search is shown
  const { data: guests, loading: guestsLoading } = useApi(
    () => userService.getGuests(),
    { immediate: isOpen && showGuestSearch }
  )
  
  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && reservationData) {
      const calculatedNights = Math.ceil(
        (new Date(reservationData.endDate).getTime() - new Date(reservationData.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      // Calculate price per night from total amount
      const pricePerNight = reservationData.amount && calculatedNights > 0 
        ? Math.round(reservationData.amount / calculatedNights) 
        : 0

      setFormData({
        pricePerNight,
        numberOfGuests: 1,
        numberOfDogs: 0,
        numberOfChildren: 0,
        comments: '',
        selectedGuestId: '',
        guestData: undefined
      })
    }
  }, [isOpen, reservationData])

  const handleInputChange = (field: keyof AdditionalReservationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGuestSelect = (guest: Guest) => {
    setFormData(prev => ({
      ...prev,
      selectedGuestId: guest.id,
      guestData: guest
    }))
    setShowGuestSearch(false)
    setGuestSearchTerm('')
  }

  const handleAddNewGuest = () => {
    // TODO: Implement add new guest modal
    console.log('Add new guest')
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const filteredGuests = guests?.filter(guest => 
    guest.name.toLowerCase().includes(guestSearchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(guestSearchTerm.toLowerCase())
  ) || []

  // Log when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 AdditionalReservationModal opened with data:', reservationData);
    }
  }, [isOpen, reservationData]);

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Additional Reservation Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Reservation Summary */}
          {reservationData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reservation Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Guest:</span>
                  <span className="ml-2 font-medium">{reservationData.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Property:</span>
                  <span className="ml-2 font-medium">{reservationData.resourceId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Check-in:</span>
                  <span className="ml-2 font-medium">
                    {new Date(reservationData.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Check-out:</span>
                  <span className="ml-2 font-medium">
                    {new Date(reservationData.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Price per Night */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <DollarSign size={16} className="inline mr-2" />
              Price per Night (AED)
            </label>
            <input
              type="number"
              value={formData.pricePerNight}
              onChange={(e) => handleInputChange('pricePerNight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter price per night"
              min="0"
              step="0.01"
            />
          </div>

          {/* Guest Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <User size={16} className="inline mr-2" />
              Guest Selection
            </label>
            
            {formData.guestData ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">{formData.guestData.name}</p>
                  <p className="text-sm text-green-700">{formData.guestData.email}</p>
                </div>
                <button
                  onClick={() => handleInputChange('guestData', undefined)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setShowGuestSearch(!showGuestSearch)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <Search size={16} className="inline mr-2" />
                  Search existing guest...
                </button>
                
                {showGuestSearch && (
                  <div className="border border-gray-300 rounded-lg p-3 space-y-2">
                    <input
                      type="text"
                      value={guestSearchTerm}
                      onChange={(e) => setGuestSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Search by name or email..."
                    />
                    
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredGuests.map(guest => (
                        <button
                          key={guest.id}
                          onClick={() => handleGuestSelect(guest)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg"
                        >
                          <p className="font-medium">{guest.name}</p>
                          <p className="text-sm text-gray-500">{guest.email}</p>
                        </button>
                      ))}
                      {filteredGuests.length === 0 && guestSearchTerm && (
                        <p className="text-sm text-gray-500 px-3 py-2">No guests found</p>
                      )}
                    </div>
                    
                    <button
                      onClick={handleAddNewGuest}
                      className="w-full flex items-center justify-center px-3 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50"
                    >
                      <Plus size={16} className="mr-2" />
                      Add New Guest
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Users size={16} className="inline mr-2" />
              Number of Guests
            </label>
            <input
              type="number"
              value={formData.numberOfGuests}
              onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
              max="20"
            />
          </div>

          {/* Number of Dogs */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Dog size={16} className="inline mr-2" />
              Number of Dogs
            </label>
            <input
              type="number"
              value={formData.numberOfDogs}
              onChange={(e) => handleInputChange('numberOfDogs', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="0"
              max="5"
            />
          </div>

          {/* Number of Children */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Baby size={16} className="inline mr-2" />
              Number of Children
            </label>
            <input
              type="number"
              value={formData.numberOfChildren}
              onChange={(e) => handleInputChange('numberOfChildren', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="0"
              max="10"
            />
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <MessageSquare size={16} className="inline mr-2" />
              Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Add any special requests or comments..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Save Details
          </button>
        </div>
      </div>
    </div>
  )
}
