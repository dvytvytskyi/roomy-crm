'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RESERVATION_COLORS } from './types';
import AdditionalReservationModal from './AdditionalReservationModal';

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
  guestCount?: number;
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
  
  // State for additional reservation modal
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);
  const [savedReservationData, setSavedReservationData] = useState<any>(null);

  // Log modal state changes
  useEffect(() => {
    console.log('🔄 Modal state changed:', { showAdditionalModal, hasData: !!savedReservationData });
  }, [showAdditionalModal, savedReservationData]);

  useEffect(() => {
    // console.log('SchedulerComponent useEffect triggered with props:', { resources: resources?.length, events: events?.length, startDate, endDate, viewPreset }); // Disabled to reduce console spam
    
    // Load Bryntum Scheduler dynamically
    const loadScheduler = () => {
      // console.log('Loading scheduler...'); // Disabled to reduce console spam
      
      // Check if Bryntum is already loaded
      if (window.bryntum && window.bryntum.Scheduler) {
        // console.log('Bryntum already loaded, initializing...'); // Disabled to reduce console spam
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

      // Load custom modal styles
      if (!document.querySelector('link[href="/components/scheduler/SchedulerModal.css"]')) {
        const customLink = document.createElement('link');
        customLink.rel = 'stylesheet';
        customLink.href = '/components/scheduler/SchedulerModal.css';
        document.head.appendChild(customLink);
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
          // console.log('Bryntum module loaded:', !!window.bryntum.Scheduler); // Disabled to reduce console spam
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
        // console.log('Initializing scheduler...'); // Disabled to reduce console spam
        // console.log('Bryntum available:', !!window.bryntum);
        // console.log('Scheduler available:', !!(window.bryntum && window.bryntum.Scheduler));
        // console.log('Container available:', !!containerRef.current);
        // console.log('Scheduler ref:', !!schedulerRef.current);
      
      if (window.bryntum && window.bryntum.Scheduler && containerRef.current && !schedulerRef.current) {
        // console.log('Creating scheduler with data:', { resources, events, startDate, endDate }); // Disabled to reduce console spam
        
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
              title: 'Edit Reservation',
              modal: true,
              width: 500,
              height: 'auto',
              resizable: true,
              items: {
                // Basic information section
                nameField: { 
                  type: 'text', 
                  name: 'name', 
                  label: 'GUEST NAME', 
                  required: true,
                  placeholder: 'Enter guest name',
                  flex: 1
                },
                resourceField: { 
                  type: 'combo', 
                  name: 'resourceId', 
                  label: 'PROPERTY', 
                  required: true,
                  placeholder: 'Select property',
                  flex: 1
                },
                guestCountField: {
                  type: 'number',
                  name: 'guestCount',
                  label: 'NUMBER OF GUESTS',
                  min: 1,
                  max: 20,
                  value: 1,
                  required: true,
                  placeholder: 'Enter number of guests',
                  flex: 1,
                  tooltip: 'Enter the total number of guests for this reservation'
                },
                
                // Date and time section
                dateTimeSection: {
                  type: 'fieldset',
                  title: 'Date & Time',
                  items: {
                    startDateField: { 
                      type: 'date', 
                      name: 'startDate', 
                      label: 'CHECK-IN DATE',
                      required: true,
                      flex: 1
                    },
                    endDateField: { 
                      type: 'date', 
                      name: 'endDate', 
                      label: 'CHECK-OUT DATE',
                      required: true,
                      flex: 1
                    }
                  }
                },
                
                // Status section
                statusSection: {
                  type: 'fieldset',
                  title: 'Reservation Status',
                  items: {
                    reservationTypeField: {
                      type: 'combo',
                      name: 'reservationType',
                      label: 'RESERVATION TYPE',
                      items: [
                        { id: 'confirmed', text: '✅ Confirmed reservation' },
                        { id: 'owner_confirmed', text: '🏠 Owner\'s reservation' },
                        { id: 'reserved', text: '⏳ Reserved (pending)' },
                        { id: 'block', text: '🚫 Blocked (no availability)' }
                      ],
                      value: 'confirmed',
                      flex: 1
                    },
                    paymentStatusField: {
                      type: 'combo',
                      name: 'paymentStatus',
                      label: 'PAYMENT STATUS',
                      items: [
                        { id: 'fully_paid', text: '💚 Fully paid' },
                        { id: 'partially_paid', text: '🟡 Partially paid' },
                        { id: 'unpaid', text: '🔴 Unpaid' }
                      ],
                      value: 'unpaid',
                      flex: 1
                    },
                    guestStatusField: {
                      type: 'combo',
                      name: 'guestStatus',
                      label: 'GUEST STATUS',
                      items: [
                        { id: 'upcoming', text: '📅 Upcoming stay' },
                        { id: 'checked_in', text: '🏠 Checked-in' },
                        { id: 'checked_out', text: '✅ Checked-out' },
                        { id: 'no_show', text: '❌ No show' }
                      ],
                      value: 'upcoming',
                      flex: 1
                    }
                  }
                },
                
                // Financial section
                financialSection: {
                  type: 'fieldset',
                  title: 'Financial Information',
                  items: {
                    amountField: {
                      type: 'number',
                      name: 'amount',
                      label: 'TOTAL AMOUNT (AED)',
                      min: 0,
                      step: 0.01,
                      placeholder: '0.00',
                      flex: 1
                    },
                    paidAmountField: {
                      type: 'number',
                      name: 'paidAmount',
                      label: 'PAID AMOUNT (AED)',
                      min: 0,
                      step: 0.01,
                      placeholder: '0.00',
                      flex: 1
                    }
                  }
                }
              },
              bbar: {
                items: {
                  saveButton: {
                    type: 'button',
                    text: '💾 Save Changes',
                    cls: 'b-button-primary',
                    onClick: 'up.onSave'
                  },
                  cancelButton: {
                    type: 'button',
                    text: '❌ Cancel',
                    onClick: 'up.onCancel'
                  }
                }
              }
            }
          });
          
          // console.log('Scheduler created successfully:', schedulerRef.current); // Disabled to reduce console spam
          
          // Add event listeners for dynamic color updates
          if (schedulerRef.current) {
            // console.log('🔧 Adding event listeners to scheduler...'); // Disabled to reduce console spam
            
            // Update color when event is saved and open additional modal
            schedulerRef.current.on('eventSave', (event: any) => {
              console.log('📝 Event saved event triggered:', event);
              if (event.record) {
                const reservationType = event.record.reservationType;
                if (reservationType && RESERVATION_COLORS[reservationType as keyof typeof RESERVATION_COLORS]) {
                  event.record.eventColor = RESERVATION_COLORS[reservationType as keyof typeof RESERVATION_COLORS];
                }
                
                console.log('📋 Storing reservation data and opening modal...');
                
                // Store reservation data and open additional modal
                setSavedReservationData({
                  name: event.record.name,
                  resourceId: event.record.resourceId,
                  startDate: event.record.startDate,
                  endDate: event.record.endDate,
                  amount: event.record.amount,
                  reservationType: event.record.reservationType,
                  paymentStatus: event.record.paymentStatus,
                  guestStatus: event.record.guestStatus,
                  guestCount: event.record.guestCount
                });
                
                // Open additional modal immediately
                console.log('🚀 Opening additional modal immediately...');
                setShowAdditionalModal(true);
              }
            });

            // Alternative event listeners for different Bryntum versions
            schedulerRef.current.on('eventUpdate', (event: any) => {
              // console.log('📝 Event update event triggered:', event); // Disabled to reduce console spam
              if (event.record && event.record.isModified) {
                // console.log('📋 Event was modified, opening additional modal...'); // Disabled to reduce console spam
                setSavedReservationData({
                  name: event.record.name,
                  resourceId: event.record.resourceId,
                  startDate: event.record.startDate,
                  endDate: event.record.endDate,
                  amount: event.record.amount,
                  reservationType: event.record.reservationType,
                  paymentStatus: event.record.paymentStatus,
                  guestStatus: event.record.guestStatus,
                  guestCount: event.record.guestCount
                });
                
                setTimeout(() => {
                  setShowAdditionalModal(true);
                }, 500);
              }
            });

            // Listen for event editor and override save button
            schedulerRef.current.on('eventEdit', (event: any) => {
              // console.log('📝 Event edit event triggered:', event); // Disabled to reduce console spam
              if (event.editor) {
                const editor = event.editor;
                
                // Override the save button behavior
                const saveButton = editor.widgetMap?.saveButton;
                if (saveButton) {
                  // console.log('🔧 Overriding save button behavior...'); // Disabled to reduce console spam
                  saveButton.on('click', () => {
                  console.log('💾 Save button clicked in editor');
                  // Get the form data
                  const formData = editor.getFormData();
                  console.log('📋 Form data:', formData);
                  
                  // Store reservation data
                setSavedReservationData({
                  name: formData.name,
                  resourceId: formData.resourceId,
                  startDate: formData.startDate,
                  endDate: formData.endDate,
                  amount: formData.amount,
                  reservationType: formData.reservationType,
                  paymentStatus: formData.paymentStatus,
                  guestStatus: formData.guestStatus,
                  guestCount: formData.guestCount
                });
                  
                  // Close the editor first
                  editor.hide();
                  
                  // Open additional modal immediately
                  console.log('🚀 Opening additional modal from save button immediately...');
                  setShowAdditionalModal(true);
                  });
                }
                
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

  // Handle additional reservation data save
  const handleAdditionalDataSave = (additionalData: any) => {
    // console.log('Additional reservation data saved:', additionalData); // Disabled to reduce console spam
    
    // Here you can make an API call to save the additional data
    // For now, we'll just log it
    const completeReservationData = {
      ...savedReservationData,
      ...additionalData
    };
    
    // console.log('Complete reservation data:', completeReservationData); // Disabled to reduce console spam
    
    // TODO: Make API call to save additional reservation details
    // await reservationService.updateReservation(savedReservationData.id, completeReservationData);
  };

  // Test function to manually open the modal
  const testOpenModal = () => {
    console.log('🧪 Testing modal opening...');
    const testData = {
      name: 'Test Guest',
      resourceId: 'Property A',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      amount: 500,
      reservationType: 'confirmed',
      paymentStatus: 'unpaid',
      guestStatus: 'upcoming',
      guestCount: 2
    };
    console.log('🧪 Setting test data:', testData);
    setSavedReservationData(testData);
    console.log('🧪 Setting showAdditionalModal to true');
    setShowAdditionalModal(true);
  };

  return (
    <>
      {/* Test button for development */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 mb-2">Development Tools:</p>
        <button
          onClick={testOpenModal}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
        >
          🧪 Test Additional Modal
        </button>
      </div>
      
      <div 
        ref={containerRef} 
        className="h-full w-full"
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height,
          width: typeof width === 'number' ? `${width}px` : width,
          minHeight: '400px'
        }}
      />
      
      {/* Additional Reservation Modal */}
      <AdditionalReservationModal
        isOpen={showAdditionalModal}
        onClose={() => setShowAdditionalModal(false)}
        onSave={handleAdditionalDataSave}
        reservationData={savedReservationData}
      />
    </>
  );
};

export default SchedulerComponent;
