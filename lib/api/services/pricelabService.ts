import { apiClient } from '../client'

export interface PriceRecommendation {
  id: string
  propertyId: string
  date: string
  recommendedPrice: number
  currentPrice: number
  marketPrice: number
  confidence: number
  reason: string
  factors: {
    demand: number
    seasonality: number
    events: number
    competition: number
  }
  createdAt: string
  updatedAt: string
}

export interface MarketData {
  location: string
  averagePrice: number
  occupancyRate: number
  demandScore: number
  competitionLevel: number
  seasonalTrends: {
    month: number
    averagePrice: number
    occupancy: number
  }[]
  lastUpdated: string
}

export interface PricingStrategy {
  id: string
  name: string
  description: string
  rules: {
    minPrice: number
    maxPrice: number
    demandMultiplier: number
    seasonalityMultiplier: number
  }
  isActive: boolean
}

export interface OptimizedPrices {
  propertyId: string
  strategy: string
  recommendations: PriceRecommendation[]
  projectedRevenue: number
  projectedOccupancy: number
  generatedAt: string
}

export interface MarketInsights {
  propertyId: string
  marketPosition: 'above' | 'below' | 'at' | 'unknown'
  priceCompetitiveness: number
  demandTrend: 'increasing' | 'decreasing' | 'stable'
  recommendations: string[]
  lastAnalyzed: string
}

export interface PriceLabConfig {
  enabled: boolean
  apiKey: string
  autoUpdate: boolean
  syncFrequency: 'daily' | 'weekly' | 'monthly'
  defaultStrategy: string
}

class PriceLabService {
  private baseUrl = '/api/pricing/pricelab'

  // Get price recommendations for a property
  async getPriceRecommendations(
    propertyId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ success: boolean; data: PriceRecommendation[]; error?: string }> {
    try {
      console.log('💰 PriceLab: Fetching price recommendations for property:', propertyId)
      const response = await apiClient.get(
        `${this.baseUrl}/recommendations`,
        {
          params: { propertyId, startDate, endDate }
        }
      )
      console.log('💰 PriceLab: Recommendations received:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error fetching recommendations:', error)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get market data for a location
  async getMarketData(location: string): Promise<{ success: boolean; data: MarketData; error?: string }> {
    try {
      console.log('📊 PriceLab: Fetching market data for location:', location)
      const response = await apiClient.get(`${this.baseUrl}/market-data`, {
        params: { location }
      })
      console.log('📊 PriceLab: Market data received:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error fetching market data:', error)
      return {
        success: false,
        data: {} as MarketData,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Apply price recommendations
  async applyPriceRecommendations(
    propertyId: string, 
    recommendations: string[]
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      console.log('✅ PriceLab: Applying price recommendations:', recommendations)
      const response = await apiClient.post(`${this.baseUrl}/apply`, {
        propertyId,
        recommendationIds: recommendations
      })
      console.log('✅ PriceLab: Recommendations applied:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error applying recommendations:', error)
      return {
        success: false,
        message: 'Failed to apply recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Sync property data with PriceLab
  async syncPropertyData(propertyId: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      console.log('🔄 PriceLab: Syncing property data:', propertyId)
      const response = await apiClient.post(`${this.baseUrl}/sync`, {
        propertyId
      })
      console.log('🔄 PriceLab: Property synced:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error syncing property:', error)
      return {
        success: false,
        message: 'Failed to sync property',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Optimize prices using a strategy
  async optimizePrices(
    propertyId: string, 
    strategy: string
  ): Promise<{ success: boolean; data: OptimizedPrices; error?: string }> {
    try {
      console.log('🎯 PriceLab: Optimizing prices with strategy:', strategy)
      const response = await apiClient.post(`${this.baseUrl}/optimize`, {
        propertyId,
        strategy
      })
      console.log('🎯 PriceLab: Prices optimized:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error optimizing prices:', error)
      return {
        success: false,
        data: {} as OptimizedPrices,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get current price for a property using real PriceLab API
  async getCurrentPrice(pricelabId: string): Promise<{ success: boolean; data: { currentPrice: number }; error?: string }> {
    try {
      console.log('💰 PriceLab: Getting current price for property:', pricelabId)
      
      // Use real PriceLab API
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      const requestBody = {
        listings: [
          {
            id: pricelabId,
            pms: "guesty",
            dateFrom: today,
            dateTo: today
          }
        ]
      }

      const response = await fetch('https://api.pricelabs.co/v1/listing_prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'tVygp3mB7UbvdGjlRnrVT2m3wU4rBryzvDfQ3Mce'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`PriceLab API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('💰 PriceLab: Raw API response:', data)

      // Extract price from response
      if (data && data.length > 0 && data[0].data && data[0].data.length > 0) {
        const priceData = data[0].data[0]
        if (priceData.price) {
          console.log('💰 PriceLab: Price found:', priceData.price, 'AED')
          return {
            success: true,
            data: { currentPrice: priceData.price }
          }
        }
      }

      return {
        success: false,
        data: { currentPrice: 0 },
        error: 'No price data found in response'
      }
    } catch (error) {
      console.error('❌ PriceLab: Error getting current price:', error)
      return {
        success: false,
        data: { currentPrice: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get market insights for a property
  async getMarketInsights(propertyId: string): Promise<{ success: boolean; data: MarketInsights; error?: string }> {
    try {
      console.log('🔍 PriceLab: Getting market insights for property:', propertyId)
      const response = await apiClient.get(`${this.baseUrl}/insights`, {
        params: { propertyId }
      })
      console.log('🔍 PriceLab: Market insights received:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error getting market insights:', error)
      return {
        success: false,
        data: {} as MarketInsights,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get available pricing strategies
  async getPricingStrategies(): Promise<{ success: boolean; data: PricingStrategy[]; error?: string }> {
    try {
      console.log('📋 PriceLab: Fetching pricing strategies')
      const response = await apiClient.get(`${this.baseUrl}/strategies`)
      console.log('📋 PriceLab: Strategies received:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error fetching strategies:', error)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Update PriceLab configuration
  async updateConfig(config: PriceLabConfig): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      console.log('⚙️ PriceLab: Updating configuration:', config)
      const response = await apiClient.put(`${this.baseUrl}/config`, config)
      console.log('⚙️ PriceLab: Configuration updated:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error updating configuration:', error)
      return {
        success: false,
        message: 'Failed to update configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get PriceLab configuration
  async getConfig(): Promise<{ success: boolean; data: PriceLabConfig; error?: string }> {
    try {
      console.log('⚙️ PriceLab: Fetching configuration')
      const response = await apiClient.get(`${this.baseUrl}/config`)
      console.log('⚙️ PriceLab: Configuration received:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Error fetching configuration:', error)
      return {
        success: false,
        data: {
          enabled: false,
          apiKey: '',
          autoUpdate: false,
          syncFrequency: 'daily',
          defaultStrategy: ''
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Test PriceLab API connection
  async testConnection(): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      console.log('🔌 PriceLab: Testing API connection')
      const response = await apiClient.get(`${this.baseUrl}/test`)
      console.log('🔌 PriceLab: Connection test result:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ PriceLab: Connection test failed:', error)
      return {
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const priceLabService = new PriceLabService()
export default priceLabService
