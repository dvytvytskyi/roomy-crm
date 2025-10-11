'use client'

import { useEffect, useRef } from 'react'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'

export default function TestGantt() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Gantt
    gantt.init(containerRef.current)

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

    gantt.parse(tasks)

    return () => {
      gantt.destructor()
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
