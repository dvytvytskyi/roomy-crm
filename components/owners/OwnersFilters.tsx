'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface OwnersFiltersProps {
  filters: any
  onApplyFilters: (filters: any) => void
  onClearFilters: () => void
  isSidebar?: boolean
}

export default function OwnersFilters({ filters, onApplyFilters, onClearFilters, isSidebar = false }: OwnersFiltersProps) {
  const [openSections, setOpenSections] = useState({
    nationality: true,
    units: true,
    status: true,
    dateOfBirth: true,
    phoneNumber: true,
    comments: true
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

  const units = [
    'BK Studio', 'Marina Apt', 'DT Loft', 'Palm Villa',
    'Sky Penthouse', 'BD 1A', 'Beach Villa',
    'City Apt', 'Garden Suite', 'Lux Penthouse', 'Tech Studio'
  ]

  const statuses = ['Active', 'VIP', 'Inactive']

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...filters }
    
    if (filterType === 'nationality') {
      if (newFilters.nationality.includes(value)) {
        newFilters.nationality = newFilters.nationality.filter((item: string) => item !== value)
      } else {
        newFilters.nationality = [...newFilters.nationality, value]
      }
    } else if (filterType === 'units') {
      if (newFilters.units.includes(value)) {
        newFilters.units = newFilters.units.filter((item: string) => item !== value)
      } else {
        newFilters.units = [...newFilters.units, value]
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
    
    onApplyFilters(newFilters)
  }

  const getSelectedCount = (filterType: string) => {
    if (filterType === 'nationality') return filters.nationality.length
    if (filterType === 'units') return filters.units.length
    if (filterType === 'status') return filters.status.length
    if (filterType === 'dateOfBirth') {
      return (filters.dateOfBirth.from ? 1 : 0) + (filters.dateOfBirth.to ? 1 : 0)
    }
    if (filterType === 'phoneNumber') return filters.phoneNumber ? 1 : 0
    if (filterType === 'comments') return filters.comments ? 1 : 0
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
              <label key={nationality} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.nationality.includes(nationality)}
                  onChange={() => handleFilterChange('nationality', nationality)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-slate-700">{nationality}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Units */}
      <div>
        <button
          onClick={() => toggleSection('units')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Units</label>
          {openSections.units ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.units && (
          <div className="space-y-2">
            {units.map(unit => (
              <label key={unit} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.units.includes(unit)}
                  onChange={() => handleFilterChange('units', unit)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-slate-700">{unit}</span>
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
              <label className="block text-xs text-slate-600 mb-1">From</label>
              <input
                type="date"
                value={filters.dateOfBirth.from}
                onChange={(e) => handleFilterChange('dateOfBirth', { ...filters.dateOfBirth, from: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">To</label>
              <input
                type="date"
                value={filters.dateOfBirth.to}
                onChange={(e) => handleFilterChange('dateOfBirth', { ...filters.dateOfBirth, to: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <button
          onClick={() => toggleSection('phoneNumber')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Phone Number</label>
          {openSections.phoneNumber ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.phoneNumber && (
          <div>
            <input
              type="text"
              placeholder="Enter phone number"
              value={filters.phoneNumber}
              onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        )}
      </div>

      {/* Comments */}
      <div>
        <button
          onClick={() => toggleSection('comments')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Comments</label>
          {openSections.comments ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.comments && (
          <div>
            <input
              type="text"
              placeholder="Search comments"
              value={filters.comments}
              onChange={(e) => handleFilterChange('comments', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
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
