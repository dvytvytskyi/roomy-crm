'use client'

import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

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
    property: true,
    amountRange: true
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
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
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Check-in To</label>
              <input
                type="date"
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
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Confirmed</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Pending</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Canceled</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
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
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Airbnb</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Booking.com</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">VRBO</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Direct</span>
            </label>
          </div>
        )}
      </div>

      {/* Property */}
      <div>
        <button
          onClick={() => toggleSection('property')}
          className="flex items-center justify-between w-full text-left mb-2"
        >
          <label className="text-sm font-medium text-slate-700">Property/Unit</label>
          {openSections.property ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {openSections.property && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Apartment Burj Khalifa 1A</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Apartment Burj Khalifa 1B</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Villa Dubai Marina 1</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Villa Dubai Marina 2</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Studio Downtown 1</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Beach Villa Palm Jumeirah 1</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <span className="ml-2 text-xs text-gray-700">Beach Villa Palm Jumeirah 2</span>
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
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max Amount</label>
              <input
                type="number"
                placeholder="Max"
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
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
      {!isSidebar && (
        <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={() => onApplyFilters && onApplyFilters(filters)}
            className="flex-1 px-3 py-2 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer"
          >
            Apply Filters
          </button>
          <button 
            onClick={() => onClearFilters && onClearFilters()}
            className="flex-1 px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}