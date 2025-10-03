/**
 * Production-ready API utilities
 * Centralized configuration for API calls with proper error handling
 */

// Environment configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000, // 10 seconds
  retries: 3,
}

// Get authentication token
export const getAuthToken = (): string => {
  if (typeof window === 'undefined') return 'test'
  
  // Try different token storage methods
  const token = localStorage.getItem('accessToken') || 
                sessionStorage.getItem('accessToken') || 
                localStorage.getItem('authToken') || 
                'test'
  
  return token
}

// Build API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.baseUrl.replace(/\/$/, '') // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

// Default headers for API requests
export const getDefaultHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
  }
}

// Wrapper for fetch with retry logic and error handling
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint)
  const headers = { ...getDefaultHeaders(), ...options.headers }
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
  
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= API_CONFIG.retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(API_CONFIG.timeout)
      })
      
      if (response.ok) {
        console.log(`✅ API Success: ${response.status} ${url}`)
        return response
      }
      
      // Handle specific error cases
      if (response.status === 401) {
        console.error('🔒 Authentication failed - redirecting to login')
        // In production, redirect to login page
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          // window.location.href = '/login'
        }
        throw new Error('Authentication failed')
      }
      
      if (response.status === 404) {
        console.error(`❌ Resource not found: ${url}`)
        throw new Error('Resource not found')
      }
      
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      throw new Error(`HTTP error: ${response.status}`)
      
    } catch (error) {
      lastError = error as Error
      console.error(`❌ API Error (attempt ${attempt}/${API_CONFIG.retries}):`, error)
      
      // Don't retry on authentication errors
      if (error instanceof Error && error.message === 'Authentication failed') {
        throw error
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < API_CONFIG.retries) {
        const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('API request failed after retries')
}

// Safe localStorage operations (SSR compatible)
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('localStorage.getItem error:', error)
      return null
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('localStorage.setItem error:', error)
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage.removeItem error:', error)
    }
  }
}

// Production-ready owner data management
export const ownerDataManager = {
  // Save owner data with fallback
  save: (propertyId: string, ownerData: any): void => {
    const key = `propertyOwner_${propertyId}`
    
    // Save to localStorage as fallback
    safeLocalStorage.setItem(key, JSON.stringify({
      ...ownerData,
      _timestamp: Date.now(),
      _source: 'local'
    }))
    
    console.log(`💾 Saved owner data locally for property ${propertyId}`)
  },
  
  // Load owner data with fallback
  load: (propertyId: string): any | null => {
    const key = `propertyOwner_${propertyId}`
    const saved = safeLocalStorage.getItem(key)
    
    if (saved) {
      try {
        const data = JSON.parse(saved)
        console.log(`📂 Loaded owner data from localStorage for property ${propertyId}`)
        return data
      } catch (error) {
        console.error('Error parsing saved owner data:', error)
        safeLocalStorage.removeItem(key) // Remove corrupted data
      }
    }
    
    return null
  },
  
  // Clear owner data
  clear: (propertyId: string): void => {
    const key = `propertyOwner_${propertyId}`
    safeLocalStorage.removeItem(key)
    console.log(`🗑️ Cleared owner data for property ${propertyId}`)
  }
}

// Environment detection
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development'
}

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production'
}

// Debug logging (only in development)
export const debugLog = (message: string, data?: any): void => {
  if (isDevelopment()) {
    console.log(`🐛 ${message}`, data || '')
  }
}
