'use client';

import React from 'react';
import MinimalScheduler from '@/components/scheduler/MinimalScheduler';

const sampleResources = [
  { id: 'r1', name: 'Apartment 1', type: 'apartment', capacity: 4, pricePerNight: 120 },
  { id: 'r2', name: 'Apartment 2', type: 'apartment', capacity: 4, pricePerNight: 150 },
  { id: 'r3', name: 'Studio 1', type: 'studio', capacity: 2, pricePerNight: 80 },
  { id: 'r4', name: 'Studio 2', type: 'studio', capacity: 2, pricePerNight: 90 },
  { id: 'r5', name: 'Family Suite', type: 'suite', capacity: 6, pricePerNight: 200 },
  { id: 'r6', name: 'House Villa 1', type: 'villa', capacity: 8, pricePerNight: 300 },
  { id: 'r7', name: 'House Villa 2', type: 'villa', capacity: 6, pricePerNight: 250 },
  { id: 'r8', name: 'Penthouse Suite', type: 'penthouse', capacity: 6, pricePerNight: 400 },
];

const sampleEvents = [
  {
    id: '1',
    resourceId: 'r1',
    startDate: new Date(2024, 0, 5),
    duration: 3,
    durationUnit: 'd',
    name: 'John Smith',
    eventColor: '#10b981',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: '2',
    resourceId: 'r2',
    startDate: new Date(2024, 0, 8),
    duration: 2,
    durationUnit: 'd',
    name: 'Maria Garcia',
    eventColor: '#3b82f6',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: '3',
    resourceId: 'r3',
    startDate: new Date(2024, 0, 12),
    duration: 5,
    durationUnit: 'd',
    name: 'David Wilson',
    eventColor: '#f59e0b',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: '4',
    resourceId: 'r6',
    startDate: new Date(2024, 0, 15),
    duration: 4,
    durationUnit: 'd',
    name: 'Sarah Johnson',
    eventColor: '#6b7280',
    iconCls: 'b-fa b-fa-user'
  },
  {
    id: '5',
    resourceId: 'r8',
    startDate: new Date(2024, 0, 20),
    duration: 7,
    durationUnit: 'd',
    name: 'Michael Brown',
    eventColor: '#8b5cf6',
    iconCls: 'b-fa b-fa-user'
  }
];

export default function MinimalSchedulerPage() {
  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <MinimalScheduler
        resources={sampleResources}
        events={sampleEvents}
        startDate={new Date(2024, 0, 1)}
        endDate={new Date(2024, 2, 31)}
        viewPreset="hourAndDay"
        columns={[
          { text: 'Property', field: 'name', width: 150 }
        ]}
        height="100vh"
        width="100vw"
      />
    </div>
  );
}