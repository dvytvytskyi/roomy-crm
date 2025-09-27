'use client'

import { useState } from 'react'
import { Plus, Filter, Download, Mail, User, Calendar, MapPin, Phone, Mail as MailIcon, MessageSquare, Users, Building } from 'lucide-react'
import TopNavigation from '../../components/TopNavigation'
import OwnersTable from '../../components/owners/OwnersTable'
import OwnersFilters from '../../components/owners/OwnersFilters'
import AddOwnerModal from '../../components/owners/AddOwnerModal'

export default function OwnersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    nationality: [] as string[],
    units: [] as string[],
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

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      nationality: [],
      units: [],
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
    // In real app, this would save to backend
  }

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        {/* Header */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
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
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Owners</p>
                  <p className="text-2xl font-medium text-slate-900">24</p>
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
                  <p className="text-2xl font-medium text-slate-900">18</p>
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
                  <p className="text-2xl font-medium text-slate-900">156</p>
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
                  <p className="text-2xl font-medium text-slate-900">8</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-8 px-2 sm:px-3 lg:px-4 py-1.5 min-h-0 overflow-hidden">
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
              <OwnersTable
                searchTerm={searchTerm}
                filters={filters}
                selectedOwners={selectedOwners}
                onSelectionChange={setSelectedOwners}
              />
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
