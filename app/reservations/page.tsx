'use client'

import { useState } from 'react'
import { Search, Filter, Download, Archive, Trash2, Eye, Edit, X, Plus, MessageSquare, AlertCircle, Bell } from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import ReservationsTable from '@/components/reservations/ReservationsTable'
import ReservationsFilters from '@/components/reservations/ReservationsFilters'
import ReservationDetailsModal from '@/components/reservations/ReservationDetailsModal'
import ReservationEditModal from '@/components/reservations/ReservationEditModal'
import NewReservationModal from '@/components/reservations/NewReservationModal'

export default function ReservationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReservations, setSelectedReservations] = useState<number[]>([])
  const [reservationDetailsModal, setReservationDetailsModal] = useState({
    isOpen: false,
    reservation: null
  })
  const [reservationEditModal, setReservationEditModal] = useState({
    isOpen: false,
    reservation: null
  })
  const [newReservationModal, setNewReservationModal] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: { from: '', to: '' },
    status: [],
    source: [],
    property: [],
    amountRange: { min: '', max: '' },
    tags: [],
    guestName: ''
  })


  const handleViewReservation = (reservation: any) => {
    setReservationDetailsModal({
      isOpen: true,
      reservation
    })
  }

  const handleEditReservation = (reservation: any) => {
    setReservationEditModal({
      isOpen: true,
      reservation
    })
  }

  const handleNewReservation = () => {
    setNewReservationModal(true)
  }


  const handleBulkAction = (action: string) => {
    console.log(`${action} reservations:`, selectedReservations)
    // TODO: Implement bulk actions
  }

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedReservations(selectedIds)
  }

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: { from: '', to: '' },
      status: [],
      source: [],
      property: [],
      amountRange: { min: '', max: '' },
      tags: [],
      guestName: ''
    })
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        {/* Header */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">Reservations</h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search reservations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                    />
                  </div>

                  {/* New Reservation */}
                  <button
                    onClick={handleNewReservation}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>New Reservation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Alerts */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-orange-600" />
                <span className="text-sm text-orange-800">3 upcoming check-ins today</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} className="text-green-600" />
                <span className="text-sm text-green-800">2 new booking requests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReservations.length > 0 && (
          <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-orange-700 font-medium">
                    {selectedReservations.length} reservation(s) selected
                  </span>
                  <button
                    onClick={() => setSelectedReservations([])}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium underline cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('message')}
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleBulkAction('cancel')}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex gap-8 px-2 sm:px-3 lg:px-4 py-1.5 min-h-0 overflow-hidden">
          {/* Filters Sidebar - Fixed Height */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-sm font-medium text-slate-700">Filters</h3>
                <Filter className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <ReservationsFilters 
                  filters={filters}
                  onApplyFilters={handleApplyFilters}
                  onClearFilters={handleClearFilters}
                  onClose={() => {}}
                  isSidebar={true}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              <ReservationsTable
                searchTerm={searchTerm}
                filters={filters}
                onViewReservation={handleViewReservation}
                onEditReservation={handleEditReservation}
                selectedReservations={selectedReservations}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Reservation Details Modal */}
      {reservationDetailsModal.isOpen && (
        <ReservationDetailsModal
          reservation={reservationDetailsModal.reservation}
          onClose={() => setReservationDetailsModal({ isOpen: false, reservation: null })}
          onEdit={() => {
            setReservationDetailsModal({ isOpen: false, reservation: null })
            setReservationEditModal({ isOpen: true, reservation: reservationDetailsModal.reservation })
          }}
        />
      )}

      {/* Reservation Edit Modal */}
      {reservationEditModal.isOpen && (
        <ReservationEditModal
          reservation={reservationEditModal.reservation}
          onClose={() => setReservationEditModal({ isOpen: false, reservation: null })}
          onSave={(updatedReservation) => {
            console.log('Reservation updated:', updatedReservation)
            setReservationEditModal({ isOpen: false, reservation: null })
          }}
        />
      )}

      {/* New Reservation Modal */}
      {newReservationModal && (
        <NewReservationModal
          onClose={() => setNewReservationModal(false)}
          onSave={(newReservation) => {
            console.log('New reservation created:', newReservation)
            setNewReservationModal(false)
          }}
        />
      )}

    </div>
  )
}
