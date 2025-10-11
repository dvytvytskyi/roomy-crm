'use client'

import { useState, useRef, useEffect } from 'react'
import TopNavigation from '@/components/TopNavigation'
import PropertyCalendar from '@/components/calendar/PropertyCalendar'
import TestGantt from '@/components/calendar/TestGantt'
import { propertyServiceV2 } from '@/lib/api/services/propertyService-v2'
import { reservationServiceAdapted } from '@/lib/api/adapters/apiAdapter'
import { 
  Calendar, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Building2
} from 'lucide-react'

type ViewMode = 'day' | 'week' | 'month'
type GroupBy = 'city' | 'type' | 'owner' | 'agent' | null

export default function CalendarPage() {
  const calendarRef = useRef<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [groupBy, setGroupBy] = useState<GroupBy>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const [propertiesResponse, reservationsResponse] = await Promise.all([
          propertyServiceV2.getAll({ limit: 100 }),
          reservationServiceAdapted.getAll({ limit: 200 })
        ])

        if (!propertiesResponse.success || !reservationsResponse.success) {
          throw new Error('Failed to load data')
        }

        const propertiesData = Array.isArray(propertiesResponse.data?.data) 
          ? propertiesResponse.data.data 
          : Array.isArray(propertiesResponse.data) 
            ? propertiesResponse.data 
            : []
            
        const reservationsData = Array.isArray(reservationsResponse.data?.data)
          ? reservationsResponse.data.data
          : Array.isArray(reservationsResponse.data)
            ? reservationsResponse.data
            : []

        console.log('📊 Calendar Data Loaded:', { properties: propertiesData.length, reservations: reservationsData.length })

        setProperties(propertiesData)
        setReservations(reservationsData)
      } catch (err: any) {
        console.error('Error loading calendar data:', err)
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // View mode controls
  const handleZoomIn = () => {
    if (viewMode === 'month') setViewMode('week')
    else if (viewMode === 'week') setViewMode('day')
    
    if (calendarRef.current) {
      if (viewMode === 'month') calendarRef.current.zoomToWeek?.()
      else if (viewMode === 'week') calendarRef.current.zoomToDay?.()
    }
  }

  const handleZoomOut = () => {
    if (viewMode === 'day') setViewMode('week')
    else if (viewMode === 'week') setViewMode('month')
    
    if (calendarRef.current) {
      if (viewMode === 'day') calendarRef.current.zoomToWeek?.()
      else if (viewMode === 'week') calendarRef.current.zoomToMonth?.()
    }
  }

  const handleToday = () => {
    if (calendarRef.current?.scrollToToday) {
      calendarRef.current.scrollToToday()
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handlePrevious = () => {
    if (calendarRef.current?.gantt) {
      const gantt = calendarRef.current.gantt
      const currentDate = gantt.getState().min_date
      const newDate = gantt.date.add(currentDate, -1, viewMode === 'day' ? 'month' : viewMode === 'week' ? 'month' : 'year')
      gantt.showDate(newDate)
    }
  }

  const handleNext = () => {
    if (calendarRef.current?.gantt) {
      const gantt = calendarRef.current.gantt
      const currentDate = gantt.getState().min_date
      const newDate = gantt.date.add(currentDate, 1, viewMode === 'day' ? 'month' : viewMode === 'week' ? 'month' : 'year')
      gantt.showDate(newDate)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavigation />
      
      {/* Main content - Full width with proper padding */}
      <div className="flex-1 flex flex-col pt-4 overflow-hidden">
        {/* Header with controls */}
        <div className="px-6 mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Calendar</h1>
              <p className="text-gray-600 mt-1">
                Visual booking calendar • {properties.length} properties • {reservations.length} reservations
              </p>
            </div>
            
            {/* Main toolbar */}
            <div className="flex items-center space-x-2">
              {/* Navigation */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                <button 
                  onClick={handlePrevious}
                  className="p-2 hover:bg-gray-50 transition-colors border-r border-gray-300"
                  title="Previous Period"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={handleToday}
                  className="px-4 py-2 hover:bg-gray-50 transition-colors text-sm font-medium"
                  title="Go to Today"
                >
                  <Calendar size={16} className="inline mr-2" />
                  Today
                </button>
                <button 
                  onClick={handleNext}
                  className="p-2 hover:bg-gray-50 transition-colors border-l border-gray-300"
                  title="Next Period"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* View mode selector */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    setViewMode('day')
                    calendarRef.current?.zoomToDay?.()
                  }}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'day' 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => {
                    setViewMode('week')
                    calendarRef.current?.zoomToWeek?.()
                  }}
                  className={`px-3 py-2 text-sm font-medium transition-colors border-x border-gray-300 ${
                    viewMode === 'week' 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => {
                    setViewMode('month')
                    calendarRef.current?.zoomToMonth?.()
                  }}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'month' 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Month
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg p-1">
                <button 
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Zoom Out"
                  disabled={viewMode === 'month'}
                >
                  <ZoomOut size={16} className={viewMode === 'month' ? 'text-gray-300' : 'text-gray-700'} />
                </button>
                <button 
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Zoom In"
                  disabled={viewMode === 'day'}
                >
                  <ZoomIn size={16} className={viewMode === 'day' ? 'text-gray-300' : 'text-gray-700'} />
                </button>
              </div>

              {/* Group by selector */}
              <div className="relative">
                <select
                  value={groupBy || ''}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy || null)}
                  className="pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ paddingRight: '32px' }}
                >
                  <option value="">No Grouping</option>
                  <option value="city">📍 Group by City</option>
                  <option value="type">🏠 Group by Type</option>
                  <option value="owner">👤 Group by Owner</option>
                  <option value="agent">🤝 Group by Agent</option>
                </select>
                <Grid3x3 size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Refresh */}
              <button 
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-6 mb-4 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Building2 size={18} className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Properties:</span>
                <span className="ml-2 font-bold text-gray-900">{properties.length}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Reservations:</span>
                <span className="ml-2 font-bold text-gray-900">{reservations.length}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Active:</span>
                <span className="ml-2 font-bold text-green-600">
                  {reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN').length}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="ml-2 font-bold text-orange-600">
                  {reservations.filter(r => r.status === 'PENDING').length}
                </span>
              </div>
            </div>
            
            {/* Color legend */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 to-orange-500 mr-1"></div>
                <span className="text-gray-600">Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-600 mr-1"></div>
                <span className="text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-blue-600 mr-1"></div>
                <span className="text-gray-600">Checked In</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-400 to-gray-600 mr-1"></div>
                <span className="text-gray-600">Checked Out</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar - Full width and remaining height */}
        <div className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600 text-lg">Loading calendar data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-red-600 font-medium text-lg">Error loading data</p>
                  <p className="text-gray-500 text-sm mt-2">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <TestGantt />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

