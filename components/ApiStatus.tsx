'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { API_CONFIG } from '@/lib/api/config'

export default function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`)
        if (response.ok) {
          setStatus('connected')
          setError('')
        } else {
          setStatus('error')
          setError(`HTTP ${response.status}`)
        }
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Connection failed')
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 60000) // Check every 60 seconds (reduced frequency)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader size={16} className="animate-spin text-blue-500" />
      case 'connected':
        return <CheckCircle size={16} className="text-green-500" />
      case 'error':
        return <XCircle size={16} className="text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking API...'
      case 'connected':
        return 'API Connected'
      case 'error':
        return `API Error: ${error}`
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-blue-600'
      case 'connected':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Backend: {API_CONFIG.BASE_URL}
      </div>
    </div>
  )
}
