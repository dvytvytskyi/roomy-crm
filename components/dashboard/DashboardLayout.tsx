'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import TopNavigation from '../TopNavigation'
import CheckInOutStats from './CheckInOutStats'
import MaintenanceStats from './MaintenanceStats'
import UnitStats from './UnitStats'
import BirthdaysSection from './BirthdaysSection'
import DTCMAlerts from './DTCMAlerts'
import UtilitiesReminders from './UtilitiesReminders'
import { dashboardServiceV2, DashboardStatsV2 } from '@/lib/api/services/dashboardService-v2'

interface DashboardLayoutProps {
  className?: string
}

export default function DashboardLayout({ className = '' }: DashboardLayoutProps) {
  const [stats, setStats] = useState<DashboardStatsV2 | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await dashboardServiceV2.getStats()
      
      if (response.success && response.data) {
        setStats(response.data)
        setLastUpdated(new Date())
      } else {
        setError(response.message || 'Failed to load dashboard statistics')
      }
    } catch (err: any) {
      setError('Error loading dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardStats()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardStats, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className={`pt-20 px-6 py-6 ${className}`}>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-lg text-gray-600">Завантаження dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className={`pt-20 px-6 py-6 ${className}`}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Помилка завантаження Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadDashboardStats}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Спробувати знову
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  // Get real data from API response
  const expiringUnits = stats.alerts.dtcmExpiringUnits || []
  const utilitiesReminders = stats.alerts.utilitiesPaymentReminders || []

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      <div className={`pt-20 px-6 py-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Overview
              {lastUpdated && (
                <span className="ml-2 text-xs text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString('en-US')}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={loadDashboardStats}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Main Stats */}
          <div className="xl:col-span-3 space-y-6">
            {/* Check-ins & Check-outs */}
            <CheckInOutStats 
              checkInsToday={stats.operations.checkInsToday}
              checkOutsToday={stats.operations.checkOutsToday}
            />

            {/* Maintenance */}
            <MaintenanceStats 
              maintenanceInProgress={stats.operations.maintenanceInProgress}
            />

            {/* Unit Statistics */}
            <UnitStats 
              totalUnits={stats.occupancy.totalUnits}
              emptyUnits={stats.occupancy.emptyUnits}
              occupancyRate={stats.occupancy.occupancyRate}
            />
          </div>

          {/* Right Column - Alerts & Reminders */}
          <div className="xl:col-span-1 space-y-6">
            {/* Birthdays */}
            <BirthdaysSection 
              today={stats.birthdays.today}
              thisWeek={stats.birthdays.thisWeek}
            />

            {/* DTCM Permits */}
            <DTCMAlerts 
              dtcmPermitsExpiring={stats.alerts.dtcmPermitsExpiring}
              expiringUnits={expiringUnits} 
            />

            {/* Utilities Reminders */}
            <UtilitiesReminders utilitiesReminders={stats.alerts.utilitiesReminders} />
          </div>
        </div>
      </div>
    </div>
  )
}
