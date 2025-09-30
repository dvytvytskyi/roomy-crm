'use client'

import { useState } from 'react'
import { Edit } from 'lucide-react'
import { useAutomationSettings, useUpdateAutomationSettings } from '../../hooks/useSettings'
import { useAuth } from '../../hooks/useAuth'

export default function SettingsSimple() {
  const [activeTab, setActiveTab] = useState('automation')
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: automationSettings, loading: settingsLoading, error: settingsError } = useAutomationSettings()
  const { mutate: updateSettings, loading: updateLoading } = useUpdateAutomationSettings()

  const handleSettingChange = (key: string, value: boolean) => {
    if (automationSettings) {
      updateSettings({ [key]: value })
    }
  }

  const handleEditIncomeDistribution = (key: string, currentValue: string, label: string) => {
    // TODO: Implement income distribution editing modal
    console.log('Edit income distribution:', { key, currentValue, label })
    alert(`Edit ${label}: ${currentValue}`)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to access settings</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'automation', name: 'Automation' },
            { id: 'financial', name: 'Financial Management' },
            { id: 'platforms', name: 'Platform Connections' },
            { id: 'invoices', name: 'Invoices' },
            { id: 'general', name: 'General' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Automation Settings */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Automation Settings</h2>
          
          {settingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          ) : settingsError ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">Error loading settings: {settingsError}</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                {automationSettings && Object.entries(automationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-xs text-gray-500">
                        {getSettingDescription(key)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSettingChange(key, !value)}
                      disabled={updateLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial Management */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Financial Management</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              {/* Default Income Distribution */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Default Income Distribution</h3>
                <p className="text-sm text-gray-600 mb-4">These are the default income distribution settings that will be applied to all properties unless overridden.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {[
                      { label: 'Owner Income', value: '70%', key: 'owner_income' },
                      { label: 'Roomy Agency Fee', value: '25%', key: 'agency_fee' },
                      { label: 'Referring Agent', value: '5%', key: 'referring_agent' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-900">{item.value}</span>
                          <button 
                            onClick={() => handleEditIncomeDistribution(item.key, item.value, item.label)}
                            className="text-orange-600 hover:text-orange-700 cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Profit Formula</h4>
                      <p className="text-sm text-gray-600">70% Owner / 30% Company</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Total Distribution</h4>
                      <p className="text-lg font-medium text-gray-900">100%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Financial Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Additional Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-calculate taxes</label>
                      <p className="text-xs text-gray-500">Automatically calculate and deduct taxes from income</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Include service fees</label>
                      <p className="text-xs text-gray-500">Include platform service fees in calculations</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-600 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Connections */}
      {activeTab === 'platforms' && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Platform Connections</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-8">
              <p className="text-gray-600">Platform connections will be available soon</p>
            </div>
          </div>
        </div>
      )}

      {/* Invoices */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">Invoice Settings</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-8">
              <p className="text-gray-600">Invoice settings will be available soon</p>
            </div>
          </div>
        </div>
      )}

      {/* General */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-8">
              <p className="text-gray-600">General settings will be available soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    autoConfirmReservations: 'Automatically confirm new reservations',
    autoSendWelcomeEmail: 'Send welcome email to new guests',
    autoSendCheckoutReminder: 'Send checkout reminders to guests',
    autoCreateCleaningTask: 'Create cleaning tasks after checkout',
    autoCreateMaintenanceTask: 'Create maintenance tasks automatically',
    autoUpdatePricing: 'Update pricing based on market data',
    autoSyncWithExternalPlatforms: 'Sync with external booking platforms'
  }
  return descriptions[key] || 'Automation setting'
}
