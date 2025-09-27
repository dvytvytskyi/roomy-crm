'use client'

import { useState } from 'react'
import { Edit, Trash2, Eye, Home, Users, Star, DollarSign, Copy, Settings, ChevronUp, ChevronDown, Calendar, User, Hash, Building, X } from 'lucide-react'

interface ReservationsTableProps {
  searchTerm: string
  filters?: any
  onViewReservation: (reservation: any) => void
  onEditReservation: (reservation: any) => void
  selectedReservations: number[]
  onSelectionChange: (selectedIds: number[]) => void
}

// Mock data for reservations
const mockReservations = [
  {
    id: 1,
    guest_name: 'John Smith',
    check_in: '2024-08-15',
    check_out: '2024-08-18',
    status: 'confirmed',
    reservation_id: 'RES-001',
    total_amount: 450,
    unit_property: 'Burj Khalifa Studio',
    source: 'Airbnb',
    nights: 3,
    number_of_guests: 2,
    paid_amount: 450,
    outstanding_balance: 0,
    notes: 'Guest requested late check-in'
  },
  {
    id: 2,
    guest_name: 'Sarah Johnson',
    check_in: '2024-08-20',
    check_out: '2024-08-25',
    status: 'pending',
    reservation_id: 'RES-002',
    total_amount: 750,
    unit_property: 'Marina View',
    source: 'Booking.com',
    nights: 5,
    number_of_guests: 4,
    paid_amount: 0,
    outstanding_balance: 750,
    notes: 'Special anniversary trip'
  },
  {
    id: 3,
    guest_name: 'Michael Brown',
    check_in: '2024-08-10',
    check_out: '2024-08-12',
    status: 'completed',
    reservation_id: 'RES-003',
    total_amount: 300,
    unit_property: 'Downtown Loft',
    source: 'Direct',
    nights: 2,
    number_of_guests: 1,
    paid_amount: 300,
    outstanding_balance: 0,
    notes: 'Business trip',
    created_by: {
      name: 'Alex Thompson',
      email: 'alex.thompson@company.com'
    }
  },
  {
    id: 4,
    guest_name: 'Emily Davis',
    check_in: '2024-08-30',
    check_out: '2024-09-05',
    status: 'confirmed',
    reservation_id: 'RES-004',
    total_amount: 1200,
    unit_property: 'Palm Villa',
    source: 'Direct',
    nights: 6,
    number_of_guests: 6,
    paid_amount: 600,
    outstanding_balance: 600,
    notes: 'Long-term stay',
    created_by: {
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@company.com'
    }
  },
  {
    id: 5,
    guest_name: 'David Wilson',
    check_in: '2024-08-22',
    check_out: '2024-08-24',
    status: 'canceled',
    reservation_id: 'RES-005',
    total_amount: 400,
    unit_property: 'Skyline Penthouse',
    source: 'Airbnb',
    nights: 2,
    number_of_guests: 3,
    paid_amount: 0,
    outstanding_balance: 0,
    notes: 'Guest canceled due to flight change'
  }
]

export default function ReservationsTable({ searchTerm, filters, onViewReservation, onEditReservation, selectedReservations, onSelectionChange }: ReservationsTableProps) {
  const [sortField, setSortField] = useState<string>('check_in')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const filteredReservations = mockReservations.filter(reservation => {
    // Search term filter
    const matchesSearch = reservation.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.reservation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.unit_property.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    // Additional filters
    if (filters) {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(reservation.status)) {
        return false
      }
      
      // Source filter
      if (filters.source.length > 0 && !filters.source.includes(reservation.source)) {
        return false
      }
      
      // Property filter
      if (filters.property.length > 0 && !filters.property.includes(reservation.unit_property)) {
        return false
      }
      
      // Amount range filter
      if (filters.amountRange.min && reservation.total_amount < parseInt(filters.amountRange.min)) {
        return false
      }
      if (filters.amountRange.max && reservation.total_amount > parseInt(filters.amountRange.max)) {
        return false
      }
      
    }
    
    return true
  })

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

  const handleSelectReservation = (reservationId: number) => {
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
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      canceled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Canceled' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
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

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedReservations.length === sortedReservations.length && sortedReservations.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('guest_name')}
            >
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span>Guest Name</span>
                {getSortIcon('guest_name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('unit_property')}
            >
              <div className="flex items-center space-x-1">
                <Building size={14} />
                <span>Unit</span>
                {getSortIcon('unit_property')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('reservation_id')}
            >
              <div className="flex items-center space-x-1">
                <Hash size={14} />
                <span>Code</span>
                {getSortIcon('reservation_id')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('check_in')}
            >
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>Dates</span>
                {getSortIcon('check_in')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('nights')}
            >
              <div className="flex items-center space-x-1">
                <span>Nights</span>
                {getSortIcon('nights')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('source')}
            >
              <div className="flex items-center space-x-1">
                <span>Source</span>
                {getSortIcon('source')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('total_amount')}
            >
              <div className="flex items-center space-x-1">
                <DollarSign size={14} />
                <span>Amount</span>
                {getSortIcon('total_amount')}
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
          {sortedReservations.map((reservation) => (
            <tr 
              key={reservation.id} 
              className={`hover:bg-gray-50 transition-colors ${hoveredRow === reservation.id ? 'bg-orange-50' : ''}`}
              onMouseEnter={() => setHoveredRow(reservation.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedReservations.includes(reservation.id)}
                  onChange={() => handleSelectReservation(reservation.id)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => window.location.href = `/reservations/${reservation.id}`}
                  className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline cursor-pointer text-left"
                >
                  {reservation.guest_name}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{reservation.unit_property}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-mono text-slate-900">{reservation.reservation_id}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">
                  {formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{reservation.nights}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{reservation.source}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-slate-900">${reservation.total_amount}</div>
                  {reservation.outstanding_balance > 0 && (
                    <div className="text-xs text-red-600">
                      ${reservation.outstanding_balance} outstanding
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(reservation.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
  )
}
