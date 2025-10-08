import { useState, useEffect, useCallback } from 'react'
import { propertyServiceAdapted } from '../../../../lib/api/adapters/apiAdapter'
import { ownerDataManager, debugLog } from '../../../../lib/api/production-utils'
import { priceLabService } from '../../../../lib/api/services/pricelabService'

export interface PropertyData {
  id: string
  name: string
  nickname: string
  address: string
  type: string
  city: string
  country: string
  capacity: number
  bedrooms: number
  bathrooms: number
  pricePerNight: number
  typeOfUnit: string
  description: string
  isActive: boolean
  photos: any[]
  documents: any[]
  expenses: any[]
  owner?: any
  agent?: any
  financialData?: any
  incomeDistribution?: any
  pricelabId?: string | null
  currentPrice?: number | null
  priceLoading?: boolean
  createdAt: string
  updatedAt: string
  isLoading: boolean
  error: string | null
}

export function usePropertyData(propertyId: string) {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [owner, setOwner] = useState<any>(null)

  // Fetch property data
  const fetchPropertyData = useCallback(async () => {
    if (!propertyId) return

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('[usePropertyData] Fetching property:', propertyId)
      
      const response = await propertyServiceAdapted.getById(propertyId)
      
      if (response && response.data) {
        console.log('[usePropertyData] Property data loaded:', response.data)
        
        setPropertyData({
          ...response.data,
          isLoading: false,
          error: null
        })

        // Fetch owner data if ownerId exists
        if (response.data.ownerId) {
          await fetchOwnerData(response.data.ownerId)
        }
      }
    } catch (err: any) {
      console.error('[usePropertyData] Error loading property:', err)
      setError(err.message || 'Failed to load property')
    } finally {
      setIsLoading(false)
    }
  }, [propertyId])

  // Fetch owner data
  const fetchOwnerData = useCallback(async (ownerId: string) => {
    if (!ownerId) return

    try {
      console.log('[usePropertyData] Fetching owner:', ownerId)
      
      // Clear any cached owner data
      ownerDataManager.clear()
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2'}/users/${ownerId}`
      const token = localStorage.getItem('token')
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch owner: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[usePropertyData] Owner data loaded:', data)
      
      if (data.data) {
        setOwner(data.data)
      }
    } catch (err: any) {
      console.error('[usePropertyData] Error loading owner:', err)
    }
  }, [])

  // Update property data
  const updateProperty = useCallback(async (updates: Partial<PropertyData>): Promise<boolean> => {
    if (!propertyId) return false

    try {
      console.log('[usePropertyData] Updating property:', updates)

      // Handle owner update
      if (updates.owner || 'ownerId' in updates) {
        const ownerId = (updates as any).ownerId || updates.owner?.id
        
        if (ownerId) {
          const apiUrl = `${process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2'}/properties/${propertyId}`
          const token = localStorage.getItem('token')
          
          const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ownerId })
          })

          if (!response.ok) {
            throw new Error('Failed to update owner')
          }

          // Refresh owner data
          await fetchOwnerData(ownerId)
          
          return true
        }
      }

      // Handle general property updates
      const response = await propertyServiceAdapted.update(propertyId, updates)
      
      if (response && response.data) {
        console.log('[usePropertyData] Property updated successfully')
        
        // Update local state
        setPropertyData(prev => prev ? {
          ...prev,
          ...response.data,
          isLoading: false,
          error: null
        } : null)
        
        return true
      }
      
      return false
    } catch (err: any) {
      console.error('[usePropertyData] Error updating property:', err)
      setError(err.message || 'Failed to update property')
      return false
    }
  }, [propertyId, fetchOwnerData])

  // Load current price from PriceLabs
  const loadCurrentPrice = useCallback(async () => {
    if (!propertyData?.pricelabId) {
      console.log('[usePropertyData] No PriceLabs ID found')
      return
    }

    try {
      console.log('[usePropertyData] Loading current price from PriceLabs:', propertyData.pricelabId)
      
      setPropertyData(prev => prev ? { ...prev, priceLoading: true } : null)

      const priceData = await priceLabService.getCurrentPrice(propertyData.pricelabId)
      
      if (priceData && priceData.price) {
        console.log('[usePropertyData] Current price loaded:', priceData.price)
        setPropertyData(prev => prev ? {
          ...prev,
          currentPrice: priceData.price,
          priceLoading: false
        } : null)
      } else {
        console.log('[usePropertyData] No price data returned')
        setPropertyData(prev => prev ? { ...prev, priceLoading: false } : null)
      }
    } catch (err: any) {
      console.error('[usePropertyData] Error loading current price:', err)
      setPropertyData(prev => prev ? { ...prev, priceLoading: false } : null)
    }
  }, [propertyData?.pricelabId])

  // Load data on mount
  useEffect(() => {
    fetchPropertyData()
  }, [fetchPropertyData])

  // Load current price when property data is loaded
  useEffect(() => {
    if (propertyData && propertyData.pricelabId && !propertyData.currentPrice) {
      loadCurrentPrice()
    }
  }, [propertyData?.pricelabId, loadCurrentPrice])

  return {
    propertyData,
    owner,
    isLoading,
    error,
    updateProperty,
    refreshData: fetchPropertyData,
    loadCurrentPrice
  }
}

