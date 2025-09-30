'use client'

import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

interface ReservationsFiltersProps {
  filters?: any
  onApplyFilters?: (filters: any) => void
  onClearFilters?: () => void
  onClose: () => void
  isSidebar?: boolean
}

export default function ReservationsFilters({ filters, onApplyFilters, onClearFilters, onClose, isSidebar = false }: ReservationsFiltersProps) {
  const [openSections, setOpenSections] = useState({
    dateRange: true,
    status: true,
    source: true,
    amountRange: true
  })

  // Debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }, [])

  // Local state for filter values
  const [localFilters, setLocalFilters] = useState({
    dateRange: { from: '', to: '' },
    status: [] as string[],
    source: [] as string[],
    amountRange: { min: '', max: '' },
    guestName: ''
  })

  // Initialize local filters from props
  useEffect(() => {
    if (filters) {
      setLocalFilters(filters)
    }
  }, [filters])

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Filter change handlers
  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    const newFilters = {
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [field]: value
      }
    }
    setLocalFilters(newFilters)
    // Auto-apply filters in sidebar mode
    if (isSidebar && onApplyFilters) {
      onApplyFilters(newFilters)
    }
  }

  const handleArrayFilterChange = (filterType: 'status' | 'source' | 'property', value: string) => {
    console.log(`🔍 ReservationsFilters: Changing ${filterType} filter:`, value)
    const newFilters = {
      ...localFilters,
      [filterType]: localFilters[filterType].includes(value)
        ? localFilters[filterType].filter(item => item !== value)
        : [...localFilters[filterType], value]
    }
    console.log(`🔍 ReservationsFilters: New ${filterType} filters:`, newFilters[filterType])
    setLocalFilters(newFilters)
    // Auto-apply filters in sidebar mode
    if (isSidebar && onApplyFilters) {
      onApplyFilters(newFilters)
    }
  }

  const handleAmountRangeChange = (field: 'min' | 'max', value: string) => {
    const newFilters = {
      ...localFilters,
      amountRange: {
        ...localFilters.amountRange,
        [field]: value
      }
    }
    setLocalFilters(newFilters)
    // Auto-apply filters in sidebar mode with debounce
    if (isSidebar) {
      debouncedApplyFilters(newFilters)
    }
  }

  const handleGuestNameChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      guestName: value
    }
    setLocalFilters(newFilters)
    // Auto-apply filters in sidebar mode with debounce
    if (isSidebar) {
      debouncedApplyFilters(newFilters)
    }
  }

  // Debounced version for input fields
  const debouncedApplyFilters = useCallback(
    debounce((filters: any) => {
      if (onApplyFilters) {
        onApplyFilters(filters)
      }
    }, 300),
    [onApplyFilters, debounce]
  )

  const handleApplyFilters = () => {
    console.log('🔍 ReservationsFilters: Applying filters:', localFilters)
    if (onApplyFilters) {
      onApplyFilters(localFilters)
      console.log('🔍 ReservationsFilters: Filters sent to parent')
    } else {
      console.log('❌ ReservationsFilters: onApplyFilters is not defined')
    }
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      dateRange: { from: '', to: '' },
      status: [],
      source: [],
      amountRange: { min: '', max: '' },
      guestName: ''
    }
    setLocalFilters(clearedFilters)
    if (onClearFilters) {
      onClearFilters()
    }
  }

  if (!isSidebar && !filters) return null

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Date Range */}
      <div>
        <button
          onClick={() => toggleSection('dateRange')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Date Range</label>
          {openSections.dateRange ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.dateRange && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Check-in From</label>
              <input
                type="date"
                value={localFilters.dateRange.from}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Check-in To</label>
              <input
                type="date"
                value={localFilters.dateRange.to}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <button
          onClick={() => toggleSection('status')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Status</label>
          {openSections.status ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.status && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={localFilters.status.includes('confirmed')}
                onChange={() => handleArrayFilterChange('status', 'confirmed')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Confirmed</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={localFilters.status.includes('pending')}
                onChange={() => handleArrayFilterChange('status', 'pending')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Pending</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={localFilters.status.includes('cancelled')}
                onChange={() => handleArrayFilterChange('status', 'cancelled')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Canceled</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={localFilters.status.includes('completed')}
                onChange={() => handleArrayFilterChange('status', 'completed')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Completed</span>
            </label>
          </div>
        )}
      </div>

      {/* Source */}
      <div>
        <button
          onClick={() => toggleSection('source')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Source</label>
          {openSections.source ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.source && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={localFilters.source.includes('airbnb')}
                onChange={() => handleArrayFilterChange('source', 'airbnb')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Airbnb</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={localFilters.source.includes('booking')}
                onChange={() => handleArrayFilterChange('source', 'booking')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Booking.com</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={localFilters.source.includes('vrbo')}
                onChange={() => handleArrayFilterChange('source', 'vrbo')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-xs text-gray-700">VRBO</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={localFilters.source.includes('direct')}
                onChange={() => handleArrayFilterChange('source', 'direct')}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Direct</span>
            </label>
          </div>
        )}
      </div>


      {/* Amount Range */}
      <div>
        <button
          onClick={() => toggleSection('amountRange')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Amount Range</label>
          {openSections.amountRange ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.amountRange && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min Amount</label>
              <input
                type="number"
                placeholder="Min"
                value={localFilters.amountRange.min}
                onChange={(e) => handleAmountRangeChange('min', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max Amount</label>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.amountRange.max}
                onChange={(e) => handleAmountRangeChange('max', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Guest Name Search */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Guest Name</label>
        <input
          type="text"
          placeholder="Search by guest name..."
          value={localFilters.guestName}
          onChange={(e) => handleGuestNameChange(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

    </div>
  )

  return (
    <div className={isSidebar ? "space-y-4" : "bg-white border border-gray-200 rounded-xl p-4"}>
      {!isSidebar && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 cursor-pointer rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <FilterContent />

      {/* Action Buttons */}
      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={handleApplyFilters}
          className="flex-1 px-3 py-2 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer"
        >
          Apply Filters
        </button>
        <button 
          onClick={handleClearFilters}
          className="flex-1 px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}