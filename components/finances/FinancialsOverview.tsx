'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, AlertCircle, Calendar, Filter } from 'lucide-react'

import { FinancialOverviewV2 } from '../../lib/api/services/financialService-v2'

interface FinancialsOverviewProps {
  dateRange: {
    from: string
    to: string
  }
  onDateRangeChange: (range: { from: string; to: string }) => void
  stats: FinancialOverviewV2 | null
  loading: boolean
}

export default function FinancialsOverview({ dateRange, onDateRangeChange, stats, loading }: FinancialsOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const getCurrentPeriodDates = (period: string) => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    switch (period) {
      case 'today':
        return {
          from: startOfDay.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        }
      
      case 'week':
        const startOfWeek = new Date(startOfDay)
        startOfWeek.setDate(now.getDate() - now.getDay())
        return {
          from: startOfWeek.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        }
      
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return {
          from: startOfMonth.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        }
      
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1)
        return {
          from: startOfQuarter.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        }
      
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        return {
          from: startOfYear.toISOString().split('T')[0],
          to: endOfDay.toISOString().split('T')[0]
        }
      
      default:
        return dateRange
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    if (period !== 'custom') {
      const dates = getCurrentPeriodDates(period)
      onDateRangeChange(dates)
    }
  }

  // Use real data from props
  const financialData = stats || {
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    pendingPayments: 0,
    completedTransactions: 0,
    averageTransactionAmount: 0,
    monthlyGrowth: 0,
    topPaymentMethods: [],
    revenueByMonth: []
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Date Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Financial Overview</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors cursor-pointer ${
                    selectedPeriod === period.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            {selectedPeriod === 'custom' && (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
                  className="h-8 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
                  className="h-8 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-medium text-slate-900">
                {loading ? '...' : formatCurrency(financialData.totalRevenue)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{financialData.monthlyGrowth.toFixed(1)}%</span>
                <span className="text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Pending Payments</p>
              <p className="text-2xl font-medium text-slate-900">
                {loading ? '...' : formatCurrency(financialData.pendingPayments)}
              </p>
              <div className="flex items-center mt-1">
                <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600">{financialData.pendingPayments > 0 ? 'Pending' : '0'} transactions</span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Expenses</p>
              <p className="text-2xl font-medium text-slate-900">
                {loading ? '...' : formatCurrency(financialData.totalExpenses)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">{financialData.monthlyGrowth.toFixed(1)}%</span>
                <span className="text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Net Income */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Net Income</p>
              <p className="text-2xl font-medium text-slate-900">
                {loading ? '...' : formatCurrency(financialData.netIncome)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{financialData.monthlyGrowth.toFixed(1)}%</span>
                <span className="text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Transactions Count */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Transactions</p>
              <p className="text-xl font-medium text-slate-900">
                {loading ? '...' : financialData.completedTransactions}
              </p>
              <p className="text-sm text-slate-500">
                Avg: {loading ? '...' : formatCurrency(financialData.averageTransactionAmount)}
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Platform Fees */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Platform Fees</p>
              <p className="text-xl font-medium text-slate-900">
                {loading ? '...' : formatCurrency(financialData.totalRevenue * 0.03)}
              </p>
              <p className="text-sm text-slate-500">3.0% of revenue</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Refunds */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Refunds</p>
              <p className="text-xl font-medium text-slate-900">
                {loading ? '...' : formatCurrency(0)}
              </p>
              <p className="text-sm text-slate-500">0 transactions</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
