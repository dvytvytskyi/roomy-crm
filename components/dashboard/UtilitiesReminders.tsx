'use client'

import { AlertCircle, CheckCircle } from 'lucide-react'

interface UtilitiesRemindersProps {
  utilitiesReminders: number
}

export default function UtilitiesReminders({ utilitiesReminders }: UtilitiesRemindersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Utilities</h2>
      
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{utilitiesReminders}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {utilitiesReminders > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Due:</h3>
            <div className="space-y-2">
              <div className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Electricity - Unit 1</span>
              </div>
              <div className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Water - Unit 2</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
            <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">All payments up to date</span>
          </div>
        )}
      </div>
    </div>
  )
}
