'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Calendar, Clock, Building, Sparkles, User, FileText, CheckCircle, ChevronDown } from 'lucide-react'
import { taskServiceV2 } from '@/lib/api/services/taskService-v2'
import { propertyServiceV2 } from '@/lib/api/services/propertyService-v2'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'

interface AddCleaningModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddCleaningModal({ isOpen, onClose }: AddCleaningModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    unit: '',
    type: '',
    cleaner: '',
    duration: '',
    status: 'SCHEDULED',
    notes: '',
    priority: 'NORMAL',
    includesLaundry: false,
    laundryCount: '',
    linenComments: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [cleaners, setCleaners] = useState<any[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [loadingCleaners, setLoadingCleaners] = useState(false)

  const types = ['Regular Clean', 'Deep Clean', 'Office Clean', 'Post-Checkout', 'Pre-Arrival', 'Mid-Stay']
  const statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
  const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT']

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProperties()
      loadCleaners()
    }
  }, [isOpen])

  const loadProperties = async () => {
    setLoadingProperties(true)
    try {
      console.log('🔍 Loading properties for cleaning modal...')
      const response = await propertyServiceV2.getAll({ limit: 100 })
      console.log('🔍 Properties response:', response)
      
      if (response.success && response.data) {
        const propertiesList = response.data.data || []
        console.log('🔍 Properties list:', propertiesList)
        setProperties(propertiesList)
      } else {
        console.error('🔍 Failed to load properties:', response)
      }
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoadingProperties(false)
    }
  }

  const loadCleaners = async () => {
    setLoadingCleaners(true)
    try {
      console.log('🔍 Loading cleaners for cleaning modal...')
      // Load users with AGENT role as cleaners
      const response = await userServiceAdapter.getUsers({ 
        role: 'AGENT',
        limit: 100 
      })
      console.log('🔍 Cleaners response:', response)
      
      if (response.success && response.data) {
        const cleanersList = response.data.data || []
        console.log('🔍 Cleaners list:', cleanersList)
        setCleaners(cleanersList)
      } else {
        console.error('🔍 Failed to load cleaners:', response)
      }
    } catch (error) {
      console.error('Error loading cleaners:', error)
    } finally {
      setLoadingCleaners(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Convert form data to API format
      const taskData = {
        title: `${formData.type} - ${formData.unit}`,
        description: formData.notes || `Cleaning task for ${formData.unit}`,
        type: 'CLEANING' as const,
        priority: formData.priority as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
        propertyId: formData.unit,
        assignedTo: formData.cleaner,
        scheduledDate: formData.date && formData.time ? 
          new Date(`${formData.date}T${formData.time}`).toISOString() : 
          new Date(formData.date).toISOString(),
        estimatedDuration: formData.duration,
        status: formData.status as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
        notes: formData.includesLaundry ? 
          `Linen service included. Items: ${formData.laundryCount}. Comments: ${formData.linenComments}` : 
          formData.notes
      }
      
      console.log('Creating cleaning task:', taskData)
      
      const response = await taskServiceV2.create(taskData)
      
      if (response.success && response.data) {
        showToast.success('Задачу прибирання успішно створено!')
        onClose()
        
        // Navigate to the created task details page
        router.push(`/cleaning/${response.data.id}`)
        
        // Reset form
        setFormData({
          date: '',
          time: '',
          unit: '',
          type: '',
          cleaner: '',
          duration: '',
          status: 'SCHEDULED',
          notes: '',
          priority: 'NORMAL',
          includesLaundry: false,
          laundryCount: '',
          linenComments: ''
        })
      } else {
        showToast.error(response.message || 'Не вдалося створити задачу прибирання')
      }
    } catch (error: any) {
      console.error('Error creating cleaning task:', error)
      showToast.error('Помилка при створенні задачі прибирання')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Cleaning Task</h2>
              <p className="text-sm text-gray-600">Create a new cleaning task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Unit *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      required
                      disabled={loadingProperties}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                    >
                      <option value="">
                        {loadingProperties ? 'Loading properties...' : 'Select Unit'}
                      </option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>
                          {property.name} - {property.address}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Cleaning Type *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      required
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                    >
                      <option value="">Select Type</option>
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Cleaner *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.cleaner}
                      onChange={(e) => handleInputChange('cleaner', e.target.value)}
                      required
                      disabled={loadingCleaners}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                    >
                      <option value="">
                        {loadingCleaners ? 'Loading cleaners...' : 'Select Cleaner'}
                      </option>
                      {cleaners.map(cleaner => (
                        <option key={cleaner.id} value={cleaner.id}>
                          {cleaner.firstName} {cleaner.lastName} ({cleaner.email})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      required
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                    >
                      <option value="">Select Duration</option>
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2 hours">2 hours</option>
                      <option value="2.5 hours">2.5 hours</option>
                      <option value="3 hours">3 hours</option>
                      <option value="4 hours">4 hours</option>
                      <option value="5 hours">5 hours</option>
                      <option value="6 hours">6 hours</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linen Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Linen Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="includesLaundry"
                    checked={formData.includesLaundry}
                    onChange={(e) => handleInputChange('includesLaundry', e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="includesLaundry" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Includes linen service
                  </label>
                </div>
                
                {formData.includesLaundry && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Number of linen items
                      </label>
                      <input
                        type="number"
                        value={formData.laundryCount}
                        onChange={(e) => handleInputChange('laundryCount', e.target.value)}
                        placeholder="Enter number of items"
                        min="1"
                        className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Linen comments
                      </label>
                      <textarea
                        value={formData.linenComments || ''}
                        onChange={(e) => handleInputChange('linenComments', e.target.value)}
                        placeholder="Add any special notes about linen (e.g., stains, special care instructions)..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Add any special instructions or notes for the cleaning task..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
