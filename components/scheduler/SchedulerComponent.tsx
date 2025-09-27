'use client';

import React, { useEffect, useRef } from 'react';
import { RESERVATION_COLORS } from './types';

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
  id: number;
  resourceId: string;
  startDate: Date;
  duration: number;
  durationUnit: string;
  name: string;
  iconCls?: string;
  eventColor?: string;
  readOnly?: boolean;
  style?: string;
  eventStyle?: string;
  reservationType?: string;
  paymentStatus?: string;
  guestStatus?: string;
  amount?: number;
  paidAmount?: number;
}

interface SchedulerComponentProps {
  resources?: Resource[];
  events?: Event[];
  startDate?: Date;
  endDate?: Date;
  viewPreset?: string;
  rowHeight?: number;
  barMargin?: number;
  multiEventSelect?: boolean;
  columns?: any[];
  height?: number | string;
  width?: number | string;
}

const SchedulerComponent: React.FC<SchedulerComponentProps> = ({
  resources = [],
  events = [],
  startDate = new Date(),
  endDate = new Date(Date.now() + 24 * 60 * 60 * 1000),
  viewPreset = 'hourAndDay',
  rowHeight = 50,
  barMargin = 5,
  multiEventSelect = true,
  columns = [{ text: 'Name', field: 'name', width: 130 }],
  height = 600,
  width = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const schedulerRef = useRef<any>(null);

  useEffect(() => {
    console.log('SchedulerComponent useEffect triggered with props:', {
      resources: resources?.length,
      events: events?.length,
      startDate,
      endDate,
      viewPreset
    });
    
    // Load Bryntum Scheduler dynamically
    const loadScheduler = () => {
      console.log('Loading scheduler...');
      
      // Check if Bryntum is already loaded
      if (window.bryntum && window.bryntum.Scheduler) {
        console.log('Bryntum already loaded, initializing...');
        initializeScheduler();
        return;
      }

      // Load CSS if not already loaded
      if (!document.querySelector('link[href="/build/scheduler.stockholm.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/build/scheduler.stockholm.css';
        document.head.appendChild(link);
      }

      // Load the UMD version of scheduler if not already loaded
      if (!document.querySelector('script[src="/build/scheduler.umd.js"]')) {
        console.log('Loading Bryntum script...');
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
          import { Scheduler } from '/build/scheduler.module.js';
          window.bryntum = window.bryntum || {};
          window.bryntum.Scheduler = Scheduler;
          console.log('Bryntum module loaded:', !!window.bryntum.Scheduler);
          window.dispatchEvent(new CustomEvent('bryntumLoaded'));
        `;
        script.onerror = (error) => {
          console.error('Failed to load Bryntum Scheduler module:', error);
        };
        document.head.appendChild(script);
        
        // Listen for the custom event
        window.addEventListener('bryntumLoaded', () => {
          console.log('Bryntum module event received');
          initializeScheduler();
        });
      } else {
        console.log('Bryntum script already loaded');
        initializeScheduler();
      }
    };

    const initializeScheduler = () => {
      console.log('Initializing scheduler...');
      console.log('Bryntum available:', !!window.bryntum);
      console.log('Scheduler available:', !!(window.bryntum && window.bryntum.Scheduler));
      console.log('Container available:', !!containerRef.current);
      console.log('Scheduler ref:', !!schedulerRef.current);
      
      if (window.bryntum && window.bryntum.Scheduler && containerRef.current && !schedulerRef.current) {
        console.log('Creating scheduler with data:', { resources, events, startDate, endDate });
        
        try {
          schedulerRef.current = new window.bryntum.Scheduler({
            appendTo: containerRef.current,
            resources,
            events,
            startDate,
            endDate,
            viewPreset,
            rowHeight,
            barMargin,
            multiEventSelect,
            columns,
            height,
            width,
            // Hide watermark
            watermark: false,
            // Alternative approach - hide trial message
            trial: false,
            // Event editor configuration
            eventEdit: {
              items: {
                nameField: { type: 'text', name: 'name', label: 'NAME', required: true },
                resourceField: { type: 'combo', name: 'resourceId', label: 'RESOURCE', required: true },
                startDateField: { type: 'date', name: 'startDate', label: 'START' },
                endDateField: { type: 'date', name: 'endDate', label: 'END' },
                // Add custom fields for reservation management
                reservationTypeField: {
                  type: 'combo',
                  name: 'reservationType',
                  label: 'RESERVATION TYPE',
                  items: [
                    { id: 'confirmed', text: 'Confirmed reservation' },
                    { id: 'owner_confirmed', text: 'Confirmed owner\'s reservation' },
                    { id: 'reserved', text: 'Reserved reservation' },
                    { id: 'block', text: 'No availability' }
                  ],
                  value: 'confirmed'
                },
                paymentStatusField: {
                  type: 'combo',
                  name: 'paymentStatus',
                  label: 'PAYMENT STATUS',
                  items: [
                    { id: 'fully_paid', text: 'Fully paid' },
                    { id: 'partially_paid', text: 'Partially paid' },
                    { id: 'unpaid', text: 'Unpaid' }
                  ],
                  value: 'unpaid'
                },
                guestStatusField: {
                  type: 'combo',
                  name: 'guestStatus',
                  label: 'GUEST STATUS',
                  items: [
                    { id: 'upcoming', text: 'Upcoming stay' },
                    { id: 'checked_in', text: 'Checked-in' },
                    { id: 'checked_out', text: 'Checked-out' },
                    { id: 'no_show', text: 'No show' }
                  ],
                  value: 'upcoming'
                },
                amountField: {
                  type: 'number',
                  name: 'amount',
                  label: 'AMOUNT',
                  min: 0,
                  step: 0.01
                },
                paidAmountField: {
                  type: 'number',
                  name: 'paidAmount',
                  label: 'PAID AMOUNT',
                  min: 0,
                  step: 0.01
                }
              }
            }
          });
          
          console.log('Scheduler created successfully:', schedulerRef.current);
          
          // Add event listeners for dynamic color updates
          if (schedulerRef.current) {
            // Update color when event is saved
            schedulerRef.current.on('eventSave', (event: any) => {
              console.log('Event saved:', event);
              if (event.record) {
                const reservationType = event.record.reservationType;
                if (reservationType && RESERVATION_COLORS[reservationType as keyof typeof RESERVATION_COLORS]) {
                  event.record.eventColor = RESERVATION_COLORS[reservationType as keyof typeof RESERVATION_COLORS];
                }
              }
            });

            // Update color when event editor fields change
            schedulerRef.current.on('eventEdit', (event: any) => {
              if (event.editor) {
                const editor = event.editor;
                
                // Listen for changes in reservation type field
                const reservationTypeField = editor.widgetMap.reservationTypeField;
                if (reservationTypeField) {
                  reservationTypeField.on('change', (changeEvent: any) => {
                    const newType = changeEvent.value;
                    if (newType && RESERVATION_COLORS[newType as keyof typeof RESERVATION_COLORS]) {
                      // Update the event color preview
                      const eventRecord = editor.eventRecord;
                      if (eventRecord) {
                        eventRecord.eventColor = RESERVATION_COLORS[newType as keyof typeof RESERVATION_COLORS];
                        editor.refresh();
                      }
                    }
                  });
                }
              }
            });
          }
        } catch (error) {
          console.error('Error creating scheduler:', error);
        }

          // Function to remove watermark
          const removeWatermark = () => {
            if (!containerRef.current) return;

            const watermarks = containerRef.current.querySelectorAll('[class*="watermark"], [class*="trial"]');
            watermarks.forEach(watermark => {
              (watermark as HTMLElement).style.display = 'none';
              (watermark as HTMLElement).style.visibility = 'hidden';
              (watermark as HTMLElement).style.opacity = '0';
            });

            // Remove background watermark from subgrid elements
            const subgrids = containerRef.current.querySelectorAll('.b-grid-subgrid, .b-timeline-subgrid, [data-region="normal"]');
            subgrids.forEach(subgrid => {
              const element = subgrid as HTMLElement;
              element.style.backgroundImage = 'none';
              element.style.background = 'transparent';
            });

            // Remove any elements with SVG background watermarks
            const elementsWithWatermark = containerRef.current.querySelectorAll('*[style*="background-image"]');
            elementsWithWatermark.forEach(element => {
              const style = (element as HTMLElement).style.backgroundImage;
              if (style && (style.includes('data:image/svg+xml') || style.includes('bryntum') || style.includes('trial'))) {
                (element as HTMLElement).style.backgroundImage = 'none';
                (element as HTMLElement).style.background = 'transparent';
              }
            });
          };

          // Remove watermark immediately and then periodically
          removeWatermark();
          const watermarkInterval = setInterval(removeWatermark, 500);
          
          // Clear interval after 5 seconds
          setTimeout(() => {
            clearInterval(watermarkInterval);
          }, 5000);
        }
      };

    loadScheduler();

    // Cleanup
    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.destroy();
        schedulerRef.current = null;
      }
    };
  }, []);

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
      className="h-full w-full"
      style={{ 
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        minHeight: '400px'
      }}
    />
  );
};

export default SchedulerComponent;
