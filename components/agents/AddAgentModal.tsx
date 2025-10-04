'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, Flag, Home, Percent, MessageSquare } from 'lucide-react'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'

interface AddAgentModalProps {
  isOpen: boolean
  onClose: () => void
  agent?: any
}

export default function AddAgentModal({ isOpen, onClose, agent }: AddAgentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    birthday: '',
    unitsAttracted: [] as { name: string; commission: string }[],
    status: 'Active',
    comments: ''
  })

  const nationalities = [
    'UAE', 'UK', 'Egypt', 'Australia', 'USA', 'India', 'Pakistan', 'Philippines'
  ]

  const availableUnits = [
    { name: 'Downtown Loft 1BR', commission: '' },
    { name: 'Marina View Studio', commission: '' },
    { name: 'Burj Khalifa 2BR', commission: '' },
    { name: 'JBR Beachfront 3BR', commission: '' },
    { name: 'Business Bay Penthouse', commission: '' },
    { name: 'Dubai Hills Villa', commission: '' },
    { name: 'Palm Jumeirah Apartment', commission: '' },
    { name: 'DIFC Office Space', commission: '' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUnitToggle = (unitName: string) => {
    setFormData(prev => ({
      ...prev,
      unitsAttracted: prev.unitsAttracted.some(u => u.name === unitName)
        ? prev.unitsAttracted.filter(u => u.name !== unitName)
        : [...prev.unitsAttracted, { name: unitName, commission: '' }]
    }))
  }

  const handleUnitCommissionChange = (unitName: string, commission: string) => {
    setFormData(prev => ({
      ...prev,
      unitsAttracted: prev.unitsAttracted.map(u => 
        u.name === unitName ? { ...u, commission } : u
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const loadingToast = showToast.loading('Creating agent...')

    try {
      // Prepare data for API
      const agentData = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        role: 'AGENT' as const,
        password: 'TempPassword123!', // TODO: Generate secure password
        status: formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
        country: formData.nationality,
        // Additional fields for agent
        nationality: formData.nationality,
        birthday: formData.birthday,
        unitsAttracted: formData.unitsAttracted,
        notes: formData.notes
      }

      // Call API to create agent
      const response = await userServiceAdapter.createUser(agentData)
      
      if (response.success && response.data) {
        showToast.dismiss(loadingToast)
        showToast.success('Agent created successfully!')
        
        // Transform API response to match expected format
        const transformedAgent = {
          ...response.data,
          name: `${response.data.firstName} ${response.data.lastName}`,
          nationality: formData.nationality,
          birthday: formData.birthday,
          unitsAttracted: formData.unitsAttracted,
          status: formData.status,
          notes: formData.notes,
          createdBy: 'Current User',
          createdAt: new Date().toISOString(),
          lastModifiedBy: 'Current User',
          lastModifiedAt: new Date().toISOString()
        }

        handleSave(transformedAgent)
      } else {
        throw new Error(response.error || 'Failed to create agent')
      }
    } catch (error: any) {
      console.error('Error saving agent:', error)
      showToast.dismiss(loadingToast)
      showToast.error(error.message || 'Failed to create agent. Please try again.')
    }
  }

  const handleSave = (agentData: any) => {
    console.log('Agent saved:', agentData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-slate-900">Add New Agent</h2>
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
            <h3 className="text-md font-medium text-slate-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nationality</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Nationality</option>
                  {nationalities.map(nationality => (
                    <option key={nationality} value={nationality}>{nationality}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Birthday</label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Units Attracted */}
          <div>
            <h3 className="text-md font-medium text-slate-900 mb-4">Units Attracted</h3>
            <div className="grid grid-cols-1 gap-3">
              {availableUnits.map((unit) => (
                <div key={unit.name} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id={unit.name}
                    checked={formData.unitsAttracted.some(u => u.name === unit.name)}
                    onChange={() => handleUnitToggle(unit.name)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <label htmlFor={unit.name} className="text-sm text-slate-700 cursor-pointer">
                      {unit.name}
                    </label>
                    {formData.unitsAttracted.some(u => u.name === unit.name) && (
                      <div className="mt-2">
                        <input
                          type="number"
                          placeholder="Commission %"
                          value={formData.unitsAttracted.find(u => u.name === unit.name)?.commission || ''}
                          onChange={(e) => handleUnitCommissionChange(unit.name, e.target.value)}
                          className="w-24 h-8 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="ml-2 text-xs text-slate-500">%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {formData.unitsAttracted.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Selected units ({formData.unitsAttracted.length}):</p>
                <div className="space-y-2">
                  {formData.unitsAttracted.map((unit) => (
                    <div key={unit.name} className="flex items-center justify-between">
                      <span className="text-sm text-slate-900">{unit.name}</span>
                      <span className="text-sm font-medium text-orange-600">
                        {unit.commission ? `${unit.commission}%` : 'No commission set'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Add any notes or remarks about the agent"
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
              Add Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
