import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register']

// Define protected routes that require authentication
const protectedRoutes = [
  '/',
  '/properties',
  '/reservations', 
  '/owners',
  '/agents',
  '/cleaning',
  '/maintenance',
  '/finances',
  '/analytics',
  '/chat',
  '/scheduler',
  '/scheduler-minimal',
  '/settings',
  '/guests'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname)

  // Skip middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Skip middleware for static files and API routes (handled by backend)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // For protected routes, redirect to login if no auth
  if (isProtectedRoute) {
    // Check for auth token in cookies or headers
    const authToken = request.cookies.get('accessToken')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '')

    // If no auth token, redirect to login
    if (!authToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}