'use client'

import { Wrench } from 'lucide-react'

interface MaintenanceStatsProps {
  maintenanceInProgress: number
}

export default function MaintenanceStats({ maintenanceInProgress }: MaintenanceStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Maintenance</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-semibold text-gray-900">{maintenanceInProgress}</p>
          </div>
          <Wrench className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
