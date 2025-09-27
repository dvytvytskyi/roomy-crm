'use client'

import { useState } from 'react'
import { X, User, Shield, Eye, EyeOff, Mail, Phone, Building } from 'lucide-react'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: any) => void
}

export default function CreateUserModal({ isOpen, onClose, onSave }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Manager',
    department: '',
    status: 'Active',
    password: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    permissions: {
      properties: true,
      reservations: true,
      finances: false,
      settings: false,
      maintenance: true,
      cleaning: true,
      owners: true,
      guests: true
    }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const roles = [
    { value: 'Admin', label: 'Admin', description: 'Full system access' },
    { value: 'Manager', label: 'Manager', description: 'Management level access' },
    { value: 'Staff', label: 'Staff', description: 'Limited access' },
    { value: 'Contractor', label: 'Contractor', description: 'Task-specific access' },
    { value: 'Owner', label: 'Owner', description: 'Property owner access' }
  ]

  const departments = [
    'Management',
    'Operations',
    'Finance',
    'Maintenance',
    'Cleaning',
    'Customer Service',
    'IT Support'
  ]

  const permissions = [
    { key: 'properties', label: 'Properties', description: 'Manage properties and units' },
    { key: 'reservations', label: 'Reservations', description: 'Handle bookings and reservations' },
    { key: 'finances', label: 'Finances', description: 'Access financial data and reports' },
    { key: 'settings', label: 'Settings', description: 'Modify system settings' },
    { key: 'maintenance', label: 'Maintenance', description: 'Manage maintenance tasks' },
    { key: 'cleaning', label: 'Cleaning', description: 'Handle cleaning operations' },
    { key: 'owners', label: 'Owners', description: 'Manage property owners' },
    { key: 'guests', label: 'Guests', description: 'Handle guest information' }
  ]

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('permissions.')) {
      const permissionKey = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const user = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      status: formData.status,
      lastLogin: 'Never',
      permissions: formData.permissions,
      twoFactorEnabled: formData.twoFactorEnabled,
      createdAt: new Date().toISOString()
    }

    onSave(user)
    onClose()
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Manager',
      department: '',
      status: 'Active',
      password: '',
      confirmPassword: '',
      twoFactorEnabled: false,
      permissions: {
        properties: true,
        reservations: true,
        finances: false,
        settings: false,
        maintenance: true,
        cleaning: true,
        owners: true,
        guests: true
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-slate-900">Create User</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Role and Status */}
          <div>
            <h3 className="text-md font-medium text-slate-900 mb-4">Role & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Role</label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleInputChange('role', role.value)}
                      className={`w-full flex items-center space-x-3 p-3 border rounded-lg transition-colors cursor-pointer ${
                        formData.role === role.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <User size={18} />
                      <div className="text-left">
                        <div className="text-sm font-medium">{role.label}</div>
                        <div className="text-xs text-slate-500">{role.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('status', 'Active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      formData.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('status', 'Inactive')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      formData.status === 'Inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-md font-medium text-slate-900 mb-4">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="twoFactorEnabled" 
                  checked={formData.twoFactorEnabled}
                  onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                />
                <label htmlFor="twoFactorEnabled" className="text-sm text-slate-700">Enable Two-Factor Authentication</label>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-md font-medium text-slate-900 mb-4">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissions.map((permission) => (
                <div key={permission.key} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    id={permission.key}
                    checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                    onChange={(e) => handleInputChange(`permissions.${permission.key}`, e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500" 
                  />
                  <div>
                    <label htmlFor={permission.key} className="text-sm font-medium text-slate-900">{permission.label}</label>
                    <p className="text-xs text-slate-500">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
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
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
