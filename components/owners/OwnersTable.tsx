'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, Star, Crown, User, Mail, Phone, Calendar, MapPin, Building, Info, ChevronUp, ChevronDown } from 'lucide-react'
import { Owner } from '@/lib/api/services/ownerService'
import { getCountryFlag } from '@/lib/utils/countryFlags'

interface OwnersTableProps {
  owners?: Owner[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  searchTerm: string
  filters: any
  selectedOwners: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onPageChange?: (page: number) => void
}

export default function OwnersTable({ owners, pagination, searchTerm, filters, selectedOwners, onSelectionChange, onPageChange }: OwnersTableProps) {
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [showInfoModal, setShowInfoModal] = useState<string | null>(null)

  // Use real owners data from props
  const displayOwners = owners || []

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


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'VIP': return 'bg-purple-100 text-purple-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter and search logic
  const filteredOwners = displayOwners.filter(owner => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase()
      if (!fullName.includes(searchLower) &&
          !owner.email.toLowerCase().includes(searchLower) &&
          !owner.phone.includes(searchTerm) &&
          !owner.nationality.toLowerCase().includes(searchLower) &&
          !owner.comments.toLowerCase().includes(searchLower) &&
          !owner.properties.some((property: string) => property.toLowerCase().includes(searchLower))) {
        return false
      }
    }

    // Filters
    if (filters.nationality.length > 0 && !filters.nationality.includes(owner.nationality)) {
      return false
    }

    if (filters.units.length > 0) {
      const hasMatchingUnit = filters.units.some((unit: string) => 
        owner.properties.some((property: string) => property === unit)
      )
      if (!hasMatchingUnit) return false
    }

    if (filters.status.length > 0) {
      const ownerStatus = owner.isActive ? 'Active' : 'Inactive'
      if (!filters.status.includes(ownerStatus)) {
        return false
      }
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
    let aValue: any = a[sortField as keyof typeof a]
    let bValue: any = b[sortField as keyof typeof b]
    
    // Handle name sorting specially
    if (sortField === 'name') {
      aValue = `${a.firstName} ${a.lastName}`
      bValue = `${b.firstName} ${b.lastName}`
    }
    
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

  const handleSelectOwner = (ownerId: string) => {
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
                    {owner.isActive && <Star size={16} className="text-green-500" />}
                  </div>
                  <div>
                    <button
                      onClick={() => window.location.href = `/owners/${owner.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline transition-colors cursor-pointer"
                    >
                      {owner.firstName} {owner.lastName}
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
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">{owner.totalUnits}</div>
                <div className="text-xs text-slate-500 max-w-xs truncate" title={owner.properties.join(', ')}>
                  {owner.properties.slice(0, 2).map((property: string, index: number) => (
                    <span key={index}>
                      <span className="text-blue-600">
                        {property}
                      </span>
                      {index < Math.min(owner.properties.length, 2) - 1 && ', '}
                    </span>
                  ))}
                  {owner.properties.length > 2 && ` +${owner.properties.length - 2} more`}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(owner.isActive ? 'Active' : 'Inactive')}`}>
                  {owner.isActive ? 'Active' : 'Inactive'}
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
                const owner = displayOwners.find(o => o.id === showInfoModal)
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
