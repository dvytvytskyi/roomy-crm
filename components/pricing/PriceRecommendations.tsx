'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { priceLabService, PriceRecommendation, MarketData, MarketInsights } from '@/lib/api/services/pricelabService'

interface PriceRecommendationsProps {
  propertyId: string
  propertyName?: string
}

export default function PriceRecommendations({ propertyId, propertyName = 'Property' }: PriceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PriceRecommendation[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [insights, setInsights] = useState<MarketInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  // Load recommendations and market data
  const loadData = async () => {
    setLoading(true)
    try {
      // Load price recommendations
      const recResponse = await priceLabService.getPriceRecommendations(
        propertyId,
        dateRange.startDate,
        dateRange.endDate
      )
      
      if (recResponse.success) {
        setRecommendations(recResponse.data)
      }

      // Load market data
      const marketResponse = await priceLabService.getMarketData('Dubai')
      if (marketResponse.success) {
        setMarketData(marketResponse.data)
      }

      // Load market insights
      const insightsResponse = await priceLabService.getMarketInsights(propertyId)
      if (insightsResponse.success) {
        setInsights(insightsResponse.data)
      }
    } catch (error) {
      console.error('Error loading PriceLab data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [propertyId, dateRange])

  // Apply selected recommendations
  const applyRecommendations = async () => {
    if (selectedRecommendations.length === 0) return

    try {
      const response = await priceLabService.applyPriceRecommendations(propertyId, selectedRecommendations)
      if (response.success) {
        alert(`Successfully applied ${selectedRecommendations.length} recommendations!`)
        setSelectedRecommendations([])
        loadData() // Reload data
      } else {
        alert('Failed to apply recommendations')
      }
    } catch (error) {
      console.error('Error applying recommendations:', error)
      alert('Error applying recommendations')
    }
  }

  // Toggle recommendation selection
  const toggleRecommendation = (id: string) => {
    setSelectedRecommendations(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    )
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // Get trend icon
  const getTrendIcon = (recommendedPrice: number, currentPrice: number) => {
    if (recommendedPrice > currentPrice) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (recommendedPrice < currentPrice) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return <Target className="w-4 h-4 text-blue-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Price Recommendations</h3>
          <p className="text-sm text-slate-600">AI-powered pricing suggestions for {propertyName}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="text-sm border border-slate-200 rounded px-2 py-1"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="text-sm border border-slate-200 rounded px-2 py-1"
            />
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Market Insights */}
      {insights && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">Market Insights</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700">Position:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    insights.marketPosition === 'below' ? 'bg-green-100 text-green-800' :
                    insights.marketPosition === 'above' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {insights.marketPosition.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700">Competitiveness:</span>
                  <span className="text-sm font-medium text-blue-900">{insights.priceCompetitiveness}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700">Demand Trend:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    insights.demandTrend === 'increasing' ? 'bg-green-100 text-green-800' :
                    insights.demandTrend === 'decreasing' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {insights.demandTrend.toUpperCase()}
                  </span>
                </div>
              </div>
              {insights.recommendations.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-blue-900 mb-1">Recommendations:</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {insights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Market Data Summary */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Avg Market Price</span>
            </div>
            <p className="text-xl font-semibold text-slate-900">${marketData.averagePrice}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Occupancy Rate</span>
            </div>
            <p className="text-xl font-semibold text-slate-900">{marketData.occupancyRate}%</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Demand Score</span>
            </div>
            <p className="text-xl font-semibold text-slate-900">{marketData.demandScore}%</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Competition</span>
            </div>
            <p className="text-xl font-semibold text-slate-900">{marketData.competitionLevel}%</p>
          </div>
        </div>
      )}

      {/* Recommendations Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900">Price Recommendations</h4>
            {selectedRecommendations.length > 0 && (
              <button
                onClick={applyRecommendations}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Apply {selectedRecommendations.length} Selected</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No recommendations available for the selected period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRecommendations.length === recommendations.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRecommendations(recommendations.map(r => r.id))
                        } else {
                          setSelectedRecommendations([])
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Recommended
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Market Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRecommendations.includes(rec.id)}
                        onChange={() => toggleRecommendation(rec.id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ${rec.currentPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      ${rec.recommendedPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ${rec.marketPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(rec.recommendedPrice, rec.currentPrice)}
                        <span className={`font-medium ${
                          rec.recommendedPrice > rec.currentPrice ? 'text-green-600' :
                          rec.recommendedPrice < rec.currentPrice ? 'text-red-600' :
                          'text-slate-600'
                        }`}>
                          {rec.recommendedPrice > rec.currentPrice ? '+' : ''}
                          {rec.recommendedPrice - rec.currentPrice}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {rec.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Factors Breakdown */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h4 className="font-medium text-slate-900 mb-4">Pricing Factors Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {recommendations[0]?.factors && Object.entries(recommendations[0].factors).map(([factor, value]) => (
              <div key={factor} className="text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">{value}%</div>
                <div className="text-sm text-slate-600 capitalize">{factor}</div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
