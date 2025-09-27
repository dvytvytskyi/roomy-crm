'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface ChatFiltersProps {
  filters: {
    platform: string
    status: string
    unread: boolean
  }
  onFilterChange: (filters: any) => void
}

export default function ChatFilters({ filters, onFilterChange }: ChatFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    platform: true,
    status: true,
    priority: false
  })

  const platforms = [
    { value: 'all', label: 'All Platforms', icon: '🌐' },
    { value: 'airbnb', label: 'Airbnb', icon: '🏠' },
    { value: 'booking', label: 'Booking.com', icon: '📅' },
    { value: 'vrbo', label: 'Vrbo', icon: '🏖️' },
    { value: 'direct', label: 'Direct', icon: '💬' },
    { value: 'internal', label: 'Internal', icon: '🏢' }
  ]

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'replied', label: 'Replied' }
  ]


  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ]

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handlePlatformChange = (platform: string) => {
    onFilterChange({ ...filters, platform })
  }

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status })
  }


  const handleUnreadToggle = () => {
    onFilterChange({ ...filters, unread: !filters.unread })
  }

  const clearAllFilters = () => {
    onFilterChange({
      platform: 'all',
      status: 'all',
      unread: false
    })
  }

  const hasActiveFilters = filters.platform !== 'all' || 
                          filters.status !== 'all' || 
                          filters.unread

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-700">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-orange-600 hover:text-orange-700 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Platform Filter */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('platform')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-700 mb-2"
          >
            Platform
            {expandedSections.platform ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.platform && (
            <div className="space-y-2">
              {platforms.map((platform) => (
                <label key={platform.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="platform"
                    value={platform.value}
                    checked={filters.platform === platform.value}
                    onChange={() => handlePlatformChange(platform.value)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-600 flex items-center space-x-2">
                    <span>{platform.icon}</span>
                    <span>{platform.label}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('status')}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-slate-700 mb-2"
          >
            Status
            {expandedSections.status ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.status && (
            <div className="space-y-2">
              {statuses.map((status) => (
                <label key={status.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={filters.status === status.value}
                    onChange={() => handleStatusChange(status.value)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-600">{status.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>


        {/* Unread Filter */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.unread}
              onChange={handleUnreadToggle}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-slate-600">Unread Only</span>
          </label>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-6">
            <h4 className="text-xs font-medium text-slate-500 mb-2">Active Filters</h4>
            <div className="space-y-2">
              {filters.platform !== 'all' && (
                <div className="flex items-center justify-between bg-orange-50 px-2 py-1 rounded">
                  <span className="text-xs text-orange-800">
                    Platform: {platforms.find(p => p.value === filters.platform)?.label}
                  </span>
                  <button
                    onClick={() => handlePlatformChange('all')}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {filters.status !== 'all' && (
                <div className="flex items-center justify-between bg-orange-50 px-2 py-1 rounded">
                  <span className="text-xs text-orange-800">
                    Status: {statuses.find(s => s.value === filters.status)?.label}
                  </span>
                  <button
                    onClick={() => handleStatusChange('all')}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {filters.unread && (
                <div className="flex items-center justify-between bg-orange-50 px-2 py-1 rounded">
                  <span className="text-xs text-orange-800">Unread Only</span>
                  <button
                    onClick={handleUnreadToggle}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
