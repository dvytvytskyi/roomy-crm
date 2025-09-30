'use client'

import { useState, useEffect, useCallback } from 'react'
import { Edit, Calendar, DollarSign, CreditCard, Info, Flag, Mail, Phone, Plus, X, Download, Check, Building, User, ArrowLeft } from 'lucide-react'
import TopNavigation from '../../../components/TopNavigation'
import ReservationModal from '../../../components/ReservationModal'
import RatingStars from '../../../components/RatingStars'

interface AmenitiesEditModalProps {
  amenities: string[]
  selectedAmenities: string[]
  onSave: (amenities: string[]) => void
  onCancel: () => void
}

function AmenitiesEditModal({ amenities, selectedAmenities, onSave, onCancel }: AmenitiesEditModalProps) {
  const [selected, setSelected] = useState<string[]>(selectedAmenities)
  const [newAmenity, setNewAmenity] = useState('')

  const handleToggleAmenity = (amenity: string) => {
    if (selected.includes(amenity)) {
      setSelected(selected.filter(item => item !== amenity))
    } else {
      setSelected([...selected, amenity])
    }
  }

  const handleAddNewAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      // Додаємо новий amenity до списку доступних
      amenities.push(newAmenity.trim())
      setNewAmenity('')
    }
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">Select amenities for this property:</p>
        
        {/* Add new amenity */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add new amenity:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Enter new amenity..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddNewAmenity()}
            />
            <button
              onClick={handleAddNewAmenity}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {amenities.map((amenity, index) => (
            <label key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(amenity)}
                onChange={() => handleToggleAmenity(amenity)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
              {selected.includes(amenity) && (
                <Check size={16} className="text-orange-500 ml-auto" />
              )}
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(selected)}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  )
}

interface RulesEditModalProps {
  rules: string[]
  selectedRules: string[]
  onSave: (rules: string[]) => void
  onCancel: () => void
}

interface OwnerEditModalProps {
  owner: {
    id?: string
    name: string
    flag: string
    country: string
    email: string
    phone: string
    status: string
  }
  onSave: (owner: any) => void
  onCancel: () => void
}

interface IncomeDistribution {
  ownerIncome: number
  roomyAgencyFee: number
  referringAgent: number
  totalProfit: number
}

interface IncomeEditModalProps {
  incomeDistribution: IncomeDistribution
  onSave: (income: IncomeDistribution) => void
  onCancel: () => void
}

interface PropertyGeneralInfo {
  name: string
  nickname: string
  status: string
  type: string
  location: string
  address: string
  size: string
  beds: string
  parkingSlots: string
  agencyFee: string
  dtcmLicenseExpiry: string
  referringAgent: string
  checkIn: string
  checkOut: string
  unitIntakeDate: string
}

interface AddExpenseModalProps {
  onSave: (expense: any) => void
  onCancel: () => void
}

interface AddDocumentModalProps {
  onSave: (document: any) => void
  onCancel: () => void
}

interface EditAvailabilityModalProps {
  settings: any
  onSave: (settings: any) => void
  onCancel: () => void
}


interface Photo {
  id: string
  url: string
  name: string
  size: number
  isCover: boolean
  uploadedAt: string
}

interface AddUtilityModalProps {
  onSave: (utility: { title: string; description: string }) => void
  onCancel: () => void
}

interface AddPaymentModalProps {
  onSave: (payment: any) => void
  onCancel: () => void
}

function RulesEditModal({ rules, selectedRules, onSave, onCancel }: RulesEditModalProps) {
  const [selected, setSelected] = useState<string[]>(selectedRules)
  const [newRule, setNewRule] = useState('')

  const handleToggleRule = (rule: string) => {
    if (selected.includes(rule)) {
      setSelected(selected.filter(item => item !== rule))
    } else {
      setSelected([...selected, rule])
    }
  }

  const handleAddNewRule = () => {
    if (newRule.trim() && !rules.includes(newRule.trim())) {
      // Додаємо нове правило до списку доступних
      rules.push(newRule.trim())
      setNewRule('')
    }
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">Select rules for this property:</p>
        
        {/* Add new rule */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add new rule:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Enter new rule..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddNewRule()}
            />
            <button
              onClick={handleAddNewRule}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {rules.map((rule, index) => (
            <label key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(rule)}
                onChange={() => handleToggleRule(rule)}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{rule}</span>
              {selected.includes(rule) && (
                <Check size={16} className="text-orange-500 ml-auto" />
              )}
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(selected)}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  )
}

function OwnerEditModal({ owner, onSave, onCancel }: OwnerEditModalProps) {
  const [formData, setFormData] = useState(owner)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [successMessage, setSuccessMessage] = useState<string>('')

  const nationalities = [
    'Emirati', 'British', 'Canadian', 'French', 'German', 'Italian', 'Spanish',
    'Chinese', 'Japanese', 'Korean', 'Indian', 'Australian', 'Brazilian', 'Egyptian',
    'Saudi Arabian', 'Turkish', 'Greek', 'Russian', 'American', 'Other'
  ]

  const getCountryFlag = (nationality: string): string => {
    const flagMap: { [key: string]: string } = {
      'Emirati': '🇦🇪', 'British': '🇬🇧', 'Canadian': '🇨🇦', 'French': '🇫🇷', 'German': '🇩🇪',
      'Italian': '🇮🇹', 'Spanish': '🇪🇸', 'Chinese': '🇨🇳', 'Japanese': '🇯🇵', 'Korean': '🇰🇷',
      'Indian': '🇮🇳', 'Australian': '🇦🇺', 'Brazilian': '🇧🇷', 'Egyptian': '🇪🇬', 'Saudi Arabian': '🇸🇦',
      'Turkish': '🇹🇷', 'Greek': '🇬🇷', 'Russian': '🇷🇺', 'American': '🇺🇸', 'Other': '🏳️'
    }
    return flagMap[nationality] || '🏳️'
  }

  const getNationalityFromCountry = (country: string): string => {
    const countryToNationality: { [key: string]: string } = {
      'United Arab Emirates': 'Emirati', 'United Kingdom': 'British', 'Canada': 'Canadian',
      'France': 'French', 'Germany': 'German', 'Italy': 'Italian', 'Spain': 'Spanish',
      'China': 'Chinese', 'Japan': 'Japanese', 'South Korea': 'Korean', 'India': 'Indian',
      'Australia': 'Australian', 'Brazil': 'Brazilian', 'Egypt': 'Egyptian', 'Saudi Arabia': 'Saudi Arabian',
      'Turkey': 'Turkish', 'Greece': 'Greek', 'Russia': 'Russian', 'United States': 'American'
    }
    return countryToNationality[country] || 'Other'
  }

  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value }
    
    // Auto-update flag when nationality changes
    if (field === 'country') {
      const nationality = getNationalityFromCountry(value)
      newFormData.flag = getCountryFlag(nationality)
    }
    
    setFormData(newFormData)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare data for API
      const ownerData = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        nationality: formData.country, // Using country as nationality for now
        status: formData.status,
        // Additional fields would be stored in a separate table in a real implementation
      }

      // Check if we have an owner ID (existing user) or need to create new user
      if (!owner.id) {
        throw new Error('Owner ID is required for updating. Please contact administrator.')
      }

      // Make API call to update user
      const response = await fetch(`http://5.223.55.121:3001/api/users/${owner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(ownerData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update owner')
      }

      const result = await response.json()
      
      // Show success message
      setSuccessMessage('Owner updated successfully!')
      
      // Transform the API response back to the expected format
      const transformedOwner = {
        ...formData,
        name: `${result.data.firstName} ${result.data.lastName}`.trim(),
        email: result.data.email,
        phone: result.data.phone,
        status: result.data.isActive ? 'active' : 'inactive',
        lastUpdated: new Date().toISOString()
      }
      
      // Clear any previous errors
      setErrors({})
      
      // Call onSave after a short delay to show success message
      setTimeout(() => {
      onSave(transformedOwner)
      }, 1500)
    } catch (error) {
      console.error('Error updating owner:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Failed to update owner. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Success Message Display */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-600 text-sm">{successMessage}</p>
        </div>
      )}

      {/* General Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter owner's full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
          <div className="relative">
            <select
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.country ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select country</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Canada">Canada</option>
              <option value="France">France</option>
              <option value="Germany">Germany</option>
              <option value="Italy">Italy</option>
              <option value="Spain">Spain</option>
              <option value="China">China</option>
              <option value="Japan">Japan</option>
              <option value="South Korea">South Korea</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
              <option value="Brazil">Brazil</option>
              <option value="Egypt">Egypt</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Turkey">Turkey</option>
              <option value="Greece">Greece</option>
              <option value="Russia">Russia</option>
              <option value="United States">United States</option>
            </select>
            {formData.flag && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <span className="text-lg">{formData.flag}</span>
              </div>
            )}
          </div>
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="owner@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+44 123 456 789"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSubmitting || !!successMessage}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : successMessage ? (
            <span>Saved!</span>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </div>
  )
}

function IncomeEditModal({ incomeDistribution, onSave, onCancel }: IncomeEditModalProps) {
  const [formData, setFormData] = useState(incomeDistribution)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [successMessage, setSuccessMessage] = useState<string>('')

  const handleChange = (field: keyof IncomeDistribution, value: string) => {
    const numValue = parseFloat(value) || 0
    const newFormData = { ...formData, [field]: numValue }
    
    // Auto-calculate total if it's not the total field being changed
    if (field !== 'totalProfit') {
      newFormData.totalProfit = newFormData.ownerIncome + newFormData.roomyAgencyFee + newFormData.referringAgent
    }
    
    setFormData(newFormData)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (formData.ownerIncome < 0 || formData.ownerIncome > 100) {
      newErrors.ownerIncome = 'Owner income must be between 0% and 100%'
    }

    if (formData.roomyAgencyFee < 0 || formData.roomyAgencyFee > 100) {
      newErrors.roomyAgencyFee = 'Roomy Agency Fee must be between 0% and 100%'
    }

    if (formData.referringAgent < 0 || formData.referringAgent > 100) {
      newErrors.referringAgent = 'Referring Agent must be between 0% and 100%'
    }

    const total = formData.ownerIncome + formData.roomyAgencyFee + formData.referringAgent
    if (Math.abs(total - 100) > 0.01) {
      newErrors.total = 'Total must equal 100%'
    }

    if (formData.totalProfit < 0) {
      newErrors.totalProfit = 'Total profit must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would make an API call to save income distribution settings
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      setSuccessMessage('Income distribution updated successfully!')
      
      // Clear any previous errors
      setErrors({})
      
      // Call onSave after a short delay to show success message
      setTimeout(() => {
        onSave(formData)
      }, 1500)
    } catch (error) {
      console.error('Error updating income distribution:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Failed to update income distribution. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Success Message Display */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-600 text-sm">{successMessage}</p>
        </div>
      )}

      {/* General Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Owner Income (%) *</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.ownerIncome}
            onChange={(e) => handleChange('ownerIncome', e.target.value)}
            className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.ownerIncome ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter owner income percentage"
          />
          {errors.ownerIncome && <p className="mt-1 text-sm text-red-600">{errors.ownerIncome}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Roomy Agency Fee (%) *</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.roomyAgencyFee}
            onChange={(e) => handleChange('roomyAgencyFee', e.target.value)}
            className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.roomyAgencyFee ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter Roomy agency fee percentage"
          />
          {errors.roomyAgencyFee && <p className="mt-1 text-sm text-red-600">{errors.roomyAgencyFee}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Referring Agent (%) *</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.referringAgent}
            onChange={(e) => handleChange('referringAgent', e.target.value)}
            className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.referringAgent ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter referring agent percentage"
          />
          {errors.referringAgent && <p className="mt-1 text-sm text-red-600">{errors.referringAgent}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Profit ($) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.totalProfit}
            onChange={(e) => handleChange('totalProfit', e.target.value)}
            className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.totalProfit ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter total profit amount"
          />
          {errors.totalProfit && <p className="mt-1 text-sm text-red-600">{errors.totalProfit}</p>}
        </div>

        {/* Total Percentage Display */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Percentage:</span>
            <span className={`text-sm font-semibold ${
              Math.abs((formData.ownerIncome + formData.roomyAgencyFee + formData.referringAgent) - 100) < 0.01 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {(formData.ownerIncome + formData.roomyAgencyFee + formData.referringAgent).toFixed(1)}%
            </span>
          </div>
        </div>

        {errors.total && <p className="text-sm text-red-600">{errors.total}</p>}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSubmitting || !!successMessage}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : successMessage ? (
            <span>Saved!</span>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </div>
  )
}



