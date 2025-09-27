'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, AlertCircle, Calendar, Filter } from 'lucide-react'

interface FinancialsOverviewProps {
  dateRange: {
    from: string
    to: string
  }
}

export default function FinancialsOverview({ dateRange }: FinancialsOverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

  // Mock financial data
  const financialData = {
    totalRevenue: 125400,
    pendingPayments: 8500,
    totalExpenses: 18700,
    netIncome: 106700,
    transactionsCount: 47,
    averageTransaction: 2668,
    refundsAmount: 1200,
    platformFees: 3762
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
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors cursor-pointer ${
                    selectedPeriod === period.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  className="h-8 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="text-sm text-slate-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
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
              <p className="text-2xl font-medium text-slate-900">{formatCurrency(financialData.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5%</span>
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
              <p className="text-2xl font-medium text-slate-900">{formatCurrency(financialData.pendingPayments)}</p>
              <div className="flex items-center mt-1">
                <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600">8 transactions</span>
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
              <p className="text-2xl font-medium text-slate-900">{formatCurrency(financialData.totalExpenses)}</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-3.2%</span>
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
              <p className="text-2xl font-medium text-slate-900">{formatCurrency(financialData.netIncome)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15.8%</span>
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
              <p className="text-xl font-medium text-slate-900">{financialData.transactionsCount}</p>
              <p className="text-sm text-slate-500">Avg: {formatCurrency(financialData.averageTransaction)}</p>
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
              <p className="text-xl font-medium text-slate-900">{formatCurrency(financialData.platformFees)}</p>
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
              <p className="text-xl font-medium text-slate-900">{formatCurrency(financialData.refundsAmount)}</p>
              <p className="text-sm text-slate-500">2 transactions</p>
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
