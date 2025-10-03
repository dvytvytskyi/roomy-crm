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

export const DUBAI_AREAS = [
  'Al Barari',
  'Al Barsha & Barsha Heights',
  'Al Furjan',
  'Al Jaddaf',
  'Al Jafiliya',
  'Al Karama',
  'Al Khabisi',
  'Al Mamzar',
  'Al Mankhool',
  'Al Mizhar',
  'Al Nahda',
  'Al Qusais',
  'Al Quoz',
  'Al Rashidiya',
  'Al Rigga',
  'Al Safa',
  'Al Satwa',
  'Al Twar',
  'Al Warqa',
  'Arabian Ranches',
  'Business Bay',
  'City Walk',
  'DIFC',
  'Discovery Gardens',
  'Downtown Dubai',
  'Dubai Hills Estate',
  'Dubai Investment Park',
  'Dubai Marina',
  'Dubai Silicon Oasis',
  'Dubai Sports City',
  'Dubai Studio City',
  'Dubai Waterfront',
  'Emirates Hills',
  'Green Community',
  'International City',
  'JBR',
  'JLT',
  'Jumeirah',
  'Jumeirah Beach Residence',
  'Jumeirah Golf Estates',
  'Jumeirah Islands',
  'Jumeirah Lake Towers',
  'Jumeirah Park',
  'Jumeirah Village Circle',
  'Jumeirah Village Triangle',
  'Liwan',
  'Meadows',
  'Mirdif',
  'Motor City',
  'Mudon',
  'Palm Jumeirah',
  'Remraam',
  'Silicon Oasis',
  'Springs',
  'The Greens',
  'The Lakes',
  'The Meadows',
  'The Springs',
  'The Villa',
  'Umm Suqeim'
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
export type DubaiArea = typeof DUBAI_AREAS[number]
export type PropertyStatus = typeof PROPERTY_STATUSES[number]['value']
export type PropertyRule = typeof PROPERTY_RULES[number]
export type PropertyAmenity = typeof PROPERTY_AMENITIES[number]
export type QuietHours = typeof QUIET_HOURS_OPTIONS[number]
