'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, Mail, Phone, Calendar, FileText, Trash2, Star, Crown } from 'lucide-react'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'
import { useAgentEvents } from '@/hooks/useEventBus'

interface AddAgentModalProps {
  isOpen: boolean
  onClose: () => void
  agent?: any
  onAgentUpdated?: (updatedAgent: any) => void
}

export default function AddAgentModal({ isOpen, onClose, agent, onAgentUpdated }: AddAgentModalProps) {
  const { emitAgentUpdated, emitAgentCreated } = useAgentEvents()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    dateOfBirth: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    isVerified: false
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form data when agent prop changes (for editing)
  useEffect(() => {
    if (agent && isOpen) {
      setFormData({
        firstName: agent.firstName || '',
        lastName: agent.lastName || '',
        email: agent.email || '',
        phone: agent.phone || '',
        nationality: agent.nationality || '',
        dateOfBirth: agent.dateOfBirth || '',
        status: agent.status || 'ACTIVE',
        isVerified: agent.isVerified || false
      })
    } else if (!agent && isOpen) {
      // Reset form for new agent
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        dateOfBirth: '',
        status: 'ACTIVE',
        isVerified: false
      })
    }
  }, [agent, isOpen])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const agentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: 'temp_password_123', // Temporary password - should be changed by user on first login
        role: 'AGENT' as const,
        status: formData.status,
        country: formData.nationality || 'Ukraine', // Default to Ukraine if not specified
        flag: '🇺🇦' // Default flag
      }

      let response
      if (agent) {
        // Update existing agent
        console.log('Updating agent:', agent.id, agentData)
        response = await userServiceAdapter.updateUser(agent.id, agentData)
      } else {
        // Create new agent
        console.log('Creating new agent:', agentData)
        response = await userServiceAdapter.createUser(agentData)
      }

      if (response.success && response.data) {
        showToast.success(agent ? 'Agent updated successfully!' : 'Agent created successfully!')
        handleSave(response.data)
      } else {
        showToast.error(response.message || (agent ? 'Failed to update agent' : 'Failed to create agent'))
      }
    } catch (error: any) {
      console.error('Error saving agent:', error)
      showToast.error(error.message || 'An error occurred while saving the agent')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = (agentData: any) => {
    console.log('Agent saved:', agentData)
    
    // Emit appropriate event based on whether we're creating or updating
    if (agent) {
      // Updating existing agent
      emitAgentUpdated(agent.id, agentData)
      console.log('📡 AddAgentModal: Emitted agent updated event for:', agent.id)
    } else {
      // Creating new agent
      emitAgentCreated(agentData)
      console.log('📡 AddAgentModal: Emitted agent created event')
    }
    
    if (onAgentUpdated) {
      onAgentUpdated(agentData)
    }
    
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {agent ? 'Edit Agent' : 'Add New Agent'}
              </h2>
              <p className="text-sm text-slate-600">
                {agent ? 'Update agent information' : 'Create a new agent profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter nationality"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status and Verification */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Status & Verification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isVerified" className="text-sm font-medium text-slate-700">
                  Verified Agent
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{agent ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{agent ? 'Update Agent' : 'Create Agent'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}