'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import AnalyticsOverview from '../../components/analytics/AnalyticsOverview'
import FinancialsBlock from '../../components/analytics/FinancialsBlock'
import UnitsBlock from '../../components/analytics/UnitsBlock'
import OwnersBlock from '../../components/analytics/OwnersBlock'
import ReservationsBlock from '../../components/analytics/ReservationsBlock'
import AgentsBlock from '../../components/analytics/AgentsBlock'
import CustomReportsBlock from '../../components/analytics/CustomReportsBlock'
import { TrendingUp, Calendar, Download, Filter, BarChart3, PieChart, LineChart } from 'lucide-react'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  })
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ]

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
                <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
              </div>
              <div className="flex items-center space-x-3">
                {/* Period Selector */}
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
                
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('chart')}
                    className={`p-2 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'chart' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                    }`}
                    title="Chart View"
                  >
                    <BarChart3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                    }`}
                    title="Table View"
                  >
                    <PieChart size={16} />
                  </button>
                </div>

                {/* Export Button */}
                <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer">
                  <Download size={16} />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/* Analytics Overview */}
            <AnalyticsOverview 
              selectedPeriod={selectedPeriod}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            {/* Analytics Blocks */}
            <div className="space-y-6">
              {/* Financials Block */}
              <FinancialsBlock viewMode={viewMode} selectedPeriod={selectedPeriod} />

              {/* Units Block */}
              <UnitsBlock viewMode={viewMode} selectedPeriod={selectedPeriod} />

              {/* Owners Block */}
              <OwnersBlock viewMode={viewMode} selectedPeriod={selectedPeriod} />

              {/* Reservations Block */}
              <ReservationsBlock viewMode={viewMode} selectedPeriod={selectedPeriod} />

              {/* Agents Block */}
              <AgentsBlock viewMode={viewMode} selectedPeriod={selectedPeriod} />

              {/* Custom Reports Block */}
              <CustomReportsBlock viewMode={viewMode} selectedPeriod={selectedPeriod} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
