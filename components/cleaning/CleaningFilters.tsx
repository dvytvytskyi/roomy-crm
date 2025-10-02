'use client'

import { X, ChevronDown, ChevronUp, Calendar, Clock, Building, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface CleaningFiltersProps {
  isOpen: boolean
  onClose: () => void
  isSidebar?: boolean
  filters?: {
    status?: string[]
    type?: string[]
    cleaner?: string[]
  }
  onFiltersChange?: (filters: {
    status?: string[]
    type?: string[]
    cleaner?: string[]
  }) => void
}

export default function CleaningFilters({ isOpen, onClose, isSidebar = false, filters = {}, onFiltersChange }: CleaningFiltersProps) {
  const [openSections, setOpenSections] = useState({
    cleaningTypes: true,
    cleaners: true,
    status: true
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterChange = (filterType: 'status' | 'type' | 'cleaner', value: string, checked: boolean) => {
    if (!onFiltersChange) return

    const currentFilters = filters[filterType] || []
    let newFilters: string[]

    if (checked) {
      newFilters = [...currentFilters, value]
    } else {
      newFilters = currentFilters.filter(f => f !== value)
    }

    onFiltersChange({
      ...filters,
      [filterType]: newFilters.length > 0 ? newFilters : undefined
    })
  }

  const clearFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({})
    }
  }

  if (!isOpen) return null

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Cleaning Types */}
      <div>
        <button
          onClick={() => toggleSection('cleaningTypes')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Cleaning Types</label>
          {openSections.cleaningTypes ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.cleaningTypes && (
          <div className="space-y-2">
            {['Regular Clean', 'Deep Clean', 'Office Clean', 'Post-Checkout', 'Pre-Arrival', 'Mid-Stay'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.type?.includes(type) || false}
                  onChange={(e) => handleFilterChange('type', type, e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-slate-700">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Cleaners */}
      <div>
        <button
          onClick={() => toggleSection('cleaners')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Cleaners</label>
          {openSections.cleaners ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.cleaners && (
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {['Clean Pro Services', 'Sparkle Clean', 'Professional Cleaners', 'Quick Clean', 'Elite Cleaning'].map((cleaner) => (
              <label key={cleaner} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.cleaner?.includes(cleaner) || false}
                  onChange={(e) => handleFilterChange('cleaner', cleaner, e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-slate-700">{cleaner}</span>
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
            {['Scheduled', 'Completed', 'Cancelled'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status) || false}
                  onChange={(e) => handleFilterChange('status', status, e.target.checked)}
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
            onClick={clearFilters}
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 hover:border-orange-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium"
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
            onClick={onClose}
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