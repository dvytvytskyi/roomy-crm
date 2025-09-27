'use client'

import { useState } from 'react'
import { Plus, Play, Pause, Edit, Trash2, Clock, Mail, MessageSquare, FileText, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import CreateAutomationModal from './CreateAutomationModal'

interface AutomationsSectionProps {
  onSettingsChange: () => void
}

export default function AutomationsSection({ onSettingsChange }: AutomationsSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'recurring' | 'audit'>('workflows')

  // Mock data for automations
  const automationsData = {
    workflows: [
      {
        id: 1,
        name: 'Post-Booking Welcome Email',
        trigger: 'New Reservation Confirmed',
        condition: 'Reservation Status = Confirmed',
        action: 'Send Welcome Email to Guest',
        status: 'Active',
        lastTriggered: '2024-01-15 14:30',
        triggerCount: 47
      },
      {
        id: 2,
        name: 'Payment Reminder',
        trigger: 'Payment Overdue',
        condition: 'Payment Status = Pending AND Days Overdue > 3',
        action: 'Send Payment Reminder Email',
        status: 'Active',
        lastTriggered: '2024-01-14 09:15',
        triggerCount: 12
      },
      {
        id: 3,
        name: 'Check-in Reminder',
        trigger: '48 Hours Before Check-in',
        condition: 'Check-in Date - Current Date = 2 days',
        action: 'Send Check-in Instructions Email',
        status: 'Paused',
        lastTriggered: '2024-01-13 16:45',
        triggerCount: 23
      },
      {
        id: 4,
        name: 'Maintenance Task Assignment',
        trigger: 'Maintenance Request Created',
        condition: 'Task Category = Plumbing',
        action: 'Assign to Plumbing Contractor',
        status: 'Active',
        lastTriggered: '2024-01-12 11:20',
        triggerCount: 8
      }
    ],
    templates: [
      {
        id: 1,
        name: 'Guest Welcome Email',
        type: 'Email',
        description: 'Automatically send welcome email to guests upon reservation confirmation',
        category: 'Guest Communication',
        isDefault: true
      },
      {
        id: 2,
        name: 'Payment Reminder Email',
        type: 'Email',
        description: 'Send SMS reminder for overdue payments',
        category: 'Payment',
        isDefault: true
      },
      {
        id: 3,
        name: 'Owner Payout Notification',
        type: 'Email',
        description: 'Notify owners when payouts are processed',
        category: 'Owner Communication',
        isDefault: false
      },
      {
        id: 4,
        name: 'Check-in Instructions',
        type: 'Email',
        description: 'Send check-in instructions 24 hours before arrival',
        category: 'Guest Communication',
        isDefault: true
      }
    ],
    recurring: [
      {
        id: 1,
        name: 'Monthly Maintenance Check',
        frequency: 'Monthly',
        nextRun: '2024-02-01',
        description: 'Create maintenance tasks for all units',
        status: 'Active',
        lastRun: '2024-01-01'
      },
      {
        id: 2,
        name: 'Quarterly Utility Payment',
        frequency: 'Quarterly',
        nextRun: '2024-04-01',
        description: 'Generate utility payment reminders',
        status: 'Active',
        lastRun: '2024-01-01'
      },
      {
        id: 3,
        name: 'Annual Permit Renewal',
        frequency: 'Annually',
        nextRun: '2024-12-31',
        description: 'Remind about DTCM permit renewals',
        status: 'Paused',
        lastRun: '2023-12-31'
      }
    ],
    audit: [
      {
        id: 1,
        automation: 'Post-Booking Welcome Email',
        triggered: '2024-01-15 14:30',
        action: 'Email sent to john.smith@email.com',
        status: 'Success',
        details: 'Welcome email delivered successfully'
      },
      {
        id: 2,
        automation: 'Payment Reminder',
        triggered: '2024-01-14 09:15',
        action: 'SMS sent to +971 50 123 4567',
        status: 'Success',
        details: 'Payment reminder SMS delivered'
      },
      {
        id: 3,
        automation: 'Check-in Reminder',
        triggered: '2024-01-13 16:45',
        action: 'Email sent to maria.garcia@email.com',
        status: 'Failed',
        details: 'Email delivery failed - invalid email address'
      }
    ]
  }

  const tabs = [
    { id: 'workflows', label: 'Automated Workflows', icon: Zap },
    { id: 'templates', label: 'Automation Templates', icon: FileText },
    { id: 'recurring', label: 'Recurring Tasks', icon: Clock },
    { id: 'audit', label: 'Audit Log', icon: CheckCircle }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      case 'Success':
        return 'bg-green-100 text-green-800'
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
      case 'Failed':
        return <AlertCircle className="w-4 h-4" />
      case 'Success':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Automations</h2>
          <p className="text-sm text-slate-500">Configure automated workflows and triggers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create Automation
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
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            {automationsData.workflows.map((workflow) => (
              <div key={workflow.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{workflow.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                        <span className="ml-1">{workflow.status}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Trigger:</span>
                        <p className="text-slate-900">{workflow.trigger}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Condition:</span>
                        <p className="text-slate-900">{workflow.condition}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Action:</span>
                        <p className="text-slate-900">{workflow.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                      <span>Last triggered: {workflow.lastTriggered}</span>
                      <span>Triggered {workflow.triggerCount} times</span>
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

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automationsData.templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {template.type === 'Email' ? <Mail className="w-4 h-4 text-blue-500" /> : <MessageSquare className="w-4 h-4 text-green-500" />}
                    <h3 className="text-md font-medium text-slate-900">{template.name}</h3>
                  </div>
                  {template.isDefault && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{template.category}</span>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-orange-600 hover:text-orange-700 transition-colors cursor-pointer">
                      Use Template
                    </button>
                    <button className="text-xs text-slate-600 hover:text-slate-700 transition-colors cursor-pointer">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recurring' && (
          <div className="space-y-4">
            {automationsData.recurring.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{task.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Frequency:</span>
                        <p className="text-slate-900">{task.frequency}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Next Run:</span>
                        <p className="text-slate-900">{new Date(task.nextRun).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Last Run:</span>
                        <p className="text-slate-900">{new Date(task.lastRun).toLocaleDateString()}</p>
                      </div>
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

        {activeTab === 'audit' && (
          <div className="space-y-4">
            {automationsData.audit.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{log.automation}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span className="ml-1">{log.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.details}</p>
                    <p className="text-xs text-slate-400 mt-2">Triggered: {log.triggered}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Automation Modal */}
      <CreateAutomationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(automation) => {
          console.log('Creating automation:', automation)
          onSettingsChange()
        }}
      />
    </div>
  )
}
