'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, Mail, Phone, Calendar, FileText, Trash2, Star, Crown } from 'lucide-react'
import { userServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import { showToast } from '@/lib/utils/toast'
import { useAgentEvents } from '@/hooks/useEventBus'
import { propertyServiceV2 } from '@/lib/api/services/propertyService-v2'
import PasswordDisplayModal from '../owners/PasswordDisplayModal'

interface AddAgentModalProps {
  isOpen: boolean
  onClose: () => void
  agent?: any
  onAgentUpdated?: (updatedAgent: any) => void
}

export default function AddAgentModal({ isOpen, onClose, agent, onAgentUpdated }: AddAgentModalProps) {
  const { emitAgentUpdated, emitAgentCreated } = useAgentEvents()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    nationality: '',
    dateOfBirth: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    unitsAttracted: [] as Array<{ propertyId: string; propertyName: string; commission?: number }>
  })
  
  // Separate state for date inputs to avoid lag
  const [dateInputs, setDateInputs] = useState({
    day: '',
    month: '',
    year: ''
  })
  
  // State for available properties and units attracted management
  const [availableProperties, setAvailableProperties] = useState<any[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string
    password: string
  } | null>(null)

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Helper function to parse date for display (YYYY-MM-DD to DD MM YYYY)
  const parseDateForDisplay = (dateString: string) => {
    if (!dateString || dateString === '1900-01-01') return { day: '', month: '', year: '' }
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return { day: '', month: '', year: '' }
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear().toString()
      return { day, month, year }
    } catch (error) {
      return { day: '', month: '', year: '' }
    }
  }

  // Function to update dateOfBirth when dateInputs change
  const updateDateOfBirth = (newDateInputs: { day: string; month: string; year: string }) => {
    const { day, month, year } = newDateInputs
    if (day && month && year) {
      const dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      setFormData(prev => ({ ...prev, dateOfBirth }))
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }))
    }
  }

  // Function to load available properties
  const loadAvailableProperties = async () => {
    try {
      setIsLoadingProperties(true)
      console.log('🔍 Loading properties...')
      
      const response = await propertyServiceV2.getAll()
      console.log('🔍 Properties response:', response)
      
      if (response.success && response.data) {
        // response.data is PaginatedResponse, so we need response.data.data
        const properties = response.data.data || response.data
        setAvailableProperties(properties)
        console.log('🔍 Properties loaded:', properties.length)
      } else {
        console.log('🔍 No properties found or error:', response.error)
        setAvailableProperties([])
      }
    } catch (error) {
      console.error('Error loading properties:', error)
      setAvailableProperties([])
    } finally {
      setIsLoadingProperties(false)
    }
  }

  // Function to add property to units attracted
  const addPropertyToUnitsAttracted = (property: any) => {
    console.log('🔍 Adding property to units attracted:', property)
    const newUnit = {
      id: property.id,
      name: property.name,
      propertyId: property.id,
      commission: 0,
      status: 'Active' as const,
      referralDate: new Date().toISOString()
    }
    console.log('🔍 New unit created:', newUnit)
    setFormData(prev => {
      const newUnitsAttracted = [...prev.unitsAttracted, newUnit]
      console.log('🔍 Updated unitsAttracted:', newUnitsAttracted)
      return {
        ...prev,
        unitsAttracted: newUnitsAttracted
      }
    })
  }

  // Function to remove property from units attracted
  const removePropertyFromUnitsAttracted = (unitId: string) => {
    setFormData(prev => ({
      ...prev,
      unitsAttracted: prev.unitsAttracted.filter(unit => unit.id !== unitId)
    }))
  }

  // Function to update commission for a unit
  const updateUnitCommission = (unitId: string, commission: number) => {
    setFormData(prev => ({
      ...prev,
      unitsAttracted: prev.unitsAttracted.map(unit =>
        unit.id === unitId ? { ...unit, commission } : unit
      )
    }))
  }

  // Populate form data when agent prop changes (for editing)
  useEffect(() => {
    if (agent && isOpen) {
      console.log('🔍 AddAgentModal: Loading agent data:', agent)
      console.log('🔍 AddAgentModal: Agent dateOfBirth:', agent.dateOfBirth)
      const newFormData = {
        firstName: agent.firstName || '',
        lastName: agent.lastName || '',
        email: agent.email || '',
        phone: agent.phone || '',
        nationality: agent.nationality || '',
        dateOfBirth: agent.dateOfBirth || '',
        status: agent.status || 'ACTIVE',
        unitsAttracted: agent.units || []
      }
      console.log('🔍 AddAgentModal: Setting formData:', newFormData)
      console.log('🔍 AddAgentModal: Agent units from API:', agent.units)
      setFormData(newFormData)
      
      // Set date inputs from agent data
      if (agent.dateOfBirth) {
        const { day, month, year } = parseDateForDisplay(agent.dateOfBirth)
        setDateInputs({ day, month, year })
      } else {
        setDateInputs({ day: '', month: '', year: '' })
      }
    } else if (!agent && isOpen) {
      // Reset form for new agent
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        nationality: '',
        dateOfBirth: '',
        status: 'ACTIVE',
        unitsAttracted: []
      })
      setDateInputs({ day: '', month: '', year: '' })
    }
  }, [agent, isOpen])

  // Load properties when modal opens for editing
  useEffect(() => {
    if (isOpen && agent) {
      loadAvailableProperties()
    }
  }, [isOpen, agent])

  // Auto-load properties when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableProperties()
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required'
    }

    // For editing, validate email if provided
    if (agent && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔍 handleSubmit called!')
    
    if (!validateForm()) {
      console.log('🔍 Form validation failed!')
      return
    }
    
    console.log('🔍 Form validation passed, proceeding with submit...')

    setIsSubmitting(true)
    
    try {
      let agentData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationality: formData.nationality,
        role: 'AGENT' as const
      }

      if (agent) {
        // For editing - include all fields
        agentData = {
          ...agentData,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          status: formData.status,
          units: formData.unitsAttracted
        }
        console.log('🔍 Agent data to save:', agentData)
        console.log('🔍 Units to save:', formData.unitsAttracted)
        console.log('🔍 Units structure check:', formData.unitsAttracted.map(unit => ({
          hasId: !!unit.id,
          hasName: !!unit.name,
          hasPropertyId: !!unit.propertyId,
          unit: unit
        })))
      } else {
        // For creating - email and password can be provided or generated automatically
        const email = formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@agent.com`
        
        agentData = {
          ...agentData,
          email: email,
          status: 'ACTIVE' as const
        }
        
        // Add password if provided, otherwise backend will auto-generate
        if (formData.password && formData.password.trim()) {
          agentData.password = formData.password
        }
      }

      let response
      if (agent) {
        // Update existing agent
        console.log('Updating agent:', agent.id, agentData)
        response = await userServiceAdapter.updateUser(agent.id, agentData)
      } else {
        // Create new agent
        console.log('Creating new agent:', agentData)
        response = await userServiceAdapter.createUser(agentData)
      }

      if (response.success && response.data) {
        // Check if password was generated
        const generatedPassword = (response.data as any).generatedPassword
        
        if (generatedPassword && !agent) {
          // Show password modal for new agents with generated password
          setGeneratedCredentials({
            email: agentData.email,
            password: generatedPassword
          })
          setShowPasswordModal(true)
          showToast.success('Agent created with auto-generated password!')
          handleSave(response.data)
        } else {
          showToast.success(agent ? 'Agent updated successfully!' : 'Agent created successfully!')
          handleSave(response.data)
          onClose()
        }
      } else {
        showToast.error(response.message || (agent ? 'Failed to update agent' : 'Failed to create agent'))
      }
    } catch (error: any) {
      console.error('Error saving agent:', error)
      showToast.error(error.message || 'An error occurred while saving the agent')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = (agentData: any) => {
    console.log('Agent saved:', agentData)
    console.log('Agent saved units:', agentData.units)
    
    // Emit appropriate event based on whether we're creating or updating
    if (agent) {
      // Updating existing agent
      emitAgentUpdated(agent.id, agentData)
      console.log('📡 AddAgentModal: Emitted agent updated event for:', agent.id)
    } else {
      // Creating new agent
      emitAgentCreated(agentData)
      console.log('📡 AddAgentModal: Emitted agent created event')
    }
    
    if (onAgentUpdated) {
      console.log('🔍 Calling onAgentUpdated with:', agentData)
      console.log('🔍 onAgentUpdated units:', agentData.units)
      onAgentUpdated(agentData)
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
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {agent ? 'Edit Agent' : 'Add New Agent'}
              </h2>
              <p className="text-sm text-slate-600">
                {agent ? 'Update agent information' : 'Create a new agent profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Personal Information</h3>
            
            {/* Display Date of Birth and Age for editing */}
            {agent && (
              <div className="bg-slate-50 rounded-lg p-4">
                {console.log('🔍 AddAgentModal: Rendering Personal Information, agent:', !!agent, 'formData.dateOfBirth:', formData.dateOfBirth)}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Date of Birth:</span>
                    <span className="text-sm text-slate-600">
                      {formData.dateOfBirth ? (
                        `${parseDateForDisplay(formData.dateOfBirth).day} / ${parseDateForDisplay(formData.dateOfBirth).month} / ${parseDateForDisplay(formData.dateOfBirth).year}`
                      ) : (
                        'Not set'
                      )}
                    </span>
                  </div>
                  {formData.dateOfBirth && calculateAge(formData.dateOfBirth) && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Age:</span>
                      <span className="text-sm text-slate-600">{calculateAge(formData.dateOfBirth)} years old</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nationality *
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.nationality ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select nationality</option>
                <option value="Emirati">🇦🇪 Emirati</option>
                <option value="British">🇬🇧 British</option>
                <option value="Canadian">🇨🇦 Canadian</option>
                <option value="American">🇺🇸 American</option>
                <option value="Indian">🇮🇳 Indian</option>
                <option value="Pakistani">🇵🇰 Pakistani</option>
                <option value="Filipino">🇵🇭 Filipino</option>
                <option value="Egyptian">🇪🇬 Egyptian</option>
                <option value="Saudi Arabian">🇸🇦 Saudi Arabian</option>
                <option value="Kuwaiti">🇰🇼 Kuwaiti</option>
                <option value="Qatari">🇶🇦 Qatari</option>
                <option value="Bahraini">🇧🇭 Bahraini</option>
                <option value="Omani">🇴🇲 Omani</option>
                <option value="Jordanian">🇯🇴 Jordanian</option>
                <option value="Lebanese">🇱🇧 Lebanese</option>
                <option value="Syrian">🇸🇾 Syrian</option>
                <option value="Iraqi">🇮🇶 Iraqi</option>
                <option value="Iranian">🇮🇷 Iranian</option>
                <option value="Turkish">🇹🇷 Turkish</option>
                <option value="Chinese">🇨🇳 Chinese</option>
                <option value="Japanese">🇯🇵 Japanese</option>
                <option value="Korean">🇰🇷 Korean</option>
                <option value="French">🇫🇷 French</option>
                <option value="German">🇩🇪 German</option>
                <option value="Italian">🇮🇹 Italian</option>
                <option value="Spanish">🇪🇸 Spanish</option>
                <option value="Russian">🇷🇺 Russian</option>
                <option value="Ukrainian">🇺🇦 Ukrainian</option>
                <option value="Brazilian">🇧🇷 Brazilian</option>
                <option value="Argentinian">🇦🇷 Argentinian</option>
                <option value="Mexican">🇲🇽 Mexican</option>
                <option value="Australian">🇦🇺 Australian</option>
                <option value="South African">🇿🇦 South African</option>
                <option value="Nigerian">🇳🇬 Nigerian</option>
                <option value="Kenyan">🇰🇪 Kenyan</option>
                <option value="Moroccan">🇲🇦 Moroccan</option>
                <option value="Algerian">🇩🇿 Algerian</option>
                <option value="Tunisian">🇹🇳 Tunisian</option>
                <option value="Other">🌍 Other</option>
              </select>
              {errors.nationality && (
                <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
              )}
            </div>

            {/* Email field - always visible for creation, editable for editing */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address {!agent && '(Optional)'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={agent ? "Enter email address" : "agent@example.com (auto-generated if empty)"}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              {!agent && (
                <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate: firstname.lastname@agent.com</p>
              )}
            </div>

            {/* Password field - only for creation */}
            {!agent && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Leave empty to auto-generate secure password"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate a secure 16-character password</p>
              </div>
            )}

            {/* Additional fields for editing */}
            {agent && (
              <>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="DD"
                        maxLength={2}
                        value={dateInputs.day}
                        onChange={(e) => {
                          const day = e.target.value.replace(/\D/g, '').slice(0, 2)
                          const newDateInputs = { ...dateInputs, day }
                          setDateInputs(newDateInputs)
                          updateDateOfBirth(newDateInputs)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="MM"
                        maxLength={2}
                        value={dateInputs.month}
                        onChange={(e) => {
                          const month = e.target.value.replace(/\D/g, '').slice(0, 2)
                          const newDateInputs = { ...dateInputs, month }
                          setDateInputs(newDateInputs)
                          updateDateOfBirth(newDateInputs)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="YYYY"
                        maxLength={4}
                        value={dateInputs.year}
                        onChange={(e) => {
                          const year = e.target.value.replace(/\D/g, '').slice(0, 4)
                          const newDateInputs = { ...dateInputs, year }
                          setDateInputs(newDateInputs)
                          updateDateOfBirth(newDateInputs)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
                      />
                    </div>
                  </div>
                  {formData.dateOfBirth && calculateAge(formData.dateOfBirth) && (
                    <p className="text-sm text-slate-600 mt-2">
                      Age: {calculateAge(formData.dateOfBirth)} years old
                    </p>
                  )}
                </div>

                {/* Units Attracted Section */}
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-3">Units Attracted</h4>
                  
                  {/* Current Units Attracted */}
                  {console.log('🔍 Rendering Units Attracted, count:', formData.unitsAttracted.length, 'units:', formData.unitsAttracted)}
                  {formData.unitsAttracted.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.unitsAttracted.map((unit, index) => (
                        <div key={unit.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-slate-700">{unit.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              placeholder="Commission %"
                              value={unit.commission || ''}
                              onChange={(e) => updateUnitCommission(unit.id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <span className="text-xs text-slate-500">%</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePropertyFromUnitsAttracted(unit.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Property Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-slate-700">Available Properties</h5>
                      <button
                        type="button"
                        onClick={loadAvailableProperties}
                        disabled={isLoadingProperties}
                        className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                      >
                        {isLoadingProperties ? 'Loading...' : 'Refresh'}
                      </button>
                    </div>

                    {/* Available Properties Dropdown */}
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg">
                      {availableProperties.length === 0 ? (
                        <div className="p-3 text-center text-sm text-slate-500">
                          {isLoadingProperties ? 'Loading properties...' : 'No properties available'}
                        </div>
                      ) : (
                        availableProperties
                          .filter(property => !formData.unitsAttracted.some(unit => unit.id === property.id))
                          .map(property => (
                            <button
                              key={property.id}
                              type="button"
                              onClick={() => addPropertyToUnitsAttracted(property)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{property.name}</span>
                                <span className="text-xs text-slate-500">{property.type}</span>
                              </div>
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{agent ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{agent ? 'Update Agent' : 'Create Agent'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Password Display Modal */}
      {showPasswordModal && generatedCredentials && (
        <PasswordDisplayModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false)
            setGeneratedCredentials(null)
            onClose() // Close the main modal after password modal is closed
          }}
          email={generatedCredentials.email}
          password={generatedCredentials.password}
          role="AGENT"
        />
      )}
    </div>
  )
}