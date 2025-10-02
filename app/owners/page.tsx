'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Filter, Download, Mail, User, Calendar, MapPin, Phone, Mail as MailIcon, MessageSquare, Users, Building } from 'lucide-react'
import TopNavigation from '../../components/TopNavigation'
import OwnersTableSimple from '../../components/owners/OwnersTableSimple'
import OwnersFilters from '../../components/owners/OwnersFilters'
import AddOwnerModal from '../../components/owners/AddOwnerModal'
import { useOwners, useUserStats } from '../../hooks/useUsers'

export default function OwnersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    nationality: [] as string[],
    status: [] as string[],
    dateOfBirth: {
      from: '',
      to: ''
    },
    phoneNumber: '',
    comments: ''
  })
  const [selectedOwners, setSelectedOwners] = useState<number[]>([])
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Memoized filter params to prevent unnecessary API calls
  const filterParams = useMemo(() => {
    const params = {
      search: debouncedSearchTerm,
      page,
      limit,
      nationality: filters.nationality.length > 0 ? filters.nationality.join(',') : undefined,
      isActive: filters.status.includes('Active') ? true : filters.status.includes('Inactive') ? false : undefined,
      dateOfBirthFrom: filters.dateOfBirth.from || undefined,
      dateOfBirthTo: filters.dateOfBirth.to || undefined,
      phoneNumber: filters.phoneNumber || undefined,
      comments: filters.comments || undefined
    }
    console.log('🔍 Owners filter params:', params)
    return params
  }, [
    debouncedSearchTerm, 
    page, 
    limit, 
    filters.nationality, 
    filters.status, 
    filters.dateOfBirth.from, 
    filters.dateOfBirth.to, 
    filters.phoneNumber, 
    filters.comments
  ])

  // API hooks with debounced filters
  const { data: ownersData, loading: ownersLoading, error: ownersError, refetch: refetchOwners } = useOwners(filterParams)
  const { data: statsData, loading: statsLoading } = useUserStats()

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      nationality: [],
      status: [],
      dateOfBirth: { from: '', to: '' },
      phoneNumber: '',
      comments: ''
    })
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action}`, selectedOwners)
    // In real app, this would handle bulk operations
  }

  const handleAddOwner = (owner: any) => {
    console.log('Adding owner:', owner)
    setShowAddOwnerModal(false)
    // Refresh owners list after adding
    refetchOwners()
    // Also refresh stats
    window.location.reload()
  }

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '52px' }}>
        {/* Header */}
        <div className="px-4 py-3 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">Owners</h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search owners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  </div>

                  {/* Add Owner */}
                  <button
                    onClick={() => setShowAddOwnerModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Add Owner</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="px-4 py-3 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Owners</p>
                  <p className="text-2xl font-medium text-slate-900">
                    {statsLoading ? '...' : (statsData?.usersByRole.find(r => r.role === 'OWNER')?.count || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Building className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Active Owners</p>
                  <p className="text-2xl font-medium text-slate-900">
                    {statsLoading ? '...' : (ownersData?.users.filter(u => u.isActive).length || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Units</p>
                  <p className="text-2xl font-medium text-slate-900">
                    {statsLoading ? '...' : (ownersData?.users.reduce((sum, owner) => sum + (owner.totalUnits || 0), 0) || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">VIP Owners</p>
                  <p className="text-2xl font-medium text-slate-900">
                    {statsLoading ? '...' : (ownersData?.users.filter(o => filters.status.includes('VIP') || o.comments?.includes('VIP')).length || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-8 px-4 py-3 min-h-0 overflow-hidden">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-sm font-medium text-slate-900">Filters</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <OwnersFilters 
                  filters={filters} 
                  onApplyFilters={handleApplyFilters} 
                  onClearFilters={handleClearFilters}
                  isSidebar={true}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Bulk Actions */}
            {selectedOwners.length > 0 && (
              <div className="bg-orange-50 rounded-xl border border-orange-200 p-3 mb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-orange-700 font-medium">
                      {selectedOwners.length} owner{selectedOwners.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={() => setSelectedOwners([])}
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium underline cursor-pointer"
                    >
                      Clear selection
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkAction('email')}
                      className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                    >
                      Email
                    </button>
                    <button
                      onClick={() => handleBulkAction('export')}
                      className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleBulkAction('edit')}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Owners Table */}
            <div className="bg-white rounded-xl border border-gray-200 flex-1 overflow-hidden">
              {ownersLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-slate-600">Loading owners...</p>
                  </div>
                </div>
              ) : ownersError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading owners</p>
                    <p className="text-slate-600 text-sm">{ownersError}</p>
                    <button 
                      onClick={() => refetchOwners()}
                      className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
            <OwnersTableSimple
              owners={ownersData?.users || []}
              pagination={ownersData?.pagination}
              searchTerm={searchTerm}
              filters={filters}
              selectedOwners={selectedOwners}
              onSelectionChange={setSelectedOwners}
              onPageChange={setPage}
              onRefresh={() => {
                refetchOwners()
                // Also refetch stats to update the counts
                window.location.reload()
              }}
            />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Owner Modal */}
      {showAddOwnerModal && (
        <AddOwnerModal
          onClose={() => setShowAddOwnerModal(false)}
          onSave={handleAddOwner}
        />
      )}
    </div>
  )
}
