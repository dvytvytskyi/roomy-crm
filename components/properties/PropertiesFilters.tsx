'use client'

import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface PropertiesFiltersProps {
  isOpen: boolean
  onClose: () => void
  isSidebar?: boolean
  filters?: {
    propertyTypes: string[]
    areas: string[]
    occupancyRates: string[]
    maxGuests: string[]
    bedrooms: string[]
  }
  onFiltersChange?: (filters: {
    propertyTypes: string[]
    areas: string[]
    occupancyRates: string[]
    maxGuests: string[]
    bedrooms: string[]
  }) => void
}

export default function PropertiesFilters({ isOpen, onClose, isSidebar = false, filters, onFiltersChange }: PropertiesFiltersProps) {
  const [openSections, setOpenSections] = useState({
    propertyType: true,
    area: true,
    occupancy: true,
    maxGuests: true,
    bedrooms: true
  })

  // Local state for filters
  const [localFilters, setLocalFilters] = useState({
    propertyTypes: filters?.propertyTypes || [],
    areas: filters?.areas || [],
    occupancyRates: filters?.occupancyRates || [],
    maxGuests: filters?.maxGuests || [],
    bedrooms: filters?.bedrooms || []
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterChange = (filterType: keyof typeof localFilters, value: string) => {
    const newFilters = { ...localFilters }
    const currentValues = newFilters[filterType]
    
    if (currentValues.includes(value)) {
      newFilters[filterType] = currentValues.filter(v => v !== value)
    } else {
      newFilters[filterType] = [...currentValues, value]
    }
    
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      propertyTypes: [],
      areas: [],
      occupancyRates: [],
      maxGuests: [],
      bedrooms: []
    }
    setLocalFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  if (!isOpen) return null

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Property Type */}
      <div>
        <button
          onClick={() => toggleSection('propertyType')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Property Type</label>
          {openSections.propertyType ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.propertyType && (
          <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.propertyTypes.includes('apartment')}
              onChange={() => handleFilterChange('propertyTypes', 'apartment')}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">Apartment</span>
            </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.propertyTypes.includes('villa')}
              onChange={() => handleFilterChange('propertyTypes', 'villa')}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">Villa</span>
            </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.propertyTypes.includes('penthouse')}
              onChange={() => handleFilterChange('propertyTypes', 'penthouse')}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">Penthouse</span>
            </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.propertyTypes.includes('studio')}
              onChange={() => handleFilterChange('propertyTypes', 'studio')}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">Studio</span>
            </label>
          </div>
        )}
      </div>





      {/* Area */}
      <div>
        <button
          onClick={() => toggleSection('area')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Area</label>
          {openSections.area ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.area && (
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Barari</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Barsha & Barsha Heights</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Bastakiya (Al Fahidi)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Furjan</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Garhoud</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Habtoor City</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Nahda</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Qusais</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Quoz</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Sabkha</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Satwa</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Al Shindagha</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Arabian Ranches</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Arabian Ranches III</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Bluewaters Island</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Bur Dubai</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Business Bay</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Culture Village</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">DAMAC Hills</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Deira</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Discovery Gardens</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Downtown Dubai</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Dubai Creek Harbour</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Dubai Hills Estate</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Dubai Marina</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Emirates Hills</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Emirates Living</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Emaar Beachfront</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Green Community</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Jumeirah</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Jumeirah Beach Residence (JBR)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Jumeirah Lake Towers (JLT)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Jumeirah Village Circle (JVC)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Mirdif</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Palm Jebel Ali</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Palm Jumeirah</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Sports City</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">The Meadows</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">The Springs</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">The Valley</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Tilal Al Ghaf</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Town Square</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Umm Ramool</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Victory Heights</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">Warsan</span>
            </label>
          </div>
        )}
      </div>



      {/* Occupancy Range */}
      <div>
        <button
          onClick={() => toggleSection('occupancy')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Occupancy Rate</label>
          {openSections.occupancy ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.occupancy && (
          <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">High (80%+)</span>
          </label>
          <label className="flex items-center">
              <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
            <span className="ml-2 text-sm text-slate-700">Medium (50-80%)</span>
          </label>
          <label className="flex items-center">
              <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
            <span className="ml-2 text-sm text-slate-700">Low (0-50%)</span>
          </label>
          </div>
        )}
      </div>

      {/* Max Guests */}
      <div>
        <button
          onClick={() => toggleSection('maxGuests')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Max Guests</label>
          {openSections.maxGuests ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.maxGuests && (
          <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">1-2 guests</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">3-4 guests</span>
            </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">5-6 guests</span>
            </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">7+ guests</span>
            </label>
          </div>
        )}
      </div>

      {/* Bedrooms */}
      <div>
        <button
          onClick={() => toggleSection('bedrooms')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Bedrooms</label>
          {openSections.bedrooms ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.bedrooms && (
          <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">Studio (0)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">1 bedroom</span>
            </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">2 bedrooms</span>
            </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">3 bedrooms</span>
            </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">4+ bedrooms</span>
            </label>
          </div>
        )}
      </div>

      {!isSidebar && (
        <div className="flex space-x-3 pt-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Apply Filter
          </button>
          <button 
            onClick={clearAllFilters}
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
