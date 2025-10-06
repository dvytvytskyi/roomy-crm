'use client'

import { useState } from 'react'
import { Trash2, User, Mail, Phone, Calendar, Building, ChevronUp, ChevronDown } from 'lucide-react'
import { Owner } from '@/lib/api/services/ownerService'

// Function to get country flag emoji
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
    'American': '🇺🇸',
    'Other': '🌍'
  }
  return flagMap[nationality] || '🌍'
}

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
  onRefresh?: () => void
  onDeleteOwner?: (ownerId: string) => void
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
}

export default function OwnersTableSimple({ 
  owners = [], 
  pagination, 
  searchTerm, 
  filters, 
  selectedOwners, 
  onSelectionChange, 
  onPageChange,
  onRefresh,
  onDeleteOwner,
  loadingMore = false,
  hasMore = false,
  onLoadMore
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

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100 // Load when 100px from bottom
    
    if (isNearBottom && !loadingMore && hasMore && onLoadMore) {
      onLoadMore()
    }
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
          <div className="col-span-1">Phone</div>
          <div 
            className="col-span-1 cursor-pointer flex items-center space-x-1 hover:text-gray-700"
            onClick={() => handleSort('nationality')}
          >
            <span>Nationality</span>
            {getSortIcon('nationality')}
          </div>
          <div 
            className="col-span-1 cursor-pointer flex items-center space-x-1 hover:text-gray-700"
            onClick={() => handleSort('totalUnits')}
          >
            <span>Units</span>
            {getSortIcon('totalUnits')}
          </div>
          <div 
            className="col-span-1 cursor-pointer flex items-center space-x-1 hover:text-gray-700"
            onClick={() => handleSort('status')}
          >
            <span>Status</span>
            {getSortIcon('status')}
          </div>
          <div className="col-span-2">Created</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {sortedOwners.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No owners found
          </div>
        ) : (
          <>
            {sortedOwners.map((owner, index) => (
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
                  <div 
                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-orange-600 transition-colors duration-200"
                    onClick={() => window.location.href = `/owners/${owner.id}`}
                    title="Click to view owner details"
                  >
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
              
              <div className="col-span-1 flex items-center">
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{owner.phone || 'N/A'}</span>
                </div>
              </div>
              
              <div className="col-span-1 flex items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCountryFlag(owner.nationality || 'Other')}</span>
                  <span className="text-sm text-gray-900">{owner.nationality || 'N/A'}</span>
                </div>
              </div>
              
              <div className="col-span-1 flex items-center">
                <div className="flex items-center space-x-1">
                  <Building size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{owner.totalUnits || 0}</span>
                </div>
              </div>
              
              <div className="col-span-1 flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  owner.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : owner.status === 'INACTIVE'
                      ? 'bg-red-100 text-red-800'
                      : owner.status === 'VIP'
                        ? 'bg-purple-100 text-purple-800'
                        : owner.status === 'SUSPENDED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                }`}>
                  {owner.status === 'ACTIVE' ? 'Active' : 
                   owner.status === 'INACTIVE' ? 'Inactive' :
                   owner.status === 'VIP' ? 'VIP' :
                   owner.status === 'SUSPENDED' ? 'Suspended' :
                   owner.status || 'Unknown'}
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
              
              <div className="col-span-1 flex items-center space-x-2">
                <button 
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete ${owner.firstName} ${owner.lastName}?`)) {
                      try {
                        if (onDeleteOwner) {
                          await onDeleteOwner(owner.id)
                          console.log('Owner deleted:', owner.id)
                          alert('Owner deleted successfully!')
                        }
                      } catch (error) {
                        console.error('Error deleting owner:', error)
                        alert('Failed to delete owner. Please try again.')
                      }
                    }
                  }}
                  title="Delete owner"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            ))}
            
            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center py-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  <span className="text-sm text-gray-600">Loading more owners...</span>
                </div>
              </div>
            )}
            
            {/* End of List Indicator */}
            {!hasMore && sortedOwners.length > 0 && !loadingMore && (
              <div className="flex items-center justify-center py-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">All owners loaded ({sortedOwners.length} total)</span>
              </div>
            )}
          </>
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
