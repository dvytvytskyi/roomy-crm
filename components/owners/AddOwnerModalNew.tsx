'use client'

import { useState } from 'react'
import { X, User, MapPin, ChevronDown } from 'lucide-react'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'
import { getCountryFlag } from '@/lib/utils/countryFlags'
import { useFormValidation } from '@/lib/hooks/useFormValidation'
import { createOwnerSchema, type CreateOwnerData } from '@/lib/schemas/validation'

interface AddOwnerModalProps {
  onClose: () => void
  onSave: (owner: any) => void
}

export default function AddOwnerModalNew({ onClose, onSave }: AddOwnerModalProps) {
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
      role: 'OWNER'
    }
  });

  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false)
  
  // Watch form values for dynamic updates
  const watchedValues = watch();

  const nationalities = [
    'Emirati', 'British', 'Canadian', 'French', 'German', 'Italian', 'Spanish',
    'Chinese', 'Japanese', 'Korean', 'Indian', 'Australian', 'Brazilian', 'Egyptian',
    'Saudi Arabian', 'Turkish', 'Greek', 'Russian', 'American', 'Other'
  ]

  const onSubmit = async (data: CreateOwnerData) => {
    const loadingToast = showToast.loading('Creating owner...')

    try {
      // Prepare simplified data for API
      const ownerData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        nationality: data.nationality,
        role: 'OWNER',
        status: 'ACTIVE'
      }

      // Use provided email or generate one
      if (data.email && data.email.trim()) {
        ownerData.email = data.email
      } else {
        ownerData.email = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@owner.com`
      }

      // Use provided password or let backend generate one
      if (data.password && data.password.trim()) {
        ownerData.password = data.password
      }
      // If password not provided, backend will auto-generate it

      const response = await userServiceAdapter.createUser(ownerData)
      
      if (response.success && response.data) {
        showToast.dismiss(loadingToast)
        
        // Check if password was generated
        const generatedPassword = (response.data as any).generatedPassword
        
        if (generatedPassword) {
          showToast.success('Owner created with auto-generated password!')
          
          // Show password to admin (will implement modal in next step)
          alert(`Owner created successfully!\n\nEmail: ${ownerData.email}\nPassword: ${generatedPassword}\n\nPlease save this password and send it to the owner securely.`)
        } else {
          showToast.success('Owner created successfully!')
        }
        
        // Transform API response to match expected format
        const transformedOwner = {
          ...response.data,
          name: `${response.data.firstName} ${response.data.lastName}`,
          nationality: data.nationality,
          country: data.nationality, // Для сумісності
          status: 'ACTIVE',
          reservationCount: 0,
          totalUnits: 0,
          vipStatus: false,
          createdBy: 'Current User',
          createdByEmail: 'current@user.com',
          createdAt: new Date().toISOString()
        }

        onSave(transformedOwner)
        reset()
        onClose()
      } else {
        throw new Error(response.error || 'Failed to create owner')
      }
    } catch (error: any) {
      console.error('Error creating owner:', error)
      showToast.dismiss(loadingToast)
      showToast.error(error.message || 'Failed to create owner. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-500 rounded-xl">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Owner</h2>
              <p className="text-sm text-gray-600">Create a new property owner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Validation Errors Display */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
              <ul className="text-red-600 text-sm space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {field}: {error?.message || 'Invalid value'}</li>
                ))}
              </ul>
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              First Name *
            </label>
            <input
              type="text"
              {...register('firstName')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Last Name *
            </label>
            <input
              type="text"
              {...register('lastName')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Nationality *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNationalityDropdownOpen(!isNationalityDropdownOpen)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-left flex items-center justify-between transition-colors ${
                  errors.nationality ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {watchedValues.nationality ? (
                    <>
                      <span className="text-lg">{getCountryFlag(watchedValues.nationality)}</span>
                      <span className="text-sm text-gray-900">{watchedValues.nationality}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Select nationality</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isNationalityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isNationalityDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto border border-gray-200">
                  {nationalities.map(nationality => (
                    <button
                      key={nationality}
                      type="button"
                      onClick={() => {
                        setValue('nationality', nationality)
                        setIsNationalityDropdownOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center space-x-2 transition-colors"
                    >
                      <span className="text-lg">{getCountryFlag(nationality)}</span>
                      <span className="text-sm text-gray-900">{nationality}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>}
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Email (Optional)
            </label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="owner@example.com (auto-generated if empty)"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate: firstname.lastname@owner.com</p>
          </div>

          {/* Password (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-2" />
              Password (Optional)
            </label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Leave empty to auto-generate secure password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate a secure 16-character password</p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
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
