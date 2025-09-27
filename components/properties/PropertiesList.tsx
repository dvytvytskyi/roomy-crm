'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye, MoreVertical, Home, Users, Star, MapPin, DollarSign } from 'lucide-react'

interface PropertiesListProps {
  searchTerm: string
  onEditProperty: (property: any) => void
}

// Mock data for properties
const mockProperties = [
  {
    id: 1,
    name: 'Apartment Burj Khalifa 1',
    type: 'apartment',
    address: 'Burj Khalifa, Downtown Dubai',
    city: 'Dubai',
    area: 'Downtown',
    units: 1,
    total_guests: 2,
    base_price: 150,
    is_active: true,
    description: 'Luxury apartment with stunning views of Burj Khalifa',
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
    owner: 'Ahmed Al Mansouri',
    occupancy_rate: 85,
    last_booking: '2024-08-15'
  },
  {
    id: 2,
    name: 'Villa Dubai Marina 1',
    type: 'villa',
    address: 'Dubai Marina, Dubai',
    city: 'Dubai',
    area: 'Dubai Marina',
    units: 1,
    total_guests: 6,
    base_price: 300,
    is_active: true,
    description: 'Spacious villa with private pool and marina views',
    amenities: ['Private Pool', 'Garden', 'BBQ', 'WiFi'],
    owner: 'Sarah Johnson',
    occupancy_rate: 92,
    last_booking: '2024-08-20'
  },
  {
    id: 3,
    name: 'Apartment Downtown 1',
    type: 'apartment',
    address: 'Downtown Dubai',
    city: 'Dubai',
    area: 'Downtown',
    units: 1,
    total_guests: 2,
    base_price: 120,
    is_active: false,
    description: 'Comfortable apartment in the heart of Downtown',
    amenities: ['WiFi', 'Gym'],
    owner: 'Mohammed Ali',
    occupancy_rate: 45,
    last_booking: '2024-07-10'
  },
  {
    id: 4,
    name: 'Villa Palm Jumeirah 1',
    type: 'villa',
    address: 'Palm Jumeirah, Dubai',
    city: 'Dubai',
    area: 'Palm Jumeirah',
    units: 1,
    total_guests: 8,
    base_price: 500,
    is_active: true,
    description: 'Exclusive beachfront villa on Palm Jumeirah',
    amenities: ['Private Beach', 'Infinity Pool', 'Chef', 'Butler'],
    owner: 'Sheikh Khalid',
    occupancy_rate: 78,
    last_booking: '2024-08-18'
  }
]

export default function PropertiesList({ searchTerm, onEditProperty }: PropertiesListProps) {
  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  const filteredProperties = mockProperties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment':
        return <Home size={16} />
      case 'villa':
        return <Home size={16} />
      default:
        return <Home size={16} />
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
    ) : (
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Inactive</span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{mockProperties.length}</p>
            </div>
            <Home className="text-primary-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Properties</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockProperties.filter(p => p.is_active).length}
              </p>
            </div>
            <Users className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Occupancy</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(mockProperties.reduce((acc, p) => acc + p.occupancy_rate, 0) / mockProperties.length)}%
              </p>
            </div>
            <Star className="text-yellow-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bedrooms</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Property Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <Home size={48} className="text-primary-500" />
            </div>
            
            {/* Property Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={14} className="mr-1" />
                    {property.address}
                  </div>
                  {getStatusBadge(property.is_active)}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setSelectedProperty(selectedProperty?.id === property.id ? null : property)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {selectedProperty?.id === property.id && (
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => onEditProperty(property)}
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => {/* View details */}}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                      <button
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {/* Delete property */}}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Property Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{property.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{property.total_guests}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">${property.base_price}/night</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Occupancy:</span>
                  <span className="font-medium">{property.occupancy_rate}%</span>
                </div>
              </div>
              
              
              {/* Owner */}
              <div className="text-sm text-gray-600">
                Owner: <span className="font-medium">{property.owner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
