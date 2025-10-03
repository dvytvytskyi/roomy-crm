'use client';

import React, { useEffect, useRef } from 'react';

// Declare Bryntum Scheduler types
declare global {
  interface Window {
    bryntum: {
      Scheduler: any;
      [key: string]: any;
    };
    BryntumScheduler: any;
    schedulerLoaded: boolean;
  }
}

interface Resource {
  id: string;
  name: string;
  type?: string;
  capacity?: number;
  pricePerNight?: number;
}

interface Event {
  id: string;
  resourceId: string;
  startDate: Date;
  duration: number;
  durationUnit: string;
  name: string;
  iconCls?: string;
  eventColor?: string;
}

interface MinimalSchedulerProps {
  resources?: Resource[];
  events?: Event[];
  startDate?: Date;
  endDate?: Date;
  viewPreset?: string;
  columns?: any[];
  height?: number | string;
  width?: number | string;
}

const MinimalScheduler: React.FC<MinimalSchedulerProps> = ({
  resources = [],
  events = [],
  startDate = new Date(),
  endDate = new Date(Date.now() + 24 * 60 * 60 * 1000),
  viewPreset = 'hourAndDay',
  columns = [{ text: 'Name', field: 'name', width: 130 }],
  height = '100vh',
  width = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const schedulerRef = useRef<any>(null);

  useEffect(() => {
    // Check if Bryntum is already loaded globally
    const checkBryntumLoaded = () => {
      if (window.bryntum && window.bryntum.Scheduler) {
        console.log('Bryntum Scheduler already loaded globally');
        initializeScheduler();
        return;
      }
      
      // If not loaded, wait a bit and try again
      setTimeout(() => {
        if (window.bryntum && window.bryntum.Scheduler) {
          console.log('Bryntum Scheduler loaded after delay');
          initializeScheduler();
        } else {
          console.warn('Bryntum Scheduler not found - make sure it\'s loaded globally in _app.tsx or layout.tsx');
        }
      }, 100);
    };

    checkBryntumLoaded();

    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.destroy();
        schedulerRef.current = null;
      }
    };
  }, []);

  const initializeScheduler = () => {
      console.log('Initializing scheduler...');
      console.log('window.bryntum:', !!window.bryntum);
      console.log('window.bryntum.Scheduler:', !!window.bryntum?.Scheduler);
      console.log('containerRef.current:', !!containerRef.current);
      console.log('schedulerRef.current:', !!schedulerRef.current);

      if (window.bryntum && window.bryntum.Scheduler && containerRef.current && !schedulerRef.current) {
        try {
          console.log('Creating scheduler with config:', {
            resources: resources.length,
            events: events.length,
            startDate,
            endDate,
            viewPreset,
            columns: columns.length,
            height,
            width
          });

          schedulerRef.current = new window.bryntum.Scheduler({
            appendTo: containerRef.current,
            resources,
            events,
            startDate,
            endDate,
            viewPreset,
            columns,
            height,
            width,
            watermark: false,
            trial: false
          });
          
          console.log('✅ Bryntum Scheduler initialized successfully');

          // Remove watermark
          const removeWatermark = () => {
            if (containerRef.current) {
              const watermark = containerRef.current.querySelector('.b-watermark');
              if (watermark) {
                watermark.remove();
                console.log('Watermark removed');
              }
            }
          };

          setTimeout(removeWatermark, 100);

        } catch (error) {
          console.error('❌ Error creating scheduler:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            bryntum: !!window.bryntum,
            scheduler: !!window.bryntum?.Scheduler
          });
        }
      } else {
        console.warn('⚠️ Cannot initialize scheduler:', {
          bryntum: !!window.bryntum,
          scheduler: !!window.bryntum?.Scheduler,
          container: !!containerRef.current,
          existing: !!schedulerRef.current
        });
      }
    };

  // Update scheduler data when props change
  useEffect(() => {
    if (schedulerRef.current) {
      schedulerRef.current.resources = resources;
      schedulerRef.current.events = events;
    }
  }, [resources, events]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width, 
        height, 
        margin: 0, 
        padding: 0 
      }} 
    />
  );
};

export default MinimalScheduler;