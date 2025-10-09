'use client'

import { useState } from 'react'
import { Settings, Save } from 'lucide-react'

interface SettingsTabProps {
  propertyData: any
  onUpdate: (updates: any) => Promise<boolean>
}

export default function SettingsTab({ propertyData, onUpdate }: SettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [settings, setSettings] = useState({
    minStay: propertyData?.minStay || 1,
    maxStay: propertyData?.maxStay || 30,
    checkInTime: propertyData?.checkInTime || '15:00',
    checkOutTime: propertyData?.checkOutTime || '11:00',
    bookingWindow: propertyData?.bookingWindow || '365',
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const success = await onUpdate(settings)
      if (success) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Availability Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Availability Settings</h2>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Edit Settings
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setSettings({
                    minStay: propertyData?.minStay || 1,
                    maxStay: propertyData?.maxStay || 30,
                    checkInTime: propertyData?.checkInTime || '15:00',
                    checkOutTime: propertyData?.checkOutTime || '11:00',
                    bookingWindow: propertyData?.bookingWindow || '365',
                  })
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Minimum Stay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Stay (nights)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="1"
                value={settings.minStay}
                onChange={(e) => setSettings({ ...settings, minStay: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {settings.minStay} {settings.minStay === 1 ? 'night' : 'nights'}
              </div>
            )}
          </div>

          {/* Maximum Stay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Stay (nights)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="1"
                value={settings.maxStay}
                onChange={(e) => setSettings({ ...settings, maxStay: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {settings.maxStay} nights
              </div>
            )}
          </div>

          {/* Check-in Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Time
            </label>
            {isEditing ? (
              <input
                type="time"
                value={settings.checkInTime}
                onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {settings.checkInTime}
              </div>
            )}
          </div>

          {/* Check-out Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Time
            </label>
            {isEditing ? (
              <input
                type="time"
                value={settings.checkOutTime}
                onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {settings.checkOutTime}
              </div>
            )}
          </div>

          {/* Booking Window */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Window (days in advance)
            </label>
            {isEditing ? (
              <input
                type="number"
                min="1"
                max="730"
                value={settings.bookingWindow}
                onChange={(e) => setSettings({ ...settings, bookingWindow: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {settings.bookingWindow} days
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              How far in advance guests can book this property
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

