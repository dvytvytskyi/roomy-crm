// Reservation types and statuses
export type ReservationType = 
  | 'confirmed'           // Confirmed reservation
  | 'owner_confirmed'     // Confirmed owner's reservation
  | 'reserved'            // Reserved reservation
  | 'block';              // No availability block

export type PaymentStatus = 
  | 'fully_paid'          // Fully paid
  | 'partially_paid'      // Partially paid
  | 'unpaid';             // Unpaid

export type GuestStatus = 
  | 'upcoming'            // Upcoming stay
  | 'checked_in'          // Checked-in
  | 'checked_out'         // Checked-out
  | 'no_show';            // No show

// Color mapping for different statuses
export const RESERVATION_COLORS = {
  // Reservation types
  confirmed: '#10b981',      // Green
  owner_confirmed: '#3b82f6', // Blue
  reserved: '#f59e0b',       // Orange
  block: '#6b7280',          // Gray
  
  // Payment status colors
  fully_paid: '#10b981',     // Green
  partially_paid: '#f59e0b', // Orange
  unpaid: '#ef4444',         // Red
  
  // Guest status colors
  upcoming: '#8b5cf6',       // Purple
  checked_in: '#06b6d4',     // Cyan
  checked_out: '#6b7280',    // Gray
  no_show: '#ef4444',        // Red
} as const;

// Reservation interface
export interface Reservation {
  id: number;
  resourceId: string;
  startDate: Date;
  duration: number;
  durationUnit: string;
  name: string;
  
  // Status information
  reservationType?: ReservationType;
  paymentStatus?: PaymentStatus;
  guestStatus?: GuestStatus;
  
  // Bryntum specific properties
  eventColor?: string;
  iconCls?: string;
  readOnly?: boolean;
  style?: string;
  eventStyle?: string;
  
  // Additional info
  amount?: number;
  paidAmount?: number;
  guestCount?: number;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

// Resource interface
export interface Property {
  id: string;
  name: string;
  type: 'apartment' | 'villa' | 'penthouse' | 'studio' | 'cottage' | 'beach_house';
  capacity?: number;
  pricePerNight?: number;
}
