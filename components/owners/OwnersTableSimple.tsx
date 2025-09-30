'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, Star, Crown, User, Mail, Phone, Calendar, MapPin, Building, Info, ChevronUp, ChevronDown } from 'lucide-react'
import { User as UserType } from '@/lib/api'

interface OwnersTableProps {
  owners?: UserType[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  searchTerm: string
  filters: any
  selectedOwners: number[]
  onSelectionChange: (selectedIds: number[]) => void
  onPageChange?: (page: number) => void
}

export default function OwnersTableSimple({ 
  owners = [], 
  pagination, 
  searchTerm, 
  filters, 
  selectedOwners, 
  onSelectionChange, 
  onPageChange 
}: OwnersTableProps) {
  const [sortField, setSortField] = useState<string>('firstName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  // Filter and sort owners
  const filteredOwners = owners.filter(owner => {
    const matchesSearch = searchTerm === '' || 
      owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const sortedOwners = [...filteredOwners].sort((a, b) => {
    const aValue = a[sortField as keyof UserType] || ''
    const bValue = b[sortField as keyof UserType] || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(sortedOwners.map(owner => parseInt(owner.id)))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectOwner = (ownerId: string, checked: boolean) => {
    const id = parseInt(ownerId)
    if (checked) {
      onSelectionChange([...selectedOwners, id])
    } else {
      onSelectionChange(selectedOwners.filter(id => id !== parseInt(ownerId)))
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedOwners.length === sortedOwners.length && sortedOwners.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
          </div>
          <div 
            className="col-span-2 cursor-pointer flex items-center space-x-1 hover:text-gray-700"
            onClick={() => handleSort('firstName')}
          >
            <span>Name</span>
            {getSortIcon('firstName')}
          </div>
          <div 
            className="col-span-2 cursor-pointer flex items-center space-x-1 hover:text-gray-700"
            onClick={() => handleSort('email')}
          >
            <span>Email</span>
            {getSortIcon('email')}
          </div>
          <div className="col-span-2">Phone</div>
          <div 
            className="col-span-1 cursor-pointer flex items-center space-x-1 hover:text-gray-700"
            onClick={() => handleSort('isActive')}
          >
            <span>Status</span>
            {getSortIcon('isActive')}
          </div>
          <div className="col-span-2">Created</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto">
        {sortedOwners.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No owners found
          </div>
        ) : (
          sortedOwners.map((owner, index) => (
            <div
              key={owner.id}
              className={`grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                hoveredRow === index ? 'bg-gray-50' : ''
              }`}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedOwners.includes(parseInt(owner.id))}
                  onChange={(e) => handleSelectOwner(owner.id, e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </div>
              
              <div className="col-span-2 flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-orange-600" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {owner.firstName} {owner.lastName}
                  </div>
                  <div className="text-xs text-gray-500">Owner</div>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center">
                <div className="flex items-center space-x-2">
                  <Mail size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{owner.email}</span>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center">
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{owner.phone || 'N/A'}</span>
                </div>
              </div>
              
              <div className="col-span-1 flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  owner.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {owner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="col-span-2 flex items-center">
                <div className="flex items-center space-x-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(owner.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <Eye size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
