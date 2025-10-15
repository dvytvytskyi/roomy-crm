'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Clock, 
  Wrench, 
  Building, 
  Users, 
  UserCheck, 
  User,
  AlertTriangle,
  FileText,
  RefreshCw
} from 'lucide-react'
import { dashboardServiceV2, DashboardStatsV2, BirthdayDetail } from '@/lib/api/services/dashboardService-v2'

interface DashboardStatsProps {
  className?: string
  showRefresh?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function DashboardStats({ 
  className = '', 
  showRefresh = true, 
  autoRefresh = true, 
  refreshInterval = 300000 // 5 minutes
}: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStatsV2 | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await dashboardServiceV2.getStats()
      
      if (response.success && response.data) {
        setStats(response.data)
        setLastUpdated(new Date())
      } else {
        setError(response.message || 'Failed to load statistics')
      }
    } catch (err: any) {
      setError('Error loading dashboard data')
      console.error('Dashboard stats error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    
    if (autoRefresh) {
      const interval = setInterval(loadStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const formatBirthdayDetails = (details: BirthdayDetail[]) => {
    return details.map(person => ({
      ...person,
      roleLabel: person.role === 'AGENT' ? 'Staff' : 
                 person.role === 'GUEST' ? 'Guest' : 
                 person.role === 'OWNER' ? 'Owner' : person.role
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'AGENT': return <UserCheck className="w-4 h-4" />
      case 'GUEST': return <Users className="w-4 h-4" />
      case 'OWNER': return <User className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'AGENT': return 'bg-blue-100 text-blue-800'
      case 'GUEST': return 'bg-green-100 text-green-800'
      case 'OWNER': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !stats) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
            <span className="text-gray-600">Loading statistics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600 mb-3">{error}</p>
          {showRefresh && (
            <button
              onClick={loadStats}
              className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const todayBirthdays = formatBirthdayDetails(stats.birthdays.today.details)
  const weekBirthdays = formatBirthdayDetails(stats.birthdays.thisWeek.details)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Live Statistics</h2>
        {showRefresh && (
          <button
            onClick={loadStats}
            disabled={loading}
            className="flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Operations Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Check-ins Today</p>
              <p className="text-2xl font-bold text-green-900">{stats.operations.checkInsToday}</p>
            </div>
            <div className="bg-green-100 rounded-full p-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Check-outs Today</p>
              <p className="text-2xl font-bold text-red-900">{stats.operations.checkOutsToday}</p>
            </div>
            <div className="bg-red-100 rounded-full p-2">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Maintenance Active</p>
              <p className="text-2xl font-bold text-orange-900">{stats.operations.maintenanceInProgress}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-2">
              <Wrench className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Units</p>
              <p className="text-2xl font-bold text-blue-900">{stats.occupancy.totalUnits}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empty Units</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupancy.emptyUnits}</p>
              <p className="text-xs text-gray-500">7+ nights</p>
            </div>
            <div className="bg-gray-100 rounded-full p-2">
              <Building className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-green-900">{stats.occupancy.occupancyRate}%</p>
            </div>
            <div className="bg-green-100 rounded-full p-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Birthdays */}
      {(todayBirthdays.length > 0 || weekBirthdays.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Birthdays</h3>
          
          {todayBirthdays.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Today ({todayBirthdays.length})</h4>
              <div className="space-y-2">
                {todayBirthdays.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(person.role)}
                      <span className="text-sm font-medium">
                        {person.firstName} {person.lastName}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getRoleColor(person.role)}`}>
                      {person.roleLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weekBirthdays.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">This Week ({weekBirthdays.length})</h4>
              <div className="space-y-2">
                {weekBirthdays.slice(0, 3).map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(person.role)}
                      <span className="text-sm font-medium">
                        {person.firstName} {person.lastName}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getRoleColor(person.role)}`}>
                      {person.roleLabel}
                    </span>
                  </div>
                ))}
                {weekBirthdays.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{weekBirthdays.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alerts */}
      {(stats.alerts.dtcmPermitsExpiring > 0 || stats.alerts.utilitiesReminders > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Alerts</h3>
          
          {stats.alerts.dtcmPermitsExpiring > 0 && (
            <div className="flex items-center justify-between p-2 bg-red-50 rounded mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">
                  DTCM Permits Expiring
                </span>
              </div>
              <span className="text-sm font-bold text-red-900">
                {stats.alerts.dtcmPermitsExpiring}
              </span>
            </div>
          )}

          {stats.alerts.utilitiesReminders > 0 && (
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">
                  Utilities Reminders
                </span>
              </div>
              <span className="text-sm font-bold text-yellow-900">
                {stats.alerts.utilitiesReminders}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
