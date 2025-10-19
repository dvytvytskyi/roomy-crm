'use client'

import { useState } from 'react'
import { X, Copy, Check, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface PasswordDisplayModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  password: string
  role?: 'OWNER' | 'AGENT'
}

export default function PasswordDisplayModal({
  isOpen,
  onClose,
  email,
  password,
  role = 'OWNER'
}: PasswordDisplayModalProps) {
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(true)

  if (!isOpen) return null

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyAll = async () => {
    const text = `${role} Account Created\n\nEmail: ${email}\nPassword: ${password}\n\nPlease login at: http://localhost:3000/login`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500 rounded-xl">
              <Check size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{role} Created Successfully!</h2>
              <p className="text-sm text-gray-600">Account credentials generated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-800 mb-1">Important - Save These Credentials</h4>
              <p className="text-xs text-yellow-700">
                This password will only be shown once. Please save it securely and send it to the {role.toLowerCase()} via WhatsApp, Telegram, or email.
              </p>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={email}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(email)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy email"
              >
                <Copy size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated Password
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  className="w-full px-4 py-3 bg-green-50 border-2 border-green-300 rounded-lg text-gray-900 font-mono text-sm font-semibold"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                onClick={handleCopyToClipboard}
                className={`p-3 rounded-lg transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
                title="Copy password"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Password Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Password Characteristics:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 16 characters long</li>
              <li>• Contains uppercase and lowercase letters</li>
              <li>• Contains numbers and special characters</li>
              <li>• Cryptographically secure</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCopyAll}
            className="flex-1 px-6 py-3 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Copy size={16} />
            <span>Copy All Details</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

