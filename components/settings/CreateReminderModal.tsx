'use client'

import { useState } from 'react'
import { X, Calendar, Clock, User, Bell, DollarSign, Star, Wrench } from 'lucide-react'

interface CreateReminderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (reminder: any) => void
}

export default function CreateReminderModal({ isOpen, onClose, onSave }: CreateReminderModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom',
    frequency: 'monthly',
    nextDue: '',
    assignedTo: '',
    priority: 'medium',
    description: '',
    reminderDays: [7, 3, 1],
    unit: '',
    permitNumber: '',
    expiryDate: '',
    utility: '',
    dueDate: '',
    amount: '',
    guest: '',
    birthday: ''
  })

  const reminderTypes = [
    { value: 'custom', label: 'Custom Reminder', icon: Bell },
    { value: 'permit', label: 'DTCM Permit', icon: Calendar },
    { value: 'utility', label: 'Utility Payment', icon: DollarSign },
    { value: 'birthday', label: 'Birthday', icon: Star }
  ]

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
    { value: 'once', label: 'Once' }
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ]

  const units = [
    'Apartment Burj Khalifa 2',
    'Marina View Studio',
    'Downtown Loft 2BR',
    'JBR Beach Apartment',
    'Business Bay Office',
    'DIFC Penthouse'
  ]

  const utilities = [
    'DEWA (Electricity & Water)',
    'Emirates Gas',
    'Internet (Du)',
    'Internet (Etisalat)',
    'Municipality Fees',
    'Security Services'
  ]

  const guests = [
    'John Smith',
    'Maria Garcia',
    'Ahmed Hassan',
    'Emma Davis',
    'Sarah Wilson',
    'Mike Johnson'
  ]

  const owners = [
    'Ahmed Al-Rashid',
    'Sarah Johnson',
    'Mohammed Hassan',
    'Emma Davis'
  ]

  const staff = [
    'Maintenance Team',
    'Cleaning Team',
    'Front Desk',
    'Finance Team',
    'Property Manager',
    'Admin Team'
  ]

  const agents = [
    'Ahmed Al-Mansouri',
    'Sarah Johnson',
    'Mohammed Hassan',
    'Emma Davis',
    'David Wilson',
    'Fatima Al-Zahra'
  ]

  const recipients = [
    { category: 'Guests', list: guests },
    { category: 'Owners', list: owners },
    { category: 'Staff', list: staff },
    { category: 'Agents', list: agents }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const reminder = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      frequency: formData.frequency,
      nextDue: formData.nextDue,
      assignedTo: formData.assignedTo,
      priority: formData.priority,
      description: formData.description,
      reminderDays: formData.reminderDays,
      status: 'Active',
      ...(formData.type === 'permit' && {
        unit: formData.unit,
        permitNumber: formData.permitNumber,
        expiryDate: formData.expiryDate
      }),
      ...(formData.type === 'utility' && {
        unit: formData.unit,
        utility: formData.utility,
        dueDate: formData.dueDate,
        amount: formData.amount
      }),
      ...(formData.type === 'birthday' && {
        guest: formData.guest,
        birthday: formData.birthday
      })
    }

    onSave(reminder)
    onClose()
    
    // Reset form
    setFormData({
      name: '',
      type: 'custom',
      frequency: 'monthly',
      nextDue: '',
      assignedTo: '',
      priority: 'medium',
      description: '',
      reminderDays: [7, 3, 1],
      unit: '',
      permitNumber: '',
      expiryDate: '',
      utility: '',
      dueDate: '',
      amount: '',
      guest: '',
      birthday: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-slate-900">Create Reminder</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Reminder Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Reminder Type</label>
            <div className="grid grid-cols-2 gap-3">
              {reminderTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                      formData.type === type.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter reminder name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {formData.type === 'permit' ? 'Expiry Date' : 
                 formData.type === 'utility' ? 'Due Date' :
                 formData.type === 'birthday' ? 'Birthday' : 'Next Due Date'}
              </label>
              <input
                type="date"
                value={formData.type === 'permit' ? formData.expiryDate :
                       formData.type === 'utility' ? formData.dueDate :
                       formData.type === 'birthday' ? formData.birthday : formData.nextDue}
                onChange={(e) => {
                  const field = formData.type === 'permit' ? 'expiryDate' :
                               formData.type === 'utility' ? 'dueDate' :
                               formData.type === 'birthday' ? 'birthday' : 'nextDue'
                  handleInputChange(field, e.target.value)
                }}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assigned To</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Assignee</option>
                {recipients.map((recipient) => (
                  <optgroup key={recipient.category} label={recipient.category}>
                    {recipient.list.map((person) => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <div className="flex space-x-3">
              {priorities.map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    formData.priority === priority.value
                      ? priority.value === 'high' ? 'bg-red-100 text-red-800' :
                        priority.value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type-specific fields */}
          {formData.type === 'permit' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-slate-900">Permit Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Permit Number</label>
                  <input
                    type="text"
                    value={formData.permitNumber}
                    onChange={(e) => handleInputChange('permitNumber', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="DTCM-2024-XXX"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'utility' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-slate-900">Utility Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Unit</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Utility</label>
                  <select
                    value={formData.utility}
                    onChange={(e) => handleInputChange('utility', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Utility</option>
                    {utilities.map(utility => (
                      <option key={utility} value={utility}>{utility}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'birthday' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-slate-900">Birthday Details</h3>
              <div className="space-y-4">
                {recipients.map((recipient) => (
                  <div key={recipient.category}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{recipient.category}</label>
                    <select
                      value={formData.guest}
                      onChange={(e) => handleInputChange('guest', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select {recipient.category.slice(0, -1)}</option>
                      {recipient.list.map((person) => (
                        <option key={person} value={`${recipient.category}: ${person}`}>{person}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter reminder description"
            />
          </div>

          {/* Reminder Days */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Days Before</label>
            <input
              type="text"
              value={formData.reminderDays.join(', ')}
              onChange={(e) => handleInputChange('reminderDays', e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)))}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="7, 3, 1"
            />
            <p className="text-xs text-slate-500 mt-1">Enter days separated by commas (e.g., 7, 3, 1)</p>
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
              Create Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
