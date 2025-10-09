'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Plus, Calendar, Tag, FileText, Trash2, Edit, RefreshCw } from 'lucide-react'
import { FinancialService, PropertyFinancialData, FinancialFilters } from '@/lib/api/services/financialService'

interface FinancialTabProps {
  propertyData: any
  onUpdate: (updates: any) => Promise<boolean>
}

interface Expense {
  id: string
  date: string
  category: string
  amount: number
  description?: string
  receipt_url?: string
  created_at: string
  updated_at: string
}

export default function FinancialTab({ propertyData, onUpdate }: FinancialTabProps) {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // New financial data state
  const [financialData, setFinancialData] = useState<PropertyFinancialData | null>(null)
  const [financialLoading, setFinancialLoading] = useState(true)
  
  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    description: ''
  })

  // Load financial data from API (current month by default)
  const loadFinancialData = async () => {
    if (!propertyData?.id) return
    
    try {
      setFinancialLoading(true)
      setError(null)
      
      // Get current month date range
      const dateRange = FinancialService.getDateRange('current-month')
      const filters: FinancialFilters = {
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        propertyId: propertyData.id
      }
      
      const data = await FinancialService.getPropertyFinancialData(propertyData.id, filters)
      setFinancialData(data)
    } catch (err) {
      console.error('Error loading financial data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load financial data')
    } finally {
      setFinancialLoading(false)
    }
  }

  // Load expenses from API
  const loadExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyData?.id}/expenses`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setExpenses(result.data || [])
        } else {
          setError(result.message || 'Failed to load expenses')
        }
      } else {
        setError(`Failed to load expenses: ${response.status}`)
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  // Load expenses on component mount
  useEffect(() => {
    if (propertyData?.id) {
      loadExpenses()
      loadFinancialData()
    }
  }, [propertyData?.id])

  // Handle expense form changes
  const handleExpenseFormChange = (field: string, value: string) => {
    setExpenseForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Submit expense form
  const handleSubmitExpense = async () => {
    try {
      setSubmitting(true)
      setError(null)

      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_V2_URL}/properties/${propertyData?.id}/expenses`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: expenseForm.date,
            category: expenseForm.category,
            amount: parseFloat(expenseForm.amount),
            description: expenseForm.description || undefined
          })
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Reset form
          setExpenseForm({
            date: new Date().toISOString().split('T')[0],
            category: '',
            amount: '',
            description: ''
          })
          setShowAddExpenseModal(false)
          // Reload expenses
          loadExpenses()
        } else {
          setError(result.message || 'Failed to create expense')
        }
      } else {
        setError(`Failed to create expense: ${response.status}`)
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      setError('Failed to create expense')
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Financial Summary Calculations
   * 
   * Data Sources:
   * 1. Revenue: from `reservations` table (status: CONFIRMED, CHECKED_IN, CHECKED_OUT)
   * 2. Expenses: from `expenses` table (filtered by property_id)
   * 3. Agency Fee: calculated using `properties.agency_fee_percentage` (default: 25%)
   * 4. Platform Fees: calculated as 3% of revenue
   * 5. Owner Payout: revenue - agency_fee - platform_fees
   * 6. Metrics: ADR, RevPAR, Occupancy Rate from reservations data
   */
  const totalExpenses = financialData?.totalExpenses || expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalRevenue = financialData?.totalRevenue || 0
  const totalProfit = financialData?.netProfit || 0
  const ownerPayout = financialData?.ownerPayout || 0
  const companyRevenue = financialData?.agencyFee || 0
  const platformFees = financialData?.platformFees || 0
  const profitMargin = financialData?.profitMargin || 0

  // Use expenses by category from financial data or calculate from local expenses
  const expensesByCategory = financialData?.expensesByCategory || expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  // Get top expense categories
  const topCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const financialSummary = {
    totalRevenue,
    totalExpenses,
    totalProfit,
    ownerPayout,
    companyRevenue,
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {FinancialService.formatCurrency(financialSummary.totalRevenue)}
          </p>
          {financialData && (
            <p className="text-xs text-gray-500 mt-1">
              {financialData.totalBookings} bookings • ADR: {FinancialService.formatCurrency(financialData.adr)}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {FinancialService.formatCurrency(financialSummary.totalExpenses)}
          </p>
          {financialData && (
            <p className="text-xs text-gray-500 mt-1">
              {Object.keys(expensesByCategory).length} categories
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {FinancialService.formatCurrency(financialSummary.totalProfit)}
          </p>
          {financialData && (
            <p className="text-xs text-gray-500 mt-1">
              Margin: {FinancialService.formatPercentage(profitMargin)}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Owner Payout</h3>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {FinancialService.formatCurrency(financialSummary.ownerPayout)}
          </p>
          {financialData && (
            <p className="text-xs text-gray-500 mt-1">
              Agency Fee: {FinancialService.formatCurrency(financialSummary.companyRevenue)}
            </p>
          )}
        </div>
      </div>

      {/* Advanced Metrics */}
      {financialData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{FinancialService.formatPercentage(financialData.occupancyRate)}</div>
              <div className="text-sm text-gray-600">Occupancy Rate</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{FinancialService.formatCurrency(financialData.adr)}</div>
              <div className="text-sm text-gray-600">Average Daily Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{FinancialService.formatCurrency(financialData.revpar)}</div>
              <div className="text-sm text-gray-600">RevPAR</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{FinancialService.formatPercentage(financialData.cancellationRate)}</div>
              <div className="text-sm text-gray-600">Cancellation Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Income Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Owner Payout</span>
            <span className="text-lg font-bold text-gray-900">{FinancialService.formatCurrency(financialSummary.ownerPayout)}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Agency Fee</span>
            <span className="text-lg font-bold text-gray-900">{FinancialService.formatCurrency(financialSummary.companyRevenue)}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Platform Fees</span>
            <span className="text-lg font-bold text-gray-900">{FinancialService.formatCurrency(platformFees)}</span>
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      {Object.keys(expensesByCategory).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${FinancialService.getCategoryColor(category)}`}>
                    {category}
                  </span>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {FinancialService.formatCurrency(amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {((amount / totalExpenses) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reservations */}
      {financialData && financialData.recentReservations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reservations</h2>
          <div className="space-y-3">
            {financialData.recentReservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {reservation.guestName || 'Guest'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(reservation.checkIn).toLocaleDateString()} - {new Date(reservation.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{FinancialService.formatCurrency(reservation.totalAmount)}</p>
                  <p className="text-xs text-gray-500 capitalize">{reservation.status.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
          <div className="flex space-x-2">
            <button
              onClick={loadExpenses}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <TrendingUp size={16} />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Loading expenses...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{expense.description || 'No description'}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                      AED {expense.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No expenses recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Expense</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => handleExpenseFormChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => handleExpenseFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Taxes">Taxes</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Amount (AED)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => handleExpenseFormChange('amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => handleExpenseFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitExpense}
                  disabled={submitting || !expenseForm.category || !expenseForm.amount}
                  className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

