'use client'

import { useState, useEffect } from 'react'
import { X, Save, Home, MapPin, User, DollarSign, ChevronDown } from 'lucide-react'
import { propertyService } from '../../lib/api'
import { ownerService, Owner } from '../../lib/api/services/ownerService'
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
  const [formData, setFormData] = useState({
    nickname: '',
    type: 'apartment' as PropertyType,
    location: '' as DubaiArea | '',
    address: '',
    bedrooms: 1,
    selectedOwnerId: '',
    price_per_night: DEFAULT_PROPERTY_VALUES.pricePerNight,
    status: 'active' as PropertyStatus
  })

  // Owner selection states
  const [owners, setOwners] = useState<Owner[]>([])
  const [ownersLoading, setOwnersLoading] = useState(false)
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)

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
      const response = await ownerService.getOwners({ limit: 100 })
      if (response.success && response.data && response.data.owners) {
        setOwners(response.data.owners)
      } else {
        setOwners([])
      }
    } catch (error) {
      console.error('Error loading owners:', error)
      onShowToast?.('Failed to load owners list')
      setOwners([])
    } finally {
      setOwnersLoading(false)
    }
  }

  // Handle owner selection
  const handleOwnerSelect = (owner: Owner) => {
    setSelectedOwner(owner)
    setFormData(prev => ({ ...prev, selectedOwnerId: owner.id }))
    setIsOwnerDropdownOpen(false)
  }

  // Auto-generate property name
  const propertyName = `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} in ${formData.location} ${formData.bedrooms} bedroom${formData.bedrooms !== 1 ? 's' : ''}`

  useEffect(() => {
    console.log('🔄 PropertyModal useEffect - isOpen:', isOpen, 'property:', property)
    if (isOpen) {
      // Load owners when modal opens
      loadOwners()
      
      if (property) {
        // Editing existing property
        console.log('📝 Editing existing property, setting form data')
        setFormData({
          nickname: property.nickname || '',
          type: property.type || 'apartment',
          location: property.location || '',
          address: property.address || '',
          bedrooms: property.bedrooms || 1,
          selectedOwnerId: property.ownerId || property.selectedOwnerId || '',
          price_per_night: property.price_per_night || 100,
          status: property.status || 'active'
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
          location: '',
          address: '',
          bedrooms: 1,
          selectedOwnerId: '',
          price_per_night: 100,
          status: 'active'
        })
        setSelectedOwner(null)
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
    
    // Validation: owner must be selected
    if (!formData.selectedOwnerId) {
      alert('Please select an owner for this property.')
      return
    }
    
    // Validation: price must be greater than 0
    if (!formData.price_per_night || formData.price_per_night <= 0) {
      alert('Please enter a valid price per night (must be greater than 0).')
      return
    }
    
    // Validation: address is required
    if (!formData.address.trim()) {
      alert('Please enter a valid address.')
      return
    }
    
    try {
      // Create final property data with generated name
      const finalPropertyData = {
        name: propertyName, // Auto-generated name
        nickname: formData.nickname || propertyName,
        type: formData.type.toUpperCase(), // Convert to uppercase for backend
        location: formData.location,
        address: formData.address,
        city: DEFAULT_PROPERTY_VALUES.city,
        country: DEFAULT_PROPERTY_VALUES.country,
        capacity: DEFAULT_PROPERTY_VALUES.capacity,
        bedrooms: formData.bedrooms,
        bathrooms: DEFAULT_PROPERTY_VALUES.bathrooms,
        area: DEFAULT_PROPERTY_VALUES.area,
        pricePerNight: formData.price_per_night,
        description: `Property in ${formData.location}`,
        amenities: [],
        ownerId: formData.selectedOwnerId,
        owner_name: selectedOwner?.firstName + ' ' + selectedOwner?.lastName,
        owner_email: selectedOwner?.email,
        owner_phone: selectedOwner?.phone,
        status: formData.status
        // Remove houseRules field entirely - backend will use default
      }
      
      console.log('Property data:', finalPropertyData)
      
      // Send to backend
      const response = await propertyService.createProperty(finalPropertyData)
      
      if (response.success) {
        // Show success message
        const successMessage = property 
          ? `Property "${formData.nickname || propertyName}" updated successfully!`
          : `Property "${formData.nickname || propertyName}" created successfully!`
        
        // Show toast notification
        if (onShowToast) {
          onShowToast(successMessage)
        }
        
        // Refresh the properties list
        if (onPropertyCreated) {
          onPropertyCreated()
        }
        
        // Reset form for next use
        setFormData({
          nickname: '',
          type: 'apartment',
          location: '',
          address: '',
          bedrooms: 1,
          owner_name: '',
          owner_email: '',
          owner_phone: '',
          price_per_night: 100,
          status: 'active'
        })
        
        // Close modal
        onClose()
      } else {
        // Show error message
        if (onShowToast) {
          onShowToast(`Error: ${response.error?.message || 'Failed to create property'}`)
        }
      }
    } catch (error) {
      console.error('Error creating property:', error)
      if (onShowToast) {
        onShowToast(`Error: ${error instanceof Error ? error.message : 'Failed to create property'}`)
      }
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
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                      >
                        <option value="">Select area</option>
                        {dubaiAreas.map(area => (
                          <option key={area} value={area}>{area}</option>
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
                      Select Owner <span className="text-red-500">*</span>
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