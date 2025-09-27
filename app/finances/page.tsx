'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import FinancialsOverview from '../../components/finances/FinancialsOverview'
import FinancialsTable from '../../components/finances/FinancialsTable'
import FinancialsFilters from '../../components/finances/FinancialsFilters'
import AddPaymentModal from '../../components/finances/AddPaymentModal'
import { Filter, Download, Plus, DollarSign, TrendingUp, TrendingDown, CreditCard, AlertCircle } from 'lucide-react'

export default function FinancialsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })

  const handleBulkAction = (action: 'export' | 'markPaid' | 'generateInvoice') => {
    if (selectedTransactions.length === 0) return
    
    switch (action) {
      case 'export':
        console.log('Exporting transactions:', selectedTransactions)
        break
      case 'markPaid':
        console.log('Marking as paid:', selectedTransactions)
        break
      case 'generateInvoice':
        console.log('Generating invoices:', selectedTransactions)
        break
    }
  }

  const handlePaymentAdded = (payment: any) => {
    console.log('New payment added:', payment)
    // Here you would typically update the transactions list
    // For now, we'll just log it
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Header */}
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Financials</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/* Financial Overview Dashboard */}
            <FinancialsOverview dateRange={dateRange} />

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search transactions, guests, or properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80 h-10 px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 rounded-lg transition-colors font-medium cursor-pointer flex items-center"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedTransactions.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">
                        {selectedTransactions.length} selected
                      </span>
                      <button
                        onClick={() => handleBulkAction('markPaid')}
                        className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleBulkAction('generateInvoice')}
                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Generate Invoice
                      </button>
                      <button
                        onClick={() => handleBulkAction('export')}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 rounded-lg transition-colors cursor-pointer flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <FinancialsFilters 
                  onClose={() => setShowFilters(false)}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="flex gap-4">
              {/* Left Sidebar - Quick Filters */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      All Transactions
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      Pending Payments
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      Completed Payments
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      Failed Payments
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      Refunds
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      Expenses
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Content - Table */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-xl border border-gray-200">
                  <FinancialsTable 
                    searchTerm={searchTerm}
                    selectedTransactions={selectedTransactions}
                    onSelectionChange={setSelectedTransactions}
                    dateRange={dateRange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onPaymentAdded={handlePaymentAdded}
      />
    </div>
  )
}