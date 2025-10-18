/**
 * Property configuration constants
 * Centralized configuration for property-related data
 */

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'office', label: 'Office' }
] as const

// Райони Dubai для CRM і сайту (синхронізовано з SearchBlock.jsx)
export const DUBAI_AREAS = [
  { id: 'dubai', name: 'Dubai' },
  { id: 'al_barsha', name: 'Al Barsha' },
  { id: 'al_quoz', name: 'Al Quoz' },
  { id: 'arabian_ranches', name: 'Arabian Ranches' },
  { id: 'bur_dubai', name: 'Bur Dubai' },
  { id: 'business_bay', name: 'Business Bay' },
  { id: 'damac_hills', name: 'Damac Hills' },
  { id: 'deira', name: 'Deira' },
  { id: 'difc', name: 'DIFC (Dubai International Financial Centre)' },
  { id: 'discovery_gardens', name: 'Discovery Gardens' },
  { id: 'downtown_dubai', name: 'Downtown Dubai' },
  { id: 'dubai_festival_city', name: 'Dubai Festival City' },
  { id: 'dubai_hills', name: 'Dubai Hills' },
  { id: 'dubai_investment_park', name: 'Dubai Investment Park' },
  { id: 'dubai_marina', name: 'Dubai Marina' },
  { id: 'dubai_silicon_oasis', name: 'Dubai Silicon Oasis' },
  { id: 'dubai_sports_city', name: 'Dubai Sports City' },
  { id: 'international_city', name: 'International City' },
  { id: 'jbr', name: 'JBR (Jumeirah Beach Residence)' },
  { id: 'jlt', name: 'Jumeirah Lake Towers (JLT)' },
  { id: 'jumeirah', name: 'Jumeirah' },
  { id: 'jvc', name: 'JVC (Jumeirah Village Circle)' },
  { id: 'motor_city', name: 'Motor City' },
  { id: 'palm_jumeirah', name: 'Palm Jumeirah' }
] as const

export const PROPERTY_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'rented', label: 'Rented' }
] as const

export const DEFAULT_PROPERTY_VALUES = {
  city: 'Dubai',
  country: 'UAE',
  capacity: 4,
  bathrooms: 2,
  area: 100,
  pricePerNight: 100,
  status: 'active'
} as const

export const PROPERTY_RULES = [
  'No smoking',
  'No pets',
  'No parties',
  'No loud music after 10 PM',
  'No smoking inside',
  'Check-in after 2 PM',
  'Check-out before 11 AM',
  'No extra guests',
  'No commercial photography'
] as const

export const PROPERTY_AMENITIES = [
  'WiFi',
  'Pool',
  'Gym',
  'Parking',
  'Beach Access',
  'Private Pool',
  'Garden',
  'BBQ',
  'Concierge',
  'Private Terrace',
  'Golf Course Access',
  'Chef',
  'Butler',
  'Air Conditioning',
  'Kitchen',
  'Washing Machine',
  'Dishwasher',
  'TV',
  'Balcony',
  'Terrace',
  'Sea View',
  'City View',
  'Marina View',
  'Golf View'
] as const

export const QUIET_HOURS_OPTIONS = [
  '22:00 - 08:00',
  '23:00 - 09:00',
  '00:00 - 08:00',
  '22:00 - 07:00',
  '23:00 - 08:00'
] as const

export type PropertyType = typeof PROPERTY_TYPES[number]['value']
export type DubaiArea = typeof DUBAI_AREAS[number]['id']
export type PropertyStatus = typeof PROPERTY_STATUSES[number]['value']
export type PropertyRule = typeof PROPERTY_RULES[number]
export type PropertyAmenity = typeof PROPERTY_AMENITIES[number]
export type QuietHours = typeof QUIET_HOURS_OPTIONS[number]
