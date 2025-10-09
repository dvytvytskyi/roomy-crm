'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import './calendar.css'

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
        }
        
        document.body.appendChild(script)
      } else {
        initializeGantt()
      }
    }

    const initializeGantt = () => {
      if (!ganttContainer.current || !window.gantt) {
        console.error('Gantt container or window.gantt not available')
        return
      }

      const gantt = window.gantt

      console.log('🎯 Initializing DHTMLX Gantt...')

      // ============================================
      // BASIC CONFIGURATION
      // ============================================
      gantt.config.date_format = '%Y-%m-%d'
      gantt.config.xml_date = '%Y-%m-%d'
      gantt.config.scale_height = 80
      gantt.config.row_height = 50
      gantt.config.min_column_width = 40
      gantt.config.autosize = 'y'
      gantt.config.fit_tasks = false
      
      // Enable features
      gantt.config.drag_links = false
      gantt.config.drag_progress = false
      gantt.config.drag_resize = true
      gantt.config.drag_move = true
      gantt.config.details_on_dblclick = true
      gantt.config.show_task_cells = true
      gantt.config.show_grid = true
      gantt.config.readonly = false
      
      // Work time
      gantt.config.work_time = true
      gantt.config.skip_off_time = false
      
      // ============================================
      // TIMELINE SCALES
      // ============================================
      gantt.config.scales = [
        { 
          unit: 'month', 
          step: 1, 
          format: '%F %Y'
        },
        { 
          unit: 'day', 
          step: 1, 
          format: '%d',
          css: function(date: Date) {
            const day = date.getDay()
            return (day === 0 || day === 6) ? 'weekend-scale' : ''
          }
        }
      ]

      // ============================================
      // GRID COLUMNS
      // ============================================
      gantt.config.columns = [
        {
          name: 'text',
          label: 'Property',
          width: 280,
          tree: true,
          template: function(task: any) {
            if (task.type === 'property') {
              let html = '<div style="display: flex; align-items: center; gap: 10px; padding: 4px 0;">'
              
              if (task.image) {
                html += `<img src="${task.image}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; border: 2px solid #e5e7eb;" onerror="this.style.display='none'" />`
              } else {
                html += '<div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 18px;">🏠</div>'
              }
              
              html += '<div style="flex: 1; min-width: 0;">'
              html += `<div style="font-weight: 700; color: #1f2937; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${task.text}">${task.text}</div>`
              
              if (task.city) {
                html += `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">📍 ${task.city} • 👥 ${task.capacity || 'N/A'} • 🛏️ ${task.bedrooms || 'N/A'}</div>`
              }
              
              html += '</div></div>'
              return html
            } else {
              // Reservation
              let html = '<div style="padding-left: 24px; display: flex; align-items: center; gap: 8px;">'
              
              // Source icon
              const sourceIcons: any = {
                'AIRBNB': '<span style="font-size: 16px;">🏠</span>',
                'BOOKING_COM': '<span style="font-size: 16px;">🅱️</span>',
                'VRBO': '<span style="font-size: 16px;">🏡</span>',
                'DIRECT': '<span style="font-size: 16px;">👤</span>',
                'MANUAL': '<span style="font-size: 16px;">✏️</span>'
              }
              
              html += sourceIcons[task.source] || '<span style="font-size: 16px;">📅</span>'
              html += `<span style="font-size: 13px; color: #374151; font-weight: 500;">${task.text}</span>`
              html += '</div>'
              return html
            }
          }
        },
        {
          name: 'duration',
          label: 'Nights',
          width: 70,
          align: 'center',
          template: function(task: any) {
            if (task.type !== 'property' && task.duration) {
              return `<span style="color: #3b82f6; font-weight: 600; font-size: 13px;">${task.duration}</span>`
            }
            return ''
          }
        },
        {
          name: 'amount',
          label: 'Amount',
          width: 110,
          align: 'right',
          template: function(task: any) {
            if (task.totalAmount) {
              return `<span style="color: #059669; font-weight: 700; font-size: 13px;">AED ${task.totalAmount.toLocaleString()}</span>`
            }
            return ''
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

      gantt.templates.tooltip_text = function(start: Date, end: Date, task: any) {
        if (task.type === 'property') {
          let html = `<div style="min-width: 220px;">`
          html += `<div style="font-weight: 700; font-size: 15px; margin-bottom: 10px; color: #1f2937;">🏠 ${task.text}</div>`
          html += `<div style="font-size: 12px; color: #6b7280; line-height: 1.8;">`
          
          if (task.address) html += `📍 ${task.address}<br/>`
          if (task.city) html += `🏙️ ${task.city}<br/>`
          if (task.capacity) html += `👥 Capacity: ${task.capacity}<br/>`
          if (task.bedrooms) html += `🛏️ Bedrooms: ${task.bedrooms}<br/>`
          if (task.pricePerNight) html += `💰 Price: AED ${task.pricePerNight}/night`
          
          html += `</div></div>`
          return html
        } else {
          const checkIn = gantt.date.date_to_str('%d %M %Y')(start)
          const checkOut = gantt.date.date_to_str('%d %M %Y')(end)
          
          let html = `<div style="min-width: 280px;">`
          html += `<div style="font-weight: 700; font-size: 15px; margin-bottom: 10px; color: #1f2937;">`
          
          const sourceLabels: any = {
            'AIRBNB': '🏠 Airbnb Booking',
            'BOOKING_COM': '🅱️ Booking.com',
            'VRBO': '🏡 Vrbo',
            'DIRECT': '👤 Direct Booking',
            'MANUAL': '✏️ Manual Entry'
          }
          
          html += sourceLabels[task.source] || '📅 Reservation'
          html += `</div>`
          
          html += `<div style="font-size: 13px; color: #374151; line-height: 2;">`
          html += `<strong>Guest:</strong> ${task.guestName || 'N/A'}<br/>`
          html += `<strong>Email:</strong> ${task.guestEmail || 'N/A'}<br/>`
          if (task.guestPhone) html += `<strong>Phone:</strong> ${task.guestPhone}<br/>`
          html += `<strong>Check-in:</strong> ${checkIn}<br/>`
          html += `<strong>Check-out:</strong> ${checkOut}<br/>`
          html += `<strong>Duration:</strong> ${task.duration} nights<br/>`
          if (task.guests) html += `<strong>Guests:</strong> ${task.guests}<br/>`
          
          const statusColors: any = {
            'PENDING': '#f59e0b',
            'CONFIRMED': '#10b981',
            'CHECKED_IN': '#3b82f6',
            'CHECKED_OUT': '#6b7280',
            'CANCELLED': '#ef4444'
          }
          
          const statusColor = statusColors[task.status] || '#6b7280'
          html += `<div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">`
          html += `<span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${task.status}</span>`
          html += `<span style="color: #059669; font-weight: 700; font-size: 14px;">AED ${task.totalAmount?.toLocaleString() || 0}</span>`
          html += `</div>`
          
          html += `</div></div>`
          return html
        }
      }

      gantt.templates.task_style = function(start: Date, end: Date, task: any) {
        if (task.type === 'property') {
          return 'opacity: 0.2; height: 10px; margin-top: 20px;'
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

      // ============================================
      // TODAY MARKER
      // ============================================
      const today = new Date()
      gantt.addMarker({
        start_date: today,
        css: 'today-marker',
        text: 'Today',
        title: `Today: ${today.toLocaleDateString()}`
      })

      // ============================================
      // INITIALIZE
      // ============================================
      gantt.init(ganttContainer.current)

      ganttInstanceRef.current = gantt
      setGanttReady(true)

      console.log('✅ DHTMLX Gantt initialized successfully')
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

    properties.forEach((property: any) => {
      const propertyReservations = reservations.filter(
        (res: any) => res.propertyId === property.id && res.status !== 'CANCELLED'
      )

      let minDate = new Date()
      let maxDate = new Date(minDate.getTime() + 90 * 24 * 60 * 60 * 1000)

      if (propertyReservations.length > 0) {
        const dates = propertyReservations.flatMap((res: any) => [
          new Date(res.checkIn),
          new Date(res.checkOut)
        ])
        minDate = new Date(Math.min(...dates.map(d => d.getTime())))
        const maxReservationDate = new Date(Math.max(...dates.map(d => d.getTime())))
        maxDate = new Date(Math.max(maxReservationDate.getTime(), maxDate.getTime()))
      }

      ganttTasks.push({
        id: `property-${property.id}`,
        text: property.name || property.nickname || 'Unnamed Property',
        start_date: gantt.date.date_to_str('%Y-%m-%d')(minDate),
        end_date: gantt.date.date_to_str('%Y-%m-%d')(maxDate),
        type: 'property',
        open: true,
        readonly: true,
        image: property.primaryImage || (property.photos && property.photos[0]?.url),
        address: property.address,
        city: property.city,
        capacity: property.capacity,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        pricePerNight: property.pricePerNight
      })

      propertyReservations.forEach((reservation: any) => {
        const checkIn = new Date(reservation.checkIn)
        const checkOut = new Date(reservation.checkOut)
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

        let progress = 0
        switch (reservation.status) {
          case 'PENDING': progress = 0.25; break
          case 'CONFIRMED': progress = 0.5; break
          case 'CHECKED_IN': progress = 0.75; break
          case 'CHECKED_OUT': progress = 1; break
        }

        ganttTasks.push({
          id: `reservation-${reservation.id}`,
          text: reservation.guestName || 'Guest',
          start_date: gantt.date.date_to_str('%Y-%m-%d')(checkIn),
          duration: nights || 1,
          parent: `property-${property.id}`,
          progress: progress,
          reservationId: reservation.reservationId || reservation.id,
          guestName: reservation.guestName,
          guestEmail: reservation.guestEmail,
          guestPhone: reservation.guestPhone,
          guests: reservation.guests,
          totalAmount: reservation.totalAmount,
          status: reservation.status,
          source: reservation.source,
          notes: reservation.notes || reservation.specialRequests
        })
      })
    })

    console.log('📊 Parsing Gantt data:', ganttTasks.length, 'tasks')

    gantt.parse({ data: ganttTasks, links: [] })

  }, [properties, reservations, ganttReady])

  return (
    <div 
      ref={ganttContainer} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '600px'
      }}
      className="property-calendar"
    />
  )
})

PropertyCalendar.displayName = 'PropertyCalendar'

export default PropertyCalendar

