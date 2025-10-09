'use client'

import { useState } from 'react'
import { X, Link as LinkIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ImportFromAirbnbModalProps {
  isOpen: boolean
  onClose: () => void
  onShowToast: (message: string) => void
}

export default function ImportFromAirbnbModal({ isOpen, onClose, onShowToast }: ImportFromAirbnbModalProps) {
  const router = useRouter()
  const [airbnbUrl, setAirbnbUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; listingId: string | null } | null>(null)

  if (!isOpen) return null

  const handleClose = () => {
    if (isLoading) return // Prevent closing while loading
    setAirbnbUrl('')
    setError(null)
    setValidationResult(null)
    onClose()
  }

  const validateUrl = async (url: string) => {
    if (!url.trim()) {
      setValidationResult(null)
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('http://localhost:3002/api/v2/integrations/airbnb/validate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (data.success && data.data) {
        setValidationResult(data.data)
        if (!data.data.isValid) {
          setError('Invalid Airbnb URL. Please provide a valid listing URL.')
        }
      } else {
        setError(data.message || 'Failed to validate URL')
        setValidationResult(null)
      }
    } catch (err) {
      console.error('Error validating URL:', err)
      setError('Failed to validate URL')
      setValidationResult(null)
    } finally {
      setIsValidating(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setAirbnbUrl(url)
    
    // Debounced validation
    const timeoutId = setTimeout(() => {
      validateUrl(url)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleImport = async () => {
    setError(null)
    
    // Validation
    if (!airbnbUrl.trim()) {
      setError('Please enter an Airbnb URL')
      return
    }

    if (validationResult && !validationResult.isValid) {
      setError('Please enter a valid Airbnb listing URL')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated. Please login.')
      }

      // Get current user to use as owner
      const userResponse = await fetch('http://localhost:3002/api/v2/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!userResponse.ok) {
        throw new Error('Failed to get user information')
      }

      const userData = await userResponse.json()
      const ownerId = userData.data?.id

      if (!ownerId) {
        throw new Error('Could not determine user ID')
      }

      // Call import API
      console.log('🚀 Importing property from Airbnb:', airbnbUrl)
      const response = await fetch('http://localhost:3002/api/v2/integrations/airbnb/import-from-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: airbnbUrl,
          ownerId: ownerId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to import property')
      }

      console.log('✅ Property imported successfully:', data.data)

      // Show success message
      onShowToast('Property imported successfully from Airbnb!')
      
      // Close modal
      handleClose()

      // Redirect to property detail page
      const propertyId = data.data?.property?.id
      if (propertyId) {
        console.log('🔄 Redirecting to property page:', propertyId)
        router.push(`/properties/${propertyId}`)
      } else {
        // If no ID, just refresh the page
        window.location.reload()
      }

    } catch (err) {
      console.error('❌ Error importing property:', err)
      setError(err instanceof Error ? err.message : 'Failed to import property from Airbnb')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <LinkIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Import from Airbnb</h2>
              <p className="text-sm text-slate-500">Enter an Airbnb listing URL to import</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Airbnb Listing URL *
            </label>
            <div className="relative">
              <input
                type="url"
                value={airbnbUrl}
                onChange={handleUrlChange}
                placeholder="https://www.airbnb.com/rooms/123456"
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  error ? 'border-red-300' : validationResult?.isValid ? 'border-green-300' : 'border-gray-300'
                }`}
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              )}
              {!isValidating && validationResult?.isValid && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
              {!isValidating && error && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            
            {validationResult?.isValid && validationResult.listingId && (
              <p className="mt-2 text-sm text-green-600 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Valid Airbnb listing (ID: {validationResult.listingId})</span>
              </p>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </p>
            )}

            <p className="mt-2 text-xs text-slate-500">
              Example: https://www.airbnb.com/rooms/1528180770610140527
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 space-y-1">
                <p className="font-medium">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Property data will be fetched from Airbnb</li>
                  <li>A new property will be created automatically</li>
                  <li>You'll be redirected to review the imported data</li>
                  <li>You can edit any details as needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-slate-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || !validationResult?.isValid || !airbnbUrl.trim()}
            className="flex items-center space-x-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? 'Importing...' : 'Fetch Data'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

