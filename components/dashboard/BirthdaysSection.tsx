'use client'

import { Users, UserCheck, User, Calendar, Gift } from 'lucide-react'

interface BirthdayDetail {
  id: string
  name: string
  role: string
  birthday: string
}

interface BirthdaysSectionProps {
  today: { count: number; details: BirthdayDetail[] }
  thisWeek: { count: number; details: BirthdayDetail[] }
}

export default function BirthdaysSection({ today, thisWeek }: BirthdaysSectionProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'AGENT': return 'Staff'
      case 'GUEST': return 'Guest'
      case 'OWNER': return 'Owner'
      default: return role
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Birthdays</h2>
      
      <div className="space-y-4">
        {/* Today's Birthdays */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Today</h3>
            <span className="text-sm text-gray-500">{today.count}</span>
          </div>
          
          {today.count > 0 ? (
            <div className="space-y-2">
              {today.details.map((person) => (
                <div key={person.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-500">{getRoleLabel(person.role)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(person.birthday)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">No birthdays today</span>
            </div>
          )}
        </div>

        {/* This Week's Birthdays */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">This Week</h3>
            <span className="text-sm text-gray-500">{thisWeek.count}</span>
          </div>
          
          {thisWeek.count > 0 ? (
            <div className="space-y-2">
              {thisWeek.details.map((person) => (
                <div key={person.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-500">{getRoleLabel(person.role)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(person.birthday)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">No birthdays this week</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
