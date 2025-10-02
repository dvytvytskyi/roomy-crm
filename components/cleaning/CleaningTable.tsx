'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Eye, ChevronUp, ChevronDown, Clock, CheckCircle, Calendar, XCircle } from 'lucide-react'
import { CleaningTask } from '../../lib/api/services/cleaningService'

interface CleaningTableProps {
  tasks: CleaningTask[]
  loading: boolean
  selectedCleaning: number[]
  onSelectionChange: (selected: number[]) => void
}

// Mock data for cleaning tasks
const mockCleaning = [
  {
    id: 1,
    date: '2024-01-15',
    time: '10:00',
    unit: 'Apartment Burj Khalifa 2',
    type: 'Deep Clean',
    contractor: 'Clean Pro Services',
    duration: '3 hours',
    status: 'Completed',
    notes: 'Post-checkout cleaning after guest departure',
    includesLaundry: true,
    laundryCount: 12,
    linenComments: 'Bed sheets and towels need special care due to guest allergies'
  },
  {
    id: 2,
    date: '2024-01-15',
    time: '14:00',
    unit: 'Marina View Studio',
    type: 'Regular Clean',
    contractor: 'Sparkle Clean',
    duration: '2 hours',
    status: 'Scheduled',
    notes: 'Weekly maintenance cleaning',
    includesLaundry: false,
    laundryCount: 0,
    linenComments: ''
  },
  {
    id: 3,
    date: '2024-01-16',
    time: '09:00',
    unit: 'Downtown Loft 2BR',
    type: 'Deep Clean',
    contractor: 'Clean Pro Services',
    duration: '4 hours',
    status: 'Scheduled',
    notes: 'Pre-arrival deep cleaning',
    includesLaundry: true,
    laundryCount: 8,
    linenComments: 'Standard cleaning for new guest arrival'
  },
  {
    id: 4,
    date: '2024-01-16',
    time: '11:30',
    unit: 'JBR Beach Apartment',
    type: 'Regular Clean',
    contractor: 'Sparkle Clean',
    duration: '2.5 hours',
    status: 'Scheduled',
    notes: 'Mid-stay cleaning for long-term guest',
    includesLaundry: false,
    laundryCount: 0,
    linenComments: ''
  },
  {
    id: 5,
    date: '2024-01-14',
    time: '16:00',
    unit: 'Business Bay Office',
    type: 'Office Clean',
    contractor: 'Professional Cleaners',
    duration: '2 hours',
    status: 'Completed',
    notes: 'End of week office cleaning',
    includesLaundry: false,
    laundryCount: 0,
    linenComments: ''
  },
  {
    id: 6,
    date: '2024-01-17',
    time: '08:00',
    unit: 'DIFC Penthouse',
    type: 'Deep Clean',
    contractor: 'Clean Pro Services',
    duration: '5 hours',
    status: 'Scheduled',
    notes: 'Monthly deep cleaning service',
    includesLaundry: true,
    laundryCount: 15,
    linenComments: 'Premium linen service for penthouse'
  },
  {
    id: 7,
    date: '2024-01-15',
    time: '13:00',
    unit: 'JLT Studio',
    type: 'Regular Clean',
    contractor: 'Sparkle Clean',
    duration: '1.5 hours',
    status: 'Scheduled',
    notes: 'Quick turnover cleaning',
    includesLaundry: false,
    laundryCount: 0,
    linenComments: ''
  },
  {
    id: 8,
    date: '2024-01-14',
    time: '15:30',
    unit: 'Arabian Ranches Villa',
    type: 'Deep Clean',
    contractor: 'Professional Cleaners',
    duration: '6 hours',
    status: 'Completed',
    notes: 'Post-event cleaning after party',
    includesLaundry: true,
    laundryCount: 20,
    linenComments: 'Heavy duty cleaning after party event'
  }
]

export default function CleaningTable({ tasks, loading, selectedCleaning, onSelectionChange }: CleaningTableProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<string>('scheduledDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  console.log('CleaningTable props:', { tasks: tasks.length, loading, selectedCleaning, onSelectionChange: !!onSelectionChange })

  // Sort data (filtering is now handled by API)
  const sortedCleaning = [...tasks].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    
    if (sortField === 'scheduledDate') {
      return sortDirection === 'asc' 
        ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
        : new Date(bValue as string).getTime() - new Date(aValue as string).getTime()
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  const handleSelectAll = (checked: boolean) => {
    console.log('Select all:', checked, 'tasks:', sortedCleaning.length)
    if (checked) {
      onSelectionChange(sortedCleaning.map(task => task.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectTask = (taskId: number, checked: boolean) => {
    console.log('Select task:', taskId, checked, 'current selection:', selectedCleaning)
    if (checked) {
      onSelectionChange([...selectedCleaning, taskId])
    } else {
      onSelectionChange(selectedCleaning.filter(id => id !== taskId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />
      case 'Scheduled':
        return <Calendar className="w-4 h-4" />
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading cleaning tasks...</p>
        </div>
      </div>
    )
  }

  if (sortedCleaning.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">No cleaning tasks found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="w-full">
          <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedCleaning.length === sortedCleaning.length && sortedCleaning.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('scheduledDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date & Time</span>
                  {getSortIcon('scheduledDate')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('unit')}
              >
                <div className="flex items-center space-x-1">
                  <span>Unit</span>
                  {getSortIcon('unit')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  {getSortIcon('type')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('cleaner')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cleaner</span>
                  {getSortIcon('cleaner')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Linen
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCleaning.map((task) => (
              <tr 
                key={task.id}
                className={`hover:bg-gray-50 transition-colors ${hoveredRow === task.id ? 'bg-orange-50' : ''}`}
                onMouseEnter={() => setHoveredRow(task.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCleaning.includes(task.id)}
                    onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-sm text-slate-900">
                      {new Date(task.scheduledDate).toLocaleDateString()}
                    </span>
                    <div className="text-xs text-slate-500">{task.scheduledTime}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => router.push(`/cleaning/${task.id}`)}
                    className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline cursor-pointer text-left"
                  >
                    {task.unit}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900 capitalize">{task.type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900">{task.cleaner}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900">{task.duration}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.includesLaundry ? (
                    <span className="text-sm text-slate-900">Yes</span>
                  ) : (
                    <span className="text-sm text-slate-500">No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{task.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className={`flex items-center space-x-2 transition-opacity ${hoveredRow === task.id ? 'opacity-100' : 'opacity-70'}`}>
                    <button
                      onClick={() => router.push(`/cleaning/${task.id}`)}
                      className="text-slate-400 hover:text-orange-600 transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="text-slate-400 hover:text-orange-600 transition-colors"
                      title="Edit Task"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Task"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this cleaning task?')) {
                          console.log('Deleting task:', task.id)
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}