function AddExpenseModal({ onSave, onCancel }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    unit: 'Apartment Burj Khalifa 2',
    category: '',
    contractor: '',
    amount: '',
    description: ''
  })
  
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Очищаємо помилки при зміні полів
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prevFiles => [...prevFiles, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    console.log('Form submitted with data:', formData)
    const newErrors: string[] = []
    
    // Валідація обов'язкових полів
    if (!formData.date) {
      newErrors.push('Date is required')
    }
    if (!formData.category) {
      newErrors.push('Category is required')
    }
    if (!formData.contractor) {
      newErrors.push('Contractor is required')
    }
    if (!formData.amount) {
      newErrors.push('Amount is required')
    } else if (isNaN(parseInt(formData.amount)) || parseInt(formData.amount) <= 0) {
      newErrors.push('Amount must be a positive number')
    }
    
    if (newErrors.length > 0) {
      console.log('Validation errors:', newErrors)
      setErrors(newErrors)
      return
    }
    
    // Якщо валідація пройшла успішно, зберігаємо
    const expenseData = {
        date: formData.date,
        unit: formData.unit,
        category: formData.category,
        contractor: formData.contractor,
        amount: parseInt(formData.amount),
        description: formData.description,
        files: files
    }
    
    console.log('Calling onSave with:', expenseData)
    onSave(expenseData)
  }

  return (
    <div>
      {/* Display errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-600">
            <strong>Please fix the following errors:</strong>
            <ul className="mt-1 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select category</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Repairs">Repairs</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contractor</label>
          <input
            type="text"
            value={formData.contractor}
            onChange={(e) => handleChange('contractor', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter contractor name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            placeholder="Enter expense description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Attach Files</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
          />
          
          {/* Display selected files */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">Selected files:</p>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          Add Expense
        </button>
      </div>
    </div>
  )
}

