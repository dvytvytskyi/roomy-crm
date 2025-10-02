'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface GuestsFiltersProps {
  isOpen: boolean
  onClose: () => void
  isSidebar?: boolean
  filters?: any
  onApplyFilters?: (filters: any) => void
  onClearFilters?: () => void
}

export default function GuestsFilters({ isOpen, onClose, isSidebar = false, filters, onApplyFilters, onClearFilters }: GuestsFiltersProps) {
  const [openSections, setOpenSections] = useState({
    nationality: true,
    dateOfBirth: true,
    reservationCount: true,
    propertyList: true
  })

  // Local state for filter values
  const [localFilters, setLocalFilters] = useState({
    nationality: [] as string[],
    dateOfBirth: { from: '', to: '' },
    reservationCount: { min: '', max: '' },
    unit: [] as string[]
  })

  // Debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }, [])

  // Debounced version for input fields
  const debouncedApplyFilters = useCallback(
    (filters: any) => {
      const timeoutId = setTimeout(() => {
        if (onApplyFilters) {
          onApplyFilters(filters)
        }
      }, 500)
      return () => clearTimeout(timeoutId)
    },
    [onApplyFilters]
  )

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Handler for array filters (nationality, unit, categories)
  const handleArrayFilterChange = (filterKey: string, value: string, checked: boolean) => {
    const newFilters = { ...localFilters }
    const currentArray = newFilters[filterKey as keyof typeof localFilters] as string[]
    
    if (checked) {
      newFilters[filterKey as keyof typeof localFilters] = [...currentArray, value] as any
    } else {
      newFilters[filterKey as keyof typeof localFilters] = currentArray.filter(item => item !== value) as any
    }
    
    setLocalFilters(newFilters)
    
    if (isSidebar && onApplyFilters) {
      onApplyFilters(newFilters)
    }
  }

  // Handler for date range filter
  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    const newFilters = {
      ...localFilters,
      dateOfBirth: {
        ...localFilters.dateOfBirth,
        [type]: value
      }
    }
    setLocalFilters(newFilters)
    
    if (isSidebar && onApplyFilters) {
      debouncedApplyFilters(newFilters)
    }
  }

  // Handler for reservation count filter
  const handleReservationCountChange = (type: 'min' | 'max', value: string) => {
    const newFilters = {
      ...localFilters,
      reservationCount: {
        ...localFilters.reservationCount,
        [type]: value
      }
    }
    setLocalFilters(newFilters)
    
    if (isSidebar && onApplyFilters) {
      debouncedApplyFilters(newFilters)
    }
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      nationality: [],
      dateOfBirth: { from: '', to: '' },
      reservationCount: { min: '', max: '' },
      unit: []
    }
    setLocalFilters(clearedFilters)
    if (onClearFilters) {
      onClearFilters()
    }
  }

  if (!isOpen) return null

  const nationalities = [
    'American', 'British', 'Canadian', 'French', 'German', 'Italian', 'Spanish', 
    'Chinese', 'Japanese', 'Korean', 'Indian', 'Australian', 'Brazilian', 'Mexican',
    'Russian', 'Egyptian', 'Saudi Arabian', 'Emirati', 'Turkish', 'Greek'
  ]

  const units = [
    'Apartment Burj Khalifa 1A',
    'Apartment Marina 2B', 
    'Studio Downtown 3C',
    'Apartment Business 4D',
    'Penthouse Skyline 5A'
  ]

  const customCategories = [
    'Star Guest',
    'VIP',
    'Family Guest',
    'Business Guest',
    'Corporate Guest',
    'Loyalty Program',
    'Frequent Visitor',
    'Group Leader',
    'Long-term Guest'
  ]

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Nationality */}
      <div>
        <button
          onClick={() => toggleSection('nationality')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Nationality</label>
          {openSections.nationality ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.nationality && (
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {nationalities.map(nationality => (
              <label key={nationality} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.nationality.includes(nationality)}
                    onChange={(e) => handleArrayFilterChange('nationality', nationality, e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-700">{nationality}</span>
                </label>
              ))}
            </div>
          )}
        </div>

      {/* Date of Birth */}
      <div>
          <button
          onClick={() => toggleSection('dateOfBirth')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Date of Birth</label>
          {openSections.dateOfBirth ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
          </button>
        {openSections.dateOfBirth && (
          <div className="space-y-2">
                <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">From</label>
                  <input
                    type="date"
                    value={localFilters.dateOfBirth.from}
                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">To</label>
                  <input
                    type="date"
                    value={localFilters.dateOfBirth.to}
                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
              </div>
            </div>
          )}
        </div>

      {/* Reservation Count */}
      <div>
          <button
          onClick={() => toggleSection('reservationCount')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Reservation Count</label>
          {openSections.reservationCount ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
          </button>
        {openSections.reservationCount && (
          <div className="space-y-2">
                <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Minimum</label>
                  <input
                    type="number"
                    min="0"
                    value={localFilters.reservationCount.min}
                    onChange={(e) => handleReservationCountChange('min', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                  />
                </div>
                <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Maximum</label>
                  <input
                    type="number"
                    min="0"
                    value={localFilters.reservationCount.max}
                    onChange={(e) => handleReservationCountChange('max', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="∞"
                  />
              </div>
            </div>
          )}
        </div>

      {/* Property List */}
      <div>
          <button
          onClick={() => toggleSection('propertyList')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Property List</label>
          {openSections.propertyList ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
          </button>
        {openSections.propertyList && (
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {units.map(unit => (
              <label key={unit} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.unit.includes(unit)}
                    onChange={(e) => handleArrayFilterChange('unit', unit, e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-700">{unit}</span>
                </label>
              ))}
            </div>
          )}
        </div>

      {/* Clear All Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleClearFilters}
          className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )

  return <FilterContent />
}
