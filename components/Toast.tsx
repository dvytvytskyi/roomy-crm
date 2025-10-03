'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
  'data-testid'?: string
}

export default function Toast({ message, type = 'success', duration = 5000, onClose, ...props }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-orange-200 text-slate-900'
      case 'error':
        return 'bg-white border-red-200 text-slate-900'
      case 'info':
        return 'bg-white border-blue-200 text-slate-900'
      default:
        return 'bg-white border-orange-200 text-slate-900'
    }
  }

  const getIconStyles = () => {
    switch (type) {
      case 'success':
        return 'text-orange-500'
      case 'error':
        return 'text-red-500'
      case 'info':
        return 'text-blue-500'
      default:
        return 'text-orange-500'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      {...props}
    >
      <div className={`${getToastStyles()} border rounded-xl shadow-lg p-4 min-w-80 max-w-96`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${getIconStyles()}`}>
            <CheckCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
