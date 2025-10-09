'use client'

import { useState, useRef } from 'react'
import TopNavigation from '@/components/TopNavigation'
import FullGanttScheduler from '@/components/scheduler/FullGanttScheduler'
import { useSchedulerData } from '@/hooks/useSchedulerData'
import { Calendar, Filter, ZoomIn, ZoomOut, RefreshCw, Loader2, Maximize2 } from 'lucide-react'

export default function SchedulerPage() {
  const ganttRef = useRef<any>(null)
  const { tasks, loading, error } = useSchedulerData()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleZoomIn = () => {
    if (ganttRef.current?.zoomIn) {
      ganttRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (ganttRef.current?.zoomOut) {
      ganttRef.current.zoomOut()
    }
  }

  const handleToday = () => {
    if (ganttRef.current?.scrollToToday) {
      ganttRef.current.scrollToToday()
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleTaskUpdate = (task: any) => {
    console.log('Task updated:', task)
    // TODO: Send update to API
  }

  const handleTaskCreate = (task: any) => {
    console.log('Task created:', task)
    // TODO: Send create to API
  }

  const handleTaskDelete = (id: string | number) => {
    console.log('Task deleted:', id)
    // TODO: Send delete to API
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopNavigation />
      
      {/* Main content with padding from header */}
      <div className="flex-1 flex flex-col pt-4">
        {/* Header */}
        <div className="px-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scheduler</h1>
              <p className="text-gray-600 mt-1">Property booking calendar and timeline</p>
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleToday}
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Calendar size={16} className="mr-2" />
                Today
              </button>
              
              <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg p-1">
                <button 
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <button 
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
              
              <button 
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Gantt Chart - Full width and height */}
        <div className="flex-1 px-6 pb-6">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Loading scheduler data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-red-600 font-medium">Error loading data</p>
                  <p className="text-gray-500 text-sm mt-2">{error}</p>
                </div>
              </div>
            ) : (
              <FullGanttScheduler 
                tasks={tasks}
                links={[]}
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreate}
                onTaskDelete={handleTaskDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
