'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Calendar, MapPin, Building, DollarSign, MessageSquare, Plus, Minus, ChevronDown, Globe } from 'lucide-react'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { propertyServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'
import { getCountryFlag } from '@/lib/utils/countryFlags'
import { useFormValidation } from '@/lib/hooks/useFormValidation'
import { createOwnerSchema, type CreateOwnerData } from '@/lib/schemas/validation'
import { useRefreshData } from '@/lib/hooks/useRefreshData'

interface AddOwnerModalProps {
  onClose: () => void
  onSave: (owner: any) => void
}

export default function AddOwnerModalNew({ onClose, onSave }: AddOwnerModalProps) {
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
      country: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      description: '',
      whatsapp: '',
      telegram: '',
      comments: '',
      status: 'ACTIVE',
      paymentPreferences: 'Bank Transfer',
      personalStayDays: 30,
      role: 'OWNER'
    }
  });

  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [availableProperties, setAvailableProperties] = useState<any[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [isNationalityDropdownOpen, setIsNationalityDropdownOpen] = useState(false)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  
  // Watch form values for dynamic updates
  const watchedValues = watch();

  const nationalities = [
    'Emirati', 'British', 'Canadian', 'French', 'German', 'Italian', 'Spanish',
    'Chinese', 'Japanese', 'Korean', 'Indian', 'Australian', 'Brazilian', 'Egyptian',
    'Saudi Arabian', 'Turkish', 'Greek', 'Russian', 'American', 'Other'
  ]

  const countries = [
    'United Arab Emirates', 'United Kingdom', 'Canada', 'France', 'Germany', 'Italy', 'Spain',
    'China', 'Japan', 'South Korea', 'India', 'Australia', 'Brazil', 'Egypt',
    'Saudi Arabia', 'Turkey', 'Greece', 'Russia', 'United States', 'Other'
  ]

  const paymentMethods = [
    'Bank Transfer', 'PayPal', 'Monthly Bank Transfer', 'Quarterly Transfer', 'Wire Transfer'
  ]

  // Load available properties
  useEffect(() => {
    const loadProperties = async () => {
      setLoadingProperties(true)
      try {
        const response = await propertyServiceAdapter.getAll({ limit: 100 })
        if (response.success && response.data) {
          setAvailableProperties(response.data.data || response.data)
        }
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoadingProperties(false)
      }
    }

    loadProperties()
  }, [])

  const handleAddUnit = (propertyId: string) => {
    if (!selectedUnits.includes(propertyId)) {
      setSelectedUnits([...selectedUnits, propertyId])
    }
  }

  const handleRemoveUnit = (propertyId: string) => {
    setSelectedUnits(selectedUnits.filter(id => id !== propertyId))
  }

  const onSubmit = async (data: CreateOwnerData) => {
    const loadingToast = showToast.loading('Creating owner...')

    try {
      // Prepare data for API (тільки поля, які очікує бекенд)
      const ownerData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        description: data.description,
        role: 'OWNER',
        status: data.status,
        password: 'TempPassword123!', // TODO: Generate secure password
        country: data.country || data.nationality,
        avatar: undefined, // Бекенд очікує це поле
        flag: undefined // Бекенд очікує це поле
      }

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
          units: selectedUnits,
          reservationCount: 0,
          totalUnits: selectedUnits.length,
          vipStatus: data.status === 'ACTIVE',
          createdBy: 'Current User',
          createdByEmail: 'current@user.com',
          createdAt: new Date().toISOString()
        }

        onSave(transformedOwner)
        reset()
        setSelectedUnits([])
        onClose()
        // refreshData() викликається в onSave на сторінці
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-500 rounded-xl">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Owner</h2>
              <p className="text-sm text-gray-600">Create a new property owner profile</p>
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
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* General Error Display */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

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

            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User size={20} className="mr-2 text-orange-500" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Country *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-left flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        {watchedValues.country ? (
                          <span className="text-sm text-gray-900">{watchedValues.country}</span>
                        ) : (
                          <span className="text-sm text-gray-500">Select country</span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isCountryDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto border border-gray-200">
                        {countries.map(country => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => {
                              setValue('country', country)
                              setIsCountryDropdownOpen(false)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors"
                          >
                            <span className="text-sm text-gray-900">{country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail size={20} className="mr-2 text-orange-500" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="john.doe@example.com"
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
                    {...register('phone')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+971 50 123 4567"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    {...register('whatsapp')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    {...register('telegram')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>

            {/* Status and Preferences Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building size={20} className="mr-2 text-orange-500" />
                Status & Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="VIP">VIP</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Payment Preferences
                  </label>
                  <select
                    {...register('paymentPreferences')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Stay Days
                </label>
                <input
                  type="number"
                  {...register('personalStayDays', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="30"
                />
                <p className="mt-1 text-sm text-gray-500">Number of days per year for personal use</p>
              </div>
            </div>

            {/* Linked Properties Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building size={20} className="mr-2 text-orange-500" />
                Linked Properties (Optional)
              </h3>
              
              {loadingProperties ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-3 text-gray-600">Loading properties...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableProperties.map(property => (
                      <div
                        key={property.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          selectedUnits.includes(property.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{property.name}</h4>
                            <p className="text-sm text-gray-600">{property.address}</p>
                            <p className="text-xs text-gray-500">
                              {property.type} • {property.bedrooms} bed • {property.bathrooms} bath
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedUnits.includes(property.id)) {
                                handleRemoveUnit(property.id)
                              } else {
                                handleAddUnit(property.id)
                              }
                            }}
                            className={`ml-4 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              selectedUnits.includes(property.id)
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-orange-200'
                            }`}
                          >
                            {selectedUnits.includes(property.id) ? (
                              <>
                                <Minus size={14} className="inline mr-1" />
                                Remove
                              </>
                            ) : (
                              <>
                                <Plus size={14} className="inline mr-1" />
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedUnits.length > 0 && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Selected Properties ({selectedUnits.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUnits.map(unitId => {
                          const property = availableProperties.find(p => p.id === unitId)
                          return property ? (
                            <span
                              key={unitId}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                            >
                              {property.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveUnit(unitId)}
                                className="ml-2 text-orange-600 hover:text-orange-800"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare size={20} className="mr-2 text-orange-500" />
                Additional Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Brief description of the owner..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Comments
                  </label>
                  <textarea
                    {...register('comments')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Add any additional notes about this owner..."
                  />
                </div>
              </div>
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
    </div>
  )
}
