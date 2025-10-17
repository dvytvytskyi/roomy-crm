'use client'

import { Home, Building, Percent } from 'lucide-react'

interface UnitStatsProps {
  totalUnits: number
  emptyUnits: number
  occupancyRate: number
}

export default function UnitStats({ totalUnits, emptyUnits, occupancyRate }: UnitStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Units</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-2xl font-semibold text-gray-900">{totalUnits}</p>
            </div>
            <Home className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Empty Units</p>
              <p className="text-2xl font-semibold text-gray-900">{emptyUnits}</p>
              <p className="text-xs text-gray-500">7+ nights</p>
            </div>
            <Building className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{occupancyRate}%</p>
            </div>
            <Percent className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
