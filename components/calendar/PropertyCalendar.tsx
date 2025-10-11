'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import './calendar.css'
import { reservationServiceAdapter } from '@/lib/api/adapters/apiAdapter'
import SmartReservationModal from '@/components/reservations/SmartReservationModal'

// Declare gantt on window object
declare global {
  interface Window {
    gantt: any
  }
}

interface PropertyCalendarProps {
  properties: any[]
  reservations: any[]
  onReservationUpdate?: (reservation: any) => void
  onReservationCreate?: (reservation: any) => void
  onReservationDelete?: (id: string) => void
  groupBy?: 'city' | 'type' | 'owner' | 'agent' | null
}

const PropertyCalendar = forwardRef<any, PropertyCalendarProps>(({ 
  properties = [],
  reservations = [],
  onReservationUpdate,
  onReservationCreate,
  onReservationDelete,
  groupBy = null
}, ref) => {
  const ganttContainer = useRef<HTMLDivElement>(null)
  const ganttInstanceRef = useRef<any>(null)
  const [ganttReady, setGanttReady] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialModalData, setInitialModalData] = useState<any>(null)

  // Function to update reservation dates via API
  const updateReservationDates = async (reservationId: string, startDate: string, endDate: string) => {
    try {
      console.log(`[API] Updating reservation ${reservationId}:`, { startDate, endDate })
      
      // Format dates for API
      const formattedStartDate = new Date(startDate).toISOString().split('T')[0]
      const formattedEndDate = new Date(endDate).toISOString().split('T')[0]
      
      // Update reservation via API
      const response = await reservationServiceAdapter.update(reservationId, {
        checkIn: formattedStartDate,
        checkOut: formattedEndDate
      })
      
      if (response.success) {
        console.log(`[API] Successfully updated reservation ${reservationId}`)
        
        // Notify parent component
        if (onReservationUpdate) {
          onReservationUpdate({ id: reservationId, checkIn: formattedStartDate, checkOut: formattedEndDate })
        }
      } else {
        console.error(`[API] Failed to update reservation ${reservationId}:`, response.error)
      }
    } catch (error) {
      console.error(`[API] Error updating reservation ${reservationId}:`, error)
    }
  }

  // Function to handle reservation creation from calendar clicks
  const handleCreateReservation = (propertyId: string, checkInDate: string) => {
    console.log('[Modal] Opening reservation creation modal:', { 
      propertyId, 
      checkInDate,
      propertyIdType: typeof propertyId,
      propertyIdLength: propertyId?.length
    })
    
    // Calculate check-out date (next day by default)
    const checkOutDate = new Date(new Date(checkInDate).getTime() + 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    
    setInitialModalData({
      propertyId: propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate
    })
    setIsModalOpen(true)
  }

  // Function to close reservation modal
  const closeReservationModal = () => {
    setIsModalOpen(false)
    setInitialModalData(null)
  }

  // Function to handle successful reservation creation
  const handleReservationSave = (reservation: any) => {
    console.log('[API] Reservation created successfully:', reservation)
    
    // Close modal
    closeReservationModal()
    
    // Notify parent component
    if (onReservationCreate) {
      onReservationCreate(reservation)
    }
    
    // Refresh calendar data by reloading the page
    // This ensures the new reservation appears immediately
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    gantt: ganttInstanceRef.current,
    zoomToDay: () => {
      if (ganttInstanceRef.current) {
        ganttInstanceRef.current.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'day', step: 1, format: '%d', css: (date: Date) => {
            const day = date.getDay()
            return (day === 0 || day === 6) ? 'weekend-scale' : ''
          }}
        ]
        ganttInstanceRef.current.render()
      }
    },
    zoomToWeek: () => {
      if (ganttInstanceRef.current) {
        ganttInstanceRef.current.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'week', step: 1, format: 'Week #%W' }
        ]
        ganttInstanceRef.current.render()
      }
    },
    zoomToMonth: () => {
      if (ganttInstanceRef.current) {
        ganttInstanceRef.current.config.scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'month', step: 1, format: '%M' }
        ]
        ganttInstanceRef.current.render()
      }
    },
    scrollToToday: () => {
      if (ganttInstanceRef.current) {
        const today = new Date()
        ganttInstanceRef.current.showDate(today)
      }
    }
  }))

  useEffect(() => {
    const loadGantt = async () => {
      // Load CSS from dhtmlxGantt folder
      if (!document.querySelector('link[href="/dhtmlxGantt/codebase/dhtmlxgantt.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/dhtmlxGantt/codebase/dhtmlxgantt.css'
        document.head.appendChild(link)
      }

      // Load JS from dhtmlxGantt folder
      if (!window.gantt) {
        const script = document.createElement('script')
        script.src = '/dhtmlxGantt/codebase/dhtmlxgantt.js'
        script.async = true
        
        script.onload = () => {
          console.log('✅ DHTMLX Gantt loaded successfully')
          initializeGantt()
        }
        
        script.onerror = () => {
          console.error('❌ Failed to load DHTMLX Gantt from /dhtmlxGantt/codebase/dhtmlxgantt.js')
          console.log('📁 Please copy your DHTMLX Gantt files to public/dhtmlxGantt/codebase/')
          // Initialize with placeholder anyway after a delay
          setTimeout(() => {
            console.log('🔄 Initializing with placeholder...')
            initializeGantt()
          }, 100)
        }
        
        document.body.appendChild(script)
      } else {
        initializeGantt()
      }
    }

    const initializeGantt = () => {
      if (!ganttContainer.current) {
        console.error('Gantt container not available')
        return
      }
      
      // Check if we have a real DHTMLX Gantt or just placeholder
      const isPlaceholder = !window.gantt.init || window.gantt.init.toString().includes('placeholder')
      
      if (!window.gantt || isPlaceholder) {
        console.warn('⚠️ DHTMLX Gantt placeholder detected')
        // Create a simple placeholder display
        if (ganttContainer.current) {
          ganttContainer.current.innerHTML = `
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 400px; 
              background: #f8fafc; 
              border: 2px dashed #cbd5e1; 
              border-radius: 8px;
              flex-direction: column;
              gap: 16px;
            ">
              <div style="font-size: 48px;">📅</div>
              <div style="text-align: center;">
                <h3 style="color: #374151; margin: 0 0 8px 0;">DHTMLX Gantt Calendar</h3>
                <p style="color: #6b7280; margin: 0 0 16px 0;">Please copy your DHTMLX Gantt files to:</p>
                <code style="background: #e5e7eb; padding: 8px 12px; border-radius: 4px; font-family: monospace;">
                  public/dhtmlxGantt/codebase/
                </code>
                <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">
                    <strong>Files needed:</strong><br/>
                    • dhtmlxgantt.css<br/>
                    • dhtmlxgantt.js<br/>
                    • dhtmlxgantt.d.ts (optional)
                  </p>
                </div>
              </div>
            </div>
          `
        }
        return
      }

      const gantt = window.gantt

      console.log('🎯 Initializing DHTMLX Gantt...')
      
      // Set container reference for placeholder
      gantt.config.container = ganttContainer.current

      try {
        // ============================================
        // BASIC CONFIGURATION - Classic Gantt Model
        // ============================================
      gantt.config.date_format = '%Y-%m-%d'
      gantt.config.xml_date = '%Y-%m-%d'
      gantt.config.scale_height = 90
      gantt.config.row_height = 44
      gantt.config.min_column_width = 60
      gantt.config.grid_width = 350
      gantt.config.autosize = false
      gantt.config.fit_tasks = false
      
      // Enable horizontal scroll for dates
      gantt.config.layout = {
        css: "gantt_container",
        rows: [
          {
            cols: [
              { view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer" },
              { resizer: true, width: 1 },
              { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
              { view: "scrollbar", id: "scrollVer" }
            ]
          },
          { view: "scrollbar", id: "scrollHor", height: 20 }
        ]
      }
      
      // Enable features
      gantt.config.drag_links = false
      gantt.config.drag_progress = true
      gantt.config.drag_resize = true
      gantt.config.drag_move = true
      gantt.config.details_on_dblclick = true
      gantt.config.show_task_cells = true
      gantt.config.show_grid = true
      gantt.config.readonly = false
      
      // Work time
      gantt.config.work_time = true
      gantt.config.skip_off_time = false
      
      // Disable tooltips completely
      gantt.config.tooltip_timeout = 0
      gantt.config.tooltip_hide_timeout = 0
      
    // Enable interactions for reservations only
    gantt.config.select_task = true
    gantt.config.drag_move = true
    gantt.config.drag_resize = true
    gantt.config.drag_progress = false
      
      // ============================================
      // TIMELINE SCALES - Classic Gantt: Month + Day
      // ============================================
      gantt.config.scales = [
        { 
          unit: 'month', 
          step: 1, 
          format: '%F %Y',
          css: function(date: Date) {
            return 'month-scale'
          }
        },
        { 
          unit: 'day', 
          step: 1, 
          format: '%d',
          css: function(date: Date) {
            const day = date.getDay()
            if (day === 0 || day === 6) {
              return 'weekend-scale'
            }
            return 'day-scale'
          }
        }
      ]
      
      // Set date range for horizontal scroll - extended range to show more reservations
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1) // 6 months back
      const endDate = new Date(today.getFullYear(), today.getMonth() + 12, 0) // 12 months forward
      
      gantt.config.start_date = startDate
      gantt.config.end_date = endDate
      
      console.log('📅 Calendar date range set:', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0]
      })

      // ============================================
      // GRID COLUMNS - Only Property Names
      // ============================================
      gantt.config.columns = [
        {
          name: 'text',
          label: 'Property Name',
          width: '*',
          min_width: 200,
          tree: false,
          resize: true,
          template: function(task: any) {
            let html = '<div style="display: flex; align-items: center; padding: 8px 0; min-height: 44px;">'
            
            html += '<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;">'
            
            // Property name with better truncation
            const displayName = task.text || 'Unnamed Property'
            html += `<div style="font-weight: 600; color: #1f2937; font-size: 14px; line-height: 1.3; word-break: break-word;" title="${displayName}">${displayName}</div>`
            
            // Property details row
            html += '<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">'
            
            if (task.city) {
              html += `<span style="font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">📍 ${task.city}</span>`
            }
            
            if (task.capacity) {
              html += `<span style="font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">👥 ${task.capacity}</span>`
            }
            
            if (task.bedrooms) {
              html += `<span style="font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">🛏️ ${task.bedrooms}</span>`
            }
            
            if (task.pricePerNight) {
              html += `<span style="font-size: 11px; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px; font-weight: 600;">AED ${task.pricePerNight}</span>`
            }
            
            html += '</div></div></div>'
            return html
          }
        }
      ]

      // ============================================
      // TEMPLATES
      // ============================================
      
      gantt.templates.task_class = function(start: Date, end: Date, task: any) {
        const classes = []
        
        if (task.type === 'property') {
          classes.push('property-bar')
        } else {
          classes.push('reservation-bar')
          if (task.status) {
            classes.push(`status-${task.status.toLowerCase()}`)
          }
        }
        
        return classes.join(' ')
      }

      gantt.templates.task_text = function(start: Date, end: Date, task: any) {
        if (task.type === 'property') {
          return ''
        }
        
        let text = task.guestName || task.text || ''
        
        // Add source icon
        const sourceIcons: any = {
          'AIRBNB': '🏠',
          'BOOKING_COM': '🅱️',
          'VRBO': '🏡',
          'DIRECT': '👤',
          'MANUAL': '✏️'
        }
        
        if (task.source && sourceIcons[task.source]) {
          text = `${sourceIcons[task.source]} ${text}`
        }
        
        if (task.duration > 0) {
          text += ` • ${task.duration}n`
        }
        
        return text
      }

      gantt.templates.rightside_text = function(start: Date, end: Date, task: any) {
        if (task.type !== 'property' && task.totalAmount) {
          return `<span style="color: white; font-weight: 700; font-size: 11px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">AED ${task.totalAmount.toLocaleString()}</span>`
        }
        return ''
      }

      gantt.templates.timeline_cell_class = function(task: any, date: Date) {
        const day = date.getDay()
        return (day === 0 || day === 6) ? 'weekend-cell' : ''
      }

      gantt.templates.scale_cell_class = function(date: Date) {
        const day = date.getDay()
        return (day === 0 || day === 6) ? 'weekend-scale' : ''
      }

      // Add price per night in each timeline cell
      gantt.templates.timeline_cell_content = function(task: any, date: Date) {
        // Only show price for property rows
        if (task && task.type === 'property' && task.pricePerNight) {
          return `<div class="price-badge" style="
            position: absolute !important;
            bottom: 50% !important;
            left: 50% !important;
            transform: translate(-50%, 50%) !important;
            font-size: 7px !important;
            color: #6b7280 !important;
            font-weight: 500 !important;
            background: transparent !important;
            padding: 0 !important;
            border-radius: 0 !important;
            line-height: 1.1 !important;
            z-index: 10 !important;
            pointer-events: none !important;
            border: none !important;
            box-shadow: none !important;
            white-space: nowrap !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          ">د.إ ${task.pricePerNight}</div>`
        }
        return ''
      }

      gantt.templates.tooltip_text = function(start: Date, end: Date, task: any) {
        // Disable all tooltips completely
        return ''
      }

      gantt.templates.task_style = function(start: Date, end: Date, task: any) {
        if (task.type === 'property') {
          return 'display: none !important;'
        }
        
        const statusColors: any = {
          'PENDING': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          'CONFIRMED': 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
          'CHECKED_IN': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          'CHECKED_OUT': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
          'CANCELLED': 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
        }
        
        const background = statusColors[task.status] || statusColors['CONFIRMED']
        
        return `background: ${background}; border-radius: 10px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.15);`
      }

      // ============================================
      // LIGHTBOX CONFIGURATION
      // ============================================
      gantt.config.lightbox.sections = [
        {
          name: 'guest',
          height: 40,
          map_to: 'guestName',
          type: 'textarea',
          label: 'Guest Name',
          focus: true
        },
        {
          name: 'email',
          height: 40,
          map_to: 'guestEmail',
          type: 'textarea',
          label: 'Guest Email'
        },
        {
          name: 'time',
          height: 72,
          type: 'duration',
          map_to: 'auto'
        },
        {
          name: 'guests',
          height: 40,
          map_to: 'guests',
          type: 'textarea',
          label: 'Number of Guests'
        },
        {
          name: 'amount',
          height: 40,
          map_to: 'totalAmount',
          type: 'textarea',
          label: 'Total Amount (AED)'
        },
        {
          name: 'status',
          height: 40,
          map_to: 'status',
          type: 'select',
          label: 'Status',
          options: [
            { key: 'PENDING', label: 'Pending' },
            { key: 'CONFIRMED', label: 'Confirmed' },
            { key: 'CHECKED_IN', label: 'Checked In' },
            { key: 'CHECKED_OUT', label: 'Checked Out' },
            { key: 'CANCELLED', label: 'Cancelled' }
          ]
        }
      ]

      // ============================================
      // PLUGINS
      // ============================================
      if (gantt.plugins) {
        gantt.plugins({
          tooltip: true,
          marker: true,
          fullscreen: true,
          keyboard_navigation: true,
          quick_info: true
        })
      }

      // ============================================
      // EVENT HANDLERS
      // ============================================
      
      gantt.attachEvent('onAfterTaskUpdate', function(id: any, task: any) {
        if (task.type !== 'property' && onReservationUpdate) {
          onReservationUpdate(task)
        }
      })

      gantt.attachEvent('onAfterTaskAdd', function(id: any, task: any) {
        if (task.type !== 'property' && onReservationCreate) {
          onReservationCreate(task)
        }
      })

      gantt.attachEvent('onAfterTaskDelete', function(id: any, task: any) {
        if (task.type !== 'property' && onReservationDelete) {
          onReservationDelete(id)
        }
      })

      gantt.attachEvent('onBeforeLightbox', function(id: any) {
        const task = gantt.getTask(id)
        return task.type !== 'property'
      })

      gantt.attachEvent('onBeforeTaskDrag', function(id: any) {
        const task = gantt.getTask(id)
        return task.type !== 'property'
      })

      gantt.attachEvent('onAfterTaskDrag', function(id: any, mode: string, e: Event) {
        const task = gantt.getTask(id)
        
        // Only handle reservation tasks
        if (task && task.type !== 'property') {
          console.log(`[Drag & Drop] Reservation ${task.id} moved/resized:`, {
            id: task.id,
            mode: mode,
            start_date: task.start_date,
            end_date: task.end_date,
            duration: task.duration,
            reservation_id: task.reservation_id
          })

          // Update reservation dates via API
          if (task.reservation_id) {
            updateReservationDates(task.reservation_id, task.start_date, task.end_date)
          }
        }
        return true
      })

      // Handle clicks on empty grid cells to create new reservations
      gantt.attachEvent('onEmptyClick', function(e: Event) {
        console.log('[Empty Click] Clicked on empty area:', { event: e })
        
        const clickedElement = e.target as HTMLElement
        
        // Find the closest parent element that is a task row
        const rowElement = clickedElement.closest('.gantt_task_row') as HTMLElement
        
        if (rowElement) {
          const propertyId = rowElement.getAttribute('data-task-id')
          
          if (propertyId) {
            // Get the property task to verify it's a property row
            const propertyTask = gantt.getTask(propertyId)
            
            if (propertyTask && propertyTask.type === 'property') {
              console.log('[Empty Click] Property clicked:', propertyTask)
              
              // Get the date from the click position
              try {
                const pos = gantt.getScrollState()
                const date = gantt.dateFromPos(e.clientX + pos.x)
                const formattedDate = gantt.date.date_to_str('%Y-%m-%d')(date)
                
                console.log('[Empty Click] Timeline date:', {
                  date,
                  formattedDate,
                  propertyId: propertyTask.propertyId,
                  propertyName: propertyTask.text
                })
                
                // Open reservation creation modal
                handleCreateReservation(propertyTask.propertyId, formattedDate)
              } catch (error) {
                console.warn('[Empty Click] Error calculating date, using current date:', error)
                // Fallback to current date if date calculation fails
                const currentDate = gantt.date.date_to_str('%Y-%m-%d')(new Date())
                handleCreateReservation(propertyTask.propertyId, currentDate)
              }
            } else {
              console.warn('[Empty Click] Clicked row is not a property row:', propertyTask)
            }
          } else {
            console.warn('[Empty Click] Could not find data-task-id attribute on row element')
          }
        } else {
          console.warn('[Empty Click] Click was not on a valid property row')
        }
        
        return false // Prevent default behavior
      })

      // Handle clicks on timeline cells for date selection
      gantt.attachEvent('onScaleClick', function(date: Date, e: Event) {
        console.log('[Scale Click] Timeline clicked:', { date, event: e })
        
        const clickedElement = e.target as HTMLElement
        
        // Find the closest parent element that is a task row
        const rowElement = clickedElement.closest('.gantt_task_row') as HTMLElement
        
        if (rowElement) {
          const propertyId = rowElement.getAttribute('data-task-id')
          
          if (propertyId) {
            const task = gantt.getTask(propertyId)
            
            if (task && task.type === 'property') {
              const formattedDate = gantt.date.date_to_str('%Y-%m-%d')(date)
              
              console.log('[Scale Click] Property timeline clicked:', {
                taskId: propertyId,
                propertyId: task.propertyId,
                propertyName: task.text,
                clickedDate: formattedDate
              })
              
              // Open reservation creation modal
              handleCreateReservation(task.propertyId, formattedDate)
            } else {
              console.warn('[Scale Click] Clicked row is not a property row:', task)
            }
          } else {
            console.warn('[Scale Click] Could not find data-task-id attribute on row element')
          }
        } else {
          console.warn('[Scale Click] Click was not on a valid property row')
        }
        
        return false
      })

      // Block clicks on property rows
      gantt.attachEvent('onTaskClick', function(id: any, e: any) {
        const task = gantt.getTask(id)
        if (task && task.type === 'property') {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
        return true
      })

      // Handle row clicks on property rows for reservation creation
      gantt.attachEvent('onTaskRowClick', function(id: any, e: any) {
        const task = gantt.getTask(id)
        if (task && task.type === 'property') {
          console.log('[Row Click] Property row clicked:', { id, task })
          
          // Get the date from the click position
          try {
            const pos = gantt.getScrollState()
            const date = gantt.dateFromPos(e.clientX + pos.x)
            const formattedDate = gantt.date.date_to_str('%Y-%m-%d')(date)
            
            console.log('[Row Click] Timeline date:', {
              date,
              formattedDate,
              propertyId: task.propertyId,
              propertyName: task.text
            })
            
            // Open reservation creation modal
            handleCreateReservation(task.propertyId, formattedDate)
          } catch (error) {
            console.warn('[Row Click] Error calculating date, using current date:', error)
            // Fallback to current date if date calculation fails
            const currentDate = gantt.date.date_to_str('%Y-%m-%d')(new Date())
            handleCreateReservation(task.propertyId, currentDate)
          }
          
          e.preventDefault()
          e.stopPropagation()
          return false
        }
        return true
      })

      // Block double clicks on property rows
      gantt.attachEvent('onTaskDblClick', function(id: any, e: any) {
        const task = gantt.getTask(id)
        if (task && task.type === 'property') {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
        return true
      })

      // ============================================
      // TODAY MARKER
      // ============================================
      gantt.addMarker({
        start_date: new Date(),
        css: 'today-marker',
        text: 'Today',
        title: `Today: ${new Date().toLocaleDateString()}`
      })

        // ============================================
        // INITIALIZE
        // ============================================
        gantt.init(ganttContainer.current)

        ganttInstanceRef.current = gantt
        setGanttReady(true)

        console.log('✅ DHTMLX Gantt initialized successfully')
        
      } catch (error) {
        console.error('❌ Error initializing DHTMLX Gantt:', error)
        
        // Show error message in container
        if (ganttContainer.current) {
          ganttContainer.current.innerHTML = `
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 400px; 
              background: #fef2f2; 
              border: 2px dashed #fca5a5; 
              border-radius: 8px;
              flex-direction: column;
              gap: 16px;
            ">
              <div style="font-size: 48px;">⚠️</div>
              <div style="text-align: center;">
                <h3 style="color: #dc2626; margin: 0 0 8px 0;">DHTMLX Gantt Error</h3>
                <p style="color: #991b1b; margin: 0 0 16px 0;">Failed to initialize calendar</p>
                <details style="text-align: left; max-width: 400px;">
                  <summary style="cursor: pointer; color: #dc2626; font-weight: 600;">Show Error Details</summary>
                  <pre style="background: #fee2e2; padding: 12px; border-radius: 4px; font-size: 12px; color: #991b1b; margin-top: 8px; overflow: auto;">${error.message}</pre>
                </details>
              </div>
            </div>
          `
        }
      }
    }

    loadGantt()

    return () => {
      if (ganttInstanceRef.current) {
        ganttInstanceRef.current.clearAll()
      }
    }
  }, [])

  // ============================================
  // UPDATE DATA
  // ============================================
  useEffect(() => {
    if (!ganttInstanceRef.current || !ganttReady) return

    const gantt = ganttInstanceRef.current
    gantt.clearAll()

    const ganttTasks: any[] = []

    // Remove duplicates and add each unique property as a separate row
    const uniqueProperties = properties.filter((property: any, index: number, self: any[]) => 
      index === self.findIndex(p => p.id === property.id)
    )
    
    uniqueProperties.forEach((property: any, index: number) => {
      const propertyReservations = reservations.filter(
        (res: any) => res.propertyId === property.id && res.status !== 'CANCELLED'
      )
      
      console.log(`🏠 Property ${property.id} (${property.name}):`, {
        propertyId: property.id,
        reservations: propertyReservations.length,
        reservationData: propertyReservations,
        rawPropertyId: property.id,
        taskId: `property-${property.id}`
      })

      // Each property is a standalone row (not a project with children)
      const propertyName = property.name || property.nickname || `Property ${property.id}`
      const propertyTask = {
        id: `property-${property.id}`,
        text: propertyName,
        start_date: gantt.date.date_to_str('%Y-%m-%d')(new Date()),
        duration: 1,
        type: 'property', // Use property type to distinguish from reservations
        open: false,
        readonly: true,
        render: 'split', // Make it non-interactive
        // Custom property data
        propertyId: property.id,
        image: property.primaryImage || (property.photos && property.photos[0]?.url),
        address: property.address,
        city: property.city,
        capacity: property.capacity,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        pricePerNight: property.pricePerNight,
        propertyType: property.type,
        // Add unique identifier to prevent duplicates
        uniqueId: `${property.id}-${index}`
      }

      ganttTasks.push(propertyTask)

      // Add all reservations for this property as child tasks on the same row
      propertyReservations.forEach((reservation: any) => {
        const checkIn = new Date(reservation.checkIn)
        const checkOut = new Date(reservation.checkOut)
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

        console.log(`📅 Processing reservation ${reservation.id}:`, {
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          nights: nights,
          formattedStart: gantt.date.date_to_str('%Y-%m-%d')(checkIn),
          formattedEnd: gantt.date.date_to_str('%Y-%m-%d')(checkOut)
        })

        let progress = 0
        switch (reservation.status) {
          case 'PENDING': progress = 0.25; break
          case 'CONFIRMED': progress = 0.5; break
          case 'CHECKED_IN': progress = 0.75; break
          case 'CHECKED_OUT': progress = 1; break
        }

        const reservationTask = {
          id: `reservation-${reservation.id}`,
          text: reservation.guestName || 'Guest',
          start_date: gantt.date.date_to_str('%Y-%m-%d')(checkIn),
          duration: nights || 1,
          parent: `property-${property.id}`,
          progress: progress,
          type: 'task',
          // Reservation data
          reservationId: reservation.reservationId || reservation.id,
          guestName: reservation.guestName,
          guestEmail: reservation.guestEmail,
          guestPhone: reservation.guestPhone,
          guests: reservation.guests,
          totalAmount: reservation.totalAmount,
          status: reservation.status,
          source: reservation.source,
          notes: reservation.notes || reservation.specialRequests
        }

        console.log(`📅 Created reservation task:`, reservationTask)
        ganttTasks.push(reservationTask)
      })
    })

    console.log('📊 Parsing Gantt data:', ganttTasks.length, 'tasks')
    console.log('🏠 Properties processed:', uniqueProperties.length)
    console.log('📅 Reservations processed:', reservations.length)
    console.log('📅 Raw reservations data:', reservations)
    console.log('📅 Gantt tasks:', ganttTasks)
    
    // Log current calendar date range
    const currentDateRange = {
      start_date: gantt.config.start_date,
      end_date: gantt.config.end_date,
      start_formatted: gantt.date.date_to_str('%Y-%m-%d')(gantt.config.start_date),
      end_formatted: gantt.date.date_to_str('%Y-%m-%d')(gantt.config.end_date)
    }
    console.log('📅 Current calendar date range:', currentDateRange)

    gantt.parse({ data: ganttTasks, links: [] })
    
    // Auto-scroll to show reservations if any exist
    const reservationTasks = ganttTasks.filter(task => task.type === 'task' && task.start_date)
    if (reservationTasks.length > 0) {
      // Find the earliest reservation date
      const earliestReservation = reservationTasks.reduce((earliest, current) => {
        return new Date(current.start_date) < new Date(earliest.start_date) ? current : earliest
      })
      
      console.log('📅 Auto-scrolling to earliest reservation:', {
        reservationId: earliestReservation.id,
        startDate: earliestReservation.start_date,
        guestName: earliestReservation.guestName
      })
      
      // Scroll to show the earliest reservation
      setTimeout(() => {
        gantt.showDate(new Date(earliestReservation.start_date))
      }, 100)
    }

  }, [properties, reservations, ganttReady])

  return (
    <>
      <div 
        ref={ganttContainer}
        style={{
          width: '100%', 
          height: '100%',
          minHeight: '600px'
        }}
        className="property-calendar"
      />
      
      {/* Smart Reservation Modal */}
      {isModalOpen && (
        <SmartReservationModal
          onClose={closeReservationModal}
          onSave={handleReservationSave}
          initialData={initialModalData}
        />
      )}
    </>
  )
})

PropertyCalendar.displayName = 'PropertyCalendar'

export default PropertyCalendar

