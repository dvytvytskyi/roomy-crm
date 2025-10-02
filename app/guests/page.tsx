'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Download, Mail, MessageSquare, User, Phone, Mail as MailIcon, Calendar, MapPin, Star, Crown, Users, Eye, Edit, Trash2 } from 'lucide-react'
import TopNavigation from '@/components/TopNavigation'
import GuestsTable from '@/components/guests/GuestsTable'
import GuestsFilters from '@/components/guests/GuestsFilters'
import AddGuestModal from '@/components/guests/AddGuestModal'
import { guestService, Guest, GuestFilters } from '@/lib/api/services/guestService'

export default function GuestsPage() {
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [filters, setFilters] = useState<GuestFilters>({
    nationality: [],
    dateOfBirth: { from: '', to: '' },
    reservationCount: { min: '', max: '' },
    unit: []
  })

  // Load guests from API
  const loadGuests = useCallback(async (currentFilters?: GuestFilters) => {
    console.log('👥 GuestsPage: Loading guests...')
    console.log('👥 GuestsPage: Using filters:', currentFilters || filters)
    
    try {
      setIsLoading(true)
      const filtersWithSearch = {
        ...(currentFilters || filters),
        searchTerm: searchTerm
      }
      const response = await guestService.getGuests(filtersWithSearch)
      
      if (response.success && response.data) {
        console.log('👥 GuestsPage: Guests loaded:', response.data.length)
        setGuests(response.data)
      } else {
        console.error('👥 GuestsPage: Failed to load guests:', response.error)
      }
    } catch (error) {
      console.error('👥 GuestsPage: Error loading guests:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, searchTerm])

  // Load stats from API
  const loadStats = useCallback(async () => {
    try {
      const response = await guestService.getGuestStats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('👥 GuestsPage: Error loading stats:', error)
    }
  }, [])

  // Load guests on mount and when filters/search change
  useEffect(() => {
    loadGuests()
    loadStats()
  }, [filters, searchTerm])

  const handleCreateGuest = () => {
    setSelectedGuest(null)
    setIsGuestModalOpen(true)
  }

  const handleEditGuest = (guest: any) => {
    setSelectedGuest(guest)
    setIsGuestModalOpen(true)
  }

  const handleApplyFilters = (newFilters: GuestFilters) => {
    console.log('👥 GuestsPage: Applying filters:', newFilters)
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    console.log('👥 GuestsPage: Clearing filters')
    setFilters({
      nationality: [],
      dateOfBirth: { from: '', to: '' },
      reservationCount: { min: '', max: '' },
      unit: []
    })
  }

  const handleBulkAction = (action: 'archive' | 'delete' | 'export') => {
    if (selectedGuests.length === 0) return
    
    switch (action) {
      case 'archive':
        console.log('Archive guests:', selectedGuests)
        break
      case 'delete':
        console.log('Delete guests:', selectedGuests)
        break
      case 'export':
        console.log('Export guests:', selectedGuests)
        break
    }
    setSelectedGuests([])
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
                  <h1 className="text-2xl font-semibold text-slate-900">Guests</h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search guests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                    />
                  </div>

                  {/* Add Guest */}
                  <button
                    onClick={handleCreateGuest}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Add Guest</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Guests</p>
                  <p className="text-2xl font-medium text-slate-900">{stats?.totalGuests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Star className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Star Guests</p>
                  <p className="text-2xl font-medium text-slate-900">{stats?.starGuests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Crown className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Primary Guests</p>
                  <p className="text-2xl font-medium text-slate-900">{stats?.primaryGuests || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Birthdays This Month</p>
                  <p className="text-2xl font-medium text-slate-900">{stats?.birthdaysThisMonth || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedGuests.length > 0 && (
          <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-orange-700 font-medium">
                    {selectedGuests.length} guest(s) selected
                  </span>
                  <button
                    onClick={() => setSelectedGuests([])}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium underline cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium cursor-pointer"
                  >
                    Delete
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
                <GuestsFilters 
                  isOpen={true}
                  onClose={() => {}}
                  isSidebar={true}
                  filters={filters}
                  onApplyFilters={handleApplyFilters}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              <GuestsTable 
                searchTerm={searchTerm}
                onEditGuest={handleEditGuest}
                selectedGuests={selectedGuests}
                onSelectionChange={setSelectedGuests}
                guests={guests}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddGuestModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        guest={selectedGuest}
      />
    </div>
  )
}
