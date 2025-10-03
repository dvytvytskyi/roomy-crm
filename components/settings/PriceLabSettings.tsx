'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, RefreshCw, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { priceLabService, PriceLabConfig, PricingStrategy } from '@/lib/api/services/pricelabService'

interface PriceLabSettingsProps {
  onSettingsChange?: () => void
}

export default function PriceLabSettings({ onSettingsChange }: PriceLabSettingsProps) {
  const [config, setConfig] = useState<PriceLabConfig>({
    enabled: false,
    apiKey: '',
    autoUpdate: false,
    syncFrequency: 'daily',
    defaultStrategy: ''
  })
  const [strategies, setStrategies] = useState<PricingStrategy[]>([])
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // Load configuration and strategies
  const loadData = async () => {
    setLoading(true)
    try {
      // Load configuration
      const configResponse = await priceLabService.getConfig()
      if (configResponse.success) {
        setConfig(configResponse.data)
      }

      // Load strategies
      const strategiesResponse = await priceLabService.getPricingStrategies()
      if (strategiesResponse.success) {
        setStrategies(strategiesResponse.data)
      }
    } catch (error) {
      console.error('Error loading PriceLab data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Test API connection
  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    
    try {
      const response = await priceLabService.testConnection()
      setTestResult({
        success: response.success,
        message: response.message
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed'
      })
    } finally {
      setTesting(false)
    }
  }

  // Save configuration
  const saveConfig = async () => {
    setSaving(true)
    try {
      const response = await priceLabService.updateConfig(config)
      if (response.success) {
        alert('Configuration saved successfully!')
        onSettingsChange?.()
        loadData() // Reload to get updated data
      } else {
        alert('Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('Error saving configuration')
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof PriceLabConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">PriceLab Integration</h3>
          <p className="text-sm text-slate-600">Configure AI-powered pricing recommendations</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`border rounded-lg p-4 ${
            config.enabled 
              ? 'border-green-200 bg-green-50' 
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {config.enabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <h4 className="font-medium text-slate-900">
                    PriceLab Integration {config.enabled ? 'Enabled' : 'Disabled'}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {config.enabled 
                      ? 'AI pricing recommendations are active' 
                      : 'Enable to start receiving pricing recommendations'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleInputChange('enabled', !config.enabled)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  config.enabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {config.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h4 className="font-medium text-slate-900 mb-4">Configuration</h4>
            
            <div className="space-y-4">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Key className="w-4 h-4 inline mr-2" />
                  API Key
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Enter your PriceLab API key"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get your API key from the PriceLab dashboard
                </p>
              </div>

              {/* Auto Update */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.autoUpdate}
                    onChange={(e) => handleInputChange('autoUpdate', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Auto Update Prices</span>
                    <p className="text-xs text-slate-500">Automatically apply price recommendations</p>
                  </div>
                </label>
              </div>

              {/* Sync Frequency */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Sync Frequency
                </label>
                <select
                  value={config.syncFrequency}
                  onChange={(e) => handleInputChange('syncFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Default Strategy */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Default Pricing Strategy
                </label>
                <select
                  value={config.defaultStrategy}
                  onChange={(e) => handleInputChange('defaultStrategy', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a strategy</option>
                  {strategies.map((strategy) => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Choose the default strategy for price optimization
                </p>
              </div>
            </div>
          </div>

          {/* Available Strategies */}
          {strategies.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h4 className="font-medium text-slate-900 mb-4">Available Pricing Strategies</h4>
              <div className="space-y-3">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-slate-900">{strategy.name}</h5>
                        <p className="text-sm text-slate-600">{strategy.description}</p>
                        <div className="mt-2 text-xs text-slate-500">
                          <span>Min: ${strategy.rules.minPrice}</span>
                          <span className="mx-2">•</span>
                          <span>Max: ${strategy.rules.maxPrice}</span>
                          <span className="mx-2">•</span>
                          <span>Demand: {strategy.rules.demandMultiplier}x</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {strategy.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {strategy.id === config.defaultStrategy && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Connection */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h4 className="font-medium text-slate-900 mb-4">Test Connection</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Test your PriceLab API connection to ensure everything is working correctly
                </p>
                {testResult && (
                  <div className={`mt-2 flex items-center space-x-2 ${
                    testResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{testResult.message}</span>
                  </div>
                )}
              </div>
              <button
                onClick={testConnection}
                disabled={testing || !config.apiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <TestTube className="w-4 h-4" />
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
