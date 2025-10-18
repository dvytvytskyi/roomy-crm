'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { testApiConnection } from '../../lib/api/test'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@roomy.com')
  const [password, setPassword] = useState('admin123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  
  const { login } = useAuth()

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      const result = await testApiConnection()
      setApiStatus(result.success ? 'connected' : 'error')
    }
    testConnection()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login...')
      const result = await login({ email, password })
      console.log('📋 Login result:', result)
      
      if (result.success && result.data?.user) {
        const userRole = result.data.user.role
        console.log('✅ Login successful, user role:', userRole)
        
        // Role-based redirect logic
        let redirectUrl = '/reservations' // Default for ADMIN
        
        if (userRole === 'AGENT') {
          redirectUrl = '/agent-portal'
          console.log('🔀 Redirecting AGENT to agent portal')
        } else if (userRole === 'OWNER') {
          redirectUrl = '/owner-portal'
          console.log('🔀 Redirecting OWNER to owner portal')
        } else if (userRole === 'ADMIN') {
          redirectUrl = '/reservations'
          console.log('🔀 Redirecting ADMIN to reservations')
        }
        
        // Use window.location.href for full page reload (ensures middleware picks up cookies)
        window.location.href = redirectUrl
        console.log('🚀 Window.location.href called:', redirectUrl)
      } else {
        console.log('❌ Login failed:', result.error)
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      console.error('💥 Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Sign in to Roomy
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Property Management System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
                <p className="text-sm text-slate-600">
                  Admin credentials: admin@roomy.com / admin123
                </p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                apiStatus === 'connected' ? 'bg-green-100 text-green-800' :
                apiStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                API: {apiStatus === 'connected' ? 'Connected' : apiStatus === 'error' ? 'Error' : 'Checking...'}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-orange-600 hover:text-orange-500">
                  Create one here
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
