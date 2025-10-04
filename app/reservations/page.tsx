'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Download, Archive, Trash2, Eye, Edit, X, Plus, MessageSquare, AlertCircle, Bell } from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import ReservationsTable from '@/components/reservations/ReservationsTable'
import ReservationsFilters from '@/components/reservations/ReservationsFilters'
import ReservationDetailsModal from '@/components/reservations/ReservationDetailsModal'
import ReservationEditModal from '@/components/reservations/ReservationEditModal'
import NewReservationModal from '@/components/reservations/NewReservationModal'
import { reservationServiceAdapted } from '@/lib/api/adapters/apiAdapter'
import { Reservation, ReservationFilters } from '@/lib/api/services/reservationService'

export default function ReservationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReservations, setSelectedReservations] = useState<string[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [reservationDetailsModal, setReservationDetailsModal] = useState({
    isOpen: false,
    reservation: null
  })
  const [reservationEditModal, setReservationEditModal] = useState({
    isOpen: false,
    reservation: null
  })
  const [newReservationModal, setNewReservationModal] = useState(false)
  const [filters, setFilters] = useState<ReservationFilters>({
    dateRange: { from: '', to: '' },
    status: [],
    source: [],
    amountRange: { min: '', max: '' },
    guestName: ''
  })

  // Toast handler
  const handleShowToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 5000)
  }

  // Load reservations from API
  const loadReservations = useCallback(async (currentFilters?: ReservationFilters) => {
    console.log('📅 ReservationsPage: Loading reservations...')
    console.log('📅 ReservationsPage: Using filters:', currentFilters || filters)
    console.log('📅 ReservationsPage: Filters breakdown:', {
      status: currentFilters?.status || filters?.status,
      source: currentFilters?.source || filters?.source,
      searchTerm: currentFilters?.searchTerm || filters?.searchTerm,
      amountRange: currentFilters?.amountRange || filters?.amountRange
    })
    try {
      setIsLoading(true)
      
      // Build query parameters for V2 API
      const queryParams: any = {
        page: 1,
        limit: 100,
      }
      
      const currentFilter = currentFilters || filters
      
      if (currentFilter.dateRange?.from) {
        queryParams.dateFrom = currentFilter.dateRange.from
      }
      if (currentFilter.dateRange?.to) {
        queryParams.dateTo = currentFilter.dateRange.to
      }
      if (currentFilter.status && currentFilter.status.length > 0) {
        queryParams.status = currentFilter.status.join(',')
      }
      if (currentFilter.source && currentFilter.source.length > 0) {
        queryParams.source = currentFilter.source.join(',')
      }
      if (currentFilter.searchTerm) {
        queryParams.search = currentFilter.searchTerm
      }
      if (currentFilter.guestName) {
        queryParams.guestName = currentFilter.guestName
      }
      
      console.log('📅 Query params:', queryParams)
      
      const response = await reservationServiceAdapted.getAll(queryParams)
      
      if (response.success && response.data) {
        // Handle both V1 and V2 response formats
        let reservationsData = []
        if (Array.isArray(response.data)) {
          // V1 format: direct array
          reservationsData = response.data
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // V2 format: paginated response
          reservationsData = response.data.data
        }
        
        console.log('✅ Reservations loaded:', reservationsData.length, 'reservations')
        console.log('✅ First reservation:', reservationsData[0])
        setReservations(reservationsData)
      } else {
        console.error('❌ Failed to load reservations:', response.error)
        setReservations([])
        handleShowToast(`Failed to load reservations: ${response.error?.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('💥 Error loading reservations:', error)
      setReservations([])
      handleShowToast(`Error loading reservations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load reservations on component mount
  useEffect(() => {
    loadReservations()
  }, [])

  // Reload reservations when filters or search term change
  useEffect(() => {
    console.log('🔄 Filters or search term changed, reloading reservations...')
    const filtersWithSearch = {
      ...filters,
      searchTerm: searchTerm
    }
    loadReservations(filtersWithSearch)
  }, [filters, searchTerm])

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

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedReservations(selectedIds)
  }

  const handleApplyFilters = (newFilters: ReservationFilters) => {
    console.log('🔍 Applying filters:', newFilters)
    console.log('🔍 Previous filters:', filters)
    setFilters(newFilters)
    console.log('🔍 Filters state updated')
  }

  const handleClearFilters = () => {
    console.log('🧹 Clearing filters')
    const clearedFilters: ReservationFilters = {
      dateRange: { from: '', to: '' },
      status: [],
      source: [],
      property: [],
      amountRange: { min: '', max: '' },
      guestName: ''
    }
    setFilters(clearedFilters)
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <TopNavigation />
      
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <span>{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="text-orange-500 hover:text-orange-700 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        {/* Header */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900" data-testid="reservations-title">Reservations</h1>
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
                        data-testid="search-input"
                      />
                  </div>

                  {/* New Reservation */}
                  <button
                    onClick={handleNewReservation}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
                    data-testid="add-reservation-btn"
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
                reservations={reservations}
                isLoading={isLoading}
                onViewReservation={handleViewReservation}
                data-testid="reservations-table"
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
