'use client'

import { useEffect, useRef, useState } from 'react'
import '../../app/scheduler/gantt-custom.css'

// Declare gantt on window object
declare global {
  interface Window {
    gantt: any
  }
}

interface GanttTask {
  id: string | number
  text: string
  start_date: string
  duration: number
  progress: number
  type?: 'project' | 'task' | 'milestone'
  parent?: string | number
  open?: boolean
  color?: string
}

interface GanttLink {
  id: string | number
  source: string | number
  target: string | number
  type: string
}

interface FullGanttSchedulerProps {
  tasks?: GanttTask[]
  links?: GanttLink[]
  onTaskUpdate?: (task: any) => void
  onTaskCreate?: (task: any) => void
  onTaskDelete?: (id: string | number) => void
}

export default function FullGanttScheduler({ 
  tasks = [], 
  links = [],
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete
}: FullGanttSchedulerProps) {
  const ganttContainer = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<any>(null)
  const [ganttReady, setGanttReady] = useState(false)

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

      // Basic configuration
      gantt.config.date_format = '%Y-%m-%d'
      gantt.config.scale_height = 90
      gantt.config.row_height = 40
      gantt.config.autosize = true
      gantt.config.fit_tasks = true
      
      // Enable drag and drop
      gantt.config.drag_links = true
      gantt.config.drag_progress = true
      gantt.config.drag_resize = true
      gantt.config.drag_move = true
      
      // Enable auto-scheduling
      gantt.config.auto_scheduling = true
      gantt.config.auto_scheduling_strict = true
      
      // Enable work time
      gantt.config.work_time = true
      gantt.config.skip_off_time = true
      
      // Configure timeline scales
      gantt.config.scales = [
        { unit: 'year', step: 1, format: '%Y' },
        { unit: 'month', step: 1, format: '%F, %Y' },
        { 
          unit: 'day', 
          step: 1, 
          format: '%d %M',
          css: function(date: Date) {
            const day = date.getDay()
            return (day === 0 || day === 6) ? 'weekend' : ''
          }
        }
      ]

      // Configure grid columns
      gantt.config.columns = [
        {
          name: 'text',
          label: 'Property / Guest',
          width: '*',
          min_width: 200,
          tree: true,
          resize: true
        },
        {
          name: 'start_date',
          label: 'Check In',
          align: 'center',
          width: 100,
          resize: true
        },
        {
          name: 'duration',
          label: 'Nights',
          align: 'center',
          width: 70,
          resize: true
        },
        {
          name: 'add',
          label: '',
          width: 44
        }
      ]

      // Configure lightbox (edit form)
      gantt.config.lightbox.sections = [
        {
          name: 'description',
          height: 38,
          map_to: 'text',
          type: 'textarea',
          focus: true
        },
        {
          name: 'time',
          height: 72,
          type: 'duration',
          map_to: 'auto'
        }
      ]

      // Templates
      gantt.templates.task_class = function(start: Date, end: Date, task: any) {
        let classes = []
        if (task.type === 'project') {
          classes.push('gantt_project')
        }
        if (task.status) {
          classes.push('status-' + task.status.toLowerCase())
        }
        return classes.join(' ')
      }

      gantt.templates.timeline_cell_class = function(task: any, date: Date) {
        const day = date.getDay()
        return (day === 0 || day === 6) ? 'weekend' : ''
      }

      gantt.templates.task_text = function(start: Date, end: Date, task: any) {
        return task.text
      }

      gantt.templates.scale_cell_class = function(date: Date) {
        const day = date.getDay()
        return (day === 0 || day === 6) ? 'weekend' : ''
      }

      gantt.templates.tooltip_text = function(start: Date, end: Date, task: any) {
        const startStr = gantt.date.date_to_str('%d %M %Y')(start)
        const endStr = gantt.date.date_to_str('%d %M %Y')(end)
        
        let html = `<b>${task.text}</b><br/>`
        html += `<b>Check-in:</b> ${startStr}<br/>`
        html += `<b>Check-out:</b> ${endStr}<br/>`
        html += `<b>Duration:</b> ${task.duration} nights<br/>`
        
        if (task.status) {
          html += `<b>Status:</b> ${task.status}<br/>`
        }
        
        if (task.progress) {
          html += `<b>Progress:</b> ${Math.round(task.progress * 100)}%`
        }
        
        return html
      }

      // Custom task colors
      gantt.templates.task_unscheduled_time = function(task: any) {
        return task.color || null
      }

      // Task styling based on custom properties
      gantt.templates.task_style = function(start: Date, end: Date, task: any) {
        if (task.color) {
          return `background: ${task.color};`
        }
        return ''
      }

      // Plugins
      if (gantt.plugins) {
        gantt.plugins({
          tooltip: true,
          quick_info: true,
          marker: true,
          fullscreen: true,
          auto_scheduling: true,
          undo: true,
          keyboard_navigation: true
        })
      }

      // Event handlers
      gantt.attachEvent('onAfterTaskAdd', function(id: any, task: any) {
        console.log('Task added:', id, task)
        if (onTaskCreate) {
          onTaskCreate(task)
        }
      })

      gantt.attachEvent('onAfterTaskUpdate', function(id: any, task: any) {
        console.log('Task updated:', id, task)
        if (onTaskUpdate) {
          onTaskUpdate(task)
        }
      })

      gantt.attachEvent('onAfterTaskDelete', function(id: any) {
        console.log('Task deleted:', id)
        if (onTaskDelete) {
          onTaskDelete(id)
        }
      })

      // Add today marker
      const today = new Date()
      gantt.addMarker({
        start_date: today,
        css: 'today',
        text: 'Today',
        title: `Today: ${today.toDateString()}`
      })

      // Initialize Gantt in the container
      gantt.init(ganttContainer.current)
      
      // Set smart rendering for better performance
      if (gantt.ext && gantt.ext.zoom) {
        gantt.ext.zoom.init({
          levels: [
            {
              name: 'day',
              scale_height: 90,
              min_column_width: 30,
              scales: [
                { unit: 'month', step: 1, format: '%F, %Y' },
                { unit: 'day', step: 1, format: '%d %M' }
              ]
            },
            {
              name: 'week',
              scale_height: 60,
              min_column_width: 50,
              scales: [
                { unit: 'month', step: 1, format: '%F, %Y' },
                { unit: 'week', step: 1, format: 'Week #%W' }
              ]
            },
            {
              name: 'month',
              scale_height: 60,
              min_column_width: 70,
              scales: [
                { unit: 'year', step: 1, format: '%Y' },
                { unit: 'month', step: 1, format: '%F' }
              ]
            }
          ]
        })
        gantt.ext.zoom.setLevel('day')
      }

      // Parse data
      if (tasks.length > 0) {
        gantt.parse({ data: tasks, links })
      } else {
        // Load sample data
        const sampleData = {
          data: [
            {
              id: 1,
              text: 'Urban Oasis l Perfect for 4 l New Building',
              start_date: '2025-01-15',
              duration: 5,
              progress: 1,
              type: 'project',
              open: true,
              color: '#3b82f6'
            },
            {
              id: 2,
              text: 'Test Guest - PENDING',
              start_date: '2025-01-15',
              duration: 5,
              progress: 1,
              parent: 1,
              color: '#10b981'
            },
            {
              id: 3,
              text: 'Beach Property',
              start_date: '2025-02-01',
              duration: 7,
              progress: 0.5,
              type: 'project',
              open: true,
              color: '#3b82f6'
            },
            {
              id: 4,
              text: 'John Doe - CONFIRMED',
              start_date: '2025-02-01',
              duration: 7,
              progress: 0.8,
              parent: 3,
              color: '#10b981'
            },
            {
              id: 5,
              text: 'Downtown Studio',
              start_date: '2025-02-10',
              duration: 3,
              progress: 0,
              type: 'project',
              open: true,
              color: '#3b82f6'
            },
            {
              id: 6,
              text: 'Sarah Smith - CHECKED_IN',
              start_date: '2025-02-10',
              duration: 3,
              progress: 0.3,
              parent: 5,
              color: '#f59e0b'
            }
          ],
          links: []
        }
        gantt.parse(sampleData)
      }

      ganttRef.current = gantt
      setGanttReady(true)
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
    if (ganttRef.current && ganttReady && tasks.length > 0) {
      ganttRef.current.clearAll()
      ganttRef.current.parse({ data: tasks, links })
    }
  }, [tasks, links, ganttReady])

  // Public methods exposed via ref
  useEffect(() => {
    if (ganttRef.current && ganttReady) {
      // Expose useful methods
      ganttRef.current.zoomToFit = () => {
        if (ganttRef.current.ext && ganttRef.current.ext.zoom) {
          ganttRef.current.ext.zoom.setLevel('day')
        }
      }
      
      ganttRef.current.zoomIn = () => {
        if (ganttRef.current.ext && ganttRef.current.ext.zoom) {
          const currentLevel = ganttRef.current.ext.zoom.getCurrentLevel()
          if (currentLevel === 'month') ganttRef.current.ext.zoom.setLevel('week')
          else if (currentLevel === 'week') ganttRef.current.ext.zoom.setLevel('day')
        }
      }
      
      ganttRef.current.zoomOut = () => {
        if (ganttRef.current.ext && ganttRef.current.ext.zoom) {
          const currentLevel = ganttRef.current.ext.zoom.getCurrentLevel()
          if (currentLevel === 'day') ganttRef.current.ext.zoom.setLevel('week')
          else if (currentLevel === 'week') ganttRef.current.ext.zoom.setLevel('month')
        }
      }
      
      ganttRef.current.scrollToToday = () => {
        const today = new Date()
        ganttRef.current.showDate(today)
      }
    }
  }, [ganttReady])

  return (
    <div 
      ref={ganttContainer} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '600px'
      }}
      className="gantt-container"
    />
  )
}

// Export ref type for parent components
export type { FullGanttSchedulerProps }

