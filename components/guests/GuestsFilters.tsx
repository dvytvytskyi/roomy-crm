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
    nationality: true
  })

  // Local state for filter values
  const [localFilters, setLocalFilters] = useState({
    nationality: [] as string[]
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

  // Handler for array filters (nationality)
  const handleArrayFilterChange = (filterKey: string, value: string, checked: boolean) => {
    const newFilters = { ...localFilters }
    const currentArray = newFilters[filterKey as keyof typeof localFilters] as string[]
    
    if (checked) {
      currentArray.push(value)
    } else {
      const index = currentArray.indexOf(value)
      if (index > -1) {
        currentArray.splice(index, 1)
      }
    }
    
    setLocalFilters(newFilters)
    debouncedApplyFilters(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      nationality: []
    }
    setLocalFilters(clearedFilters)
    if (onClearFilters) {
      onClearFilters()
    }
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }))
  }

  // Initialize local filters from props
  useEffect(() => {
    if (filters) {
      setLocalFilters({
        nationality: filters.nationality || []
      })
    }
  }, [filters])

  const nationalities = [
    'Emirati', 'British', 'Canadian', 'American', 'Indian', 'Pakistani', 'Filipino', 'Egyptian',
    'Saudi Arabian', 'Kuwaiti', 'Qatari', 'Bahraini', 'Omani', 'Jordanian', 'Lebanese', 'Syrian',
    'Iraqi', 'Iranian', 'Turkish', 'Chinese', 'Japanese', 'Korean', 'French', 'German', 'Italian',
    'Spanish', 'Russian', 'Ukrainian', 'Brazilian', 'Argentinian', 'Mexican', 'Australian',
    'South African', 'Nigerian', 'Kenyan', 'Moroccan', 'Algerian', 'Tunisian', 'Other'
  ]

  if (!isOpen) return null

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${isSidebar ? 'w-80' : 'w-full max-w-sm'} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">Filters</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearFilters}
            className="text-sm text-orange-600 hover:text-orange-800 font-medium cursor-pointer"
          >
            Clear All
          </button>
          {!isSidebar && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

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
      </div>
    </div>
  )
}