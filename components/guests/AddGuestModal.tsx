'use client'

import { useState, useEffect } from 'react'
import { X, Save, User } from 'lucide-react'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'
import { useGuestEvents } from '@/hooks/useEventBus'

interface AddGuestModalProps {
  isOpen: boolean
  onClose: () => void
  guest?: any
  onGuestUpdated?: (updatedGuest: any) => void
}

export default function AddGuestModal({ isOpen, onClose, guest, onGuestUpdated }: AddGuestModalProps) {
  const { emitGuestUpdated, emitGuestCreated } = useGuestEvents()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationality: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    preferredLanguage: 'English'
  })
  const [errors, setErrors] = useState<any>({})

  const nationalities = [
    'Emirati', 'British', 'Canadian', 'American', 'Indian', 'Pakistani', 'Filipino', 'Egyptian',
    'Saudi Arabian', 'Kuwaiti', 'Qatari', 'Bahraini', 'Omani', 'Jordanian', 'Lebanese', 'Syrian',
    'Iraqi', 'Iranian', 'Turkish', 'Chinese', 'Japanese', 'Korean', 'French', 'German', 'Italian',
    'Spanish', 'Russian', 'Ukrainian', 'Brazilian', 'Argentinian', 'Mexican', 'Australian',
    'South African', 'Nigerian', 'Kenyan', 'Moroccan', 'Algerian', 'Tunisian', 'Other'
  ]

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Turkish', 'Greek'
  ]

  // Helper function to parse date for display
  const parseDateForDisplay = (dateString: string) => {
    if (!dateString) return { day: '', month: '', year: '' }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Try parsing DD/MM/YYYY format
        const parts = dateString.split('/')
        if (parts.length === 3) {
          return {
            day: parts[0] || '',
            month: parts[1] || '',
            year: parts[2] || ''
          }
        }
        return { day: '', month: '', year: '' }
      }
      
      return {
        day: date.getDate().toString().padStart(2, '0'),
        month: (date.getMonth() + 1).toString().padStart(2, '0'),
        year: date.getFullYear().toString()
      }
    } catch {
      return { day: '', month: '', year: '' }
    }
  }

  // Populate form data when editing a guest
  useEffect(() => {
    if (guest && isOpen) {
      setFormData({
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        nationality: guest.nationality || '',
        email: guest.email || '',
        phone: guest.phone || '',
        dateOfBirth: guest.dateOfBirth || '',
        preferredLanguage: guest.preferredLanguage || 'English'
      })
    } else if (!guest && isOpen) {
      // Reset form for new guest
      setFormData({
        firstName: '',
        lastName: '',
        nationality: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        preferredLanguage: 'English'
      })
    }
  }, [guest, isOpen])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.nationality) {
      newErrors.nationality = 'Nationality is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    const loadingToast = showToast.loading(guest ? 'Updating guest...' : 'Creating guest...')

    try {
      // Prepare data for API
      const guestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationality: formData.nationality,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        preferredLanguage: formData.preferredLanguage,
        role: 'GUEST',
        status: 'ACTIVE'
      }

      let response
      if (guest) {
        // Update existing guest
        response = await userServiceAdapter.updateUser(guest.id, guestData)
      } else {
        // Create new guest
        response = await userServiceAdapter.createUser({
          ...guestData,
          password: 'TempPassword123!' // Only for new guests
        })
      }
      
      if (response.success && response.data) {
        showToast.dismiss(loadingToast)
        showToast.success(guest ? 'Guest updated successfully!' : 'Guest created successfully!')
        
        // Transform API response to match expected format
        const transformedGuest = {
          ...response.data,
          name: `${response.data.firstName} ${response.data.lastName}`,
          nationality: formData.nationality,
          country: formData.nationality, // Для сумісності
          status: 'ACTIVE',
          reservationCount: guest?.reservationCount || 0,
          totalUnits: guest?.totalUnits || 0,
          vipStatus: guest?.vipStatus || false,
          createdBy: guest?.createdBy || 'Current User',
          createdByEmail: guest?.createdByEmail || 'current@user.com',
          createdAt: guest?.createdAt || new Date().toISOString()
        }

        handleSave(transformedGuest)
      } else {
        throw new Error(response.error || `Failed to ${guest ? 'update' : 'create'} guest`)
      }
    } catch (error: any) {
      console.error('Error saving guest:', error)
      showToast.dismiss(loadingToast)
      
      // Handle specific error cases
      if (error.message?.includes('email')) {
        showToast.error('Email already exists. Please try again.')
      } else if (error.message?.includes('validation')) {
        showToast.error('Please check all required fields.')
      } else {
        showToast.error(error.message || `Failed to ${guest ? 'update' : 'create'} guest. Please try again.`)
      }
    }
  }

  const handleSave = (guestData: any) => {
    if (guest) {
      emitGuestUpdated(guestData)
      onGuestUpdated?.(guestData)
    } else {
      emitGuestCreated(guestData)
    }
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {guest ? 'Edit Guest' : 'Add New Guest'}
              </h2>
              <p className="text-sm text-gray-600">
                {guest ? 'Update guest information' : 'Create a new guest profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality *
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.nationality ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select nationality</option>
              {nationalities.map(nationality => (
                <option key={nationality} value={nationality}>{nationality}</option>
              ))}
            </select>
            {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birth Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                max="31"
                placeholder="DD"
                value={parseDateForDisplay(formData.dateOfBirth).day}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => {
                  const day = e.target.value.padStart(2, '0')
                  const currentDate = formData.dateOfBirth ? formData.dateOfBirth.split('/') : ['', '', '']
                  const newDate = `${day}/${currentDate[1]}/${currentDate[2]}`
                  handleChange('dateOfBirth', newDate)
                }}
              />
              <input
                type="number"
                min="1"
                max="12"
                placeholder="MM"
                value={parseDateForDisplay(formData.dateOfBirth).month}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => {
                  const month = e.target.value.padStart(2, '0')
                  const currentDate = formData.dateOfBirth ? formData.dateOfBirth.split('/') : ['', '', '']
                  const newDate = `${currentDate[0]}/${month}/${currentDate[2]}`
                  handleChange('dateOfBirth', newDate)
                }}
              />
              <input
                type="number"
                min="1900"
                max="2024"
                placeholder="YYYY"
                value={parseDateForDisplay(formData.dateOfBirth).year}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onChange={(e) => {
                  const year = e.target.value
                  const currentDate = formData.dateOfBirth ? formData.dateOfBirth.split('/') : ['', '', '']
                  const newDate = `${currentDate[0]}/${currentDate[1]}/${year}`
                  handleChange('dateOfBirth', newDate)
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            <select
              value={formData.preferredLanguage}
              onChange={(e) => handleChange('preferredLanguage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {languages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Save size={16} />
              <span>{guest ? 'Update Guest' : 'Create Guest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}