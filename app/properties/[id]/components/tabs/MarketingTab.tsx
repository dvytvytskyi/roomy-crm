'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Smartphone, Calendar, Link, Copy, Check } from 'lucide-react'
import { getCalendarExportUrl } from '../../../../../lib/api/config'

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
  const [copied, setCopied] = useState(false)
  const [airbnbImportUrl, setAirbnbImportUrl] = useState('')
  const [isUpdatingImport, setIsUpdatingImport] = useState(false)
  
  // Load marketing data on mount
  useEffect(() => {
    if (propertyData) {
      setMarketingData({
        title: propertyData.title || '',
        description: propertyData.description || '',
        spaceDescription: propertyData.spaceDescription || '',
        guestAccess: propertyData.guestAccess || '',
        otherNotes: propertyData.otherNotes || ''
      })
      setAirbnbImportUrl(propertyData.airbnb_ical_import_url || '')
    }
  }, [propertyData])

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

  // Generate iCal URL for Airbnb
  const generateICalUrl = () => {
    if (!propertyData?.id) return ''
    return getCalendarExportUrl(propertyData.id)
  }

  // Copy iCal URL to clipboard
  const copyICalUrl = async () => {
    const url = generateICalUrl()
    if (!url) return
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Update Airbnb Import URL
  const handleUpdateAirbnbImport = async () => {
    setIsUpdatingImport(true)
    try {
      const response = await fetch(`/api/v2/calendar/properties/${propertyData.id}/calendar-imports`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          airbnb_ical_import_url: airbnbImportUrl
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Airbnb Import URL updated:', result)
        // Show success message
        alert('Airbnb Import URL updated successfully!')
      } else {
        throw new Error('Failed to update Airbnb Import URL')
      }
    } catch (error) {
      console.error('Error updating Airbnb Import URL:', error)
      alert('Failed to update Airbnb Import URL')
    } finally {
      setIsUpdatingImport(false)
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
            <textarea
              value={marketingData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Main detailed description of the property..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* The Space */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              The Space (Простір)
            </label>
            <textarea
              value={marketingData.spaceDescription}
              onChange={(e) => handleInputChange('spaceDescription', e.target.value)}
              placeholder="Detailed description of the space itself..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* Guest Access */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Access (Доступ для гостей)
            </label>
            <textarea
              value={marketingData.guestAccess}
              onChange={(e) => handleInputChange('guestAccess', e.target.value)}
              placeholder="Information about what areas guests have access to..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* Other Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Things to Note (Інші важливі деталі)
            </label>
            <textarea
              value={marketingData.otherNotes}
              onChange={(e) => handleInputChange('otherNotes', e.target.value)}
              placeholder="Additional important information..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
            />
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
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Calendar Ready
              </span>
              <button 
                onClick={copyICalUrl}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded"
              >
                {copied ? 'Copied!' : 'Get iCal URL'}
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

      {/* Calendar Integration Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="text-orange-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Calendar Integration</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-2">Airbnb Calendar Sync</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Use this iCal URL to sync your property&apos;s availability with Airbnb. 
                  This will automatically block dates when you have reservations and keep your calendar up-to-date.
                </p>
                <div className="bg-white border border-blue-300 rounded-lg p-3 mb-3">
                  <code className="text-xs text-gray-700 break-all">
                    {generateICalUrl()}
                  </code>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={copyICalUrl}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <a
                    href={generateICalUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Link size={16} />
                    <span>Test URL</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Copy the iCal URL above</li>
              <li>Go to your Airbnb listing → Calendar → Sync calendars</li>
              <li>Click "Import calendar"</li>
              <li>Paste the URL and click "Add calendar"</li>
              <li>Your Airbnb calendar will now sync with your reservations</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Airbnb Import Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="text-pink-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Airbnb Import Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-pink-900 mb-2">Import Airbnb Reservations</h3>
                <p className="text-sm text-pink-700 mb-3">
                  Configure your Airbnb iCal import URL to automatically import reservations from Airbnb into your system.
                  This will keep your calendar synchronized with Airbnb bookings.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Airbnb iCal Import URL
                    </label>
                    <input
                      type="url"
                      value={airbnbImportUrl}
                      onChange={(e) => setAirbnbImportUrl(e.target.value)}
                      placeholder="https://www.airbnb.com/calendar/ical/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleUpdateAirbnbImport}
                      disabled={isUpdatingImport}
                      className="flex items-center space-x-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white rounded-lg transition-colors"
                    >
                      {isUpdatingImport ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Update Import URL</span>
                        </>
                      )}
                    </button>
                    {airbnbImportUrl && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Configured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">How to get your Airbnb iCal URL:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to your Airbnb listing → Calendar</li>
              <li>Click "Export calendar" or "Sync calendars"</li>
              <li>Copy the iCal URL (usually ends with .ics)</li>
              <li>Paste it in the field above</li>
              <li>Click "Update Import URL" to save</li>
              <li>Your system will automatically import Airbnb reservations every 5 minutes</li>
            </ol>
          </div>
        </div>
      </div>

    </div>
  )
}
