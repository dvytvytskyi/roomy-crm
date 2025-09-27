'use client'

import { useState } from 'react'
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, BarChart3, PieChart } from 'lucide-react'

interface ReservationsBlockProps {
  viewMode: 'chart' | 'table'
  selectedPeriod: string
}

export default function ReservationsBlock({ viewMode, selectedPeriod }: ReservationsBlockProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'revenue' | 'status'>('trends')

  // Mock data for reservations analytics
  const reservationsData = {
    trends: {
      monthly: [
        { month: 'Jan', reservations: 12, cancellations: 2, net: 10 },
        { month: 'Feb', reservations: 15, cancellations: 1, net: 14 },
        { month: 'Mar', reservations: 18, cancellations: 3, net: 15 },
        { month: 'Apr', reservations: 16, cancellations: 2, net: 14 },
        { month: 'May', reservations: 22, cancellations: 1, net: 21 },
        { month: 'Jun', reservations: 25, cancellations: 4, net: 21 },
        { month: 'Jul', reservations: 28, cancellations: 2, net: 26 },
        { month: 'Aug', reservations: 30, cancellations: 3, net: 27 }
      ],
      seasonal: [
        { season: 'Q1', reservations: 45, revenue: 45600, avgStay: 3.8 },
        { season: 'Q2', reservations: 63, revenue: 67800, avgStay: 4.1 },
        { season: 'Q3', reservations: 85, revenue: 89200, avgStay: 4.3 },
        { season: 'Q4', reservations: 72, revenue: 78900, avgStay: 4.0 }
      ]
    },
    revenue: {
      byPlatform: [
        { platform: 'Airbnb', reservations: 45, revenue: 50200, avgRevenue: 1116, percentage: 40.0 },
        { platform: 'Booking.com', reservations: 34, revenue: 37650, avgRevenue: 1107, percentage: 30.0 },
        { platform: 'Direct', reservations: 23, revenue: 25100, avgRevenue: 1091, percentage: 20.0 },
        { platform: 'Expedia', reservations: 12, revenue: 12450, avgRevenue: 1038, percentage: 10.0 }
      ],
      byUnit: [
        { unit: 'Apartment Burj Khalifa 2', reservations: 18, revenue: 24500, avgRevenue: 1361 },
        { unit: 'Marina View Studio', reservations: 15, revenue: 18900, avgRevenue: 1260 },
        { unit: 'Downtown Loft 2BR', reservations: 16, revenue: 22100, avgRevenue: 1381 },
        { unit: 'JBR Beach Apartment', reservations: 14, revenue: 19800, avgRevenue: 1414 },
        { unit: 'Business Bay Office', reservations: 12, revenue: 15600, avgRevenue: 1300 },
        { unit: 'DIFC Penthouse', reservations: 8, revenue: 24500, avgRevenue: 3063 }
      ]
    },
    status: {
      confirmed: 89,
      pending: 12,
      cancelled: 8,
      completed: 76,
      total: 109,
      cancellationRate: 7.3,
      confirmationRate: 81.7
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
    { id: 'trends', label: 'Booking Trends', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue by Reservation', icon: DollarSign },
    { id: 'status', label: 'Reservation Status', icon: Calendar }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Reservations Analytics</h2>
          <p className="text-sm text-slate-500">Booking trends, revenue analysis, and status tracking</p>
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
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Monthly Trends */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Monthly Booking Trends</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-600">Reservations vs Cancellations</span>
                  <span className="text-sm font-medium text-slate-900">
                    Net: {reservationsData.trends.monthly.reduce((sum, month) => sum + month.net, 0)} reservations
                  </span>
                </div>
                <div className="flex items-end space-x-2 h-32">
                  {reservationsData.trends.monthly.map((trend, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="flex items-end space-x-1 mb-1">
                        <div 
                          className="w-3 bg-green-500 rounded-t"
                          style={{ height: `${(trend.reservations / Math.max(...reservationsData.trends.monthly.map(t => t.reservations))) * 80}px` }}
                          title={`Reservations: ${trend.reservations}`}
                        ></div>
                        <div 
                          className="w-3 bg-red-500 rounded-t"
                          style={{ height: `${(trend.cancellations / Math.max(...reservationsData.trends.monthly.map(t => t.cancellations))) * 80}px` }}
                          title={`Cancellations: ${trend.cancellations}`}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500 mt-2">{trend.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs text-slate-600">Reservations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-xs text-slate-600">Cancellations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seasonal Analysis */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Seasonal Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reservationsData.trends.seasonal.map((season, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4">
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-slate-900">{season.season}</h4>
                      <p className="text-2xl font-bold text-orange-600">{season.reservations}</p>
                      <p className="text-sm text-slate-600">reservations</p>
                      <p className="text-sm font-medium text-slate-900 mt-2">{formatCurrency(season.revenue)}</p>
                      <p className="text-xs text-slate-500">Avg stay: {season.avgStay} nights</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Platform */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Revenue by Platform</h3>
                <div className="space-y-3">
                  {reservationsData.revenue.byPlatform.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{platform.platform}</span>
                          <span className="text-sm text-slate-600">{formatCurrency(platform.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${platform.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">{platform.reservations} reservations</span>
                          <span className="text-xs text-slate-500">{formatCurrency(platform.avgRevenue)} avg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Unit */}
              <div>
                <h3 className="text-md font-medium text-slate-900 mb-4">Revenue by Unit</h3>
                <div className="space-y-3">
                  {reservationsData.revenue.byUnit.map((unit, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-900">{unit.unit}</span>
                          <span className="text-sm text-slate-600">{formatCurrency(unit.revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${(unit.revenue / Math.max(...reservationsData.revenue.byUnit.map(u => u.revenue))) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">{unit.reservations} reservations</span>
                          <span className="text-xs text-slate-500">{formatCurrency(unit.avgRevenue)} avg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Confirmed</p>
                    <p className="text-2xl font-bold text-green-700">{reservationsData.status.confirmed}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{reservationsData.status.pending}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Cancelled</p>
                    <p className="text-2xl font-bold text-red-700">{reservationsData.status.cancelled}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Completed</p>
                    <p className="text-2xl font-bold text-blue-700">{reservationsData.status.completed}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Status Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 font-medium">Total Reservations</p>
                  <p className="text-2xl font-bold text-slate-900">{reservationsData.status.total}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 font-medium">Confirmation Rate</p>
                  <p className="text-2xl font-bold text-green-600">{reservationsData.status.confirmationRate}%</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 font-medium">Cancellation Rate</p>
                  <p className="text-2xl font-bold text-red-600">{reservationsData.status.cancellationRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
