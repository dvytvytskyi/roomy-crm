'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, Calendar, MapPin, Building, DollarSign, MessageSquare, Upload, Plus, Minus } from 'lucide-react'

interface AddOwnerModalProps {
  onClose: () => void
  onSave: (owner: any) => void
}

export default function AddOwnerModal({ onClose, onSave }: AddOwnerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    whatsapp: '',
    telegram: '',
    units: [] as string[],
    comments: '',
    status: 'Active',
    paymentPreferences: 'Bank Transfer',
    personalStayDays: 30
  })

  const [newUnit, setNewUnit] = useState('')
  const [newComment, setNewComment] = useState('')
  const [commentsHistory, setCommentsHistory] = useState<Array<{id: string, text: string, author: string, timestamp: string}>>([])
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // In real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const ownerData = {
        ...formData,
        commentsHistory,
        id: Date.now(), // In real app, this would come from the backend
        reservationCount: 0,
        totalUnits: formData.units.length,
        vipStatus: formData.status === 'VIP',
        createdAt: new Date().toISOString(),
        createdBy: 'Current User'
      }

      onSave(ownerData)
    } catch (error) {
      console.error('Error saving owner:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter owner's full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Nationality *
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nationality ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select nationality</option>
                {nationalities.map(nationality => (
                  <option key={nationality} value={nationality}>{nationality}</option>
                ))}
              </select>
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
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="owner@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
