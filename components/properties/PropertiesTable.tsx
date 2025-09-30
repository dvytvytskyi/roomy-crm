'use client'

import { useState } from 'react'
import { Edit, Trash2, Home, Building, ChevronUp, ChevronDown } from 'lucide-react'

interface PropertiesTableProps {
  searchTerm: string
  onEditProperty: (property: any) => void
  selectedProperties: number[]
  onSelectionChange: (selected: number[]) => void
  properties?: any[]
  isLoading?: boolean
}

// Mock data for properties
const mockProperties = [
  {
    id: 1,
    name: 'Apartment in Downtown Dubai 1 bedroom',
    nickname: 'Luxury Downtown Apt',
    area: 'Downtown',
    property_type: 'apartment',
    bedrooms: 1,
    max_guests: 2,
    address: 'Burj Khalifa, Downtown Dubai',
    city: 'Dubai',
    base_price: 550,
    is_active: true,
    status: 'active',
    description: 'Luxury apartment with stunning views of Burj Khalifa',
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
    owner: {
      name: 'Ahmed Al Mansouri',
      flag: '🇦🇪',
      country: 'United Arab Emirates',
      email: 'ahmed@example.com',
      phone: '+971 50 123 4567',
      status: 'active'
    },
    occupancy_rate: 85,
    last_booking: '2024-08-15',
    revenue: 12500,
    bathrooms: 1,
    parking_slots: 1,
    unit_intake_date: '2024-01-15',
    dtcm_license_expiry: '2025-01-15',
    rules: ['No smoking', 'No pets', 'No parties'],
    quiet_hours: '22:00 - 08:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: false,
      bayut: false
    }
  },
  {
    id: 2,
    name: 'Studio in Dubai Marina 0 bedrooms',
    nickname: 'Marina View Studio',
    area: 'Dubai Marina',
    property_type: 'studio',
    bedrooms: 0,
    max_guests: 2,
    address: 'Dubai Marina, Dubai',
    city: 'Dubai',
    base_price: 440,
    is_active: true,
    status: 'active',
    description: 'Modern studio with marina views',
    amenities: ['WiFi', 'Pool', 'Gym'],
    owner: {
      name: 'Sarah Johnson',
      flag: '🇺🇸',
      country: 'United States',
      email: 'sarah@example.com',
      phone: '+1 555 123 4567',
      status: 'active'
    },
    occupancy_rate: 92,
    last_booking: '2024-08-20',
    revenue: 8800,
    bathrooms: 1,
    parking_slots: 0,
    unit_intake_date: '2024-02-01',
    dtcm_license_expiry: '2025-02-01',
    rules: ['No smoking', 'No pets'],
    quiet_hours: '23:00 - 07:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: true,
      bayut: false
    }
  },
  {
    id: 3,
    name: 'Palm Villa 3BR',
    area: 'Palm Jumeirah',
    property_type: 'villa',
    bedrooms: 3,
    max_guests: 6,
    address: 'Palm Jumeirah, Dubai',
    city: 'Dubai',
    base_price: 1100,
    is_active: true,
    status: 'active',
    description: 'Luxury villa on Palm Jumeirah',
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Beach Access'],
    owner: {
      name: 'Mohammed Al Rashid',
      flag: '🇦🇪',
      country: 'United Arab Emirates',
      email: 'mohammed@example.com',
      phone: '+971 50 987 6543',
      status: 'active'
    },
    occupancy_rate: 78,
    last_booking: '2024-08-10',
    revenue: 18500,
    bathrooms: 3,
    parking_slots: 2,
    unit_intake_date: '2024-01-01',
    dtcm_license_expiry: '2025-01-01',
    rules: ['No smoking', 'No pets', 'No parties'],
    quiet_hours: '22:00 - 08:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: true,
      bayut: true
    }
  },
  {
    id: 4,
    name: 'Downtown Loft 2BR',
    area: 'Downtown',
    property_type: 'apartment',
    bedrooms: 2,
    max_guests: 4,
    address: 'Downtown Dubai, Dubai',
    city: 'Dubai',
    base_price: 735,
    is_active: true,
    status: 'active',
    description: 'Modern loft in downtown',
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
    owner: {
      name: 'Emma Wilson',
      flag: '🇬🇧',
      country: 'United Kingdom',
      email: 'emma@example.com',
      phone: '+44 20 1234 5678',
      status: 'active'
    },
    occupancy_rate: 88,
    last_booking: '2024-08-18',
    revenue: 15200,
    bathrooms: 2,
    parking_slots: 1,
    unit_intake_date: '2024-03-15',
    dtcm_license_expiry: '2025-03-15',
    rules: ['No smoking', 'No pets'],
    quiet_hours: '22:00 - 08:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: false,
      bayut: false
    }
  },
  {
    id: 5,
    name: 'JBR Beach Apartment',
    area: 'JBR',
    property_type: 'apartment',
    bedrooms: 2,
    max_guests: 4,
    address: 'JBR, Dubai',
    city: 'Dubai',
    base_price: 660,
    is_active: true,
    status: 'active',
    description: 'Beachfront apartment in JBR',
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Beach Access'],
    owner: {
      name: 'David Chen',
      flag: '🇨🇳',
      country: 'China',
      email: 'david@example.com',
      phone: '+86 138 0013 8000',
      status: 'active'
    },
    occupancy_rate: 95,
    last_booking: '2024-08-22',
    revenue: 16800,
    bathrooms: 2,
    parking_slots: 1,
    unit_intake_date: '2024-02-20',
    dtcm_license_expiry: '2025-02-20',
    rules: ['No smoking', 'No pets', 'No parties'],
    quiet_hours: '22:00 - 08:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: true,
      bayut: true
    }
  },
  {
    id: 6,
    name: 'Business Bay Office',
    area: 'Business Bay',
    property_type: 'office',
    bedrooms: 0,
    max_guests: 8,
    address: 'Business Bay, Dubai',
    city: 'Dubai',
    base_price: 920,
    is_active: true,
    status: 'active',
    description: 'Modern office space in Business Bay',
    amenities: ['WiFi', 'Parking', 'Meeting Rooms'],
    owner: {
      name: 'Lisa Anderson',
      flag: '🇺🇸',
      country: 'United States',
      email: 'lisa@example.com',
      phone: '+1 555 987 6543',
      status: 'active'
    },
    occupancy_rate: 70,
    last_booking: '2024-08-12',
    revenue: 11200,
    bathrooms: 2,
    parking_slots: 2,
    unit_intake_date: '2024-04-01',
    dtcm_license_expiry: '2025-04-01',
    rules: ['No smoking', 'Business use only'],
    quiet_hours: '18:00 - 08:00',
    platforms: {
      airbnb: false,
      booking: true,
      property_finder: true,
      bayut: false
    }
  },
  {
    id: 7,
    name: 'DIFC Penthouse',
    area: 'DIFC',
    property_type: 'penthouse',
    bedrooms: 3,
    max_guests: 6,
    address: 'DIFC, Dubai',
    city: 'Dubai',
    base_price: 1470,
    is_active: true,
    status: 'active',
    description: 'Luxury penthouse in DIFC',
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Concierge'],
    owner: {
      name: 'James Thompson',
      flag: '🇬🇧',
      country: 'United Kingdom',
      email: 'james@example.com',
      phone: '+44 20 9876 5432',
      status: 'active'
    },
    occupancy_rate: 82,
    last_booking: '2024-08-25',
    revenue: 22500,
    bathrooms: 3,
    parking_slots: 2,
    unit_intake_date: '2024-01-10',
    dtcm_license_expiry: '2025-01-10',
    rules: ['No smoking', 'No pets', 'No parties'],
    quiet_hours: '22:00 - 08:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: true,
      bayut: true
    }
  },
  {
    id: 8,
    name: 'JLT Studio',
    area: 'JLT',
    property_type: 'studio',
    bedrooms: 0,
    max_guests: 2,
    address: 'JLT, Dubai',
    city: 'Dubai',
    base_price: 405,
    is_active: true,
    status: 'active',
    description: 'Compact studio in JLT',
    amenities: ['WiFi', 'Pool', 'Gym'],
    owner: {
      name: 'Anna Kowalski',
      flag: '🇵🇱',
      country: 'Poland',
      email: 'anna@example.com',
      phone: '+48 123 456 789',
      status: 'active'
    },
    occupancy_rate: 90,
    last_booking: '2024-08-19',
    revenue: 8900,
    bathrooms: 1,
    parking_slots: 0,
    unit_intake_date: '2024-03-01',
    dtcm_license_expiry: '2025-03-01',
    rules: ['No smoking', 'No pets'],
    quiet_hours: '23:00 - 07:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: false,
      bayut: false
    }
  },
  {
    id: 9,
    name: 'Arabian Ranches Villa',
    area: 'Arabian Ranches',
    property_type: 'villa',
    bedrooms: 4,
    max_guests: 8,
    address: 'Arabian Ranches, Dubai',
    city: 'Dubai',
    base_price: 350,
    is_active: true,
    status: 'active',
    description: 'Spacious villa in Arabian Ranches',
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Garden'],
    owner: {
      name: 'Ahmed Hassan',
      flag: '🇦🇪',
      country: 'United Arab Emirates',
      email: 'ahmed.hassan@example.com',
      phone: '+971 50 555 1234',
      status: 'active'
    },
    occupancy_rate: 75,
    last_booking: '2024-08-14',
    revenue: 19800,
    bathrooms: 4,
    parking_slots: 3,
    unit_intake_date: '2024-01-20',
    dtcm_license_expiry: '2025-01-20',
    rules: ['No smoking', 'No pets', 'No parties'],
    quiet_hours: '22:00 - 08:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: true,
      bayut: true
    }
  },
  {
    id: 10,
    name: 'Dubai Hills Apartment',
    area: 'Dubai Hills',
    property_type: 'apartment',
    bedrooms: 2,
    max_guests: 4,
    address: 'Dubai Hills, Dubai',
    city: 'Dubai',
    base_price: 160,
    is_active: true,
    status: 'active',
    description: 'Modern apartment in Dubai Hills',
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
    owner: {
      name: 'Maria Rodriguez',
      flag: '🇪🇸',
      country: 'Spain',
      email: 'maria@example.com',
      phone: '+34 123 456 789',
      status: 'active'
    },
    occupancy_rate: 87,
    last_booking: '2024-08-21',
    revenue: 13400,
    bathrooms: 2,
    parking_slots: 1,
    unit_intake_date: '2024-02-15',
    dtcm_license_expiry: '2025-02-15',
    rules: ['No smoking', 'No pets'],
    quiet_hours: '22:00 - 08:00',
    platforms: {
      airbnb: true,
      booking: true,
      property_finder: true,
      bayut: false
    }
  }
]

