'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import CleaningTable from '../../components/cleaning/CleaningTable'
import CleaningFilters from '../../components/cleaning/CleaningFilters'
import AddCleaningModal from '../../components/cleaning/AddCleaningModal'
import { Plus, Filter, Sparkles, Home, Calendar } from 'lucide-react'

export default function CleaningPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCleaning, setSelectedCleaning] = useState<number[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const handleBulkAction = (action: 'complete' | 'export' | 'assign') => {
    if (selectedCleaning.length === 0) return
    
    switch (action) {
      case 'complete':
        console.log('Marking as completed:', selectedCleaning)
        break
      case 'export':
        console.log('Exporting:', selectedCleaning)
        break
      case 'assign':
        console.log('Assigning cleaner to:', selectedCleaning)
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
                <h1 className="text-2xl font-semibold text-slate-900">Cleaning</h1>
              </div>
              <div className="flex items-center space-x-3">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Tasks</p>
                  <p className="text-2xl font-medium text-slate-900">32</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Scheduled</p>
                  <p className="text-2xl font-medium text-slate-900">18</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Home className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Completed</p>
                  <p className="text-2xl font-medium text-slate-900">8</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCleaning.length > 0 && (
          <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-orange-700 font-medium">
                    {selectedCleaning.length} cleaning task(s) selected
                  </span>
                  <button
                    onClick={() => setSelectedCleaning([])}
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
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Assign Cleaner
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
                <CleaningFilters 
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
              <CleaningTable 
                searchTerm={searchTerm}
                selectedCleaning={selectedCleaning}
                onSelectionChange={setSelectedCleaning}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCleaningModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}
