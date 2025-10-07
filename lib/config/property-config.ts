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
  { id: 'al_barari', name: 'Al Barari' },
  { id: 'al_barsha', name: 'Al Barsha & Barsha Heights' },
  { id: 'al_furjan', name: 'Al Furjan' },
  { id: 'al_jaddaf', name: 'Al Jaddaf' },
  { id: 'al_jafiliya', name: 'Al Jafiliya' },
  { id: 'al_karama', name: 'Al Karama' },
  { id: 'al_khabisi', name: 'Al Khabisi' },
  { id: 'al_mamzar', name: 'Al Mamzar' },
  { id: 'al_mankhool', name: 'Al Mankhool' },
  { id: 'al_mizhar', name: 'Al Mizhar' },
  { id: 'al_nahda', name: 'Al Nahda' },
  { id: 'al_qusais', name: 'Al Qusais' },
  { id: 'al_quoz', name: 'Al Quoz' },
  { id: 'al_rashidiya', name: 'Al Rashidiya' },
  { id: 'al_rigga', name: 'Al Rigga' },
  { id: 'al_safa', name: 'Al Safa' },
  { id: 'al_satwa', name: 'Al Satwa' },
  { id: 'al_twar', name: 'Al Twar' },
  { id: 'al_warqa', name: 'Al Warqa' },
  { id: 'arabian_ranches', name: 'Arabian Ranches' },
  { id: 'business_bay', name: 'Business Bay' },
  { id: 'city_walk', name: 'City Walk' },
  { id: 'difc', name: 'DIFC' },
  { id: 'discovery_gardens', name: 'Discovery Gardens' },
  { id: 'downtown_dubai', name: 'Downtown Dubai' },
  { id: 'dubai_hills_estate', name: 'Dubai Hills Estate' },
  { id: 'dubai_investment_park', name: 'Dubai Investment Park' },
  { id: 'dubai_marina', name: 'Dubai Marina' },
  { id: 'dubai_silicon_oasis', name: 'Dubai Silicon Oasis' },
  { id: 'dubai_sports_city', name: 'Dubai Sports City' },
  { id: 'dubai_studio_city', name: 'Dubai Studio City' },
  { id: 'dubai_waterfront', name: 'Dubai Waterfront' },
  { id: 'emirates_hills', name: 'Emirates Hills' },
  { id: 'green_community', name: 'Green Community' },
  { id: 'international_city', name: 'International City' },
  { id: 'jbr', name: 'JBR' },
  { id: 'jlt', name: 'JLT' },
  { id: 'jumeirah', name: 'Jumeirah' },
  { id: 'jumeirah_beach_residence', name: 'Jumeirah Beach Residence' },
  { id: 'jumeirah_golf_estates', name: 'Jumeirah Golf Estates' },
  { id: 'jumeirah_islands', name: 'Jumeirah Islands' },
  { id: 'jumeirah_lake_towers', name: 'Jumeirah Lake Towers' },
  { id: 'jumeirah_park', name: 'Jumeirah Park' },
  { id: 'jumeirah_village_circle', name: 'Jumeirah Village Circle' },
  { id: 'jumeirah_village_triangle', name: 'Jumeirah Village Triangle' },
  { id: 'liwan', name: 'Liwan' },
  { id: 'meadows', name: 'Meadows' },
  { id: 'mirdif', name: 'Mirdif' },
  { id: 'motor_city', name: 'Motor City' },
  { id: 'mudon', name: 'Mudon' },
  { id: 'palm_jumeirah', name: 'Palm Jumeirah' },
  { id: 'remraam', name: 'Remraam' },
  { id: 'silicon_oasis', name: 'Silicon Oasis' },
  { id: 'springs', name: 'Springs' },
  { id: 'the_greens', name: 'The Greens' },
  { id: 'the_lakes', name: 'The Lakes' },
  { id: 'the_meadows', name: 'The Meadows' },
  { id: 'the_springs', name: 'The Springs' },
  { id: 'the_villa', name: 'The Villa' },
  { id: 'umm_suqeim', name: 'Umm Suqeim' }
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
