'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Calendar, MapPin, Building, DollarSign, MessageSquare, Upload, Plus, Minus, ChevronDown } from 'lucide-react'
import { userService } from '@/lib/api/services/userService'
import { User as UserType } from '@/lib/api'

// Function to get country flag emoji
const getCountryFlag = (nationality: string) => {
  const flagMap: { [key: string]: string } = {
    'Emirati': '🇦🇪',
    'British': '🇬🇧',
    'Canadian': '🇨🇦',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Spanish': '🇪🇸',
    'Chinese': '🇨🇳',
    'Japanese': '🇯🇵',
    'Korean': '🇰🇷',
    'Indian': '🇮🇳',
    'Australian': '🇦🇺',
    'Brazilian': '🇧🇷',
    'Egyptian': '🇪🇬',
    'Saudi Arabian': '🇸🇦',
    'Turkish': '🇹🇷',
    'Greek': '🇬🇷',
    'Russian': '🇷🇺',
    'American': '🇺🇸',
    'Other': '🌍'
  }
  return flagMap[nationality] || '🌍'
}

interface EditOwnerModalProps {
  owner: UserType
  onClose: () => void
  onSave: (owner: any) => void
}

export default function EditOwnerModal({ owner, onClose, onSave }: EditOwnerModalProps) {
  const [formData, setFormData] = useState({
    firstName: owner.firstName || '',
    lastName: owner.lastName || '',
    nationality: owner.nationality || '',
    dateOfBirth: owner.dateOfBirth || '',
    email: owner.email || '',
    phone: owner.phone || '',
    whatsapp: owner.phone || '',
    telegram: '',
    properties: owner.properties || [],
    comments: owner.comments || '',
    isActive: owner.isActive ?? true,
    paymentPreferences: 'Bank Transfer',
    personalStayDays: 30
  })

  const [newProperty, setNewProperty] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false)

  const nationalities = [
    'Emirati', 'British', 'Canadian', 'French', 'German', 'Italian', 'Spanish',
    'Chinese', 'Japanese', 'Korean', 'Indian', 'Australian', 'Brazilian', 'Egyptian',
    'Saudi Arabian', 'Turkish', 'Greek', 'Russian', 'American', 'Other'
  ]

  const paymentMethods = ['Bank Transfer', 'Cash', 'Cheque', 'Wire Transfer']

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddProperty = () => {
    if (newProperty.trim() && !formData.properties.includes(newProperty.trim())) {
      setFormData(prev => ({
        ...prev,
        properties: [...prev.properties, newProperty.trim()]
      }))
      setNewProperty('')
    }
  }

  const handleRemoveProperty = (property: string) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.filter(p => p !== property)
    }))
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedComments = formData.comments 
        ? `${formData.comments}\n${newComment.trim()}`
        : newComment.trim()
      setFormData(prev => ({ ...prev, comments: updatedComments }))
      setNewComment('')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const updatedOwner = {
        ...owner,
        ...formData,
        totalUnits: formData.properties.length
      }
      
      await userService.updateOwner(owner.id, updatedOwner)
      onSave(updatedOwner)
      onClose()
    } catch (error) {
      console.error('Error updating owner:', error)
      setErrors({ general: 'Failed to update owner. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.nationality-dropdown')) {
        setIsNationalityDropdownOpen(false)
      }
    }

    if (isNationalityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNationalityDropdownOpen])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Owner</h2>
              <p className="text-sm text-gray-500">Update owner information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-orange-600" />
                <span>Personal Information</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <div className="relative nationality-dropdown">
                  <button
                    type="button"
                    onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-left flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      {formData.nationality ? (
                        <>
                          <span className="text-lg">{getCountryFlag(formData.nationality)}</span>
                          <span className="text-sm text-gray-900">{formData.nationality}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Select nationality</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isNationalityDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="py-1">
                        {nationalities.map(nationality => (
                          <button
                            key={nationality}
                            type="button"
                            onClick={() => {
                              handleInputChange('nationality', nationality)
                              setIsNationalityDropdownOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <span className="text-lg">{getCountryFlag(nationality)}</span>
                            <span className="text-sm text-gray-900">{nationality}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-orange-600" />
                <span>Contact Information</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter WhatsApp number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telegram
                </label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter Telegram username"
                />
              </div>
            </div>
          </div>

          {/* Properties */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Building className="w-5 h-5 text-orange-600" />
              <span>Properties</span>
            </h3>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newProperty}
                onChange={(e) => setNewProperty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddProperty()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter property name"
              />
              <button
                onClick={handleAddProperty}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {formData.properties.map((property, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{property}</span>
                  <button
                    onClick={() => handleRemoveProperty(property)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-orange-600" />
              <span>Status</span>
            </h3>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={formData.isActive}
                  onChange={() => handleInputChange('isActive', true)}
                  className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  checked={!formData.isActive}
                  onChange={() => handleInputChange('isActive', false)}
                  className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <span>Comments</span>
            </h3>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Add a comment"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {formData.comments && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-line">{formData.comments}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
