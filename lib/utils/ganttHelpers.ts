/**
 * DHTMLX Gantt Helper Functions for Roomy CRM
 * Utility functions to work with DHTMLX Gantt API
 */

declare global {
  interface Window {
    gantt: any
  }
}

export const GanttHelpers = {
  /**
   * Check if Gantt is loaded and initialized
   */
  isGanttReady: (): boolean => {
    return typeof window !== 'undefined' && !!window.gantt
  },

  /**
   * Get Gantt instance
   */
  getGantt: () => {
    if (typeof window !== 'undefined') {
      return window.gantt
    }
    return null
  },

  /**
   * Format reservation data for Gantt
   */
  formatReservationForGantt: (reservation: any, propertyId: string) => {
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

    const gantt = GanttHelpers.getGantt()
    const dateStr = gantt?.date?.date_to_str('%Y-%m-%d')

    return {
      id: `reservation-${reservation.id}`,
      text: reservation.guestName || 'Guest',
      start_date: dateStr ? dateStr(checkIn) : checkIn.toISOString().split('T')[0],
      duration: nights || 1,
      parent: `property-${propertyId}`,
      progress: progress,
      type: 'task',
      // Custom fields
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
  },

  /**
   * Format property data for Gantt
   */
  formatPropertyForGantt: (property: any, reservations: any[] = []) => {
    const gantt = GanttHelpers.getGantt()
    const dateStr = gantt?.date?.date_to_str('%Y-%m-%d')

    // Calculate date range from reservations
    let minDate = new Date()
    let maxDate = new Date(minDate.getTime() + 90 * 24 * 60 * 60 * 1000)

    if (reservations.length > 0) {
      const dates = reservations.flatMap((res: any) => [
        new Date(res.checkIn),
        new Date(res.checkOut)
      ])
      minDate = new Date(Math.min(...dates.map(d => d.getTime())))
      const maxReservationDate = new Date(Math.max(...dates.map(d => d.getTime())))
      maxDate = new Date(Math.max(maxReservationDate.getTime(), maxDate.getTime()))
    }

    return {
      id: `property-${property.id}`,
      text: property.name || property.nickname || 'Unnamed Property',
      start_date: dateStr ? dateStr(minDate) : minDate.toISOString().split('T')[0],
      end_date: dateStr ? dateStr(maxDate) : maxDate.toISOString().split('T')[0],
      type: 'property',
      open: true,
      readonly: true,
      // Custom fields
      image: property.primaryImage || (property.photos && property.photos[0]?.url),
      address: property.address,
      city: property.city,
      capacity: property.capacity,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      pricePerNight: property.pricePerNight,
      propertyType: property.type
    }
  },

  /**
   * Configure Gantt for calendar view
   */
  configureForCalendar: (gantt: any) => {
    // Basic settings
    gantt.config.date_format = '%Y-%m-%d'
    gantt.config.scale_height = 80
    gantt.config.row_height = 50
    gantt.config.autosize = 'y'
    
    // Drag & drop
    gantt.config.drag_move = true
    gantt.config.drag_resize = true
    gantt.config.drag_progress = false
    gantt.config.drag_links = false
    
    // Display
    gantt.config.show_grid = true
    gantt.config.show_chart = true
    gantt.config.show_task_cells = true
    gantt.config.details_on_dblclick = true
    
    // Work time
    gantt.config.work_time = true
    gantt.config.skip_off_time = false
  },

  /**
   * Add today marker
   */
  addTodayMarker: (gantt: any) => {
    const today = new Date()
    gantt.addMarker({
      start_date: today,
      css: 'today-marker',
      text: 'Today',
      title: `Today: ${today.toLocaleDateString()}`
    })
  },

  /**
   * Scroll to today
   */
  scrollToToday: (gantt: any) => {
    const today = new Date()
    gantt.showDate(today)
  },

  /**
   * Set view mode (day/week/month)
   */
  setViewMode: (gantt: any, mode: 'day' | 'week' | 'month') => {
    switch (mode) {
      case 'day':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'day', step: 1, format: '%d', css: (date: Date) => {
            const day = date.getDay()
            return (day === 0 || day === 6) ? 'weekend-scale' : ''
          }}
        ]
        break
      case 'week':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'week', step: 1, format: 'Week #%W' }
        ]
        break
      case 'month':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'month', step: 1, format: '%M' }
        ]
        break
    }
    gantt.render()
  },

  /**
   * Get status color for reservation
   */
  getStatusColor: (status: string): string => {
    const colors: any = {
      'PENDING': '#f59e0b',
      'CONFIRMED': '#10b981',
      'CHECKED_IN': '#3b82f6',
      'CHECKED_OUT': '#6b7280',
      'CANCELLED': '#ef4444'
    }
    return colors[status] || '#6b7280'
  },

  /**
   * Get status gradient for task bar
   */
  getStatusGradient: (status: string): string => {
    const gradients: any = {
      'PENDING': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      'CONFIRMED': 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      'CHECKED_IN': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      'CHECKED_OUT': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
      'CANCELLED': 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
    }
    return gradients[status] || gradients['CONFIRMED']
  },

  /**
   * Get source icon
   */
  getSourceIcon: (source: string): string => {
    const icons: any = {
      'AIRBNB': '🏠',
      'BOOKING_COM': '🅱️',
      'VRBO': '🏡',
      'DIRECT': '👤',
      'MANUAL': '✏️',
      'EXPEDIA': '✈️'
    }
    return icons[source] || '📅'
  },

  /**
   * Get source label
   */
  getSourceLabel: (source: string): string => {
    const labels: any = {
      'AIRBNB': '🏠 Airbnb Booking',
      'BOOKING_COM': '🅱️ Booking.com',
      'VRBO': '🏡 Vrbo',
      'DIRECT': '👤 Direct Booking',
      'MANUAL': '✏️ Manual Entry',
      'EXPEDIA': '✈️ Expedia'
    }
    return labels[source] || '📅 Reservation'
  },

  /**
   * Check if date is weekend
   */
  isWeekend: (date: Date): boolean => {
    const day = date.getDay()
    return day === 0 || day === 6
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number): string => {
    return `AED ${amount.toLocaleString()}`
  }
}

