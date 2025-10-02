'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, Star, Crown, User, Phone, Mail, Calendar, MapPin, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react'
import { Guest } from '@/lib/api/services/guestService'

interface GuestsTableProps {
  searchTerm: string
  onEditGuest: (guest: any) => void
  selectedGuests: string[]
  onSelectionChange: (selected: string[]) => void
  guests?: Guest[]
  isLoading?: boolean
}

export default function GuestsTable({ searchTerm, onEditGuest, selectedGuests, onSelectionChange, guests, isLoading }: GuestsTableProps) {
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Use real guests from API
  const dataSource = guests || []
  console.log('👥 GuestsTable - dataSource length:', dataSource.length)

  // Mock data removed - using real API data
  const mockGuests_OLD = [
    {
      id: 1,
      name: 'John Smith',
      nationality: 'American',
      dateOfBirth: '1985-03-15',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      whatsapp: '+1 (555) 123-4567',
      telegram: '@johnsmith',
      reservationCount: 5,
      unit: 'Apartment Burj Khalifa 1A',
      comments: 'VIP guest, prefers high floors',
      customCategories: ['Star Guest', 'VIP'],
      starGuest: true,
      primaryGuest: true,
      loyaltyTier: 'Gold',
      preferredLanguage: 'English',
      specialRequests: 'Ground floor units preferred',
      documents: ['passport.pdf', 'visa.pdf'],
      createdBy: 'Admin',
      createdAt: '2024-01-15T10:30:00Z',
      lastModifiedBy: 'Manager',
      lastModifiedAt: '2024-07-20T14:20:00Z'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      nationality: 'Spanish',
      dateOfBirth: '1990-07-22',
      email: 'maria.garcia@example.com',
      phone: '+34 612 345 678',
      whatsapp: '+34 612 345 678',
      telegram: '@mariag',
      reservationCount: 3,
      unit: 'Apartment Marina 2B',
      comments: 'Family with children, needs baby crib',
      customCategories: ['Family Guest'],
      starGuest: false,
      primaryGuest: true,
      loyaltyTier: 'Silver',
      preferredLanguage: 'Spanish',
      specialRequests: 'Baby crib and high chair needed',
      documents: ['passport.pdf'],
      createdBy: 'Admin',
      createdAt: '2024-02-10T09:15:00Z',
      lastModifiedBy: 'Admin',
      lastModifiedAt: '2024-06-15T11:45:00Z'
    },
    {
      id: 3,
      name: 'Ahmed Hassan',
      nationality: 'Egyptian',
      dateOfBirth: '1988-12-03',
      email: 'ahmed.hassan@example.com',
      phone: '+20 123 456 7890',
      whatsapp: '+20 123 456 7890',
      telegram: '',
      reservationCount: 1,
      unit: 'Studio Downtown 3C',
      comments: 'Business traveler, needs quiet room',
      customCategories: ['Business Guest'],
      starGuest: false,
      primaryGuest: false,
      loyaltyTier: 'Bronze',
      preferredLanguage: 'Arabic',
      specialRequests: 'Quiet room, late checkout',
      documents: ['passport.pdf', 'business_visa.pdf'],
      createdBy: 'Manager',
      createdAt: '2024-03-05T16:20:00Z',
      lastModifiedBy: 'Manager',
      lastModifiedAt: '2024-03-05T16:20:00Z'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      nationality: 'British',
      dateOfBirth: '1992-05-18',
      email: 'sarah.johnson@example.com',
      phone: '+44 7700 900123',
      whatsapp: '+44 7700 900123',
      telegram: '@sarahj',
      reservationCount: 8,
      unit: 'Penthouse Skyline 5A',
      comments: 'Loyalty program member, frequent visitor',
      customCategories: ['Star Guest', 'Loyalty Program'],
      starGuest: true,
      primaryGuest: true,
      loyaltyTier: 'Platinum',
      preferredLanguage: 'English',
      specialRequests: 'City view preferred, early check-in',
      documents: ['passport.pdf', 'loyalty_card.pdf'],
      createdBy: 'Admin',
      createdAt: '2023-11-20T08:30:00Z',
      lastModifiedBy: 'Admin',
      lastModifiedAt: '2024-08-10T12:15:00Z'
    },
    {
      id: 5,
      name: 'Chen Wei',
      nationality: 'Chinese',
      dateOfBirth: '1987-09-12',
      email: 'chen.wei@example.com',
      phone: '+86 138 0013 8000',
      whatsapp: '+86 138 0013 8000',
      telegram: '@chenwei',
      reservationCount: 2,
      unit: 'Apartment Business 4D',
      comments: 'Corporate booking, group leader',
      customCategories: ['Corporate Guest'],
      starGuest: false,
      primaryGuest: true,
      loyaltyTier: 'Silver',
      preferredLanguage: 'Chinese',
      specialRequests: 'Meeting room access, group discounts',
      documents: ['passport.pdf', 'business_card.pdf'],
      createdBy: 'Manager',
      createdAt: '2024-04-12T13:45:00Z',
      lastModifiedBy: 'Manager',
      lastModifiedAt: '2024-07-25T10:30:00Z'
    }
  ]

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ChevronUp size={16} className="w-4 h-4 text-gray-300" />
    return sortDirection === 'asc' ? <ChevronUp size={16} className="w-4 h-4 text-orange-600" /> : <ChevronDown size={16} className="w-4 h-4 text-orange-600" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const isBirthdaySoon = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const currentYear = today.getFullYear()
    
    // Set birthday to current year
    birthDate.setFullYear(currentYear)
    
    // If birthday already passed this year, check next year
    if (birthDate < today) {
      birthDate.setFullYear(currentYear + 1)
    }
    
    const diffTime = birthDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 30 && diffDays >= 0
  }

  // No local filtering - handled by backend
  const filteredGuests = dataSource

  // Sort guests
  const sortedGuests = [...filteredGuests].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSelectAll = () => {
    if (selectedGuests.length === sortedGuests.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(sortedGuests.map(guest => guest.id))
    }
  }

  const handleSelectGuest = (guestId: string) => {
    if (selectedGuests.includes(guestId)) {
      onSelectionChange(selectedGuests.filter(id => id !== guestId))
    } else {
      onSelectionChange([...selectedGuests, guestId])
    }
  }

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      'American': '🇺🇸',
      'Spanish': '🇪🇸',
      'Egyptian': '🇪🇬',
      'British': '🇬🇧',
      'Chinese': '🇨🇳',
      'Canadian': '🇨🇦',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Russian': '🇷🇺',
      'Japanese': '🇯🇵',
      'Korean': '🇰🇷',
      'Indian': '🇮🇳',
      'Brazilian': '🇧🇷',
      'Australian': '🇦🇺'
    }
    return flags[nationality] || '🌍'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading guests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedGuests.length === sortedGuests.length && sortedGuests.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span>Name</span>
                {getSortIcon('name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('nationality')}
            >
              <div className="flex items-center space-x-1">
                <span>Nationality</span>
                {getSortIcon('nationality')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('dateOfBirth')}
            >
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>Age / DOB</span>
                {getSortIcon('dateOfBirth')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center space-x-1">
                <Mail size={14} />
                <span>Email</span>
                {getSortIcon('email')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('phone')}
            >
              <div className="flex items-center space-x-1">
                <Phone size={14} />
                <span>Phone</span>
                {getSortIcon('phone')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('reservationCount')}
            >
              <div className="flex items-center space-x-1">
                <span>Reservations</span>
                {getSortIcon('reservationCount')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedGuests.map((guest) => (
            <tr 
              key={guest.id} 
              className={`hover:bg-gray-50 transition-colors ${selectedGuests.includes(guest.id) ? 'bg-orange-50' : ''}`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedGuests.includes(guest.id)}
                  onChange={() => handleSelectGuest(guest.id)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {guest.starGuest && <Star size={16} className="text-yellow-500" />}
                    {guest.primaryGuest && <Crown size={16} className="text-orange-500" />}
                  </div>
                  <div>
                    <button 
                      onClick={() => window.location.href = `/guests/${guest.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline transition-colors cursor-pointer"
                    >
                      {guest.name}
                    </button>
                    <div className="flex items-center space-x-2 mt-1">
                      {guest.customCategories.map((category, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCountryFlag(guest.nationality)}</span>
                  <span className="text-sm text-slate-900">{guest.nationality}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">
                  <div className="flex items-center space-x-2">
                    <span>{getAge(guest.dateOfBirth)} years</span>
                    {isBirthdaySoon(guest.dateOfBirth) && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        🎂 Soon
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{formatDate(guest.dateOfBirth)}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{guest.email}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">{guest.phone}</div>
                {guest.whatsapp && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                    </div>
                    <span className="text-xs text-slate-500">WhatsApp</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{guest.reservationCount}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.location.href = `/guests/${guest.id}`}
                    className="text-slate-600 hover:text-orange-600 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onEditGuest(guest)}
                    className="text-slate-600 hover:text-orange-600 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit Guest"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-slate-600 hover:text-orange-600 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Send Message"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button
                    className="text-slate-600 hover:text-red-600 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Delete Guest"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this guest?')) {
                        console.log('Deleting guest:', guest.id)
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
      
      {sortedGuests.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No guests found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
