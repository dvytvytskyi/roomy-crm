'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Calendar, MapPin, Building, DollarSign, MessageSquare, Upload, Plus, Minus, ChevronDown } from 'lucide-react'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'
import { getCountryFlag } from '@/lib/utils/countryFlags'
import { useFormValidation } from '@/lib/hooks/useFormValidation'
import { createOwnerSchema, type CreateOwnerData } from '@/lib/schemas/validation'
import { useRefreshData } from '@/lib/hooks/useRefreshData'

interface AddOwnerModalProps {
  onClose: () => void
  onSave: (owner: any) => void
}

export default function AddOwnerModal({ onClose, onSave }: AddOwnerModalProps) {
  const { refreshData } = useRefreshData();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useFormValidation(createOwnerSchema, {
    defaultValues: {
      firstName: '',
      lastName: '',
      nationality: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      whatsapp: '',
      telegram: '',
      comments: '',
      status: 'ACTIVE',
      paymentPreferences: 'Bank Transfer',
      personalStayDays: 30,
      role: 'OWNER'
    }
  });

  const [newUnit, setNewUnit] = useState('')
  const [newComment, setNewComment] = useState('')
  const [commentsHistory, setCommentsHistory] = useState<Array<{id: string, text: string, author: string, timestamp: string}>>([])
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false)
  
  // Watch form values for dynamic updates
  const watchedValues = watch();

  const nationalities = [
    'Emirati', 'British', 'Canadian', 'French', 'German', 'Italian', 'Spanish',
    'Chinese', 'Japanese', 'Korean', 'Indian', 'Australian', 'Brazilian', 'Egyptian',
    'Saudi Arabian', 'Turkish', 'Greek', 'Russian', 'American', 'Other'
  ]

  const availableUnits = [
    'BK Studio', 'Marina Apt', 'DT Loft', 'Palm Villa',
    'Sky Penthouse', 'BD 1A', 'Beach Villa',
    'City Apt', 'Garden Suite', 'Lux Penthouse', 'Tech Studio'
  ]

  const paymentMethods = [
    'Bank Transfer', 'PayPal', 'Monthly Bank Transfer', 'Quarterly Transfer', 'Wire Transfer'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleAddUnit = () => {
    if (newUnit && !formData.units.includes(newUnit)) {
      handleInputChange('units', [...formData.units, newUnit])
      setNewUnit('')
    }
  }

  const handleRemoveUnit = (unitToRemove: string) => {
    handleInputChange('units', formData.units.filter(unit => unit !== unitToRemove))
  }

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: 'Current User', // In real app, this would be the logged-in user
        timestamp: new Date().toISOString()
      }
      setCommentsHistory(prev => [comment, ...prev])
      setNewComment('')
    }
  }

  const removeComment = (commentId: string) => {
    setCommentsHistory(prev => prev.filter(comment => comment.id !== commentId))
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.nationality) {
      newErrors.nationality = 'Nationality is required'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (formData.units.length === 0) {
      newErrors.units = 'At least one unit must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (data: CreateOwnerData) => {
    const loadingToast = showToast.loading('Creating owner...')

    try {
      // Prepare data for API
      const ownerData = {
        ...data,
        password: 'TempPassword123!', // TODO: Generate secure password
        country: data.nationality,
      }

      // Call API to create owner
      const response = await userServiceAdapter.createUser(ownerData)
      
      if (response.success && response.data) {
        showToast.dismiss(loadingToast)
        showToast.success('Owner created successfully!')
        
        // Transform API response to match expected format
        const transformedOwner = {
          ...response.data,
          name: `${response.data.firstName} ${response.data.lastName}`,
          nationality: data.nationality,
          dateOfBirth: data.dateOfBirth,
          whatsapp: data.whatsapp,
          telegram: data.telegram,
          comments: data.comments,
          status: data.status,
          paymentPreferences: data.paymentPreferences,
          personalStayDays: data.personalStayDays,
          units: [], // TODO: Handle units properly
          reservationCount: 0,
          totalUnits: 0,
          vipStatus: data.status === 'ACTIVE',
          createdBy: 'Current User',
          createdByEmail: 'current@user.com',
          lastModifiedBy: 'Current User',
          lastModifiedByEmail: 'current@user.com',
          lastModifiedAt: new Date().toISOString()
        }

        onSave(transformedOwner)
        refreshData(); // Trigger data refresh
        onClose() // Close modal after successful creation
      } else {
        throw new Error(response.error || 'Failed to create owner')
      }
    } catch (error: any) {
      console.error('Error saving owner:', error)
      showToast.dismiss(loadingToast)
      showToast.error(error.message || 'Failed to create owner. Please try again.')
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
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Owner</h2>
              <p className="text-sm text-gray-600">Create a new property owner profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  First Name *
                </label>
                <input
                  type="text"
                  {...register('firstName')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register('lastName')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Nationality *
              </label>
              <div className="relative nationality-dropdown">
                <button
                  type="button"
                  onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between ${
                    errors.nationality ? 'border-red-300' : 'border-gray-300'
                  }`}
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
              {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="owner@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+971 50 123 4567"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+971 50 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram Username
              </label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building size={16} className="inline mr-2" />
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Units Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building size={16} className="inline mr-2" />
              Linked Units *
            </label>
            
            <div className="flex items-center space-x-2 mb-3">
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a unit to add</option>
                {availableUnits
                  .filter(unit => !formData.units.includes(unit))
                  .map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddUnit}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            {formData.units.length > 0 && (
              <div className="space-y-2">
                {formData.units.map(unit => (
                  <div key={unit} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">{unit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(unit)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.units && <p className="mt-1 text-sm text-red-600">{errors.units}</p>}
          </div>

          {/* Payment Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2" />
                Payment Preferences
              </label>
              <select
                value={formData.paymentPreferences}
                onChange={(e) => handleInputChange('paymentPreferences', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Stay Days
              </label>
              <input
                type="number"
                value={formData.personalStayDays}
                onChange={(e) => handleInputChange('personalStayDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="365"
              />
              <p className="mt-1 text-xs text-gray-500">Number of days per year for personal use</p>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={16} className="inline mr-2" />
              Owner Comments
            </label>
            
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment about this owner"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addComment()
                  }
                }}
              />
              <button
                type="button"
                onClick={addComment}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Comment
              </button>
            </div>

            {commentsHistory.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {commentsHistory.map(comment => (
                  <div key={comment.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {comment.author} • {formatDateTime(comment.timestamp)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeComment(comment.id)}
                      className="ml-2 p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <User size={16} />
                  <span>Create Owner</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
