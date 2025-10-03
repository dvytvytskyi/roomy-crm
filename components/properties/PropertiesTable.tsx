'use client'

import { useState, useEffect } from 'react'
import { Trash2, Home, Building, ChevronUp, ChevronDown } from 'lucide-react'

interface PropertiesTableProps {
  searchTerm: string
  onDeleteProperty: (property: any) => void
  selectedProperties: (string | number)[]
  onSelectionChange: (selected: (string | number)[]) => void
  properties?: any[]
  isLoading?: boolean
  filters?: {
    propertyTypes: string[]
    areas: string[]
    occupancyRates: string[]
    maxGuests: string[]
    bedrooms: string[]
  }
}

// PropertiesTable now uses real API data passed as props
// Removed mock data for production readiness

export default function PropertiesTable({ searchTerm, onDeleteProperty, selectedProperties, onSelectionChange, properties = [], isLoading, filters }: PropertiesTableProps) {
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hoveredRow, setHoveredRow] = useState<string | number | null>(null)

  // Reset hover state when properties change (e.g., after deletion)
  useEffect(() => {
    setHoveredRow(null)
  }, [properties])

  // Debug logging for props
  console.log('🔧 PropertiesTable render - isLoading:', isLoading, 'properties:', properties?.length)

  // Use real properties data passed as props
  const dataSource = properties || []
  console.log('📊 PropertiesTable - dataSource length:', dataSource.length)

  // Helper function to clean text from encoding issues
  const cleanText = (text: string) => {
    if (!text || typeof text !== 'string') return text
    
    return text
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '') // Remove non-printable chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  // Helper functions to handle real API data formats
  const getPropertyName = (property: any) => {
    // Get the best available name field
    const name = property.nickname || property.name || property.title || property.propertyName
    
    // Clean up the name if it has encoding issues
    if (name && typeof name === 'string') {
      const cleanName = cleanText(name)
      
      // If the cleaned name is significantly different, use it
      if (cleanName.length > 0 && cleanName !== name) {
        console.log('🏷️ Cleaned property name:', { original: name, cleaned: cleanName })
        return cleanName
      }
    }
    
    return name || 'Unnamed Property'
  }
  
  const getPropertyType = (property: any) => {
    return property.type || property.property_type || property.propertyType || 'Unknown'
  }

  const getBedrooms = (property: any) => {
    return property.bedrooms || property.bedroom || property.numberOfBedrooms || 0
  }

  const getMaxGuests = (property: any) => {
    return property.capacity || property.max_guests || property.maxGuests || property.guestCapacity || 0
  }

  const getPrice = (property: any) => {
    return property.pricePerNight || property.base_price || property.basePrice || property.price || 0
  }

  const getStatus = (property: any) => {
    return property.status || (property.is_active !== undefined ? (property.is_active ? 'Active' : 'Inactive') : 'Unknown')
  }

  const getOwnerName = (property: any) => {
    if (property.owner) {
      if (typeof property.owner === 'string') {
        return property.owner
      }
      return property.owner.name || property.owner.firstName + ' ' + property.owner.lastName || 'Unknown Owner'
    }
    return 'No Owner'
  }
  
  const filteredProperties = dataSource.filter(property => {
    if (!property) return false
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const name = getPropertyName(property).toLowerCase()
      const address = (property.address || '').toLowerCase()
      const city = (property.city || '').toLowerCase()
      const ownerName = getOwnerName(property).toLowerCase()
      
      if (!name.includes(searchLower) && 
          !address.includes(searchLower) && 
          !city.includes(searchLower) &&
          !ownerName.includes(searchLower)) {
        return false
      }
    }
    
    // Property type filter
    if (filters?.propertyTypes && filters.propertyTypes.length > 0) {
      const propertyType = getPropertyType(property).toLowerCase()
      if (!filters.propertyTypes.some(filter => filter.toLowerCase() === propertyType)) {
        return false
    }
    }
    
    // Bedrooms filter
    if (filters?.bedrooms && filters.bedrooms.length > 0) {
      const bedrooms = getBedrooms(property)
      const bedroomMatch = filters.bedrooms.some(filter => {
        switch (filter) {
          case '0': return bedrooms === 0
          case '1': return bedrooms === 1
          case '2': return bedrooms === 2
          case '3': return bedrooms === 3
          case '4+': return bedrooms >= 4
          default: return false
        }
      })
      if (!bedroomMatch) return false
    }
    
    // Max guests filter
    if (filters?.maxGuests && filters.maxGuests.length > 0) {
      const maxGuests = getMaxGuests(property)
      const guestMatch = filters.maxGuests.some(filter => {
        switch (filter) {
          case '1-2': return maxGuests >= 1 && maxGuests <= 2
          case '3-4': return maxGuests >= 3 && maxGuests <= 4
          case '5-6': return maxGuests >= 5 && maxGuests <= 6
          case '7+': return maxGuests >= 7
          default: return false
        }
      })
      if (!guestMatch) return false
    }
    
    // Occupancy rate filter (if available)
    if (filters?.occupancyRates && filters.occupancyRates.length > 0 && property.occupancy_rate) {
      const occupancyRate = property.occupancy_rate
      const occupancyMatch = filters.occupancyRates.some(filter => {
        switch (filter) {
          case 'high': return occupancyRate >= 80
          case 'medium': return occupancyRate >= 50 && occupancyRate < 80
          case 'low': return occupancyRate < 50
          default: return false
        }
      })
      if (!occupancyMatch) return false
    }
    
    return true
  })

  const sortedProperties = filteredProperties.sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    
    if ((aValue || '') < (bValue || '')) return sortDirection === 'asc' ? -1 : 1
    if ((aValue || '') > (bValue || '')) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  const handleSelectProperty = (property: any, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedProperties, property.id]
      : selectedProperties.filter(id => id !== property.id)
    
    onSelectionChange(newSelection)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = sortedProperties.map(property => property.id)
      onSelectionChange(allIds)
    } else {
      onSelectionChange([])
    }
  }

  const allSelected = sortedProperties.length > 0 && sortedProperties.every(property => selectedProperties.includes(property.id))
  const someSelected = selectedProperties.length > 0 && !allSelected

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading properties...</span>
        </div>
      </div>
    )
  }

  if (dataSource.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new property.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
            </th>
            <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center space-x-1">
                <span>Property</span>
                {getSortIcon('name')}
              </div>
            </th>
            <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
            >
              <div className="flex items-center space-x-1">
                <span>Type</span>
                  {getSortIcon('type')}
              </div>
            </th>
            <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('bedrooms')}
            >
              <div className="flex items-center space-x-1">
                <span>Bedrooms</span>
                {getSortIcon('bedrooms')}
              </div>
            </th>
            <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('capacity')}
            >
              <div className="flex items-center space-x-1">
                <span>Max Guests</span>
                  {getSortIcon('capacity')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pricePerNight')}
              >
                <div className="flex items-center space-x-1">
                  <span>Price/Night</span>
                  {getSortIcon('pricePerNight')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
              </div>
            </th>
            <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('owner')}
            >
              <div className="flex items-center space-x-1">
                  <span>Owner</span>
                  {getSortIcon('owner')}
              </div>
            </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedProperties.map((property) => (
            <tr 
              key={property.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  selectedProperties.includes(property.id) ? 'bg-orange-50' : ''
                }`}
              onMouseEnter={() => setHoveredRow(property.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(property.id)}
                    onChange={(e) => handleSelectProperty(property, e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        {getPropertyType(property) === 'villa' ? (
                          <Home className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Building className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                  </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                      {getPropertyName(property)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.address || 'No address'}
                      </div>
                    </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {getPropertyType(property)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getBedrooms(property)}
              </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getMaxGuests(property)}
              </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  AED {getPrice(property).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatus(property) === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatus(property)}
                  </span>
              </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getOwnerName(property)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className={`flex items-center space-x-2 transition-opacity ${hoveredRow === property.id ? 'opacity-100' : 'opacity-70'}`}>
                  <button
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Property"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this property?')) {
                          onDeleteProperty(property)
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      {filteredProperties.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}