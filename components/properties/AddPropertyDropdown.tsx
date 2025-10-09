'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Link as LinkIcon, FileEdit, ChevronDown } from 'lucide-react'

interface AddPropertyDropdownProps {
  onImportFromAirbnb: () => void
  onCreateManually: () => void
}

export default function AddPropertyDropdown({ onImportFromAirbnb, onCreateManually }: AddPropertyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleImportClick = () => {
    setIsOpen(false)
    onImportFromAirbnb()
  }

  const handleManualClick = () => {
    setIsOpen(false)
    onCreateManually()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer group"
      >
        <Plus size={16} />
        <span>Add New</span>
        <ChevronDown 
          size={16} 
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Import from Airbnb Option */}
          <button
            onClick={handleImportClick}
            className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-start space-x-3 group cursor-pointer"
          >
            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <LinkIcon className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900 mb-1">Import from Airbnb URL</div>
              <div className="text-xs text-slate-500">
                Paste an Airbnb listing URL to import property data automatically
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Create Manually Option */}
          <button
            onClick={handleManualClick}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start space-x-3 group cursor-pointer"
          >
            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
              <FileEdit className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-900 mb-1">Create Manually</div>
              <div className="text-xs text-slate-500">
                Fill in property details manually from scratch
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

