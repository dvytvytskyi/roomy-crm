'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Smartphone, Calendar } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
  }
)

interface MarketingTabProps {
  propertyData: any
  onUpdate: (updates: any) => Promise<boolean>
}

export default function MarketingTab({ propertyData, onUpdate }: MarketingTabProps) {
  const [marketingData, setMarketingData] = useState({
    title: '',
    description: '',
    spaceDescription: '',
    guestAccess: '',
    otherNotes: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Load marketing data on mount
  useEffect(() => {
    if (propertyData && isMounted) {
      setMarketingData({
        title: propertyData.title || '',
        description: propertyData.description || '',
        spaceDescription: propertyData.spaceDescription || '',
        guestAccess: propertyData.guestAccess || '',
        otherNotes: propertyData.otherNotes || ''
      })
    }
  }, [propertyData, isMounted])

  // Prevent SSR hydration issues
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setMarketingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Save marketing data
  const handleSave = async () => {
    setIsLoading(true)
    try {
      const success = await onUpdate(marketingData)
      if (success) {
        alert('Marketing data saved successfully!')
      } else {
        alert('Failed to save marketing data')
      }
    } catch (error) {
      console.error('Error saving marketing data:', error)
      alert('Error saving marketing data')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Marketing Descriptions Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Marketing Descriptions</h2>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Заголовок)
            </label>
            <input
              type="text"
              value={marketingData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Cozy Studio with Sea View near Marina"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Опис)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={marketingData.description}
                onChange={(value) => handleInputChange('description', value || '')}
                data-color-mode="light"
                height={300}
                placeholder="Main detailed description of the property..."
              />
            </div>
          </div>

          {/* The Space */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              The Space (Простір)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={marketingData.spaceDescription}
                onChange={(value) => handleInputChange('spaceDescription', value || '')}
                data-color-mode="light"
                height={200}
                placeholder="Detailed description of the space itself..."
              />
            </div>
          </div>

          {/* Guest Access */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Access (Доступ для гостей)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={marketingData.guestAccess}
                onChange={(value) => handleInputChange('guestAccess', value || '')}
                data-color-mode="light"
                height={150}
                placeholder="Information about what areas guests have access to..."
              />
            </div>
          </div>

          {/* Other Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Things to Note (Інші важливі деталі)
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={marketingData.otherNotes}
                onChange={(value) => handleInputChange('otherNotes', value || '')}
                data-color-mode="light"
                height={150}
                placeholder="Additional important information..."
              />
            </div>
          </div>
        </div>
      </div>


      {/* Distribution Channels Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribution Channels</h2>
        
        <div className="space-y-4">
          {/* Airbnb */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Globe size={20} className="text-pink-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Airbnb</h3>
                <p className="text-sm text-gray-600">Short-term rental platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Not Connected
              </span>
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded">
                Connect
              </button>
            </div>
          </div>

          {/* Booking.com */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Booking.com</h3>
                <p className="text-sm text-gray-600">Hotel and accommodation booking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Not Connected
              </span>
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded">
                Connect
              </button>
            </div>
          </div>

          {/* Direct Bookings */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Direct Bookings</h3>
                <p className="text-sm text-gray-600">Your own website and booking system</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Active
              </span>
              <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
