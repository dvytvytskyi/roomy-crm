'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Download, Eye } from 'lucide-react'
import { analyticsService, FinancialAnalytics } from '../../lib/api/services/analyticsService'

interface FinancialsBlockProps {
  viewMode: 'chart' | 'table'
  selectedPeriod: string
}

export default function FinancialsBlock({ viewMode, selectedPeriod }: FinancialsBlockProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses' | 'profit'>('revenue')
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState<FinancialAnalytics | null>(null)

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true)
        const response = await analyticsService.getFinancialAnalytics({
          period: selectedPeriod as any,
          viewMode: viewMode
        })
        setFinancialData(response.data)
      } catch (error) {
        console.error('Error loading financial analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFinancialData()
  }, [viewMode, selectedPeriod])

  if (loading || !financialData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
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