function AddDocumentModal({ onSave, onCancel }: AddDocumentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    uploadedBy: 'Admin',
    uploadedByEmail: 'admin@company.com'
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Очищаємо помилки при зміні полів
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // Очищаємо помилки при виборі файлу
      if (errors.length > 0) {
        setErrors([])
      }
    }
  }

  const handleSubmit = () => {
    console.log('Document form submitted with data:', formData, file)
    const newErrors: string[] = []
    
    // Валідація обов'язкових полів
    if (!formData.title) {
      newErrors.push('Document title is required')
    }
    if (!formData.type) {
      newErrors.push('Document type is required')
    }
    if (!file) {
      newErrors.push('Please select a file to upload')
    }
    
    if (newErrors.length > 0) {
      console.log('Validation errors:', newErrors)
      setErrors(newErrors)
      return
    }
    
    // Якщо валідація пройшла успішно, зберігаємо
    const documentData = {
      title: formData.title,
      type: formData.type,
      uploadedBy: formData.uploadedBy,
      uploadedByEmail: formData.uploadedByEmail,
      file: file
    }
    
    console.log('Calling onSave with:', documentData)
    onSave(documentData)
  }

  return (
    <div>
      {/* Display errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-600">
            <strong>Please fix the following errors:</strong>
            <ul className="mt-1 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter document title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select document type</option>
            <option value="Contract">Contract</option>
            <option value="Insurance">Insurance</option>
            <option value="Photos">Photos</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Legal">Legal</option>
            <option value="Financial">Financial</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded By</label>
          <input
            type="text"
            value={formData.uploadedBy}
            onChange={(e) => handleChange('uploadedBy', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter uploader name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Uploader Email</label>
          <input
            type="email"
            value={formData.uploadedByEmail}
            onChange={(e) => handleChange('uploadedByEmail', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter uploader email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.zip"
          />
          
          {/* Display selected file */}
          {file && (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          Upload Document
        </button>
      </div>
    </div>
  )
}

function EditAvailabilityModal({ settings, onSave, onCancel }: EditAvailabilityModalProps) {
  const [formData, setFormData] = useState({
    bookingWindow: settings.bookingWindow,
    advanceNotice: settings.advanceNotice,
    minStay: settings.minStay,
    maxStay: settings.maxStay
  })
  
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value })
    // Очищаємо помилки при зміні полів
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleSubmit = () => {
    console.log('Availability form submitted with data:', formData)
    const newErrors: string[] = []
    
    // Валідація
    if (formData.minStay < 1) {
      newErrors.push('Minimum stay must be at least 1 night')
    }
    if (formData.maxStay < formData.minStay) {
      newErrors.push('Maximum stay must be greater than minimum stay')
    }
    if (formData.maxStay > 365) {
      newErrors.push('Maximum stay cannot exceed 365 nights')
    }
    
    if (newErrors.length > 0) {
      console.log('Validation errors:', newErrors)
      setErrors(newErrors)
      return
    }
    
    // Якщо валідація пройшла успішно, зберігаємо
    console.log('Calling onSave with:', formData)
    onSave(formData)
  }

  return (
    <div>
      {/* Display errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-600">
            <strong>Please fix the following errors:</strong>
            <ul className="mt-1 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="mb-4 space-y-6">
        {/* Booking Window */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Booking Window</label>
          <select
            value={formData.bookingWindow}
            onChange={(e) => handleChange('bookingWindow', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all-days">All days available (Default)</option>
            <option value="fixed-days">Fixed days</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Advance Notice */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Advance Notice</label>
          <select
            value={formData.advanceNotice}
            onChange={(e) => handleChange('advanceNotice', e.target.value)}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="none">None (Default)</option>
            <option value="same-day">Same day (customize cutoff hours)</option>
            <option value="1-day">1 day&apos;s notice</option>
            <option value="2-days">2 day&apos;s notice</option>
            <option value="3-days">3 day&apos;s notice</option>
            <option value="7-days">7 day&apos;s notice</option>
          </select>
        </div>

        {/* Length of Stay */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stay</label>
            <input
              type="number"
              value={formData.minStay}
              onChange={(e) => handleChange('minStay', parseInt(e.target.value) || 1)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">nights</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Stay</label>
            <input
              type="number"
              value={formData.maxStay}
              onChange={(e) => handleChange('maxStay', parseInt(e.target.value) || 1)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
              max="365"
            />
            <p className="text-xs text-gray-500 mt-1">nights</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}


function AddPaymentModal({ onSave, onCancel }: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    checkIn: '',
    checkOut: '',
    totalAmount: '',
    status: 'completed',
    channel: 'Booking.com',
    method: 'Credit Card'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Обчислюємо кількість ночей
    const checkInDate = new Date(formData.checkIn)
    const checkOutDate = new Date(formData.checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const payment = {
      id: `payment_${Date.now()}`,
      guestName: formData.guestName,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: nights,
      totalAmount: parseFloat(formData.totalAmount),
      status: formData.status,
      channel: formData.channel,
      method: formData.method,
      date: new Date().toISOString().split('T')[0]
    }
    
    onSave(payment)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Payment</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => handleChange('guestName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleChange('checkIn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleChange('checkOut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (AED)</label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => handleChange('totalAmount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
              <select
                value={formData.channel}
                onChange={(e) => handleChange('channel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Booking.com">Booking.com</option>
                <option value="Airbnb">Airbnb</option>
                <option value="Direct">Direct</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={formData.method}
                onChange={(e) => handleChange('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </form>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          Add Payment
        </button>
      </div>
    </div>
  )
}

function AddUtilityModal({ onSave, onCancel }: AddUtilityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = () => {
    if (formData.title && formData.description) {
      onSave(formData)
    }
  }

  return (
    <div>
      <div className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Utility Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Electricity, Water, Internet"
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            placeholder="Enter utility description"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
        >
          Add Utility
        </button>
      </div>
    </div>
  )
}



interface PropertyDetailsProps {
  params: {
    id: string
  }
}

// Mock data for property details
const mockProperty = {
  id: 1,
  name: 'Apartment Burj Khalifa 2',
  type: 'Apartment',
  location: 'Downtown Dubai',
  address: '57QG+GF9 - Burj Khalifa Blvd',
  size: '53 m²',
  beds: '1 double bed • 1 single bed',
  checkIn: '15:00',
  checkOut: '12:00',
  description: 'Step into a realm of unparalleled luxury and comfort in this exquisite beachfront residence nestled in the heart of Dubai. This stunning property offers the epitome of modern living, boasting three generously-sized bedrooms along with maid\'s quarters for added convenience and opulence.',
  occupancyRate: 80,
  occupancyNights: 25,
  totalNights: 31,
  avgCostPerNight: 2680,
  monthlyPayout: 67000,
  pricePerNight: 460,
  owner: {
    id: 'cmg6ax5z2000yal7boyvbq8rd', // Real user ID from API
    name: 'John Doe',
    country: 'United Kingdom',
    flag: '🇬🇧',
    birthDate: '26.03.1988',
    age: 36,
    units: 3,
    email: 'testowner@roomy.com',
    phone: '+44 123 456 789',
    status: 'active'
  },
  amenities: ['Air conditioning', 'WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen', 'Washing machine', 'TV', 'Balcony', 'Security'],
  rules: ['No smoking', 'No pets', 'No parties', 'Quiet hours 22:00-08:00'],
  photos: [
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300'
  ],
  bedrooms: [
    {
      name: '2 bedrooms',
      photos: ['/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200']
    }
  ],
  bathrooms: [
    {
      name: 'Bathroom',
      photos: ['/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200', '/api/placeholder/300/200']
    }
  ],
  customFields: [
    { name: 'Custom field', value: 'Custom value' }
  ],
  financialData: {
    totalPayout: 75970,
    agencyFee: 1580,
    cleaning: 1580,
    ownersPayout: 67990,
    referralAgentsFee: 1580,
    vat: 1580,
    dtcm: 1580,
    maintenanceOwner: 1580,
    maintenanceRoomy: 1580,
    purchases: 1580
  },
  transactions: [
    {
      name: 'John Doe',
      date: '23/09/2024 10:24',
      channel: 'Airbnb',
      method: 'PayPal',
      id: '67VS97D',
      status: 'Confirmed',
      amount: 250
    },
    {
      name: 'John Doe',
      date: '23/09/2024 10:24',
      channel: 'Airbnb',
      method: 'PayPal',
      id: '67VS97D',
      status: 'Confirmed',
      amount: 250
    },
    {
      name: 'John Doe',
      date: '23/09/2024 10:24',
      channel: 'Airbnb',
      method: 'PayPal',
      id: '67VS97D',
      status: 'Confirmed',
      amount: 250
    }
  ]
}

export default function PropertyDetailsPage({ params }: PropertyDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [propertyNickname, setPropertyNickname] = useState('Apartment Burj Khalifa 2')
  const [propertyAddress, setPropertyAddress] = useState('Downtown Dubai, UAE')
  

  // Function to calculate days since intake date
  const calculateDaysSinceIntake = (intakeDate: string) => {
    const intake = new Date(intakeDate.split('.').reverse().join('-'))
    const today = new Date()
    const diffTime = today.getTime() - intake.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  const [dateRange, setDateRange] = useState('lastweek')
  const [dateFrom, setDateFrom] = useState('2024-09-01')
  const [dateTo, setDateTo] = useState('2024-09-30')

  // Income Distribution State
  const [incomeDistribution, setIncomeDistribution] = useState<IncomeDistribution>(() => {
    // Завантажуємо з localStorage або використовуємо значення за замовчуванням
    const savedIncome = localStorage.getItem('incomeDistribution')
    if (savedIncome) {
      try {
        return JSON.parse(savedIncome)
      } catch (error) {
        console.error('Error parsing saved income distribution:', error)
      }
    }
    
    // Значення за замовчуванням
    return {
      ownerIncome: 70,
      roomyAgencyFee: 25,
      referringAgent: 5,
      totalProfit: 12500
    }
  })

  // General Information State
  const [propertyGeneralInfo, setPropertyGeneralInfo] = useState<PropertyGeneralInfo>(() => {
    // Завантажуємо з localStorage або використовуємо значення за замовчуванням
    const savedInfo = localStorage.getItem('propertyGeneralInfo')
    if (savedInfo) {
      try {
        return JSON.parse(savedInfo)
      } catch (error) {
        console.error('Error parsing saved property info:', error)
      }
    }
    
    // Значення за замовчуванням
    return {
      name: 'Apartment in Downtown Dubai 1 bedroom',
      nickname: propertyNickname,
      status: 'Active',
      type: 'Apartment',
      location: 'Downtown Dubai',
      address: '57QG+GF9 - Burj Khalifa Blvd',
      size: '53 m²',
      beds: '1 double bed • 1 single bed',
      parkingSlots: '2',
      agencyFee: '18%',
      dtcmLicenseExpiry: '15.12.2024 (45 days left)',
      referringAgent: 'Ahmed Al Mansouri (12%)',
      checkIn: '15:00',
      checkOut: '12:00',
      unitIntakeDate: '15.03.2024 (558 days ago)'
    }
  })

  const handleDateRangeChange = async (range: string) => {
    setDateRange(range)
    
    if (range === 'custom') {
      // Keep current dates for custom selection
      return
    }
    
    try {
      // Використовуємо API сервіс для обчислення дат
      const { financialService } = await import('@/lib/api/services/financialService')
      const dateRange = financialService.calculateDateRange(range)
      
      setDateFrom(dateRange.from)
      setDateTo(dateRange.to)
      
      // Завантажуємо фінансові дані для нового періоду
      await loadFinancialData(dateRange)
      await loadPayments(dateRange)
    } catch (error) {
      console.error('Error changing date range:', error)
      
      // Fallback: локальне обчислення дат
    const today = new Date()
    let fromDate = new Date()
    let toDate = new Date()
    
    switch (range) {
      case 'lastweek':
        fromDate.setDate(today.getDate() - 7)
        break
      case 'lastmonth':
        fromDate.setMonth(today.getMonth() - 1)
        break
      case 'last3month':
        fromDate.setMonth(today.getMonth() - 3)
        break
      case 'last6month':
        fromDate.setMonth(today.getMonth() - 6)
        break
      case 'lastyear':
        fromDate.setFullYear(today.getFullYear() - 1)
        break
      default:
        fromDate.setDate(today.getDate() - 7)
    }
    
    setDateFrom(fromDate.toISOString().split('T')[0])
    setDateTo(toDate.toISOString().split('T')[0])
      
      // Завантажуємо дані з новими датами
      await loadFinancialData({ from: fromDate.toISOString().split('T')[0], to: toDate.toISOString().split('T')[0] })
      await loadPayments({ from: fromDate.toISOString().split('T')[0], to: toDate.toISOString().split('T')[0] })
    }
  }
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    type: string
    field: string
    currentValue: string
    title: string
    inputType: string
  }>({
    isOpen: false,
    type: '',
    field: '',
    currentValue: '',
    title: '',
    inputType: 'text'
  })

  const [amenities, setAmenities] = useState(() => {
    const savedAmenities = localStorage.getItem(`propertyAmenities_${params.id}`)
    if (savedAmenities) {
      try {
        return JSON.parse(savedAmenities)
      } catch (error) {
        console.error('Error parsing saved amenities:', error)
      }
    }
    return [
    'Air conditioning',
    'WiFi',
    'Pool',
    'Parking',
    'Kitchen',
    'TV',
    'Gym',
    'Balcony'
    ]
  })

  const [selectedAmenities, setSelectedAmenities] = useState(() => {
    const savedSelectedAmenities = localStorage.getItem(`propertySelectedAmenities_${params.id}`)
    if (savedSelectedAmenities) {
      try {
        return JSON.parse(savedSelectedAmenities)
      } catch (error) {
        console.error('Error parsing saved selected amenities:', error)
      }
    }
    return [
    'Air conditioning',
    'WiFi',
    'Pool',
    'Parking'
    ]
  })

  const [rules, setRules] = useState(() => {
    const savedRules = localStorage.getItem(`propertyRules_${params.id}`)
    if (savedRules) {
      try {
        return JSON.parse(savedRules)
      } catch (error) {
        console.error('Error parsing saved rules:', error)
      }
    }
    return [
    'No smoking',
    'No pets',
    'No parties',
    'Quiet hours'
    ]
  })

  const [selectedRules, setSelectedRules] = useState(() => {
    const savedSelectedRules = localStorage.getItem(`propertySelectedRules_${params.id}`)
    if (savedSelectedRules) {
      try {
        return JSON.parse(savedSelectedRules)
      } catch (error) {
        console.error('Error parsing saved selected rules:', error)
      }
    }
    return [
    'No smoking',
    'No pets',
    'No parties'
    ]
  })

  const [owner, setOwner] = useState(() => {
    // Завантажуємо з localStorage або використовуємо значення за замовчуванням
    const savedOwner = localStorage.getItem('ownerInfo')
    if (savedOwner) {
      try {
        return JSON.parse(savedOwner)
      } catch (error) {
        console.error('Error parsing saved owner info:', error)
      }
    }
    
    // Значення за замовчуванням
    return {
      id: 'cmg6ax5z2000yal7boyvbq8rd', // Real user ID from API
    name: 'John Doe',
    flag: '🇬🇧',
    country: 'United Kingdom',
      email: 'testowner@roomy.com',
    phone: '+44 123 456 789',
    status: 'active'
    }
  })

  const [expenses, setExpenses] = useState(() => {
    // Завантажуємо з localStorage або використовуємо порожній масив
    const savedExpenses = localStorage.getItem(`propertyExpenses_${params.id}`)
    if (savedExpenses) {
      try {
        return JSON.parse(savedExpenses)
      } catch (error) {
        console.error('Error parsing saved expenses:', error)
      }
    }
    return []
  })
  const [addExpenseModal, setAddExpenseModal] = useState(false)

  // Photos State - завжди використовуємо тестові зображення
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: 'demo_photo_1',
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      name: 'Living Room',
      size: 1024000,
      isCover: true,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'demo_photo_2',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      name: 'Bedroom',
      size: 980000,
      isCover: false,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'demo_photo_3',
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      name: 'Kitchen',
      size: 1100000,
      isCover: false,
      uploadedAt: new Date().toISOString()
    }
  ])
  const [deleteExpenseModal, setDeleteExpenseModal] = useState<{isOpen: boolean, index?: number, expense?: any}>({isOpen: false})
  const [addUtilityModal, setAddUtilityModal] = useState(false)
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [addBookingModal, setAddBookingModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Add Booking form state
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    checkIn: '',
    checkOut: '',
    totalAmount: '',
    channel: 'Direct',
    method: 'Credit Card'
  })

  // Financial Data State
  const [financialData, setFinancialData] = useState(() => {
    const saved = localStorage.getItem(`financialData_${params.id}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing saved financial data:', error)
      }
    }
    
    // Отримуємо Income Distribution для розрахунків
    const savedIncome = localStorage.getItem('incomeDistribution')
    let incomeDist = {
      ownerIncome: 70,
      roomyAgencyFee: 25,
      referringAgent: 5,
      totalProfit: 12500
    }
    
    if (savedIncome) {
      try {
        incomeDist = JSON.parse(savedIncome)
      } catch (error) {
        console.error('Error parsing saved income distribution:', error)
      }
    }
    
    // Початкові значення - все на нулі, поки не додамо резервації
    return {
      totalPayout: 0,
      agencyFee: 0,
      cleaning: 0,
      ownersPayout: 0,
      referralAgentsFee: 0,
      vat: 0,
      dtcm: 0,
      totalRevenue: 0,
      occupancyRate: 0,
      avgCostPerNight: 0
    }
  })

  // Payments State
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem(`payments_${params.id}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing saved payments:', error)
      }
    }
    return []
  })

  const [addPaymentModal, setAddPaymentModal] = useState(false)
  
  // Saved replies states
  const [savedRepliesModal, setSavedRepliesModal] = useState({
    isOpen: false,
    type: '', // 'single', 'multiple', 'folder'
    title: '',
    replyData: null
  })
  
  const [savedReplies, setSavedReplies] = useState<any[]>([])
  const [syncStatus, setSyncStatus] = useState({ success: true, message: 'Synced with Airbnb, Booking.com, and other channels' })
  
  // Automation states
  const [autoResponseModal, setAutoResponseModal] = useState({
    isOpen: false,
    type: '', // 'non-confirmed', 'confirmed'
    trigger: '', // 'first-message', 'subsequent', 'before-checkin', etc.
    title: '',
    content: ''
  })
  
  const [automationSettings, setAutomationSettings] = useState({
    autoResponse: {
    isActive: true,
    nonConfirmed: {
      firstMessage: '',
      subsequentMessage: ''
    },
    confirmed: {
      beforeCheckin: '',
      checkinDay: '',
      checkoutDay: '',
      duringStay: '',
      afterCheckout: ''
      }
    },
    autoReviews: {
      isActive: true,
      delay: 3,
      rating: 5,
      template: 'If no templates are set, we will use our own template.'
    }
  })

  // Mock calendar data for this specific property
  const mockCalendarData = {
    start_date: '2025-01-01',
    properties: [
      {
        id: parseInt(params.id),
        name: 'Apartment Burj Khalifa 2', // This will be the nickname from CRM
        units: [
          {
            id: parseInt(params.id),
            name: 'Apartment Burj Khalifa 2', // This will be the nickname from CRM
            reservations: [
              {
                id: 1,
                check_in: '2025-01-05',
                check_out: '2025-01-08',
                guest_name: 'John Smith',
                status: 'confirmed',
                source: 'Airbnb',
                color: '#3B82F6'
              },
              {
                id: 2,
                check_in: '2025-01-15',
                check_out: '2025-01-18',
                guest_name: 'Sarah Johnson',
                status: 'confirmed',
                source: 'Booking.com',
                color: '#10B981'
              },
              {
                id: 3,
                check_in: '2025-01-25',
                check_out: '2025-01-28',
                guest_name: 'Mike Davis',
                status: 'pending',
                source: 'Direct',
                color: '#F59E0B'
              }
            ],
            pricing: [
              { date: '2025-01-01', price: 350 },
              { date: '2025-01-02', price: 350 },
              { date: '2025-01-03', price: 380 },
              { date: '2025-01-04', price: 380 },
              { date: '2025-01-05', price: 420 },
              { date: '2025-01-06', price: 420 },
              { date: '2025-01-07', price: 420 },
              { date: '2025-01-08', price: 420 },
              { date: '2025-01-09', price: 380 },
              { date: '2025-01-10', price: 380 }
            ]
          }
        ]
      }
    ]
  }

  const handleCellClick = (date: string, unitId: number) => {
    console.log('Cell clicked:', { date, unitId })
    setIsReservationModalOpen(true)
  }

  const handleReservationClick = (reservation: any) => {
    console.log('Reservation clicked:', reservation)
    // Open reservation details modal
  }

  const handleReservationDragStart = (e: React.DragEvent, reservation: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(reservation))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleReservationDragEnd = (e: React.DragEvent) => {
    // Clean up any drag state
  }

  const handleCellDrop = (e: React.DragEvent, date: string, unitId: number) => {
    e.preventDefault()
    const reservationData = e.dataTransfer.getData('application/json')
    if (reservationData) {
      const reservation = JSON.parse(reservationData)
      console.log('Reservation dropped:', { reservation, date, unitId })
      // Handle reservation move logic here
    }
  }

  // Saved replies handlers
  const handleAddNewReply = () => {
    setSavedRepliesModal({
      isOpen: true,
      type: 'single',
      title: 'Add New Reply',
      replyData: null
    })
  }

  const handleReplyClick = (replyName: string) => {
    // Find the reply in savedReplies
    let replyData = null
    for (const category of savedReplies) {
      const reply = category.replies?.find((r: any) => r.name === replyName)
      if (reply) {
        replyData = reply
        break
      }
    }
    
    setSavedRepliesModal({
      isOpen: true,
      type: replyData?.category || 'multiple',
      title: `Edit ${replyName}`,
      replyData: replyData
    })
  }

  // Функції для роботи з saved replies
  const loadSavedReplies = useCallback(async () => {
    try {
      const { getSavedReplies } = await import('@/lib/api/services/savedRepliesService')
      const data = await getSavedReplies(params.id)
      setSavedReplies(data)
      
    } catch (error) {
      console.error('Error loading saved replies:', error)
    }
  }, [params.id])

  const handleSavedRepliesSave = async (data: any) => {
    try {
      const { updateSavedReply, addSavedReply } = await import('@/lib/api/services/savedRepliesService')
      
      if (savedRepliesModal.replyData) {
        // Update existing reply
        await updateSavedReply(params.id, (savedRepliesModal.replyData as any).id, data)
      } else {
        // Add new reply
        await addSavedReply(params.id, {
          name: data.name,
          content: data.content,
          category: savedRepliesModal.type as 'single' | 'multiple'
        })
      }
      
      // Reload saved replies
      await loadSavedReplies()
      
    setSavedRepliesModal({ isOpen: false, type: '', title: '', replyData: null })
      
    } catch (error) {
      console.error('Error saving reply:', error)
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    try {
      const { deleteSavedReply } = await import('@/lib/api/services/savedRepliesService')
      await deleteSavedReply(params.id, replyId)
      
      // Reload saved replies
      await loadSavedReplies()
      
    } catch (error) {
      console.error('Error deleting reply:', error)
    }
  }

  const handleSyncReplies = async () => {
    try {
      const { syncSavedReplies } = await import('@/lib/api/services/savedRepliesService')
      const result = await syncSavedReplies(params.id)
      setSyncStatus(result)
      
    } catch (error) {
      console.error('Error syncing replies:', error)
      setSyncStatus({ success: false, message: 'Failed to sync replies' })
    }
  }

  // Функції для роботи з automation
  const loadAutomationSettings = useCallback(async () => {
    try {
      const { getAutomationSettings } = await import('@/lib/api/services/automationService')
      const data = await getAutomationSettings(params.id)
      console.log('Loaded automation settings:', data)
      setAutomationSettings(data)
      
    } catch (error) {
      console.error('Error loading automation settings:', error)
    }
  }, [params.id])

  // Automation handlers
  const handleAutoResponseConfigure = (type: string, trigger: string) => {
    const titles = {
      'first-message': 'Configure First Message Response',
      'subsequent': 'Configure Subsequent Message Response',
      'before-checkin': 'Configure Before Check-in Response',
      'checkin-day': 'Configure Check-in Day Response',
      'checkout-day': 'Configure Check-out Day Response',
      'during-stay': 'Configure During Stay Response',
      'after-checkout': 'Configure After Check-out Response'
    }
    
    // Get current content based on type and trigger
    let content = ''
    if (type === 'nonConfirmed') {
      if (trigger === 'first-message') {
        content = automationSettings.autoResponse.nonConfirmed.firstMessage
      } else if (trigger === 'subsequent') {
        content = automationSettings.autoResponse.nonConfirmed.subsequentMessage
      }
    } else if (type === 'confirmed') {
      switch (trigger) {
        case 'before-checkin':
          content = automationSettings.autoResponse.confirmed.beforeCheckin
          break
        case 'checkin-day':
          content = automationSettings.autoResponse.confirmed.checkinDay
          break
        case 'checkout-day':
          content = automationSettings.autoResponse.confirmed.checkoutDay
          break
        case 'during-stay':
          content = automationSettings.autoResponse.confirmed.duringStay
          break
        case 'after-checkout':
          content = automationSettings.autoResponse.confirmed.afterCheckout
          break
      }
    }
    
    setAutoResponseModal({
      isOpen: true,
      type,
      trigger,
      title: titles[trigger as keyof typeof titles] || 'Configure Auto Response',
      content
    })
  }

  const handleAutoResponseSave = async (data: any) => {
    try {
      const { updateAutoResponseMessage } = await import('@/lib/api/services/automationService')
      await updateAutoResponseMessage(params.id, data.type, data.trigger, data.content)
      
      // Reload automation settings
      await loadAutomationSettings()
      
    setAutoResponseModal({ isOpen: false, type: '', trigger: '', title: '', content: '' })
      
    } catch (error) {
      console.error('Error saving auto response:', error)
    }
  }

  const handleAutoReviewsToggle = async () => {
    try {
      const { toggleAutoReviews } = await import('@/lib/api/services/automationService')
      const newStatus = !automationSettings.autoReviews.isActive
      await toggleAutoReviews(params.id, newStatus)
      
      // Reload automation settings
      await loadAutomationSettings()
      
    } catch (error) {
      console.error('Error toggling auto reviews:', error)
    }
  }

  const handleAutoReviewsDelayChange = async (delay: number) => {
    try {
      const { updateAutoReviewsSettings } = await import('@/lib/api/services/automationService')
      const updatedSettings = { ...automationSettings.autoReviews, delay }
      await updateAutoReviewsSettings(params.id, updatedSettings)
      
      // Reload automation settings
      await loadAutomationSettings()
      
    } catch (error) {
      console.error('Error updating auto reviews delay:', error)
    }
  }

  const handleAutoReviewsRatingChange = async (rating: number) => {
    try {
      const { updateAutoReviewsSettings } = await import('@/lib/api/services/automationService')
      const updatedSettings = { ...automationSettings.autoReviews, rating }
      await updateAutoReviewsSettings(params.id, updatedSettings)
      
      // Reload automation settings
      await loadAutomationSettings()
      
    } catch (error) {
      console.error('Error updating auto reviews rating:', error)
    }
  }

  const handleAutoReviewsTemplateChange = async (template: string) => {
    try {
      const { updateAutoReviewsSettings } = await import('@/lib/api/services/automationService')
      const updatedSettings = { ...automationSettings.autoReviews, template }
      await updateAutoReviewsSettings(params.id, updatedSettings)
      
      // Reload automation settings
      await loadAutomationSettings()
      
    } catch (error) {
      console.error('Error updating auto reviews template:', error)
    }
  }

  const handleAutoResponseToggle = async () => {
    try {
      const { toggleAutoResponse } = await import('@/lib/api/services/automationService')
      const newStatus = !automationSettings.autoResponse.isActive
      console.log('Toggling auto response to:', newStatus)
      await toggleAutoResponse(params.id, newStatus)
      
      // Reload automation settings
      await loadAutomationSettings()
      
    } catch (error) {
      console.error('Error toggling auto response:', error)
    }
  }

  const [utilities, setUtilities] = useState(() => {
    const savedUtilities = localStorage.getItem(`propertyUtilities_${params.id}`)
    if (savedUtilities) {
      try {
        return JSON.parse(savedUtilities)
      } catch (error) {
        console.error('Error parsing saved utilities:', error)
      }
    }
    return [
    { title: 'Electricity', description: 'Monthly electricity bill' },
    { title: 'Water', description: 'Monthly water bill' },
    { title: 'Internet', description: 'Monthly internet subscription' }
    ]
  })

  // Documents state
  const [documents, setDocuments] = useState(() => {
    // Завантажуємо з localStorage або використовуємо порожній масив
    const savedDocuments = localStorage.getItem(`propertyDocuments_${params.id}`)
    if (savedDocuments) {
      try {
        return JSON.parse(savedDocuments)
      } catch (error) {
        console.error('Error parsing saved documents:', error)
      }
    }
    return []
  })
  const [addDocumentModal, setAddDocumentModal] = useState(false)

  // Availability settings state
  const [availabilitySettings, setAvailabilitySettings] = useState(() => {
    // Завантажуємо з localStorage або використовуємо значення за замовчуванням
    const savedSettings = localStorage.getItem(`propertyAvailability_${params.id}`)
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings)
      } catch (error) {
        console.error('Error parsing saved availability settings:', error)
      }
    }
    return {
      bookingWindow: 'all-days',
      advanceNotice: 'none',
      minStay: 3,
      maxStay: 365
    }
  })
  const [editAvailabilityModal, setEditAvailabilityModal] = useState(false)

  // Marketing settings state
  const [marketingSettings, setMarketingSettings] = useState(() => {
    // Завантажуємо з localStorage або використовуємо значення за замовчуванням
    const savedSettings = localStorage.getItem(`propertyMarketing_${params.id}`)
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings)
      } catch (error) {
        console.error('Error parsing saved marketing settings:', error)
      }
    }
    return {
      title: 'Westwood l Next to Metro l Great Amenities',
      summary: 'Stay in this modern studio just steps from the metro! Perfect for travelers, it offers a comfy bed, smart TV, mini kitchenette, and a stylish bathroom. Big windows bring in plenty of natural light, making the space bright and inviting.\n\nWith easy access to transport, shopping, and dining, everything you need is right at your doorstep. Enjoy a hassle-free, comfortable stay in a prime location. Book now!',
      theSpace: 'Not defined',
      guestAccess: 'Not defined',
      neighborhood: 'Not defined',
      gettingAround: 'Not defined',
      otherNotes: 'Not defined',
      guestInteraction: 'Not defined'
    }
  })



  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'financial', label: 'Financial' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'documents', label: 'Documents' },
    { id: 'availability', label: 'Availability settings' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'saved-replies', label: 'Saved replies' },
    { id: 'automation', label: 'Automation' }
  ]

  const handleEditField = (type: string, field: string, currentValue: string, title: string, inputType: string = 'text') => {
    setEditModal({
      isOpen: true,
      type,
      field,
      currentValue,
      title,
      inputType
    })
  }

  const handleSaveEdit = async (newValue: string) => {
    try {
    console.log(`Saving ${editModal.field}: ${newValue}`)
    
    // Оновлюємо нікнейм якщо це поле nickname
    if (editModal.field === 'nickname') {
      setPropertyNickname(newValue)
        // Зберігаємо в localStorage
        localStorage.setItem('propertyNickname', newValue)
      }
      
      // Оновлюємо поля General Information
      if (editModal.type === 'general') {
        const updatedInfo = {
          ...propertyGeneralInfo,
          [editModal.field]: newValue
        }
        setPropertyGeneralInfo(updatedInfo)
        
        // Зберігаємо в localStorage
        localStorage.setItem('propertyGeneralInfo', JSON.stringify(updatedInfo))
        
        // Відправляємо на сервер (симуляція API виклику)
        try {
          // В реальному додатку тут буде API виклик
          // await propertyService.updateProperty(params.id, { [editModal.field]: newValue })
          console.log('Property updated on server:', { [editModal.field]: newValue })
        } catch (apiError) {
          console.error('Failed to update on server:', apiError)
          // Показуємо помилку користувачу, але зберігаємо локально
        }
      }
      
      // Оновлюємо поля Marketing
      if (editModal.type === 'marketing') {
        const updatedMarketing = {
          ...marketingSettings,
          [editModal.field]: newValue
        }
        setMarketingSettings(updatedMarketing)
        
        // Зберігаємо в localStorage
        localStorage.setItem(`propertyMarketing_${params.id}`, JSON.stringify(updatedMarketing))
        
        // Відправляємо на сервер (симуляція API виклику)
        try {
          // В реальному додатку тут буде API виклик
          // await marketingService.updateMarketing(params.id, { [editModal.field]: newValue })
          console.log('Marketing updated on server:', { [editModal.field]: newValue })
        } catch (apiError) {
          console.error('Failed to update marketing on server:', apiError)
          // Показуємо помилку користувачу, але зберігаємо локально
        }
    }
    
    setEditModal({ ...editModal, isOpen: false })
    } catch (error) {
      console.error('Error saving field:', error)
    setEditModal({ ...editModal, isOpen: false })
    }
  }

  const handleCloseEdit = () => {
    setEditModal({ ...editModal, isOpen: false })
  }

  const handleEditAmenities = () => {
    setEditModal({
      isOpen: true,
      type: 'amenities',
      field: 'amenities',
      currentValue: '',
      title: 'Amenities',
      inputType: 'checkbox'
    })
  }

  const handleSaveAmenities = async (newAmenities: string[]) => {
    try {
      // Використовуємо API сервіс для оновлення
      const { propertySettingsService } = await import('@/lib/api/services/propertySettingsService')
      await propertySettingsService.updateAmenities(params.id, amenities, newAmenities)
      
    setSelectedAmenities(newAmenities)
      
      // Зберігаємо локально
      propertySettingsService.saveToLocalStorage(params.id, {
        amenities,
        selectedAmenities: newAmenities
      })
      
      console.log('Amenities updated successfully:', newAmenities)
    } catch (error) {
      console.error('Error updating amenities:', error)
      
      // Fallback: локальне збереження
      setSelectedAmenities(newAmenities)
      localStorage.setItem(`propertySelectedAmenities_${params.id}`, JSON.stringify(newAmenities))
      localStorage.setItem(`propertyAmenities_${params.id}`, JSON.stringify(amenities))
    }
    
    setEditModal({ ...editModal, isOpen: false })
  }

  const handleEditRules = () => {
    setEditModal({
      isOpen: true,
      type: 'rules',
      field: 'rules',
      currentValue: '',
      title: 'Rules',
      inputType: 'checkbox'
    })
  }

  const handleSaveRules = async (newRules: string[]) => {
    try {
      // Використовуємо API сервіс для оновлення
      const { propertySettingsService } = await import('@/lib/api/services/propertySettingsService')
      await propertySettingsService.updateRules(params.id, rules, newRules)
      
    setSelectedRules(newRules)
      
      // Зберігаємо локально
      propertySettingsService.saveToLocalStorage(params.id, {
        rules,
        selectedRules: newRules
      })
      
      console.log('Rules updated successfully:', newRules)
    } catch (error) {
      console.error('Error updating rules:', error)
      
      // Fallback: локальне збереження
      setSelectedRules(newRules)
      localStorage.setItem(`propertySelectedRules_${params.id}`, JSON.stringify(newRules))
      localStorage.setItem(`propertyRules_${params.id}`, JSON.stringify(rules))
    }
    
    setEditModal({ ...editModal, isOpen: false })
  }

  const handleEditOwner = () => {
    setEditModal({
      isOpen: true,
      type: 'owner',
      field: 'owner',
      currentValue: '',
      title: 'Owner',
      inputType: 'form'
    })
  }

  const handleSaveOwner = async (newOwner: any) => {
    try {
      // Оновлюємо стан
      setOwner(newOwner)
      
      // Зберігаємо в localStorage
      localStorage.setItem('ownerInfo', JSON.stringify(newOwner))
      
      // Відправляємо на сервер (симуляція API виклику)
      try {
        // В реальному додатку тут буде API виклик
        // await userService.updateUser(newOwner.id, newOwner)
        console.log('Owner updated on server:', newOwner)
      } catch (apiError) {
        console.error('Failed to update owner on server:', apiError)
        // Показуємо помилку користувачу, але зберігаємо локально
      }
      
      setEditModal({ ...editModal, isOpen: false })
      
      // Show success message (you could add a toast notification here)
      console.log('Owner updated successfully:', newOwner)
    } catch (error) {
      console.error('Error updating owner:', error)
      // Handle error (show error message, etc.)
    }
  }

  const handleEditIncomeDistribution = () => {
    setEditModal({
      isOpen: true,
      type: 'income',
      field: 'income',
      currentValue: '',
      title: 'Income Distribution',
      inputType: 'form'
    })
  }

  const handleSaveIncomeDistribution = async (newIncome: IncomeDistribution) => {
    try {
      // Оновлюємо стан
      setIncomeDistribution(newIncome)
      
      // Зберігаємо в localStorage
      localStorage.setItem('incomeDistribution', JSON.stringify(newIncome))
      
      // Оновлюємо фінансові дані на основі нових відсотків
      const updatedFinancialData = {
        ...financialData,
        ownersPayout: (financialData.totalRevenue * newIncome.ownerIncome) / 100,
        agencyFee: (financialData.totalRevenue * newIncome.roomyAgencyFee) / 100,
        referralAgentsFee: (financialData.totalRevenue * newIncome.referringAgent) / 100
      }
      setFinancialData(updatedFinancialData)
      
      // Зберігаємо оновлені фінансові дані
      localStorage.setItem(`financialData_${params.id}`, JSON.stringify(updatedFinancialData))
      
      // Відправляємо на сервер (симуляція API виклику)
      try {
        // В реальному додатку тут буде API виклик
        // await incomeService.updateIncomeSettings(params.id, newIncome)
        console.log('Income distribution updated on server:', newIncome)
      } catch (apiError) {
        console.error('Failed to update income distribution on server:', apiError)
        // Показуємо помилку користувачу, але зберігаємо локально
      }
      
      setEditModal({ ...editModal, isOpen: false })
      
      // Show success message (you could add a toast notification here)
      console.log('Income distribution updated successfully:', newIncome)
    } catch (error) {
      console.error('Error updating income distribution:', error)
      // Handle error (show error message, etc.)
    }
  }




  const handleAddExpense = () => {
    setAddExpenseModal(true)
  }

  // Функції для роботи з документами
  const handleAddDocument = () => {
    setAddDocumentModal(true)
  }

  const handleSaveDocument = async (documentData: any) => {
    try {
      console.log('Saving document:', documentData)
      
      // Використовуємо API сервіс для завантаження
      const { documentService } = await import('@/lib/api/services/documentService')
      
      const newDocument = await documentService.uploadDocument(params.id, documentData.file, {
        title: documentData.title,
        type: documentData.type,
        uploadedBy: documentData.uploadedBy,
        uploadedByEmail: documentData.uploadedByEmail
      })
      
      const updatedDocuments = [...documents, newDocument]
      setDocuments(updatedDocuments)
      
      // Зберігаємо в localStorage
      documentService.saveToLocalStorage(params.id, updatedDocuments)
      
      setAddDocumentModal(false)
      console.log('Document saved successfully, total documents:', updatedDocuments.length)
    } catch (error) {
      console.error('Error saving document:', error)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      console.log('Deleting document:', documentId)
      
      // Використовуємо API сервіс для видалення
      const { documentService } = await import('@/lib/api/services/documentService')
      
      await documentService.deleteDocument(params.id, documentId)
      
      const updatedDocuments = documents.filter((doc: any) => doc.id !== documentId)
      setDocuments(updatedDocuments)
      
      // Зберігаємо в localStorage
      documentService.saveToLocalStorage(params.id, updatedDocuments)
      
      console.log('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleDownloadDocument = async (documentId: string) => {
    try {
      console.log('Downloading document:', documentId)
      
      // Використовуємо API сервіс для завантаження
      const { documentService } = await import('@/lib/api/services/documentService')
      
      await documentService.downloadDocument(params.id, documentId)
      
      console.log('Document download initiated')
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  // Функції для роботи з availability settings
  const handleEditAvailability = () => {
    setEditAvailabilityModal(true)
  }

  const handleSaveAvailability = async (newSettings: any) => {
    try {
      console.log('Saving availability settings:', newSettings)
      
      // Оновлюємо стан
      setAvailabilitySettings(newSettings)
      
      // Зберігаємо в localStorage
      localStorage.setItem(`propertyAvailability_${params.id}`, JSON.stringify(newSettings))
      
      // В реальному додатку тут буде API виклик
      // await availabilityService.updateSettings(params.id, newSettings)
      
      setEditAvailabilityModal(false)
      console.log('Availability settings saved successfully')
    } catch (error) {
      console.error('Error saving availability settings:', error)
    }
  }


  // Функції для роботи з фото
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    try {
      // Використовуємо API сервіс для завантаження
      const { photoService } = await import('@/lib/api/services/photoService')
      const result = await photoService.uploadPhotos(params.id, Array.from(files))
      
      if (result.success) {
        const updatedPhotos = [...photos, ...result.photos]
        setPhotos(updatedPhotos)
        
        // Зберігаємо локально
        photoService.savePhotosLocally(params.id, updatedPhotos)
        
        console.log('Photos uploaded successfully:', result.photos)
      }
    } catch (error) {
      console.error('Error uploading photos:', error)
      
      // Fallback: локальне збереження
      const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
        id: `photo_${Date.now()}_${index}`,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isCover: photos.length === 0 && index === 0,
        uploadedAt: new Date().toISOString()
      }))

      const updatedPhotos = [...photos, ...newPhotos]
      setPhotos(updatedPhotos)
      localStorage.setItem('propertyPhotos', JSON.stringify(updatedPhotos))
    }
  }

  const handleSetCoverPhoto = async (photoId: string) => {
    try {
      const { photoService } = await import('@/lib/api/services/photoService')
      const updatedPhotos = await photoService.setCoverPhoto(params.id, photoId)
      setPhotos(updatedPhotos)
      photoService.savePhotosLocally(params.id, updatedPhotos)
    } catch (error) {
      console.error('Error setting cover photo:', error)
      
      // Fallback: локальне оновлення
      const updatedPhotos = photos.map(photo => ({
        ...photo,
        isCover: photo.id === photoId
      }))
      
      setPhotos(updatedPhotos)
      localStorage.setItem('propertyPhotos', JSON.stringify(updatedPhotos))
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const { photoService } = await import('@/lib/api/services/photoService')
      const updatedPhotos = await photoService.deletePhoto(params.id, photoId)
      setPhotos(updatedPhotos)
      photoService.savePhotosLocally(params.id, updatedPhotos)
    } catch (error) {
      console.error('Error deleting photo:', error)
      
      // Fallback: локальне видалення
      const updatedPhotos = photos.filter(photo => photo.id !== photoId)
      
      // Якщо видаляємо обкладинку, встановлюємо нову
      const deletedPhoto = photos.find(photo => photo.id === photoId)
      if (deletedPhoto?.isCover && updatedPhotos.length > 0) {
        updatedPhotos[0].isCover = true
      }
      
      setPhotos(updatedPhotos)
      localStorage.setItem('propertyPhotos', JSON.stringify(updatedPhotos))
    }
  }

  const handleSaveExpense = (newExpense: any) => {
    console.log('Saving expense:', newExpense)
    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    // Зберігаємо в localStorage
    localStorage.setItem(`propertyExpenses_${params.id}`, JSON.stringify(updatedExpenses))
    setAddExpenseModal(false)
    console.log('Expense saved successfully, total expenses:', updatedExpenses.length)
  }

  const handleDeleteExpense = (index: number) => {
    const updatedExpenses = expenses.filter((_: any, i: number) => i !== index)
    setExpenses(updatedExpenses)
    // Зберігаємо в localStorage
    localStorage.setItem(`propertyExpenses_${params.id}`, JSON.stringify(updatedExpenses))
    setDeleteExpenseModal({isOpen: false})
  }

  const handleConfirmDeleteExpense = () => {
    if (deleteExpenseModal.index !== undefined) {
      handleDeleteExpense(deleteExpenseModal.index)
    }
  }

  const handleAddUtility = () => {
    setAddUtilityModal(true)
  }

  const handleSaveUtility = async (newUtility: { title: string; description: string }) => {
    try {
      // Використовуємо API сервіс для додавання
      const { propertySettingsService } = await import('@/lib/api/services/propertySettingsService')
      await propertySettingsService.addUtility(params.id, newUtility)
      
      const updatedUtilities = [...utilities, newUtility]
      setUtilities(updatedUtilities)
      
      // Зберігаємо локально
      propertySettingsService.saveToLocalStorage(params.id, {
        utilities: updatedUtilities
      })
      
      console.log('Utility added successfully:', newUtility)
    } catch (error) {
      console.error('Error adding utility:', error)
      
      // Fallback: локальне збереження
      const updatedUtilities = [...utilities, newUtility]
      setUtilities(updatedUtilities)
      localStorage.setItem(`propertyUtilities_${params.id}`, JSON.stringify(updatedUtilities))
    }
    
    setAddUtilityModal(false)
  }



  const handleUpdateUtility = async (index: number, field: 'title' | 'description', value: string) => {
    try {
    const updatedUtilities = [...utilities]
    updatedUtilities[index] = { ...updatedUtilities[index], [field]: value }
      
      // Використовуємо API сервіс для оновлення
      const { propertySettingsService } = await import('@/lib/api/services/propertySettingsService')
      await propertySettingsService.updateUtilities(params.id, updatedUtilities)
      
    setUtilities(updatedUtilities)
      
      // Зберігаємо локально
      propertySettingsService.saveToLocalStorage(params.id, {
        utilities: updatedUtilities
      })
      
      console.log('Utility updated successfully:', updatedUtilities[index])
    } catch (error) {
      console.error('Error updating utility:', error)
      
      // Fallback: локальне оновлення
      const updatedUtilities = [...utilities]
      updatedUtilities[index] = { ...updatedUtilities[index], [field]: value }
      setUtilities(updatedUtilities)
      localStorage.setItem(`propertyUtilities_${params.id}`, JSON.stringify(updatedUtilities))
    }
  }

  const handleDeleteUtility = async (index: number) => {
    try {
      // Використовуємо API сервіс для видалення
      const { propertySettingsService } = await import('@/lib/api/services/propertySettingsService')
      await propertySettingsService.deleteUtility(params.id, index)
      
      const updatedUtilities = utilities.filter((_: any, i: number) => i !== index)
      setUtilities(updatedUtilities)
      
      // Зберігаємо локально
      propertySettingsService.saveToLocalStorage(params.id, {
        utilities: updatedUtilities
      })
      
      console.log('Utility deleted successfully:', index)
    } catch (error) {
      console.error('Error deleting utility:', error)
      
      // Fallback: локальне видалення
      const updatedUtilities = utilities.filter((_: any, i: number) => i !== index)
      setUtilities(updatedUtilities)
      localStorage.setItem(`propertyUtilities_${params.id}`, JSON.stringify(updatedUtilities))
    }
  }

  // Функції для роботи з фінансовими даними
  const loadFinancialData = useCallback(async (dateRange?: { from: string; to: string }) => {
    try {
      const { financialService } = await import('@/lib/api/services/financialService')
      const data = await financialService.getFinancialData(params.id, dateRange)
      setFinancialData(data)
      
      // Зберігаємо локально
      financialService.saveToLocalStorage(params.id, data)
    } catch (error) {
      console.error('Error loading financial data:', error)
    }
  }, [params.id])

  const loadPayments = useCallback(async (dateRange?: { from: string; to: string }) => {
    try {
      const { financialService } = await import('@/lib/api/services/financialService')
      const data = await financialService.getPayments(params.id, dateRange)
      setPayments(data)
      
      // Зберігаємо локально
      financialService.savePaymentsToLocalStorage(params.id, data)
    } catch (error) {
      console.error('Error loading payments:', error)
    }
  }, [params.id])

  const handleAddPayment = () => {
    setAddPaymentModal(true)
  }

  const handleSavePayment = async (newPayment: any) => {
    try {
      // Використовуємо API сервіс для додавання
      const { financialService } = await import('@/lib/api/services/financialService')
      await financialService.addPayment(params.id, newPayment)
      
      const updatedPayments = [...payments, newPayment]
      setPayments(updatedPayments)
      
      // Зберігаємо локально
      financialService.savePaymentsToLocalStorage(params.id, updatedPayments)
      
      // Оновлюємо financial data на основі нових платежів
      await loadFinancialData()
      
      console.log('Payment added successfully:', newPayment)
    } catch (error) {
      console.error('Error adding payment:', error)
      
      // Fallback: локальне збереження
      const updatedPayments = [...payments, newPayment]
      setPayments(updatedPayments)
      localStorage.setItem(`payments_${params.id}`, JSON.stringify(updatedPayments))
      
      // Оновлюємо financial data
      await loadFinancialData()
    }
    
    setAddPaymentModal(false)
  }

  const handleCustomDateChange = async () => {
    if (dateFrom && dateTo) {
      const dateRange = { from: dateFrom, to: dateTo }
      await loadFinancialData(dateRange)
      await loadPayments(dateRange)
    }
  }

  // Handle Add Booking
  const handleAddBooking = () => {
    setAddBookingModal(true)
    // Reset form
    setBookingForm({
      guestName: '',
      checkIn: '',
      checkOut: '',
      totalAmount: '',
      channel: 'Direct',
      method: 'Credit Card'
    })
  }

  const handleSaveBooking = async () => {
    if (!bookingForm.guestName || !bookingForm.checkIn || !bookingForm.checkOut || !bookingForm.totalAmount) {
      alert('Please fill in all required fields')
      return
    }

    // Calculate nights
    const checkInDate = new Date(bookingForm.checkIn)
    const checkOutDate = new Date(bookingForm.checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    // Create new payment/booking
    const newBooking = {
      guestName: bookingForm.guestName,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      nights: nights,
      totalAmount: parseFloat(bookingForm.totalAmount),
      status: 'completed' as const,
      channel: bookingForm.channel,
      method: bookingForm.method,
      date: bookingForm.checkIn
    }

    try {
      // Use the same function as Add Payment
      await handleSavePayment(newBooking)
      setAddBookingModal(false)
      console.log('Booking added successfully:', newBooking)
    } catch (error) {
      console.error('Error adding booking:', error)
      alert('Error adding booking. Please try again.')
    }
  }


  // Очищуємо тестові дані при завантаженні
  useEffect(() => {
    // Очищуємо тестові дані
    localStorage.removeItem(`payments_${params.id}`)
    localStorage.removeItem(`financialData_${params.id}`)
    localStorage.removeItem(`propertyPhotos_${params.id}`)
    localStorage.removeItem('propertyPhotos') // також очищуємо загальний ключ
    console.log('Test data cleared on component load')
  }, [params.id])

  // Завантажуємо фінансові дані при завантаженні компонента
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadFinancialData()
        await loadPayments()
        await loadSavedReplies()
        await loadAutomationSettings()
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }
    
    loadInitialData()
  }, [loadFinancialData, loadPayments, loadSavedReplies, loadAutomationSettings])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Sticky Header */}
      <div className="sticky top-[3.3rem] z-10 bg-white border border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl font-medium text-slate-900">Apartment Burj Khalifa 2</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg">
              <span className="text-lg">🏷️</span>
              <span className="text-sm font-medium text-orange-700">AED 460/night</span>
            </div>
            <button 
              onClick={handleAddBooking}
              className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
            >
              Add booking
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-2 sm:px-3 lg:px-4 pt-[4rem]">
        {/* Two Column Layout */}
        <div className="flex gap-4">
          {/* Left Sidebar - Property Info & Tabs */}
          <div className="w-80 flex-shrink-0">
            {/* Property Photo */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-3 relative">
                <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Main Photo
                </span>
          </div>
          
              {/* Property Name and Address */}
              <div>
                  <h3 className="text-lg font-medium text-slate-900">{propertyNickname}</h3>
                  <p className="text-sm text-slate-500">{propertyAddress}</p>
            </div>
          </div>
          

        {/* Platform Containers */}
            <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            'AirBnb',
            'Booking', 
            'Property Finder',
            'Dubizzle',
            'Bayut'
          ].map((platform, index) => (
                <div key={index} className="bg-white p-2 rounded-xl border border-gray-200 min-h-[50px] flex items-center justify-center">
              <div className="text-center">
                    <p className="text-xs text-slate-600 font-medium leading-tight">{platform}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Property Details</h3>
                <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === tab.id
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200">

          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Owner Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Owner</h2>
                    <button 
                      onClick={handleEditOwner}
                      className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
                    >
                      <Edit size={14} />
                      <span>Change</span>
                    </button>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-orange-600">{owner.name.charAt(0)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{owner.name}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{owner.flag}</span>
                              <span className="text-sm font-medium text-gray-900">{owner.country}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{owner.email}</span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{owner.phone}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              owner.status === 'active' ? 'bg-green-500' : 
                              owner.status === 'vip' ? 'bg-purple-500' : 'bg-gray-400'
                            }`}></div>
                            <span className={`text-sm font-medium capitalize ${
                              owner.status === 'active' ? 'text-green-600' : 
                              owner.status === 'vip' ? 'text-purple-600' : 'text-gray-600'
                            }`}>
                              {owner.status === 'vip' ? 'VIP Owner' : owner.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <User size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Property Owner</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Income Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Income Distribution</h2>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={handleEditIncomeDistribution}
                        className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer flex items-center space-x-2"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {[
                        { label: 'Owner income', value: `${incomeDistribution.ownerIncome}%`, key: 'ownerIncome' },
                        { label: 'Roomy Agency Fee', value: `${incomeDistribution.roomyAgencyFee}%`, key: 'roomyAgencyFee' },
                        { label: 'Referring agent', value: `${incomeDistribution.referringAgent}%`, key: 'referringAgent' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-900">{item.value}</span>
                      </div>
                    </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Profit Formula</h4>
                        <p className="text-sm text-gray-600">{incomeDistribution.ownerIncome}% Owner / {100 - incomeDistribution.ownerIncome}% Company</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Total Profit</h4>
                        <p className="text-lg font-medium text-gray-900">${incomeDistribution.totalProfit.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Owner Payout</h4>
                        <p className="text-lg font-medium text-green-600">${((incomeDistribution.totalProfit * incomeDistribution.ownerIncome) / 100).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Company Revenue</h4>
                        <p className="text-lg font-medium text-orange-600">${((incomeDistribution.totalProfit * (incomeDistribution.roomyAgencyFee + incomeDistribution.referringAgent)) / 100).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">General information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {[
                        { label: 'Name', value: propertyGeneralInfo.name, key: 'name' },
                        { label: 'Nickname', value: propertyGeneralInfo.nickname, key: 'nickname' },
                        { label: 'Status', value: propertyGeneralInfo.status, key: 'status' },
                        { label: 'Type', value: propertyGeneralInfo.type, key: 'type' },
                        { label: 'Location', value: propertyGeneralInfo.location, key: 'location' },
                        { label: 'Address', value: propertyGeneralInfo.address, key: 'address' },
                        { label: 'Size', value: propertyGeneralInfo.size, key: 'size' },
                        { label: 'Beds', value: propertyGeneralInfo.beds, key: 'beds' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-900">{item.value}</span>
                            <button 
                              onClick={() => {
                                let inputType = 'text'
                                if (item.key === 'status' || item.key === 'type') {
                                  inputType = 'select'
                                } else if (item.key === 'parkingSlots') {
                                  inputType = 'number'
                                }
                                handleEditField('general', item.key, item.value, item.label, inputType)
                              }}
                              className="text-orange-600 hover:text-orange-700 cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Parking Slot', value: propertyGeneralInfo.parkingSlots, key: 'parkingSlots' },
                        { label: 'Agency Fee', value: propertyGeneralInfo.agencyFee, key: 'agencyFee' },
                        { label: 'DTCM license expiry', value: propertyGeneralInfo.dtcmLicenseExpiry, key: 'dtcmLicenseExpiry' },
                        { label: 'Referring agent', value: propertyGeneralInfo.referringAgent, key: 'referringAgent' },
                        { label: 'Check-in from', value: propertyGeneralInfo.checkIn, key: 'checkIn' },
                        { label: 'Check-out to', value: propertyGeneralInfo.checkOut, key: 'checkOut' },
                        { label: 'Unit intake date', value: propertyGeneralInfo.unitIntakeDate, key: 'unitIntakeDate' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-900">{item.value}</span>
                            <button 
                              onClick={() => {
                                let inputType = 'text'
                                if (item.key === 'status' || item.key === 'type') {
                                  inputType = 'select'
                                } else if (item.key === 'parkingSlots') {
                                  inputType = 'number'
                                }
                                handleEditField('general', item.key, item.value, item.label, inputType)
                              }}
                              className="text-orange-600 hover:text-orange-700 cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Description</h2>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">Step into a realm of unparalleled luxury and comfort in this exquisite beachfront residence nestled in the heart of Dubai. This stunning property offers the epitome of modern living, boasting three generously-sized bedrooms along with maid&apos;s quarters for added convenience and opulence.</p>
                    </div>
                    <button 
                      onClick={() => handleEditField('description', 'textarea', 'Step into a realm of unparalleled luxury and comfort in this exquisite beachfront residence nestled in the heart of Dubai. This stunning property offers the epitome of modern living, boasting three generously-sized bedrooms along with maid&apos;s quarters for added convenience and opulence.', 'Description')}
                      className="text-orange-600 hover:text-orange-700 cursor-pointer"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>



                {/* Photos */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
                    {photos.length > 0 && (
                      <button
                        onClick={() => {
                          setPhotos([])
                          localStorage.removeItem(`propertyPhotos_${params.id}`)
                          localStorage.removeItem('propertyPhotos')
                        }}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        Clear Photos
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div key={photo.id} className={`aspect-[4/3] rounded-lg relative group ${
                        photo.isCover ? 'ring-2 ring-orange-500' : ''
                      }`}>
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Image failed to load:', photo.url)
                            // Show a nice placeholder instead of broken image
                            e.currentTarget.style.display = 'none'
                            const placeholder = document.createElement('div')
                            placeholder.className = 'w-full h-full bg-gray-100 flex items-center justify-center rounded-lg'
                            placeholder.innerHTML = `
                              <div class="text-center text-gray-500">
                                <svg class="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-sm">${photo.name}</p>
                              </div>
                            `
                            e.currentTarget.parentNode?.appendChild(placeholder)
                          }}
                        />
                        {photo.isCover && (
                          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                              Cover
                            </span>
                          )}
                        
                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            {!photo.isCover && (
                              <button
                                onClick={() => handleSetCoverPhoto(photo.id)}
                                className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                                title="Set as cover"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                              title="Delete photo"
                            >
                              Delete
                            </button>
                          </div>
                          </div>
                        </div>
                      ))}
                    
                    {/* Upload button */}
                    <div className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        <Plus size={28} className="text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Add Photos</span>
                      </div>
                  </div>
                  </div>
                  
                  {photos.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-gray-500 mb-2">No photos uploaded yet</p>
                      <p className="text-sm text-gray-400">Click the + button above to add photos</p>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    {selectedAmenities.map((amenity: string, index: number) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleEditAmenities}
                    className="text-orange-600 hover:text-orange-700 text-sm cursor-pointer"
                  >
                    <Edit size={14} className="inline mr-1" />
                    Edit list
                  </button>
                </div>



                {/* Rules */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Rules</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    {selectedRules.map((rule: string, index: number) => (
                      <div key={index} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                        <span className="text-sm text-gray-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleEditRules}
                    className="text-orange-600 hover:text-orange-700 text-sm cursor-pointer"
                  >
                    <Edit size={14} className="inline mr-1" />
                    Edit list
                  </button>
                </div>

                {/* Utilities */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Utilities</h2>
                    <button 
                      onClick={handleAddUtility}
                      className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      <Plus size={14} className="inline mr-1" />
                      Add new
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {utilities.map((utility: { title: string; description: string }, index: number) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-orange-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-900">{utility.title}</h3>
                        <button
                          onClick={() => handleDeleteUtility(index)}
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{utility.description}</p>
                        <div className="flex space-x-2">
                          <button className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            Edit
                          </button>
                          <button className="flex-1 px-3 py-2 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-4">
                {/* Date filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
                  <div className="flex space-x-2">
                    {['Custom', 'Last year', 'Last 6 month', 'Last 3 month', 'Last month', 'Last week'].map((range) => (
                      <button
                        key={range}
                          onClick={() => handleDateRangeChange(range.toLowerCase().replace(' ', ''))}
                          className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                          dateRange === range.toLowerCase().replace(' ', '')
                              ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                  {/* Date pickers - only show when Custom is selected */}
                  {dateRange === 'custom' ? (
                    <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCustomDateChange}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Selected period:</span> {new Date(dateFrom).toLocaleDateString()} - {new Date(dateTo).toLocaleDateString()}
                      </div>
                  )}
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Total Revenue:</span>
                      </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">AED {financialData.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Owner Payout ({incomeDistribution.ownerIncome}%):</span>
                      </div>
                      <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-green-600">AED {((financialData.totalRevenue * incomeDistribution.ownerIncome) / 100).toLocaleString()}</span>
                      </div>
                    </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Roomy Agency Fee ({incomeDistribution.roomyAgencyFee}%):</span>
                      </div>
                      <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-orange-600">AED {((financialData.totalRevenue * incomeDistribution.roomyAgencyFee) / 100).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Referring Agent ({incomeDistribution.referringAgent}%):</span>
                      </div>
                      <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-blue-600">AED {((financialData.totalRevenue * incomeDistribution.referringAgent) / 100).toLocaleString()}</span>
                      </div>
                        </div>
                      </div>
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Revenue Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Owner</span>
                            <span className="text-xs text-gray-600">{incomeDistribution.ownerIncome}%</span>
                        </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${incomeDistribution.ownerIncome}%` }}></div>
                      </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Roomy Agency</span>
                            <span className="text-xs text-gray-600">{incomeDistribution.roomyAgencyFee}%</span>
                    </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${incomeDistribution.roomyAgencyFee}%` }}></div>
                  </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Referring Agent</span>
                            <span className="text-xs text-gray-600">{incomeDistribution.referringAgent}%</span>
                    </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${incomeDistribution.referringAgent}%` }}></div>
                  </div>
                      </div>
                        </div>
                      </div>
                  </div>
                </div>

                {/* Expenses Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Expenses Breakdown</h2>
                  
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* No expenses data */}
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <div className="text-sm text-gray-400 mb-2">No expenses recorded</div>
                                <div className="text-xs text-gray-400">Expenses will appear here when added</div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      </div>
                  </div>
                </div>

                {/* Last transactions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Last transactions</h2>
                    <button 
                      onClick={handleAddPayment}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>New payment</span>
                    </button>
                  </div>
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Channel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.length > 0 ? (
                            payments.map((payment: any) => (
                              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.guestName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.channel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.method}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    payment.status === 'completed' 
                                      ? 'bg-green-100 text-green-800'
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                  +{payment.totalAmount} AED
                                </td>
                            </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                <div className="flex flex-col items-center">
                                  <div className="text-sm text-gray-400 mb-2">No transactions recorded</div>
                                  <div className="text-xs text-gray-400">Add a new payment to see transactions here</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    </div>
                  </div>

                {/* Reservations Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Reservations</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date In / Out
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nights
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Paid
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.length > 0 ? (
                          payments.map((payment: any) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payment.guestName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.checkIn} / {payment.checkOut}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  payment.channel === 'Airbnb' 
                                  ? 'bg-pink-100 text-pink-800'
                                    : payment.channel === 'Booking.com'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                  {payment.channel}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.nights}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                AED {payment.totalAmount}
                            </td>
                          </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <div className="text-sm text-gray-400 mb-2">No reservations recorded</div>
                                <div className="text-xs text-gray-400">Reservations will appear here when added</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-6">
                {/* Expenses table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">DATE</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">UNIT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CATEGORY</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CONTRACTOR</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">AMOUNT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">DESCRIPTION</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.length > 0 ? (
                          expenses.map((expense: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.unit}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.contractor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">AED {expense.amount}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{(expense as any).description || 'No description'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => setDeleteExpenseModal({ isOpen: true, index, expense })}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded cursor-pointer"
                                title="Delete expense"
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <div className="text-sm text-gray-400 mb-2">No expenses recorded</div>
                                <div className="text-xs text-gray-400">Add a new expense to see it here</div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button 
                      onClick={handleAddExpense}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add new</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                {/* Header with Edit button */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Availability Settings</h2>
                  <button 
                    onClick={handleEditAvailability}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium cursor-pointer flex items-center space-x-2"
                  >
                    <Edit size={16} />
                    <span>Edit Settings</span>
                  </button>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Booking window */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking window</h3>
                    <p className="text-sm text-gray-600 mb-4">How far into the future is your property available for booking</p>
                    
                    <div className="relative mb-6">
                      <select 
                        value={availabilitySettings.bookingWindow}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                        disabled
                      >
                        <option value="all-days">All days available (Default)</option>
                        <option value="fixed-days">Fixed days</option>
                        <option value="custom">Custom</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Advance Notice */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Advance Notice</h4>
                      <p className="text-sm text-gray-600 mb-4">The latest guests can book a reservation ahead of check-in</p>
                      
                      <div className="relative">
                        <select 
                          value={availabilitySettings.advanceNotice}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                          disabled
                        >
                          <option value="none">None (Default)</option>
                          <option value="same-day">Same day (customize cutoff hours)</option>
                          <option value="1-day">1 day&apos;s notice</option>
                          <option value="2-days">2 day&apos;s notice</option>
                          <option value="3-days">3 day&apos;s notice</option>
                          <option value="7-days">7 day&apos;s notice</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Length of stay limits */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Length of stay limits</h3>
                        <p className="text-sm text-gray-600">Set the minimum and maximum length of stay per reservation.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum length of stay</label>
                        <input
                          type="number"
                          value={availabilitySettings.minStay}
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">nights</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maximum length of stay</label>
                        <input
                          type="number"
                          value={availabilitySettings.maxStay}
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">nights</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'marketing' && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Marketing Settings</h2>
                </div>

                {/* Description Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  
                  <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <button
                            onClick={() => handleEditField('marketing', 'title', marketingSettings.title, 'Edit Title')}
                            className="text-orange-600 hover:text-orange-800 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {marketingSettings.title}
                        </div>
                        </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Summary</label>
                        <button
                          onClick={() => handleEditField('marketing', 'summary', marketingSettings.summary, 'Edit Summary', 'textarea')}
                          className="text-orange-600 hover:text-orange-800 cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                      <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                        {marketingSettings.summary}
                      </div>
                      </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">The space</label>
                          <button
                            onClick={() => handleEditField('marketing', 'theSpace', marketingSettings.theSpace, 'Edit The Space', 'textarea')}
                            className="text-orange-600 hover:text-orange-800 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                          {marketingSettings.theSpace}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Guest access</label>
                          <button
                            onClick={() => handleEditField('marketing', 'guestAccess', marketingSettings.guestAccess, 'Edit Guest Access', 'textarea')}
                            className="text-orange-600 hover:text-orange-800 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                          {marketingSettings.guestAccess}
                        </div>
                    </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">The neighborhood</label>
                          <button
                            onClick={() => handleEditField('marketing', 'neighborhood', marketingSettings.neighborhood, 'Edit Neighborhood', 'textarea')}
                            className="text-orange-600 hover:text-orange-800 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                          {marketingSettings.neighborhood}
                        </div>
                  </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Getting around</label>
                          <button
                            onClick={() => handleEditField('marketing', 'gettingAround', marketingSettings.gettingAround, 'Edit Getting Around', 'textarea')}
                            className="text-orange-600 hover:text-orange-800 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                          {marketingSettings.gettingAround}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Other things to note</label>
                          <button
                            onClick={() => handleEditField('marketing', 'otherNotes', marketingSettings.otherNotes, 'Edit Other Notes', 'textarea')}
                            className="text-orange-600 hover:text-orange-800 cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                      </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                          {marketingSettings.otherNotes}
                  </div>
                </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">Interaction with guests</label>
                          <button
                            onClick={() => handleEditField('marketing', 'guestInteraction', marketingSettings.guestInteraction, 'Edit Guest Interaction', 'textarea')}
                            className="text-orange-600 hover:text-orange-800 cursor-pointer"
                          >
                            <Edit size={16} />
                    </button>
                  </div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                          {marketingSettings.guestInteraction}
                    </div>
                    </div>
                    </div>
                  </div>
                </div>


                {/* Channels Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Channels</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage which channels your property is listed on</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">A</span>
                        </div>
                      <div>
                          <h4 className="font-medium text-gray-900">Airbnb</h4>
                          <p className="text-sm text-gray-500">Connected</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                        <button className="text-orange-500 hover:text-orange-700 text-sm cursor-pointer">Manage</button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">B</span>
                      </div>
                      <div>
                          <h4 className="font-medium text-gray-900">Booking.com</h4>
                          <p className="text-sm text-gray-500">Connected</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                        <button className="text-orange-500 hover:text-orange-700 text-sm cursor-pointer">Manage</button>
                    </div>
                  </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">H</span>
                        </div>
                  <div>
                          <h4 className="font-medium text-gray-900">Hostelworld</h4>
                          <p className="text-sm text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Inactive</span>
                        <button className="text-blue-500 hover:text-blue-700 text-sm">Connect</button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">V</span>
                      </div>
                      <div>
                          <h4 className="font-medium text-gray-900">Vrbo</h4>
                          <p className="text-sm text-gray-500">Not connected</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Inactive</span>
                        <button className="text-blue-500 hover:text-blue-700 text-sm">Connect</button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-bold">D</span>
                      </div>
                      <div>
                          <h4 className="font-medium text-gray-900">Direct Bookings</h4>
                          <p className="text-sm text-gray-500">Always available</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                        <button className="text-orange-500 hover:text-orange-700 text-sm cursor-pointer">Manage</button>
                    </div>
                  </div>
                </div>

                </div>
              </div>
            )}

            {activeTab === 'saved-replies' && (
              <div className="space-y-6">
                {savedReplies.map((category: any) => (
                  <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{category.name}</h3>
                      {category.id === 'single' && (
                    <div className="flex space-x-3">
                      <button 
                        onClick={handleAddNewReply}
                        className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 text-sm font-medium cursor-pointer transition-colors"
                      >
                        Add a new reply
                      </button>
                    </div>
                      )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[80px] border border-gray-200">
                      {category.replies && category.replies.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                          {category.replies.map((reply: any) => (
                            <div key={reply.id} className="flex items-center space-x-2">
                    <button 
                                onClick={() => handleReplyClick(reply.name)}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 text-xs font-medium cursor-pointer transition-colors"
                    >
                                {reply.name}
                    </button>
                    <button 
                                onClick={() => handleDeleteReply(reply.id)}
                                className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                title="Delete reply"
                              >
                                <X size={12} />
                    </button>
                  </div>
                          ))}
                </div>
                      ) : (
                        <div className="text-center text-gray-500 text-sm py-4">
                          No saved replies yet
                  </div>
                      )}
                </div>
              </div>
                ))}

                {/* Sync Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${syncStatus.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-700">{syncStatus.message}</span>
                            </div>
                            <button 
                      onClick={handleSyncReplies}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-xs font-medium cursor-pointer transition-colors"
                            >
                      Sync Now
                      </button>
                    </div>
                  <p className="text-xs text-gray-500 mt-2">All saved replies are automatically synchronized with your connected booking platforms.</p>
                </div>
              </div>
            )}


            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Documents Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Property Documents Archive</h3>
                    <button 
                      onClick={handleAddDocument}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Add Document</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {documents.map((document: any) => (
                      <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Download size={16} className="text-orange-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{document.title}</h4>
                            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                              <span>{document.fileName}</span>
                              <span>{document.fileSize}</span>
                              <span>{document.type}</span>
                              <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Uploaded by {document.uploadedBy} ({document.uploadedByEmail})
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => handleDownloadDocument(document.id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-100 rounded cursor-pointer" 
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this document?')) {
                                handleDeleteDocument(document.id)
                              }
                            }}
                            title="Delete"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {documents.length === 0 && (
                    <div className="text-center py-8">
                      <Download size={32} className="mx-auto text-gray-400 mb-3" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No documents uploaded</h3>
                      <p className="text-xs text-gray-500">Upload property documents to keep them organized in one place</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'automation' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Auto Response Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Auto Response</h3>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={automationSettings.autoResponse.isActive}
                          onChange={handleAutoResponseToggle}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" 
                        />
                        <span className="text-sm font-medium text-gray-700">Activate Auto Response</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <strong>Only available for Airbnb reservations</strong>
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* For non-confirmed guests */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">For non-confirmed guests</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-medium text-gray-700">For the first message</span>
                    <button 
                            onClick={() => handleAutoResponseConfigure('nonConfirmed', 'first-message')}
                            className="px-3 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 cursor-pointer transition-colors"
                          >
                            Configure
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-medium text-gray-700">For any subsequent message</span>
                          <button 
                            onClick={() => handleAutoResponseConfigure('nonConfirmed', 'subsequent')}
                            className="px-3 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 cursor-pointer transition-colors"
                          >
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* For confirmed guests */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">For confirmed guests</h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-medium text-gray-700">Before checking in</span>
                          <button 
                            onClick={() => handleAutoResponseConfigure('confirmed', 'before-checkin')}
                            className="px-3 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 cursor-pointer transition-colors"
                          >
                            Configure
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-medium text-gray-700">On the day of checkin</span>
                          <button 
                            onClick={() => handleAutoResponseConfigure('confirmed', 'checkin-day')}
                            className="px-3 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 cursor-pointer transition-colors"
                          >
                            Configure
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-medium text-gray-700">On the day of checkout</span>
                          <button 
                            onClick={() => handleAutoResponseConfigure('confirmed', 'checkout-day')}
                            className="px-3 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 cursor-pointer transition-colors"
                          >
                            Configure
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-medium text-gray-700">During stay</span>
                          <button 
                            onClick={() => handleAutoResponseConfigure('confirmed', 'during-stay')}
                            className="px-3 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 cursor-pointer transition-colors"
                          >
                            Configure
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-medium text-gray-700">After checking out</span>
                          <button 
                            onClick={() => handleAutoResponseConfigure('confirmed', 'after-checkout')}
                            className="px-3 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 cursor-pointer transition-colors"
                          >
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Auto Reviews Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">AutoReviews</h3>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={automationSettings.autoReviews.isActive}
                          onChange={handleAutoReviewsToggle}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" 
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delay (in days)</label>
                        <input
                          type="number"
                          value={automationSettings.autoReviews.delay}
                          onChange={(e) => handleAutoReviewsDelayChange(parseInt(e.target.value))}
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating to use</label>
                        <RatingStars
                          rating={automationSettings.autoReviews.rating}
                          interactive={true}
                          size="md"
                          onRatingChange={handleAutoReviewsRatingChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review templates</label>
                      <textarea
                        value={automationSettings.autoReviews.template}
                        onChange={(e) => handleAutoReviewsTemplateChange(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit {editModal.title}</h3>
              <button 
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            {editModal.type === 'amenities' ? (
              <AmenitiesEditModal 
                amenities={amenities}
                selectedAmenities={selectedAmenities}
                onSave={handleSaveAmenities}
                onCancel={handleCloseEdit}
              />
            ) : editModal.type === 'rules' ? (
              <RulesEditModal 
                rules={rules}
                selectedRules={selectedRules}
                onSave={handleSaveRules}
                onCancel={handleCloseEdit}
              />
            ) : editModal.type === 'owner' ? (
              <OwnerEditModal 
                owner={owner}
                onSave={handleSaveOwner}
                onCancel={handleCloseEdit}
              />
            ) : editModal.type === 'income' ? (
              <IncomeEditModal 
                incomeDistribution={incomeDistribution}
                onSave={handleSaveIncomeDistribution}
                onCancel={handleCloseEdit}
              />
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editModal.title}
                  </label>
                  {editModal.inputType === 'textarea' ? (
                    <textarea
                      defaultValue={editModal.currentValue}
                      className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                      autoFocus
                    />
                  ) : editModal.inputType === 'select' ? (
                    <select
                      defaultValue={editModal.currentValue}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      autoFocus
                    >
                      {editModal.field === 'status' ? (
                        <>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Maintenance">Maintenance</option>
                        </>
                      ) : editModal.field === 'type' ? (
                        <>
                          <option value="Apartment">Apartment</option>
                          <option value="Villa">Villa</option>
                          <option value="Townhouse">Townhouse</option>
                          <option value="Studio">Studio</option>
                          <option value="Penthouse">Penthouse</option>
                        </>
                      ) : null}
                    </select>
                  ) : (
                  <input
                    type={editModal.inputType}
                    defaultValue={editModal.currentValue}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoFocus
                  />
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCloseEdit}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null = null
                      
                      if (editModal.inputType === 'textarea') {
                        input = document.querySelector('textarea') as HTMLTextAreaElement
                      } else if (editModal.inputType === 'select') {
                        input = document.querySelector('select') as HTMLSelectElement
                      } else {
                        input = document.querySelector('input') as HTMLInputElement
                      }
                      
                      if (input) {
                        handleSaveEdit(input.value)
                      }
                    }}
                    className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {addExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Expense</h3>
              <button 
                onClick={() => setAddExpenseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <AddExpenseModal 
              onSave={handleSaveExpense}
              onCancel={() => setAddExpenseModal(false)}
            />
          </div>
        </div>
      )}

      {/* Add Utility Modal */}
      {addUtilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Utility</h3>
              <button 
                onClick={() => setAddUtilityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <AddUtilityModal 
              onSave={handleSaveUtility}
              onCancel={() => setAddUtilityModal(false)}
            />
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {addPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Payment</h3>
              <button 
                onClick={() => setAddPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <AddPaymentModal
              onSave={handleSavePayment}
              onCancel={() => setAddPaymentModal(false)}
            />
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {addBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Booking</h3>
              <button 
                onClick={() => setAddBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name *</label>
                <input
                  type="text"
                  value={bookingForm.guestName}
                  onChange={(e) => setBookingForm({...bookingForm, guestName: e.target.value})}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter guest name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date *</label>
                <input
                  type="date"
                  value={bookingForm.checkIn}
                  onChange={(e) => setBookingForm({...bookingForm, checkIn: e.target.value})}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date *</label>
                <input
                  type="date"
                  value={bookingForm.checkOut}
                  onChange={(e) => setBookingForm({...bookingForm, checkOut: e.target.value})}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (AED) *</label>
                <input
                  type="number"
                  value={bookingForm.totalAmount}
                  onChange={(e) => setBookingForm({...bookingForm, totalAmount: e.target.value})}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter total amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                <select
                  value={bookingForm.channel}
                  onChange={(e) => setBookingForm({...bookingForm, channel: e.target.value})}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Direct">Direct</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Expedia">Expedia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={bookingForm.method}
                  onChange={(e) => setBookingForm({...bookingForm, method: e.target.value})}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setAddBookingModal(false)}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBooking}
                  className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
                >
                  Create Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      <ReservationModal 
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        selectedDate={currentDate}
        selectedProperty={params.id}
      />

      {/* Saved Replies Modal */}
      {savedRepliesModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{savedRepliesModal.title}</h3>
              <button 
                onClick={() => setSavedRepliesModal({ isOpen: false, type: '', title: '', replyData: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const name = formData.get('name') as string
              const content = formData.get('content') as string
              
              if (name && content) {
                handleSavedRepliesSave({ name, content })
              }
            }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                    name="name"
                  defaultValue={(savedRepliesModal.replyData as any)?.name || ''}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter reply name"
                    required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                <textarea
                    name="content"
                  rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                  placeholder="Enter your message template here..."
                    defaultValue={(savedRepliesModal.replyData as any)?.content || ''}
                    required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                  type="button"
                onClick={() => setSavedRepliesModal({ isOpen: false, type: '', title: '', replyData: null })}
                className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                  type="submit"
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto Response Modal */}
      {autoResponseModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{autoResponseModal.title}</h3>
              <button 
                onClick={() => setAutoResponseModal({ isOpen: false, type: '', trigger: '', title: '', content: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Trigger:</strong> {autoResponseModal.trigger.replace('-', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-blue-600 mt-1">This message will be sent automatically based on the selected trigger.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Template</label>
                <textarea
                  value={autoResponseModal.content}
                  onChange={(e) => setAutoResponseModal(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Enter your auto-response message here..."
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Available variables:</strong></p>
                <p className="mt-1">• {`{guest_name}`} - Guest&apos;s name</p>
                <p>• {`{check_in_date}`} - Check-in date</p>
                <p>• {`{check_out_date}`} - Check-out date</p>
                <p>• {`{property_name}`} - Property name</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setAutoResponseModal({ isOpen: false, type: '', trigger: '', title: '', content: '' })}
                className="px-4 py-2 text-sm bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAutoResponseSave({ 
                  type: autoResponseModal.type, 
                  trigger: autoResponseModal.trigger, 
                  content: autoResponseModal.content 
                })}
                className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {addDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Document</h3>
              <button 
                onClick={() => setAddDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <AddDocumentModal 
              onSave={handleSaveDocument}
              onCancel={() => setAddDocumentModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Availability Modal */}
      {editAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Availability Settings</h3>
              <button 
                onClick={() => setEditAvailabilityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <EditAvailabilityModal 
              settings={availabilitySettings}
              onSave={handleSaveAvailability}
              onCancel={() => setEditAvailabilityModal(false)}
            />
          </div>
        </div>
      )}

      </div>
    </div>
    </div>
  )
}
