'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Download, Eye } from 'lucide-react'

interface FinancialsBlockProps {
  viewMode: 'chart' | 'table'
  selectedPeriod: string
}

export default function FinancialsBlock({ viewMode, selectedPeriod }: FinancialsBlockProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses' | 'profit'>('revenue')

  // Mock data for financial analytics
  const financialData = {
    revenue: {
      total: 125400,
      byUnit: [
        { unit: 'Apartment Burj Khalifa 2', revenue: 24500, percentage: 19.5 },
        { unit: 'Marina View Studio', revenue: 18900, percentage: 15.1 },
        { unit: 'Downtown Loft 2BR', revenue: 22100, percentage: 17.6 },
        { unit: 'JBR Beach Apartment', revenue: 19800, percentage: 15.8 },
        { unit: 'Business Bay Office', revenue: 15600, percentage: 12.4 },
        { unit: 'DIFC Penthouse', revenue: 24500, percentage: 19.5 }
      ],
      bySource: [
        { source: 'Airbnb', revenue: 50200, percentage: 40.0 },
        { source: 'Booking.com', revenue: 37650, percentage: 30.0 },
        { source: 'Direct', revenue: 25100, percentage: 20.0 },
        { source: 'Expedia', revenue: 12450, percentage: 10.0 }
      ],
      trends: [
        { month: 'Jan', revenue: 11200 },
        { month: 'Feb', revenue: 12800 },
        { month: 'Mar', revenue: 14500 },
        { month: 'Apr', revenue: 13200 },
        { month: 'May', revenue: 15800 },
        { month: 'Jun', revenue: 14200 },
        { month: 'Jul', revenue: 16800 },
        { month: 'Aug', revenue: 17500 }
      ]
    },
    expenses: {
      total: 18700,
      categories: [
        { category: 'Cleaning', amount: 5600, percentage: 29.9 },
        { category: 'Maintenance', amount: 4200, percentage: 22.5 },
        { category: 'Platform Fees', amount: 3762, percentage: 20.1 },
        { category: 'Utilities', amount: 2800, percentage: 15.0 },
        { category: 'Insurance', amount: 1800, percentage: 9.6 },
        { category: 'Other', amount: 538, percentage: 2.9 }
      ],
      byUnit: [
        { unit: 'Apartment Burj Khalifa 2', expenses: 3200 },
        { unit: 'Marina View Studio', expenses: 2800 },
        { unit: 'Downtown Loft 2BR', expenses: 3100 },
        { unit: 'JBR Beach Apartment', expenses: 2900 },
        { unit: 'Business Bay Office', expenses: 2500 },
        { unit: 'DIFC Penthouse', expenses: 4200 }
      ]
    },
    profit: {
      net: 106700,
      byUnit: [
        { unit: 'Apartment Burj Khalifa 2', profit: 21300, margin: 86.9 },
        { unit: 'Marina View Studio', profit: 16100, margin: 85.2 },
        { unit: 'Downtown Loft 2BR', profit: 19000, margin: 86.0 },
        { unit: 'JBR Beach Apartment', profit: 16900, margin: 85.4 },
        { unit: 'Business Bay Office', profit: 13100, margin: 84.0 },
        { unit: 'DIFC Penthouse', profit: 20300, margin: 82.9 }
      ]
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const tabs = [
    { id: 'revenue', label: 'Revenue Overview', icon: TrendingUp },
    { id: 'expenses', label: 'Expense Tracking', icon: TrendingDown },
    { id: 'profit', label: 'Profit Analysis', icon: DollarSign }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Financials Analytics</h2>
          <p className="text-sm text-slate-500">Revenue, expenses, and profit analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <Eye size={16} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Unit */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Revenue by Unit</h3>
                <div className="space-y-3">
                  {financialData.revenue.byUnit.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{item.unit}</span>
                          <span className="text-sm text-slate-600">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Source */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Revenue by Source</h3>
                <div className="space-y-3">
                  {financialData.revenue.bySource.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{item.source}</span>
                          <span className="text-sm text-slate-600">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Trends */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Revenue Trends</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-600">Monthly Revenue (AED)</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(financialData.revenue.total)}
                  </span>
                </div>
                <div className="flex items-end space-x-2 h-32">
                  {financialData.revenue.trends.map((trend, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-orange-500 rounded-t"
                        style={{ 
                          height: `${(trend.revenue / Math.max(...financialData.revenue.trends.map(t => t.revenue))) * 100}%` 
                        }}
                      ></div>
                      <span className="text-xs text-slate-500 mt-2">{trend.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Expense Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Expense Categories</h3>
                <div className="space-y-3">
                  {financialData.expenses.categories.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{item.category}</span>
                          <span className="text-sm text-slate-600">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Expenses by Unit</h3>
                <div className="space-y-3">
                  {financialData.expenses.byUnit.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{item.unit}</span>
                          <span className="text-sm text-slate-600">{formatCurrency(item.expenses)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${(item.expenses / Math.max(...financialData.expenses.byUnit.map(e => e.expenses))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="space-y-6">
            {/* Unit Profitability */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Unit Profitability</h3>
              <div className="space-y-3">
                {financialData.profit.byUnit.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900">{item.unit}</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(item.profit)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Profit Margin</span>
                        <span className="text-xs font-medium text-green-600">{item.margin}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profit Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Net Profit</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(financialData.profit.net)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                    <p className="text-xl font-bold text-blue-700">{formatCurrency(financialData.revenue.total)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(financialData.expenses.total)}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
