'use client'

import { useState } from 'react'
import { X, Zap, Play, Pause, Mail, MessageSquare, FileText, Clock, CheckCircle } from 'lucide-react'

interface CreateAutomationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (automation: any) => void
}

export default function CreateAutomationModal({ isOpen, onClose, onSave }: CreateAutomationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    condition: '',
    action: '',
    status: 'Active',
    description: ''
  })

  const triggers = [
    'New Reservation Confirmed',
    'Payment Received',
    'Payment Overdue',
    '48 Hours Before Check-in',
    'Check-out Completed',
    'Maintenance Request Created',
    'Task Completed',
    'Owner Payout Processed'
  ]

  const conditions = [
    'Reservation Status = Confirmed',
    'Payment Status = Pending AND Days Overdue > 3',
    'Check-in Date - Current Date = 2 days',
    'Task Category = Plumbing',
    'Task Status = Completed',
    'Payout Amount > 1000'
  ]

  const actions = [
    'Send Welcome Email to Guest',
    'Send Payment Reminder SMS',
    'Send Check-in Instructions Email',
    'Assign to Plumbing Contractor',
    'Generate Invoice',
    'Send Owner Notification',
    'Create Follow-up Task',
    'Update Reservation Status'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const automation = {
      id: Date.now(),
      name: formData.name,
      trigger: formData.trigger,
      condition: formData.condition,
      action: formData.action,
      status: formData.status,
      lastTriggered: 'Never',
      triggerCount: 0,
      description: formData.description
    }

    onSave(automation)
    onClose()
    
    // Reset form
    setFormData({
      name: '',
      trigger: '',
      condition: '',
      action: '',
      status: 'Active',
      description: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-slate-900">Create Automation</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Automation Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter automation name"
              required
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trigger Event</label>
            <select
              value={formData.trigger}
              onChange={(e) => handleInputChange('trigger', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select Trigger Event</option>
              {triggers.map(trigger => (
                <option key={trigger} value={trigger}>{trigger}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Condition</label>
            <select
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select Condition</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
            <select
              value={formData.action}
              onChange={(e) => handleInputChange('action', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select Action</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => handleInputChange('status', 'Active')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  formData.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Play size={16} />
                <span>Active</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('status', 'Paused')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  formData.status === 'Paused'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Pause size={16} />
                <span>Paused</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter automation description"
            />
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
              Create Automation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
