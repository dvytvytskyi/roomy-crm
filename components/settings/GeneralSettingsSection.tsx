'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, User, Shield, Bell, Globe, Download, Upload, Eye, EyeOff, Settings } from 'lucide-react'
import CreateUserModal from './CreateUserModal'

interface GeneralSettingsSectionProps {
  onSettingsChange: () => void
}

export default function GeneralSettingsSection({ onSettingsChange }: GeneralSettingsSectionProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'notifications' | 'backup' | 'localization'>('users')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data for general settings
  const generalData = {
    users: [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@roomy.com',
        role: 'Admin',
        status: 'Active',
        lastLogin: '2024-01-15 14:30',
        permissions: ['All Access']
      },
      {
        id: 2,
        name: 'Mike Wilson',
        email: 'mike@roomy.com',
        role: 'Manager',
        status: 'Active',
        lastLogin: '2024-01-15 12:15',
        permissions: ['Properties', 'Reservations', 'Finances']
      },
      {
        id: 3,
        name: 'Lisa Brown',
        email: 'lisa@roomy.com',
        role: 'Contractor',
        status: 'Inactive',
        lastLogin: '2024-01-10 09:45',
        permissions: ['Maintenance', 'Cleaning']
      }
    ],
    security: {
      twoFactorEnabled: true,
      ipRestrictions: {
        enabled: false,
        allowedIPs: []
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      sessionTimeout: 30
    },
    notifications: {
      email: {
        newReservations: true,
        sameDayReservations: true,
        newApartment: true,
        paymentReminders: true,
        maintenanceAlerts: true,
        systemUpdates: false
      },
      inApp: {
        allNotifications: true,
        soundEnabled: true
      }
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'Daily',
      retentionDays: 30,
      lastBackup: '2024-01-15 02:00',
      nextBackup: '2024-01-16 02:00',
      backupLocation: 'Cloud Storage'
    },
    localization: {
      language: 'English',
      currency: 'AED',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24-hour',
      timezone: 'Asia/Dubai'
    }
  }

  const tabs = [
    { id: 'users', label: 'User Roles & Permissions', icon: User },
    { id: 'security', label: 'Security Settings', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup & Export', icon: Download },
    { id: 'localization', label: 'Language & Localization', icon: Globe }
  ]

  const roles = ['Admin', 'Manager', 'Contractor', 'Owner', 'Guest']
  const languages = ['English', 'Arabic', 'French', 'Spanish', 'German']
  const currencies = ['AED', 'USD', 'EUR', 'GBP', 'SAR']
  const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
  const timeFormats = ['12-hour', '24-hour']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-medium text-slate-900">General Settings</h2>
          <p className="text-sm text-slate-500">Configure user roles, security, notifications, and system preferences</p>
        </div>
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
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Users Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-slate-900">Users & Roles</h3>
                <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center">
                  <Plus size={16} className="mr-2" />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generalData.users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">{user.role}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">{new Date(user.lastLogin).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                              <Edit size={16} />
                            </button>
                            <button className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Role Permissions */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Role Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <div key={role} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">{role}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                        <span className="text-xs text-slate-600">Properties</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                        <span className="text-xs text-slate-600">Reservations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked={role === 'Admin' || role === 'Manager'} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                        <span className="text-xs text-slate-600">Finances</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked={role === 'Admin'} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                        <span className="text-xs text-slate-600">Settings</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-slate-900">2FA Status</h4>
                  <p className="text-sm text-slate-600">Enhanced security for all user accounts</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${generalData.security.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {generalData.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors cursor-pointer">
                    {generalData.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Policy */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Password Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Length</label>
                  <input 
                    type="number" 
                    defaultValue={generalData.security.passwordPolicy.minLength}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Days</label>
                  <input 
                    type="number" 
                    defaultValue={generalData.security.passwordPolicy.expiryDays}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked={generalData.security.passwordPolicy.requireUppercase} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <label className="text-sm text-slate-700">Require uppercase letters</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked={generalData.security.passwordPolicy.requireNumbers} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <label className="text-sm text-slate-700">Require numbers</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked={generalData.security.passwordPolicy.requireSpecialChars} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <label className="text-sm text-slate-700">Require special characters</label>
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Session Settings</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                <input 
                  type="number" 
                  defaultValue={generalData.security.sessionTimeout}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Email Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">New Reservations</span>
                  <input type="checkbox" defaultChecked={generalData.notifications.email.newReservations} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">Same Day Reservations</span>
                  <input type="checkbox" defaultChecked={generalData.notifications.email.sameDayReservations} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">New Apartment</span>
                  <input type="checkbox" defaultChecked={generalData.notifications.email.newApartment} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">Payment Reminders</span>
                  <input type="checkbox" defaultChecked={generalData.notifications.email.paymentReminders} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">Maintenance Alerts</span>
                  <input type="checkbox" defaultChecked={generalData.notifications.email.maintenanceAlerts} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">System Updates</span>
                  <input type="checkbox" defaultChecked={generalData.notifications.email.systemUpdates} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                </div>
              </div>
            </div>


            {/* In-App Notifications */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">In-App Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">All Notifications</span>
                  <input type="checkbox" defaultChecked={generalData.notifications.inApp.allNotifications} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-900">Sound Enabled</span>
                  <input type="checkbox" defaultChecked={generalData.notifications.inApp.soundEnabled} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6">
            {/* Backup Settings */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Backup Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked={generalData.backup.autoBackup} className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" />
                  <label className="text-sm text-slate-700">Enable automatic backups</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Backup Frequency</label>
                    <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option value="daily" selected>Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Retention (days)</label>
                    <input 
                      type="number" 
                      defaultValue={generalData.backup.retentionDays}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Backup Status */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Backup Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Last Backup</div>
                  <div className="text-sm font-medium text-slate-900">{new Date(generalData.backup.lastBackup).toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600">Next Backup</div>
                  <div className="text-sm font-medium text-slate-900">{new Date(generalData.backup.nextBackup).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Manual Actions */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Manual Actions</h3>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center">
                  <Download size={16} className="mr-2" />
                  Download Backup
                </button>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center">
                  <Upload size={16} className="mr-2" />
                  Restore Backup
                </button>
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center">
                  <Download size={16} className="mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'localization' && (
          <div className="space-y-6">
            {/* Language & Currency */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Language & Currency</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {languages.map(lang => (
                      <option key={lang} value={lang} selected={lang === generalData.localization.language}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {currencies.map(currency => (
                      <option key={currency} value={currency} selected={currency === generalData.localization.currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Time Format */}
            <div>
              <h3 className="text-md font-medium text-slate-900 mb-4">Date & Time Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {dateFormats.map(format => (
                      <option key={format} value={format} selected={format === generalData.localization.dateFormat}>{format}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time Format</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {timeFormats.map(format => (
                      <option key={format} value={format} selected={format === generalData.localization.timeFormat}>{format}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <select className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="Asia/Dubai" selected>Asia/Dubai (GMT+4)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(user) => {
          console.log('Creating user:', user)
          onSettingsChange()
        }}
      />
    </div>
  )
}
