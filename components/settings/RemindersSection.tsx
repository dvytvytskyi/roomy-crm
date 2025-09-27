'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Bell, Calendar, Star, User, Wrench, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import CreateReminderModal from './CreateReminderModal'

interface RemindersSectionProps {
  onSettingsChange: () => void
}

export default function RemindersSection({ onSettingsChange }: RemindersSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'custom' | 'permits' | 'utilities' | 'birthdays' | 'history'>('custom')

  // Mock data for reminders
  const remindersData = {
    custom: [
      {
        id: 1,
        name: 'Monthly Maintenance Check',
        type: 'Maintenance',
        frequency: 'Monthly',
        nextDue: '2024-02-01',
        assignedTo: 'Maintenance Team',
        priority: 'High',
        status: 'Active',
        description: 'Monthly inspection of all units'
      },
      {
        id: 2,
        name: 'Guest Check-in Reminder',
        type: 'Guest Service',
        frequency: 'Daily',
        nextDue: '2024-01-16',
        assignedTo: 'Front Desk',
        priority: 'Medium',
        status: 'Active',
        description: 'Remind guests about check-in procedures'
      },
      {
        id: 3,
        name: 'Owner Payout Processing',
        type: 'Financial',
        frequency: 'Monthly',
        nextDue: '2024-02-01',
        assignedTo: 'Finance Team',
        priority: 'High',
        status: 'Paused',
        description: 'Process monthly owner payouts'
      }
    ],
    permits: [
      {
        id: 1,
        unit: 'Apartment Burj Khalifa 2',
        permitNumber: 'DTCM-2024-001',
        expiryDate: '2024-12-31',
        reminderDays: [90, 30, 7],
        status: 'Active',
        lastReminder: '2024-01-15'
      },
      {
        id: 2,
        unit: 'Marina View Studio',
        permitNumber: 'DTCM-2024-002',
        expiryDate: '2024-11-15',
        reminderDays: [90, 30, 7],
        status: 'Active',
        lastReminder: '2024-01-10'
      },
      {
        id: 3,
        unit: 'Downtown Loft 2BR',
        permitNumber: 'DTCM-2024-003',
        expiryDate: '2024-10-20',
        reminderDays: [90, 30, 7],
        status: 'Expired',
        lastReminder: '2024-01-05'
      }
    ],
    utilities: [
      {
        id: 1,
        unit: 'Apartment Burj Khalifa 2',
        utility: 'DEWA (Electricity & Water)',
        dueDate: '2024-01-25',
        amount: 850,
        reminderDays: [7, 3, 1],
        status: 'Active',
        lastReminder: '2024-01-18'
      },
      {
        id: 2,
        unit: 'Marina View Studio',
        utility: 'DEWA (Electricity & Water)',
        dueDate: '2024-01-28',
        amount: 420,
        reminderDays: [7, 3, 1],
        status: 'Active',
        lastReminder: '2024-01-21'
      },
      {
        id: 3,
        unit: 'Downtown Loft 2BR',
        utility: 'Emirates Gas',
        dueDate: '2024-01-30',
        amount: 180,
        reminderDays: [7, 3, 1],
        status: 'Overdue',
        lastReminder: '2024-01-23'
      }
    ],
    birthdays: [
      {
        id: 1,
        person: 'John Smith',
        category: 'Guests',
        date: '2024-02-15',
        rating: 5,
        lastStay: '2024-01-10',
        reminderDays: [7, 1],
        status: 'Active',
        lastReminder: '2024-01-08'
      },
      {
        id: 2,
        person: 'Maria Garcia',
        category: 'Guests',
        date: '2024-03-22',
        rating: 4,
        lastStay: '2023-12-20',
        reminderDays: [7, 1],
        status: 'Active',
        lastReminder: '2024-01-15'
      },
      {
        id: 3,
        person: 'Ahmed Al-Rashid',
        category: 'Owners',
        date: '2024-01-30',
        rating: null,
        lastStay: null,
        reminderDays: [7, 1],
        status: 'Active',
        lastReminder: '2024-01-23'
      },
      {
        id: 4,
        person: 'Sarah Johnson',
        category: 'Owners',
        date: '2024-04-10',
        rating: null,
        lastStay: null,
        reminderDays: [7, 1],
        status: 'Active',
        lastReminder: '2024-01-20'
      },
      {
        id: 5,
        person: 'Maintenance Team',
        category: 'Staff',
        date: '2024-05-15',
        rating: null,
        lastStay: null,
        reminderDays: [7, 1],
        status: 'Active',
        lastReminder: '2024-01-18'
      },
      {
        id: 6,
        person: 'Ahmed Al-Mansouri',
        category: 'Agents',
        date: '2024-06-20',
        rating: null,
        lastStay: null,
        reminderDays: [7, 1],
        status: 'Active',
        lastReminder: '2024-01-25'
      }
    ],
    history: [
      {
        id: 1,
        reminder: 'Monthly Maintenance Check',
        sentTo: 'Maintenance Team',
        sentAt: '2024-01-15 09:00',
        status: 'Delivered',
        type: 'Email'
      },
      {
        id: 2,
        reminder: 'DEWA Payment Due',
        sentTo: 'Property Manager',
        sentAt: '2024-01-14 14:30',
        status: 'Delivered',
        type: 'SMS'
      },
      {
        id: 3,
        reminder: 'DTCM Permit Expiry',
        sentTo: 'Admin Team',
        sentAt: '2024-01-13 11:15',
        status: 'Failed',
        type: 'Email'
      }
    ]
  }

  const tabs = [
    { id: 'custom', label: 'Custom Reminders', icon: Bell },
    { id: 'permits', label: 'DTCM Permits', icon: Calendar },
    { id: 'utilities', label: 'Utility Payments', icon: DollarSign },
    { id: 'birthdays', label: 'Birthdays', icon: Star },
    { id: 'history', label: 'Reminder History', icon: Clock }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'Expired':
      case 'Overdue':
      case 'Failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'Paused':
        return <Clock className="w-4 h-4" />
      case 'Expired':
      case 'Overdue':
      case 'Failed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const handleCreateReminder = (reminder: any) => {
    console.log('Creating reminder:', reminder)
    // Here you would typically save to backend
    onSettingsChange()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Reminders</h2>
          <p className="text-sm text-slate-500">Manage custom reminders, permits, utilities, and guest birthdays</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create Reminder
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
        {activeTab === 'custom' && (
          <div className="space-y-4">
            {remindersData.custom.map((reminder) => (
              <div key={reminder.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{reminder.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reminder.status)}`}>
                        {getStatusIcon(reminder.status)}
                        <span className="ml-1">{reminder.status}</span>
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{reminder.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Type:</span>
                        <p className="text-slate-900">{reminder.type}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Frequency:</span>
                        <p className="text-slate-900">{reminder.frequency}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Assigned To:</span>
                        <p className="text-slate-900">{reminder.assignedTo}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-500 text-sm">Next Due: </span>
                      <span className="text-slate-900 text-sm">
                        {new Date(reminder.nextDue).toLocaleDateString()}
                        <span className="text-orange-600 ml-1">
                          ({Math.ceil((new Date(reminder.nextDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)
                        </span>
                      </span>
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

        {activeTab === 'permits' && (
          <div className="space-y-4">
            {remindersData.permits.map((permit) => (
              <div key={permit.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{permit.unit}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(permit.status)}`}>
                        {getStatusIcon(permit.status)}
                        <span className="ml-1">{permit.status}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Permit Number:</span>
                        <p className="text-slate-900">{permit.permitNumber}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Expiry Date:</span>
                        <p className="text-slate-900">
                          {new Date(permit.expiryDate).toLocaleDateString()} 
                          <span className="text-orange-600 ml-1">
                            ({Math.ceil((new Date(permit.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Reminder Days:</span>
                        <p className="text-slate-900">{permit.reminderDays.join(', ')} days before</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-500 text-sm">Last Reminder: </span>
                      <span className="text-slate-900 text-sm">{new Date(permit.lastReminder).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                      <Bell size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'utilities' && (
          <div className="space-y-4">
            {remindersData.utilities.map((utility) => (
              <div key={utility.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{utility.unit}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(utility.status)}`}>
                        {getStatusIcon(utility.status)}
                        <span className="ml-1">{utility.status}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Utility:</span>
                        <p className="text-slate-900">{utility.utility}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Due Date:</span>
                        <p className="text-slate-900">
                          {new Date(utility.dueDate).toLocaleDateString()}
                          <span className="text-orange-600 ml-1">
                            ({Math.ceil((new Date(utility.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Amount:</span>
                        <p className="text-slate-900">{formatCurrency(utility.amount)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-500 text-sm">Reminder Days: </span>
                      <span className="text-slate-900 text-sm">{utility.reminderDays.join(', ')} days before</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                      <Bell size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'birthdays' && (
          <div className="space-y-4">
            {remindersData.birthdays.map((birthday) => (
              <div key={birthday.id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{birthday.person}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(birthday.status)}`}>
                        {getStatusIcon(birthday.status)}
                        <span className="ml-1">{birthday.status}</span>
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {birthday.category}
                      </span>
                      {birthday.rating && (
                        <div className="flex items-center">
                          {Array.from({ length: birthday.rating }, (_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Birthday:</span>
                        <p className="text-slate-900">
                          {new Date(birthday.date).toLocaleDateString()}
                          <span className="text-orange-600 ml-1">
                            ({Math.ceil((new Date(birthday.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)
                          </span>
                        </p>
                      </div>
                      {birthday.lastStay && (
                        <div>
                          <span className="text-slate-500">Last Stay:</span>
                          <p className="text-slate-900">{new Date(birthday.lastStay).toLocaleDateString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-500">Reminder Days:</span>
                        <p className="text-slate-900">{birthday.reminderDays.join(', ')} days before</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-500 text-sm">Last Reminder: </span>
                      <span className="text-slate-900 text-sm">{new Date(birthday.lastReminder).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                      <Bell size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {remindersData.history.map((history) => (
              <div key={history.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-md font-medium text-slate-900">{history.reminder}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(history.status)}`}>
                        {getStatusIcon(history.status)}
                        <span className="ml-1">{history.status}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Sent To:</span>
                        <p className="text-slate-900">{history.sentTo}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Sent At:</span>
                        <p className="text-slate-900">{new Date(history.sentAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Type:</span>
                        <p className="text-slate-900">{history.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Reminder Modal */}
      <CreateReminderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateReminder}
      />
    </div>
  )
}
