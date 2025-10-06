'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface OwnersFiltersProps {
  filters: any
  onApplyFilters: (filters: any) => void
  isSidebar?: boolean
}

export default function OwnersFilters({ filters, onApplyFilters, isSidebar = false }: OwnersFiltersProps) {
  const [openSections, setOpenSections] = useState({
    nationality: true,
    status: true
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const nationalities = [
    'Emirati', 'British', 'Canadian', 'French', 'German', 'Italian', 'Spanish',
    'Chinese', 'Japanese', 'Korean', 'Indian', 'Australian', 'Brazilian', 'Egyptian',
    'Saudi Arabian', 'Turkish', 'Greek', 'Russian', 'American', 'Other'
  ]

  // Function to get country flag emoji
  const getCountryFlag = (nationality: string) => {
    const flagMap: { [key: string]: string } = {
      'Emirati': '🇦🇪',
      'British': '🇬🇧',
      'Canadian': '🇨🇦',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Spanish': '🇪🇸',
      'Chinese': '🇨🇳',
      'Japanese': '🇯🇵',
      'Korean': '🇰🇷',
      'Indian': '🇮🇳',
      'Australian': '🇦🇺',
      'Brazilian': '🇧🇷',
      'Egyptian': '🇪🇬',
      'Saudi Arabian': '🇸🇦',
      'Turkish': '🇹🇷',
      'Greek': '🇬🇷',
      'Russian': '🇷🇺',
      'American': '🇺🇸',
      'Other': '🌍'
    }
    return flagMap[nationality] || '🌍'
  }


  const statuses = ['Active', 'VIP', 'Inactive']

  // Debounce function for input fields
  const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null)
  
  const handleFilterChange = (filterType: string, value: any, shouldDebounce = false) => {
    const newFilters = { ...filters }
    
    if (filterType === 'nationality') {
      if (newFilters.nationality.includes(value)) {
        newFilters.nationality = newFilters.nationality.filter((item: string) => item !== value)
      } else {
        newFilters.nationality = [...newFilters.nationality, value]
      }
    } else if (filterType === 'status') {
      if (newFilters.status.includes(value)) {
        newFilters.status = newFilters.status.filter((item: string) => item !== value)
      } else {
        newFilters.status = [...newFilters.status, value]
      }
    } else {
      newFilters[filterType] = value
    }
    
    // Apply filters with debounce for input fields
    if (shouldDebounce && isSidebar) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
      debounceTimeout.current = setTimeout(() => {
        onApplyFilters(newFilters)
      }, 500)
    } else if (isSidebar) {
      onApplyFilters(newFilters)
    }
  }

  const getSelectedCount = (filterType: string) => {
    if (filterType === 'nationality') return filters.nationality.length
    if (filterType === 'status') return filters.status.length
    return 0
  }

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
              <label key={nationality} className="flex items-center hover:bg-gray-50 rounded-lg p-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.nationality.includes(nationality)}
                  onChange={() => handleFilterChange('nationality', nationality)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-lg">{getCountryFlag(nationality)}</span>
                <span className="ml-2 text-sm text-slate-700">{nationality}</span>
              </label>
            ))}
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
            {statuses.map(status => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleFilterChange('status', status)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-slate-700">{status}</span>
              </label>
            ))}
          </div>
        )}
      </div>



      
      {!isSidebar && (
        <div className="flex space-x-3 pt-4">
          <button 
            onClick={() => onApplyFilters(filters)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          >
            Apply Filter
          </button>
          <button 
            onClick={onClearFilters}
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 hover:border-orange-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )

  if (isSidebar) {
    return <FilterContent />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => {/* onClose equivalent */}}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-hidden">
          <FilterContent />
        </div>
      </div>
    </div>
  )
}
