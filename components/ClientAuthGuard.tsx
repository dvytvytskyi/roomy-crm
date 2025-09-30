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

  // Don't apply auth guard to login page
  const isLoginPage = pathname === '/login'

  // Auth redirect effect
  useEffect(() => {
    if (!mounted) return

    console.log('🛡 ClientAuthGuard: Auth state changed', {
      isInitialized,
      isLoading,
      isAuthenticated,
      isLoginPage,
      pathname
    })

    if (isInitialized && !isLoading && !isAuthenticated && !isLoginPage) {
      console.log('🔄 ClientAuthGuard: Redirecting to login...')
      // Use window.location.href instead of router.push to avoid React DOM issues
      window.location.href = '/login'
    }
  }, [isAuthenticated, isLoading, isInitialized, isLoginPage, pathname, mounted])

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

  // Always render login page
  if (isLoginPage) {
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

  // Always render children, but show warning if not authenticated
  return (
    <>
      {!isAuthenticated && isInitialized && !isLoginPage && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> You are not authenticated. Some features may not work properly.
                <a href="/login" className="ml-2 text-yellow-600 underline hover:text-yellow-500">
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  )
}
