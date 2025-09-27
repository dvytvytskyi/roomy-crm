'use client'

import { useState } from 'react'
import { X, Mail, Clock, User, Bell, Play, Pause } from 'lucide-react'

interface CreateAutoSenderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (autoSender: any) => void
}

export default function CreateAutoSenderModal({ isOpen, onClose, onSave }: CreateAutoSenderModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Email',
    trigger: '',
    timing: '',
    status: 'Active',
    recipients: 'Guests',
    template: '',
    subject: '',
    content: '',
    delayMinutes: 0,
    respectBusinessHours: true
  })

  const types = [
    { value: 'Email', label: 'Email', icon: Mail, description: 'Send automated emails' }
  ]

  const triggers = [
    'Reservation Confirmed',
    'Payment Received',
    'Payment Overdue',
    '48 Hours Before Check-in',
    '24 Hours Before Check-in',
    'Check-out Completed',
    'Maintenance Request Created',
    'Task Completed',
    'Owner Payout Processed'
  ]

  const timings = [
    'Immediately',
    '1 hour after',
    '2 hours after',
    '24 hours after',
    '48 hours after',
    '3 days after',
    '7 days after',
    'Custom delay'
  ]

  const recipients = [
    'Guests',
    'Owners',
    'Contractors',
    'Staff',
    'All Users'
  ]

  const templates = [
    'Welcome Email Template',
    'Payment Reminder Template',
    'Check-in Instructions Template',
    'Check-out Confirmation Template',
    'Maintenance Update Template',
    'Owner Payout Notification Template'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const autoSender = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      trigger: formData.trigger,
      timing: formData.timing,
      status: formData.status,
      recipients: formData.recipients,
      lastSent: 'Never',
      sentCount: 0,
      template: formData.template,
      subject: formData.subject,
      content: formData.content,
      delayMinutes: formData.delayMinutes,
      respectBusinessHours: formData.respectBusinessHours
    }

    onSave(autoSender)
    onClose()
    
    // Reset form
    setFormData({
      name: '',
      type: 'Email',
      trigger: '',
      timing: '',
      status: 'Active',
      recipients: 'Guests',
      template: '',
      subject: '',
      content: '',
      delayMinutes: 0,
      respectBusinessHours: true
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-slate-900">Create Auto-Sender</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Message Type</label>
            <div className="grid grid-cols-2 gap-3">
              {types.map((type) => {
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
                    <div className="text-left">
                      <div className="text-sm font-medium">{type.label}</div>
                      <div className="text-xs text-slate-500">{type.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Auto-Sender Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter auto-sender name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Recipients</label>
              <select
                value={formData.recipients}
                onChange={(e) => handleInputChange('recipients', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                {recipients.map(recipient => (
                  <option key={recipient} value={recipient}>{recipient}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Trigger and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timing</label>
              <select
                value={formData.timing}
                onChange={(e) => handleInputChange('timing', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Timing</option>
                {timings.map(timing => (
                  <option key={timing} value={timing}>{timing}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Delay */}
          {formData.timing === 'Custom delay' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Custom Delay (minutes)</label>
              <input
                type="number"
                value={formData.delayMinutes}
                onChange={(e) => handleInputChange('delayMinutes', parseInt(e.target.value))}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter delay in minutes"
                min="0"
              />
            </div>
          )}

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

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Template</label>
            <select
              value={formData.template}
              onChange={(e) => handleInputChange('template', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select Template</option>
              {templates.map(template => (
                <option key={template} value={template}>{template}</option>
              ))}
            </select>
          </div>

          {/* Message Content */}
          {formData.type === 'Email' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter email subject"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter message content with placeholders like {guest_name}, {property_name}, etc."
            />
            <p className="text-xs text-slate-500 mt-1">
              Use placeholders: {`{{guest_name}}, {{property_name}}, {{check_in_date}}, {{amount}}, {{booking_reference}}`}
            </p>
          </div>

          {/* Business Hours */}
          <div className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="respectBusinessHours" 
              checked={formData.respectBusinessHours}
              onChange={(e) => handleInputChange('respectBusinessHours', e.target.checked)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
            />
            <label htmlFor="respectBusinessHours" className="text-sm text-slate-700">Respect business hours (9 AM - 6 PM)</label>
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
              Create Auto-Sender
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
