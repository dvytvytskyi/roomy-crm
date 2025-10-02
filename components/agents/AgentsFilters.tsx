'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AgentsFiltersProps {
  filters: any
  onFilterChange: (filters: any) => void
  isSidebar?: boolean
}

export default function AgentsFilters({ filters, onFilterChange, isSidebar = false }: AgentsFiltersProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    status: true,
    nationality: true,
    joinDate: false
  })

  const nationalities = [
    'UAE', 'UK', 'Egypt', 'Australia', 'USA', 'India', 'Pakistan', 'Philippines', 'Canada', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Japan', 'South Korea', 'China', 'Thailand', 'Malaysia', 'Singapore', 'Indonesia', 'Brazil', 'Argentina', 'Mexico', 'South Africa', 'Nigeria', 'Kenya', 'Morocco', 'Algeria', 'Tunisia', 'Lebanon', 'Jordan', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'
  ]

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    onFilterChange({ [field]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      status: '',
      nationality: '',
      joinDateFrom: '',
      joinDateTo: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  if (isSidebar) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto custom-scrollbar">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-900">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          {/* Status */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('status')}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-700 mb-2"
            >
              Status
              {openSections.status ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.status && (
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.status === ''}
                    onChange={() => handleInputChange('status', '')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-600">All</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.status === 'Active'}
                    onChange={() => handleInputChange('status', 'Active')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-600">Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="status"
                    checked={filters.status === 'Inactive'}
                    onChange={() => handleInputChange('status', 'Inactive')}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-600">Inactive</span>
                </label>
              </div>
            )}
          </div>

          {/* Nationality */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('nationality')}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-700 mb-2"
            >
              Nationality
              {openSections.nationality ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.nationality && (
              <div className="space-y-2">
                {nationalities.map(nationality => (
                  <label key={nationality} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.nationality === nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.checked ? nationality : '')}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-slate-600">{nationality}</span>
                  </label>
                ))}
              </div>
            )}
          </div>


          {/* Join Date Range */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('joinDate')}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-700 mb-2"
            >
              Join Date Range
              {openSections.joinDate ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.joinDate && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.joinDateFrom || ''}
                    onChange={(e) => handleInputChange('joinDateFrom', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.joinDateTo || ''}
                    onChange={(e) => handleInputChange('joinDateTo', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Original modal version (for backward compatibility)
  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleInputChange('status', 'Active')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            filters.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => handleInputChange('status', 'Inactive')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            filters.status === 'Inactive'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => handleInputChange('minUnits', '10')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            filters.minUnits === '10'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          10+ Units
        </button>
        <button
          onClick={() => handleInputChange('minPayouts', '30000')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            filters.minPayouts === '30000'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          High Payouts
        </button>
      </div>
    </div>
  )
}
