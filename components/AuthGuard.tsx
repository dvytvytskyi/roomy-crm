'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()

  // Don't apply auth guard to login page
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      // Redirect to login if not authenticated (but not if already on login page)
      window.location.href = '/login'
    }
  }, [isAuthenticated, isLoading, isLoginPage])

  // Always render login page
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Render children if authenticated
  return <>{children}</>
}
