'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'

interface ClientAuthGuardProps {
  children: React.ReactNode
}

export default function ClientAuthGuard({ children }: ClientAuthGuardProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't apply auth guard to login and register pages
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Auth redirect effect - now handled by middleware, but keep as fallback
  useEffect(() => {
    if (!mounted) return

    console.log('🛡 ClientAuthGuard: Auth state changed', {
      isInitialized,
      isLoading,
      isAuthenticated,
      isAuthPage,
      pathname
    })

    // Middleware handles redirects, this is just a fallback
    if (isInitialized && !isLoading && !isAuthenticated && !isAuthPage) {
      console.log('🔄 ClientAuthGuard: Fallback redirect to login...')
      // Use window.location.href instead of router.push to avoid React DOM issues
      window.location.href = '/login'
    }
  }, [isAuthenticated, isLoading, isInitialized, isAuthPage, pathname, mounted])

  // Don't render anything until mounted
  if (!mounted) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Always render auth pages
  if (isAuthPage) {
    return <>{children}</>
  }

  // Show loading while checking auth
  if (isLoading || !isInitialized) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Block access if not authenticated - PRODUCTION SECURITY
  if (!isAuthenticated && isInitialized && !isAuthPage) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-700 mb-4">
              You need to be authenticated to access this page.
            </p>
            <a 
              href="/login" 
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Render children only if authenticated
  return <>{children}</>
}
