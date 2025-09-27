'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import MaintenanceTable from '../../components/maintenance/MaintenanceTable'
import MaintenanceFilters from '../../components/maintenance/MaintenanceFilters'
import AddMaintenanceModal from '../../components/maintenance/AddMaintenanceModal'
import { Plus, Filter, Wrench, Home, Calendar, Search } from 'lucide-react'

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaintenance, setSelectedMaintenance] = useState<number[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const handleBulkAction = (action: 'complete' | 'export' | 'assign') => {
    if (selectedMaintenance.length === 0) return
    
    switch (action) {
      case 'complete':
        console.log('Marking as completed:', selectedMaintenance)
        break
      case 'export':
        console.log('Exporting:', selectedMaintenance)
        break
      case 'assign':
        console.log('Assigning technician to:', selectedMaintenance)
        break
    }
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
                <h1 className="text-2xl font-semibold text-slate-900">Maintenance</h1>
              </div>
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search maintenance tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                  />
                </div>

                {/* Add Task */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Task</span>
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
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Tasks</p>
                  <p className="text-2xl font-medium text-slate-900">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Scheduled</p>
                  <p className="text-2xl font-medium text-slate-900">8</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Wrench className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">In Progress</p>
                  <p className="text-2xl font-medium text-slate-900">5</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Home className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Completed</p>
                  <p className="text-2xl font-medium text-slate-900">11</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMaintenance.length > 0 && (
          <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-orange-700 font-medium">
                    {selectedMaintenance.length} task{selectedMaintenance.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedMaintenance([])}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium underline cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('complete')}
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleBulkAction('assign')}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium cursor-pointer"
                  >
                    Assign Technician
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
                <MaintenanceFilters 
                  isOpen={true}
                  onClose={() => {}}
                  isSidebar={true}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              <MaintenanceTable 
                searchTerm={searchTerm}
                selectedMaintenance={selectedMaintenance}
                onSelectionChange={setSelectedMaintenance}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMaintenanceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}