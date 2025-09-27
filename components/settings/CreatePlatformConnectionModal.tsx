'use client'

import { useState } from 'react'
import { X, Link, Globe, Key, User, Settings } from 'lucide-react'

interface CreatePlatformConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (connection: any) => void
}

export default function CreatePlatformConnectionModal({ isOpen, onClose, onSave }: CreatePlatformConnectionModalProps) {
  const [formData, setFormData] = useState({
    platform: '',
    accountName: '',
    connectionType: 'OAuth',
    apiKey: '',
    apiSecret: '',
    username: '',
    password: '',
    syncFrequency: 'Real-time',
    syncReservations: true,
    syncPricing: true,
    syncAvailability: true,
    syncGuestData: true
  })

  const platforms = [
    { name: 'Airbnb', icon: '🏠', description: 'Connect your Airbnb host account' },
    { name: 'Booking.com', icon: '🌐', description: 'Link your Booking.com property manager account' },
    { name: 'Expedia', icon: '✈️', description: 'Integrate with Expedia Partner Central' },
    { name: 'Vrbo', icon: '🏖️', description: 'Connect your Vrbo host account' },
    { name: 'TripAdvisor', icon: '📸', description: 'Link TripAdvisor vacation rental' },
    { name: 'Agoda', icon: '🏨', description: 'Connect Agoda property manager' }
  ]

  const connectionTypes = [
    { value: 'OAuth', label: 'OAuth Authentication', description: 'Secure login with platform credentials' },
    { value: 'API Key', label: 'API Key', description: 'Direct API integration with keys' }
  ]

  const syncFrequencies = [
    { value: 'realtime', label: 'Real-time' },
    { value: '15min', label: 'Every 15 minutes' },
    { value: '30min', label: 'Every 30 minutes' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const connection = {
      id: Date.now(),
      name: formData.platform,
      status: 'Connected',
      accountName: formData.accountName,
      lastSync: 'Never',
      syncFrequency: formData.syncFrequency,
      reservations: 0,
      revenue: 0,
      apiStatus: 'Healthy',
      connectionType: formData.connectionType,
      syncSettings: {
        reservations: formData.syncReservations,
        pricing: formData.syncPricing,
        availability: formData.syncAvailability,
        guestData: formData.syncGuestData
      }
    }

    onSave(connection)
    onClose()
    
    // Reset form
    setFormData({
      platform: '',
      accountName: '',
      connectionType: 'OAuth',
      apiKey: '',
      apiSecret: '',
      username: '',
      password: '',
      syncFrequency: 'Real-time',
      syncReservations: true,
      syncPricing: true,
      syncAvailability: true,
      syncGuestData: true
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-slate-900">Connect Platform</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Select Platform</label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.name}
                  type="button"
                  onClick={() => handleInputChange('platform', platform.name)}
                  className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                    formData.platform === platform.name
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">{platform.name}</div>
                    <div className="text-xs text-slate-500">{platform.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Account Name</label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => handleInputChange('accountName', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter account name"
              required
            />
          </div>

          {/* Connection Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Connection Type</label>
            <div className="space-y-2">
              {connectionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('connectionType', type.value)}
                  className={`w-full flex items-center space-x-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                    formData.connectionType === type.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.value === 'OAuth' ? <User size={18} /> : <Key size={18} />}
                  <div className="text-left">
                    <div className="text-sm font-medium">{type.label}</div>
                    <div className="text-xs text-slate-500">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Credentials (if API Key selected) */}
          {formData.connectionType === 'API Key' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-slate-900">API Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">API Secret</label>
                  <input
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => handleInputChange('apiSecret', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter API secret"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Username/Password (if OAuth selected) */}
          {formData.connectionType === 'OAuth' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-slate-900">Login Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Username/Email</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter username or email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sync Settings */}
          <div>
            <h3 className="text-md font-medium text-slate-900 mb-4">Sync Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sync Frequency</label>
                <select
                  value={formData.syncFrequency}
                  onChange={(e) => handleInputChange('syncFrequency', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {syncFrequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Sync Options</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="syncReservations" 
                      checked={formData.syncReservations}
                      onChange={(e) => handleInputChange('syncReservations', e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                    />
                    <label htmlFor="syncReservations" className="text-sm text-slate-700">Sync Reservations</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="syncPricing" 
                      checked={formData.syncPricing}
                      onChange={(e) => handleInputChange('syncPricing', e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                    />
                    <label htmlFor="syncPricing" className="text-sm text-slate-700">Sync Pricing</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="syncAvailability" 
                      checked={formData.syncAvailability}
                      onChange={(e) => handleInputChange('syncAvailability', e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                    />
                    <label htmlFor="syncAvailability" className="text-sm text-slate-700">Sync Availability</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="checkbox" 
                      id="syncGuestData" 
                      checked={formData.syncGuestData}
                      onChange={(e) => handleInputChange('syncGuestData', e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                    />
                    <label htmlFor="syncGuestData" className="text-sm text-slate-700">Sync Guest Data</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
            >
              Connect Platform
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
