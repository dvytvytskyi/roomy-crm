'use client'

import { useState } from 'react'
import { ArrowLeft, Home, DollarSign, FileText, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TopNavigation from '../../../components/TopNavigation'
import PropertyOverview from '../../../components/properties/PropertyOverview'
import PropertyTabs from './components/PropertyTabs'
import FinancialTab from './components/tabs/FinancialTab'
import DocumentsTab from './components/tabs/DocumentsTab'
import SettingsTab from './components/tabs/SettingsTab'
import Toast from '../../../components/Toast'
import { usePropertyData } from './hooks/usePropertyData'

interface PropertyDetailsProps {
  params: {
    id: string
  }
}

export default function PropertyDetailsPage({ params }: PropertyDetailsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')

  // Use custom hook for property data management
  const {
    propertyData,
    owner,
    isLoading,
    error,
    updateProperty,
    refreshData
  } = usePropertyData(params.id)

  // Handle property updates
  const handlePropertyUpdate = async (updates: any): Promise<boolean> => {
    try {
      const success = await updateProperty(updates)
      
      if (success) {
        showToastMessage('Property updated successfully', 'success')
        await refreshData() // Refresh data after update
      return true
      } else {
        showToastMessage('Failed to update property', 'error')
      return false
    }
    } catch (error: any) {
      console.error('[PropertyDetailsPage] Update error:', error)
      showToastMessage(error.message || 'An error occurred', 'error')
      return false
    }
  }

  // Toast helper
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Define tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Home size={16} /> },
    { id: 'financial', label: 'Financial', icon: <DollarSign size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="max-w-full px-8 py-8 mt-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
                    </div>
                  )
                } 
                
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="max-w-full px-8 py-8 mt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
                      <button 
              onClick={() => refreshData()}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
            </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      {/* Property Header with Background */}
      <div className="bg-white border-b border-gray-200 shadow-sm mt-8">
        <div className="max-w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button
                onClick={() => router.push('/properties')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
                </button>
                          <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {propertyData?.name || 'Property Details'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {propertyData?.nickname || 'Loading...'}
                </p>
                          </div>
                          </div>
            
                          <div className="flex items-center space-x-2">
              <span className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${propertyData?.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
                }
              `}>
                {propertyData?.isActive ? 'Active' : 'Inactive'}
              </span>
                            </div>
                        </div>
                    </div>
                          </div>

      {/* Main Content Area */}
      <div className="max-w-full px-8 py-6">
        {/* Tabs Navigation */}
        <PropertyTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <PropertyOverview
                  propertyId={params.id} 
              propertyData={propertyData}
              owner={owner}
              onPropertyUpdate={handlePropertyUpdate}
              isLoading={isLoading}
              error={error}
            />
            )}

            {activeTab === 'financial' && (
            <FinancialTab
              propertyData={propertyData}
              onUpdate={handlePropertyUpdate}
            />
          )}

            {activeTab === 'documents' && (
            <DocumentsTab
              propertyData={propertyData}
              onUpdate={handlePropertyUpdate}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              propertyData={propertyData}
              onUpdate={handlePropertyUpdate}
            />
          )}
                      </div>
                    </div>
    
    {/* Toast Notification */}
    {showToast && (
      <Toast
        message={toastMessage}
          type={toastType}
        onClose={() => setShowToast(false)}
      />
    )}
    </div>
  )
}

