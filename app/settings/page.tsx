'use client'

import { useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import AutomationsSection from '../../components/settings/AutomationsSection'
import PlatformConnectionsSection from '../../components/settings/PlatformConnectionsSection'
import InvoicesSection from '../../components/settings/InvoicesSection'
import AutoSendersSection from '../../components/settings/AutoSendersSection'
import RemindersSection from '../../components/settings/RemindersSection'
import GeneralSettingsSection from '../../components/settings/GeneralSettingsSection'
import { Settings, Save, RefreshCw, Shield, Users, Bell, Mail, CreditCard, Zap, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('automations')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const sections = [
    { id: 'automations', label: 'Automations', icon: Zap, description: 'Automated workflows and triggers' },
    { id: 'connections', label: 'Platform Connections', icon: Globe, description: 'External platform integrations' },
    { id: 'invoices', label: 'Invoices', icon: CreditCard, description: 'Invoice templates and settings' },
    { id: 'autosenders', label: 'Auto-Senders', icon: Mail, description: 'Automated email and SMS' },
    { id: 'reminders', label: 'Reminders', icon: Bell, description: 'Custom reminders and notifications' },
    { id: 'general', label: 'General Settings', icon: Settings, description: 'User roles, security, and preferences' }
  ]

  const handleSave = () => {
    console.log('Saving settings...')
    setHasUnsavedChanges(false)
    // Here you would typically save to backend
  }

  const handleRefresh = () => {
    console.log('Refreshing settings...')
    // Here you would typically reload from backend
  }

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
                  <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                </div>
              <div className="flex items-center space-x-3">
                {hasUnsavedChanges && (
                  <span className="text-sm text-orange-600">Unsaved changes</span>
                )}
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw size={16} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    hasUnsavedChanges
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-1 min-h-0 overflow-hidden">
          <div className="flex gap-6 h-full">
            {/* Left Sidebar - Settings Navigation */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-4 h-full overflow-y-auto">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Settings Categories</h3>
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                          activeSection === section.id
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon size={18} />
                          <div>
                            <div className="text-sm font-medium">{section.label}</div>
                            <div className="text-xs text-slate-500">{section.description}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Content - Settings Section */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto">
                {activeSection === 'automations' && (
                  <AutomationsSection onSettingsChange={() => setHasUnsavedChanges(true)} />
                )}
                {activeSection === 'connections' && (
                  <PlatformConnectionsSection onSettingsChange={() => setHasUnsavedChanges(true)} />
                )}
                {activeSection === 'invoices' && (
                  <InvoicesSection onSettingsChange={() => setHasUnsavedChanges(true)} />
                )}
                {activeSection === 'autosenders' && (
                  <AutoSendersSection onSettingsChange={() => setHasUnsavedChanges(true)} />
                )}
                {activeSection === 'reminders' && (
                  <RemindersSection onSettingsChange={() => setHasUnsavedChanges(true)} />
                )}
                {activeSection === 'general' && (
                  <GeneralSettingsSection onSettingsChange={() => setHasUnsavedChanges(true)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}