'use client'

import { useState, useEffect } from 'react'
import { 
  Home, 
  Users, 
  UserCheck, 
  User, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  Clock,
  Building,
  FileText,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { dashboardServiceV2, DashboardStatsV2, BirthdayDetail } from '@/lib/api/services/dashboardService-v2'

export default function DashboardPage() {
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-lg text-gray-600">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadDashboardStats}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const todayBirthdays = formatBirthdayDetails(stats.birthdays.today.details)
  const weekBirthdays = formatBirthdayDetails(stats.birthdays.thisWeek.details)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Live information and statistics
              {lastUpdated && (
                <span className="ml-2 text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={loadDashboardStats}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Operations Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                Operations Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Check-ins Today</p>
                      <p className="text-2xl font-bold text-green-900">{stats.operations.checkInsToday}</p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Check-outs Today</p>
                      <p className="text-2xl font-bold text-red-900">{stats.operations.checkOutsToday}</p>
                    </div>
                    <div className="bg-red-100 rounded-full p-3">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Maintenance in Progress</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.operations.maintenanceInProgress}</p>
                    </div>
                    <div className="bg-orange-100 rounded-full p-3">
                      <Wrench className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Occupancy Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-500" />
                Occupancy Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Units</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.occupancy.totalUnits}</p>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Empty Units (7+ nights)</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.occupancy.emptyUnits}</p>
                    </div>
                    <div className="bg-gray-100 rounded-full p-3">
                      <Building className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Occupancy Rate</p>
                      <p className="text-2xl font-bold text-green-900">{stats.occupancy.occupancyRate}%</p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Birthdays */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Birthdays
              </h2>
              
              {/* Today's Birthdays */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Today ({todayBirthdays.length})</h3>
                {todayBirthdays.length > 0 ? (
                  <div className="space-y-2">
                    {todayBirthdays.map((person) => (
                      <div key={person.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getRoleIcon(person.role)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {person.firstName} {person.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{person.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(person.role)}`}>
                          {person.roleLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No birthdays today</p>
                )}
              </div>

              {/* This Week's Birthdays */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Within 7 Days ({weekBirthdays.length})</h3>
                {weekBirthdays.length > 0 ? (
                  <div className="space-y-2">
                    {weekBirthdays.map((person) => (
                      <div key={person.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getRoleIcon(person.role)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {person.firstName} {person.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{person.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(person.role)}`}>
                          {person.roleLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No birthdays this week</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Alerts & Reminders
              </h2>
              
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">DTCM Permits Expiring</p>
                      <p className="text-2xl font-bold text-red-900">{stats.alerts.dtcmPermitsExpiring}</p>
                      <p className="text-xs text-red-600 mt-1">Within 7 days</p>
                    </div>
                    <div className="bg-red-100 rounded-full p-3">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Utilities Payment Reminders</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.alerts.utilitiesReminders}</p>
                      <p className="text-xs text-yellow-600 mt-1">Pending payments</p>
                    </div>
                    <div className="bg-yellow-100 rounded-full p-3">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-900">New Reservation</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Create Maintenance Task</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Add Guest</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Add Property</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
