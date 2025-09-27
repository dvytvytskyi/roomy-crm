'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface GuestsFiltersProps {
  isOpen: boolean
  onClose: () => void
  isSidebar?: boolean
}

export default function GuestsFilters({ isOpen, onClose, isSidebar = false }: GuestsFiltersProps) {
  const [openSections, setOpenSections] = useState({
    nationality: true,
    dateOfBirth: true,
    reservationCount: true,
    unit: true,
    categories: true,
    special: true
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
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
              <label key={nationality} className="flex items-center">
                  <input
                    type="checkbox"
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
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
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">To</label>
                  <input
                    type="date"
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
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                  />
                </div>
                <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Maximum</label>
                  <input
                    type="number"
                    min="0"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="∞"
                  />
              </div>
            </div>
          )}
        </div>

      {/* Unit */}
      <div>
          <button
          onClick={() => toggleSection('unit')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Unit</label>
          {openSections.unit ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
          </button>
        {openSections.unit && (
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {units.map(unit => (
              <label key={unit} className="flex items-center">
                  <input
                    type="checkbox"
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-slate-700">{unit}</span>
                </label>
              ))}
            </div>
          )}
        </div>

      {/* Categories */}
      <div>
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Categories</label>
          {openSections.categories ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.categories && (
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {customCategories.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-slate-700">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Special Filters */}
      <div>
        <button
          onClick={() => toggleSection('special')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Special Filters</label>
          {openSections.special ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.special && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">⭐ Star Guests Only</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-slate-700">👑 Primary Guests Only</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )

  return <FilterContent />
}
