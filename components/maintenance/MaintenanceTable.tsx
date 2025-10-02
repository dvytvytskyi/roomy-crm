'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Edit, Trash2, Wrench, Calendar, User, Building, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react'

interface MaintenanceTask {
  id: number
  title: string
  unit: string
  unitId: string
  technician: string
  technicianId: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold'
  priority: 'Low' | 'Normal' | 'High' | 'Urgent'
  type: 'Plumbing' | 'Electrical' | 'HVAC' | 'General' | 'Emergency' | 'Preventive'
  scheduledDate: string
  estimatedDuration: string
  description: string
  cost?: number
  notes?: string
}

interface MaintenanceTableProps {
  tasks: MaintenanceTask[]
  loading: boolean
  selectedMaintenance: number[]
  onSelectionChange: (selected: number[]) => void
}

export default function MaintenanceTable({ tasks, loading, selectedMaintenance, onSelectionChange }: MaintenanceTableProps) {
  const router = useRouter()
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [sortField, setSortField] = useState<keyof MaintenanceTask>('scheduledDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(tasks.map(task => task.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedMaintenance, taskId])
    } else {
      onSelectionChange(selectedMaintenance.filter(id => id !== taskId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      case 'On Hold':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Normal':
        return 'bg-blue-100 text-blue-800'
      case 'Low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Plumbing':
        return <Wrench className="w-4 h-4 text-blue-500" />
      case 'Electrical':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'HVAC':
        return <Building className="w-4 h-4 text-green-500" />
      default:
        return <Wrench className="w-4 h-4 text-gray-500" />
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field: keyof MaintenanceTask) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof MaintenanceTask) => {
    if (sortField !== field) {
      return <ChevronUp size={14} className="text-gray-300" />
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="text-orange-600" />
      : <ChevronDown size={14} className="text-orange-600" />
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedMaintenance.length === tasks.length && tasks.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center space-x-1">
                <span>Task</span>
                {getSortIcon('title')}
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
              onClick={() => handleSort('technician')}
            >
              <div className="flex items-center space-x-1">
                <span>Technician</span>
                {getSortIcon('technician')}
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
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {getSortIcon('status')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('scheduledDate')}
            >
              <div className="flex items-center space-x-1">
                <span>Scheduled</span>
                {getSortIcon('scheduledDate')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
              onClick={() => handleSort('priority')}
            >
              <div className="flex items-center space-x-1">
                <span>Priority</span>
                {getSortIcon('priority')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-slate-500">Loading maintenance tasks...</span>
                </div>
              </td>
            </tr>
          ) : sortedTasks.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center">
                <div className="text-slate-500">No maintenance tasks found</div>
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
            <tr 
              key={task.id}
              className={`hover:bg-gray-50 transition-colors ${hoveredRow === task.id ? 'bg-orange-50' : ''}`}
              onMouseEnter={() => setHoveredRow(task.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedMaintenance.includes(task.id)}
                  onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getTypeIcon(task.type)}
                  </div>
                  <div>
                    <button
                      onClick={() => router.push(`/maintenance/${task.id}`)}
                      className="text-sm font-medium text-slate-900 hover:text-orange-600 hover:underline cursor-pointer text-left"
                    >
                      {task.title}
                    </button>
                    <div className="text-sm text-slate-500">{task.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{task.unit}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">{task.technician}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900 capitalize">{task.type}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-900">
                  {new Date(task.scheduledDate).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className={`flex items-center space-x-2 transition-opacity ${hoveredRow === task.id ? 'opacity-100' : 'opacity-70'}`}>
                  <button
                    onClick={() => router.push(`/maintenance/${task.id}`)}
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
                      if (confirm('Are you sure you want to delete this maintenance task?')) {
                        console.log('Deleting task:', task.id)
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}