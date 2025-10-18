'use client'

import { useState, useEffect } from 'react'
import { X, Save, Home, MapPin, User, DollarSign, ChevronDown } from 'lucide-react'
import { propertyServiceAdapter, userServiceAdapter } from '../../lib/api/adapters/apiAdapter'
import { showToast } from '../../lib/utils/toast'
import { usePropertyEvents } from '../../hooks/usePropertyEvents'
import { 
  PROPERTY_TYPES, 
  DUBAI_AREAS, 
  PROPERTY_STATUSES, 
  DEFAULT_PROPERTY_VALUES,
  type PropertyType,
  type DubaiArea,
  type PropertyStatus
} from '../../lib/config/property-config'

interface PropertyModalProps {
  isOpen: boolean
  onClose: () => void
  property?: any
  onShowToast?: (message: string) => void
  onPropertyCreated?: () => void // Callback to refresh the list
}

export default function PropertyModal({ isOpen, onClose, property, onShowToast, onPropertyCreated }: PropertyModalProps) {
  // Event Bus integration
  const { emitPropertyCreated, emitPropertyUpdated } = usePropertyEvents()
  
  const [formData, setFormData] = useState({
    nickname: '',
    type: 'apartment' as PropertyType,
    locationId: '' as DubaiArea | '',
    address: '',
    district: '' as DubaiArea | '', // Додали район для address
    bedrooms: 1,
    selectedOwnerId: '',
    price_per_night: DEFAULT_PROPERTY_VALUES.pricePerNight,
    status: 'active' as PropertyStatus,
    pricelabId: '', // Додали PriceLabs ID
    isPublished: false // Додали поле для керування публікацією
  })

  // Owner selection states
  const [owners, setOwners] = useState<any[]>([])
  const [ownersLoading, setOwnersLoading] = useState(false)
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<any | null>(null)

  // PriceLabs listings states
  const [pricelabsListings, setPricelabsListings] = useState<any[]>([])
  const [pricelabsLoading, setPricelabsLoading] = useState(false)
  const [isPricelabsDropdownOpen, setIsPricelabsDropdownOpen] = useState(false)
  const [selectedPricelabsListing, setSelectedPricelabsListing] = useState<any | null>(null)
  const [pricelabsSearchTerm, setPricelabsSearchTerm] = useState('')

  // Use centralized configuration
  const propertyTypes = PROPERTY_TYPES
  const dubaiAreas = DUBAI_AREAS
  const propertyStatuses = PROPERTY_STATUSES

  // Use centralized configuration
  const statusOptions = propertyStatuses

  // Load owners when modal opens
  const loadOwners = async () => {
    setOwnersLoading(true)
    try {
      console.log('🔄 Loading owners from API...')
      const response = await userServiceAdapter.getOwners({ limit: 100 })
      console.log('📋 Owners API Response:', response)
      
      if (response.success && response.data) {
        // Handle both V1 and V2 response formats
        let ownersData = []
        if (Array.isArray(response.data)) {
          // V1 format: direct array
          ownersData = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // V2 format: paginated response
          ownersData = response.data.data
        }
        
        console.log('👥 Processed owners data:', ownersData)
        setOwners(ownersData)
      } else {
        console.log('❌ No owners data in response')
        setOwners([])
      }
    } catch (error) {
      console.error('❌ Error loading owners:', error)
      showToast.error('Failed to load owners list')
      setOwners([])
    } finally {
      setOwnersLoading(false)
    }
  }

  // Handle owner selection
  const handleOwnerSelect = (owner: any) => {
    setSelectedOwner(owner)
    setFormData(prev => ({ ...prev, selectedOwnerId: owner.id }))
    setIsOwnerDropdownOpen(false)
  }

  // Load PriceLabs listings
  const loadPricelabsListings = async () => {
    setPricelabsLoading(true)
    try {
      console.log('🔄 Loading PriceLabs listings from API...')
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_V2_URL}/integrations/pricelabs/listings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('📋 PriceLabs Listings API Response:', result)
        
        if (result.success && result.data?.listings) {
          console.log(`✅ Loaded ${result.data.listings.length} PriceLabs listings`)
          setPricelabsListings(result.data.listings)
        } else {
          console.log('❌ No listings data in response')
          setPricelabsListings([])
        }
      } else {
        throw new Error(`Failed to load PriceLabs listings: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error loading PriceLabs listings:', error)
      showToast.error('Failed to load PriceLabs listings')
      setPricelabsListings([])
    } finally {
      setPricelabsLoading(false)
    }
  }

  // Handle PriceLabs listing selection
  const handlePricelabsListingSelect = (listing: any) => {
    setSelectedPricelabsListing(listing)
    setFormData(prev => ({ ...prev, pricelabId: listing.id }))
    setIsPricelabsDropdownOpen(false)
    setPricelabsSearchTerm('')
  }

  // Auto-generate property name
  const selectedLocation = dubaiAreas.find(area => area.id === formData.locationId)
  const locationName = selectedLocation ? selectedLocation.name : 'Unknown Location'
  const propertyName = `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} in ${locationName} ${formData.bedrooms.toString()} bedroom${formData.bedrooms !== 1 ? 's' : ''}`

  useEffect(() => {
    console.log('🔄 PropertyModal useEffect - isOpen:', isOpen, 'property:', property)
    if (isOpen) {
      // Load owners and PriceLabs listings when modal opens
      loadOwners()
      loadPricelabsListings()
      
      if (property) {
        // Editing existing property
        console.log('📝 Editing existing property, setting form data')
        setFormData({
          nickname: property.nickname || '',
          type: property.type || 'apartment',
          locationId: property.locationId || property.location || '',
          address: property.address || '',
          district: property.district || '',
          bedrooms: property.bedrooms || 1,
          selectedOwnerId: property.ownerId || property.selectedOwnerId || '',
          price_per_night: property.price_per_night || 100,
          status: property.status || 'active',
          pricelabId: property.pricelabId || '',
          isPublished: property.isPublished || property.is_published || false
        })
        
        // Set selected owner if ownerId exists
        if (property.ownerId || property.selectedOwnerId) {
          // We'll set the selected owner after owners are loaded
        }
      } else {
        // Creating new property - reset form
        console.log('🆕 Creating new property, resetting form')
        setFormData({
          nickname: '',
          type: 'apartment',
          locationId: '',
          address: '',
          district: '',
          bedrooms: 1,
          selectedOwnerId: '',
          price_per_night: 100,
          status: 'active',
          pricelabId: '',
          isPublished: false
        })
        setSelectedOwner(null)
        setSelectedPricelabsListing(null)
      }
    }
  }, [isOpen, property]) // Added isOpen to dependencies

  // Set selected owner when owners are loaded and property has ownerId
  useEffect(() => {
    if (owners && owners.length > 0 && property && (property.ownerId || property.selectedOwnerId)) {
      const ownerId = property.ownerId || property.selectedOwnerId
      const owner = owners.find(o => o.id === ownerId)
      if (owner) {
        setSelectedOwner(owner)
      }
    }
  }, [owners, property])

  // Set selected PriceLabs listing when listings are loaded and property has pricelabId
  useEffect(() => {
    if (pricelabsListings && pricelabsListings.length > 0 && property && property.pricelabId) {
      const listing = pricelabsListings.find(l => l.id === property.pricelabId)
      if (listing) {
        console.log('✅ Found matching PriceLabs listing:', listing.name)
        setSelectedPricelabsListing(listing)
      }
    }
  }, [pricelabsListings, property])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOwnerDropdownOpen) {
        const target = event.target as Element
        if (!target.closest('.owner-dropdown-container')) {
          setIsOwnerDropdownOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOwnerDropdownOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Owner selection is optional
    
    // Validation: price must be greater than 0
    if (!formData.price_per_night || formData.price_per_night <= 0) {
      showToast.error('Please enter a valid price per night (must be greater than 0).')
      return
    }
    
    // Validation: address is required
    if (!formData.address.trim()) {
      showToast.error('Please enter a valid address.')
      return
    }
    
    // Validation: location is required
    if (!formData.locationId) {
      showToast.error('Please select a location/area.')
      return
    }
    
    const loadingToast = showToast.loading(property ? 'Updating property...' : 'Creating property...')
    
    try {
      // Create final property data with generated name
      const finalPropertyData = {
        name: String(propertyName), // Ensure name is always a string
        nickname: formData.nickname || propertyName,
        type: formData.type.toUpperCase(), // Convert to uppercase for backend
        typeOfUnit: 'SINGLE' as const,
        address: formData.address,
        city: DEFAULT_PROPERTY_VALUES.city,
        country: DEFAULT_PROPERTY_VALUES.country,
        capacity: Number(DEFAULT_PROPERTY_VALUES.capacity),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(DEFAULT_PROPERTY_VALUES.bathrooms),
        area: Number(DEFAULT_PROPERTY_VALUES.area),
        pricePerNight: Number(formData.price_per_night),
        description: `Property in ${locationName}`,
        amenities: [],
        houseRules: [],
        tags: [],
        locationId: formData.locationId, // Send location ID instead of name
        ownerId: formData.selectedOwnerId, // Send single owner ID, not array
        pricelabId: formData.pricelabId || undefined, // Додали PriceLabs ID
        isActive: formData.status === 'active',
        isPublished: formData.isPublished
      }
      
      console.log('Property data:', finalPropertyData)
      console.log('Property name type:', typeof finalPropertyData.name, 'value:', finalPropertyData.name)
      console.log('Property bedrooms type:', typeof finalPropertyData.bedrooms, 'value:', finalPropertyData.bedrooms)
      console.log('Property locationId type:', typeof finalPropertyData.locationId, 'value:', finalPropertyData.locationId)
      console.log('Property ownerId type:', typeof finalPropertyData.ownerId, 'value:', finalPropertyData.ownerId)
      
      // Send to backend using V2 API
      const response = property 
        ? await propertyServiceAdapter.update(property.id, finalPropertyData)
        : await propertyServiceAdapter.create(finalPropertyData)
      
      if (response.success) {
        showToast.dismiss(loadingToast)
        const successMessage = property 
          ? `Property "${formData.nickname || propertyName}" updated successfully!`
          : `Property "${formData.nickname || propertyName}" created successfully!`
        
        showToast.success(successMessage)
        
        // Emit Event Bus events
        if (property) {
          // Updating existing property
          emitPropertyUpdated(property.id, response.data)
          console.log('📡 PropertyModal: Emitted property updated event for:', property.id)
        } else {
          // Creating new property
          emitPropertyCreated(response.data)
          console.log('📡 PropertyModal: Emitted property created event')
        }
        
        // Refresh the properties list (legacy callback)
        if (onPropertyCreated) {
          onPropertyCreated()
        }
        
        // Close modal
        onClose()
      } else {
        throw new Error(response.error || 'Failed to save property')
      }
    } catch (error: any) {
      console.error('Error saving property:', error)
      showToast.dismiss(loadingToast)
      showToast.error(error.message || 'An unexpected error occurred. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-900">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-900 flex items-center mb-4">
                  <Home size={20} className="mr-2 text-orange-500" />
                  Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Property Nickname
                    </label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter custom nickname (optional)"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty to use auto-generated name or enter custom nickname</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                        >
                          {propertyTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bedrooms <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Published Status */}
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-700">Published on Website</span>
                        <p className="text-xs text-slate-500">Check this to make the property visible to customers on the public website</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-900 flex items-center mb-4">
                  <MapPin size={20} className="mr-2 text-orange-500" />
                  Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location/Area <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.locationId}
                        onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                      >
                        <option value="">Select area</option>
                        {dubaiAreas.map(area => (
                          <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Full address (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Selection */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-900 flex items-center mb-4">
                  <User size={20} className="mr-2 text-orange-500" />
                  Owner Selection
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Owner
                    </label>
                    <div className="relative owner-dropdown-container">
                      <button
                        type="button"
                        onClick={() => setIsOwnerDropdownOpen(!isOwnerDropdownOpen)}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span className={selectedOwner ? 'text-slate-900' : 'text-gray-500'}>
                          {selectedOwner 
                            ? `${selectedOwner.firstName} ${selectedOwner.lastName} (${selectedOwner.email})`
                            : 'Select an owner...'
                          }
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOwnerDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isOwnerDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {ownersLoading ? (
                            <div className="px-3 py-2 text-sm text-gray-500">Loading owners...</div>
                          ) : !owners || owners.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">No owners found</div>
                          ) : (
                            owners.map((owner) => (
                              <button
                                key={owner.id}
                                type="button"
                                onClick={() => handleOwnerSelect(owner)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                              >
                                <div className="font-medium text-slate-900">
                                  {owner.firstName} {owner.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {owner.email} • {owner.phone || 'No phone'}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedOwner && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h4 className="font-medium text-slate-900 mb-2">Selected Owner Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{selectedOwner.firstName} {selectedOwner.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium">{selectedOwner.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 font-medium">{selectedOwner.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Nationality:</span>
                          <span className="ml-2 font-medium">{selectedOwner.nationality || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PriceLabs Integration */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                <h3 className="text-lg font-medium text-slate-900 flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  PriceLabs Integration
                  <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Optional</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Link to PriceLabs Listing
                    </label>
                    <p className="text-xs text-gray-600 mb-2">
                      Select a PriceLabs listing to enable automatic pricing updates
                    </p>
                    <div className="relative pricelabs-dropdown-container">
                      <button
                        type="button"
                        onClick={() => setIsPricelabsDropdownOpen(!isPricelabsDropdownOpen)}
                        disabled={pricelabsLoading}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className={selectedPricelabsListing ? 'text-slate-900' : 'text-gray-500'}>
                          {pricelabsLoading 
                            ? 'Loading listings...'
                            : selectedPricelabsListing 
                              ? `${selectedPricelabsListing.name} (${selectedPricelabsListing.city_name || 'Dubai'})`
                              : 'Select PriceLabs listing (optional)...'
                          }
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isPricelabsDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isPricelabsDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                          {/* Search input */}
                          <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                            <input
                              type="text"
                              value={pricelabsSearchTerm}
                              onChange={(e) => setPricelabsSearchTerm(e.target.value)}
                              placeholder="Search by name, city, or bedrooms..."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          
                          {/* Listings dropdown */}
                          <div className="overflow-y-auto max-h-80">
                            {pricelabsLoading ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Loading PriceLabs listings...</div>
                            ) : !pricelabsListings || pricelabsListings.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500">No PriceLabs listings found</div>
                            ) : (
                              (() => {
                                // Filter listings based on search term
                                const filteredListings = pricelabsListings.filter(listing => {
                                  const searchLower = pricelabsSearchTerm.toLowerCase()
                                  return (
                                    listing.name?.toLowerCase().includes(searchLower) ||
                                    listing.city_name?.toLowerCase().includes(searchLower) ||
                                    listing.no_of_bedrooms?.toString().includes(searchLower)
                                  )
                                })

                                if (filteredListings.length === 0) {
                                  return <div className="px-3 py-2 text-sm text-gray-500">No matching listings found</div>
                                }

                                return filteredListings.map((listing) => (
                                  <button
                                    key={listing.id}
                                    type="button"
                                    onClick={() => handlePricelabsListingSelect(listing)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 focus:bg-orange-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-medium text-slate-900">
                                      {listing.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
                                      <span>🏙️ {listing.city_name || 'Dubai'}</span>
                                      <span>🛏️ {listing.no_of_bedrooms || 0} bed{listing.no_of_bedrooms !== 1 ? 's' : ''}</span>
                                      {listing.base_price && <span>💰 {listing.base_price} AED</span>}
                                      {listing.push_enabled && <span className="text-green-600">✓ Syncing</span>}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                      ID: {listing.id}
                                    </div>
                                  </button>
                                ))
                              })()
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPricelabsListing && (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                        <span className="text-green-600 mr-2">✓</span>
                        Linked PriceLabs Listing
                      </h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{selectedPricelabsListing.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">City:</span>
                          <span className="ml-2 font-medium">{selectedPricelabsListing.city_name || 'Dubai'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bedrooms:</span>
                          <span className="ml-2 font-medium">{selectedPricelabsListing.no_of_bedrooms || 0}</span>
                        </div>
                        {selectedPricelabsListing.base_price && (
                          <div>
                            <span className="text-gray-600">Base Price:</span>
                            <span className="ml-2 font-medium">{selectedPricelabsListing.base_price} AED</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Sync Status:</span>
                          <span className={`ml-2 font-medium ${selectedPricelabsListing.push_enabled ? 'text-green-600' : 'text-gray-500'}`}>
                            {selectedPricelabsListing.push_enabled ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">ID:</span>
                          <span className="ml-2 font-mono text-xs">{selectedPricelabsListing.id}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Status */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-slate-900 flex items-center mb-4">
                  <DollarSign size={20} className="mr-2 text-orange-500" />
                  Pricing & Status
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price per Night (AED)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.price_per_night}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: parseInt(e.target.value) || 1 }))}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center font-medium cursor-pointer"
            >
              <Save size={16} className="mr-2" />
              {property ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}