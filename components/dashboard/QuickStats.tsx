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
import { dashboardServiceV2, DashboardStatsV2 } from '@/lib/api/services/dashboardService-v2'

interface QuickStatsProps {
  className?: string
  showLabels?: boolean
  compact?: boolean
}

export default function QuickStats({ 
  className = '', 
  showLabels = true, 
  compact = false 
}: QuickStatsProps) {
  const [stats, setStats] = useState<DashboardStatsV2 | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await dashboardServiceV2.getStats()
        if (response.success && response.data) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('QuickStats error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !stats) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  const statsItems = [
    {
      icon: TrendingUp,
      label: 'Check-ins',
      value: stats.operations.checkInsToday,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Clock,
      label: 'Check-outs',
      value: stats.operations.checkOutsToday,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: Wrench,
      label: 'Maintenance',
      value: stats.operations.maintenanceInProgress,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Building,
      label: 'Occupancy',
      value: `${stats.occupancy.occupancyRate}%`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  if (compact) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        {statsItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-1">
            <div className={`rounded-full p-1 ${item.bgColor}`}>
              <item.icon className={`w-3 h-3 ${item.color}`} />
            </div>
            <span className="text-sm font-medium text-gray-900">{item.value}</span>
            {showLabels && (
              <span className="text-xs text-gray-500">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {statsItems.map((item, index) => (
        <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {showLabels && (
                <p className="text-xs font-medium text-gray-600 mb-1">{item.label}</p>
              )}
              <p className="text-lg font-bold text-gray-900">{item.value}</p>
            </div>
            <div className={`rounded-full p-2 ${item.bgColor}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
