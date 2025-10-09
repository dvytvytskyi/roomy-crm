'use client'

import { useEffect, useRef } from 'react'
import '../../app/scheduler/gantt-custom.css'

// Declare gantt on window object
declare global {
  interface Window {
    gantt: any
  }
}

interface GanttSchedulerProps {
  tasks?: any[]
  links?: any[]
}

export default function GanttScheduler({ tasks = [], links = [] }: GanttSchedulerProps) {
  const ganttContainer = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<any>(null)

  useEffect(() => {
    // Load DHTMLX Gantt scripts
    const loadGantt = async () => {
      // Load CSS
      if (!document.querySelector('link[href="/dhtmlxgantt/dhtmlxgantt.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/dhtmlxgantt/dhtmlxgantt.css'
        document.head.appendChild(link)
      }

      // Load JS
      if (!window.gantt) {
        const script = document.createElement('script')
        script.src = '/dhtmlxgantt/dhtmlxgantt.js'
        script.async = true
        
        script.onload = () => {
          initializeGantt()
        }
        
        document.body.appendChild(script)
      } else {
        initializeGantt()
      }
    }

    const initializeGantt = () => {
      if (!ganttContainer.current || !window.gantt) return

      const gantt = window.gantt

      // Configure Gantt
      gantt.config.date_format = '%Y-%m-%d %H:%i'
      gantt.config.scale_height = 50
      gantt.config.row_height = 30
      
      // Configure scales (timeline header)
      gantt.config.scales = [
        { unit: 'month', step: 1, format: '%F %Y' },
        { unit: 'day', step: 1, format: '%d %M' }
      ]

      // Configure columns
      gantt.config.columns = [
        { name: 'text', label: 'Property/Guest', width: '*', tree: true },
        { name: 'start_date', label: 'Check In', align: 'center', width: 100 },
        { name: 'duration', label: 'Nights', align: 'center', width: 70 },
        { name: 'add', label: '', width: 44 }
      ]

      // Initialize Gantt in the container
      gantt.init(ganttContainer.current)

      // Parse data
      if (tasks.length > 0) {
        gantt.parse({ data: tasks, links })
      } else {
        // Load sample data if no data provided
        const sampleData = {
          data: [
            {
              id: 1,
              text: 'Luxury Apartment Dubai Marina',
              start_date: '2025-01-15',
              duration: 5,
              progress: 1,
              type: 'project',
              open: true
            },
            {
              id: 2,
              text: 'John Smith - Reservation',
              start_date: '2025-01-15',
              duration: 5,
              progress: 1,
              parent: 1
            },
            {
              id: 3,
              text: 'Beach Villa Palm Jumeirah',
              start_date: '2025-01-20',
              duration: 7,
              progress: 0.5,
              type: 'project',
              open: true
            },
            {
              id: 4,
              text: 'Sarah Johnson - Reservation',
              start_date: '2025-01-20',
              duration: 7,
              progress: 0.5,
              parent: 3
            },
            {
              id: 5,
              text: 'Downtown Studio',
              start_date: '2025-01-25',
              duration: 3,
              progress: 0,
              type: 'project',
              open: true
            },
            {
              id: 6,
              text: 'Michael Brown - Reservation',
              start_date: '2025-01-25',
              duration: 3,
              progress: 0,
              parent: 5
            }
          ],
          links: []
        }
        gantt.parse(sampleData)
      }

      ganttRef.current = gantt
    }

    loadGantt()

    // Cleanup
    return () => {
      if (ganttRef.current) {
        ganttRef.current.clearAll()
      }
    }
  }, [])

  // Update data when tasks change
  useEffect(() => {
    if (ganttRef.current && tasks.length > 0) {
      ganttRef.current.clearAll()
      ganttRef.current.parse({ data: tasks, links })
    }
  }, [tasks, links])

  return (
    <div 
      ref={ganttContainer} 
      style={{ 
        width: '100%', 
        height: 'calc(100vh - 200px)',
        minHeight: '500px'
      }}
      className="gantt-container"
    />
  )
}

