'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Users, Home, Calendar, BarChart3, PieChart } from 'lucide-react'

interface AnalyticsOverviewProps {
  selectedPeriod: string
  dateRange: {
    from: string
    to: string
  }
  onDateRangeChange: (range: { from: string; to: string }) => void
}

export default function AnalyticsOverview({ selectedPeriod, dateRange, onDateRangeChange }: AnalyticsOverviewProps) {
  // Mock data for key metrics
  const keyMetrics = {
    totalRevenue: 125400,
    totalExpenses: 18700,
    netProfit: 106700,
    occupancyRate: 78.5,
    totalUnits: 12,
    activeReservations: 47,
    averageStayDuration: 4.2,
    revenueGrowth: 12.5,
    expenseGrowth: -3.2,
    profitGrowth: 15.8,
    occupancyGrowth: 8.3
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-medium text-slate-900">{formatCurrency(keyMetrics.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{formatPercentage(keyMetrics.revenueGrowth)}</span>
                <span className="text-sm text-slate-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Net Profit</p>
              <p className="text-2xl font-medium text-slate-900">{formatCurrency(keyMetrics.netProfit)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{formatPercentage(keyMetrics.profitGrowth)}</span>
                <span className="text-sm text-slate-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Occupancy Rate</p>
              <p className="text-2xl font-medium text-slate-900">{keyMetrics.occupancyRate}%</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{formatPercentage(keyMetrics.occupancyGrowth)}</span>
                <span className="text-sm text-slate-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Home className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Active Reservations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Active Reservations</p>
              <p className="text-2xl font-medium text-slate-900">{keyMetrics.activeReservations}</p>
              <div className="flex items-center mt-1">
                <Calendar className="w-4 h-4 text-slate-400 mr-1" />
                <span className="text-sm text-slate-500">Avg {keyMetrics.averageStayDuration} nights</span>
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Expenses</p>
              <p className="text-xl font-medium text-slate-900">{formatCurrency(keyMetrics.totalExpenses)}</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">{formatPercentage(keyMetrics.expenseGrowth)}</span>
                <span className="text-sm text-slate-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>

        {/* Total Units */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Total Units</p>
              <p className="text-xl font-medium text-slate-900">{keyMetrics.totalUnits}</p>
              <p className="text-sm text-slate-500 mt-1">Properties managed</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <Home className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">Profit Margin</p>
              <p className="text-xl font-medium text-slate-900">
                {((keyMetrics.netProfit / keyMetrics.totalRevenue) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-slate-500 mt-1">Net profit ratio</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Revenue Growth</p>
              <p className="text-sm text-slate-600">Strong performance with {formatPercentage(keyMetrics.revenueGrowth)} growth</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Home className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">High Occupancy</p>
              <p className="text-sm text-slate-600">{keyMetrics.occupancyRate}% occupancy rate is above industry average</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <PieChart className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Cost Control</p>
              <p className="text-sm text-slate-600">Expenses decreased by {formatPercentage(Math.abs(keyMetrics.expenseGrowth))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
