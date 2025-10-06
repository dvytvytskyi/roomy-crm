'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, Mail, Phone, Calendar, FileText, Trash2, Star, Crown } from 'lucide-react'
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
    email: '',
    phone: '',
    nationality: '',
    dateOfBirth: '',
    comments: '',
    starGuest: false,
    primaryGuest: false,
    loyaltyTier: 'Bronze',
    preferredLanguage: 'English',
    specialRequests: '',
    documents: [] as File[]
  })
  const [errors, setErrors] = useState<any>({})
  const [newComment, setNewComment] = useState('')
  const [commentsHistory, setCommentsHistory] = useState<Array<{
    id: string
    text: string
    author: string
    date: string
  }>>([])

  const nationalities = [
    'American', 'British', 'Canadian', 'French', 'German', 'Italian', 'Spanish', 
    'Chinese', 'Japanese', 'Korean', 'Indian', 'Australian', 'Brazilian', 'Mexican',
    'Russian', 'Egyptian', 'Saudi Arabian', 'Emirati', 'Turkish', 'Greek', 'Other'
  ]

  const loyaltyTiers = [
    { value: 'Bronze', label: 'Bronze', color: 'bg-orange-100 text-orange-800' },
    { value: 'Silver', label: 'Silver', color: 'bg-gray-100 text-gray-800' },
    { value: 'Gold', label: 'Gold', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Platinum', label: 'Platinum', color: 'bg-purple-100 text-purple-800' }
  ]

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Turkish', 'Greek'
  ]

  // Populate form data when editing a guest
  useEffect(() => {
    if (guest && isOpen) {
      setFormData({
        firstName: guest.firstName || '',
        lastName: guest.lastName || '',
        email: guest.email || '',
        phone: guest.phone || '',
        nationality: guest.nationality || '',
        dateOfBirth: guest.dateOfBirth || '',
        comments: guest.comments || '',
        starGuest: guest.starGuest || false,
        primaryGuest: guest.primaryGuest || false,
        loyaltyTier: guest.loyaltyTier || 'Bronze',
        preferredLanguage: guest.preferredLanguage || 'English',
        specialRequests: guest.specialRequests || '',
        documents: []
      })
    } else if (!guest && isOpen) {
      // Reset form for new guest
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        dateOfBirth: '',
        comments: '',
        starGuest: false,
        primaryGuest: false,
        loyaltyTier: 'Bronze',
        preferredLanguage: 'English',
        specialRequests: '',
        documents: []
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles]
      }))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        author: 'Current User',
        date: new Date().toISOString()
      }
      setCommentsHistory(prev => [comment, ...prev])
      setNewComment('')
      
      const allComments = [comment, ...commentsHistory].map(c => c.text).join('\n\n')
      setFormData(prev => ({ ...prev, comments: allComments }))
    }
  }

  const removeComment = (commentId: string) => {
    const updatedHistory = commentsHistory.filter(c => c.id !== commentId)
    setCommentsHistory(updatedHistory)
    
    const allComments = updatedHistory.map(c => c.text).join('\n\n')
    setFormData(prev => ({ ...prev, comments: allComments }))
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
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
      const guestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'GUEST' as const,
        password: guest ? undefined : 'TempPassword123!',
        status: 'ACTIVE',
        country: formData.nationality,
        description: formData.comments
      }

      let response
      if (guest) {
        response = await userServiceAdapter.updateUser(guest.id, guestData)
      } else {
        response = await userServiceAdapter.createUser(guestData)
      }
      
      if (response.success && response.data) {
        showToast.dismiss(loadingToast)
        showToast.success(guest ? 'Guest updated successfully!' : 'Guest created successfully!')
        
        const transformedGuest = {
          ...response.data,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone,
          nationality: formData.nationality,
          dateOfBirth: formData.dateOfBirth,
          comments: formData.comments,
          reservationCount: 0,
          unit: '',
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        }

        handleSave(transformedGuest)
      } else {
        throw new Error(response.error || 'Failed to create guest')
      }
    } catch (error: any) {
      console.error('Error saving guest:', error)
      showToast.dismiss(loadingToast)
      showToast.error(error.message || 'Failed to create guest. Please try again.')
    }
  }

  const handleSave = (guestData: any) => {
    console.log('Guest saved:', guestData)
    
    // Emit appropriate event based on whether we're creating or updating
    if (guest) {
      // Updating existing guest
      emitGuestUpdated(guest.id, guestData)
      console.log('📡 AddGuestModal: Emitted guest updated event for:', guest.id)
    } else {
      // Creating new guest
      emitGuestCreated(guestData)
      console.log('📡 AddGuestModal: Emitted guest created event')
    }
    
    if (onGuestUpdated) {
      onGuestUpdated(guestData)
    }
    
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <User size={20} />
              <span>Basic Information</span>
            </h3>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Calendar size={16} className="inline mr-2" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loyalty Tier
                </label>
                <select
                  value={formData.loyaltyTier}
                  onChange={(e) => handleChange('loyaltyTier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {loyaltyTiers.map(tier => (
                    <option key={tier.value} value={tier.value}>{tier.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Mail size={20} className="mr-2" />
              Contact Information
            </h3>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="guest@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Guest Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Star size={20} className="mr-2" />
              Guest Status
            </h3>
              
            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.starGuest}
                    onChange={(e) => handleChange('starGuest', e.target.checked)}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Star Guest</span>
                </label>
                  
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.primaryGuest}
                    onChange={(e) => handleChange('primaryGuest', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Crown size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Primary Guest</span>
                </label>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText size={20} className="mr-2" />
              Guest Comments
            </h3>
              
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => handleChange('comments', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                  placeholder="Add any comments about this guest..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center space-x-2 transition-colors"
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