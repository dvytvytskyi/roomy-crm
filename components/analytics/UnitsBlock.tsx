'use client'

import { useState } from 'react'
import { Home, TrendingUp, TrendingDown, DollarSign, Calendar, Wrench, Sparkles } from 'lucide-react'

interface UnitsBlockProps {
  viewMode: 'chart' | 'table'
  selectedPeriod: string
}

export default function UnitsBlock({ viewMode, selectedPeriod }: UnitsBlockProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'costs' | 'occupancy'>('performance')

  // Mock data for units analytics
  const unitsData = {
    performance: [
      {
        unit: 'Apartment Burj Khalifa 2',
        revenue: 24500,
        expenses: 3200,
        profit: 21300,
        occupancyRate: 85.2,
        revenuePerNight: 320,
        totalNights: 76,
        avgStayDuration: 4.1
      },
      {
        unit: 'Marina View Studio',
        revenue: 18900,
        expenses: 2800,
        profit: 16100,
        occupancyRate: 78.5,
        revenuePerNight: 280,
        totalNights: 68,
        avgStayDuration: 3.8
      },
      {
        unit: 'Downtown Loft 2BR',
        revenue: 22100,
        expenses: 3100,
        profit: 19000,
        occupancyRate: 82.1,
        revenuePerNight: 310,
        totalNights: 71,
        avgStayDuration: 4.3
      },
      {
        unit: 'JBR Beach Apartment',
        revenue: 19800,
        expenses: 2900,
        profit: 16900,
        occupancyRate: 75.8,
        revenuePerNight: 290,
        totalNights: 68,
        avgStayDuration: 3.9
      },
      {
        unit: 'Business Bay Office',
        revenue: 15600,
        expenses: 2500,
        profit: 13100,
        occupancyRate: 72.3,
        revenuePerNight: 260,
        totalNights: 60,
        avgStayDuration: 3.5
      },
      {
        unit: 'DIFC Penthouse',
        revenue: 24500,
        expenses: 4200,
        profit: 20300,
        occupancyRate: 88.7,
        revenuePerNight: 380,
        totalNights: 64,
        avgStayDuration: 4.6
      }
    ],
    costs: {
      maintenance: [
        { unit: 'Apartment Burj Khalifa 2', amount: 1800, percentage: 20.0 },
        { unit: 'Marina View Studio', amount: 1200, percentage: 15.0 },
        { unit: 'Downtown Loft 2BR', amount: 1600, percentage: 18.0 },
        { unit: 'JBR Beach Apartment', amount: 1400, percentage: 16.0 },
        { unit: 'Business Bay Office', amount: 1000, percentage: 12.0 },
        { unit: 'DIFC Penthouse', amount: 2500, percentage: 25.0 }
      ],
      cleaning: [
        { unit: 'Apartment Burj Khalifa 2', amount: 1400, percentage: 19.0 },
        { unit: 'Marina View Studio', amount: 1000, percentage: 15.0 },
        { unit: 'Downtown Loft 2BR', amount: 1200, percentage: 17.0 },
        { unit: 'JBR Beach Apartment', amount: 1100, percentage: 16.0 },
        { unit: 'Business Bay Office', amount: 900, percentage: 13.0 },
        { unit: 'DIFC Penthouse', amount: 1800, percentage: 20.0 }
      ]
    },
    occupancy: {
      trends: [
        { month: 'Jan', occupancy: 65 },
        { month: 'Feb', occupancy: 72 },
        { month: 'Mar', occupancy: 78 },
        { month: 'Apr', occupancy: 75 },
        { month: 'May', occupancy: 82 },
        { month: 'Jun', occupancy: 88 },
        { month: 'Jul', occupancy: 85 },
        { month: 'Aug', occupancy: 90 }
      ],
      byUnit: [
        { unit: 'DIFC Penthouse', occupancy: 88.7, trend: 'up' },
        { unit: 'Apartment Burj Khalifa 2', occupancy: 85.2, trend: 'up' },
        { unit: 'Downtown Loft 2BR', occupancy: 82.1, trend: 'stable' },
        { unit: 'Marina View Studio', occupancy: 78.5, trend: 'down' },
        { unit: 'JBR Beach Apartment', occupancy: 75.8, trend: 'up' },
        { unit: 'Business Bay Office', occupancy: 72.3, trend: 'down' }
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
    { id: 'performance', label: 'Unit Performance', icon: TrendingUp },
    { id: 'costs', label: 'Maintenance & Cleaning', icon: Wrench },
    { id: 'occupancy', label: 'Occupancy Trends', icon: Calendar }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Units Analytics</h2>
          <p className="text-sm text-slate-500">Unit performance, costs, and occupancy analysis</p>
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
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Unit Performance Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Expenses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Rev/Night
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Avg Stay
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unitsData.performance.map((unit, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Home className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-900">{unit.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(unit.revenue)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(unit.expenses)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">{formatCurrency(unit.profit)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-slate-900">{unit.occupancyRate}%</span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${unit.occupancyRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{formatCurrency(unit.revenuePerNight)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-900">{unit.avgStayDuration} nights</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Maintenance Costs */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Maintenance Costs by Unit</h3>
                <div className="space-y-3">
                  {unitsData.costs.maintenance.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{item.unit}</span>
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

              {/* Cleaning Costs */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Cleaning Costs by Unit</h3>
                <div className="space-y-3">
                  {unitsData.costs.cleaning.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{item.unit}</span>
                          <span className="text-sm text-slate-600">{formatCurrency(item.amount)}</span>
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
          </div>
        )}

        {activeTab === 'occupancy' && (
          <div className="space-y-6">
            {/* Occupancy Trends */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Occupancy Trends</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-600">Monthly Occupancy Rate (%)</span>
                  <span className="text-sm font-medium text-slate-900">Average: 78.5%</span>
                </div>
                <div className="flex items-end space-x-2 h-32">
                  {unitsData.occupancy.trends.map((trend, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-orange-500 rounded-t"
                        style={{ height: `${trend.occupancy}%` }}
                      ></div>
                      <span className="text-xs text-slate-500 mt-2">{trend.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Occupancy by Unit */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Occupancy by Unit</h3>
              <div className="space-y-3">
                {unitsData.occupancy.byUnit.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900">{item.unit}</span>
                        <span className="text-sm font-medium text-slate-900">{item.occupancy}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${item.occupancy}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center">
                          {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                          {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                          {item.trend === 'stable' && <div className="w-4 h-4 bg-slate-400 rounded-full"></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