export default function PropertiesTable({ searchTerm, onEditProperty, selectedProperties, onSelectionChange, properties, isLoading }: PropertiesTableProps) {
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  // Use real properties if provided, otherwise fall back to mock data
  const dataSource = properties || mockProperties
  console.log('📊 PropertiesTable - dataSource:', dataSource)
  console.log('📊 PropertiesTable - properties prop:', properties)
  console.log('📊 PropertiesTable - isLoading:', isLoading)

  // Helper functions to handle both mock and real data formats
  const getPropertyName = (property: any) => property.nickname || property.name || 'Unnamed Property'
  const getPropertyArea = (property: any) => property.area || property.city || 'Unknown'
  const getPropertyType = (property: any) => property.property_type || property.type || 'Unknown'
  const getPropertyBedrooms = (property: any) => property.bedrooms || 0
  const getPropertyMaxGuests = (property: any) => property.max_guests || property.capacity || 0
  const getPropertyPrice = (property: any) => property.base_price || property.pricePerNight || 0
  const getPropertyAddress = (property: any) => property.address || 'No address'
  
  const filteredProperties = dataSource.filter(property => {
    // Handle both mock data format and real API format
    const name = property.name || property.nickname || ''
    const area = property.area || property.city || ''
    const type = property.property_type || property.type || ''
    const price = property.base_price || property.pricePerNight || 0
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.toString().includes(searchTerm)
    
    return matchesSearch
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

  const handleSelectProperty = (propertyId: number) => {
    onSelectionChange(
      selectedProperties.includes(propertyId)
        ? selectedProperties.filter(id => id !== propertyId)
        : [...selectedProperties, propertyId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProperties.length === sortedProperties.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(sortedProperties.map(p => p.id))
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp size={14} className="text-gray-300" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="text-orange-600" />
      : <ChevronDown size={14} className="text-orange-600" />
  }

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'apartment':
        return <Building size={16} className="text-gray-500" />
      case 'villa':
        return <Home size={16} className="text-gray-500" />
      case 'studio':
        return <Building size={16} className="text-gray-500" />
      case 'office':
        return <Building size={16} className="text-gray-500" />
      case 'penthouse':
        return <Home size={16} className="text-gray-500" />
      default:
        return <Home size={16} className="text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedProperties.length === sortedProperties.length && sortedProperties.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center space-x-1">
                <span>Property</span>
                {getSortIcon('name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('area')}
            >
              <div className="flex items-center space-x-1">
                <span>Area</span>
                {getSortIcon('area')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('property_type')}
            >
              <div className="flex items-center space-x-1">
                <span>Type</span>
                {getSortIcon('property_type')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('bedrooms')}
            >
              <div className="flex items-center space-x-1">
                <span>Bedrooms</span>
                {getSortIcon('bedrooms')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('max_guests')}
            >
              <div className="flex items-center space-x-1">
                <span>Max Guests</span>
                {getSortIcon('max_guests')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('base_price')}
            >
              <div className="flex items-center space-x-1">
                <span>Price (AED)</span>
                {getSortIcon('base_price')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedProperties.map((property) => (
            <tr 
              key={property.id} 
              className={`hover:bg-gray-50 transition-colors ${hoveredRow === property.id ? 'bg-orange-50' : ''}`}
              onMouseEnter={() => setHoveredRow(property.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(property.id)}
                  onChange={() => handleSelectProperty(property.id)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getPropertyIcon(getPropertyType(property))}
                  </div>
                  <div>
                    <button
                      onClick={() => window.location.href = `/properties/${property.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline cursor-pointer text-left"
                    >
                      {getPropertyName(property)}
                    </button>
                    <div className="text-sm text-slate-500">{getPropertyAddress(property)}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{getPropertyArea(property)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900 capitalize">{getPropertyType(property)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{getPropertyBedrooms(property)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{getPropertyMaxGuests(property)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900 font-medium">AED {getPropertyPrice(property)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className={`flex items-center space-x-2 transition-opacity ${hoveredRow === property.id ? 'opacity-100' : 'opacity-70'}`}>
                  <button
                    onClick={() => onEditProperty(property)}
                    className="text-slate-400 hover:text-orange-600 transition-colors"
                    title="Edit Property"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete Property"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this property?')) {
                        console.log('Deleting property:', property.id)
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
  )
}