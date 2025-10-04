'use client'

import { useState, useEffect, useCallback } from 'react'
import { Edit, Calendar, DollarSign, CreditCard, Info, Flag, Mail, Phone, Plus, X, Download, Check, Building, User, ArrowLeft } from 'lucide-react'
import TopNavigation from '../../../components/TopNavigation'
import ReservationModal from '../../../components/ReservationModal'
import RatingStars from '../../../components/RatingStars'
import Toast from '../../../components/Toast'
import PriceRecommendations from '../../../components/pricing/PriceRecommendations'
import { apiRequest, ownerDataManager, safeLocalStorage, debugLog } from '../../../lib/api/production-utils'
import { priceLabService } from '../../../lib/api/services/pricelabService'

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
          data-testid="save-amenities-btn"
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
          data-testid="save-rules-btn"
        >
          Save
        </button>
      </div>
    </div>
  )
}

function OwnerEditModal({ owner, onSave, onCancel }: OwnerEditModalProps) {
  const [selectedOwnerId, setSelectedOwnerId] = useState(owner.id || '')
  const [availableOwners, setAvailableOwners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [successMessage, setSuccessMessage] = useState<string>('')

  // Fetch available owners on component mount
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const authToken = localStorage.getItem('accessToken') || 'test'
        
        const response = await fetch(`${apiUrl}/api/users/owners`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('Available owners:', result)

        if (result.success && result.data?.users) {
          setAvailableOwners(result.data.users)
        } else {
          console.error('Failed to fetch owners:', result.message)
        }
      } catch (error) {
        console.error('Error fetching owners:', error)
        setErrors({ general: 'Failed to load owners list' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOwners()
  }, [])

  const getCountryFlag = (nationality: string): string => {
    const flagMap: { [key: string]: string } = {
      'Emirati': '🇦🇪', 'American': '🇺🇸', 'British': '🇬🇧', 'Canadian': '🇨🇦', 
      'French': '🇫🇷', 'German': '🇩🇪', 'Italian': '🇮🇹', 'Spanish': '🇪🇸', 
      'Chinese': '🇨🇳', 'Japanese': '🇯🇵', 'Korean': '🇰🇷', 'Indian': '🇮🇳', 
      'Australian': '🇦🇺', 'Brazilian': '🇧🇷', 'Egyptian': '🇪🇬', 'Saudi Arabian': '🇸🇦',
      'Turkish': '🇹🇷', 'Greek': '🇬🇷', 'Russian': '🇷🇺'
    }
    return flagMap[nationality] || '🏳️'
  }

  const handleOwnerSelect = (ownerId: string) => {
    setSelectedOwnerId(ownerId)
    // Clear any previous errors
    if (errors.owner) {
      setErrors({ ...errors, owner: '' })
    }
  }

  const handleSave = async () => {
    if (!selectedOwnerId) {
      setErrors({ owner: 'Please select an owner' })
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setSuccessMessage('')

    try {
      // Find the selected owner from available owners
      const selectedOwner = availableOwners.find(o => o.id === selectedOwnerId)
      if (!selectedOwner) {
        throw new Error('Selected owner not found')
      }

      // Transform the owner data to the expected format
      const transformedOwner = {
        id: selectedOwner.id,
        name: `${selectedOwner.firstName} ${selectedOwner.lastName}`.trim(),
        flag: getCountryFlag(selectedOwner.nationality || 'Unknown'),
        country: selectedOwner.nationality || 'Unknown',
        email: selectedOwner.email || 'Unknown',
        phone: selectedOwner.phone || 'Unknown',
        status: selectedOwner.isActive ? 'active' : 'inactive'
      }

      // Show success message
      setSuccessMessage('Owner selected successfully!')
      
      // Clear any previous errors
      setErrors({})
      
      // Call onSave after a short delay to show success message
      setTimeout(() => {
        onSave(transformedOwner)
      }, 1500)
    } catch (error) {
      console.error('Error selecting owner:', error)
      setErrors({ general: error instanceof Error ? error.message : 'Failed to select owner. Please try again.' })
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-600">Loading owners...</span>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Owner *</label>
            <select
              value={selectedOwnerId}
              onChange={(e) => handleOwnerSelect(e.target.value)}
              className={`w-full h-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.owner ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select an owner</option>
              {availableOwners.map((ownerOption) => (
                <option key={ownerOption.id} value={ownerOption.id}>
                  {ownerOption.firstName} {ownerOption.lastName} - {ownerOption.email}
                </option>
              ))}
            </select>
            {errors.owner && <p className="mt-1 text-sm text-red-600">{errors.owner}</p>}
            
            {/* Show selected owner details */}
            {selectedOwnerId && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {(() => {
                  const selectedOwner = availableOwners.find(o => o.id === selectedOwnerId)
                  if (!selectedOwner) return null
                  
                  return (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Owner Information:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {selectedOwner.firstName} {selectedOwner.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {selectedOwner.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {selectedOwner.phone}
                        </div>
                        <div>
                          <span className="font-medium">Nationality:</span> {selectedOwner.nationality}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-1 ${selectedOwner.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedOwner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Properties:</span> {selectedOwner.totalUnits || 0}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}
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
  
  // Додаємо state для string значень інпутів
  const [inputValues, setInputValues] = useState({
    ownerIncome: incomeDistribution.ownerIncome.toString(),
    roomyAgencyFee: incomeDistribution.roomyAgencyFee.toString(),
    referringAgent: incomeDistribution.referringAgent.toString(),
    totalProfit: incomeDistribution.totalProfit.toString()
  })

  const handleChange = (field: keyof IncomeDistribution, value: string) => {
    // Оновлюємо string значення для інпутів
    setInputValues(prev => ({ ...prev, [field]: value }))
    
    // Парсимо числове значення
    const numValue = parseFloat(value) || 0
    const newFormData = { ...formData, [field]: numValue }
    
    // Auto-calculate total if it's not the total field being changed
    if (field !== 'totalProfit') {
      newFormData.totalProfit = newFormData.ownerIncome + newFormData.roomyAgencyFee + newFormData.referringAgent
      setInputValues(prev => ({ ...prev, totalProfit: newFormData.totalProfit.toString() }))
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
            value={inputValues.ownerIncome}
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
            value={inputValues.roomyAgencyFee}
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
            value={inputValues.referringAgent}
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
            value={inputValues.totalProfit}
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

// Real property data
const realProperty = {
  id: 1,
  name: 'Luxury Apartment Downtown Dubai',
  type: 'Apartment',
  location: 'Downtown Dubai',
  address: 'Burj Khalifa Boulevard, Dubai, UAE',
  size: '85 m²',
  beds: '2 bedrooms • 2 bathrooms',
  checkIn: '15:00',
  checkOut: '12:00',
  description: 'Luxury apartment in the heart of Downtown Dubai with stunning views of Burj Khalifa. Modern amenities and premium location make this the perfect choice for business and leisure travelers.',
  occupancyRate: 85,
  occupancyNights: 26,
  totalNights: 31,
  avgCostPerNight: 3200,
  monthlyPayout: 83200,
  pricePerNight: 520,
  owner: {
    id: 'owner_001',
    name: 'Ahmed Al-Rashid',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    birthDate: '15.06.1985',
    age: 38,
    units: 5,
    email: 'ahmed.alrashid@email.com',
    phone: '+971 50 123 4567',
    status: 'active'
  },
  amenities: ['Air conditioning', 'WiFi', 'Pool', 'Gym', 'Parking', 'Kitchen', 'Washing machine', 'TV', 'Balcony', 'Security', 'Concierge', 'Rooftop terrace'],
  rules: ['No smoking', 'No pets', 'No parties', 'Quiet hours 22:00-08:00', 'ID required at check-in'],
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
  const [property, setProperty] = useState<any>(null)
  const [priceLabPrice, setPriceLabPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [propertyNickname, setPropertyNickname] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // Date range state
  const [dateRange, setDateRange] = useState('lastweek')
  const [dateFrom, setDateFrom] = useState('2024-09-01')
  const [dateTo, setDateTo] = useState('2024-09-30')

  // Income Distribution State
  const [incomeDistribution, setIncomeDistribution] = useState<IncomeDistribution>(() => {
    // Значення за замовчуванням - будуть оновлені з налаштувань
    return {
      ownerIncome: 70,
      roomyAgencyFee: 25,
      referringAgent: 5,
      totalProfit: 0 // Буде розраховано автоматично
    }
  })

  // Settings State
  const [settings, setSettings] = useState<any>(null)

  // General Information State
  const [propertyGeneralInfo, setPropertyGeneralInfo] = useState<PropertyGeneralInfo>(() => {
    // Завантажуємо з localStorage або використовуємо значення за замовчуванням
    const savedInfo = typeof window !== 'undefined' ? localStorage.getItem(`propertyGeneralInfo_${params?.id || 'default'}`) : null
    console.log('Loading property general info from localStorage:', savedInfo)
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo)
        console.log('Parsed property general info:', parsed)
        return parsed
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

  // Edit Modal State
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

  // Modal Value State
  const [modalValue, setModalValue] = useState('')

  // Amenities State
  const [amenities, setAmenities] = useState(() => {
    const savedAmenities = typeof window !== 'undefined' ? localStorage.getItem(`propertyAmenities_${params?.id || 'default'}`) : null
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
    const savedSelectedAmenities = typeof window !== 'undefined' ? localStorage.getItem(`propertySelectedAmenities_${params?.id || 'default'}`) : null
    if (savedSelectedAmenities) {
      try {
        return JSON.parse(savedSelectedAmenities)
      } catch (error) {
        console.error('Error parsing saved selected amenities:', error)
      }
    }
    return ['Air conditioning', 'WiFi', 'Pool', 'Parking']
  })

  // Rules State
  const [rules, setRules] = useState(() => {
    const savedRules = typeof window !== 'undefined' ? localStorage.getItem(`propertyRules_${params?.id || 'default'}`) : null
    if (savedRules) {
      try {
        return JSON.parse(savedRules)
      } catch (error) {
        console.error('Error parsing saved rules:', error)
      }
    }
    return [
    'No smoking',
    'No parties',
    'No pets',
    'Check-in after 3 PM',
    'Check-out before 11 AM'
    ]
  })

  const [selectedRules, setSelectedRules] = useState(() => {
    const savedSelectedRules = typeof window !== 'undefined' ? localStorage.getItem(`propertySelectedRules_${params?.id || 'default'}`) : null
    if (savedSelectedRules) {
      try {
        return JSON.parse(savedSelectedRules)
      } catch (error) {
        console.error('Error parsing saved selected rules:', error)
      }
    }
    return ['No smoking', 'No parties', 'No pets']
  })

  // Owner State
  const [owner, setOwner] = useState(() => {
    // Try to load saved owner from localStorage using production utils
    const savedOwner = ownerDataManager.load(params?.id || 'default')
    if (savedOwner) {
      return savedOwner
    }
    
    // Fallback to default values
    return {
      id: 'unknown',
      firstName: 'Unknown',
      lastName: 'Owner',
      email: 'unknown@example.com',
      phone: '+971 XX XXX XXXX',
      country: 'Unknown',
      status: 'Unknown'
    }
  })

  // Expenses State
  const [expenses, setExpenses] = useState(() => {
    // Завантажуємо з localStorage або використовуємо порожній масив
    const savedExpenses = typeof window !== 'undefined' ? localStorage.getItem(`propertyExpenses_${params?.id || 'default'}`) : null
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

  // Photos State - завантажуємо тільки з localStorage
  const [photos, setPhotos] = useState<Photo[]>(() => {
    // Завантажуємо з localStorage
    const savedPhotos = typeof window !== 'undefined' ? localStorage.getItem(`propertyPhotos_${params?.id || 'default'}`) : null
    if (savedPhotos) {
      try {
        return JSON.parse(savedPhotos)
      } catch (error) {
        console.error('Error parsing saved photos:', error)
      }
    }
    return []
  })
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
    guests: 1,
    totalAmount: 0,
    status: 'confirmed'
  })

  // Description state
  const [description, setDescription] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`propertyDescription_${params?.id || 'default'}`) : null
    if (saved) {
      return saved
    }
    return 'Beautiful apartment in the heart of Dubai with modern amenities and stunning views.'
  })

  // Financial Data State
  const [financialData, setFinancialData] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`financialData_${params?.id || 'default'}`) : null
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing saved financial data:', error)
      }
    }
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      occupancyRate: 0,
      averageNightlyRate: 0,
      reservations: [],
      expenses: []
    }
  })

  // Payments State
  const [payments, setPayments] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`payments_${params?.id || 'default'}`) : null
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
    property: ''
  })
  
  const [savedReplies, setSavedReplies] = useState<any[]>([])
  const [syncStatus, setSyncStatus] = useState({ success: true, message: 'Synced with Airbnb, Booking.com, and other channels' })
  
  // Automation states
  const [autoResponseModal, setAutoResponseModal] = useState({
    isOpen: false,
    type: '', // 'non-confirmed', 'confirmed'
    property: ''
  })
  
  const [automationSettings, setAutomationSettings] = useState({
    autoResponse: {
    isActive: true,
    nonConfirmed: {
      isActive: true,
      template: 'Thank you for your inquiry. We will get back to you soon.',
      delay: 5
    },
    confirmed: {
      isActive: true,
      template: 'Your booking is confirmed. Welcome!',
      delay: 10
    }
    },
    autoSync: {
    isActive: true,
    frequency: 'daily',
    platforms: ['airbnb', 'booking', 'vrbo']
    },
    pricing: {
    isActive: false,
    strategy: 'market-based',
    updateFrequency: 'weekly'
    }
  })

  const [utilities, setUtilities] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`utilities_${params?.id || 'default'}`) : null
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing saved utilities:', error)
      }
    }
    return []
  })

  // Load property data from API
  const loadPropertyData = useCallback(async () => {
    if (!params?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'test'}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const propertyData = data.data
          setProperty(propertyData)
          setPropertyNickname(propertyData.nickname || propertyData.name || 'Unknown Property')
          setPropertyAddress(propertyData.address || 'No address')
          
          // Load PriceLab data if pricelabId exists
          if (propertyData.pricelabId) {
            await loadPriceLabData(propertyData.pricelabId)
          }
        }
      }
    } catch (error) {
      console.error('Error loading property data:', error)
    } finally {
      setLoading(false)
    }
  }, [params?.id])

  // Load PriceLab data
  const loadPriceLabData = async (pricelabId: string) => {
    try {
      const response = await priceLabService.getCurrentPrice(pricelabId)
      if (response.success && response.data) {
        setPriceLabPrice(response.data.currentPrice)
      }
    } catch (error) {
      console.error('Error loading PriceLab data:', error)
    }
  }
  
  const handleShowToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // Load data on component mount
  useEffect(() => {
    loadPropertyData()
  }, [loadPropertyData])

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading property details...</p>
        </div>
      </div>
    )
  }
  

  // Function to calculate days since intake date
  const calculateDaysSinceIntake = (intakeDate: string) => {
    const intake = new Date(intakeDate.split('.').reverse().join('-'))
    const today = new Date()
    const diffTime = today.getTime() - intake.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }


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
