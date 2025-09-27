'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

const RESERVATION_TYPES = [
  { type: 'confirmed', label: 'Confirmed reservation', color: '#10b981' },
  { type: 'owner_confirmed', label: 'Confirmed owner\'s reservation', color: '#3b82f6' },
  { type: 'reserved', label: 'Reserved reservation', color: '#f59e0b' },
  { type: 'block', label: 'No availability', color: '#6b7280' },
];

const PAYMENT_STATUSES = [
  { status: 'fully_paid', label: 'Fully paid', color: '#10b981' },
  { status: 'partially_paid', label: 'Partially paid', color: '#f59e0b' },
  { status: 'unpaid', label: 'Unpaid', color: '#ef4444' },
];

const GUEST_STATUSES = [
  { status: 'upcoming', label: 'Upcoming stay', color: '#8b5cf6' },
  { status: 'checked_in', label: 'Checked-in', color: '#06b6d4' },
  { status: 'checked_out', label: 'Checked-out', color: '#6b7280' },
  { status: 'no_show', label: 'No show', color: '#ef4444' },
];

interface ReservationTooltipProps {
  className?: string;
}

const ReservationTooltip: React.FC<ReservationTooltipProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <Info size={14} className="text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Reservation Status Guide</h3>
          
          {/* Reservation Types */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Reservation Types</h4>
            <div className="space-y-1">
              {RESERVATION_TYPES.map((item) => (
                <div key={item.type} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Status</h4>
            <div className="space-y-1">
              {PAYMENT_STATUSES.map((item) => (
                <div key={item.status} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Guest Status</h4>
            <div className="space-y-1">
              {GUEST_STATUSES.map((item) => (
                <div key={item.status} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationTooltip;
