'use client';

import React from 'react';
import SchedulerComponent from './SchedulerComponent';
import TopNavigation from '../TopNavigation';
import ReservationTooltip from './ReservationTooltip';
import { Reservation, Property, RESERVATION_COLORS } from './types';

// Sample data for the scheduler - Properties for booking (30 apartments)
const sampleResources: Property[] = [
  { id: 'r1', name: 'Apartment 1A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r2', name: 'Apartment 1B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r3', name: 'Apartment 2A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r4', name: 'Apartment 2B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r5', name: 'Apartment 3A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r6', name: 'Apartment 3B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r7', name: 'Apartment 4A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r8', name: 'Apartment 4B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r9', name: 'Apartment 5A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r10', name: 'Apartment 5B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r11', name: 'Apartment 6A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r12', name: 'Apartment 6B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r13', name: 'Apartment 7A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r14', name: 'Apartment 7B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r15', name: 'Apartment 8A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r16', name: 'Apartment 8B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r17', name: 'Apartment 9A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r18', name: 'Apartment 9B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r19', name: 'Apartment 10A', type: 'apartment', capacity: 2, pricePerNight: 120 },
  { id: 'r20', name: 'Apartment 10B', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r21', name: 'House Villa 1', type: 'villa', capacity: 8, pricePerNight: 300 },
  { id: 'r22', name: 'House Villa 2', type: 'villa', capacity: 6, pricePerNight: 250 },
  { id: 'r23', name: 'House Villa 3', type: 'villa', capacity: 8, pricePerNight: 300 },
  { id: 'r24', name: 'Penthouse Suite A', type: 'penthouse', capacity: 6, pricePerNight: 400 },
  { id: 'r25', name: 'Penthouse Suite B', type: 'penthouse', capacity: 4, pricePerNight: 350 },
  { id: 'r26', name: 'Studio Loft 1', type: 'studio', capacity: 2, pricePerNight: 100 },
  { id: 'r27', name: 'Studio Loft 2', type: 'studio', capacity: 2, pricePerNight: 100 },
  { id: 'r28', name: 'Cottage 1', type: 'cottage', capacity: 4, pricePerNight: 180 },
  { id: 'r29', name: 'Cottage 2', type: 'cottage', capacity: 4, pricePerNight: 180 },
  { id: 'r30', name: 'Beach House', type: 'beach_house', capacity: 6, pricePerNight: 280 }
];

const sampleEvents: Reservation[] = [
  // January bookings
  {
    id: 1,
    resourceId: 'r1',
    startDate: new Date(2024, 0, 5),
    duration: 3,
    durationUnit: 'd',
    name: 'John Smith',
    reservationType: 'confirmed',
    paymentStatus: 'fully_paid',
    guestStatus: 'upcoming',
    amount: 360,
    paidAmount: 360,
    guestCount: 2,
    eventColor: RESERVATION_COLORS.confirmed,
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 2,
    resourceId: 'r2',
    startDate: new Date(2024, 0, 8),
    duration: 2,
    durationUnit: 'd',
    name: 'Maria Garcia',
    reservationType: 'owner_confirmed',
    paymentStatus: 'partially_paid',
    guestStatus: 'checked_in',
    amount: 300,
    paidAmount: 150,
    guestCount: 4,
    eventColor: RESERVATION_COLORS.owner_confirmed,
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 3,
    resourceId: 'r3',
    startDate: new Date(2024, 0, 12),
    duration: 5,
    durationUnit: 'd',
    name: 'David Wilson',
    reservationType: 'reserved',
    paymentStatus: 'unpaid',
    guestStatus: 'upcoming',
    amount: 600,
    paidAmount: 0,
    guestCount: 3,
    eventColor: RESERVATION_COLORS.reserved,
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 4,
    resourceId: 'r4',
    startDate: new Date(2024, 0, 15),
    duration: 4,
    durationUnit: 'd',
    name: 'Sarah Johnson',
    reservationType: 'confirmed',
    paymentStatus: 'fully_paid',
    guestStatus: 'checked_out',
    amount: 600,
    paidAmount: 600,
    guestCount: 2,
    eventColor: RESERVATION_COLORS.checked_out,
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 5,
    resourceId: 'r5',
    startDate: new Date(2024, 0, 20),
    duration: 7,
    durationUnit: 'd',
    name: 'Michael Brown',
    reservationType: 'block',
    paymentStatus: 'unpaid',
    guestStatus: 'no_show',
    amount: 840,
    paidAmount: 0,
    guestCount: 1,
    eventColor: RESERVATION_COLORS.block,
    iconCls: 'b-fa b-fa-ban'
  },
  // February bookings
  {
    id: 6,
    resourceId: 'r6',
    startDate: new Date(2024, 1, 2),
    duration: 3,
    durationUnit: 'd',
    name: 'Emma Davis',
    eventColor: 'pink',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 7,
    resourceId: 'r7',
    startDate: new Date(2024, 1, 8),
    duration: 6,
    durationUnit: 'd',
    name: 'James Miller',
    eventColor: 'red',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 8,
    resourceId: 'r8',
    startDate: new Date(2024, 1, 14),
    duration: 4,
    durationUnit: 'd',
    name: 'Lisa Anderson',
    eventColor: 'yellow',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 9,
    resourceId: 'r9',
    startDate: new Date(2024, 1, 20),
    duration: 5,
    durationUnit: 'd',
    name: 'Robert Taylor',
    eventColor: 'indigo',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 10,
    resourceId: 'r10',
    startDate: new Date(2024, 1, 25),
    duration: 2,
    durationUnit: 'd',
    name: 'Jennifer White',
    eventColor: 'green',
    iconCls: 'b-fa b-fa-user'
  },
  // March bookings
  {
    id: 11,
    resourceId: 'r11',
    startDate: new Date(2024, 2, 3),
    duration: 4,
    durationUnit: 'd',
    name: 'Christopher Lee',
    eventColor: 'blue',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 12,
    resourceId: 'r12',
    startDate: new Date(2024, 2, 10),
    duration: 7,
    durationUnit: 'd',
    name: 'Amanda Clark',
    eventColor: 'orange',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 13,
    resourceId: 'r13',
    startDate: new Date(2024, 2, 18),
    duration: 3,
    durationUnit: 'd',
    name: 'Daniel Rodriguez',
    eventColor: 'purple',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 14,
    resourceId: 'r14',
    startDate: new Date(2024, 2, 22),
    duration: 5,
    durationUnit: 'd',
    name: 'Michelle Martinez',
    eventColor: 'teal',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 15,
    resourceId: 'r15',
    startDate: new Date(2024, 2, 28),
    duration: 6,
    durationUnit: 'd',
    name: 'Kevin Thompson',
    eventColor: 'pink',
    iconCls: 'b-fa b-fa-user'
  },
  // Additional bookings for more apartments
  {
    id: 16,
    resourceId: 'r16',
    startDate: new Date(2024, 0, 10),
    duration: 4,
    durationUnit: 'd',
    name: 'Anna Kowalski',
    eventColor: 'green',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 17,
    resourceId: 'r17',
    startDate: new Date(2024, 0, 18),
    duration: 3,
    durationUnit: 'd',
    name: 'Tom Anderson',
    eventColor: 'blue',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 18,
    resourceId: 'r18',
    startDate: new Date(2024, 1, 5),
    duration: 7,
    durationUnit: 'd',
    name: 'Sophie Martin',
    eventColor: 'purple',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 19,
    resourceId: 'r19',
    startDate: new Date(2024, 1, 12),
    duration: 5,
    durationUnit: 'd',
    name: 'Carlos Rodriguez',
    eventColor: 'orange',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 20,
    resourceId: 'r20',
    startDate: new Date(2024, 1, 22),
    duration: 4,
    durationUnit: 'd',
    name: 'Emma Wilson',
    eventColor: 'teal',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 21,
    resourceId: 'r21',
    startDate: new Date(2024, 2, 8),
    duration: 6,
    durationUnit: 'd',
    name: 'Alex Chen',
    eventColor: 'red',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 22,
    resourceId: 'r22',
    startDate: new Date(2024, 2, 15),
    duration: 3,
    durationUnit: 'd',
    name: 'Lisa Park',
    eventColor: 'yellow',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 23,
    resourceId: 'r23',
    startDate: new Date(2024, 2, 25),
    duration: 5,
    durationUnit: 'd',
    name: 'Mark Johnson',
    eventColor: 'indigo',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 24,
    resourceId: 'r24',
    startDate: new Date(2024, 0, 25),
    duration: 8,
    durationUnit: 'd',
    name: 'Victoria Smith',
    eventColor: 'pink',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 25,
    resourceId: 'r25',
    startDate: new Date(2024, 1, 16),
    duration: 6,
    durationUnit: 'd',
    name: 'James Brown',
    eventColor: 'green',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 26,
    resourceId: 'r26',
    startDate: new Date(2024, 2, 5),
    duration: 4,
    durationUnit: 'd',
    name: 'Maria Garcia',
    eventColor: 'blue',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 27,
    resourceId: 'r27',
    startDate: new Date(2024, 0, 30),
    duration: 5,
    durationUnit: 'd',
    name: 'David Lee',
    eventColor: 'purple',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 28,
    resourceId: 'r28',
    startDate: new Date(2024, 1, 28),
    duration: 7,
    durationUnit: 'd',
    name: 'Sarah Davis',
    eventColor: 'orange',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 29,
    resourceId: 'r29',
    startDate: new Date(2024, 2, 12),
    duration: 3,
    durationUnit: 'd',
    name: 'Michael White',
    eventColor: 'teal',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: 30,
    resourceId: 'r30',
    startDate: new Date(2024, 0, 22),
    duration: 10,
    durationUnit: 'd',
    name: 'Jennifer Taylor',
    eventColor: 'red',
    iconCls: 'b-fa b-fa-user'
  }
];

const SchedulerExample: React.FC = () => {
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0" style={{ marginTop: '64px' }}>
        {/* Header */}
        <div className="px-2 sm:px-3 lg:px-4 py-1.5 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Scheduler</h1>
                <p className="text-sm text-slate-600 mt-1">Manage your schedule and resources</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer">
                    <span>New Event</span>
                  </button>
                  <ReservationTooltip />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduler Content */}
        <div className="flex-1 px-2 sm:px-3 lg:px-4 pb-2">
          <div className="bg-white rounded-xl border border-gray-200 h-full overflow-hidden">
            <SchedulerComponent
              resources={sampleResources}
              events={sampleEvents}
              startDate={new Date(2024, 0, 1)}
              endDate={new Date(2024, 2, 31)}
              viewPreset="dayAndWeek"
              rowHeight={50}
              barMargin={5}
              multiEventSelect={true}
              columns={[
                { text: 'Property', field: 'name', width: 130 }
              ]}
              height="100%"
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerExample;
