'use client'

import { useState, useEffect } from 'react'
import { X, Search, Plus, User, Mail, Phone, Check } from 'lucide-react'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'

interface Guest {
  id: number
  name: string
  email: string
  phone: string
  total_reservations: number
  last_visit: string
}

interface GuestSelectorModalProps {
  onClose: () => void
  onSelectGuest: (guest: Guest) => void
  onCreateGuest: (guestData: Partial<Guest>) => void
}

export default function GuestSelectorModal({ onClose, onSelectGuest, onCreateGuest }: GuestSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'select' | 'create'>('select')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [newGuestData, setNewGuestData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [errors, setErrors] = useState<any>({})
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load real guests from API
  useEffect(() => {
    const loadGuests = async () => {
      try {
        setIsLoading(true)
        console.log('👥 GuestSelectorModal: Loading guests from API...')
        
        const response = await userServiceAdapter.getUsers(`role=GUEST&search=${searchTerm}`)
        
        if (response.success && response.data) {
          // Handle both API formats
          let guestsData = []
          if (Array.isArray(response.data)) {
            guestsData = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            guestsData = response.data.data
          }
          
          // Transform API guests to component format
          const transformedGuests: Guest[] = guestsData.map((apiGuest: any) => ({
            id: parseInt(apiGuest.id),
            name: `${apiGuest.firstName} ${apiGuest.lastName}`,
            email: apiGuest.email,
            phone: apiGuest.phone,
            total_reservations: apiGuest.reservationCount || 0,
            last_visit: apiGuest.lastModifiedAt || apiGuest.createdAt
          }))
          
          console.log('👥 GuestSelectorModal: Loaded guests:', transformedGuests.length)
          setGuests(transformedGuests)
        } else {
          console.error('👥 GuestSelectorModal: Failed to load guests:', response.error)
          setGuests([])
        }
      } catch (error) {
        console.error('👥 GuestSelectorModal: Error loading guests:', error)
        setGuests([])
      } finally {
        setIsLoading(false)
      }
    }

    loadGuests()
  }, [searchTerm])

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.includes(searchTerm)
  )

  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest)
  }

  const handleCreateGuest = () => {
    const newErrors: any = {}

    if (!newGuestData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!newGuestData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(newGuestData.email)) {
      newErrors.email = 'Valid email is required'
    }
    if (!newGuestData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const newGuest: Partial<Guest> = {
        ...newGuestData,
        total_reservations: 0,
        last_visit: undefined
      }
      onCreateGuest(newGuest)
    }
  }

  const handleConfirmSelection = () => {
    if (selectedTab === 'select' && selectedGuest) {
      onSelectGuest(selectedGuest)
    } else if (selectedTab === 'create') {
      handleCreateGuest()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Guest</h2>
            <p className="text-sm text-gray-600 mt-1">Choose from existing guests or create a new one</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6">
            <button
              onClick={() => setSelectedTab('select')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'select'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Select Existing Guest
            </button>
            <button
              onClick={() => setSelectedTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create New Guest
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {selectedTab === 'select' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search guests by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Guests List */}
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Loading guests...</span>
                  </div>
                ) : filteredGuests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No guests found</p>
                    <p className="text-sm">Try adjusting your search or create a new guest</p>
                  </div>
                ) : (
                  filteredGuests.map((guest) => (
                  <div
                    key={guest.id}
                    onClick={() => handleSelectGuest(guest)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedGuest?.id === guest.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
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
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        <p>{guest.total_reservations} reservations</p>
                        <p>Last visit: {formatDate(guest.last_visit)}</p>
                      </div>
                    </div>
                    
                    {selectedGuest?.id === guest.id && (
                      <div className="flex items-center space-x-2 mt-3 text-blue-600">
                        <Check size={16} />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTab === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newGuestData.name}
                  onChange={(e) => setNewGuestData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter guest name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  value={newGuestData.email}
                  onChange={(e) => setNewGuestData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="guest@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newGuestData.phone}
                  onChange={(e) => setNewGuestData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">New Guest Information</h4>
                <p className="text-sm text-blue-700">
                  This guest will be automatically added to your guests database and can be selected for future reservations.
                </p>
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
            onClick={handleConfirmSelection}
            disabled={
              (selectedTab === 'select' && !selectedGuest) ||
              (selectedTab === 'create' && (!newGuestData.name || !newGuestData.email || !newGuestData.phone))
            }
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {selectedTab === 'select' ? 'Select Guest' : 'Create & Select Guest'}
          </button>
        </div>
      </div>
    </div>
  )
}
