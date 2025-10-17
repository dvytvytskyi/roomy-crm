'use client'

import { AlertTriangle, CheckCircle } from 'lucide-react'

interface DTCMAlertsProps {
  dtcmPermitsExpiring: number
  expiringUnits: string[]
}

export default function DTCMAlerts({ dtcmPermitsExpiring, expiringUnits }: DTCMAlertsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">DTCM Permits</h2>
      
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring within 7 days</p>
              <p className="text-2xl font-semibold text-gray-900">{dtcmPermitsExpiring}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {dtcmPermitsExpiring > 0 && expiringUnits.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Units:</h3>
            {expiringUnits.map((unit, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">{unit}</span>
              </div>
            ))}
          </div>
        )}

        {dtcmPermitsExpiring === 0 && (
          <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
            <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">All permits up to date</span>
          </div>
        )}
      </div>
    </div>
  )
}
