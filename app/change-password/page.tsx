'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { authServiceV2 } from '@/lib/api/services/authService-v2'
import { useAuth } from '@/hooks/useAuth'
import ClientAuthGuard from '@/components/ClientAuthGuard'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 6) errors.push('At least 6 characters')
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if (!/[0-9]/.test(password)) errors.push('One number')
    return errors
  }

  const passwordErrors = newPassword ? validatePassword(newPassword) : []
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (passwordErrors.length > 0) {
      setError('New password does not meet requirements')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authServiceV2.changePassword(currentPassword, newPassword)
      
      if (response.success) {
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        // Redirect after 3 seconds
        setTimeout(() => {
          if (profile?.role === 'OWNER') {
            router.push('/owner-portal')
          } else if (profile?.role === 'AGENT') {
            router.push('/agent-portal')
          } else {
            router.push('/dashboard')
          }
        }, 3000)
      } else {
        setError(response.message || 'Failed to change password')
      }
    } catch (err: any) {
      console.error('Change password error:', err)
      setError(err.message || 'An error occurred while changing password')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (profile?.role === 'OWNER') {
      router.push('/owner-portal')
    } else if (profile?.role === 'AGENT') {
      router.push('/agent-portal')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <ClientAuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Portal</span>
          </button>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <Lock size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Change Password</h1>
                  <p className="text-orange-100 text-sm">Update your account security</p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-800 mb-1">Password Changed Successfully!</h4>
                  <p className="text-xs text-green-700">
                    Your password has been updated. Redirecting you back to the portal...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 mb-1">Error</h4>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        newPassword && passwordErrors.length > 0 ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      {passwordErrors.map((err, index) => (
                        <p key={index} className="text-xs text-red-600 flex items-center space-x-1">
                          <span>•</span>
                          <span>{err}</span>
                        </p>
                      ))}
                      {passwordErrors.length === 0 && (
                        <p className="text-xs text-green-600 flex items-center space-x-1">
                          <CheckCircle size={14} />
                          <span>Password meets all requirements</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {confirmPassword && (
                    <div className="mt-2">
                      {passwordsMatch ? (
                        <p className="text-xs text-green-600 flex items-center space-x-1">
                          <CheckCircle size={14} />
                          <span>Passwords match</span>
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 flex items-center space-x-1">
                          <AlertCircle size={14} />
                          <span>Passwords do not match</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || passwordErrors.length > 0 || !passwordsMatch}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                    loading || passwordErrors.length > 0 || !passwordsMatch
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                  }`}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-white bg-opacity-60 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Password Security Tips</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Use a mix of uppercase, lowercase, numbers, and special characters</li>
              <li>• Avoid using personal information or common words</li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Change your password regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </ClientAuthGuard>
  )
}

