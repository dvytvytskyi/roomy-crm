'use client'

import { useState, useEffect, useCallback } from 'react'
import TopNavigation from '../../components/TopNavigation'
import FinancialsOverview from '../../components/finances/FinancialsOverview'
import FinancialsTable from '../../components/finances/FinancialsTable'
import FinancialsFilters from '../../components/finances/FinancialsFilters'
import AddPaymentModal from '../../components/finances/AddPaymentModal'
import { Filter, Download, Plus, DollarSign, TrendingUp, TrendingDown, CreditCard, AlertCircle } from 'lucide-react'
import { financeService, FinancialTransaction, FinancialStats, FinancialFilters as FinancialFiltersType } from '../../lib/api/services/financeService'

export default function FinancialsPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [filters, setFilters] = useState<FinancialFiltersType>({})
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load transactions with filters
        const transactionsResponse = await financeService.getFinancialTransactions({
          ...filters,
          search: searchTerm || undefined,
          dateFrom: dateRange.from || undefined,
          dateTo: dateRange.to || undefined
        })
        
        // Load stats
        const statsResponse = await financeService.getFinancialStats({
          dateFrom: dateRange.from || undefined,
          dateTo: dateRange.to || undefined
        })
        
        setTransactions(transactionsResponse.data)
        setStats(statsResponse.data)
      } catch (error) {
        console.error('Error loading financial data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters, searchTerm, dateRange])

  const handleBulkAction = async (action: 'export' | 'markPaid' | 'generateInvoice') => {
    if (selectedTransactions.length === 0) return
    
    try {
      switch (action) {
        case 'export':
          const blob = await financeService.exportTransactions(selectedTransactions)
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'financial_transactions.csv'
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          break
        case 'markPaid':
          await financeService.markTransactionsAsPaid(selectedTransactions)
          // Reload data
          const transactionsResponse = await financeService.getFinancialTransactions({
            ...filters,
            search: searchTerm || undefined,
            dateFrom: dateRange.from || undefined,
            dateTo: dateRange.to || undefined
          })
          setTransactions(transactionsResponse.data)
          setSelectedTransactions([])
          break
        case 'generateInvoice':
          await financeService.generateInvoices(selectedTransactions)
          alert('Invoices generated successfully!')
          break
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
      alert('Error performing action. Please try again.')
    }
  }

  const handlePaymentAdded = async (payment: any) => {
    try {
      await financeService.createFinancialTransaction(payment)
      // Reload data
      const transactionsResponse = await financeService.getFinancialTransactions({
        ...filters,
        search: searchTerm || undefined,
        dateFrom: dateRange.from || undefined,
        dateTo: dateRange.to || undefined
      })
      setTransactions(transactionsResponse.data)
    } catch (error) {
      console.error('Error adding payment:', error)
      alert('Error adding payment. Please try again.')
    }
  }

  const handleSelectionChange = useCallback((newSelection: number[]) => {
    setSelectedTransactions(newSelection)
  }, [])

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
            <FinancialsOverview 
              dateRange={dateRange} 
              stats={stats}
              loading={loading}
            />

            {/* Search */}
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
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            )}

            {/* Main Content - Table */}
            <div className="bg-white rounded-xl border border-gray-200">
              <FinancialsTable 
                transactions={transactions}
                loading={loading}
                selectedTransactions={selectedTransactions}
                onSelectionChange={handleSelectionChange}
              />
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