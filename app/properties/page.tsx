'use client'

import { useState, useEffect, useCallback } from 'react'
import TopNavigation from '../../components/TopNavigation'
import PropertiesTable from '../../components/properties/PropertiesTable'
import PropertyModal from '../../components/properties/PropertyModal'
import PropertiesFilters from '../../components/properties/PropertiesFilters'
import Toast from '../../components/Toast'
import { Plus, Search, Download, Archive, Trash2, Filter, Home, Building, Users, DollarSign } from 'lucide-react'
import { propertyService } from '../../lib/api'

export default function PropertiesPage() {
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [selectedProperties, setSelectedProperties] = useState<number[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    propertyTypes: [] as string[],
    areas: [] as string[],
    occupancyRates: [] as string[],
    maxGuests: [] as string[],
    bedrooms: [] as string[]
  })

  console.log('🏠 PropertiesPage render - properties:', properties, 'isLoading:', isLoading)

  const handleCreateProperty = () => {
    setSelectedProperty(null)
    setIsPropertyModalOpen(true)
  }

  const handleShowToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    console.log('🔍 Filters changed:', newFilters)
    setFilters(newFilters)
  }

  const loadProperties = useCallback(async () => {
    console.log('🔥 loadProperties function called!')
    console.log('🔥 Current properties state:', properties)
    console.log('🔥 Current isLoading state:', isLoading)
    
    try {
      setIsLoading(true)
      console.log('🔄 Loading properties from API...')
      const response = await propertyService.getProperties()
      console.log('📋 API Response in loadProperties:', response)
      console.log('📋 Response success:', response.success)
      console.log('📋 Response data:', response.data)
      console.log('📋 Response error:', response.error)
      
      if (response.success && response.data) {
        console.log('✅ Properties loaded successfully:', response.data)
        console.log('✅ Properties count:', response.data.length)
        setProperties(response.data)
        console.log('✅ Properties state updated')
      } else {
        console.error('❌ Failed to load properties:', response.error)
        console.log('❌ Setting properties to empty array')
        setProperties([])
        // Show error toast with more user-friendly message
        const errorMessage = response.error?.message || 'Unknown error'
        let userMessage = 'Failed to load properties'
        if (errorMessage.includes('timeout')) {
          userMessage = 'Server is taking too long to respond. Please try again.'
        } else if (errorMessage.includes('Network error')) {
          userMessage = 'Cannot connect to server. Please check your internet connection.'
        } else if (errorMessage.includes('cancelled')) {
          userMessage = 'Request was cancelled. Please try again.'
        }
        handleShowToast(userMessage)
      }
    } catch (error) {
      console.error('💥 Error loading properties:', error)
      console.log('💥 Setting properties to empty array due to error')
      setProperties([])
      // Show error toast with more user-friendly message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      let userMessage = 'Error loading properties'
      if (errorMessage.includes('timeout')) {
        userMessage = 'Server is taking too long to respond. Please try again.'
      } else if (errorMessage.includes('Network error')) {
        userMessage = 'Cannot connect to server. Please check your internet connection.'
      } else if (errorMessage.includes('cancelled')) {
        userMessage = 'Request was cancelled. Please try again.'
      }
      handleShowToast(userMessage)
    } finally {
      console.log('🏁 Setting isLoading to false')
      setIsLoading(false)
    }
  }, [properties, isLoading])

  const handlePropertyCreated = useCallback(() => {
    console.log('🎉 Property created, automatically refreshing list...')
    // Automatically reload properties from API
    loadProperties()
  }, [loadProperties])

  useEffect(() => {
    console.log('🚀 PropertiesPage: useEffect triggered!')
    console.log('🔧 loadProperties function:', loadProperties)
    console.log('📞 Calling loadProperties...')
    
    // Test API endpoint directly
    console.log('🧪 Testing API endpoint directly...')
    fetch('http://5.223.55.121:3001/api/properties', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
      .then(response => {
        console.log('🧪 Direct API test response status:', response.status)
        console.log('🧪 Direct API test response ok:', response.ok)
        console.log('🧪 Direct API test response headers:', response.headers)
        if (response.ok) {
          return response.json()
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      })
      .then(data => {
        console.log('🧪 Direct API test data:', data)
        console.log('🧪 Direct API test data type:', typeof data)
        console.log('🧪 Direct API test data keys:', data ? Object.keys(data) : 'No data')
      })
      .catch(error => {
        console.error('🧪 Direct API test error:', error)
        console.error('🧪 Direct API test error message:', error.message)
      })
    
    loadProperties()
  }, [loadProperties])

  const handleEditProperty = (property: any) => {
    setSelectedProperty(property)
    setIsPropertyModalOpen(true)
  }

  const handleBulkAction = (action: 'archive' | 'delete' | 'export') => {
    if (selectedProperties.length === 0) return
    
    switch (action) {
      case 'archive':
        console.log('Archive properties:', selectedProperties)
        break
      case 'delete':
        console.log('Delete properties:', selectedProperties)
        break
      case 'export':
        console.log('Export properties:', selectedProperties)
        break
    }
    setSelectedProperties([])
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <TopNavigation />
      
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        {/* Header */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">Properties</h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                    />
                  </div>

                  {/* Add Property */}
                  <button
                    onClick={handleCreateProperty}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Add Property</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Building className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Properties</p>
                  <p className="text-2xl font-medium text-slate-900">{properties.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Home className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Active Properties</p>
                  <p className="text-2xl font-medium text-slate-900">
                    {properties.filter(p => p.status === 'Active' || p.is_active === true || p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Total Bedrooms</p>
                  <p className="text-2xl font-medium text-slate-900">
                    {properties.reduce((sum, p) => {
                      const beds = p.beds || p.bedrooms || '0'
                      if (typeof beds === 'string') {
                        // Parse string like "1 double bed • 1 single bed" or just "1"
                        const match = beds.match(/(\d+)/)
                        return sum + (match ? parseInt(match[1]) : 0)
                      }
                      return sum + (typeof beds === 'number' ? beds : 0)
                    }, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-1">Avg Price/Night</p>
                  <p className="text-2xl font-medium text-slate-900">
                    AED {properties.length > 0 ? Math.round(properties.reduce((sum, p) => {
                      const price = p.base_price || p.pricePerNight || p.price || 0
                      return sum + (typeof price === 'string' ? parseFloat(price) || 0 : price)
                    }, 0) / properties.length) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProperties.length > 0 && (
          <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-orange-700 font-medium">
                    {selectedProperties.length} property(ies) selected
                  </span>
                  <button
                    onClick={() => setSelectedProperties([])}
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium underline cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium cursor-pointer"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex gap-8 px-2 sm:px-3 lg:px-4 py-1.5 min-h-0 overflow-hidden">
          {/* Filters Sidebar - Fixed Height */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-sm font-medium text-slate-700">Filters</h3>
                <Filter className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <PropertiesFilters 
                  isOpen={true}
                  onClose={() => {}}
                  isSidebar={true}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
              <PropertiesTable 
                searchTerm={searchTerm}
                onEditProperty={handleEditProperty}
                selectedProperties={selectedProperties}
                onSelectionChange={setSelectedProperties}
                properties={properties}
                isLoading={isLoading}
                filters={filters}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={selectedProperty}
        onShowToast={handleShowToast}
        onPropertyCreated={handlePropertyCreated}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          duration={5000}
          onClose={() => setShowToast(false)}
        />
      )}
      
    </div>
  )
}
