'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye, Home, Users, Star, DollarSign, Copy, Settings, ChevronUp, ChevronDown, Calendar, User, Hash, Building, X } from 'lucide-react'
import { Reservation, ReservationFilters } from '@/lib/api/services/reservationService'

interface ReservationsTableProps {
  searchTerm: string
  filters?: ReservationFilters
  reservations?: Reservation[]
  isLoading?: boolean
  onViewReservation: (reservation: Reservation) => void
  onEditReservation: (reservation: Reservation) => void
  selectedReservations: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

// No mock data needed - using real API data

export default function ReservationsTable({ searchTerm, filters, reservations, isLoading, onViewReservation, onEditReservation, selectedReservations, onSelectionChange }: ReservationsTableProps) {
  const [sortField, setSortField] = useState<string>('checkIn')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  // Use real reservations from API
  const dataSource = reservations || []
  console.log('📅 ReservationsTable - dataSource length:', dataSource.length, 'reservations:', reservations?.length || 0)

  // Helper functions for API data format
  const getReservationGuestName = (reservation: any) => {
    return reservation.guestName || 'Unknown Guest'
  }

  const getReservationCheckIn = (reservation: any) => {
    return reservation.checkIn || ''
  }

  const getReservationCheckOut = (reservation: any) => {
    return reservation.checkOut || ''
  }

  const getReservationStatus = (reservation: any) => {
    return reservation.status || 'UNKNOWN'
  }

  const getReservationSource = (reservation: any) => {
    return reservation.source || 'UNKNOWN'
  }

  const getReservationAmount = (reservation: any) => {
    return reservation.totalAmount || 0
  }

  const getReservationProperty = (reservation: any) => {
    return reservation.propertyName || 'Unknown Property'
  }

  // No local filtering needed - filtering is done on the backend
  const filteredReservations = dataSource

  const sortedReservations = filteredReservations.sort((a, b) => {
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

  const handleSelectReservation = (reservationId: string) => {
    onSelectionChange(
      selectedReservations.includes(reservationId)
        ? selectedReservations.filter(id => id !== reservationId)
        : [...selectedReservations, reservationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedReservations.length === sortedReservations.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(sortedReservations.map(r => r.id))
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'No Show' },
      MODIFIED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Modified' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    
    return (
      <span className={`px-2 py-1 text-xs ${config.bg} ${config.text} rounded-full`}>
        {config.label}
      </span>
    )
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp size={14} className="text-gray-300" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="text-orange-600" />
      : <ChevronDown size={14} className="text-orange-600" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reservations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <div className="min-w-full overflow-x-auto">
        <table className="w-full min-w-[1200px]">
        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left w-12">
              <input
                type="checkbox"
                checked={selectedReservations.length === sortedReservations.length && sortedReservations.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-48"
              onClick={() => handleSort('guestName')}
            >
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span>Guest Name</span>
                {getSortIcon('guestName')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-56"
              onClick={() => handleSort('propertyName')}
            >
              <div className="flex items-center space-x-1">
                <Building size={14} />
                <span>Property</span>
                {getSortIcon('propertyName')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-32"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center space-x-1">
                <Hash size={14} />
                <span>Code</span>
                {getSortIcon('id')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-40"
              onClick={() => handleSort('checkIn')}
            >
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>Dates</span>
                {getSortIcon('checkIn')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-20"
              onClick={() => handleSort('nights')}
            >
              <div className="flex items-center space-x-1">
                <span>Nights</span>
                {getSortIcon('nights')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-24"
              onClick={() => handleSort('source')}
            >
              <div className="flex items-center space-x-1">
                <span>Source</span>
                {getSortIcon('source')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-32"
              onClick={() => handleSort('totalAmount')}
            >
              <div className="flex items-center space-x-1">
                <DollarSign size={14} />
                <span>Amount</span>
                {getSortIcon('totalAmount')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-28"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {getSortIcon('status')}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedReservations.map((reservation) => (
            <tr 
              key={reservation.id} 
              className={`hover:bg-gray-50 transition-colors ${hoveredRow === reservation.id ? 'bg-orange-50' : ''}`}
              onMouseEnter={() => setHoveredRow(reservation.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="px-4 py-4 whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  checked={selectedReservations.includes(reservation.id)}
                  onChange={() => handleSelectReservation(reservation.id)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-48">
                <button
                  onClick={() => window.location.href = `/reservations/${reservation.id}`}
                  className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline cursor-pointer text-left truncate block w-full"
                  title={reservation.guestName}
                >
                  {reservation.guestName}
                </button>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-56">
                <span className="text-sm text-slate-900 truncate block" title={reservation.propertyName}>
                  {reservation.propertyName}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-32">
                <span className="text-sm font-mono text-slate-900">{reservation.id}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-40">
                <div className="text-sm text-slate-900">
                  <div>{formatDate(reservation.checkIn)}</div>
                  <div className="text-xs text-gray-500">to {formatDate(reservation.checkOut)}</div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-20 text-center">
                <span className="text-sm text-slate-900">{reservation.nights}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-24">
                <span className="text-sm text-slate-900">{reservation.source}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-32">
                <div>
                  <div className="text-sm font-medium text-slate-900">${reservation.totalAmount}</div>
                  {reservation.outstandingBalance && reservation.outstandingBalance > 0 && (
                    <div className="text-xs text-red-600">
                      ${reservation.outstandingBalance} outstanding
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap w-28">
                {getStatusBadge(reservation.status)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium w-24">
                <div className={`flex items-center space-x-2 transition-opacity ${hoveredRow === reservation.id ? 'opacity-100' : 'opacity-70'}`}>
                  <button
                    onClick={() => {
                      // Navigate to reservation details page
                      window.location.href = `/reservations/${reservation.id}`
                    }}
                    className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-100 rounded cursor-pointer"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onEditReservation(reservation)}
                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded cursor-pointer"
                    title="Edit Reservation"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded cursor-pointer"
                    title="Cancel Reservation"
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this reservation?')) {
                        console.log('Canceling reservation:', reservation.id)
                      }
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  )
}
