'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Play, Pause, Mail, Clock, Users, Settings } from 'lucide-react'
import CreateAutoSenderModal from './CreateAutoSenderModal'

interface AutoSendersSectionProps {
  onSettingsChange: () => void
}

export default function AutoSendersSection({ onSettingsChange }: AutoSendersSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'templates' | 'scheduling' | 'batch'>('templates')

  // Mock data for auto-senders
  const autoSendersData = {
    templates: [
      {
        id: 1,
        name: 'Guest Welcome Email',
        type: 'Email',
        trigger: 'Reservation Confirmed',
        timing: 'Immediately',
        status: 'Active',
        recipients: 'Guests',
        lastSent: '2024-01-15 14:30',
        sentCount: 47
      },
      {
        id: 2,
        name: 'Check-in Instructions',
        type: 'Email',
        trigger: '48 Hours Before Check-in',
        timing: '48 hours before',
        status: 'Active',
        recipients: 'Guests',
        lastSent: '2024-01-14 16:45',
        sentCount: 23
      },
      {
        id: 3,
        name: 'Payment Reminder Email',
        type: 'Email',
        trigger: 'Payment Overdue',
        timing: '3 days after due date',
        status: 'Paused',
        recipients: 'Guests',
        lastSent: '2024-01-13 09:15',
        sentCount: 12
      },
      {
        id: 4,
        name: 'Owner Payout Notification',
        type: 'Email',
        trigger: 'Payout Processed',
        timing: 'Immediately',
        status: 'Active',
        recipients: 'Owners',
        lastSent: '2024-01-12 11:20',
        sentCount: 8
      },
      {
        id: 5,
        name: 'Contractor Task Assignment',
        type: 'Email',
        trigger: 'Task Assigned',
        timing: 'Immediately',
        status: 'Active',
        recipients: 'Contractors',
        lastSent: '2024-01-11 14:30',
        sentCount: 15
      }
    ],
    scheduling: {
      timezone: 'Asia/Dubai',
      businessHours: {
        start: '09:00',
        end: '18:00',
        enabled: true
      },
      delaySettings: {
        emailDelay: 0,
        respectBusinessHours: true
      }
    },
    batch: {
      enabled: true,
      batchSize: 50,
      delayBetweenBatches: 5,
      maxDailyLimit: 1000,
      currentUsage: 234
    }
  }

  const tabs = [
    { id: 'templates', label: 'Auto-Sender Templates', icon: Mail },
    { id: 'scheduling', label: 'Scheduling Settings', icon: Clock },
    { id: 'batch', label: 'Batch Sending', icon: Users }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'Disabled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Play className="w-4 h-4" />
      case 'Paused':
        return <Pause className="w-4 h-4" />
      default:
        return <Pause className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    return <Mail className="w-4 h-4" />
  }

  const getTypeColor = (type: string) => {
    return 'text-blue-500'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Auto-Senders</h2>
          <p className="text-sm text-slate-500">Configure automated email sending</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create Template
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
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {autoSendersData.templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`${getTypeColor(template.type)}`}>
                        {getTypeIcon(template.type)}
                      </div>
                      <h3 className="text-md font-medium text-slate-900">{template.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(template.status)}`}>
                        {getStatusIcon(template.status)}
                        <span className="ml-1">{template.status}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Trigger:</span>
                        <p className="text-slate-900">{template.trigger}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Timing:</span>
                        <p className="text-slate-900">{template.timing}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Recipients:</span>
                        <p className="text-slate-900">{template.recipients}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                      <span>Last sent: {template.lastSent}</span>
                      <span>Sent {template.sentCount} times</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'scheduling' && (
          <div className="space-y-6">
            {/* Timezone Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Timezone & Business Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="Asia/Dubai" selected>Asia/Dubai (GMT+4)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="businessHours" 
                    defaultChecked={autoSendersData.scheduling.businessHours.enabled}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                  />
                  <label htmlFor="businessHours" className="text-sm text-slate-700">Respect business hours</label>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Business Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                  <input 
                    type="time" 
                    defaultValue={autoSendersData.scheduling.businessHours.start}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                  <input 
                    type="time" 
                    defaultValue={autoSendersData.scheduling.businessHours.end}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Delay Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Delay Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Delay (minutes)</label>
                  <input 
                    type="number" 
                    defaultValue={autoSendersData.scheduling.delaySettings.emailDelay}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="space-y-6">
            {/* Batch Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Batch Sending Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="batchEnabled" 
                    defaultChecked={autoSendersData.batch.enabled}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                  />
                  <label htmlFor="batchEnabled" className="text-sm text-slate-700">Enable batch sending</label>
                </div>
              </div>
            </div>

            {/* Batch Parameters */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Batch Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Batch Size</label>
                  <input 
                    type="number" 
                    defaultValue={autoSendersData.batch.batchSize}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Number of messages per batch</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Delay Between Batches (seconds)</label>
                  <input 
                    type="number" 
                    defaultValue={autoSendersData.batch.delayBetweenBatches}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Wait time between sending batches</p>
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Usage Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Daily Limit</label>
                  <input 
                    type="number" 
                    defaultValue={autoSendersData.batch.maxDailyLimit}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Maximum messages per day</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Usage Today</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(autoSendersData.batch.currentUsage / autoSendersData.batch.maxDailyLimit) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600">{autoSendersData.batch.currentUsage}/{autoSendersData.batch.maxDailyLimit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Sending Tips */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Batch Sending Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Smaller batch sizes (10-50) are less likely to trigger spam filters</li>
                <li>• Longer delays between batches help avoid rate limiting</li>
                <li>• Monitor your delivery rates and adjust settings accordingly</li>
                <li>• Consider timezone differences when scheduling batch sends</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Create Auto-Sender Modal */}
      <CreateAutoSenderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(autoSender) => {
          console.log('Creating auto-sender:', autoSender)
          onSettingsChange()
        }}
      />
    </div>
  )
}
