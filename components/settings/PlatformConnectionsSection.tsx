'use client'

import { useState } from 'react'
import { Plus, Link, Unlink, RefreshCw, CheckCircle, AlertCircle, Clock, Settings, Eye, EyeOff } from 'lucide-react'
import CreatePlatformConnectionModal from './CreatePlatformConnectionModal'

interface PlatformConnectionsSectionProps {
  onSettingsChange: () => void
}

export default function PlatformConnectionsSection({ onSettingsChange }: PlatformConnectionsSectionProps) {
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'connections' | 'sync' | 'health'>('connections')

  // Mock data for platform connections
  const connectionsData = {
    platforms: [
      {
        id: 1,
        name: 'Airbnb',
        status: 'Connected',
        accountName: 'Roomy Properties Dubai',
        lastSync: '2024-01-15 14:30',
        syncFrequency: 'Real-time',
        reservations: 45,
        revenue: 50200,
        apiStatus: 'Healthy',
        connectionType: 'OAuth'
      },
      {
        id: 2,
        name: 'Booking.com',
        status: 'Connected',
        accountName: 'Roomy Dubai',
        lastSync: '2024-01-15 14:25',
        syncFrequency: 'Every 30 minutes',
        reservations: 34,
        revenue: 37650,
        apiStatus: 'Healthy',
        connectionType: 'API Key'
      },
      {
        id: 3,
        name: 'Expedia',
        status: 'Disconnected',
        accountName: 'Roomy Properties',
        lastSync: '2024-01-10 09:15',
        syncFrequency: 'Hourly',
        reservations: 12,
        revenue: 12450,
        apiStatus: 'Error',
        connectionType: 'API Key'
      },
      {
        id: 4,
        name: 'Vrbo',
        status: 'Pending',
        accountName: '',
        lastSync: 'Never',
        syncFrequency: 'Real-time',
        reservations: 0,
        revenue: 0,
        apiStatus: 'Unknown',
        connectionType: 'OAuth'
      }
    ],
    syncSettings: {
      globalSyncFrequency: 'Real-time',
      autoSyncEnabled: true,
      syncReservations: true,
      syncPricing: true,
      syncAvailability: true,
      syncGuestData: true,
      lastFullSync: '2024-01-15 14:30',
      nextScheduledSync: '2024-01-15 15:00'
    },
    healthChecks: [
      {
        platform: 'Airbnb',
        status: 'Healthy',
        responseTime: '120ms',
        lastCheck: '2024-01-15 14:30',
        uptime: '99.9%',
        errors: 0
      },
      {
        platform: 'Booking.com',
        status: 'Healthy',
        responseTime: '95ms',
        lastCheck: '2024-01-15 14:30',
        uptime: '99.8%',
        errors: 1
      },
      {
        platform: 'Expedia',
        status: 'Error',
        responseTime: 'N/A',
        lastCheck: '2024-01-15 14:30',
        uptime: '95.2%',
        errors: 15
      }
    ]
  }

  const availablePlatforms = [
    { name: 'Airbnb', icon: '🏠', description: 'Connect your Airbnb host account' },
    { name: 'Booking.com', icon: '🌐', description: 'Link your Booking.com property manager account' },
    { name: 'Expedia', icon: '✈️', description: 'Integrate with Expedia Partner Central' },
    { name: 'Vrbo', icon: '🏖️', description: 'Connect your Vrbo host account' },
    { name: 'TripAdvisor', icon: '📸', description: 'Link TripAdvisor vacation rental' },
    { name: 'Agoda', icon: '🏨', description: 'Connect Agoda property manager' }
  ]

  const tabs = [
    { id: 'connections', label: 'Platform Connections', icon: Link },
    { id: 'sync', label: 'Sync Settings', icon: RefreshCw },
    { id: 'health', label: 'Connection Health', icon: CheckCircle }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected':
      case 'Healthy':
        return 'bg-green-100 text-green-800'
      case 'Disconnected':
      case 'Error':
        return 'bg-red-100 text-red-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
      case 'Healthy':
        return <CheckCircle className="w-4 h-4" />
      case 'Disconnected':
      case 'Error':
        return <AlertCircle className="w-4 h-4" />
      case 'Pending':
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
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

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Platform Connections</h2>
          <p className="text-sm text-slate-500">Manage external platform integrations and API connections</p>
        </div>
        <button
          onClick={() => setShowConnectModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Connect Platform
        </button>
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
        {activeTab === 'connections' && (
          <div className="space-y-4">
            {connectionsData.platforms.map((platform) => (
              <div key={platform.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-md font-medium text-slate-900">{platform.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(platform.status)}`}>
                          {getStatusIcon(platform.status)}
                          <span className="ml-1">{platform.status}</span>
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{platform.accountName || 'Not connected'}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span>Last sync: {platform.lastSync}</span>
                        <span>Sync: {platform.syncFrequency}</span>
                        <span>Type: {platform.connectionType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{platform.reservations} reservations</div>
                    <div className="text-sm text-slate-600">{formatCurrency(platform.revenue)}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                        <Settings size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                        <RefreshCw size={16} />
                      </button>
                      {platform.status === 'Connected' ? (
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer">
                          <Unlink size={16} />
                        </button>
                      ) : (
                        <button className="p-2 text-slate-400 hover:text-green-600 transition-colors cursor-pointer">
                          <Link size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            {/* Global Sync Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Global Sync Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sync Frequency</label>
                    <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option value="realtime">Real-time</option>
                      <option value="15min">Every 15 minutes</option>
                      <option value="30min">Every 30 minutes</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" id="autoSync" defaultChecked className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                    <label htmlFor="autoSync" className="text-sm text-slate-700">Enable automatic syncing</label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Full Sync</label>
                    <p className="text-sm text-slate-600">{connectionsData.syncSettings.lastFullSync}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Next Scheduled Sync</label>
                    <p className="text-sm text-slate-600">{connectionsData.syncSettings.nextScheduledSync}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Options */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Sync Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="syncReservations" defaultChecked className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <label htmlFor="syncReservations" className="text-sm text-slate-700">Sync Reservations</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="syncPricing" defaultChecked className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <label htmlFor="syncPricing" className="text-sm text-slate-700">Sync Pricing</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="syncAvailability" defaultChecked className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <label htmlFor="syncAvailability" className="text-sm text-slate-700">Sync Availability</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="syncGuestData" defaultChecked className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <label htmlFor="syncGuestData" className="text-sm text-slate-700">Sync Guest Data</label>
                </div>
              </div>
            </div>

            {/* Manual Sync */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-slate-900">Manual Sync</h4>
                <p className="text-sm text-slate-600">Force sync all connected platforms now</p>
              </div>
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center">
                <RefreshCw size={16} className="mr-2" />
                Sync Now
              </button>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-4">
            {connectionsData.healthChecks.map((check, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-md font-medium text-slate-900">{check.platform}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(check.status)}`}>
                          {getStatusIcon(check.status)}
                          <span className="ml-1">{check.status}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Response Time:</span>
                          <p className="text-slate-900">{check.responseTime}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Uptime:</span>
                          <p className="text-slate-900">{check.uptime}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Errors:</span>
                          <p className="text-slate-900">{check.errors}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Last Check:</span>
                          <p className="text-slate-900">{check.lastCheck}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Platform Connection Modal */}
      <CreatePlatformConnectionModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSave={(connection) => {
          console.log('Creating platform connection:', connection)
          onSettingsChange()
        }}
      />
    </div>
  )
}
