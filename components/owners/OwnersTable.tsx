'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, Star, Crown, User, Mail, Phone, Calendar, MapPin, Building, Info, ChevronUp, ChevronDown } from 'lucide-react'

interface OwnersTableProps {
  searchTerm: string
  filters: any
  selectedOwners: number[]
  onSelectionChange: (selectedIds: number[]) => void
}

export default function OwnersTable({ searchTerm, filters, selectedOwners, onSelectionChange }: OwnersTableProps) {
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [showInfoModal, setShowInfoModal] = useState<number | null>(null)

  // Mock data for owners
  const mockOwners = [
    {
      id: 1,
      name: 'Ahmed Al-Rashid',
      nationality: 'Emirati',
      dateOfBirth: '1975-03-15',
      email: 'ahmed.alrashid@example.com',
      phone: '+971 50 123 4567',
      whatsapp: '+971 50 123 4567',
      telegram: '@ahmedrashid',
      reservationCount: 45,
      units: [
        { name: 'BK Studio', id: 1 },
        { name: 'Marina Apt', id: 2 },
        { name: 'DT Loft', id: 3 }
      ],
      comments: 'VIP owner, prefers bank transfer payments',
      status: 'Active',
      vipStatus: true,
      paymentPreferences: 'Bank Transfer',
      personalStayDays: 30,
      totalUnits: 3,
      createdBy: 'Admin',
      createdByEmail: 'admin@company.com',
      createdAt: '2024-01-15T10:30:00Z',
      lastModifiedBy: 'Manager',
      lastModifiedByEmail: 'manager@company.com',
      lastModifiedAt: '2024-07-20T14:20:00Z'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      nationality: 'British',
      dateOfBirth: '1982-07-22',
      email: 'sarah.johnson@example.com',
      phone: '+44 20 7946 0958',
      whatsapp: '+44 20 7946 0958',
      telegram: '@sarahjohnson',
      reservationCount: 28,
      units: [
        { name: 'Palm Villa', id: 4 },
        { name: 'Sky Penthouse', id: 5 }
      ],
      comments: 'Long-term partner, excellent communication',
      status: 'Active',
      vipStatus: false,
      paymentPreferences: 'PayPal',
      personalStayDays: 15,
      totalUnits: 2,
      createdBy: 'Manager',
      createdByEmail: 'manager@company.com',
      createdAt: '2024-02-10T09:15:00Z',
      lastModifiedBy: 'Admin',
      lastModifiedByEmail: 'admin@company.com',
      lastModifiedAt: '2024-06-15T11:45:00Z'
    },
    {
      id: 3,
      name: 'Mohammed Hassan',
      nationality: 'Egyptian',
      dateOfBirth: '1988-12-03',
      email: 'mohammed.hassan@example.com',
      phone: '+20 2 1234 5678',
      whatsapp: '+20 2 1234 5678',
      telegram: '@mohassan',
      reservationCount: 12,
      units: [
        { name: 'BD 1A', id: 6 }
      ],
      comments: 'New owner, needs onboarding support',
      status: 'Active',
      vipStatus: false,
      paymentPreferences: 'Bank Transfer',
      personalStayDays: 10,
      totalUnits: 1,
      createdBy: 'Admin',
      createdByEmail: 'admin@company.com',
      createdAt: '2024-03-05T16:20:00Z',
      lastModifiedBy: 'Manager',
      lastModifiedByEmail: 'manager@company.com',
      lastModifiedAt: '2024-03-05T16:20:00Z'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      nationality: 'Canadian',
      dateOfBirth: '1979-05-18',
      email: 'emma.wilson@example.com',
      phone: '+1 416 555 0123',
      whatsapp: '+1 416 555 0123',
      telegram: '@emmawilson',
      reservationCount: 67,
      units: [
        { name: 'Beach Villa', id: 7 },
        { name: 'City Apt', id: 8 },
        { name: 'Garden Suite', id: 9 },
        { name: 'Lux Penthouse', id: 10 }
      ],
      comments: 'Top performer, multiple properties, prefers monthly payments',
      status: 'VIP',
      vipStatus: true,
      paymentPreferences: 'Monthly Bank Transfer',
      personalStayDays: 45,
      totalUnits: 4,
      createdBy: 'Admin',
      createdByEmail: 'admin@company.com',
      createdAt: '2023-11-20T08:30:00Z',
      lastModifiedBy: 'Admin',
      lastModifiedByEmail: 'admin@company.com',
      lastModifiedAt: '2024-08-10T12:15:00Z'
    },
    {
      id: 5,
      name: 'Chen Wei',
      nationality: 'Chinese',
      dateOfBirth: '1985-09-12',
      email: 'chen.wei@example.com',
      phone: '+86 138 0013 8000',
      whatsapp: '+86 138 0013 8000',
      telegram: '@chenwei',
      reservationCount: 8,
      units: ['Tech Studio'],
      comments: 'Investor, minimal communication needed',
      status: 'Inactive',
      vipStatus: false,
      paymentPreferences: 'Quarterly Transfer',
      personalStayDays: 5,
      totalUnits: 1,
      createdBy: 'Manager',
      createdByEmail: 'manager@company.com',
      createdAt: '2024-04-12T13:45:00Z',
      lastModifiedBy: 'Manager',
      lastModifiedByEmail: 'manager@company.com',
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
    if (sortField !== field) return <ChevronUp className='w-4 h-4 text-gray-300' />
    return sortDirection === 'asc' ? <ChevronUp className='w-4 h-4 text-orange-600' /> : <ChevronDown className='w-4 h-4 text-orange-600' />
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

  const getCountryFlag = (nationality: string) => {
    const flagMap: { [key: string]: string } = {
      'Emirati': '🇦🇪',
      'British': '🇬🇧',
      'Canadian': '🇨🇦',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Spanish': '🇪🇸',
      'Chinese': '🇨🇳',
      'Japanese': '🇯🇵',
      'Korean': '🇰🇷',
      'Indian': '🇮🇳',
      'Australian': '🇦🇺',
      'Brazilian': '🇧🇷',
      'Egyptian': '🇪🇬',
      'Saudi Arabian': '🇸🇦',
      'Turkish': '🇹🇷',
      'Greek': '🇬🇷',
      'Russian': '🇷🇺',
      'American': '🇺🇸'
    }
    return flagMap[nationality] || '🏳️'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'VIP': return 'bg-purple-100 text-purple-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter and search logic
  const filteredOwners = mockOwners.filter(owner => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!owner.name.toLowerCase().includes(searchLower) &&
          !owner.email.toLowerCase().includes(searchLower) &&
          !owner.phone.includes(searchTerm) &&
          !owner.nationality.toLowerCase().includes(searchLower) &&
          !owner.comments.toLowerCase().includes(searchLower) &&
          !owner.units.some((unit: any) => unit.name.toLowerCase().includes(searchLower))) {
        return false
      }
    }

    // Filters
    if (filters.nationality.length > 0 && !filters.nationality.includes(owner.nationality)) {
      return false
    }

    if (filters.units.length > 0) {
      const hasMatchingUnit = filters.units.some((unit: string) => 
        owner.units.some((ownerUnit: any) => ownerUnit.name === unit)
      )
      if (!hasMatchingUnit) return false
    }

    if (filters.status.length > 0 && !filters.status.includes(owner.status)) {
      return false
    }

    if (filters.dateOfBirth.from && owner.dateOfBirth < filters.dateOfBirth.from) {
      return false
    }

    if (filters.dateOfBirth.to && owner.dateOfBirth > filters.dateOfBirth.to) {
      return false
    }

    if (filters.phoneNumber && !owner.phone.includes(filters.phoneNumber)) {
      return false
    }

    if (filters.comments && !owner.comments.toLowerCase().includes(filters.comments.toLowerCase())) {
      return false
    }

    return true
  })

  // Sort owners
  const sortedOwners = [...filteredOwners].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSelectAll = () => {
    if (selectedOwners.length === sortedOwners.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(sortedOwners.map(owner => owner.id))
    }
  }

  const handleSelectOwner = (ownerId: number) => {
    if (selectedOwners.includes(ownerId)) {
      onSelectionChange(selectedOwners.filter(id => id !== ownerId))
    } else {
      onSelectionChange([...selectedOwners, ownerId])
    }
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedOwners.length === sortedOwners.length && sortedOwners.length > 0}
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
              onClick={() => handleSort('totalUnits')}
            >
              <div className="flex items-center space-x-1">
                <Building size={14} />
                <span>Units</span>
                {getSortIcon('totalUnits')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {getSortIcon('status')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedOwners.map((owner) => (
            <tr 
              key={owner.id} 
              className={`hover:bg-gray-50 transition-colors cursor-pointer ${hoveredRow === owner.id ? 'bg-orange-50' : ''}`}
              onMouseEnter={() => setHoveredRow(owner.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedOwners.includes(owner.id)}
                  onChange={() => handleSelectOwner(owner.id)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {owner.vipStatus && <Star size={16} className="text-yellow-500" />}
                    {owner.status === 'VIP' && <Crown size={16} className="text-purple-500" />}
                  </div>
                  <div>
                    <button
                      onClick={() => window.location.href = `/owners/${owner.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline transition-colors cursor-pointer"
                    >
                      {owner.name}
                    </button>
                    {owner.comments && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-slate-500 max-w-xs truncate" title={owner.comments}>
                          {owner.comments}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCountryFlag(owner.nationality)}</span>
                  <span className="text-sm text-slate-900">{owner.nationality}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">
                  <div className="flex items-center space-x-2">
                    <span>{getAge(owner.dateOfBirth)} years</span>
                  </div>
                  <div className="text-xs text-slate-500">{formatDate(owner.dateOfBirth)}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{owner.email}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">{owner.phone}</div>
                {owner.whatsapp && (
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
                <div className="text-sm text-slate-900">{owner.totalUnits}</div>
                <div className="text-xs text-slate-500 max-w-xs truncate" title={owner.units.map((unit: any) => unit.name).join(', ')}>
                  {owner.units.slice(0, 2).map((unit: any, index: number) => (
                    <span key={index}>
                      <button
                        onClick={() => window.location.href = `/properties/${unit.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {unit.name}
                      </button>
                      {index < Math.min(owner.units.length, 2) - 1 && ', '}
                    </span>
                  ))}
                  {owner.units.length > 2 && ` +${owner.units.length - 2} more`}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(owner.status)}`}>
                  {owner.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className={`flex items-center space-x-2 transition-opacity ${hoveredRow === owner.id ? 'opacity-100' : 'opacity-70'}`}>
                  <button
                    onClick={() => window.location.href = `/owners/${owner.id}`}
                    className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-100 rounded cursor-pointer"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => setShowInfoModal(owner.id)}
                    className="text-slate-600 hover:text-slate-900 p-1 hover:bg-slate-100 rounded cursor-pointer"
                    title="Info"
                  >
                    <Info size={16} />
                  </button>
                  <button
                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded cursor-pointer"
                    title="Edit Owner"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded cursor-pointer"
                    title="Delete Owner"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this owner?')) {
                        console.log('Deleting owner:', owner.id)
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
      
      {sortedOwners.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No owners found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Info size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Owner Information</h3>
                  <p className="text-sm text-slate-600">Created and modification details</p>
                </div>
              </div>
              
              {(() => {
                const owner = mockOwners.find(o => o.id === showInfoModal)
                if (!owner) return null
                
                return (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Created:</span>
                      <span className="text-slate-900">{formatDate(owner.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Created by:</span>
                      <div className="text-right">
                        <div className="text-slate-900">{owner.createdBy}</div>
                        <div className="text-xs text-slate-500">{owner.createdByEmail}</div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Last modified:</span>
                      <span className="text-slate-900">{formatDate(owner.lastModifiedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Modified by:</span>
                      <div className="text-right">
                        <div className="text-slate-900">{owner.lastModifiedBy}</div>
                        <div className="text-xs text-slate-500">{owner.lastModifiedByEmail}</div>
                      </div>
                    </div>
                  </div>
                )
              })()}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowInfoModal(null)}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
