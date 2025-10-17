'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Wrench, Building, User, Calendar, AlertTriangle, ChevronDown } from 'lucide-react'
import { taskServiceV2 } from '@/lib/api/services/taskService-v2'
import { propertyServiceV2 } from '@/lib/api/services/propertyService-v2'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'

interface AddMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddMaintenanceModal({ isOpen, onClose }: AddMaintenanceModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    propertyId: '',
    technician: '',
    priority: 'Normal',
    type: 'General',
    scheduledDate: '',
    estimatedDuration: '2 hours',
    description: '',
    cost: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loadingProperties, setLoadingProperties] = useState(false)
  const [loadingTechnicians, setLoadingTechnicians] = useState(false)

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProperties()
      loadTechnicians()
    }
  }, [isOpen])

  const loadProperties = async () => {
    setLoadingProperties(true)
    try {
      console.log('🔍 Loading properties for maintenance modal...')
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

  const loadTechnicians = async () => {
    setLoadingTechnicians(true)
    try {
      console.log('🔍 Loading technicians for maintenance modal...')
      // Load users with AGENT role as technicians
      const response = await userServiceAdapter.getUsers({ 
        role: 'AGENT',
        limit: 100 
      })
      console.log('🔍 Technicians response:', response)
      
      if (response.success && response.data) {
        const techniciansList = response.data.data || []
        console.log('🔍 Technicians list:', techniciansList)
        setTechnicians(techniciansList)
      } else {
        console.error('🔍 Failed to load technicians:', response)
      }
    } catch (error) {
      console.error('Error loading technicians:', error)
    } finally {
      setLoadingTechnicians(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Convert form data to API format
      const taskData = {
        title: formData.title,
        description: formData.description,
        type: 'MAINTENANCE' as const,
        priority: formData.priority.toUpperCase() as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
        propertyId: formData.propertyId,
        assignedTo: formData.technician,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
        estimatedDuration: formData.estimatedDuration,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: `Type: ${formData.type}`
      }
      
      console.log('Creating maintenance task:', taskData)
      
      const response = await taskServiceV2.create(taskData)
      
      if (response.success && response.data) {
        showToast.success('Задачу обслуговування успішно створено!')
        onClose()
        
        // Navigate to the created task details page
        router.push(`/maintenance/${response.data.id}`)
        
        // Reset form
        setFormData({
          title: '',
          propertyId: '',
          technician: '',
          priority: 'Normal',
          type: 'General',
          scheduledDate: '',
          estimatedDuration: '2 hours',
          description: '',
          cost: ''
        })
      } else {
        showToast.error(response.message || 'Не вдалося створити задачу обслуговування')
      }
    } catch (error: any) {
      console.error('Error creating maintenance task:', error)
      showToast.error('Помилка при створенні задачі обслуговування')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Maintenance Task</h2>
              <p className="text-sm text-gray-600">Create a new maintenance task</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Fix Kitchen Faucet"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Property */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-500" />
                  Property *
                </div>
              </label>
              <div className="relative">
                <select
                  value={formData.propertyId}
                  onChange={(e) => handleChange('propertyId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                  required
                  disabled={loadingProperties}
                >
                  <option value="">
                    {loadingProperties ? 'Loading properties...' : 'Select Property'}
                  </option>
                  {properties.map((property) => (
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

            {/* Technician */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  Technician *
                </div>
              </label>
              <div className="relative">
                <select
                  value={formData.technician}
                  onChange={(e) => handleChange('technician', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                  required
                  disabled={loadingTechnicians}
                >
                  <option value="">
                    {loadingTechnicians ? 'Loading technicians...' : 'Select Technician'}
                  </option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.firstName} {technician.lastName} ({technician.email})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-gray-500" />
                  Priority
                </div>
              </label>
              <div className="relative">
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Wrench className="w-4 h-4 mr-2 text-gray-500" />
                  Type
                </div>
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                >
                  <option value="General">General</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Preventive">Preventive</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  Scheduled Date *
                </div>
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration
              </label>
              <div className="relative">
                <select
                  value={formData.estimatedDuration}
                  onChange={(e) => handleChange('estimatedDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white pr-10"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1.5 hours">1.5 hours</option>
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                  <option value="4 hours">4 hours</option>
                  <option value="6 hours">6 hours</option>
                  <option value="8 hours">8 hours</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Cost (AED)
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the maintenance task in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
