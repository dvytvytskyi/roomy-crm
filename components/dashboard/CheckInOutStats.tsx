'use client'

import { LogIn, LogOut, Activity } from 'lucide-react'

interface CheckInOutStatsProps {
  checkInsToday: number
  checkOutsToday: number
}

export default function CheckInOutStats({ checkInsToday, checkOutsToday }: CheckInOutStatsProps) {
  const totalOperations = checkInsToday + checkOutsToday

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Operations</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Check-ins</p>
              <p className="text-2xl font-semibold text-gray-900">{checkInsToday}</p>
            </div>
            <LogIn className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Check-outs</p>
              <p className="text-2xl font-semibold text-gray-900">{checkOutsToday}</p>
            </div>
            <LogOut className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOperations}</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
