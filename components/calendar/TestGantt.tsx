'use client'

import { useEffect, useRef } from 'react'

// Declare gantt on window object
declare global {
  interface Window {
    gantt: any
  }
}

export default function TestGantt() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadGantt = () => {
      // Load CSS
      if (!document.querySelector('link[href="/dhtmlxGantt/codebase/dhtmlxgantt.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '/dhtmlxGantt/codebase/dhtmlxgantt.css'
        document.head.appendChild(link)
      }

      // Load JS
      if (!window.gantt) {
        const script = document.createElement('script')
        script.src = '/dhtmlxGantt/codebase/dhtmlxgantt.js'
        script.async = true
        
        script.onload = () => {
          console.log('✅ DHTMLX Gantt loaded successfully')
          initializeGantt()
        }
        
        script.onerror = () => {
          console.error('❌ Failed to load DHTMLX Gantt')
        }
        
        document.head.appendChild(script)
      } else {
        initializeGantt()
      }
    }

    const initializeGantt = () => {
      if (!containerRef.current || !window.gantt) return

      console.log('✅ Initializing Gantt with local files...')
      
      // Initialize Gantt
      window.gantt.init(containerRef.current)

      // Add sample data
      const tasks = {
        data: [
          {
            id: "1",
            text: "Property 1",
            start_date: "2025-04-15",
            duration: 3,
            type: "property"
          },
          {
            id: "2", 
            text: "Reservation 1",
            start_date: "2025-04-15",
            duration: 2,
            parent: "1",
            type: "task"
          }
        ],
        links: []
      }

      window.gantt.parse(tasks)
    }

    loadGantt()

    return () => {
      if (window.gantt) {
        window.gantt.destructor()
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '400px' }}
    />
  )
}
